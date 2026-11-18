import { LoopMusic } from './music.js';
// Each recorded phrase supplies both the visible text and its male/female clip.
export const PHRASES = [
  { id: 'spruch-01', text: 'Ha sag a mol!' },
  { id: 'spruch-02', text: 'Du Grasdaggl!' },
  { id: 'spruch-03', text: 'Asobaba!' },
  { id: 'spruch-04', text: 'Desch zwenig Mehl!' },
  { id: 'spruch-05', text: 'Uffs Maul, sag i dir!' },
  { id: 'spruch-06', text: 'Langsam, Kerle!' },
  { id: 'spruch-07', text: 'Zeig dir glei, wo der Bartell dr Moschd holt!' },
  { id: 'spruch-08', text: 'Sag a mol!' },
  { id: 'spruch-09', text: 'Ha neu!' },
  {"id": "spruch-10", "text": "Du bisch ja net ganz dicht!"},
  {"id": "spruch-11", "text": "Hasch du sie noch alle?"},
  {"id": "spruch-12", "text": "Himmelherrgottsakrament!"},
  {"id": "spruch-13", "text": "Du blöder Seggl!"},
  {"id": "spruch-14", "text": "Ja leck mich am Arsch!"},
  {"id": "spruch-15", "text": "I glaub, es hackt!"},
  {"id": "spruch-16", "text": "Du hasch doch einen Schuss!"},
  {"id": "spruch-17", "text": "Mach dich vom Acker!"},
  {"id": "spruch-18", "text": "Du elender Grasdaggl!"},
  {"id": "spruch-19", "text": "Was bisch denn du für einer?"},
  {"id": "spruch-20", "text": "Des gibt a Anzeige!"},
  {"id": "spruch-21", "text": "Du, i kenn dei Mutter!"},
  {"id": "spruch-22", "text": "Des sag i dem Bürgermeister!"},
  {"id": "spruch-23", "text": "Du kommsch au noch in die Hölle!"},
  {"id": "spruch-24", "text": "I hau dir glei einen Satz warme Ohren!"},
  {"id": "spruch-25", "text": "Kerle, was stimmt denn mit dir?"},
  {"id": "spruch-26", "text": "Dich hot mer zu heiß badet!"},
  {"id": "spruch-27", "text": "Mei schöne Sonntagshose!"},
  {"id": "spruch-28", "text": "Jetzt isch mei Brill hie!"},
  {"id": "spruch-29", "text": "Sapperlot!"},
  {"id": "spruch-30", "text": "Desch zwenig Mehl!"},
  {"id": "spruch-31", "text": "Asobaba!"},
  {"id": "spruch-32", "text": "Oh, mei Bandscheib!"},
  {"id": "spruch-33", "text": "I bin bloß zum Bäcker ganga!"},
  {"id": "spruch-34", "text": "Jetzt isch mei Fleischkäsweck weg!"},
  {"id": "spruch-35", "text": "I will doch bloß a Eis essa!"},
  {"id": "spruch-36", "text": "Mei Maultasche!"},
  {"id": "spruch-37", "text": "Und wer zahlt des jetzt?"},
  {"id": "spruch-38", "text": "Des zieh i dir vom Erbe ab!"},
  {"id": "spruch-39", "text": "I hab doch gar nix gmacht!"},
  {"id": "spruch-40", "text": "Net ins Gsicht, du Seggl!"},
  {"id": "spruch-41", "text": "Jetzt brauch i einen Schnaps!"},
  {"id": "spruch-42", "text": "I bin doch schon in Rente!"},
  {"id": "spruch-43", "text": "Früher hat’s so was net geba!"},
  {"id": "spruch-44", "text": "Mir sind hier net in Berlin, fei!"},
  {"id": "spruch-45", "text": "I glaub, mei Schwein pfeift!"},
  {"id": "spruch-46", "text": "Leck fett!"},
  {"id": "spruch-47", "text": "Hot des weh do!"},
  {"id": "spruch-48", "text": "Ha noi, net schon wieder!"},
  {"id": "spruch-49", "text": "I hab doch heut Kehrwoch!"},
  {"id": "spruch-50", "text": "Des war mei gute Hüfte!"},
  {"id": "spruch-51", "text": "I glaub, i lieg im Brunnen!"},
];
const base = import.meta.env?.BASE_URL || './';

export class GameAudio {
  constructor(onStatus = () => {}) {
    this.musicEnabled=true;this.playing=false;this.music=null;
    this.alarmSources=new Set();
    this.enabled = false; this.context = null; this.current = null; this.speaking = false;
    this.onStatus = onStatus; this.clips = new Map(); this.buffers = new Map();
    // Fetch the small clips early. Decode after the first touch creates the audio context.
    this.ready = fetch(`${base}audio/manifest.json`).then(r => {
      if (!r.ok) throw new Error('manifest');
      return r.json();
    }).then(manifest => {
      for (const [id, voices] of Object.entries(manifest)) {
        this.clips.set(id, Object.fromEntries(Object.entries(voices).map(([voice, file]) => {
          const bytes = fetch(`${base}audio/${file}`).then(r => {
            if (!r.ok) throw new Error('clip');
            return r.arrayBuffer();
          }).catch(() => null);
          return [voice, bytes];
        })));
      }
    }).catch(() => this.onStatus('Sprachclips nicht geladen · bitte neu laden'));
  }
  unlock() {
    if (!this.enabled) return;
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch { /* Older WebKit. */ }
    const Context = window.AudioContext || window.webkitAudioContext;
    if (Context) {
      this.context ||= new Context();
      this.music ||= new LoopMusic(this.context,()=>this.onStatus('Hintergrundmusik nicht geladen · bitte neu laden'));this.syncMusic();
      if (this.context.state !== 'running') this.context.resume().catch(() => this.onStatus('Ton blockiert · erneut antippen'));
      // Prime a buffer directly during the touch event, including mobile Safari.
      const source = this.context.createBufferSource(); source.buffer = this.context.createBuffer(1, 1, this.context.sampleRate);
      source.connect(this.context.destination); source.start();
    }
  }
  syncMusic(){if(this.enabled&&this.musicEnabled&&this.playing)this.music?.start();else this.music?.stop();}
  setPlaying(value){this.playing=value;this.syncMusic();}
  setMusicEnabled(value){this.musicEnabled=value;this.syncMusic();}
  setEnabled(value) { this.enabled = value; if (value) this.unlock(); else this.stop();this.syncMusic(); }
  stopAlarm(){for(const source of this.alarmSources){source.stop();source.disconnect();}this.alarmSources.clear();}
  stop() {
    this.stopAlarm();
    const current = this.current;
    this.finish?.();
    current?.stop();
  }
  speak(phrase, onStart = () => {}, onEnd = () => {}, voice = 'male') {
    if (!this.enabled || this.speaking || !this.context) return false;
    this.stopAlarm();this.speaking = true;this.music?.duck(true);
    let finished = false;
    const end = () => {
      if (finished) return;
      finished = true; clearTimeout(watchdog);
      const current = this.current;
      this.current = null; this.speaking = false; this.finish = null;this.music?.duck(false);
      current?.disconnect(); onEnd();
    };
    const watchdog = setTimeout(() => {
      if (finished) return;
      this.onStatus('Ton blockiert · erneut antippen');
      this.stop();
    }, 8000);
    this.finish = end;
    const play = async () => {
      await this.ready;
      if (finished) return;
      const key = `${phrase.id}:${voice}`;
      let buffer = this.buffers.get(key);
      if (!buffer) {
        const bytes = await this.clips.get(phrase.id)?.[voice];
        if (finished) return;
        if (!bytes) throw new Error('clip');
        buffer = await this.context.decodeAudioData(bytes.slice(0));
        this.buffers.set(key, buffer);
      }
      if (finished || !this.enabled) return;
      if (this.context.state !== 'running') await this.context.resume();
      if (finished) return;
      const source = this.context.createBufferSource(); source.buffer = buffer;
      source.connect(this.context.destination); source.onended = end; this.current = source;
      source.start(); onStart(phrase.text);
      this.onStatus('Schwäbische Comicstimmen');
    };
    play().catch(() => {
      if (finished) return;
      this.onStatus('Sprachclip nicht verfügbar · bitte neu laden'); end();
    });
    return true;
  }
  aperolAlarm(){
    if(!this.enabled||!this.context||this.context.state!=='running'||this.speaking)return;
    const c=this.context,now=c.currentTime;
    for(const [i,frequency] of [659.25,880,987.77].entries()){
      const source=c.createOscillator(),gain=c.createGain(),time=now+i*.18;
      source.type='sine';source.frequency.value=frequency;
      gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(.06,time+.015);
      gain.gain.exponentialRampToValueAtTime(.001,time+.15);
      source.connect(gain).connect(c.destination);this.alarmSources.add(source);
      source.onended=()=>{this.alarmSources.delete(source);source.disconnect();gain.disconnect();};
      source.start(time);source.stop(time+.16);
    }
  }
  effect(type = 'bump') {
    if (!this.enabled || !this.context || this.context.state === 'closed') return;
    const now = this.context.currentTime, osc = this.context.createOscillator(), gain = this.context.createGain();
    const low = type === 'stomp' ? 75 : (type === 'wood' || type === 'kick') ? 125 : 230;
    osc.type = type === 'wood' ? 'square' : 'triangle';
    osc.frequency.setValueAtTime(low, now); osc.frequency.exponentialRampToValueAtTime(low * 2.2, now + .045);
    osc.frequency.exponentialRampToValueAtTime(45, now + .25);
    gain.gain.setValueAtTime(.075, now); gain.gain.exponentialRampToValueAtTime(.001, now + .3);
    osc.connect(gain).connect(this.context.destination); osc.start(); osc.stop(now + .31);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  }
}
