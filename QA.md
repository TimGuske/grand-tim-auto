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

## 0.3.1 – Lebendigerer Marktplatz

- Sechs Fußgänger laufen mit 1,1–1,42 statt 0,65 Spielmetern pro Sekunde; Gehbewegung entsprechend beschleunigt.
- Drei stehende Zweiergruppen an Marktstand, Spritz-Stand und Café. Arme gestikulieren, Kopf und Oberkörper bewegen sich dezent. Keine neuen Sprachaufnahmen oder zusätzlichen Gesprächssprechblasen.
- Nach Comic-Knockback kehren Gesprächspartner zu ihren Plätzen zurück. Erholung und Flug unterbrechen die Unterhaltung.
- 23 Tests und Produktionsbuild erfolgreich; Rückkehr ohne Teleport und stehende Gruppen geprüft. Browser: neue Gruppen und Bewegung sichtbar, keine Konsolenfehler/-warnungen.

## 18. November 2026 – getrennte Kampfaktionen (lokal)

- Stampfer vollständig durch niedrigen rechten Vorwärtstritt ersetzt; linkes Standbein, Knie anziehen, strecken, zurückziehen. Keine Sprungphysik oder Druckwelle.
- Schlag trifft ausschließlich Passanten, Tritt ausschließlich Gegenstände in einem schmalen Bereich vor dem rechten Fuß. Keine Passantenreaktion durch Tritte oder herumfliegende Gegenstände.
- Tastatur: Leertaste Schlag, E Tritt. Touch-Schaltfläche TRITT und Hilfe aktualisiert. Aktionen sperren sich gegenseitig.
- 33 Tests bestanden, einschließlich Treffertrennung, Richtung, Standfuß und Animation am echten Tim-Modell; Produktionsbuild erfolgreich. Browser: E kippt Kiste, +10 Fußtritt, Kehrwoche übernimmt; keine Konsolenfehler. Lokale Animationsansicht unter work/kick-review.html. Noch nicht veröffentlicht.

## 18. November 2026 – X-Tritt und Musikmemo (lokal)

- Fußtritt auf X umgelegt; Leertaste bleibt Schlag. Bedienhinweise aktualisiert.
- Neues Memo „Nelkenweg 2.m4a“ vom 18. November als leise Musikschleife integriert. 65,62 Sekunden, Stereo, 160 kbit/s, Lautheit angeglichen, Fade-in 1,5 s und Fade-out 2 s. Schleife beginnt danach erneut.
- Sprach-Ducking sowie Pause/Ton/Musik-Schalter bleiben wirksam. Keine parallelen Schleifen; Laden während Pause startet später keine Wiedergabe.
- 34 Tests erfolgreich; fertige MP3 dekodiert und auf hörbaren Inhalt, Spitzenpegel und leise Schnittenden geprüft; Produktionsbuild erfolgreich. Noch nicht veröffentlicht.

## 18. November 2026 – Gegenstandskollisionen und Aperol-Alarm (lokal)

- Stehende interaktive Gegenstände in gemeinsamer Kollisions- und Wegfindungsprüfung von Tim/Passanten; kleine Bewegungsschritte verhindern Durchlaufen. Eigene Flugphysik bleibt ausgenommen. Kicken gibt den Weg frei, Aufräumen stellt Hindernisse wieder her.
- Dezente Bodenringe bis fünf Einheiten Entfernung, stärkerer Ring am nächsten tretbaren Gegenstand; verschwindet nach Treffer. Touch-Tritt markiert erreichbares Ziel.
- Aperol-Alarm unter 25 %: sanft pulsierender Rahmen, ALARM-Beschriftung, einmaliger leiser Dreiklang. Sprache hat Vorrang; stumm und pausiert ertönt kein Signal. Nach Nachtanken erneut scharf.
- Browser: an Kiste gestoppt, mit X umgekippt, +10 Gegenstandspunkte; Markierung und Kehrwoche korrekt, keine Konsolenfehler. Automatische Prüfungen für Hindernis, Wegfindung, Markierung und Alarm ergänzt. Noch nicht veröffentlicht.

## 18. November 2026 – sichtbare Hinweise, Tor und Comic-Flug (lokal)

- Interaktionsringe breiter, heller und pulsierend, mit auslaufendem zweiten Ring. Bewegung bei reduzierter Animation abgeschaltet.
- WINNENDEN-Tafel von 3,4 auf 5 Einheiten vergrößert; echtes lokales Winnendener Wappen ersetzt W-Platzhalter. Browseransicht am Tor geprüft.
- Großer orangefarbener, weiß umrandeter Pfeil über dem Spritz-Stand bei Energie unter 25 %. Wippt, dreht sich zur Kamera, verschwindet nach Nachtanken. Keine Challenge eingebaut.
- Getroffene Passanten rotieren um drei Achsen und fliegen beschleunigt aufwärts aus dem Bild. Danach 4–12 Sekunden unsichtbar, Rückkehr an kollisionsfreier Stelle mit Abstand zu Tim. Rollen und Stimmen bleiben erhalten. Hausmeister unterbricht dabei wie bisher seine Arbeit.
- Browser: Treffer +25, älterer Passant fliegt aus dem Bild und kehrt an anderer Stelle zurück; keine Konsolenfehler. Tests für Flug, zufällige Wartezeit, sichere Rückkehr, animierte Ringe und Pfeil ergänzt.

## 18. November 2026 – flachere Flüge und Wandaufprall (lokal)

- Zufällige Dach-/Wandvariante ersetzt senkrechten Sofortflug. Dachflug kreuzt den Platz, steigt zunächst langsamer und passiert die Häuserzeile auf knapp 12 Einheiten Höhe; Dauer 3,2–3,7 s.
- Wandreaktion ermittelt eine tatsächliche Gebäudefassade, hält dort kurz an, fällt auf den Boden und verschwindet erst nach 0,55 s Liegen. Comic-Aufprall mit Sternen und kurzem Geräusch. Keine grafische Gewalt.
- Rotation um Körpermitte über temporäre Gruppierung; ursprüngliche Körperposition und Ausrichtung werden beim Wiedererscheinen wiederhergestellt.
- Tests für beide Verläufe, sichtbare Anfangsphase, sichere Rückkehr und Wandlücken. 41 Tests erfolgreich, Produktionsbuild erfolgreich. Browser: mehrere Passanten getroffen, Dachflug und Wandreaktion sichtbar, keine Änderung an der Trennung Schlag/Tritt. Noch nicht veröffentlicht.

## 18. November 2026 – freigegebene erschöpfte Haltung und klarer Alarm (lokal)

- Große orange Warnkarte unter 25 % mit konkreter Handlungsaufforderung; bei 0 % APEROL LEER / Tim schleicht. Stand-Pfeil und Alarmton bleiben erhalten.
- Geschwindigkeit bei 0 % von 3,4 auf 0,85 reduziert (normal 6,1); Schlagbewegung kann die Begrenzung nicht umgehen. Erschöpfungshaltung setzt unter 10 % zunehmend ein.
- Finale Haltung nach mehreren isolierten Vorschauen ausdrücklich freigegeben: stärker gekrümmter Oberkörper, Kopf nach unten, eng hängende Arme, kurze pendelnde Schritte. Gemeinsames Animationsmodul für Vorschau und Spiel.
- Spiel setzt die Pose vor jeder Aktualisierung zurück; Nachtanken stellt volle Geschwindigkeit und normale Haltung wieder her. Lokale Leertank-Vorschau mit energy-start=0; in Produktionsbuilds wird dieser Parameter ignoriert. Noch nicht veröffentlicht.

## Release 0.4.0 – 18. November 2026

Freigegebener Stand vor den Missionen. 41 Tests und Produktionsbuild erfolgreich. Quellcode auf main, Veröffentlichung über gh-pages. Enthält den bisherigen charmanten Marktplatz, vier kostenlose Passantenmodelle, getrennte Schlag-/Tritt-Aktionen, Dach-/Wandreaktionen, Kehrwoche, 51 Sprüche in zwei Stimmen, Musikschleife, überarbeitete Kollisionen/Kamera und den klaren Aperol-Alarm mit freigegebener Erschöpfungshaltung. Auto, verworfene Straßenerweiterung und private Originaldateien sind nicht Teil des Releases.
