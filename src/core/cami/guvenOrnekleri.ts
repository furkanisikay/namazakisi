/**
 * "Nasıl algılanır" ekranındaki örnekler — güven puanının JS ikiziyle CANLI hesaplanır
 * (kullanıcının açılış biçimi, bekleme süresi ve vakit kapısı ayarıyla). Metin
 * sabit yazılsaydı ayar değişince yalan söylerdi; burada kural tek kaynaktan gelir.
 */
import type { CamideyimAyarlari } from './camideyimAyarlari';
import { acilisBiciminiUygula, guvenPuaniniHesapla, type GuvenKarari, type GuvenSiniflari } from './guvenPuani';
import { canli, metin } from '../dil/aktifDil';
import type { Sozluk } from '../dil/sozluk/tr';

export interface GuvenOrnegi {
    id: string;
    ikon: string;
    baslik: string;
    eylem: GuvenKarari;
    /** Vakit kapısı dışında konum bile ölçülmez → ayrı açıklama. */
    olculmez?: boolean;
}

type OrnekKimligi = keyof Sozluk['cami']['ornek'];

interface Tanim {
    id: OrnekKimligi;
    ikon: string;
    siniflar: GuvenSiniflari;
    dogrulukM: number;
    vakitDisi?: boolean;
}

const TANIMLAR: readonly Tanim[] = [
    { id: 'ezan', ikon: 'mosque', siniflar: { zaman: 'ezanYakin', yer: 'poligonIci', hareket: 'durgun' }, dogrulukM: 8 },
    { id: 'cuma', ikon: 'users', siniflar: { zaman: 'cuma', yer: 'poligonIci', hareket: 'bilinmiyor' }, dogrulukM: 15 },
    { id: 'trafik', ikon: 'car', siniflar: { zaman: 'ezanYakin', yer: 'tampon', hareket: 'durgun' }, dogrulukM: 6 },
    { id: 'gecis', ikon: 'walking', siniflar: { zaman: 'ezanYakin', yer: 'tampon', hareket: 'hareketli' }, dogrulukM: 12 },
    { id: 'kafe', ikon: 'coffee', siniflar: { zaman: 'kapiIci', yer: 'tampon', hareket: 'durgun' }, dogrulukM: 9 },
    {
        id: 'vakitDisi',
        ikon: 'clock',
        siniflar: { zaman: 'serbest', yer: 'poligonIci', hareket: 'durgun' },
        dogrulukM: 8,
        vakitDisi: true,
    },
];

export function guvenOrnekleriOlustur(a: Pick<CamideyimAyarlari, 'acilisBicimi' | 'beklemeDk' | 'vakitKapisi'>): GuvenOrnegi[] {
    const basliklar = metin().cami.ornek;
    return TANIMLAR.map((t) => {
        const baslik = basliklar[t.id];
        if (t.vakitDisi && a.vakitKapisi) return { id: t.id, ikon: t.ikon, baslik, eylem: 'hicbir', olculmez: true };
        const g = guvenPuaniniHesapla(t.siniflar, t.dogrulukM, a.beklemeDk);
        return { id: t.id, ikon: t.ikon, baslik, eylem: acilisBiciminiUygula(g.karar, a.acilisBicimi) };
    });
}

export const EYLEM_METNI: Readonly<Record<GuvenKarari, string>> = canli((s) => s.cami.eylem);
