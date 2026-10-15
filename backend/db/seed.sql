-- Dodanie kategorii
INSERT INTO kategorie (nazwa, opis) VALUES
('Górskie', 'Rowery terenowe, idealne w góry i lasy'),
('Turystyczne', 'Wygodne rowery na długie trasy'),
('Szosowe', 'Lekkie rowery do szybkiej jazdy po asfalcie'),
('Gravelowe', 'Uniwersalne rowery do jazdy w terenie i na szosie'),
('Elektryczne', 'Rowery z napędem elektrycznym'),
('Dziecięce', 'Rowery dla najmłodszych');

-- Dodanie rowerów (6 na kategorię) - ŚCIEŻKI ZDJĘĆ: zdjecia/nazwa_pliku.jpg
INSERT INTO rowery (nazwa, marka, cena, kategoria_id, zdjecie) VALUES
-- Górskie (id=1)
('X-Caliber 8', 'Trek', 3999.99, 1, 'zdjecia/trek_xcaliber.jpg'),
('Marauder', 'Kross', 2899.00, 1, 'zdjecia/kross_marauder.jpg'),
('Stumpjumper', 'Specialized', 5499.00, 1, 'zdjecia/specialized_stumpjumper.jpg'),
('Talon 1', 'Giant', 3699.99, 1, 'zdjecia/giant_talon.jpg'),
('Syncline C3', 'Polygon', 4999.00, 1, 'zdjecia/polygon_syncline.jpg'),
('Procaliber 6', 'Trek', 4499.99, 1, 'zdjecia/trek_procaliber.jpg'),

-- Turystyczne (id=2)
('520', 'Trek', 4799.99, 2, 'zdjecia/trek_520.jpg'),
('Level 4.0', 'Kross', 2399.00, 2, 'zdjecia/kross_level.jpg'),
('AWOL', 'Specialized', 4999.00, 2, 'zdjecia/specialized_awol.jpg'),
('Escape 3', 'Giant', 2599.99, 2, 'zdjecia/giant_escape.jpg'),
('Path X5', 'Polygon', 2199.00, 2, 'zdjecia/polygon_path.jpg'),
('FX 3', 'Trek', 3299.99, 2, 'zdjecia/trek_fx3.jpg'),

-- Szosowe (id=3)
('Domane AL 2', 'Trek', 5299.99, 3, 'zdjecia/trek_domane.jpg'),
('Vento', 'Kross', 3699.00, 3, 'zdjecia/kross_vento.jpg'),
('Tarmac SL6', 'Specialized', 8999.00, 3, 'zdjecia/specialized_tarmac.jpg'),
('Contend 3', 'Giant', 4199.99, 3, 'zdjecia/giant_contend.jpg'),
('Strattos S5', 'Polygon', 4799.00, 3, 'zdjecia/polygon_strattos.jpg'),
('Emonda ALR', 'Trek', 6299.99, 3, 'zdjecia/trek_emonda.jpg'),

-- Gravelowe (id=4)
('Checkpoint AL3', 'Trek', 5999.99, 4, 'zdjecia/trek_checkpoint.jpg'),
('Esker 2.0', 'Kross', 4299.00, 4, 'zdjecia/kross_esker.jpg'),
('Diverge E5', 'Specialized', 5499.00, 4, 'zdjecia/specialized_diverge.jpg'),
('Revolt 2', 'Giant', 4999.99, 4, 'zdjecia/giant_revolt.jpg'),
('Tambora G4', 'Polygon', 3999.00, 4, 'zdjecia/polygon_tambora.jpg'),
('Checkpoint ALR', 'Trek', 6999.99, 4, 'zdjecia/trek_checkpoint_alr.jpg'),

-- Elektryczne (id=5)
('Allant+ 7S', 'Trek', 14999.99, 5, 'zdjecia/trek_allant.jpg'),
('E-Cross', 'Kross', 10999.00, 5, 'zdjecia/kross_ecross.jpg'),
('Turbo Vado 3.0', 'Specialized', 16999.00, 5, 'zdjecia/specialized_turbo_vado.jpg'),
('Explore E+', 'Giant', 12999.99, 5, 'zdjecia/giant_explore.jpg'),
('Helios A7', 'Polygon', 9999.00, 5, 'zdjecia/polygon_helios.jpg'),
('Powerfly 4', 'Trek', 13999.99, 5, 'zdjecia/trek_powerfly.jpg'),

-- Dziecięce (id=6)
('Marlin 4 (20")', 'Trek', 1599.99, 6, 'zdjecia/trek_marlin_kids.jpg'),
('Kross Kid 20"', 'Kross', 1299.00, 6, 'zdjecia/kross_kid.jpg'),
('Riprock 20"', 'Specialized', 1799.00, 6, 'zdjecia/specialized_riprock.jpg'),
('ARX 20"', 'Giant', 1499.99, 6, 'zdjecia/giant_arx.jpg'),
('Relic 20"', 'Polygon', 1199.00, 6, 'zdjecia/polygon_relic.jpg'),
('Precaliber 20"', 'Trek', 1699.99, 6, 'zdjecia/trek_precaliber.jpg');