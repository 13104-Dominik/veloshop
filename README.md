# VeloShop - sklep rowerowy (projekt semestralny, Inżynieria oprogramowania)

Aplikacja webowa: **React (Vite)** + **Node.js/Express** + **MySQL**, uwierzytelnianie **JWT**.
Rozwinięcie projektu sklepu rowerowego z poprzedniego semestru (HTML/CSS/PHP/JS).

## Funkcje
- katalog rowerów, kategorie, wyszukiwarka
- koszyk (localStorage), składanie zamówień (wymaga konta)
- rejestracja i logowanie (JWT, hasła hashowane bcrypt), historia zamówień
- panel administratora: CRUD rowerów, podgląd zamówień i zmiana statusu
- dokumentacja API: Swagger UI pod `/api/docs`

## Szybki start (Docker)
```bash
docker compose up --build
# http://localhost:3000   | admin: admin@veloshop.pl / Admin123!
```

## Uruchomienie lokalne (bez Dockera)
Wymagania: Node.js 20+, MySQL 8 (lub XAMPP/MariaDB).
```bash
cd backend
cp .env.example .env        # uzupełnij dane do bazy i JWT_SECRET
npm install
npm run init-db             # tworzy bazę, tabele, dane i konto admina
npm run dev                 # API: http://localhost:3000

cd ../frontend              # w drugim terminalu
npm install
npm run dev                 # UI: http://localhost:5173 (proxy /api -> :3000)
```

## Testy
```bash
cd backend  && npm test          # Jest + Supertest (jednostkowe, integracyjne, bezpieczeństwa)
cd frontend && npm test          # Jest + Testing Library
cd backend  && npm start & npm run test:load   # test obciążeniowy (autocannon)
```

## Dokumentacja
Pełna dokumentacja projektowa w katalogu `docs/`: planowanie, SRS z diagramami UML, projekt systemu (architektura, makiety, ERD, API), testy, instrukcja użytkownika, dokumentacja deweloperska.

## Struktura
```
backend/   API (src/routes, src/middleware), db/schema.sql + seed.sql, openapi.yaml, tests/
frontend/  aplikacja React (src/pages, src/components, src/context), testy w src/__tests__
.github/workflows/ci.yml   CI/CD (testy, build, test integracyjny z MySQL, deploy hook)
Dockerfile, docker-compose.yml
```

## Wdrożenie (Render)
1. Wypchnij repozytorium na GitHub.
2. Render -> New Web Service -> Docker, wskaż repo. Dodaj bazę MySQL (darmowy plan Aiven, Render ma tylko Postgres) i ustaw zmienne (w tym `DB_SSL=true`):
   `DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD`.
3. Skopiuj *Deploy Hook* z ustawień usługi do sekretu GitHub `RENDER_DEPLOY_HOOK` - każdy push na `main` po zielonym CI wdroży aplikację.
4. Monitoring: endpoint `/api/health` (podepnij np. UptimeRobot) oraz logi w panelu Render.
