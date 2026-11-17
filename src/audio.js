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
];
const base = import.meta.env?.BASE_URL || './';

export class GameAudio {
  constructor(onStatus = () => {}) {
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
      if (this.context.state !== 'running') this.context.resume().catch(() => this.onStatus('Ton blockiert · erneut antippen'));
      // Prime a buffer directly during the touch event, including mobile Safari.
      const source = this.context.createBufferSource(); source.buffer = this.context.createBuffer(1, 1, this.context.sampleRate);
      source.connect(this.context.destination); source.start();
    }
  }
  setEnabled(value) { this.enabled = value; if (value) this.unlock(); else this.stop(); }
  stop() {
    const current = this.current;
    this.finish?.();
    current?.stop();
  }
  speak(phrase, onStart = () => {}, onEnd = () => {}, voice = 'male') {
    if (!this.enabled || this.speaking || !this.context) return false;
    this.speaking = true;
    let finished = false;
    const end = () => {
      if (finished) return;
      finished = true; clearTimeout(watchdog);
      const current = this.current;
      this.current = null; this.speaking = false; this.finish = null;
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
  effect(type = 'bump') {
    if (!this.enabled || !this.context || this.context.state === 'closed') return;
    const now = this.context.currentTime, osc = this.context.createOscillator(), gain = this.context.createGain();
    const low = type === 'stomp' ? 75 : type === 'wood' ? 125 : 230;
    osc.type = type === 'wood' ? 'square' : 'triangle';
    osc.frequency.setValueAtTime(low, now); osc.frequency.exponentialRampToValueAtTime(low * 2.2, now + .045);
    osc.frequency.exponentialRampToValueAtTime(45, now + .25);
    gain.gain.setValueAtTime(.075, now); gain.gain.exponentialRampToValueAtTime(.001, now + .3);
    osc.connect(gain).connect(this.context.destination); osc.start(); osc.stop(now + .31);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  }
}
