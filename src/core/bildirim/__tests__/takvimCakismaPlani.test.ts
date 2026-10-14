import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import {
    ETKINLIK_AZAMI_SURE_DK,
    KILMA_PAYI_DK,
    TAKVIM_CAKISMA_ID_ONEKI,
    etkinlikleriSuz,
    mesgulBloklariOlustur,
    takvimCakismaKimligiMi,
    takvimCakismaMetniOlustur,
    takvimCakismaPlaniOlustur,
    vakitCakismasiniBul,
    type HamTakvimEtkinligi,
    type TakvimEtkinligi,
} from '../takvimCakismaPlani';
import { UYGULAMA_TAKVIM_NOTU } from '../../takvimCakisma/takvimCakismaAyarlari';
import { gurubKerahatiBaslangiciMs } from '../../muhafiz/erteleme';
import { tarihiISOFormatinaCevir } from '../../utils/TarihYardimcisi';

const DK = 60_000;
const SA = 60 * DK;
const ISTANBUL = { lat: 41.0082, lng: 28.9784 };

/** Sentetik vakit: giriş 0, son an 180 dk (ör. öğle 13:00–16:00). */
const T0 = Date.UTC(2026, 9, 12, 10, 0);
const VAKIT = { girisMs: T0, sonAnMs: T0 + 180 * DK };
const etk = (basDk: number, bitDk: number, baslik: string | null = null): TakvimEtkinligi => ({
    baslangicMs: T0 + basDk * DK,
    bitisMs: T0 + bitDk * DK,
    baslik,
});
const karar = (...etkinlikler: TakvimEtkinligi[]) => vakitCakismasiniBul(VAKIT, mesgulBloklariOlustur(etkinlikler));

describe('vakitCakismasiniBul — KARAR TABLOSU (nöbetçi)', () => {
    it('etkinlik vakit ortasında başlar, çıkıştan SONRA biter → "once"', () => {
        expect(karar(etk(60, 210))?.tur).toBe('once');
    });

    it('etkinlik bitince vaktin çıkmasına tam PAY kalıyorsa çakışma YOK (sınır: kılınabilir)', () => {
        expect(karar(etk(60, 180 - KILMA_PAYI_DK))).toBeNull();
    });

    it('etkinlik bitince PAY\'dan 1 dk az kalıyorsa çakışma VAR', () => {
        expect(karar(etk(60, 180 - KILMA_PAYI_DK + 1))?.tur).toBe('once');
    });

    it('etkinlik vaktin son PAY dakikasında başlıyorsa kayıp önemsiz → uyarı YOK', () => {
        expect(karar(etk(180 - KILMA_PAYI_DK, 240))).toBeNull();
        expect(karar(etk(180 - KILMA_PAYI_DK - 1, 240))?.tur).toBe('once');
    });

    it('vakit içinde biten (kısa) etkinlik → çakışma YOK', () => {
        expect(karar(etk(30, 90))).toBeNull();
    });

    it('vakit girmeden başlayıp vakti baştan sona kaplayan → "kapliyor"', () => {
        expect(karar(etk(-60, 200))?.tur).toBe('kapliyor');
    });

    it('girişten PAY\'dan az sonra başlayan → "kapliyor" (önce kılacak zaman yok)', () => {
        expect(karar(etk(KILMA_PAYI_DK - 1, 200))?.tur).toBe('kapliyor');
        expect(karar(etk(KILMA_PAYI_DK, 200))?.tur).toBe('once');
    });

    it('art arda toplantılar (arada PAY\'dan kısa boşluk) TEK blok sayılır', () => {
        const k = karar(etk(60, 120), etk(125, 200));
        expect(k?.tur).toBe('once');
        expect(k?.blok.baslangicMs).toBe(T0 + 60 * DK);
        expect(k?.blok.etkinlikler).toHaveLength(2);
    });

    it('arada PAY kadar boşluk varsa bloklar AYRI kalır ve o boşlukta kılınabilir', () => {
        // 120–130 boşluk: ikinci blok sondur ama ondan önce boşluk var → "once"
        const k = karar(etk(-30, 120), etk(120 + KILMA_PAYI_DK, 200));
        expect(k?.tur).toBe('once');
        expect(k?.blok.baslangicMs).toBe(T0 + (120 + KILMA_PAYI_DK) * DK);
    });

    it('girişten önceki blokla birleşmiş kapsama: boşluk yoksa "kapliyor"', () => {
        expect(karar(etk(-30, 5), etk(10, 200))?.tur).toBe('kapliyor');
    });
});

describe('etkinlikleriSuz', () => {
    const ham = (o: Partial<HamTakvimEtkinligi>): HamTakvimEtkinligi => ({
        startDate: new Date(T0).toISOString(),
        endDate: new Date(T0 + SA).toISOString(),
        allDay: false,
        availability: 'busy',
        status: 'confirmed',
        title: 'Toplantı',
        notes: '',
        ...o,
    });

    it('tüm gün, "meşgul değil", iptal, kendi namaz etkinliğimiz atlanır', () => {
        const sonuc = etkinlikleriSuz([
            ham({ allDay: true }),
            ham({ availability: 'free' }),
            ham({ status: 'canceled' }),
            ham({ notes: `x ${UYGULAMA_TAKVIM_NOTU}` }),
            ham({ title: 'Kalan' }),
        ]);
        expect(sonuc).toEqual([{ baslangicMs: T0, bitisMs: T0 + SA, baslik: 'Kalan' }]);
    });

    it('"tentative" (belki) ve iOS "unavailable" meşgul sayılır', () => {
        expect(etkinlikleriSuz([ham({ availability: 'tentative' }), ham({ availability: 'unavailable', title: 'B' })]))
            .toHaveLength(2);
    });

    it('bozuk tarih, ters aralık ve 8 saatten uzun etkinlik atlanır; Date nesnesi kabul edilir', () => {
        const sonuc = etkinlikleriSuz([
            ham({ startDate: 'bozuk' }),
            ham({ endDate: new Date(T0 - DK) }),
            ham({ endDate: new Date(T0 + (ETKINLIK_AZAMI_SURE_DK + 1) * DK) }),
            ham({ startDate: new Date(T0), endDate: new Date(T0 + ETKINLIK_AZAMI_SURE_DK * DK), title: null }),
        ]);
        expect(sonuc).toEqual([{ baslangicMs: T0, bitisMs: T0 + ETKINLIK_AZAMI_SURE_DK * DK, baslik: null }]);
    });

    it('iki takvimde görünen aynı etkinlik tekilleşir; sonuç sıralıdır', () => {
        const sonuc = etkinlikleriSuz([
            ham({ startDate: new Date(T0 + SA), endDate: new Date(T0 + 2 * SA), title: 'İkinci' }),
            ham({}),
            ham({}),
        ]);
        expect(sonuc.map((e) => e.baslik)).toEqual(['Toplantı', 'İkinci']);
    });
});

describe('takvimCakismaPlaniOlustur (gerçek vakitler, İstanbul)', () => {
    const SIMDI = new Date(2026, 9, 12, 7, 0); // 12 Ekim 2026 sabah
    const gun = new Date(2026, 9, 12);
    const pt = new PrayerTimes(new Coordinates(ISTANBUL.lat, ISTANBUL.lng), gun, CalculationMethod.Turkey());
    const tarih = tarihiISOFormatinaCevir(gun);
    const ayarlar = { aktif: true, oncedenDk: 30 };
    const ikindiSonAn = gurubKerahatiBaslangiciMs(pt.maghrib.getTime());

    const olustur = (etkinlikler: TakvimEtkinligi[], ek: Partial<Parameters<typeof takvimCakismaPlaniOlustur>[0]> = {}) =>
        takvimCakismaPlaniOlustur({ koordinat: ISTANBUL, ayarlar, simdi: SIMDI, gunSayisi: 3, etkinlikler, ...ek });

    // İkindinin son uygun anını 20 dk aşan, ikindi girdikten 60 dk sonra başlayan toplantı.
    const toplanti: TakvimEtkinligi = {
        baslangicMs: pt.asr.getTime() + 60 * DK,
        bitisMs: ikindiSonAn + 20 * DK,
        baslik: 'Proje toplantısı',
    };

    it('ikindinin sonunu yutan toplantı → tek "once" uyarısı, toplantıdan 30 dk önce', () => {
        const plan = olustur([toplanti]);
        expect(plan).toHaveLength(1);
        expect(plan[0]).toMatchObject({
            id: `${TAKVIM_CAKISMA_ID_ONEKI}${tarih}_ikindi`,
            vakit: 'ikindi',
            tarih,
            tur: 'once',
            sonAnMs: ikindiSonAn,
        });
        expect(plan[0].zaman.getTime()).toBe(toplanti.baslangicMs - 30 * DK);
        expect(takvimCakismaKimligiMi(plan[0].id)).toBe(true);
    });

    it('İKİNDİ son anı = gurub kerahati başı (çıkış değil): kerahate taşan toplantı da yakalanır', () => {
        // Çıkışa (akşam) 15 dk kala biten toplantı: çıkışa göre çakışma YOK, kerahate göre VAR.
        const e = { ...toplanti, bitisMs: pt.maghrib.getTime() - 15 * DK };
        expect(olustur([e]).map((k) => k.vakit)).toEqual(['ikindi']);
    });

    it('bildirim vakit GİRMEDEN kurulmaz: toplantı girişten 15 dk sonraysa tetik giriş anıdır', () => {
        const e = { ...toplanti, baslangicMs: pt.asr.getTime() + 15 * DK };
        expect(olustur([e])[0].zaman.getTime()).toBe(pt.asr.getTime());
    });

    it('vakti tümden kaplayan blok → "kapliyor", tetik min(blok başı, giriş) − öncedenDk', () => {
        const e = { baslangicMs: pt.dhuhr.getTime() - 30 * DK, bitisMs: pt.asr.getTime() + 5 * DK, baslik: null };
        const plan = olustur([e]);
        expect(plan.map((k) => [k.vakit, k.tur])).toEqual([['ogle', 'kapliyor']]);
        expect(plan[0].zaman.getTime()).toBe(e.baslangicMs - 30 * DK);
    });

    it('kılınmış vakit, özel gün ve geçmiş tetik atlanır', () => {
        expect(olustur([toplanti], { kilinanlar: () => ['ikindi'] })).toEqual([]);
        expect(olustur([toplanti], { gunAtlanirMi: (t) => t === tarih })).toEqual([]);
        expect(olustur([toplanti], { simdi: new Date(toplanti.baslangicMs - 10 * DK) })).toEqual([]);
    });

    it('özellik kapalıysa ya da etkinlik yoksa plan boş', () => {
        expect(olustur([toplanti], { ayarlar: { aktif: false, oncedenDk: 30 } })).toEqual([]);
        expect(olustur([])).toEqual([]);
    });

    it('ufuk dışındaki gün planlanmaz (gunSayisi)', () => {
        const ileri = {
            ...toplanti,
            baslangicMs: toplanti.baslangicMs + 5 * 24 * SA,
            bitisMs: toplanti.bitisMs + 5 * 24 * SA,
        };
        expect(olustur([ileri], { gunSayisi: 3 })).toEqual([]);
        expect(olustur([ileri], { gunSayisi: 7 })).toHaveLength(1);
    });
});

describe('takvimCakismaMetniOlustur', () => {
    const kayit = {
        vakit: 'ikindi' as const,
        tur: 'once' as const,
        girisMs: new Date(2026, 9, 12, 16, 2).getTime(),
        sonAnMs: new Date(2026, 9, 12, 18, 15).getTime(),
        blokBaslangicMs: new Date(2026, 9, 12, 17, 0).getTime(),
        blokBitisMs: new Date(2026, 9, 12, 18, 30).getTime(),
        etkinlikSayisi: 1,
        tekBaslik: 'Bütçe toplantısı',
    };

    it('başlık önden okunur (vakit adı başta), etkinlik ADI varsayılan GİZLİ', () => {
        const m = takvimCakismaMetniOlustur(kayit, { baslikGoster: false });
        expect(m.baslik).toBe('İkindi · etkinlik 17:00 · önce kıl');
        expect(m.govde).toBe(
            'Takvimindeki bir etkinlik 17:00–18:30 arası sürüyor; ikindi için son uygun an 18:15 (sonrası kerahat). Etkinlik başlamadan ikindi namazını kıl.'
        );
        expect(`${m.baslik} ${m.govde}`).not.toContain('Bütçe');
    });

    it('ad yalnız ayar AÇIKKEN ve tek etkinlikte yazılır', () => {
        expect(takvimCakismaMetniOlustur(kayit, { baslikGoster: true }).govde).toContain('“Bütçe toplantısı”');
        expect(
            takvimCakismaMetniOlustur({ ...kayit, etkinlikSayisi: 2, tekBaslik: null }, { baslikGoster: true }).govde
        ).toContain('Takvimindeki 2 etkinlik art arda');
    });

    it('ikindi dışında çıkış saati yazılır; "kapliyor" ara vermeyi önerir', () => {
        const ogle = { ...kayit, vakit: 'ogle' as const };
        expect(takvimCakismaMetniOlustur(ogle, { baslikGoster: false }).govde).toContain('öğle vaktinin çıkışı 18:15');
        const k = takvimCakismaMetniOlustur({ ...ogle, tur: 'kapliyor' }, { baslikGoster: false });
        expect(k.baslik).toBe('Öğle · etkinlik vakti kaplıyor');
        expect(k.govde).toContain('öğle vaktini (16:02–18:15) kaplıyor');
    });

    it('fıkıh/üslup nöbetçisi: "secde", terk/küfür dili ve saate hal eki YOK', () => {
        for (const tur of ['once', 'kapliyor'] as const) {
            for (const vakit of ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'] as const) {
                const m = takvimCakismaMetniOlustur({ ...kayit, tur, vakit }, { baslikGoster: false });
                const metin = `${m.baslik} ${m.govde}`.toLocaleLowerCase('tr-TR');
                expect(metin).not.toMatch(/secde|terk|küfür/);
                expect(metin).not.toMatch(/\d{2}:\d{2}'/);
            }
        }
    });
});
