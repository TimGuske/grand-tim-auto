# Freigegebene schwäbische Comicstimmen

Tim hat beide Aufnahmen selbst eingesprochen und diese Bearbeitung nach Hörproben freigegeben: Männer tief, Frauen die frechere hohe Comicstimme, beide 12 % schneller. Es wird keine KI-Stimme und keine Browser-TTS benutzt.

Private Originale und Bearbeitungsskripte liegen lokal im ignorierten `work/voice/`. Nur die zugeschnittenen bearbeiteten Clips werden in `public/audio/` veröffentlicht.

## Sprüche in Aufnahme-Reihenfolge

1. Ha sag a mol!
2. Du Grasdaggl!
3. Asobaba!
4. Desch zwenig Mehl!
5. Uffs Maul, sag i dir!
6. Langsam, Kerle!
7. Zeig dir glei, wo der Bartell dr Moschd holt!
8. Sag a mol!
9. Ha neu!

Die Schreibweisen stammen von Tim. Die IDs `spruch-01` bis `spruch-09` verbinden genau diese Texte mit jeweils einem männlichen und einem weiblichen Clip in `manifest.json`.

## Bearbeitung

- Mann: Tonhöhenfaktor 0,86, leichte Bassanhebung.
- Frau: Tonhöhenfaktor 1,43, dezentes Vibrato (6,5 Hz, Tiefe 0,18) und Höhenanhebung.
- Gegenläufige Tempokorrektur erhält zunächst das Sprachtempo; abschließend Tempo 1,12 bei gleicher Tonhöhe.
- Hochpass, sanfte Kompression, Lautheitsangleichung, kurze Ein-/Ausblendungen gegen Schnittknackser.
- Ausgabe: MP3 mono, 48 kHz, 128 kbit/s. Keine API-Zugänge im Spiel.
