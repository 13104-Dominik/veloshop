# 1. Planowanie projektu

## 1.1 Cel i wymagania biznesowe
Cel: sklep internetowy z rowerami **VeloShop**, rozwinięcie projektu z poprzedniego semestru (statyczne strony PHP) do pełnej aplikacji webowej w architekturze trójwarstwowej, z kontami użytkowników i panelem administracyjnym.

Wymagania biznesowe:
- **BR1.** Klienci mogą przeglądać ofertę rowerów i składać zamówienia online.
- **BR2.** Właściciel sklepu samodzielnie zarządza ofertą (dodawanie, edycja, usuwanie rowerów) bez ingerencji programisty.
- **BR3.** Właściciel widzi zamówienia i zmienia ich status.
- **BR4.** Dane klientów i zamówień są chronione (logowanie, uprawnienia).
- **BR5.** Aplikacja jest dostępna publicznie 24/7 i wdrażana automatycznie po zmianach w kodzie.

## 1.2 Zespół projektowy i role
Zespół fikcyjny, zgodnie z założeniem w opisie projektu (student jest liderem).

| Rola | Osoba | Odpowiedzialność |
|---|---|---|
| Lider zespołu / analityk | Dominik Kowalski | Planowanie, SRS, kontakt z klientem, nadzór nad harmonogramem |
| Programista front-end | [imię i nazwisko] | Aplikacja React, UI, integracja z API |
| Programista back-end | [imię i nazwisko] | API Express, logika biznesowa, JWT |
| Specjalista ds. baz danych | [imię i nazwisko] | Schemat MySQL, ERD, zapytania CRUD, dane testowe |
| Tester | [imię i nazwisko] | Testy jednostkowe, integracyjne, wydajnościowe, bezpieczeństwa |
| DevOps / dokumentalista | [imię i nazwisko] | CI/CD, wdrożenie, dokumentacja |

## 1.3 Technologie
| Warstwa | Technologia | Uzasadnienie |
|---|---|---|
| Front-end | React 18, React Router, Vite, CSS | Zgodność z wymaganiami, szybki build, komponenty |
| Back-end | Node.js, Express 4, JWT, bcryptjs, helmet | Lekki serwer REST, bezpieczeństwo domyślne |
| Baza danych | MySQL 8 (dev: XAMPP/MariaDB) | Znany z poprzedniego projektu, relacyjny model zamówień |
| Testy | Jest, Supertest, Testing Library, autocannon | Jeden framework dla front-endu i back-endu |
| Kontrola wersji | Git + GitHub | Pull requesty, historia, CI |
| CI/CD | GitHub Actions | Testy i wdrożenie po każdym pushu |
| Hosting | SnapDeploy (Docker) + zewnętrzna baza MySQL (Aiven) | Darmowy plan, wdrożenie z repozytorium |
| Projektowanie | Draw.io / Mermaid (UML), Figma (makiety) | Zgodnie z propozycją |
| Zarządzanie | Trello (tablica Kanban) | Podział zadań na zjazdy |

## 1.4 Harmonogram i kamienie milowe (9 zjazdów)
| Zjazd | Zakres | Kamień milowy | Artefakt |
|---|---|---|---|
| 1-2 | Analiza wymagań, SRS, UML, architektura | **M1** Zatwierdzone SRS | `02-SRS.md`, `03-projekt-systemu.md` (rozdz. 1) |
| 3 | Makiety UI, ERD, specyfikacja API | **M2** Projekt zatwierdzony | `03-projekt-systemu.md`, `backend/openapi.yaml` |
| 4-5 | Front-end i baza danych | **M3** Działający UI + baza | `frontend/`, `backend/db/` |
| 6 | Back-end, autoryzacja, integracja | **M4** Aplikacja działa end-to-end | `backend/src/` |
| 7 | Testy | **M5** Testy zielone | `04-testy.md`, `*/tests` |
| 8 | Wdrożenie, CI/CD | **M6** Aplikacja online | `.github/workflows/ci.yml` |
| 9 | Prezentacja, dokumentacja | **M7** Oddanie projektu | cały katalog `docs/`, prezentacja |

## 1.5 Ryzyka
| Ryzyko | Prawdop. | Wpływ | Działanie |
|---|---|---|---|
| Brak darmowego hostingu bazy MySQL | średnie | wysoki | Docker Compose lokalnie jako plan B, przygotowana demonstracja lokalna |
| Opóźnienia w implementacji | średnie | średni | Zakres ograniczony do MVP, funkcje dodatkowe opcjonalne |
| Wyciek sekretów (JWT_SECRET, hasła) | niskie | wysoki | Zmienne środowiskowe, `.env` w `.gitignore` |
| Błędy po wdrożeniu | średnie | średni | CI blokuje wdrożenie przy czerwonych testach, endpoint `/api/health` |
