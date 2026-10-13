/**
 * "Nasıl algılanır" ekranındaki örnekler — güven puanının JS ikiziyle CANLI hesaplanır
 * (kullanıcının açılış biçimi, bekleme süresi ve vakit kapısı ayarıyla). Metin
 * sabit yazılsaydı ayar değişince yalan söylerdi; burada kural tek kaynaktan gelir.
 */
import type { CamideyimAyarlari } from './camideyimAyarlari';
import { acilisBiciminiUygula, guvenPuaniniHesapla, type GuvenKarari, type GuvenSiniflari } from './guvenPuani';

export interface GuvenOrnegi {
    id: string;
    ikon: string;
    baslik: string;
    eylem: GuvenKarari;
    /** Vakit kapısı dışında konum bile ölçülmez → ayrı açıklama. */
    olculmez?: boolean;
}

interface Tanim {
    id: string;
    ikon: string;
    baslik: string;
    siniflar: GuvenSiniflari;
    dogrulukM: number;
    vakitDisi?: boolean;
}

const TANIMLAR: readonly Tanim[] = [
    { id: 'ezan', ikon: 'mosque', baslik: 'Ezan vaktinde caminin içinde', siniflar: { zaman: 'ezanYakin', yer: 'poligonIci', hareket: 'durgun' }, dogrulukM: 8 },
    { id: 'cuma', ikon: 'users', baslik: 'Cuma namazında', siniflar: { zaman: 'cuma', yer: 'poligonIci', hareket: 'bilinmiyor' }, dogrulukM: 15 },
    { id: 'trafik', ikon: 'car', baslik: 'Trafikte caminin önünde beklemek', siniflar: { zaman: 'ezanYakin', yer: 'tampon', hareket: 'durgun' }, dogrulukM: 6 },
    { id: 'gecis', ikon: 'walking', baslik: 'Önünden yürüyerek geçmek', siniflar: { zaman: 'ezanYakin', yer: 'tampon', hareket: 'hareketli' }, dogrulukM: 12 },
    { id: 'kafe', ikon: 'coffee', baslik: 'Hemen yanındaki kafede oturmak', siniflar: { zaman: 'kapiIci', yer: 'tampon', hareket: 'durgun' }, dogrulukM: 9 },
    {
        id: 'vakitDisi',
        ikon: 'clock',
        baslik: 'Vakit dışında uğramak',
        siniflar: { zaman: 'serbest', yer: 'poligonIci', hareket: 'durgun' },
        dogrulukM: 8,
        vakitDisi: true,
    },
];

export function guvenOrnekleriOlustur(a: Pick<CamideyimAyarlari, 'acilisBicimi' | 'beklemeDk' | 'vakitKapisi'>): GuvenOrnegi[] {
    return TANIMLAR.map((t) => {
        if (t.vakitDisi && a.vakitKapisi) return { id: t.id, ikon: t.ikon, baslik: t.baslik, eylem: 'hicbir', olculmez: true };
        const g = guvenPuaniniHesapla(t.siniflar, t.dogrulukM, a.beklemeDk);
        return { id: t.id, ikon: t.ikon, baslik: t.baslik, eylem: acilisBiciminiUygula(g.karar, a.acilisBicimi) };
    });
}

export const EYLEM_METNI: Readonly<Record<GuvenKarari, string>> = {
    otomatik: 'Kendiliğinden açılır',
    sor: 'Size sorulur',
    hicbir: 'Hiçbir şey olmaz',
};
