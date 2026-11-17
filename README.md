# Grand Tim Auto — Winnenden Unleashed

Ein kleiner, endloser 3D-Comic-Spielplatz mit Vite und Three.js. Erste Testversion: https://timguske.github.io/grand-tim-auto/ .

## Starten

Node.js 22.12+ (oder 24+) und npm verwenden.

```sh
npm ci
npm run dev
```

Die angezeigte lokale Adresse öffnen. Auf einem Handy im selben WLAN die angezeigte Netzwerk-Adresse öffnen, Gerät quer halten. Die Touch-Steuerung erscheint automatisch; auf Hybridgeräten oder zum Testen lässt sie sich mit `?touch=1` erzwingen. Der Entwicklungsserver ist im lokalen Netzwerk erreichbar.

```sh
npm test
npm run build
npm run preview
```

`dist/` enthält die fertige statische App. HTML nicht direkt per Doppelklick öffnen, sondern über einen Webserver.

## Spielen

- WASD / Pfeiltasten: kamerarelativ laufen, jetzt dauerhaft schneller (6,1 statt 4,3 Spielmeter/Sekunde). Ein separater Sprint entfällt.
- Leertaste: Rempler im Radius von 2,8 Spielmetern, 0,48 Sekunden Abklingzeit. Drei wechselnde Reaktionen: Schubser, hoher Hopser und Drehung.
- E / STAMPFER: Tim springt und löst bei der Landung eine Comic-Druckwelle mit 4,6 Spielmetern Reichweite aus (2,4 Sekunden Abklingzeit).
- Handy: linker Joystick, REMPLER und STAMPFER; kein Sprintknopf mehr.
- Freie Spielfläche ziehen: Kamera drehen und neigen.
- Escape oder Pause: pausieren. Tabwechsel pausiert automatisch.
- „Mit Ton starten“ aktiviert Geräusche und eine Begrüßung direkt beim Start-Tippen. TON AN/AUS schaltet um. Der Audiokontext wird bei Eingaben erneut freigeschaltet; auf unterstütztem WebKit wird die Wiedergabe-Audiosession verwendet. Deutsche Browserstimme als vorläufiger Ersatz, noch keine zugesicherte echte Dialektstimme. Verfügbarkeit und Qualität müssen auf dem Zielhandy geprüft werden.
- Vollbild-Taste: verwendet die Fullscreen-API, falls vorhanden; auf iPhone erscheint sonst der Home-Bildschirm-Hinweis.

16 Marktgegenstände aus fünf Gruppen (Kisten, Fässer, Blumentöpfe, Stühle, Tafeln) lassen sich umwerfen. Sie fliegen, drehen sich, können weitere Gegenstände oder Passanten erwischen und kehren nach zwölf Sekunden zurück. Gegenstandstreffer geben 10 Punkte, Gegenstands-Kettenreaktionen 15 und Passanten-Kettenreaktionen 40 vor dem Multiplikator.

Ein Passantentreffer gibt 25 Punkte. Weitere Treffer binnen 2,5 Sekunden erhöhen den Multiplikator bis 4×. Figuren springen und drehen sich, landen wieder und können nach kurzer Erholung erneut angerempelt werden. Punkte leben nur im Arbeitsspeicher und verschwinden beim Neuladen. Keine Polizei, Autos, Datenbank, Konten oder Spielzeitbegrenzung.

## GitHub Pages

Repository: https://github.com/TimGuske/grand-tim-auto

Spiel: https://timguske.github.io/grand-tim-auto/

Die erste Version wird aus dem separaten Zweig `gh-pages` ausgeliefert. Er enthält ausschließlich den gebauten Inhalt von `dist/` und eine `.nojekyll`-Datei. Unter **Settings → Pages** ist dieser Zweig mit dem Stammordner `/` als Quelle eingestellt. Änderungen auf `main` veröffentlichen sich dadurch nicht automatisch; eine neue Version muss ausdrücklich gebaut und auf `gh-pages` hochgeladen werden.

`deployment/pages-workflow.yml` enthält die vorbereitete, manuell auslösbare Actions-Alternative. Die aktuelle GitHub-Anmeldung darf keine eigenen Workflow-Dateien hochladen. Deshalb liegt die Vorlage außerhalb von `.github/workflows/` und ist inaktiv. Mit passender Berechtigung kann sie später dorthin verschoben und Pages auf „GitHub Actions“ umgestellt werden.

`base: './'` unterstützt den Repository-Unterpfad sowie Root-Hosting. Referenz: [Vite: GitHub Pages](https://vite.dev/guide/static-deploy#github-pages).

## Gestaltung und Grenzen des Prototyps

- Prozedural modellierte, frei stilisierte Marktstraße mit Schwaikheimer Torturm, Fachwerkfassaden, Marktbrunnen, Bäumen und Marktstand; kein maßstabsgetreuer Nachbau. Orientierung: [Marktplatz Winnenden](https://www.winnenden-entdecken.de/attraktion/marktplatz-winnenden-9ac3dda74c).
- Tim basiert auf den drei Fotos aus dem vorherigen Chat: schwarze Brille, Schnurrbart, Beanie, dunkler Schal und marineblauer Mantel. Die privaten Originalfotos werden weder ausgeliefert noch ins Repository kopiert. Das nachgereichte erste Poster ist nun die visuelle Richtung: warme Sonne, steinerner Torturm mit Walmdach und angeschlossenen Gebäuden, längerer Mantel mit hellen Sneakern, üppigere Baumkronen sowie schwarz/weiß/pink/gelbe Comic-Oberfläche. Die Echtzeitmodelle sind weiterhin prozedurale Stilisierungen und erreichen noch nicht den Detailgrad der Illustration.
- Statische Stadtgeometrie wird nach Material zusammengefasst; Pflaster nutzt Instancing. Pixeldichte ist auf 1,7 begrenzt. Echte Smartphone-Leistung muss noch auf Zielgeräten geprüft werden.
- Feste Spielfeldgrenzen und Brunnen-Kollision; Bänke, Bäume und Passanten sind im ersten Stand durchlaufbar. Kamera kann am Rand Gebäude schneiden. Noch keine komplexe Navigation, vollständige Starrkörperphysik, fertigen KI-Dialektstimmen oder Missionen.
- Schriftarten: Barlow Condensed und DM Sans über Google Fonts, mit lokalen System-Fallbacks. Die Spielgeometrie braucht keine externen Modelle oder Texturen. Sprachausgabe kann abhängig vom System einen Sprachdienst nutzen.

## Aufbau

`src/main.js`: Szene, Eingaben, Animation und UI. `src/characters.js`: artikulierte Comic-Figuren. `src/props.js`: umwerfbare Gegenstände und Kettenreaktionen. `src/audio.js`: gemeinsame Text-/Audio-Phrasen, mobile Aktivierung und Audio-Fehlerbehandlung. `src/gameplay.js`: Grenzen, Brunnen-Kollision und Punktefunktionen. `src/style.css`: Desktop- und mobile Oberfläche. `src/gameplay.test.js`: Tests der Kernregeln. `deployment/pages-workflow.yml`: inaktive Vorlage für eine spätere manuell auszulösende Bereitstellung.

## Stimmen und Text-Synchronisierung

Eine einzige Phrase-ID liefert Sprechblase und gesprochene Zeile. Es spricht nur eine Figur gleichzeitig; der nächste Treffer bricht einen laufenden Satz nicht ab. Fehlende Stimmen oder blockierte Wiedergabe werden als Status angezeigt. Ein Watchdog gibt den Dialog nach acht Sekunden wieder frei.

`public/audio/manifest.json` ist aktuell bewusst leer. Hier können freigegebene KI-Sprachclips pro Phrase-ID eingetragen werden, etwa `"heidanei": "heidanei.mp3"`. Keine API-Schlüssel werden ausgeliefert; spätere KI-Sprachclips werden einmal erzeugt und statisch mit der App ausgeliefert. Der eingerichtete fal-Plugin-Eintrag wurde als installiert bestätigt, stellt aber in diesem Chat noch keine aufrufbare Generierungsfunktion bereit. Es wurden daher keine KI-Stimmclips erzeugt oder als echt schwäbisch ausgegeben.

Die zehn Tests decken Kernregeln, synchronen Dialog, Dialogende/Pause, fehlenden Sprachdienst sowie Gegenstandsflug und Rücksetzen ab. Echtes Multitouch und hörbare Wiedergabe auf iPhone/Android stehen weiterhin zur Prüfung aus.
