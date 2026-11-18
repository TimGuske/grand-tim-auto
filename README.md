# Grand Tim Altstadt — Winnenden Unleashed

Ein kleiner, endloser 3D-Comic-Spielplatz mit Vite und Three.js. Spielbare Version 0.4.0: https://timguske.github.io/grand-tim-auto/ .

## Stand 0.4.0

Freigegebener Marktplatz ohne Missionen: vier kostenlose Passantenmodelle, rechter Faustschlag nur für Personen und rechter Fußtritt nur für Gegenstände, zwei zufällige Comic-Flugreaktionen, dauerhaftes Chaos mit aufräumendem Hausmeister, 51 eingesprochene Sprüche in zwei Comic-Stimmen, Musikmemo als leise Schleife und deutlicher Aperol-Alarm. Bei leerem Tank schleicht Tim in der freigegebenen erschöpften Haltung. Gebäude- und Gegenstandskollisionen sowie Touch-Bedienung sind überarbeitet. Keine Autos und kein Backend.

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

## Spielen (0.3)

- WASD / Pfeile oder Touch-Joystick: laufen. Ohne Sprintknopf.
- Leertaste / SCHLAG: rechte Gerade mit Deckung, Körperdrehung und Rückzug. Treffer bei 0,39 Sekunden; Bewegungsdauer rund 0,88 Sekunden. Originalhand bleibt erhalten.
- E / STAMPFER: springen und Comic-Druckwelle auslösen.
- F / APEROL NACHTANKEN: am orangefarbenen Spritz-Stand links am Platz Energie auffüllen. Die Leiste leert sich in 200 aktiven Sekunden. Unter 25 % sinkt das Lauftempo allmählich von 6,1 auf mindestens 3,4. Pause verbraucht keine Energie.
- Freie Spielfläche ziehen: Kamera drehen. Escape / Pause: pausieren.
- Mit Ton starten: geschnittene schwäbische Aufnahmen, tiefe Männerstimme und frechere Frauenstimme. Keine System-Sprachausgabe.
- Vollbild: Fullscreen-API; auf iPhone alternativ über „Zum Home-Bildschirm“ öffnen.

Sechs Fußgänger und drei stehende Gesprächspaare verwenden zwei Cartoon-Modelle von Canino3d mit Kleidungsfarbvarianten
und individueller Gehphase. Download und Lizenz: [CREDITS.md](CREDITS.md); die
Credits sind auch im Startbildschirm verlinkt. 16 umwerfbare Marktgegenstände,
Comic-Knockback und Kettenreaktionen bleiben enthalten. Punkte und Energie leben
nur im Arbeitsspeicher und werden beim Neuladen zurückgesetzt.

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
- Feste Spielfeldgrenzen und Brunnen-Kollision; Bänke, Bäume und Passanten sind im ersten Stand durchlaufbar. Kamera kann am Rand Gebäude schneiden. Noch keine komplexe Navigation, vollständige Starrkörperphysik oder Missionen.
- Schriftarten: Barlow Condensed und DM Sans über Google Fonts, mit lokalen System-Fallbacks. Figurenmodelle, Texturen und Sprachclips werden mit dem Spiel ausgeliefert.

## Aufbau

`src/main.js`: Szene, Eingaben, Animation und UI. `src/characters.js`: artikulierte Comic-Figuren. `src/props.js`: umwerfbare Gegenstände und Kettenreaktionen. `src/audio.js`: gemeinsame Text-/Audio-Phrasen, mobile Aktivierung und Audio-Fehlerbehandlung. `src/gameplay.js`: Grenzen, Brunnen-Kollision und Punktefunktionen. `src/style.css`: Desktop- und mobile Oberfläche. `src/gameplay.test.js`: Tests der Kernregeln. `deployment/pages-workflow.yml`: inaktive Vorlage für eine spätere manuell auszulösende Bereitstellung.

## Stimmen und Text-Synchronisierung

Eine einzige Phrase-ID liefert Sprechblase und gesprochene Zeile. Es spricht nur eine Figur gleichzeitig; der nächste Treffer bricht einen laufenden Satz nicht ab. Fehlende Stimmen oder blockierte Wiedergabe werden als Status angezeigt. Ein Watchdog gibt den Dialog nach acht Sekunden wieder frei.

`public/audio/manifest.json` enthält neun von Tim eingesprochene schwäbische Sprüche in je zwei freigegebenen Comicstimmen. Männliche Figuren inklusive Tim verwenden die tiefe Stimme; weibliche Figuren die höhere, frechere Variante. Beide sind um 12 % beschleunigt. Die Originalaufnahmen bleiben lokal im ignorierten `work/`; nur 18 zugeschnittene, bearbeitete MP3-Clips (zusammen rund 400 kB) werden ausgeliefert. Es gibt keine Browser-Computerstimme mehr. Die Clips werden vorgeladen und über den beim Start-Tippen aktivierten AudioContext abgespielt. Bei fehlenden Clips bleibt die Sprechblase sichtbar.

Die zwölf Tests decken Kernregeln, Stimme je Figur, synchronen Dialog, Dialogende/Pause, Abbruch beim Laden, fehlende Clips, die Vollständigkeit beider Stimmen sowie Gegenstandsflug und Rücksetzen ab. Echtes Multitouch und hörbare Wiedergabe auf iPhone/Android stehen weiterhin zur Prüfung aus.

## Detaillierter Tim (lokaler Stand)

Das Spiel lädt die freigegebene Tim-Figur aus `public/models/tim-v4.glb`. `src/tim-model.js` ergänzt Gelenke und weiche Gewichte für Laufen und Aktionen, ohne die freigegebenen Gesichtsmerkmale zu ändern. Der Kopf besitzt keine Brillengläser; die vorhandenen Augen bleiben erhalten. Die bisherige Figur dient bei Ladefehlern als Ersatz. NPCs verwenden weiterhin die prozeduralen Modelle. `figuren.html` zeigt die separate Figurenprobe.

Die Modelle und Texturen werden mit der Website ausgeliefert, ohne externen Modellservice. Die vierzehn Tests prüfen zusätzlich Gelenkgewichte und unveränderte Ruhepose. Dieser Stand ist noch nicht veröffentlicht.

## Faustschlag und Passanten (lokaler Stand)

Leertaste beziehungsweise SCHLAG löst Tims rechten Faustschlag aus und trifft ausschließlich Passanten. X beziehungsweise TRITT ersetzt den Stampfer: Tim hebt das rechte Knie, tritt niedrig nach vorne und zieht das Bein zurück; der linke Fuß bleibt stehen. Nur dieser Tritt kippt Gegenstände um. Treffer entstehen in der Kontaktphase und nur vor Tim. Es gibt keinen Sprung und keine Flächenwirkung. Getretene Gegenstände können weitere Gegenstände umwerfen; sie schlagen keine Passanten um.

Zwölf Passanten verwenden sechs frei nutzbare CC0-Modelle von Quaternius (drei Männer, drei Frauen), mit geklonten Skeletten und Idle-/Walk-/Jump-Animationen. Die passenden Comicstimmen bleiben zugeordnet. Herkunft und Lizenz stehen in CREDITS.md und public/models/people/LICENSE.txt. 17 automatisierte Tests prüfen jetzt auch Schlagrichtung, Animationsphase und die Modell-/Animationsdateien. Dieser Stand ist noch nicht veröffentlicht.

Aktuelle Korrektur: Nur der rechte Arm schlägt; Tim behält seine Originalhand ohne zusätzliches Faustmodell. Der Treffer liegt auf oberer Schulterhöhe. Die Schuhe aller NPCs sind neu gewichtet und bleiben beim Gehen formstabil. 19 Tests prüfen unter anderem die Schuhform über mehrere Gehphasen.

### Hintergrundmusik und Tastatur (aktueller lokaler Stand)

Leertaste: Schlag; X: rechter Fußtritt; WASD/Pfeile: Laufen; F: Aperol. Als Hintergrundmusik dient das von Tim bereitgestellte neue Memo „Nelkenweg 2“ (18. November 2026), als bearbeitete Stereo-MP3. Schleifenlänge 65,62 Sekunden, Fade-in 1,5 Sekunden, Fade-out 2 Sekunden. Leiser Musikpegel, bei Sprache zusätzlich um rund 13 dB abgesenkt. Die Aufnahme ersetzt die generierte Synthwave-Musik. Pause, Ton aus und Musik aus stoppen die Schleife; ein verspäteter Ladevorgang startet keine Musik nach dem Pausieren.

### Gegenstände und Aperol-Alarm

Stehende Kisten, Töpfe, Fässer, Stühle und Tafeln blockieren Tim und Passanten. Beim Umkippen wird der Weg frei; nach dem Aufräumen blockieren sie wieder. Nahe umkickbare Gegenstände haben einen dezenten Bodenring, der nächste Gegenstand im Trittbereich wird deutlicher markiert. Unter 25 % Aperol-Energie gibt es eine visuelle Warnung und einmalig einen kurzen Dreiklang. Er wartet laufende Sprache ab, respektiert Ton aus/Pause und wird nach dem Nachtanken erneut bereit.

### Comic-Flug und sichtbare Ziele

Fausttreffer schicken Passanten wild rotierend nach oben aus dem Bild; nach zufällig 4–12 Sekunden tauchen sie an einer freien Stelle mit Abstand zu Tim wieder auf. Gegenstandsringe pulsieren mit einer auslaufenden Ringwelle. Unter 25 % Energie schwebt ein großer animierter orangefarbener Pfeil über dem Spritz-Stand; nach dem Nachtanken verschwindet er. Am Tor sind ein größerer WINNENDEN-Schriftzug und das Winnendener Stadtwappen angebracht.

### Unterschiedliche Trefferreaktionen

Passanten erhalten zufällig eine von zwei Reaktionen: ein flacher, etwa 3,2–3,7 Sekunden langer Flug quer über den Platz und über eine Häuserzeile oder ein niedriger Flug gegen eine tatsächliche Hausfassade mit kurzem Aufprall, anschließendem Herunterfallen und einer kurzen Pause am Boden. Erst dann verschwinden sie und kehren nach 4–12 Sekunden an einer freien Stelle zurück. Die Drehung erfolgt um die Körpermitte.

### Erschöpfung bei leerem Aperol-Tank

Unter 25 % erscheint eine große orange Warnkarte mit konkreter Aufforderung zum Nachtanken; der Pfeil über dem Stand bleibt sichtbar. Die Laufgeschwindigkeit sinkt von 6,1 auf 0,85 Einheiten/s, also bei 0 % auf etwa ein Siebtel. Unter 10 % wird Tim zunehmend gebeugt; bei 0 % verwendet er die von Tim freigegebene erschöpfte Haltung mit gesenktem Kopf, eng hängenden Armen und kurzen Schritten. Nach dem Nachtanken ist Haltung und Geschwindigkeit sofort wieder normal. Schlagen beim Gehen umgeht die Verlangsamung nicht.
