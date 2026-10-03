import { saves } from './SaveManager';
export type SoundCue = 'hit' | 'death' | 'pickup' | 'merge' | 'mutation' | 'level' | 'upgrade' | 'portal' | 'extract' | 'boss' | 'collapse' | 'combo';
const notes: Record<SoundCue, [
    number,
    number,
    OscillatorType
]> = {
    hit: [130, .035, 'triangle'], death: [80, .09, 'sine'], pickup: [740, .055, 'sine'],
    merge: [440, .4, 'triangle'], mutation: [880, .6, 'sine'], level: [523, .35, 'sine'],
    upgrade: [660, .18, 'triangle'], portal: [220, .7, 'sine'], extract: [880, .8, 'sine'],
    boss: [55, .8, 'sawtooth'], collapse: [110, .65, 'triangle'], combo: [990, .12, 'sine'],
};
export class AudioManager {
    private context?: AudioContext;
    private last = new Map<SoundCue, number>();
    unlock(): void {
        try {
            this.context ??= new AudioContext();
            void this.context.resume().catch(() => { });
        }
        catch { /* Silent fallback. */ }
    }
    play(cue: SoundCue): void {
        const c = this.context;
        const volume = saves.data.settings.master * saves.data.settings.effects;
        if (!c || c.state !== 'running' || !volume || c.currentTime - (this.last.get(cue) ?? -1) < .065)
            return;
        this.last.set(cue, c.currentTime);
        const [frequency, duration, type] = notes[cue], oscillator = c.createOscillator(), gain = c.createGain();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, c.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * (['merge', 'level', 'extract', 'mutation'].includes(cue) ? 2 : .55), c.currentTime + duration);
        gain.gain.setValueAtTime(volume * .08, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(.001, c.currentTime + duration);
        oscillator.connect(gain);
        gain.connect(c.destination);
        oscillator.start();
        oscillator.stop(c.currentTime + duration);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    }
}
export const audio = new AudioManager();
