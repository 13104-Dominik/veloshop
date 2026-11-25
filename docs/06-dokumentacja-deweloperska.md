# 6. Dokumentacja deweloperska i wdrożeniowa

## 6.1 Wymagania środowiska
Node.js 20+ (testowane na 22), npm 10+, MySQL 8 lub MariaDB (np. z XAMPP), Git; opcjonalnie Docker.

## 6.2 Konfiguracja środowiska
```bash
git clone <adres-repozytorium> && cd veloshop
cd backend && cp .env.example .env     # uzupełnij hasło do bazy i JWT_SECRET
npm install
npm run init-db                        # baza, tabele, 36 rowerów, konto admina
npm run dev                            # API na :3000
# drugi terminal:
cd frontend && npm install && npm run dev   # UI na :5173
```
Zmienne środowiskowe (`backend/.env`):
| Zmienna | Opis | Domyślnie |
|---|---|---|
| `PORT` | Port API | 3000 |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Połączenie z MySQL | localhost, 3306, root, (puste), sklep_rowerowy |
| `JWT_SECRET` | Sekret podpisu tokenów (**obowiązkowy w produkcji**, serwer nie wystartuje bez niego) | - |
| `JWT_EXPIRES_IN` | Ważność tokenu | 2h |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Konto admina tworzone przez `init-db` | admin@veloshop.pl / Admin123! |
| `DB_SSL` | `true` włącza połączenie SSL z bazą (wymagane u dostawców chmurowych, np. Aiven) | false |
| `DB_SSL_CA` | Opcjonalnie: treść certyfikatu CA dostawcy bazy (zamiast `DB_SSL=true`) | - |
| `AUTH_RATE_LIMIT` | Limit żądań na `/api/auth` na 15 min | 50 |

Nazwa bazy (`DB_NAME`) jest konfigurowalna, np. `veloshop` zamiast domyślnej `sklep_rowerowy` (przydatne, gdy w XAMPP istnieje już baza z poprzedniego projektu).

Zmień hasło admina przed wdrożeniem produkcyjnym.

## 6.3 Struktura kodu
```
backend/src/app.js          konfiguracja Express (middleware, trasy, Swagger, serwowanie frontendu)
backend/src/routes/*.js     auth, bikes (+categories), orders
backend/src/middleware/     auth.js (JWT, role)
backend/src/validators.js   funkcje walidujące
backend/src/db.js           pula połączeń, query(), withTransaction()
frontend/src/pages/         widoki (Home, Bikes, Cart, Checkout, Login, Register, Orders, Admin)
frontend/src/context/       AuthContext, CartContext
frontend/src/cartReducer.js logika koszyka (czysta funkcja)
frontend/src/api.js         klient REST, obsługa tokenu
```
Konwencja dodawania endpointu: trasa w `routes/`, walidacja wejścia na początku handlera, zapytanie wyłącznie z placeholderami `?`, test w `backend/tests`, wpis w `openapi.yaml`.

## 6.4 Procedury testowania
Opisane w `04-testy.md` (rozdz. 4.6): `npm test` w obu katalogach, `npm run test:load` dla wydajności. Przed pull requestem wszystkie testy muszą być zielone.

## 6.5 Workflow Git
Gałąź `main` jest chroniona (wdrażana). Zmiany w gałęziach `feature/...` przez pull request; CI musi przejść, zanim zmiana trafi do `main`. Commity w stylu: `feat:`, `fix:`, `test:`, `docs:`.

## 6.6 CI/CD (GitHub Actions, `.github/workflows/ci.yml`)
```mermaid
flowchart LR
    A[push / pull request] --> B[backend: npm ci, npm test]
    A --> C[frontend: npm ci, npm test, build]
    B --> D[integration: MySQL 8, init-db, start API, test obciążeniowy]
    C --> D
    D -->|tylko main| E[SnapDeploy: auto-deploy z GitHuba]
    E --> F[test dymny /api/health]
```
- Wdrożenie realizuje SnapDeploy (*Auto Deploy on Push* dla gałęzi `main`): platforma sama buduje obraz z `Dockerfile` po każdym pushu. Brak dodatkowych sekretów w GitHubie.
- Job `smoke` działa wyłącznie po pushu na `main` po zielonych testach i sprawdza, czy wdrożona aplikacja odpowiada na `/api/health` (nie blokuje CI).
- Limit darmowego planu SnapDeploy: 5 wdrożeń na 12 godzin (nieudane budowania też się liczą), dlatego zmiany grupujemy w jednym pushu.

## 6.7 Wdrożenie
1. Baza MySQL u dostawcy zewnętrznego: Aiven (darmowy plan: 1 CPU, 1 GB RAM, 1 GB dysku, bez karty; usługa wyłącza się po dłuższej nieaktywności i trzeba ją włączyć w panelu). Zanotuj host, port, użytkownika i hasło oraz ustaw `DB_SSL=true`.
2. SnapDeploy: Deploy from GitHub -> repozytorium `veloshop`, gałąź `main`, port `3000`. Używany jest `Dockerfile` z głównego katalogu.
3. W ustawieniach kontenera dodaj zmienne z tabeli 6.2 (zwłaszcza `DB_*`, `DB_SSL`, `JWT_SECRET`, `ADMIN_PASSWORD`).
4. Pierwszy start wykona `init-db` (tworzy tabele, dane i admina, jeśli ich brak) i uruchomi serwer.
5. Włącz *Auto Deploy on Push*, aby kolejne wdrożenia następowały automatycznie po pushu na `main`.
6. Alternatywa/awaryjnie: `docker compose up --build` na dowolnej maszynie.

Adres wdrożonej aplikacji: **https://veloshop-7a008.containers.snapdeploy.app/**

Weryfikacja po wdrożeniu: `GET /api/health` zwraca `{"status":"ok"}`, strona główna pokazuje kategorie, `/api/docs` pokazuje Swaggera.

## 6.8 Monitorowanie i obsługa błędów
- `GET /api/health` podpięty pod zewnętrzny monitoring (np. UptimeRobot, interwał 5 min, powiadomienie e-mail).
- Błędy serwera (500) są logowane na standardowe wyjście i dostępne w logach SnapDeploy; klient dostaje ogólny komunikat bez szczegółów.
- Typowe problemy: `ECONNREFUSED` (baza niedostępna, sprawdź `DB_*`), `Brak JWT_SECRET` (uzupełnij zmienną), 401 po czasie (token wygasł, zaloguj się ponownie), 429 (limit prób logowania).
- Rollback: w panelu SnapDeploy wdróż ponownie poprzedni commit albo cofnij zmianę (`git revert`) i wypchnij na `main`.

## 6.9 Rozwój w przyszłości
Odzyskiwanie hasła, płatności online, stany magazynowe, paginacja listy rowerów, upload zdjęć przez panel admina.
