/**
 * Saatin sessiz uyandırma listesi (saat W3, fikir 2) + saat ayarlarının kapıları.
 * Saat sabit DEĞİL: pencereler gerçek adhan hesabından türetilir, `simdi` ondan seçilir.
 */
import { wearUyandirmaGecerliMi, wearUyandirmaListesiOlustur } from '../wearUyandirma';
import { vakitPencereleriniOlustur } from '../wearMuhafizPlani';
import { muhafizMatrisiniCoz } from '../../muhafiz/motorAdaptoru';
import type { MuhafizMatrisi } from '../../muhafiz/matrisTipleri';
import { VARSAYILAN_NAFILE_AYARLARI, type NafileAyarlari } from '../../nafile/nafileTipleri';
import {
    VARSAYILAN_SAAT_AYARLARI,
    saatAyarlariniNormalize,
    saatUyandiriyorMu,
    telefonAnonsuKonusurMu,
    telefonYedegiGecikirMi,
} from '../../saat/saatAyarlari';
import { muhafizUyandirmasiMi, nafileUyandirmasiMi } from '../../saat/uyandirmaKapisi';
import { bugunuAl } from '../../utils/TarihYardimcisi';

const ISTANBUL = { lat: 41.0082, lng: 28.9784 };
const BUGUN = bugunuAl();

const tabanMatris = (): MuhafizMatrisi =>
    muhafizMatrisiniCoz({
        esikler: { seviye1: 45, seviye2: 25, seviye3: 10, seviye4: 3 },
        sikliklar: { seviye1: 15, seviye2: 10, seviye3: 5, seviye4: 1 },
    });

/** İmsak vaktinin 2. adımına gerçek alarm kanalı açılmış matris. */
const alarmliMatris = (): MuhafizMatrisi => {
    const m = tabanMatris();
    m.imsak = {
        ...m.imsak,
        seviyeler: m.imsak.seviyeler.map((s, i) => (i === 1 ? { ...s, kanallar: { ...s.kanallar, alarm: true } } : s)),
    };
    // Öğlede de alarm var — uyandırma DEĞİLDİR (kişi uyanık).
    m.ogle = {
        ...m.ogle,
        seviyeler: m.ogle.seviyeler.map((s, i) => (i === 1 ? { ...s, kanallar: { ...s.kanallar, alarm: true } } : s)),
    };
    return m;
};

const bugunImsak = vakitPencereleriniOlustur(ISTANBUL, BUGUN, 2).find((p) => p.tarih === BUGUN && p.vakit === 'imsak')!;
const IMSAK_ONCESI = bugunImsak.giris.getTime() - 60_000;

describe('wearUyandirmaListesiOlustur', () => {
    it('yalnız İMSAK vaktinin gerçek alarm tetiği uyandırmadır; öğle alarmı değildir', () => {
        const liste = wearUyandirmaListesiOlustur({
            koordinat: ISTANBUL,
            bugunIso: BUGUN,
            simdiMs: IMSAK_ONCESI,
            muhafiz: { aktif: true, matris: alarmliMatris(), kilinanlar: {} },
        });
        expect(liste.length).toBeGreaterThanOrEqual(1);
        expect(liste.every((k) => k.tur === 'imsak' && k.id.includes('_vakit_imsak_'))).toBe(true);
        const ilk = liste[0];
        // Kimlik telefondaki alarmla AYNI biçimde; zaman özgün tetik (25 dk kala).
        expect(ilk.id).toBe(`muhafiz_${BUGUN}_vakit_imsak_seviye_2_dk_25`);
        expect(ilk.sonMs - ilk.ms).toBe(25 * 60_000);
        expect(wearUyandirmaGecerliMi(liste)).toBe(true);
    });

    it('alarm kanalı yoksa, muhafız kapalıysa ya da imsak kılındıysa liste boş', () => {
        const temel = { koordinat: ISTANBUL, bugunIso: BUGUN, simdiMs: IMSAK_ONCESI };
        expect(wearUyandirmaListesiOlustur({ ...temel, muhafiz: { aktif: true, matris: tabanMatris(), kilinanlar: {} } })).toEqual([]);
        expect(wearUyandirmaListesiOlustur({ ...temel, muhafiz: { aktif: false, matris: alarmliMatris(), kilinanlar: {} } })).toEqual([]);
        const kilinmis = wearUyandirmaListesiOlustur({
            ...temel,
            ufukMs: 6 * 60 * 60 * 1000,
            muhafiz: { aktif: true, matris: alarmliMatris(), kilinanlar: { [BUGUN]: ['imsak'] } },
        });
        expect(kilinmis).toEqual([]);
    });

    it('teheccüd: uyandırma açıkken tetikleri listeye girer, kapalıyken girmez', () => {
        const ayar = (uyandirma: boolean): NafileAyarlari => ({
            ...VARSAYILAN_NAFILE_AYARLARI,
            teheccud: { ...VARSAYILAN_NAFILE_AYARLARI.teheccud, aktif: true, uyandirma },
        });
        const temel = { koordinat: ISTANBUL, bugunIso: BUGUN, simdiMs: bugunImsak.giris.getTime() + 3 * 60 * 60 * 1000 };
        const acik = wearUyandirmaListesiOlustur({ ...temel, nafile: { ayarlar: ayar(true) } });
        expect(acik.length).toBeGreaterThanOrEqual(1);
        expect(acik.every((k) => k.tur === 'teheccud' && k.id.startsWith('nafile_') && k.sonMs > k.ms)).toBe(true);
        expect(wearUyandirmaListesiOlustur({ ...temel, nafile: { ayarlar: ayar(false) } })).toEqual([]);
    });
});

describe('NÖBETÇİ (inceleme bulgusu 1) — kayıt pencere sonuna kadar taşınır, saatin cevabı uygulanır', () => {
    const girdi = (simdiMs: number, uyandirmaDurumlari?: Parameters<typeof wearUyandirmaListesiOlustur>[0]['uyandirmaDurumlari']) =>
        wearUyandirmaListesiOlustur({
            koordinat: ISTANBUL,
            bugunIso: BUGUN,
            simdiMs,
            uyandirmaDurumlari,
            muhafiz: { aktif: true, matris: alarmliMatris(), kilinanlar: {} },
        });
    const ilk = girdi(IMSAK_ONCESI)[0];

    it('tetik anı GEÇTİKTEN sonra gelen yük kaydı yine taşır (saat ertelemesini unutmasın)', () => {
        const sonra = girdi(ilk.ms + 5 * 60_000);
        expect(sonra.find((k) => k.id === ilk.id)?.ms).toBe(ilk.ms);
        expect(girdi(ilk.sonMs + 1_000).some((k) => k.id === ilk.id)).toBe(false);
    });

    it('saatte kapatılan kayıt gönderilmez; ertelenen yeni anıyla gider', () => {
        expect(girdi(ilk.ms + 60_000, { [ilk.id]: { islem: 'kapat' } }).some((k) => k.id === ilk.id)).toBe(false);
        const hedef = ilk.ms + 10 * 60_000;
        const ertelendi = girdi(ilk.ms + 60_000, { [ilk.id]: { islem: 'ertele', hedefMs: hedef } });
        expect(ertelendi.find((k) => k.id === ilk.id)?.ms).toBe(hedef);
    });

    it('teheccüd: geçmiş tetik de pencere sonuna kadar taşınır', () => {
        const ayar: NafileAyarlari = {
            ...VARSAYILAN_NAFILE_AYARLARI,
            teheccud: { ...VARSAYILAN_NAFILE_AYARLARI.teheccud, aktif: true, uyandirma: true },
        };
        const temel = { koordinat: ISTANBUL, bugunIso: BUGUN };
        const once = wearUyandirmaListesiOlustur({ ...temel, simdiMs: bugunImsak.giris.getTime() + 3 * 60 * 60 * 1000, nafile: { ayarlar: ayar } });
        const k = once[0];
        const sonra = wearUyandirmaListesiOlustur({ ...temel, simdiMs: k.ms + 60_000, nafile: { ayarlar: ayar } });
        expect(sonra.find((x) => x.id === k.id)?.ms).toBe(k.ms);
    });
});

describe('saat ayarları ve kapılar', () => {
    it('normalize bozuk kaydı varsayılana düşürür (asla fırlatmaz)', () => {
        expect(saatAyarlariniNormalize(null)).toEqual(VARSAYILAN_SAAT_AYARLARI);
        expect(saatAyarlariniNormalize({ uyandirmaYeri: 'kol', anonsYeri: 'ikisi' })).toEqual(VARSAYILAN_SAAT_AYARLARI);
        expect(saatAyarlariniNormalize({ uyandirmaYeri: 'ikisi', anonsYeri: 'saat' })).toEqual({
            uyandirmaYeri: 'ikisi',
            anonsYeri: 'saat',
        });
    });

    it('varsayılan = bugünkü davranış: telefon uyandırır, gecikme yok, telefon konuşur', () => {
        expect(saatUyandiriyorMu(VARSAYILAN_SAAT_AYARLARI)).toBe(false);
        expect(telefonYedegiGecikirMi(VARSAYILAN_SAAT_AYARLARI)).toBe(false);
        expect(telefonYedegiGecikirMi(undefined)).toBe(false);
        expect(telefonAnonsuKonusurMu(VARSAYILAN_SAAT_AYARLARI)).toBe(true);
        expect(telefonAnonsuKonusurMu(undefined)).toBe(true);
    });

    it('yedek gecikmesi yalnız "saat"te; "ikisi"nde ikisi aynı anda çalar', () => {
        expect(telefonYedegiGecikirMi({ uyandirmaYeri: 'saat', anonsYeri: 'otomatik' })).toBe(true);
        expect(telefonYedegiGecikirMi({ uyandirmaYeri: 'ikisi', anonsYeri: 'otomatik' })).toBe(false);
        expect(saatUyandiriyorMu({ uyandirmaYeri: 'ikisi', anonsYeri: 'otomatik' })).toBe(true);
    });

    it('telefon TTS yalnız "saat" seçilince susar (çift konuşma yok)', () => {
        expect(telefonAnonsuKonusurMu({ uyandirmaYeri: 'telefon', anonsYeri: 'saat' })).toBe(false);
        expect(telefonAnonsuKonusurMu({ uyandirmaYeri: 'telefon', anonsYeri: 'telefon' })).toBe(true);
    });

    it('uyandırma kapısı: imsak alarmı evet, öğle alarmı hayır; teheccüd uyandırma/alarm evet, kuşluk hayır', () => {
        expect(muhafizUyandirmasiMi('imsak', { alarm: true })).toBe(true);
        expect(muhafizUyandirmasiMi('imsak', {})).toBe(false);
        expect(muhafizUyandirmasiMi('ogle', { alarm: true })).toBe(false);
        const kanal = { bildirim: true };
        expect(nafileUyandirmasiMi({ tur: 'teheccud', uyandirma: true, uyari: { kanallar: kanal } })).toBe(true);
        expect(
            nafileUyandirmasiMi({ tur: 'teheccud', uyandirma: false, uyari: { alarm: true, kanallar: { alarm: true } } })
        ).toBe(true);
        expect(nafileUyandirmasiMi({ tur: 'teheccud', uyandirma: false, uyari: { kanallar: kanal } })).toBe(false);
        expect(nafileUyandirmasiMi({ tur: 'kusluk', uyandirma: true, uyari: { kanallar: kanal } })).toBe(false);
    });
});
