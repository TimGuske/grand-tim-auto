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

- WASD / Pfeiltasten: kamerarelativ laufen. Shift: sprinten.
- Leertaste: Rempler im Radius von 2,7 Spielmetern, 0,55 Sekunden Abklingzeit.
- Handy: linker Joystick, FLITZA halten und REMPLER antippen; mehrere Finger werden unterstützt.
- Freie Spielfläche ziehen: Kamera drehen und neigen.
- Escape oder Pause: pausieren. Tabwechsel pausiert automatisch.
- TON AN: optionale synthetische Comic-Geräusche und deutsche Browser-Sprachausgabe. Schwäbische Texte, keine zugesicherte Dialektstimme. Verfügbarkeit und Qualität hängen vom Browser/Betriebssystem ab.

Ein Treffer gibt 25 Punkte. Weitere Treffer binnen 2,5 Sekunden erhöhen den Multiplikator bis 4×. Figuren springen und drehen sich, landen wieder und können nach kurzer Erholung erneut angerempelt werden. Punkte leben nur im Arbeitsspeicher und verschwinden beim Neuladen. Keine Polizei, Autos, Datenbank, Konten oder Spielzeitbegrenzung.

## GitHub Pages

Repository: https://github.com/TimGuske/grand-tim-auto

Spiel: https://timguske.github.io/grand-tim-auto/

Die erste Version wird aus dem separaten Zweig `gh-pages` ausgeliefert. Er enthält ausschließlich den gebauten Inhalt von `dist/` und eine `.nojekyll`-Datei. Unter **Settings → Pages** ist dieser Zweig mit dem Stammordner `/` als Quelle eingestellt. Änderungen auf `main` veröffentlichen sich dadurch nicht automatisch; eine neue Version muss ausdrücklich gebaut und auf `gh-pages` hochgeladen werden.

`deployment/pages-workflow.yml` enthält die vorbereitete, manuell auslösbare Actions-Alternative. Die aktuelle GitHub-Anmeldung darf keine eigenen Workflow-Dateien hochladen. Deshalb liegt die Vorlage außerhalb von `.github/workflows/` und ist inaktiv. Mit passender Berechtigung kann sie später dorthin verschoben und Pages auf „GitHub Actions“ umgestellt werden.

`base: './'` unterstützt den Repository-Unterpfad sowie Root-Hosting. Referenz: [Vite: GitHub Pages](https://vite.dev/guide/static-deploy#github-pages).

## Gestaltung und Grenzen des Prototyps

- Prozedural modellierte, frei stilisierte Marktstraße mit Schwaikheimer Torturm, Fachwerkfassaden, Marktbrunnen, Bäumen und Marktstand; kein maßstabsgetreuer Nachbau. Orientierung: [Marktplatz Winnenden](https://www.winnenden-entdecken.de/attraktion/marktplatz-winnenden-9ac3dda74c).
- Tim basiert auf den drei Fotos aus dem vorherigen Chat: schwarze Brille, Schnurrbart, Beanie, dunkler Schal und marineblauer Mantel. Die privaten Originalfotos werden weder ausgeliefert noch ins Repository kopiert. Eine separate Konzeptillustration war im Chat nicht verfügbar.
- Statische Stadtgeometrie wird nach Material zusammengefasst; Pflaster nutzt Instancing. Pixeldichte ist auf 1,7 begrenzt. Echte Smartphone-Leistung muss noch auf Zielgeräten geprüft werden.
- Feste Spielfeldgrenzen und Brunnen-Kollision; Bänke, Bäume und Passanten sind im ersten Stand durchlaufbar. Kamera kann am Rand Gebäude schneiden. Noch keine komplexe Navigation, echte Physik, Aufnahme echter Dialektstimmen oder Missionen.
- Schriftarten: Barlow Condensed und DM Sans über Google Fonts, mit lokalen System-Fallbacks. Die Spielgeometrie braucht keine externen Modelle oder Texturen. Sprachausgabe kann abhängig vom System einen Sprachdienst nutzen.

## Aufbau

`src/main.js`: Szene, Figuren, Eingaben, Animation und UI. `src/gameplay.js`: Grenzen, Brunnen-Kollision und Punktefunktionen. `src/style.css`: Desktop- und mobile Oberfläche. `src/gameplay.test.js`: Tests der Kernregeln. `deployment/pages-workflow.yml`: inaktive Vorlage für eine spätere manuell auszulösende Bereitstellung.
