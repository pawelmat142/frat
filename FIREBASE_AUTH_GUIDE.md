# Firebase Auth + NestJS - Dokumentacja Implementacji

## Przegląd Systemu

System autoryzacji oparty o **Firebase Authentication** z backendem **NestJS**.

### Jak to działa:
1. **Frontend**: Firebase generuje JWT po zalogowaniu
2. **Frontend**: Token automatycznie dodawany do każdego requesta HTTP
3. **Backend**: Guard weryfikuje token przez Firebase Admin SDK
4. **Backend**: Pobiera pełne dane usera z bazy (role, displayName, etc.)
5. **Backend**: Chroni endpointy na podstawie ról

---

## Backend (NestJS)

### 1. Guards

#### `JwtAuthGuard`
Weryfikuje token Firebase i dodaje usera do requesta.

```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@CurrentUser() user: UserI) {
  return { user };
}
```

#### `RolesGuard`
Sprawdza czy user ma wymaganą rolę.

```typescript
@Get('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoles.ADMIN, UserRoles.SUPERADMIN)
adminEndpoint(@CurrentUser() user: UserI) {
  return { message: 'Admin only' };
}
```

### 2. Decorators

#### `@CurrentUser()`
Pobiera aktualnie zalogowanego użytkownika.

```typescript
getProfile(@CurrentUser() user: UserI) {
  console.log(user.displayName, user.roles);
}
```

#### `@Roles(...roles)`
Określa wymagane role do dostępu.

```typescript
@Roles(UserRoles.ADMIN)
@Roles(UserRoles.USER, UserRoles.ADMIN) // Jedna z tych ról
```

#### `@Public()`
Oznacza endpoint jako publiczny (opcjonalne, domyślnie bez guardów jest publiczny).

### 3. Przykłady Użycia

```typescript
@Controller('api/products')
export class ProductsController {
  
  // Publiczny endpoint
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  // Wymaga autoryzacji
  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMyProducts(@CurrentUser() user: UserI) {
    return this.productsService.findByUser(user.uid);
  }

  // Tylko dla adminów
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  create(@Body() dto: CreateProductDto, @CurrentUser() user: UserI) {
    return this.productsService.create(dto, user.uid);
  }
}
```

---

## Frontend (React)

### 1. Konfiguracja w App.tsx

```typescript
import { AuthProvider } from 'auth/providers/AuthProvider';

function App() {
  return (
    <AuthProvider>
      <YourApp />
    </AuthProvider>
  );
}
```

### 2. Logowanie

```typescript
import { AuthService } from 'auth/services/AuthService';

// Logowanie email/hasło
await AuthService.loginForm({ email, password });

// Logowanie przez Google
await AuthService.loginWithGoogle();

// Wylogowanie
await AuthService.logout();
```

### 3. Użycie hooka useAuthContext

```typescript
import { useAuthContext } from 'auth/providers/AuthProvider';

function MyComponent() {
  const { user, loading, isAuthenticated } = useAuthContext();

  if (loading) return <div>Loading...</div>;
  
  if (!isAuthenticated) return <div>Please login</div>;

  return <div>Hello {user.displayName}</div>;
}
```

### 4. Chronione Route

```typescript
import { ProtectedRoute } from 'auth/component/ProtectedRoute';

<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/dashboard" element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } />
</Routes>
```

### 5. Wywołania API

Token jest **automatycznie** dodawany do każdego requesta przez interceptor.

```typescript
import { httpClient } from 'global/services/http';

// Token zostanie automatycznie dodany
const profile = await httpClient.get('/auth/me');
const products = await httpClient.get('/products/my');
```

---

## Przepływ Logowania

### Email/Hasło:

```
1. User wypełnia formularz logowania
2. Frontend: AuthService.loginForm(email, password)
3. Firebase Auth weryfikuje i generuje token
4. Token automatycznie dostępny w Firebase
5. Każdy request do API automatycznie zawiera token
6. Backend weryfikuje token i pobiera dane usera
```

### Google OAuth:

```
1. User klika "Login with Google"
2. Frontend: AuthService.loginWithGoogle()
3. Popup Google logowania
4. Firebase generuje token
6. Backend weryfikuje token i tworzy/aktualizuje usera w bazie
7. Zwraca dane usera
```

---

## Struktura Token

### Firebase Token (JWT) zawiera:
- `uid` - Unikalny ID usera Firebase
- `email` - Email usera
- `name` - Nazwa usera (z providera)
- `picture` - Avatar (z providera)
- `iat`, `exp` - Czas utworzenia/wygaśnięcia

### User z Bazy (UserI) zawiera:
- `uid` - ID Firebase
- `displayName` - Nazwa wyświetlana
- `email` - Email
- `roles` - Role (SUPERADMIN, ADMIN, USER)
- `status` - Status konta
- `verified` - Czy email zweryfikowany
- `provider` - Skąd user (EMAIL, GOOGLE, etc.)

---

## Bezpieczeństwo

### Backend:
✅ Token weryfikowany przez Firebase Admin SDK
✅ Dane usera zawsze pobierane z bazy (nie z tokena)
✅ Role sprawdzane na backendzie
✅ Token ma ograniczony czas życia (1h, odnawiany automatycznie)

### Frontend:
✅ Token przechowywany w pamięci Firebase (nie localStorage)
✅ Automatyczne odświeżanie tokena
✅ Logout czyści token
✅ Protected routes sprawdzają autoryzację

---

## Testowanie

### Backend:
```http
# Pobierz token z frontendu (Firebase Console lub DevTools)
GET http://localhost:3000/api/auth/me
Authorization: Bearer <YOUR_FIREBASE_TOKEN>
```

### Frontend:
```typescript
// Zaloguj się i sprawdź token
const user = await AuthService.getCurrentUser();
const token = await AuthService.getIdToken();
console.log('Token:', token);
```

---

## Troubleshooting

### 401 Unauthorized:
- Sprawdź czy token jest wysyłany w headerze
- Sprawdź czy token nie wygasł
- Sprawdź czy Firebase config jest poprawny

### 403 Forbidden:
- User nie ma wymaganej roli
- Sprawdź role w bazie danych

### Token nie jest dodawany:
- Upewnij się że `AuthProvider` opakowuje App
- Sprawdź czy `httpClient.setTokenProvider()` jest wywołany

---

## Dodawanie Guardów do Istniejących Kontrolerów

```typescript
// Przykład aktualizacji istniejącego kontrolera

// PRZED:
@Controller('api/users')
export class UserController {
  @Get()
  findAll() {
    return this.userService.findAll();
  }
}

// PO:
import { JwtAuthGuard } from 'auth/guards/JwtAuthGuard';
import { RolesGuard } from 'auth/guards/RolesGuard';
import { Roles } from 'auth/decorators/RolesDecorator';
import { CurrentUser } from 'auth/decorators/CurrentUserDecorator';
import { UserRoles, UserI } from '@shared/interfaces/UserI';

@Controller('api/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  
  @Get()
  @Roles(UserRoles.ADMIN)
  findAll(@CurrentUser() user: UserI) {
    return this.userService.findAll();
  }
}
```
