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
.github/workflows/ci.yml   CI/CD (testy, build, test integracyjny z MySQL, test dymny wdrożenia)
Dockerfile, docker-compose.yml
```

## Wdrożenie (SnapDeploy + Aiven)
Aplikacja działa publicznie pod adresem: **https://veloshop-7a008.containers.snapdeploy.app/**
1. Baza MySQL: darmowy plan Aiven (bez karty). Ustaw `DB_SSL=true`.
2. SnapDeploy -> Deploy from GitHub -> repozytorium `veloshop`, gałąź `main`, port `3000` (używa `Dockerfile`). Zmienne środowiskowe:
   `DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SSL=true, JWT_SECRET` (oraz opcjonalnie `ADMIN_EMAIL, ADMIN_PASSWORD`).
3. Włączone *Auto Deploy on Push*: każdy push na `main` buduje i wdraża aplikację (limit darmowego planu: 5 wdrożeń / 12 h).
4. Monitoring: endpoint `/api/health` (podepnij np. UptimeRobot) oraz logi w panelu SnapDeploy. Darmowy kontener usypia się po bezczynności (pierwsze wejście trwa ok. minuty).
