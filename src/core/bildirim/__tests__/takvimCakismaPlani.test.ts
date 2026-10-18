import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import {
    ETKINLIK_AZAMI_SURE_DK,
    KAPLIYOR_AZAMI_ONCELIK_DK,
    KILMA_PAYI_DK,
    TAKVIM_CAKISMA_ID_ONEKI,
    etkinlikleriSuz,
    mesgulBloklariOlustur,
    takvimCakismaAnonsMetni,
    takvimCakismaKimligiMi,
    takvimCakismaKokuneAitMi,
    takvimCakismaMetniOlustur,
    takvimCakismaPlaniOlustur,
    takvimCakismaTetigi,
    vakitCakismasiniBul,
    type HamTakvimEtkinligi,
    type TakvimEtkinligi,
} from '../takvimCakismaPlani';
import { UYGULAMA_TAKVIM_NOTU, takvimCakismaAyarlariniNormalize } from '../../takvimCakisma/takvimCakismaAyarlari';
import { ekAdim } from '../../hatirlatma/adimDizisi';
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

    it('"tentative" (belki) — availability ya da status — meşgul SAYILMAZ (yanlış pozitif)', () => {
        expect(etkinlikleriSuz([ham({ availability: 'tentative' }), ham({ status: 'tentative', title: 'B' })]))
            .toEqual([]);
    });

    it('iOS "unavailable" ve durum bilgisi olmayan etkinlik meşgul sayılır', () => {
        expect(etkinlikleriSuz([
            ham({ availability: 'unavailable', title: 'A' }),
            ham({ availability: null, status: null, title: 'B' }),
        ])).toHaveLength(2);
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
    const ayarlar = { aktif: true, adimlar: [ekAdim(30)] };
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

    it('"kapliyor" tetiği girişten en fazla KAPLIYOR_AZAMI_ONCELIK_DK önce: sabah başlayan uzun toplantı', () => {
        // 09:00–16:25 benzeri: öğleden saatler önce başlayıp öğleyi tümden yutan blok.
        const e = { baslangicMs: pt.dhuhr.getTime() - 4 * SA, bitisMs: pt.asr.getTime() + 5 * DK, baslik: null };
        const plan = olustur([e]);
        expect(plan.map((k) => [k.vakit, k.tur])).toEqual([['ogle', 'kapliyor']]);
        expect(plan[0].zaman.getTime()).toBe(pt.dhuhr.getTime() - KAPLIYOR_AZAMI_ONCELIK_DK * DK);
        expect(KAPLIYOR_AZAMI_ONCELIK_DK).toBe(60);
    });

    it('kılınmış vakit, özel gün ve geçmiş tetik atlanır', () => {
        expect(olustur([toplanti], { kilinanlar: () => ['ikindi'] })).toEqual([]);
        expect(olustur([toplanti], { gunAtlanirMi: (t) => t === tarih })).toEqual([]);
        expect(olustur([toplanti], { simdi: new Date(toplanti.baslangicMs - 10 * DK) })).toEqual([]);
    });

    it('özellik kapalıysa ya da etkinlik yoksa plan boş', () => {
        expect(olustur([toplanti], { ayarlar: { aktif: false, adimlar: [ekAdim(30)] } })).toEqual([]);
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

/**
 * GÖÇ NÖBETÇİSİ — refactor ÖNCESİ üretici (DONDURULDU, 2026-10-17). Ortak modele (adım dizisi)
 * geçiş eski `{ oncedenDk }` kaydını BİREBİR aynı plana çevirmeli: aynı kimlik, aynı tetik,
 * aynı tür. Bu kopya DEĞİŞTİRİLMEZ; karar kuralı değişirse yalnız kararın kendisi
 * (`vakitCakismasiniBul`) ikisini birlikte etkiler.
 */
function eskiTakvimCakismaPlani(g: {
    koordinat: { lat: number; lng: number };
    oncedenDk: number;
    simdi: Date;
    gunSayisi: number;
    etkinlikler: readonly TakvimEtkinligi[];
}): { id: string; zamanMs: number; tur: string }[] {
    const bloklar = mesgulBloklariOlustur(g.etkinlikler);
    const coordinates = new Coordinates(g.koordinat.lat, g.koordinat.lng);
    const oncedenMs = Math.max(0, g.oncedenDk) * DK;
    const plan: { id: string; zamanMs: number; tur: string }[] = [];
    for (let i = -1; i < g.gunSayisi; i++) {
        const gun = new Date(g.simdi.getFullYear(), g.simdi.getMonth(), g.simdi.getDate() + i);
        const tarih = tarihiISOFormatinaCevir(gun);
        const pt = new PrayerTimes(coordinates, gun, CalculationMethod.Turkey());
        const yarin = new PrayerTimes(
            coordinates,
            new Date(gun.getFullYear(), gun.getMonth(), gun.getDate() + 1),
            CalculationMethod.Turkey()
        );
        const araliklar = {
            imsak: { girisMs: pt.fajr.getTime(), sonAnMs: pt.sunrise.getTime() },
            ogle: { girisMs: pt.dhuhr.getTime(), sonAnMs: pt.asr.getTime() },
            ikindi: { girisMs: pt.asr.getTime(), sonAnMs: gurubKerahatiBaslangiciMs(pt.maghrib.getTime()) },
            aksam: { girisMs: pt.maghrib.getTime(), sonAnMs: pt.isha.getTime() },
            yatsi: { girisMs: pt.isha.getTime(), sonAnMs: yarin.fajr.getTime() },
        };
        for (const vakit of ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'] as const) {
            const aralik = araliklar[vakit];
            const k = vakitCakismasiniBul(aralik, bloklar);
            if (!k) continue;
            const zamanMs =
                k.tur === 'once'
                    ? Math.max(k.blok.baslangicMs - oncedenMs, aralik.girisMs)
                    : Math.max(
                        Math.min(k.blok.baslangicMs, aralik.girisMs) - oncedenMs,
                        aralik.girisMs - KAPLIYOR_AZAMI_ONCELIK_DK * DK
                    );
            if (zamanMs <= g.simdi.getTime()) continue;
            plan.push({ id: `${TAKVIM_CAKISMA_ID_ONEKI}${tarih}_${vakit}`, zamanMs, tur: k.tur });
        }
    }
    return plan.sort((a, b) => a.zamanMs - b.zamanMs);
}

describe('ORTAK MODEL (plan §5.4): adım dizisi, göç, gizlilik', () => {
    const SIMDI = new Date(2026, 9, 12, 7, 0);
    const pt = (gunEk: number) =>
        new PrayerTimes(new Coordinates(ISTANBUL.lat, ISTANBUL.lng), new Date(2026, 9, 12 + gunEk), CalculationMethod.Turkey());
    const p0 = pt(0);
    const p1 = pt(1);
    const p2 = pt(2);
    const etkinlikler: TakvimEtkinligi[] = [
        // bugün ikindi: once
        {
            baslangicMs: p0.asr.getTime() + 60 * DK,
            bitisMs: gurubKerahatiBaslangiciMs(p0.maghrib.getTime()) + 20 * DK,
            baslik: 'Gizli toplantı',
        },
        // yarın öğle: kapliyor (sabahtan uzun blok)
        { baslangicMs: p1.dhuhr.getTime() - 4 * SA, bitisMs: p1.asr.getTime() + 5 * DK, baslik: 'Atölye' },
        // +2 akşam: girişten 15 dk sonra başlayan (once, tabana kenetlenir)
        { baslangicMs: p2.maghrib.getTime() + 15 * DK, bitisMs: p2.isha.getTime() + 10 * DK, baslik: null },
    ];
    const olustur = (
        ayarlar: Parameters<typeof takvimCakismaPlaniOlustur>[0]['ayarlar'],
        ek: Partial<Parameters<typeof takvimCakismaPlaniOlustur>[0]> = {}
    ) => takvimCakismaPlaniOlustur({ koordinat: ISTANBUL, ayarlar, simdi: SIMDI, gunSayisi: 3, etkinlikler, ...ek });

    it.each([10, 30, 45, 120])('ESKİ kayıt (oncedenDk %i) göçten sonra dondurulmuş üreticiyle BİREBİR aynı plan', (dk) => {
        const ayar = takvimCakismaAyarlariniNormalize({ aktif: true, oncedenDk: dk, rizaZamani: '2026-10-01T00:00:00.000Z' });
        expect(ayar.adimlar).toHaveLength(1);
        expect(ayar.oncedenDk).toBe(dk);
        const yeni = olustur(ayar).map((k) => ({ id: k.id, zamanMs: k.zaman.getTime(), tur: k.tur }));
        const eski = eskiTakvimCakismaPlani({ koordinat: ISTANBUL, oncedenDk: dk, simdi: SIMDI, gunSayisi: 3, etkinlikler });
        expect(eski.length).toBe(3);
        expect(yeni).toEqual(eski);
    });

    it('çok adım + tekrar: tetikler çapaya kadar, tabana kenetlenenler TEK uyarıda birleşir, kimlikler tekil', () => {
        const plan = olustur({ aktif: true, adimlar: [ekAdim(60), ekAdim(30, { herDk: 10 })] });
        expect(new Set(plan.map((k) => k.id)).size).toBe(plan.length);
        // once (bugün ikindi): blok − 60, −30, −20, −10.
        const ikindi = plan.filter((k) => k.vakit === 'ikindi');
        const bas = etkinlikler[0].baslangicMs;
        expect(ikindi.map((k) => k.zaman.getTime())).toEqual([bas - 60 * DK, bas - 30 * DK, bas - 20 * DK, bas - 10 * DK]);
        expect(ikindi[0].id).toMatch(/_ikindi$/);
        expect(ikindi.slice(1).map((k) => k.id.split('_').pop())).toEqual(['30', '20', '10']);
        // +2 akşam: blok girişten 15 dk sonra → −60/−30/−20 girişe kenetlenir (TEK), −10 ayrı.
        const aksam = plan.filter((k) => k.vakit === 'aksam');
        expect(aksam.map((k) => k.zaman.getTime())).toEqual([p2.maghrib.getTime(), etkinlikler[2].baslangicMs - 10 * DK]);
        expect(aksam[0].id).toMatch(/_aksam$/);
        // kapliyor (yarın öğle): taban = giriş − 60; çapa blok başı (giriş − 4 sa) → hepsi TEK tetik.
        const ogle = plan.filter((k) => k.vakit === 'ogle');
        expect(ogle.map((k) => k.zaman.getTime())).toEqual([p1.dhuhr.getTime() - KAPLIYOR_AZAMI_ONCELIK_DK * DK]);
    });

    it('REGRESYON: tabana yığılan adımlarda GÜÇLÜ kanal düşmez (120 dk bildirim + 30 dk gerçek alarm)', () => {
        // 09:00–16:25 benzeri toplantı yarın öğleyi kaplar: iki adım da giriş − 60'a kenetlenir.
        // Eskiden motor sırasındaki ilki (yalnız bildirim) kalıyor, alarm sessizce kayboluyordu.
        const plan = olustur({
            aktif: true,
            baslikGoster: true,
            adimlar: [
                { ...ekAdim(120), kanallar: { bildirim: true } },
                { ...ekAdim(30), kanallar: { bildirim: true, titresim: true, alarm: true } },
            ],
        });
        const ogle = plan.filter((k) => k.vakit === 'ogle');
        expect(ogle).toHaveLength(1);
        expect(ogle[0].zaman.getTime()).toBe(p1.dhuhr.getTime() - KAPLIYOR_AZAMI_ONCELIK_DK * DK);
        // Kimlik: çakışmanın İLK tetiği kökü korur.
        expect(ogle[0].id).toMatch(/_ogle$/);
        expect(ogle[0].uyari.alarm).toBe(true);
        expect(ogle[0].uyari.kanallar).toEqual({ bildirim: true, titresim: true, alarm: true });
        // Gerçek alarm tetiği kilit ekranında açılır → ad (ayar açık olsa bile) YOK.
        expect(`${ogle[0].baslik} ${ogle[0].govde}`).not.toContain('Atölye');
        // Ters sıra (güçlü adım önce) da aynı sonucu verir.
        const ters = olustur({
            aktif: true,
            adimlar: [
                { ...ekAdim(120), kanallar: { bildirim: true, sesli: true } },
                { ...ekAdim(30), kanallar: { bildirim: true } },
            ],
        }).filter((k) => k.vakit === 'ogle');
        expect(ters).toHaveLength(1);
        expect(ters[0].uyari.kanallar).toEqual({ bildirim: true, sesli: true });
        expect(ters[0].uyari.sesliAnons).toBe(true);
    });

    it('her kaydın cikis alanı tetikten SONRA (gerçek alarm doğar doğmaz atlanmasın)', () => {
        const plan = olustur({ aktif: true, adimlar: [ekAdim(120), ekAdim(15, { herDk: 5 })] });
        expect(plan.length).toBeGreaterThan(0);
        for (const k of plan) expect(k.cikis.getTime()).toBeGreaterThan(k.zaman.getTime());
        // kapliyor: blok vakitten saatler önce başladı → cikis = giriş (blok başı DEĞİL).
        const ogle = plan.find((k) => k.vakit === 'ogle');
        expect(ogle?.cikis.getTime()).toBe(p1.dhuhr.getTime());
    });

    it('GİZLİLİK: gerçek alarm tetiğinde metin ADSIZ; anons metni hiçbir tetikte ad/saat taşımaz', () => {
        const plan = olustur({
            aktif: true,
            baslikGoster: true,
            adimlar: [
                { ...ekAdim(60), kanallar: { bildirim: true, sesli: true, alarm: true } },
                { ...ekAdim(30, { herDk: 10 }), kanallar: { bildirim: true, sesli: true } },
            ],
        });
        const ikindi = plan.filter((k) => k.vakit === 'ikindi');
        expect(ikindi[0].uyari.alarm).toBe(true);
        expect(`${ikindi[0].baslik} ${ikindi[0].govde}`).not.toContain('Gizli');
        // Alarm OLMAYAN tetikte ayar açık → ad bildirimde görünür.
        expect(ikindi[1].uyari.alarm).not.toBe(true);
        expect(ikindi[1].govde).toContain('Gizli toplantı');
        for (const k of plan) {
            expect(k.uyari.anonsMetni).not.toContain('Gizli');
            expect(k.uyari.anonsMetni).not.toMatch(/\d{2}:\d{2}/);
        }
    });

    it('anons metni kibar "siz", fıkıh/üslup nöbetçisi', () => {
        for (const tur of ['once', 'kapliyor'] as const) {
            for (const vakit of ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'] as const) {
                const m = takvimCakismaAnonsMetni(vakit, tur).toLocaleLowerCase('tr-TR');
                expect(m).toContain('takviminizdeki');
                expect(m).toContain('unutmayın');
                expect(m).not.toMatch(/secde|terk|küfür/);
            }
        }
        expect(takvimCakismaAnonsMetni('imsak', 'once')).toBe(
            'Takviminizdeki bir etkinlik sabah vaktine denk geliyor. Etkinlikten önce kılmayı unutmayın.'
        );
    });

    it('Android alarm payı KRONOLOJİK keser', () => {
        const ayar = { aktif: true, adimlar: [{ ...ekAdim(60, { herDk: 5 }), kanallar: { bildirim: true, sesli: true } }] };
        const tam = olustur(ayar);
        const kesik = olustur(ayar, { alarmButcesi: 6 });
        expect(tam.length).toBeGreaterThan(3);
        expect(kesik).toEqual(tam.slice(0, 3));
    });

    it('kimlik kökü sınır kontrollü eşleşir', () => {
        const kok = `${TAKVIM_CAKISMA_ID_ONEKI}2026-10-12_ogle`;
        expect(takvimCakismaKokuneAitMi(kok, kok)).toBe(true);
        expect(takvimCakismaKokuneAitMi(`${kok}_20`, kok)).toBe(true);
        expect(takvimCakismaKokuneAitMi(`${TAKVIM_CAKISMA_ID_ONEKI}2026-10-12_oglex`, kok)).toBe(false);
        expect(takvimCakismaKokuneAitMi(`${TAKVIM_CAKISMA_ID_ONEKI}2026-10-12_ikindi`, kok)).toBe(false);
    });
});

describe('SESLİ OKUMA {süre} — asla negatif (Opus incelemesi #1)', () => {
    const SIMDI = new Date(2026, 9, 12, 7, 0);
    const gun = new Date(2026, 9, 12);
    const pt = new PrayerTimes(new Coordinates(ISTANBUL.lat, ISTANBUL.lng), gun, CalculationMethod.Turkey());
    // 09:00–16:25 toplantı: öğleyi tümden kaplar (kapliyor).
    const toplanti: TakvimEtkinligi = {
        baslangicMs: new Date(2026, 9, 12, 9, 0).getTime(),
        bitisMs: new Date(2026, 9, 12, 16, 25).getTime(),
        baslik: null,
    };

    it('kapliyor: {süre} vakit GİRİŞİNE kalan dakika (çapaya göre "-174" DEĞİL)', () => {
        const plan = takvimCakismaPlaniOlustur({
            koordinat: ISTANBUL,
            ayarlar: { aktif: true, adimlar: [{ ...ekAdim(30), kanallar: { bildirim: true, sesli: true }, anonsMetni: '{vakit} için {süre} dakika.' }] },
            simdi: SIMDI,
            gunSayisi: 1,
            etkinlikler: [toplanti],
        });
        const ogle = plan.find((k) => k.vakit === 'ogle');
        expect(ogle?.tur).toBe('kapliyor');
        const beklenen = Math.round((pt.dhuhr.getTime() - ogle!.zaman.getTime()) / DK);
        expect(beklenen).toBeGreaterThan(0);
        expect(ogle?.uyari.anonsMetni).toBe(`Öğle için ${beklenen} dakika.`);
        expect(ogle?.uyari.anonsMetni).not.toMatch(/-\d/);
    });

    it('takvimCakismaTetigi: once → etkinliğe, kapliyor → girişe kalan; hiçbir girdide negatif yok', () => {
        const giris = Date.UTC(2026, 9, 12, 10, 0);
        expect(takvimCakismaTetigi({ tur: 'once', girisMs: giris, blokBaslangicMs: giris + 60 * DK }, 30)).toEqual({
            zamanMs: giris + 30 * DK,
            sureDk: 30,
        });
        // once, tabana (girişe) kenetlenen: etkinliğe 15 dk.
        expect(takvimCakismaTetigi({ tur: 'once', girisMs: giris, blokBaslangicMs: giris + 15 * DK }, 60).sureDk).toBe(15);
        // kapliyor, blok 4 sa önce: tetik giriş − 60, ölçü 60.
        expect(takvimCakismaTetigi({ tur: 'kapliyor', girisMs: giris, blokBaslangicMs: giris - 240 * DK }, 30)).toEqual({
            zamanMs: giris - 60 * DK,
            sureDk: 60,
        });
        for (const k of [1, 10, 30, 60, 120]) {
            for (const fark of [-600, -61, -30, 0, 15, 90]) {
                for (const tur of ['once', 'kapliyor'] as const) {
                    expect(takvimCakismaTetigi({ tur, girisMs: giris, blokBaslangicMs: giris + fark * DK }, k).sureDk).toBeGreaterThanOrEqual(0);
                }
            }
        }
    });
});
