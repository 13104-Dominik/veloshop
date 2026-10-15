# 4. Testowanie

## 4.1 Strategia
| Poziom | Narzędzie | Co obejmuje | Lokalizacja |
|---|---|---|---|
| Jednostkowe (back-end) | Jest | Walidatory, middleware JWT | `backend/tests/validators.test.js` |
| Jednostkowe (front-end) | Jest + Testing Library | Reducer koszyka, komponent `BikeCard` | `frontend/src/__tests__` |
| Integracyjne (API) | Jest + Supertest | Pełny cykl żądanie-odpowiedź przez Express z warstwą bazy zastąpioną atrapą (mock) | `backend/tests/auth|bikes|orders.test.js` |
| Integracyjne (z bazą) | MySQL/MariaDB (ręcznie i w GitHub Actions) | Start API na prawdziwej bazie, inicjalizacja, pełny przepływ zamówienia i CRUD | job `integration` w `ci.yml`, wynik w 4.5 |
| Akceptacyjne | Scenariusze ręczne | Przepływy z SRS (tabela 4.4) | niniejszy dokument |
| Wydajnościowe | autocannon | 50 połączeń przez 10 s na `/api/bikes` | `backend/scripts/load-test.js` |
| Bezpieczeństwa | Jest + Supertest | SQL Injection, autoryzacja, nagłówki, wycieki błędów | `backend/tests/security.test.js` |

## 4.2 Wyniki testów automatycznych
Stan na dzień wykonania: wszystkie testy zakończone powodzeniem.

| Pakiet | Zestawy | Testy | Wynik | Pokrycie instrukcji |
|---|---|---|---|---|
| Back-end | 5 | 48 | **48 zaliczonych** | 82,5% (instrukcje), 88,3% (linie) |
| Front-end | 3 | 9 | **9 zaliczonych** | nie mierzono |

Niepokryta część back-endu to głównie `db.js` (warstwa połączenia z MySQL, testowana w jobie `integration` w CI) oraz gałęzie obsługi błędów.

## 4.3 Testy bezpieczeństwa
| Zagrożenie | Test | Wynik |
|---|---|---|
| SQL Injection w wyszukiwarce (`' OR '1'='1`, `'; DROP TABLE rowery; --`, `UNION SELECT`) | Payload trafia do parametrów zapytania, nie do treści SQL | zaliczony |
| SQL Injection w logowaniu | Pole email z payloadem odrzucone walidacją (400), baza nie jest wywoływana | zaliczony |
| SQL Injection przez parametr `kategoria` | `1 OR 1=1` odrzucone (400) | zaliczony |
| Dostęp bez tokenu / z fałszywym tokenem | 401 | zaliczony |
| Eskalacja uprawnień (zwykły użytkownik wywołuje CRUD admina) | 403, baza nie jest wywoływana | zaliczony |
| Manipulacja ceną w zamówieniu | Cena z żądania ignorowana, suma liczona z bazy | zaliczony |
| Wyciek szczegółów błędów | Błąd bazy zwraca ogólny komunikat 500 | zaliczony |
| Enumeracja kont | Identyczny komunikat dla złego emaila i hasła | zaliczony |
| Nagłówki HTTP | `X-Content-Type-Options: nosniff`, brak `X-Powered-By` | zaliczony |
| Brute force | Limit żądań na `/api/auth` (domyślnie 50 / 15 min) | skonfigurowany |

## 4.4 Testy akceptacyjne (ręczne)
Do wykonania na wdrożonej aplikacji, kolumnę "Wynik" uzupełnia tester.

| Nr | Scenariusz | Oczekiwany rezultat | Wynik |
|---|---|---|---|
| A1 | Wejście na stronę główną | Widoczne 6 kategorii | |
| A2 | Wybór kategorii "Górskie" | Lista 6 rowerów | |
| A3 | Wyszukanie "trek" | Tylko rowery marki Trek | |
| A4 | Dodanie 2 rowerów do koszyka, odświeżenie strony | Koszyk zachowany, suma poprawna | |
| A5 | Złożenie zamówienia bez logowania | Przekierowanie do logowania | |
| A6 | Rejestracja z hasłem 5-znakowym | Komunikat o błędzie | |
| A7 | Rejestracja, złożenie zamówienia | Numer zamówienia; zamówienie w "Moje zamówienia" | |
| A8 | Logowanie jako admin, dodanie roweru | Rower widoczny w katalogu | |
| A9 | Admin zmienia status zamówienia | Klient widzi nowy status | |
| A10 | Admin usuwa rower z zamówienia | Komunikat o blokadzie (409) | |
| A11 | Zwykły użytkownik wchodzi na `/admin` | Przekierowanie na stronę główną | |

## 4.5 Test wydajnościowy
Procedura: uruchomić API na bazie z danymi (`npm start`), w drugim terminalu `npm run test:load`. Skrypt generuje obciążenie 50 połączeń przez 10 s i zwraca kod błędu, gdy pojawią się odpowiedzi inne niż 2xx.

Kryterium (NF4): min. 100 żądań/s, brak błędów. Ten sam test jest uruchamiany w CI (job `integration`).

| Metryka | Wartość |
|---|---|
| Żądań na sekundę (średnio) | 1613 |
| Opóźnienie p50 / p97,5 / p99 | 25 / 69 / 90 ms |
| Odpowiedzi 2xx / błędy / timeouty | 16130 / 0 / 0 |

Warunki pomiaru: API i MariaDB 10.11 na jednej maszynie testowej, 36 rowerów w bazie, 50 połączeń, 10 s. Wartość jest orientacyjna, na hostingu (współdzielone CPU, baza zdalna) wynik będzie niższy. Kryterium NF4 (min. 100 żądań/s, brak błędów) spełnione. Pomiar warto powtórzyć na wdrożonej aplikacji (`TARGET=https://<adres>/api/bikes npm run test:load`).

### Test end-to-end API na prawdziwej bazie
Wykonano na MariaDB 10.11 po `npm run init-db` (6 kategorii, 36 rowerów, konto admina). Zweryfikowano: rejestracja i duplikat (409), logowanie i złe hasło (401), zamówienie z ceną podaną przez klienta (zignorowana, suma 10898,98 zł wyliczona z bazy), historia zamówień, zakaz CRUD dla zwykłego użytkownika (403), dodanie/edycja/usunięcie roweru przez admina (201/200/204), blokada usunięcia roweru z zamówienia (409), zmiana statusu zamówienia, ataki SQL Injection w wyszukiwarce (tabela `rowery` nienaruszona, 36 rekordów), Swagger, serwowanie frontendu i zdjęć.

## 4.6 Procedura uruchamiania testów
```bash
cd backend  && npm install && npm test      # raport pokrycia w backend/coverage
cd frontend && npm install && npm test
```
Testy back-endu nie wymagają bazy (używają atrapy `db`). Pipeline CI uruchamia je automatycznie przy każdym pushu i pull requeście.
