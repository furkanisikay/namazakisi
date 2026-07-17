import {
    SEYTANLA_MUCADELE_ICERIGI,
    uygunIcerikleriBul,
    icerikMetniOlustur,
} from '../SeytanlaMucadeleIcerigi';
import type { VakitAdi } from '../../types';

const TUM_VAKITLER: VakitAdi[] = ['imsak', 'gunes', 'ogle', 'ikindi', 'aksam', 'yatsi'];
const TUM_SEVIYELER = [1, 2, 3, 4] as const;

describe('uygunIcerikleriBul — vakte özgülük', () => {
    // Yaşanmış bug: vakte özgü nassın vakit kısıtı yoktu -> "münafıklara en ağır
    // gelen yatsı ve sabah namazıdır" öğle/ikindi/akşamda da çıkıyordu.
    test('berdeyn (sabah+ikindi nassı) yalnız sabah ve ikindide çıkar', () => {
        for (const vakit of ['imsak', 'ikindi'] as VakitAdi[]) {
            expect(uygunIcerikleriBul(vakit, 1).map((i) => i.id)).toContain('berdeyn');
        }
        for (const vakit of ['gunes', 'ogle', 'aksam', 'yatsi'] as VakitAdi[]) {
            expect(uygunIcerikleriBul(vakit, 1).map((i) => i.id)).not.toContain('berdeyn');
        }
    });

    test('sabaha özgü nass başka vakitte çıkmaz', () => {
        expect(uygunIcerikleriBul('imsak', 1).map((i) => i.id)).toContain('sabah-koruma');
        for (const vakit of ['ogle', 'ikindi', 'aksam', 'yatsi'] as VakitAdi[]) {
            expect(uygunIcerikleriBul(vakit, 1).map((i) => i.id)).not.toContain('sabah-koruma');
        }
    });

    test('ikindiye özgü fevt nassı başka vakitte çıkmaz', () => {
        expect(uygunIcerikleriBul('ikindi', 2).map((i) => i.id)).toContain('ikindi-fevt');
        for (const vakit of ['imsak', 'ogle', 'aksam', 'yatsi'] as VakitAdi[]) {
            expect(uygunIcerikleriBul(vakit, 2).map((i) => i.id)).not.toContain('ikindi-fevt');
        }
    });

    test('genel içerik (vakitler tanımsız) her vakitte çıkar', () => {
        for (const vakit of TUM_VAKITLER) {
            expect(uygunIcerikleriBul(vakit, 1).map((i) => i.id)).toContain('hud-114');
        }
    });

    test('yalnız istenen seviyeyi döndürür', () => {
        for (const vakit of TUM_VAKITLER) {
            for (const seviye of TUM_SEVIYELER) {
                for (const icerik of uygunIcerikleriBul(vakit, seviye)) {
                    expect(icerik.siddetSeviyesi).toBe(seviye);
                }
            }
        }
    });

    // Havuz boşsa servis yedek metne düşer; her (vakit, seviye) dolu olmalı ki
    // kullanıcı hep aynı yedek cümleyi görmesin.
    test('her vakit × her seviye için en az bir içerik var', () => {
        for (const vakit of TUM_VAKITLER) {
            for (const seviye of TUM_SEVIYELER) {
                expect(uygunIcerikleriBul(vakit, seviye).length).toBeGreaterThan(0);
            }
        }
    });
});

describe('icerikMetniOlustur — künye', () => {
    test('nass ise künye eklenir', () => {
        const nass = SEYTANLA_MUCADELE_ICERIGI.find((i) => i.id === 'berdeyn')!;
        const metin = icerikMetniOlustur(nass);
        expect(metin).toContain(nass.metin);
        expect(metin).toContain('Buhârî, Mevâkîtü\'s-salât 26');
    });

    test('kendi sözümüzde künye eklenmez (uydurma kaynak izlenimi vermesin)', () => {
        const kendiSozumuz = SEYTANLA_MUCADELE_ICERIGI.find((i) => i.id === 'fisilti')!;
        expect(kendiSozumuz.kaynak).toBeUndefined();
        expect(icerikMetniOlustur(kendiSozumuz)).toBe(kendiSozumuz.metin);
    });
});

describe('havuz bütünlüğü — NÖBETÇİ', () => {
    // "Hadis-i Şerif" / "Kuran-ı Kerim" KÜNYE DEĞİLDİR: kitap + bab/no gerekir.
    test('her künye gerçek künye formatında (kitap + numara)', () => {
        const sahteKunyeler = ['Hadis-i Şerif', 'Kuran-ı Kerim', 'Hadis', 'Ayet'];
        for (const icerik of SEYTANLA_MUCADELE_ICERIGI) {
            if (icerik.kaynak === undefined) continue;
            expect(icerik.kaynak).not.toBe('');
            expect(sahteKunyeler).not.toContain(icerik.kaynak);
            // Künyede bab/ayet numarası bulunmalı
            expect(icerik.kaynak).toMatch(/\d/);
        }
    });

    // TERK != GECİKME: bildirimi alan kişi namazı terk etmiş değil, gecikmiş ve
    // birazdan kılacak. "Terk edenin küfrü/ameli boşa gider" türü nasslar SAHİH
    // OLSA BİLE bu kişiye yanlış hedeftir.
    test('havuzda terk-ekseninde metin yok', () => {
        const terkKaliplari = /terk ed|zayi et|küfür|şirk|Gayya|ameli boşa/i;
        for (const icerik of SEYTANLA_MUCADELE_ICERIGI) {
            expect(icerik.metin).not.toMatch(terkKaliplari);
        }
    });

    test('id\'ler benzersiz', () => {
        const idler = SEYTANLA_MUCADELE_ICERIGI.map((i) => i.id);
        expect(new Set(idler).size).toBe(idler.length);
    });
});
