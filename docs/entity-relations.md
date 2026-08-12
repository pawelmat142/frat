# Drzewo zależności między encjami

Dokument opisuje, jakie encje zależą od siebie oraz co dzieje się z encjami zależnymi, gdy encja
nadrzędna zostaje usunięta. Źródła: dekoratory TypeORM w `backend/src/**/model/*Entity.ts`,
skrypty `db/init/03_create_tables.sql`, `db/migrations/*.sql` oraz logika kaskadowa w serwisach
(subskrypcje RxJS na `userDeletedEvent` itp.).

## Legenda

| Symbol na diagramie | Typ relacji | Co to oznacza |
|---|---|---|
| `──▶` (linia ciągła) | **FK CASCADE (DB)** | Prawdziwy klucz obcy w bazie z `ON DELETE CASCADE`. Usunięcie rodzica **zawsze** kasuje dziecko, niezależnie od kodu aplikacji. |
| `┄┄▶` (linia przerywana, "app-event") | **Kaskada aplikacyjna** | Brak FK w bazie. Usunięcie rodzica emituje zdarzenie (RxJS `Subject`), na które inny serwis reaguje i ręcznie kasuje powiązane rekordy. |
| `┄┄▶` (linia przerywana, "orphan risk") | **Referencja miękka bez kaskady** | Kolumna trzyma tylko `uid`/id jako zwykły `VARCHAR`, bez FK i bez obsługi w kodzie. Po usunięciu rodzica rekordy **zostają osierocone** (potencjalny dług/bug). |

## Diagram

```mermaid
graph LR
    User["UserEntity<br/>(jh_users, klucz: uid)"]
    Worker["WorkerEntity<br/>(jh_workers)"]
    DateRange["DateRangeEntity<br/>(jh_workers_date_ranges)"]
    Certificate["CertificateEntity<br/>(jh_certificates)"]
    Settings["SettingsEntity<br/>(jh_user_settings)"]
    Listed["UserListedItemEntity<br/>(jh_user_listed_items)"]
    Chat["ChatEntity<br/>(jh_chats)"]
    ChatMember["ChatMemberEntity<br/>(jh_chat_members)"]
    ChatMessage["ChatMessageEntity<br/>(jh_chat_messages)"]
    Offer["OfferEntity<br/>(jh_offers)"]
    Notification["NotificationEntity<br/>(jh_notifications)"]
    Friendship["FriendshipEntity<br/>(jh_friendships)"]
    Interaction["EntityInteractionEntity<br/>(jh_entity_interactions)"]
    Provider["TrainingProviderEntity<br/>(jh_training_providers)"]
    Training["TrainingEntity<br/>(jh_trainings)"]
    Session["TrainingSessionEntity<br/>(jh_training_sessions)"]
    Feedback["FeedbackEntity<br/>(jh_feedback)"]

    User =="uid · FK CASCADE"==> Settings
    User =="uid · FK CASCADE"==> Listed
    User =="uid · FK CASCADE"==> Provider
    User =="uid · FK CASCADE"==> ChatMember
    User =="sender_uid · FK CASCADE"==> ChatMessage
    User -."uid · app-event"..-> Worker
    User -."uid · app-event"..-> Offer
    User -."uid (bug: brak filtra) · app-event"..-> Chat
    User -."recipientUid/requesterUid · orphan risk"..-> Notification
    User -."requesterUid/addresseeUid · orphan risk"..-> Friendship
    User -."userUid · orphan risk"..-> Interaction
    User -."uid (nullable) · orphan risk"..-> Feedback

    Worker =="worker_id · FK CASCADE"==> DateRange
    Worker -."uid · app-event"..-> Certificate

    Provider =="provider_id · FK CASCADE"==> Training
    Training =="training_id · FK CASCADE"==> Session

    Chat =="chat_id · FK CASCADE"==> ChatMember
    Chat =="chat_id · FK CASCADE"==> ChatMessage

    Offer -."reference · orphan risk"..-> Listed
    Worker -."reference · orphan risk"..-> Listed
    Training -."reference · orphan risk"..-> Listed
    Offer -."targetId · orphan risk"..-> Notification
    Worker -."targetId · orphan risk"..-> Notification
```

## Szczegóły relacji (per encja nadrzędna)

### UserEntity (`jh_users`, klucz logiczny: `uid`)

| Encja zależna | Pole | Mechanizm | Zachowanie przy usunięciu Usera |
|---|---|---|---|
| SettingsEntity | `uid` | FK CASCADE (`fk_settings_user`) | Usuwane automatycznie przez bazę |
| UserListedItemEntity | `uid` | FK CASCADE (`fk_user_listed_items_user`) | Usuwane automatycznie przez bazę |
| TrainingProviderEntity | `uid` | FK CASCADE, `UNIQUE` | Usuwane automatycznie; **kaskaduje dalej** do Training → TrainingSession |
| TrainingEntity | `uid` | FK CASCADE (dodatkowy, równoległy do relacji przez Provider) | Usuwane automatycznie |
| ChatMemberEntity | `uid` | FK CASCADE | Usuwane automatycznie |
| ChatMessageEntity | `sender_uid` | FK CASCADE | Usuwane automatycznie |
| WorkerEntity | `uid` (bez FK) | Kaskada aplikacyjna: `UserService.userDeletedEvent` → `WorkerService` | Serwis szuka profilu po `uid`, kasuje certyfikaty (`CertificatesWorkerService.deleteAllCertificatesForWorker`), potem profil |
| OfferEntity | `uid` (bez FK) | Kaskada aplikacyjna: `UserService.userDeletedEvent` → `OffersService` | Pobiera wszystkie oferty usera i kasuje jedną po drugiej |
| ChatEntity | — (przez `ChatMemberEntity.uid`) | Kaskada aplikacyjna: `UserService.userDeletedEvent` → `ChatService` | ⚠️ **Podejrzenie buga**: `ChatRepo.getUserChatsWithoutJoins(uid)` nie filtruje po `uid` (parametr jest nieużywany w query builderze) — przy usuwaniu jednego usera efektywnie kasowane są **wszystkie** czaty w systemie. Wymaga weryfikacji/poprawki. |
| NotificationEntity | `recipientUid`, `requesterUid` (bez FK) | **Brak kaskady** | Powiadomienia usuniętego usera oraz te, w których był `requester`, zostają w bazie jako osierocone |
| FriendshipEntity | `requesterUid`, `addresseeUid` (bez FK) | **Brak kaskady** | Rekordy znajomości pozostają osierocone |
| EntityInteractionEntity | `userUid` (bez FK) | **Brak kaskady** | Historia interakcji (views itp.) pozostaje — może być zamierzone (dane analityczne) |
| FeedbackEntity | `uid` (nullable, bez FK) | **Brak kaskady** | Zamierzone — feedback ma być zachowany nawet po usunięciu konta (pole `uid` jest opcjonalne) |

Dodatkowo: `AuthService` (Firebase) i `UserManagementService` (Cloudinary — kasowanie assetów) też
subskrybują `userDeletedEvent`, ale nie dotyczą encji z bazy Postgres.

### WorkerEntity (`jh_workers`, klucz: `worker_id`, referencja logiczna: `uid`)

| Encja zależna | Pole | Mechanizm | Uwagi |
|---|---|---|---|
| DateRangeEntity | `worker_id` (`@ManyToOne` + `@JoinColumn`, `onDelete: 'CASCADE'`) | FK CASCADE | Realna relacja TypeORM, kasowana też z `cascade: true` przy zapisie |
| CertificateEntity | `uid` (bez FK) | Kaskada aplikacyjna, ale **tylko w wybranych ścieżkach kasowania** | `WorkerService.deleteProfile/deleteProfileByUid` wywołują `deleteAllCertificatesForWorker` ręcznie. `WorkerRepo.deleteAllProfiles()` (masowe kasowanie) **nie** czyści certyfikatów — potencjalna niespójność |
| `jh_worker_search_appearances` (tabela bez encji TypeORM) | `worker_id` | FK CASCADE | Deduplikacja wyświetleń w wyszukiwarce |
| UserListedItemEntity | `reference` (+ `referenceType='WORKER'`, bez FK) | **Brak kaskady** | Ulubieni pracownicy pozostają na liście usera po usunięciu profilu (orphan) |
| NotificationEntity | `targetId` (bez FK, polimorficzne) | **Brak kaskady** | Powiadomienie może wskazywać na nieistniejącego workera |

### ChatEntity (`jh_chats`, klucz: `chat_id`)

| Encja zależna | Pole | Mechanizm |
|---|---|---|
| ChatMemberEntity | `chat_id` (`@ManyToOne` + `@JoinColumn`, `onDelete: 'CASCADE'`) | FK CASCADE |
| ChatMessageEntity | `chat_id` (`@ManyToOne` + `@JoinColumn`, `onDelete: 'CASCADE'`) | FK CASCADE |

`ChatEntity.blockedByUid` to miękka referencja do Usera — bez kaskady (informacja o blokadzie, nie
wymaga czyszczenia).

### TrainingProviderEntity (`jh_training_providers`, klucz: `provider_id`, `uid` unikalny)

| Encja zależna | Pole | Mechanizm |
|---|---|---|
| TrainingEntity | `provider_id` (`REFERENCES ... ON DELETE CASCADE` w SQL, brak `@ManyToOne` w encji TypeORM) | FK CASCADE — realizowana wyłącznie na poziomie bazy, nie widać jej w kodzie TS |

### TrainingEntity (`jh_trainings`, klucz: `training_id`)

| Encja zależna | Pole | Mechanizm |
|---|---|---|
| TrainingSessionEntity | `training_id` (`REFERENCES ... ON DELETE CASCADE` w SQL) | FK CASCADE (dodatkowo `TrainingService.deleteTraining` explicite kasuje sesje przed treningiem — redundantne, ale nieszkodliwe) |
| UserListedItemEntity | `reference` (+ `referenceType='TRAINING'`, bez FK) | **Brak kaskady** — orphan risk |

### OfferEntity (`jh_offers`, klucz: `offer_id`)

Brak encji zależnych z realną relacją. Powiązania miękkie: `UserListedItemEntity.reference` i
`NotificationEntity.targetId` mogą wskazywać na ofertę — żadne z nich nie jest czyszczone przy
usunięciu oferty (`OffersService.deleteOfferFn` kasuje tylko wiersz oferty).

## Encje bez zależności (liście drzewa)

`CertificateEntity`, `DateRangeEntity`, `ChatMemberEntity`, `ChatMessageEntity`,
`TrainingSessionEntity`, `NotificationEntity`, `FriendshipEntity`, `EntityInteractionEntity`,
`SettingsEntity`, `UserListedItemEntity`, `FeedbackEntity`, `DictionaryEntity`,
`TranslationEntity` — nic od nich nie zależy.

## Znane luki / do weryfikacji

1. **`ChatRepo.getUserChatsWithoutJoins(uid)`** nie filtruje po `uid` — usunięcie dowolnego usera
   kasuje wszystkie czaty w systemie zamiast tylko czatów usuwanego usera.
2. **`WorkerRepo.deleteAllProfiles()`** (masowe kasowanie) nie czyści `CertificateEntity` — niespójne
   z `deleteProfile`/`deleteProfileByUid`.
3. **Brak kaskady** dla `NotificationEntity`, `FriendshipEntity`, `EntityInteractionEntity` przy
   usunięciu Usera — do decyzji, czy to zamierzone (dane historyczne) czy dług techniczny.
4. **`UserListedItemEntity.reference`** (ulubione: oferty/pracownicy/szkolenia) i
   **`NotificationEntity.targetId`** to referencje polimorficzne bez żadnego czyszczenia przy
   usunięciu encji docelowej — mogą prowadzić do "martwych" wpisów w UI.
