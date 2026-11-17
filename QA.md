# Prüfung des ersten Prototyps

17. November 2026

- `npm test`: 4 Tests erfolgreich (Spielfeldgrenzen, Brunnen inklusive Mittelpunkt, Trefferreichweite und Erholungszeit, Punkte-Multiplikator).
- `npm run build`: erfolgreich mit Vite 7.3.8 und Three.js 0.181.2.
- Lokaler Entwicklungsserver: HTTP 200.
- Browser: Start und 3D-Darstellung geprüft, Tastaturbewegung und Rempler ausgeführt, 25 Punkte und Sprechblase sichtbar.
- Desktop 1280×720 und simuliertes Handy-Querformat 844×390 geprüft. Touch-Oberfläche über `?touch=1` sichtbar; mobiler Rempler löste ebenfalls 25 Punkte aus.
- Pause und Fortsetzen geprüft. Nach Neuladen wieder 0000 Punkte.
- Ton-Schalter lässt sich aktivieren und deaktivieren. Keine Browser-Fehler oder Warnungen nach Grafik-Optimierung. Klang und echte Dialektqualität sind nicht hörend geprüft.
- Veröffentlichung über den separaten Zweig `gh-pages`; Quelle auf `main`. Die Actions-Vorlage liegt inaktiv unter `deployment/`, da die vorhandene Anmeldung keine Workflow-Schreibberechtigung besitzt.

Noch offen: echte Mehrfinger-Eingabe, Leistung, Darstellung mit Safe Areas und Sprachqualität auf einem echten iPhone/Android-Gerät. Die Szene ist eine freie Stilisierung; Gebäude und Figuren sind für den Prototyp prozedural erzeugt.
