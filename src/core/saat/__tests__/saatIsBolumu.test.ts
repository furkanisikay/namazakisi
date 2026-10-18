/**
 * Saat iş bölümünün TELEFON tarafı (saat W3) — plan üreticilerindeki iki kapı:
 *  - uyandırma "saatte": sabahın gerçek alarmı ve teheccüd uyandırması telefonda YEDEK,
 *    `SAAT_YEDEK_GECIKMESI_DK` sonra; kimlik DEĞİŞMEZ (saat kapatınca bununla iptal eder);
 *  - anons "yalnız saatte": telefon TTS planlamaz (`sesliAnons` üreticide kapanır).
 * Bildirim defteri aynı üreticileri koşar → SAYI değişmez (yalnız zaman kayar).
 */
import { muhafizVakitleriniHesapla, vakitTeslimAdaylari, anonsAlarmiKurarMi } from '../../muhafiz/muhafizTeslimPlani';
import { muhafizMatrisiniCoz } from '../../muhafiz/motorAdaptoru';
import type { MuhafizMatrisi } from '../../muhafiz/matrisTipleri';
import { nafilePlaniOlustur } from '../../nafile/nafilePlani';
import { VARSAYILAN_NAFILE_AYARLARI, type NafileAyarlari } from '../../nafile/nafileTipleri';
import { bildirimDefteriOlustur } from '../../bildirim/bildirimDefteri';
import {
    SAAT_YEDEK_GECIKMESI_DK,
    SAAT_YEDEK_SON_PAYI_MS,
    VARSAYILAN_SAAT_AYARLARI,
    saatUyandirmaDurumlariniCoz,
    uyandirmaTelefonMs,
    type SaatAyarlari,
    type SaatTeslimBaglami,
} from '../saatAyarlari';
import * as fs from 'fs';
import * as path from 'path';
import { tarihiISOFormatinaCevir } from '../../utils/TarihYardimcisi';

const ISTANBUL = { lat: 41.0082, lng: 28.9784 };
const SAATTE: SaatAyarlari = { uyandirmaYeri: 'saat', anonsYeri: 'otomatik' };
const DK = 60_000;

const matris = (): MuhafizMatrisi => {
    const m = muhafizMatrisiniCoz({
        esikler: { seviye1: 45, seviye2: 25, seviye3: 10, seviye4: 3 },
        sikliklar: { seviye1: 15, seviye2: 10, seviye3: 5, seviye4: 1 },
    });
    for (const v of ['imsak', 'ogle'] as const) {
        m[v] = {
            ...m[v],
            seviyeler: m[v].seviyeler.map((s, i) =>
                i === 1
                    ? { ...s, kanallar: { ...s.kanallar, alarm: true } }
                    : i === 2
                      ? { ...s, kanallar: { bildirim: true, sesli: true }, anonsMetni: '{vakit} için {süre} dakika {yön}.' }
                      : s
            ),
        };
    }
    return m;
};

/** Bugünün imsağından 2 sa önce (plan imsağın tamamını kapsar). */
const simdi = (): Date => {
    const taslak = new Date();
    const imsak = muhafizVakitleriniHesapla(ISTANBUL, taslak).find((v) => v.vakit === 'imsak')!;
    return new Date(imsak.giris.getTime() - 2 * 60 * DK);
};

describe('muhafız üreticisi — saat iş bölümü', () => {
    const an = simdi();
    const vakitler = muhafizVakitleriniHesapla(ISTANBUL, an);
    const imsak = vakitler.find((v) => v.vakit === 'imsak')!;
    const ogle = vakitler.find((v) => v.vakit === 'ogle')!;

    it('ayar verilmezse ya da varsayılansa plan BİREBİR aynı (kayıt-oynat korunur)', () => {
        const ham = vakitTeslimAdaylari(matris(), imsak, an);
        expect(vakitTeslimAdaylari(matris(), imsak, an, VARSAYILAN_SAAT_AYARLARI)).toEqual(ham);
    });

    it('uyandırma saatte: YALNIZ imsak alarmı +3 dk kayar, kimlik aynı kalır; öğle alarmı kaymaz', () => {
        const ham = vakitTeslimAdaylari(matris(), imsak, an);
        const kayik = vakitTeslimAdaylari(matris(), imsak, an, SAATTE);
        expect(kayik.map((a) => a.id)).toEqual(ham.map((a) => a.id));
        const alarmlar = ham.filter((a) => a.uyari.alarm === true);
        expect(alarmlar.length).toBe(1);
        for (const [i, a] of ham.entries()) {
            const fark = kayik[i].zaman.getTime() - a.zaman.getTime();
            expect(fark).toBe(a.uyari.alarm === true ? SAAT_YEDEK_GECIKMESI_DK * DK : 0);
        }
        const ogleHam = vakitTeslimAdaylari(matris(), ogle, an);
        expect(vakitTeslimAdaylari(matris(), ogle, an, SAATTE)).toEqual(ogleHam);
    });

    it('anons yalnız saatte: telefon TTS kurmaz; otomatik/telefon seçiminde kurar', () => {
        const kurulan = (saat?: SaatAyarlari) => vakitTeslimAdaylari(matris(), ogle, an, saat).filter(anonsAlarmiKurarMi).length;
        expect(kurulan()).toBeGreaterThan(0);
        expect(kurulan({ uyandirmaYeri: 'telefon', anonsYeri: 'telefon' })).toBe(kurulan());
        expect(kurulan({ uyandirmaYeri: 'telefon', anonsYeri: 'saat' })).toBe(0);
    });

    it('bildirim defteri: saat seçimi SAYIYI değiştirmez (parite — yedek yine sayılır)', () => {
        const g = {
            platform: 'android' as const,
            simdi: an,
            koordinat: ISTANBUL,
            muhafiz: { aktif: true, matris: matris() },
            widget: false,
        };
        const taban = bildirimDefteriOlustur(g);
        const saatte = bildirimDefteriOlustur({ ...g, saat: SAATTE });
        expect(saatte.length).toBe(taban.length);
        // "Yalnız saatte" anons: telefonun anons alarmları defterden düşer (telefon kurmuyor).
        const sessiz = bildirimDefteriOlustur({ ...g, saat: { uyandirmaYeri: 'telefon', anonsYeri: 'saat' } });
        expect(sessiz.filter((k) => k.kaynak === 'anons')).toHaveLength(0);
        expect(taban.filter((k) => k.kaynak === 'anons').length).toBeGreaterThan(0);
    });
});

describe('nafile üreticisi — teheccüd uyandırması yedeği', () => {
    const ayar: NafileAyarlari = {
        ...VARSAYILAN_NAFILE_AYARLARI,
        teheccud: { ...VARSAYILAN_NAFILE_AYARLARI.teheccud, aktif: true, uyandirma: true },
    };
    // Öğlen: teheccüd tetiği "şimdi"nin 3 dk gerisinde olamaz (kayan pencere testi oynamasın).
    const an = new Date();
    an.setHours(12, 0, 0, 0);
    const bugun = tarihiISOFormatinaCevir(an);

    it('saatte: teheccüd tetikleri +3 dk (kimlik aynı); varsayılanda birebir', () => {
        const ham = nafilePlaniOlustur(ISTANBUL, ayar, an, bugun);
        expect(ham.length).toBeGreaterThan(0);
        expect(nafilePlaniOlustur(ISTANBUL, ayar, an, bugun, () => false, { gunduzGunSayisi: 3, teheccudGeceSayisi: 7, saat: VARSAYILAN_SAAT_AYARLARI })).toEqual(ham);
        const kayik = nafilePlaniOlustur(ISTANBUL, ayar, an, bugun, () => false, {
            gunduzGunSayisi: 3,
            teheccudGeceSayisi: 7,
            saat: SAATTE,
        });
        expect(kayik.map((p) => p.id)).toEqual(ham.map((p) => p.id));
        for (const [i, p] of ham.entries()) {
            expect(kayik[i].zaman.getTime() - p.zaman.getTime()).toBe(SAAT_YEDEK_GECIKMESI_DK * DK);
            expect(kayik[i].zaman.getTime()).toBeLessThan(p.son.getTime());
        }
    });
});

describe('uyandirmaTelefonMs — telefonun uyandırma anı TEK kural', () => {
    const T = 1_000_000_000_000;
    const SON = T + 60 * DK;
    it('saat uyandırmıyorsa özgün an (cevaplar yok sayılır)', () => {
        const b: SaatTeslimBaglami = { ...VARSAYILAN_SAAT_AYARLARI, uyandirmaDurumlari: { x: { islem: 'kapat' } } };
        expect(uyandirmaTelefonMs(b, 'x', T, SON)).toBe(T);
        expect(uyandirmaTelefonMs(undefined, 'x', T, SON)).toBe(T);
    });
    it('saatte: +gecikme, pencere sonundan pay kadar önceyle sınırlı', () => {
        expect(uyandirmaTelefonMs(SAATTE, 'x', T, SON)).toBe(T + SAAT_YEDEK_GECIKMESI_DK * DK);
        expect(uyandirmaTelefonMs(SAATTE, 'x', T, T + DK)).toBe(T + DK - SAAT_YEDEK_SON_PAYI_MS);
    });
    it('ikisi: özgün an; saatte ertelenince telefon yine YEDEK olur', () => {
        const ikisi: SaatTeslimBaglami = { uyandirmaYeri: 'ikisi', anonsYeri: 'otomatik' };
        expect(uyandirmaTelefonMs(ikisi, 'x', T, SON)).toBe(T);
        const ertelendi = { ...ikisi, uyandirmaDurumlari: { x: { islem: 'ertele' as const, hedefMs: T + 10 * DK } } };
        expect(uyandirmaTelefonMs(ertelendi, 'x', T, SON)).toBe(T + (10 + SAAT_YEDEK_GECIKMESI_DK) * DK);
    });
    it('saatte kapatılan kurulmaz; başka kimliğe dokunmaz', () => {
        const b: SaatTeslimBaglami = { ...SAATTE, uyandirmaDurumlari: { x: { islem: 'kapat' } } };
        expect(uyandirmaTelefonMs(b, 'x', T, SON)).toBeNull();
        expect(uyandirmaTelefonMs(b, 'y', T, SON)).toBe(T + SAAT_YEDEK_GECIKMESI_DK * DK);
    });
    it('native deponun bozuk öğeleri atlanır', () => {
        expect(
            saatUyandirmaDurumlariniCoz({
                a: { islem: 'kapat' },
                b: { islem: 'ertele', hedefMs: 5 },
                c: { islem: 'ertele' },
                d: 'x',
                e: { islem: 'baska' },
            })
        ).toEqual({ a: { islem: 'kapat' }, b: { islem: 'ertele', hedefMs: 5 } });
        expect(saatUyandirmaDurumlariniCoz(null)).toEqual({});
        expect(saatUyandirmaDurumlariniCoz([1])).toEqual({});
    });
});

describe('NÖBETÇİ (inceleme bulgusu 1-2) — planlama turu telefonun yedeğini SİLMEZ', () => {
    const taslak = simdi();
    const imsak = muhafizVakitleriniHesapla(ISTANBUL, taslak).find((v) => v.vakit === 'imsak')!;
    const tamPlan = vakitTeslimAdaylari(matris(), imsak, taslak);
    const alarm = tamPlan.find((a) => a.uyari.alarm === true)!;
    const T = alarm.zaman.getTime();

    it('[T, T+3 dk) içindeki tur: yedek T+3 dk anında hâlâ kurulu (varsayılanda zaten çalmış)', () => {
        for (const ofset of [1_000, 1 * DK, 2 * DK + 30_000]) {
            const an = new Date(T + ofset);
            const plan = vakitTeslimAdaylari(matris(), imsak, an, SAATTE);
            const yedek = plan.find((a) => a.id === alarm.id);
            expect(yedek?.zaman.getTime()).toBe(T + SAAT_YEDEK_GECIKMESI_DK * DK);
            expect(vakitTeslimAdaylari(matris(), imsak, an).some((a) => a.id === alarm.id)).toBe(false);
        }
    });

    it('saatte KAPATILDI: tur yedeği yeniden kurmaz', () => {
        const b: SaatTeslimBaglami = { ...SAATTE, uyandirmaDurumlari: { [alarm.id]: { islem: 'kapat' } } };
        expect(vakitTeslimAdaylari(matris(), imsak, new Date(T + DK), b).some((a) => a.id === alarm.id)).toBe(false);
    });

    it('saatte ERTELENDİ: tur yedeği saatin yeni anının ardına kurar (özgün an çoktan geçmiş olsa da)', () => {
        const hedef = T + 12 * DK;
        const b: SaatTeslimBaglami = { ...SAATTE, uyandirmaDurumlari: { [alarm.id]: { islem: 'ertele', hedefMs: hedef } } };
        const yedek = vakitTeslimAdaylari(matris(), imsak, new Date(T + 8 * DK), b).find((a) => a.id === alarm.id);
        expect(yedek?.zaman.getTime()).toBe(hedef + SAAT_YEDEK_GECIKMESI_DK * DK);
    });

    it('geçmiş diğer tetikler kayan taramada da kurulmaz (yalnız yedek geri gelir)', () => {
        const an = new Date(T + DK);
        const ids = vakitTeslimAdaylari(matris(), imsak, an, SAATTE).map((a) => a.id);
        const gelecek = tamPlan.filter((a) => a.zaman.getTime() > an.getTime() || a.id === alarm.id).map((a) => a.id);
        expect(ids.sort()).toEqual(gelecek.sort());
    });

    it('nafile: teheccüd yedeği [T, T+3 dk) içinde silinmez; kapatılan/ertelenen kuralı aynı', () => {
        const ayar: NafileAyarlari = {
            ...VARSAYILAN_NAFILE_AYARLARI,
            teheccud: { ...VARSAYILAN_NAFILE_AYARLARI.teheccud, aktif: true, uyandirma: true },
        };
        const oglen = new Date();
        oglen.setHours(12, 0, 0, 0);
        const bugun = tarihiISOFormatinaCevir(oglen);
        const sec = (saat?: SaatTeslimBaglami) => ({ gunduzGunSayisi: 1, teheccudGeceSayisi: 1, saat });
        const ilk = nafilePlaniOlustur(ISTANBUL, ayar, oglen, bugun, () => false, sec()).find((p) => p.tur === 'teheccud')!;
        const t = ilk.zaman.getTime();
        const an = new Date(t + DK);
        const plan = nafilePlaniOlustur(ISTANBUL, ayar, an, bugun, () => false, sec(SAATTE));
        expect(plan.find((p) => p.id === ilk.id)?.zaman.getTime()).toBe(t + SAAT_YEDEK_GECIKMESI_DK * DK);
        const kapali = nafilePlaniOlustur(ISTANBUL, ayar, an, bugun, () => false, sec({ ...SAATTE, uyandirmaDurumlari: { [ilk.id]: { islem: 'kapat' } } }));
        expect(kapali.some((p) => p.id === ilk.id)).toBe(false);
        const ertele = nafilePlaniOlustur(ISTANBUL, ayar, new Date(t + 9 * DK), bugun, () => false, sec({ ...SAATTE, uyandirmaDurumlari: { [ilk.id]: { islem: 'ertele', hedefMs: t + 10 * DK } } }));
        expect(ertele.find((p) => p.id === ilk.id)?.zaman.getTime()).toBe(t + (10 + SAAT_YEDEK_GECIKMESI_DK) * DK);
    });
});

describe('SÖZLEŞME — telefon native deposuyla aynı yedek kuralı (saat-komut-ornekleri.json)', () => {
    const fikstur = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../../../../wear/app/src/test/resources/saat-komut-ornekleri.json'), 'utf8')
    ) as {
        yedekGecikmesiDk: number;
        yedekSonPayiMs: number;
        uyandirma: { id: string; islem: string; hedefMs?: number; sonMs: number; yedekMs?: number }[];
    };

    it('sabitler ve ertelenen yedeğin anı Kotlin SaatKomutKurallari ile birebir', () => {
        expect(fikstur.yedekGecikmesiDk).toBe(SAAT_YEDEK_GECIKMESI_DK);
        expect(fikstur.yedekSonPayiMs).toBe(SAAT_YEDEK_SON_PAYI_MS);
        for (const u of fikstur.uyandirma.filter((x) => x.islem === 'ertele')) {
            const b: SaatTeslimBaglami = { ...SAATTE, uyandirmaDurumlari: { [u.id]: { islem: 'ertele', hedefMs: u.hedefMs! } } };
            expect(uyandirmaTelefonMs(b, u.id, 0, u.sonMs)).toBe(u.yedekMs);
        }
    });
});
