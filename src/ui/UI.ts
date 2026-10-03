import { audio } from '../managers/AudioManager';
export const root = document.getElementById('ui')!;
export const number = (v: number): string => Math.floor(v).toLocaleString('en-US');
export const clock = (t: number): string => Math.floor(t / 60).toString().padStart(2, '0') + ':' + Math.floor(t % 60).toString().padStart(2, '0');
export const logo = '<span class="brand-mark">◈</span><span>ORBIT<span class="brand-light">FORGE</span></span>';
export const tag = (text: string): string => '<span class="tag">' + text + '</span>';
export const itemIcon = (id: string, color = '#9df5d6'): string => {
    const glyphs: Record<string, string> = { rock: '⬡', boulder: '⬢', blade: '⟐', shield: '⬡', fire: '◉', magnet: '∩', meteor: '☄', planet: '◎', lightning: 'ϟ', storm: '⊕', cannon: '⏣', bomb: '✹', void: '◌', quantum: '⟡' };
    return '<span class="item-icon" style="color:' + color + '">' + (glyphs[id] ?? '◇') + '</span>';
};
export function screen(html: string): void { root.innerHTML = html; }
export function bind(id: string, action: () => void): void {
    document.getElementById(id)?.addEventListener('click', () => { audio.unlock(); action(); });
}
export function modal(html: string): HTMLElement {
    document.getElementById('modal')?.remove();
    const el = document.createElement('div');
    el.id = 'modal';
    el.className = 'modal-backdrop';
    el.innerHTML = html;
    root.appendChild(el);
    el.querySelector<HTMLButtonElement>('button')?.focus();
    return el;
}
export function closeModal(): void { document.getElementById('modal')?.remove(); }
