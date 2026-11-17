// One phrase object supplies both the visible subtitle and its optional recorded clip.
export const PHRASES = [
  { id: 'heidanei', text: 'Heidanei!' },
  { id: 'sag-amol', text: 'Ja sag amol!' },
  { id: 'hanoi', text: 'Hanoi, doch ned so!' },
  { id: 'gibts-net', text: 'Des gibt’s doch net!' },
  { id: 'oiner', text: 'Du bisch mir oiner!' },
  { id: 'sapperlot', text: 'Sapperlot!' },
  { id: 'brezla', text: 'Mei Brezla! Des koscht extra!' },
  { id: 'hudla', text: 'No net hudla!' },
  { id: 'ordnung', text: 'Do war grad no Ordnung!' },
  { id: 'gruessgott', text: 'Grüß Gott! Auf geht’s!' },
].map(phrase => ({ ...phrase, id: phrase.id.replaceAll(' ', '') }));

export class GameAudio {
  constructor(onStatus = () => {}) {
    this.enabled = false; this.context = null; this.current = null; this.speaking = false;
    this.onStatus = onStatus; this.clips = new Map(); this.voices = [];
    this.loadVoices = () => { this.voices = window.speechSynthesis?.getVoices() || []; };
    this.loadVoices(); window.speechSynthesis?.addEventListener('voiceschanged', this.loadVoices);
    // Empty until approved dialect clips exist: never silently substitute unrelated recordings.
    fetch(`${(import.meta.env?.BASE_URL || './')}audio/manifest.json`).then(r => r.ok ? r.json() : {}).then(manifest => {
      for (const [id, file] of Object.entries(manifest)) this.clips.set(id, file);
    }).catch(() => {});
  }
  unlock() {
    if (!this.enabled) return;
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch { /* Older WebKit keeps its default session. */ }
    const Context = window.AudioContext || window.webkitAudioContext;
    if (Context) {
      this.context ||= new Context();
      if (this.context.state !== 'running') this.context.resume().catch(() => this.onStatus('Ton blockiert · erneut antippen'));
      // Prime an actual buffer on the input event, including mobile Safari.
      const source = this.context.createBufferSource(); source.buffer = this.context.createBuffer(1, 1, this.context.sampleRate);
      source.connect(this.context.destination); source.start();
    }
    window.speechSynthesis?.resume();
  }
  setEnabled(value) { this.enabled = value; if (value) this.unlock(); else this.stop(); }
  stop() {
    this.current?.pause?.(); this.finish?.(); this.current = null; this.speaking = false;
    window.speechSynthesis?.cancel();
  }
  speak(phrase, onStart = () => {}, onEnd = () => {}) {
    if (!this.enabled || this.speaking) return false;
    this.speaking = true;
    let finished = false, began = false;
    const watchdog = setTimeout(() => { if (!began) { this.onStatus('Keine Stimme gestartet · Ton erneut antippen'); window.speechSynthesis?.cancel(); } end(); }, 8000);
    const end = () => { if (finished) return; finished = true; clearTimeout(watchdog); this.current = null; this.speaking = false; this.finish = null; onEnd(); };
    this.finish = end;
    const file = this.clips.get(phrase.id);
    if (file) {
      const clip = new Audio(`${(import.meta.env?.BASE_URL || './')}audio/${file}`); this.current = clip;
      clip.onplaying = () => { began = true; onStart(phrase.text); }; clip.onended = end;
      clip.onerror = () => { this.onStatus('Sprachclip nicht verfügbar'); end(); };
      clip.play().catch(() => { this.onStatus('Stimme blockiert · Ton erneut antippen'); end(); });
    } else if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(phrase.text); this.current = utterance;
      utterance.lang = 'de-DE'; utterance.rate = 1; utterance.pitch = .95;
      const voice = this.voices.find(v => v.lang === 'de-DE' && v.localService) || this.voices.find(v => v.lang.startsWith('de'));
      if (voice) utterance.voice = voice;
      utterance.onstart = () => { this.onStatus('Browserstimme · Dialektclips folgen'); began = true; onStart(phrase.text); };
      utterance.onend = end;
      utterance.onerror = event => { if (!['canceled', 'interrupted'].includes(event.error)) this.onStatus('Stimme nicht verfügbar · Sprüche als Text'); end(); };
      // Keep the utterance referenced until completion (important on WebKit).
      window.speechSynthesis.speak(utterance);
    } else { this.onStatus('Sprüche als Text · keine Systemstimme'); end(); return false; }
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
