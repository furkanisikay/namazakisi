/**
 * Vakit girince bildirim havuzu + muhafız metinleri — NÖBETÇİ (persona çalışması 2026-10-19).
 *
 * Vakit DAHA YENİ girmiş ya da kişi gecikmiş (terk etmemiş) olabilir; suçlayıcı/korkutucu
 * nass ve ifadeler yanlış hedeftir (AGENTS.md: terk ≠ geciktirme). Yalnız `metin`
 * alanları taranır — sabit adlarında (SEYTANLA_…) geçen sözcükler kapsam dışı.
 */
import { VAKIT_BILDIRIM_ICERIKLERI } from '../VakitBildirimIcerikleri';
import { SEYTANLA_MUCADELE_ICERIGI } from '../SeytanlaMucadeleIcerigi';
import { GIRIS_ICERIK_HAVUZU, bildirimGovdesiOlustur } from '../../utils/muhafizMetinYardimcisi';

/** Ne vakit girişinde ne muhafızda: terk/küfür/nifak suçlaması, korku dili, yanlış rükün. */
const YASAKLI_IFADELER =
    /terk ed|zayi et|küfür|şirk|Gayya|ameli boşa|münafık|şeytana uy|kaza etmek zorunda|son namazın|cehenneme gir|secdeye kapan|vakit girmeden/i;

const vakitMetinleri = Object.values(VAKIT_BILDIRIM_ICERIKLERI).flat();

describe('vakit girince havuzu', () => {
    test('yasaklı (suçlayıcı / korkutucu) ifade yok', () => {
        for (const i of vakitMetinleri) expect(i.metin).not.toMatch(YASAKLI_IFADELER);
    });

    test('künye tek başına "Hadis-i Şerif" olamaz (kitap adı gerekir)', () => {
        for (const i of vakitMetinleri) {
            if (!i.kaynak) continue;
            expect(i.kaynak.trim()).not.toMatch(/^(Hadis-i Şerif|Hadis|Kuran-ı Kerim|Ayet)$/i);
        }
    });

    test('her vakitte en az üç içerik (rastgelelik tek cümleye düşmesin)', () => {
        for (const havuz of Object.values(VAKIT_BILDIRIM_ICERIKLERI)) {
            expect(havuz.length).toBeGreaterThanOrEqual(3);
        }
    });

    test('berdeyn (sabah + ikindi nassı) yalnız sabah ve ikindide', () => {
        const berdeynVar = (v: keyof typeof VAKIT_BILDIRIM_ICERIKLERI) =>
            VAKIT_BILDIRIM_ICERIKLERI[v].some((i) => i.metin.includes('İki serinliği'));
        expect(berdeynVar('imsak')).toBe(true);
        expect(berdeynVar('ikindi')).toBe(true);
        expect(berdeynVar('ogle')).toBe(false);
        expect(berdeynVar('aksam')).toBe(false);
        expect(berdeynVar('yatsi')).toBe(false);
    });
});

describe('muhafız metinleri (havuz + giriş havuzu + yedek gövdeler)', () => {
    test('yasaklı ifade yok', () => {
        const metinler = [
            ...SEYTANLA_MUCADELE_ICERIGI.map((i) => i.metin),
            ...Object.values(GIRIS_ICERIK_HAVUZU).flat(),
            ...([1, 2, 3, 4] as const).flatMap((s) => [
                bildirimGovdesiOlustur(s, 'cikisaDogru', 5),
                bildirimGovdesiOlustur(s, 'cikisaDogru', 90),
                bildirimGovdesiOlustur(s, 'girisindenItibaren', 5),
            ]),
        ];
        for (const m of metinler) expect(m).not.toMatch(YASAKLI_IFADELER);
    });

    test('son çağrı kılınmış olabilme ihtimaline saygılı: "Kıldım"ı hatırlatır, "sen" + emir kalır', () => {
        const son = bildirimGovdesiOlustur(4, 'cikisaDogru', 3);
        expect(son).toContain('Kıldım');
        expect(son).toMatch(/namaza dur/);
    });
});
