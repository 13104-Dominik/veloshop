-- Schemat bazy VeloShop v2 (rozszerzenie schematu z poprzedniego projektu o konta użytkowników)
CREATE TABLE IF NOT EXISTS uzytkownicy (
    id INT AUTO_INCREMENT PRIMARY KEY,
    imie VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    haslo_hash VARCHAR(100) NOT NULL,
    rola ENUM('user','admin') NOT NULL DEFAULT 'user',
    data_utworzenia TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS kategorie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nazwa VARCHAR(50) NOT NULL,
    opis TEXT
);
CREATE TABLE IF NOT EXISTS rowery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nazwa VARCHAR(100) NOT NULL,
    marka VARCHAR(50) NOT NULL,
    cena DECIMAL(10,2) NOT NULL,
    kategoria_id INT,
    zdjecie VARCHAR(200),
    FOREIGN KEY (kategoria_id) REFERENCES kategorie(id)
);
CREATE TABLE IF NOT EXISTS zamowienia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uzytkownik_id INT NOT NULL,
    imie_nazwisko VARCHAR(100) NOT NULL,
    adres VARCHAR(200) NOT NULL,
    telefon VARCHAR(20) NOT NULL,
    status ENUM('nowe','w realizacji','wyslane','anulowane') NOT NULL DEFAULT 'nowe',
    data_zlozenia TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    suma_calkowita DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (uzytkownik_id) REFERENCES uzytkownicy(id)
);
CREATE TABLE IF NOT EXISTS elementy_zamowienia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    zamowienie_id INT NOT NULL,
    rower_id INT NOT NULL,
    nazwa_roweru VARCHAR(100) NOT NULL,
    cena DECIMAL(10,2) NOT NULL,
    ilosc INT NOT NULL DEFAULT 1,
    FOREIGN KEY (zamowienie_id) REFERENCES zamowienia(id),
    FOREIGN KEY (rower_id) REFERENCES rowery(id)
);
