/**
 * NÖBETÇİ — EK HATIRLATMA YÜZEYLERİNİN SESLİ ANONS PLANI (kayıt-oynat, snapshot).
 *
 * Birleşik hatırlatma modülü (plan `2026-10-18-birlesik-hatirlatma-modulu.md` §4.2):
 * sesli okuma metni artık her yüzeyde düzenlenebilir; ama ESKİ KAYIT (diskte metni boş,
 * çünkü eski normalize metni zorla boşaltıyordu) BİREBİR AYNI planı üretmeli — aynı
 * kanallar, aynı TTS bayrağı, aynı bağlamsal (otomatik) cümle.
 *
 * Snapshot refactor ÖNCESİ koddan üretildi (sesli metin değişikliği öncesi). Mevcut
 * servis kayıt-oynat snapshot'ları (`domain/services/__tests__/*.kayitOynat`) yalnız
 * bildirim çağrılarını dondurur, sesli anons METNİNİ yakalamaz — bu dosya o boşluğu
 * kapatır ve nafileyi de kapsar.
 *
 * SAAT DİLİMİNDEN BAĞIMSIZ (CI UTC, yerel İstanbul): kayıtlar tarih/saat değil,
 * kimliğin tarihten arındırılmış hâli + kanal + metin olarak yazılır ve TEKİLLEŞTİRİLİR.
 */
import { Coordinates, PrayerTimes } from 'adhan';
import { turkiyeHesapParametreleri } from '../../vakit/hesapParametreleri';
import type { SeviyeAyari } from '../../muhafiz/matrisTipleri';
import type { UyariPlani } from '../../muhafiz/motorAdaptoru';
import { ekAdim } from '../adimDizisi';
import { cumaAyarlariniNormalize } from '../../cuma/cumaAyarlari';
import { cumaPlaniOlustur } from '../../bildirim/cumaPlani';
import { camiyeGitAyarlariniNormalize } from '../../camiyeGit/camiyeGitAyarlari';
import { camiyeGitPlaniOlustur } from '../../bildirim/camiyeGitPlani';
import { yatisAyarlariniNormalize } from '../../yatis/yatisAyarlari';
import { yatisPlaniOlustur } from '../../yatis/yatisPlani';
import { takvimCakismaAyarlariniNormalize } from '../../takvimCakisma/takvimCakismaAyarlari';
import { takvimCakismaPlaniOlustur, type TakvimEtkinligi } from '../../bildirim/takvimCakismaPlani';
import { nafileAyarlariniNormalize } from '../../../data/local/LocalNafileServisi';
import { VARSAYILAN_NAFILE_AYARLARI } from '../../nafile/nafileTipleri';
import { nafilePlaniOlustur } from '../../nafile/nafilePlani';
import { gununNafilePencereleri } from '../../nafile/gunVakitleri';

const ISTANBUL = { lat: 41.0082, lng: 28.9784 };
const DK = 60_000;

/**
 * Diskteki ESKİ biçim: sesli adımların metni BOŞ (eski normalize zorluyordu). Kanallar
 * her bileşimi kapsar: sesli + bildirim, yalnız sesli, bildirim + titreşim + tekrar.
 */
const ADIMLAR = (esikler: [number, number, number]): SeviyeAyari[] => [
    ekAdim(esikler[0], 'birkez', { bildirim: true, sesli: true }),
    ekAdim(esikler[1], 'birkez', { sesli: true }),
    ekAdim(esikler[2], { herDk: 5 }, { bildirim: true, titresim: true }),
];

/** Tarih/saat içermeyen, tekilleştirilmiş özet (saat diliminden bağımsız). */
function ozet(kayitlar: { id: string; uyari: UyariPlani }[]): string[] {
    const satirlar = kayitlar.map(({ id, uyari }) => {
        const kimlik = id.replace(/\d{4}-\d{2}-\d{2}/g, '<GUN>');
        const k = uyari.kanallar ?? {};
        const kanal = (['bildirim', 'sesli', 'titresim', 'alarm'] as const).filter((a) => k[a] === true).join('+');
        return `${kimlik} | ${kanal} | sesli=${uyari.sesliAnons} | ${uyari.anonsMetni}`;
    });
    return [...new Set(satirlar)].sort();
}

describe('Ek hatırlatma yüzeyleri — boş metinli sesli adım = bugünkü otomatik cümle (kayıt-oynat)', () => {
    it('cuma', () => {
        const ayarlar = cumaAyarlariniNormalize({ aktif: true, adimlar: ADIMLAR([90, 45, 20]) });
        const plan = cumaPlaniOlustur(ISTANBUL, ayarlar, new Date(2026, 7, 3, 8, 0));
        expect(plan.length).toBeGreaterThan(0);
        expect(ozet(plan)).toMatchSnapshot();
    });

    it('camiye gitme', () => {
        const ayarlar = camiyeGitAyarlariniNormalize({
            aktif: true,
            vakitler: { imsak: true, ogle: true, ikindi: true, aksam: true, yatsi: true },
            yurumeDk: 10,
            hazirlikDk: 15,
            adimlar: ADIMLAR([40, 25, 15]),
        });
        const plan = camiyeGitPlaniOlustur(ISTANBUL, ayarlar, new Date(2026, 7, 3, 0, 1), { gunSayisi: 3 });
        expect(plan.length).toBeGreaterThan(0);
        expect(ozet(plan)).toMatchSnapshot();
    });

    it('yatış — yatsı hatırlatması + muhasebe (tek / çoklu)', () => {
        const ayarlar = yatisAyarlariniNormalize({
            aktif: true,
            saat: 23,
            dakika: 30,
            yatsiHatirlatmasi: true,
            muhasebe: true,
            adimlar: ADIMLAR([60, 30, 15]),
        });
        const simdi = new Date(2026, 9, 13, 13, 15);
        const yatsiKilinmamis = yatisPlaniOlustur({ koordinat: ISTANBUL, ayarlar, simdi, gunSayisi: 3 });
        const tekEksik = yatisPlaniOlustur({
            koordinat: ISTANBUL,
            ayarlar,
            simdi,
            gunSayisi: 3,
            kilinanlar: () => ['imsak', 'ikindi', 'aksam', 'yatsi'],
        });
        const cokEksik = yatisPlaniOlustur({
            koordinat: ISTANBUL,
            ayarlar,
            simdi,
            gunSayisi: 3,
            kilinanlar: () => ['yatsi'],
        });
        expect(yatsiKilinmamis.length).toBeGreaterThan(0);
        expect({
            yatsi: ozet(yatsiKilinmamis.map((p) => ({ id: p.kimlik, uyari: p.uyari }))),
            tek: ozet(tekEksik.map((p) => ({ id: p.kimlik, uyari: p.uyari }))),
            coklu: ozet(cokEksik.map((p) => ({ id: p.kimlik, uyari: p.uyari }))),
        }).toMatchSnapshot();
    });

    it('takvim çakışması — "once" ve "kapliyor"', () => {
        const ayarlar = takvimCakismaAyarlariniNormalize({
            aktif: true,
            rizaZamani: '2026-10-01T00:00:00.000Z',
            adimlar: ADIMLAR([60, 30, 15]),
        });
        const simdi = new Date(2026, 9, 12, 0, 5);
        const params = turkiyeHesapParametreleri();
        const gun = new Date(2026, 9, 13);
        const pt = new PrayerTimes(new Coordinates(ISTANBUL.lat, ISTANBUL.lng), gun, params);
        const etkinlikler: TakvimEtkinligi[] = [
            // İkindinin sonunu yutan toplantı → "once".
            { baslangicMs: pt.asr.getTime() + 60 * DK, bitisMs: pt.maghrib.getTime() + 10 * DK, baslik: 'Proje toplantısı' },
            // Öğleyi baştan sona kaplayan → "kapliyor".
            { baslangicMs: pt.dhuhr.getTime() - 30 * DK, bitisMs: pt.asr.getTime() + 5 * DK, baslik: 'Uzun eğitim' },
        ];
        const plan = takvimCakismaPlaniOlustur({ koordinat: ISTANBUL, ayarlar, simdi, gunSayisi: 3, etkinlikler });
        expect(plan.length).toBeGreaterThan(0);
        // Etkinlik ADI anonsta ASLA (gizlilik nöbetçisi; metin ne olursa olsun).
        for (const p of plan) expect(p.uyari.anonsMetni).not.toMatch(/Proje|eğitim/);
        expect(ozet(plan)).toMatchSnapshot();
    });

    it('nafile — kuşluk (giriş), evvâbîn (çıkış), teheccüd (son üçte bir)', () => {
        const GUN = '2026-06-21';
        const ayarlar = nafileAyarlariniNormalize({
            ...VARSAYILAN_NAFILE_AYARLARI,
            hatirlatmalar: {
                kusluk: { aktif: true, yon: 'girisindenItibaren', adimlar: ADIMLAR([5, 30, 60]) },
                evvabin: { aktif: true, yon: 'cikisaDogru', adimlar: ADIMLAR([40, 25, 15]) },
            },
            teheccud: {
                aktif: true,
                yon: 'girisindenItibaren',
                pencere: 'sonUcteBir',
                uyandirma: false,
                adimlar: ADIMLAR([1, 20, 40]),
            },
        });
        const gunBasi = new Date(gununNafilePencereleri(ISTANBUL, GUN)[0].baslangic.getTime() - 3 * 60 * DK);
        const plan = nafilePlaniOlustur(ISTANBUL, ayarlar, gunBasi, GUN);
        expect(plan.length).toBeGreaterThan(0);
        expect(ozet(plan)).toMatchSnapshot();
    });
});
