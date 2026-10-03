import { modal, bind, closeModal, number } from './UI';
export class ExtractionPanel {
    static show(score: number, risk: number, choose: (extract: boolean) => void): void {
        modal('<section class="dialog extract-dialog"><span class="eyebrow">A WINDOW THROUGH THE NOISE</span><div class="portal-icon">◎</div><h2>Take it home.<br>Or take it <em>further.</em></h2><p>Your discoveries are already safe. Extract to bank <strong>' + number(score / 35) + ' stardust</strong> and unlock the Tide Core.</p><div class="risk-preview"><span>IF YOU STAY</span><strong>Risk ×' + risk * 2 + '</strong><small>Enemy health +25% · more bosses · improved salvage</small></div><div class="button-row"><button class="primary" id="extract">EXTRACT ↗</button><button class="secondary" id="stay">STAY & ESCALATE</button></div></section>');
        bind('extract', () => { closeModal(); choose(true); });
        bind('stay', () => { closeModal(); choose(false); });
    }
}
