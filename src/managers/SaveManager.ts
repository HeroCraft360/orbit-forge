import { ITEMS } from '../config/itemConfig';
import { RECIPES } from '../config/mergeRecipes';
import { SHIP_UPGRADES, shipUpgradeCost } from '../config/shipConfig';
import { STARS } from '../config/starConfig';
export interface Settings {
    master: number;
    effects: number;
    shake: number;
    particles: number;
    damageNumbers: boolean;
}
export interface RunRecord {
    score: number;
    time: number;
    kills: number;
    evolution: number;
}
export interface SaveData {
    saveVersion: 2;
    settings: Settings;
    discoveries: string[];
    recipes: string[];
    mutations: string[];
    unlocked: string[];
    bestScore: number;
    totalRuns: number;
    totalKills: number;
    currency: number;
    daily: Record<string, RunRecord>;
    legacyDaily: Record<string, RunRecord>;
    parts: Record<string, number>;
    collected: Record<string, number>;
    shipUpgrades: Record<string, number>;
    stars: string[];
}
export interface StorageLike {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
}
const defaults = (): SaveData => ({
    saveVersion: 2, settings: { master: .35, effects: .7, shake: .5, particles: 1, damageNumbers: true },
    discoveries: [], recipes: [], mutations: [], unlocked: ['spark'], bestScore: 0, totalRuns: 0, totalKills: 0, currency: 0,
    daily: {}, legacyDaily: {}, parts: {}, collected: {}, shipUpgrades: {}, stars: [],
});
const finite = (v: unknown, fallback = 0): number => typeof v === 'number' && Number.isFinite(v) ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, v)) : fallback;
const count = (v: unknown): number => Math.floor(finite(v));
const list = (v: unknown): string[] => Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === 'string'))] : [];
const records = (value: unknown): Record<string, RunRecord> => {
    const result: Record<string, RunRecord> = {};
    if (!value || typeof value !== 'object')
        return result;
    for (const [date, v] of Object.entries(value).slice(-60)) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !v || typeof v !== 'object')
            continue;
        const r = v as Partial<RunRecord>;
        result[date] = { score: finite(r.score), time: finite(r.time), kills: count(r.kills), evolution: count(r.evolution) };
    }
    return result;
};
export type PurchaseResult = 'purchased' | 'unknown' | 'maxed' | 'locked' | 'insufficient' | 'storage-unavailable';
export class SaveManager {
    static readonly key = 'orbit-forge:save';
    data: SaveData;
    available = true;
    private futureVersion = false;
    constructor(private storage?: StorageLike) {
        this.data = defaults();
        this.available = !!storage;
        this.refresh();
    }
    refresh(): void {
        try {
            const raw = this.storage?.getItem(SaveManager.key);
            if (raw)
                this.data = this.validate(JSON.parse(raw));
        }
        catch {
            this.available = false;
        }
    }
    private validate(value: unknown): SaveData {
        const out = defaults();
        if (!value || typeof value !== 'object')
            return out;
        const x = value as Record<string, unknown>;
        if (finite(x.saveVersion) > 2) {
            this.futureVersion = true;
            this.available = false;
            return out;
        }
        out.discoveries = list(x.discoveries).filter(id => Object.hasOwn(ITEMS, id));
        out.recipes = list(x.recipes).filter(id => RECIPES.some(r => r.id === id));
        out.mutations = list(x.mutations).filter(id => ['void', 'quantum'].includes(id));
        out.stars = list(x.stars).filter(id => Object.hasOwn(STARS, id));
        out.unlocked = [...new Set(['spark', ...list(x.unlocked).filter(id => id === 'tide')])];
        for (const key of ['bestScore', 'totalRuns', 'totalKills', 'currency'] as const)
            out[key] = finite(x[key]);
        const settings = x.settings as Partial<Settings> | undefined;
        if (settings && typeof settings === 'object') {
            for (const key of ['master', 'effects', 'shake', 'particles'] as const)
                out.settings[key] = Math.min(1, finite(settings[key], out.settings[key]));
            if (typeof settings.damageNumbers === 'boolean')
                out.settings.damageNumbers = settings.damageNumbers;
        }
        const old = finite(x.saveVersion) < 2;
        out.daily = old ? {} : records(x.daily);
        out.legacyDaily = records(old ? x.daily : x.legacyDaily);
        // Version one did not record quantities. Never fabricate a balance from discoveries.
        if (!old) {
            const parts = x.parts as Record<string, unknown> | undefined, collected = x.collected as Record<string, unknown> | undefined;
            for (const id of Object.keys(ITEMS)) {
                out.parts[id] = count(parts?.[id]);
                out.collected[id] = Math.max(out.parts[id], count(collected?.[id]));
            }
            const ranks = x.shipUpgrades as Record<string, unknown> | undefined;
            for (const u of SHIP_UPGRADES)
                out.shipUpgrades[u.id] = Math.min(u.maxRank, count(ranks?.[u.id]));
        }
        return out;
    }
    persist(): boolean {
        if (this.futureVersion)
            return false;
        try {
            this.storage?.setItem(SaveManager.key, JSON.stringify(this.data));
            this.available = !!this.storage;
            return this.available;
        }
        catch {
            this.available = false;
            return false;
        }
    }
    discover(id: string): boolean {
        this.refresh();
        if (!Object.hasOwn(ITEMS, id) || this.data.discoveries.includes(id))
            return false;
        this.data.discoveries.push(id);
        this.persist();
        return true;
    }
    collect(id: string, amount = 1): void {
        if (!Object.hasOwn(ITEMS, id) || !Number.isSafeInteger(amount) || amount <= 0)
            return;
        this.refresh();
        this.data.parts[id] = Math.min(Number.MAX_SAFE_INTEGER, (this.data.parts[id] ?? 0) + amount);
        this.data.collected[id] = Math.min(Number.MAX_SAFE_INTEGER, (this.data.collected[id] ?? 0) + amount);
        this.persist();
    }
    recipe(id: string): void { this.refresh(); if (!this.data.recipes.includes(id))
        this.data.recipes.push(id); this.persist(); }
    mutation(id: string): void { this.refresh(); if (!this.data.mutations.includes(id))
        this.data.mutations.push(id); this.persist(); }
    star(id: string): void { this.refresh(); if (Object.hasOwn(STARS, id) && !this.data.stars.includes(id))
        this.data.stars.push(id); this.persist(); }
    canPurchase(id: string): PurchaseResult {
        const u = SHIP_UPGRADES.find(u => u.id === id);
        if (!u)
            return 'unknown';
        const rank = this.data.shipUpgrades[id] ?? 0;
        if (rank >= u.maxRank)
            return 'maxed';
        if (u.requires && !(this.data.shipUpgrades[u.requires] > 0))
            return 'locked';
        if (Object.entries(shipUpgradeCost(u, rank)).some(([part, cost]) => (this.data.parts[part] ?? 0) < cost))
            return 'insufficient';
        return 'purchased';
    }
    purchase(id: string): PurchaseResult {
        this.refresh();
        if (!this.available || this.futureVersion)
            return 'storage-unavailable';
        const status = this.canPurchase(id);
        if (status !== 'purchased')
            return status;
        const u = SHIP_UPGRADES.find(u => u.id === id)!, rank = this.data.shipUpgrades[id] ?? 0;
        const previous = structuredClone(this.data);
        for (const [part, cost] of Object.entries(shipUpgradeCost(u, rank)))
            this.data.parts[part] = (this.data.parts[part] ?? 0) - cost;
        this.data.shipUpgrades[id] = rank + 1;
        if (!this.persist()) {
            this.data = previous;
            return 'storage-unavailable';
        }
        return 'purchased';
    }
    finish(record: RunRecord, extracted: boolean, date?: string): number {
        this.refresh();
        const earned = Math.floor(record.score / (extracted ? 35 : 100));
        this.data.currency += earned;
        this.data.totalRuns++;
        this.data.totalKills += record.kills;
        this.data.bestScore = Math.max(this.data.bestScore, record.score);
        if (extracted && !this.data.unlocked.includes('tide'))
            this.data.unlocked.push('tide');
        if (date && record.score > (this.data.daily[date]?.score ?? -1))
            this.data.daily[date] = record;
        this.persist();
        return earned;
    }
}
let storage: StorageLike | undefined;
try {
    storage = globalThis.localStorage;
}
catch { /* Session-only fallback. */ }
export const saves = new SaveManager(storage);
