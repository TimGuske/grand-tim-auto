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

## Sprachupdate 0.2.1

- Neun von Tim bestätigte Sprüche einzeln geschnitten; 18 MP3-Clips, männlich tief / weiblich frecher, beide 12 % schneller. Keine System-TTS mehr. Die Sprechblasen verwenden Tims bestätigte Schreibweise.
- Stimmzuordnung folgt der tatsächlichen Figurenvariante. Laufende Sätze bleiben vor Unterbrechung durch Treffer geschützt; Pause und Ton aus stoppen auch noch ladende Aufnahmen.
- Fehler beim ersten Schnitt korrigiert: Ausblendungen wurden vor dem Zurücksetzen der Clip-Zeit angewendet und erzeugten stumme Dateien. Nun wird vor der Tempoverarbeitung geschnitten und die Ausblendung relativ zur endgültigen Clip-Zeit gesetzt.
- Alle 18 endgültigen MP3s vollständig dekodiert: 0,89–1,94 Sekunden, Signal vorhanden, Spitzen zwischen -2,5 und -7,5 dBFS, kein Clipping; zusammen 408.216 Bytes.
- Zwölf automatisierte Tests erfolgreich; Produktionsbuild erfolgreich. Lokaler Browserstart zeigt Ton an, Sprachstart und bestätigten Spruch. Hörbarer Test auf echtem Handy weiterhin offen.
- Zusätzliche echte Browserprüfung: alle 18 Clips nacheinander über `GameAudio` dekodiert und bis zum Ende abgespielt, AudioContext jeweils `running`, dekodierter Spitzenpegel jeweils größer als 0,01. Ergebnis: 18/18 erfolgreich. Diese technische Prüfung ersetzt keinen hörenden Test auf einem echten Handy.
- 0.2.1 veröffentlicht über Pages-Lauf `44128822488` (Deployment `9921e6b`). Online: korrekter JS-Build und alle 18 MP3s mit identischem SHA-256 geprüft; Spielstart zeigt `Schwäbische Comicstimmen` und `Ha sag a mol!`.

## Neue Tim-Figur – lokaler Spielstand

- Freigegebenen Kopf mit Polo-Logo und entfernten Brillengläsern in die Spielfigur übernommen. Vorhandene Augen und Gesichtstextur bleiben erhalten. Figurenprobe bleibt als eigene Seite verfügbar.
- Laufzeit-Skelett für Hüften, Knie, Schultern und Kopf; weiche Gewichte am Mantel. Laufbewegung, Rempler und Stampfer verwenden das neue Modell. Bei fehlgeschlagenem Modellladen bleibt die bisherige Figur spielbar.
- Kameraabstand im Spiel von 15,5 auf 10,5 verringert. Die neue Figur lädt im Hintergrund; der Startbildschirm meldet den Ladezustand.
- 14 Tests erfolgreich, einschließlich normalisierter Gelenkgewichte und unveränderter Geometrie in Ruhepose. Produktionsbuild erfolgreich. Browser: Modell sichtbar, Tastaturlaufen und Touch-Aktionen ausgelöst, keine Konsolenfehler oder Warnungen.
- Noch offen: echte Smartphone-Leistung, feinere Arm-/Ellbogenanimation, sauberer Schalübergang und NPCs im passenden Detailgrad. Dieser Stand ist lokal und wurde nicht veröffentlicht.

## Faustschlag und freie Passanten – lokaler Stand

- Sechs CC0-Modelle von Quaternius: drei Männer, drei Frauen. Je zwei unabhängige Instanzen ergeben zwölf Passanten. Originale Idle-/Walk-/Jump-Animationen und separate Skelettklone; Stimmzuordnung nach Modell. Quellen, Lizenz und Konvertierung in CREDITS.md dokumentiert.
- Rempler durch abwechselnden linken/rechten Faustschlag ersetzt. Neue Ellbogen-/Handgelenke, geschlossene Comic-Fäuste während der Aktion, Deckung und leichte Körperdrehung. Treffer nach 0,16 Sekunden, maximal 2 Einheiten vor Tim; kein Rundum-Treffer durch Schlagen. Touch-Taste FAUST und Leertaste. Stampfer bleibt erhalten.
- 17 Tests erfolgreich: zusätzlich gerichtete Reichweite, Kontaktphase und eingebettete Skelette/Animationsclips aller sechs Assets. Produktionsbuild und Diff-Prüfung erfolgreich.
- Browser: neue Passanten sichtbar und laufend; nach Tastaturbewegung und Touch-Faustschlag ein bestätigter Treffer (+25 · POW! FAUSTSCHLAG), fliegender animierter Passant. Keine Konsolenfehler/-warnungen. Schlagpose separat mit derselben Animationsfunktion visuell geprüft.
- Weiterhin lokal, nicht veröffentlicht. Smartphone-Leistung und echtes Multitouch bleiben auf dem Zielgerät zu prüfen.

## Korrektur: rechter Schlag und NPC-Füße

- Schlag auf anatomisch rechts beschränkt (lokal -X bei Blickrichtung +Z). Zusatzfaust vollständig entfernt; Originalhand ohne Verkleinerung oder Formänderung. Ober- und Unterarm strecken in dieselbe Richtung; Handgelenk beim Treffer von 2,13 auf 2,38 angehoben. Keine wechselnden Schlagseiten oder Körperdrehung.
- NPC-Schuhverzerrung lokalisiert: gemischte Fuß-/Unterschenkelgewichte streckten Kanten beim Gehen bis über Faktor 8. Schuh und unterer Knöchel jetzt starr am jeweiligen Fuß, weicher Übergang oberhalb des Knöchels. Alle sechs GLBs neu konvertiert; Cacheversion geändert.
- Neuer Regressionstest misst Schuhkanten aller sechs Figuren in sechs Gehphasen: weniger als 1 Prozent Abweichung. Rechte Schlagpose auf Höhe, Streckung, unveränderte Hand und ruhenden linken Arm geprüft. Insgesamt 19 Tests und Produktionsbuild erfolgreich. Seitenansicht der Schlagpose sowie mehrere Gehphasen von Mann und Frau visuell geprüft. Weiterhin lokal, nicht veröffentlicht.

## 0.3 – Grand Tim Altstadt, Cartoon-Passanten und Aperol-Energie

- Neuer Name und umrandetes dreizeiliges SVG-Logo; pinker Untertitel direkt darunter.
- Freigegebener Tim mit neuer rechter Geraden aus der Boxprobe ins Spiel übernommen. Treffer nach 0,39 s. Höhere Deckung, gerades Handgelenk, Körperdrehung, Rückzug; Originalhände bleiben erhalten. Die automatische Prüfung lädt das tatsächliche Tim-Modell und prüft auch gedrehte/verschobene Spielerpositionen. Mantel-/Ellbogenübergänge bleiben eine Grenze der generierten Geometrie.
- Canino3d-Mann und -Frau mit Original-Skeletten, lokaler Gehbewegung und Kleidungsfarbvarianten. Texturen auf 512 px reduziert; Downloads zusammen rund 10,8 MB. Credits im Spiel erreichbar. Schuhgewichte korrigiert und über sechs Gehphasen auf Formstabilität geprüft.
- Neonorange Aperol-Energie: 200 s aktive Zeit bis leer, Pause stoppt Verbrauch, unter 25 % reduziertes Tempo mit erreichbarem Stand. Auffüllen nur nahe dem sichtbaren Stand, per F oder Touch. Orange Markierung auf der Karte.

- 22 automatisierte Tests erfolgreich. Produktionsbuild erfolgreich. Browserprüfung: beide neuen Passantenmodelle sichtbar, keine Konsolenfehler/-warnungen; Lauf zum Spritz-Stand, eingeblendeter Nachfüllbutton, Energieanstieg auf 100 % und Bestätigung überprüft. Querformat 844 × 390: Logo, neonorange Energie, Score und Touch-Aktionen ohne Überlappung. Echter Handy-Leistungs- und Multitouch-Test bleibt bei Tim.
