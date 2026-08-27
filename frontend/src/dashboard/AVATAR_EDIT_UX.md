# Avatar edit UX

TODO: usunąć ten plik po implementacji.

## Problem

Dziś edycja avatara idzie przez hack:

1. Ustawienia → `EDIT_AVATAR_FLAG_KEY` w `localStorage`
2. redirect na Home
3. mobile: `UserProfileItem` z `editableAvatar`
4. desktop: brak miejsca — welcome to tylko „Cześć, {imię}”, avatar w headerze prowadzi na dashboard

Zły UX: bounce między ekranami, flaga zostaje, desktop jest ślepy.

## Rekomendacja (v1)

Edycja tylko w Ustawieniach. Dashboard i header zostają czyste.

Ustawienia — mały header profilu na górze:

- avatar + imię
- delikatna ikonka aparatu w rogu avatara (tu może być widoczna — user już jest w ustawieniach)
- tap → picker → preview → zapisz / anuluj

```
Ustawienia
┌─────────────────────────┐
│  (avatar + aparat) Imię │  ← tap avatara
│  ─────────────────────  │
│  Język                  │
│  Motyw                  │
│  Usuń konto             │
└─────────────────────────┘
```

Po wyborze zdjęcia ten sam overlay co dziś: X / save na avataarze.

### Co znika

- `EDIT_AVATAR_FLAG_KEY`
- redirect Home z ustawień
- `editableAvatar` na dashboardzie

### Co zostaje

Istniejący flow `AvatarTile` (walidacja, crop do kwadratu, preview, save/cancel).
`editable` zawsze w Settings, nigdy na dashboardzie.

## Opcjonalnie (nie w v1)

Bez trwałego chrome:

- Mobile dashboard: tap w własny avatar otwiera picker (bez ołówka na stałe)
- Desktop: hover na avataarze w headerze albo przy „Cześć" pokazuje mały aparat

Dashboard to miejsce do roboty, nie do profilu. Settings jest naturalnym miejscem.

## Czego nie robić

- Zostawiania flagi w `localStorage`
- Stałego ołówka na dashboardzie / w headerze
- Osobnego ekranu „edytuj avatar"
- Edycji avatara workera w tym samym miejscu (to już jest w formularzu profilu)
