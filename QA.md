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

## Online-Prüfung

Die erste Version wurde am 17. November 2026 erfolgreich über GitHub Pages veröffentlicht: https://timguske.github.io/grand-tim-auto/ . Der Pages-Lauf `44110596131` war erfolgreich; die Spielseite liefert HTTP 200. Die veröffentlichte Seite wurde im Browser bei 844×390 mit erzwungener Touch-Oberfläche gestartet: 3D-Szene und Tasten sichtbar, keine Konsolenfehler. Ein echter Handytest steht weiterhin aus.

## Marktplatz-Update 0.2

- Poster nachgereicht und als visuelle Richtung berücksichtigt: geschlossenes Umfeld am Turm, steinerner Torbogen, Walmdach, üppigere Blätter, Sonnenschirme, tiefere Kamera, Comic-Farben und detailliertere Tim-Figur mit Mantel, Brille, Schnurrbart, Schal und hellen Schuhen.
- Sprint vollständig entfernt; konstantes Lauftempo auf 6,1 erhöht.
- 16 umwerfbare Marktgegenstände in 5 Typen; Flug, Rotation, Kettenreaktion und Rücksetzen nach 12 Sekunden.
- Drei wechselnde Remplerreaktionen und zusätzlicher Stampfer (E oder Touch-Taste), Druckwelle bei Landung und sichtbare Abklingzeit.
- Audio beim Start-Tippen aktivierbar, Kontext bei späteren Eingaben wieder aufgenommen, unterstützte Wiedergabe-Audiosession aktiviert. Sprechblase und Audio verwenden dieselbe Phrase; laufende Sätze werden nicht von neuen Treffern abgebrochen. Deutsches System-TTS weiterhin als Ersatz, keine fertigen KI-Dialektclips.
- 10 automatisierte Tests erfolgreich. Browserprüfung: Start, laufende 3D-Szene, Begrüßung mit bestätigtem Speech-Start-Event, Stampfer per Tastatur und Touch, erhöhte Punkte nach Druckwelle. Frischer Browser-Tab ohne Konsolenfehler/-warnungen. Querformat 844×390 geprüft.
- Kein hörender Test auf einem echten Handy; Dialektqualität und echte Mehrfinger-Eingabe weiterhin offen. fal als installiert bestätigt, aber Generierungswerkzeuge im Chat nicht verfügbar; Website benötigt separate Anmeldung.

0.2 wurde über Pages-Lauf `44115347986` erfolgreich veröffentlicht (Deployment-Commit `eac3691`). Die veröffentlichte Spielseite wurde erneut bei 844×390 geöffnet: neue Oberfläche, Start, bestätigtes Sprach-Start-Ereignis und Touch-Stampfer geprüft; keine Konsolenfehler/-warnungen im frischen Tab.
