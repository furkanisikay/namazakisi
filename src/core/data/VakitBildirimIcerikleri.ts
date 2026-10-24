/**
 * Vakit Bildirim İçerikleri
 * Namaz vakti GİRDİĞİNDE gösterilecek teşvik edici ayet ve hadisler.
 *
 * KURALLAR (persona çalışması 2026-10-19 + AGENTS.md fıkıh kuralı):
 * • Vakit DAHA YENİ GİRDİ: ortada terk de gecikme de yok. "Terk eden… ameli boşa"
 *   ve "münafıklara en ağır gelen" gibi suçlayıcı nasslar bu kişiye YANLIŞ
 *   HEDEFTİR (namaza yeni başlayanı caydırıyordu) → havuza GİRMEZ. Ton TEŞVİK.
 * • Künye yalnız "Hadis-i Şerif" olamaz: kitap adı gerekir. Doğrulanmış künye
 *   `SeytanlaMucadeleIcerigi.ts` ile ortaktır (aynı nass iki havuzda aynı künye).
 *   Doğrulanamayan maddeler ÇIKARILDI (yanlış oldukları değil, künyeleri
 *   doğrulanamadığı için): "Kim öğle namazını devamlı kılarsa… Cehennem ateşini
 *   haram kılar" (bilinen rivayet öğlenin SÜNNETLERİ hakkındadır), "Melekler
 *   ikindi vakti toplanır…", "Namaz dinin direğidir".
 * • Vakte özgü nass yalnız kendi vaktinin listesinde.
 * Nöbetçi: `__tests__/VakitBildirimIcerikleri.test.ts` (yasaklı ifade + künye).
 */

import { aktifDil, canli } from '../dil/aktifDil';
import type { Sozluk } from '../dil/sozluk/tr';
import { ayetMeali, hadisGosterilir } from '../icerik/nassDili';

export type VakitBildirimIcerigi = {
    metin: string;
    kaynak?: string;
};

// Vakit tipleri (Güneş hariç)
export type VakitBildirimTipi = 'imsak' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi';

/**
 * Havuz öğesi. Hadis yalnız `HADIS_DILLERI`'nde; ayet Türkçede kendi metniyle, diğer dillerde
 * QuranEnc mealiyle (yoksa o dilde çıkmaz); söz sözlükten. `yalnizCeviri`: Türkçe havuzda
 * yer almayan, yalnız çeviri dillerinde hadislerin boşalttığı yeri dolduran ayet.
 */
type HavuzOgesi =
    | { tur: 'hadis'; metin: string; kaynak: string }
    | { tur: 'ayet'; ref: string; metin: string; kaynak: string }
    | { tur: 'ayet'; ref: string; yalnizCeviri: true }
    | { tur: 'soz'; id: keyof Sozluk['icerik']['vakitGirdi'] };

const BERDEYN: HavuzOgesi = {
    tur: 'hadis',
    metin: 'İki serinliği — sabahı ve ikindiyi — kılan cennete girer.',
    kaynak: "Buhârî, Mevâkîtü's-salât 26; Müslim, Mesâcid 215",
};

/** Hûd 114: gündüzün iki ucu ve gecenin ilk saatleri (sabah, akşam, yatsı). */
const HUD_114: HavuzOgesi = { tur: 'ayet', ref: '11:114', yalnizCeviri: true };

const HAVUZ: Record<VakitBildirimTipi, HavuzOgesi[]> = {
    imsak: [
        { tur: 'hadis', metin: "Sabah namazını kılan, Allah'ın koruması altındadır.", kaynak: 'Müslim, Mesâcid 262' },
        { tur: 'hadis', metin: "Sizi gece ve gündüz ardarda takip eden melekler vardır. Sabah ve İkindi namazında toplanırlar.", kaynak: "Hadis-i Şerif (Buhari)" },
        BERDEYN,
        { tur: 'hadis', metin: "Sabah namazının iki rekat sünneti, dünyadan ve dünyadaki her şeyden daha hayırlıdır.", kaynak: "Hadis-i Şerif (Müslim)" },
        { tur: 'soz', id: 'uykudan' },
        HUD_114,
    ],
    ogle: [
        { tur: 'ayet', ref: '2:153', metin: "Ey iman edenler! Sabır ve namaz ile Allah'tan yardım isteyin.", kaynak: "Bakara Suresi, 153. Ayet" },
        { tur: 'ayet', ref: '4:103', metin: "Namazı dosdoğru kılın. Çünkü namaz, müminler üzerine vakitleri belirli bir farzdır.", kaynak: "Nisa Suresi, 103. Ayet" },
        { tur: 'hadis', metin: "Gök kapıları öğle vaktinde açılır. O saatte hayırlı bir amelimin yükselmesini isterim.", kaynak: "Hadis-i Şerif (Tirmizi)" },
        { tur: 'soz', id: 'araVer' },
    ],
    ikindi: [
        { tur: 'ayet', ref: '2:238', metin: "Orta namaza (ikindi namazına) ve diğer namazlara devam edin.", kaynak: "Bakara Suresi, 238. Ayet" },
        BERDEYN,
        { tur: 'soz', id: 'yorgunluk' },
    ],
    aksam: [
        { tur: 'soz', id: 'sukur' },
        { tur: 'hadis', metin: "Kıyamet günü kulun ilk hesaba çekileceği şey namazdır.", kaynak: "Hadis-i Şerif (Tirmizi)" },
        // Eskiden "Vakit girmeden hazır ol" diyordu — vakit girdikten SONRA gönderiliyordu.
        { tur: 'soz', id: 'aksamKisa' },
        { tur: 'ayet', ref: '29:45', metin: "Allah'ı anmak, elbette en büyük ibadettir.", kaynak: "Ankebut Suresi, 45. Ayet" },
        HUD_114,
    ],
    yatsi: [
        { tur: 'hadis', metin: "Yatsı namazını cemaatle kılan kimse, gecenin yarısını ihya etmiş gibidir.", kaynak: "Hadis-i Şerif (Müslim)" },
        { tur: 'soz', id: 'geceKaranligi' },
        // İngilizce meal bir sonraki ayete bağlanır ("… they rely -"); kesilemeyeceği için çeviride çıkmaz.
        { tur: 'ayet', ref: '8:2', metin: "İman edenler ancak o kimselerdir ki, Allah anıldığı zaman kalpleri ürperir.", kaynak: "Enfal Suresi, 2. Ayet" },
        { tur: 'soz', id: 'davet' },
        HUD_114,
    ],
};

/** Bir öğenin etkin dildeki hâli; o dilde gösterilemiyorsa `null`. */
function coz(o: HavuzOgesi, s: Sozluk): VakitBildirimIcerigi | null {
    // Türkçe havuz kendi doğrulanmış metnini taşır; diğer dillerde meal QuranEnc'ten.
    const turkce = aktifDil() === 'tr';
    switch (o.tur) {
        case 'soz':
            return { metin: s.icerik.vakitGirdi[o.id], kaynak: '' };
        case 'hadis':
            return hadisGosterilir() ? { metin: o.metin, kaynak: o.kaynak } : null;
        case 'ayet':
            if ('yalnizCeviri' in o) return turkce ? null : ayetMeali(o.ref);
            return turkce ? { metin: o.metin, kaynak: o.kaynak } : ayetMeali(o.ref);
    }
}

/** Vakit girdi bildiriminin içerik havuzu, etkin dilde (canlı görünüm). */
export const VAKIT_BILDIRIM_ICERIKLERI: Readonly<Record<VakitBildirimTipi, VakitBildirimIcerigi[]>> = canli((s) => {
    const sonuc = {} as Record<VakitBildirimTipi, VakitBildirimIcerigi[]>;
    for (const vakit of Object.keys(HAVUZ) as VakitBildirimTipi[]) {
        sonuc[vakit] = HAVUZ[vakit].map((o) => coz(o, s)).filter((x): x is VakitBildirimIcerigi => x !== null);
    }
    return sonuc;
});
