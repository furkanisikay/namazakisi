/**
 * Cuma PLAN üreticisi — ortak model (plan §5.1).
 *
 * GÖÇ NÖBETÇİSİ: eski (tek ofsetli) kayıt, göçten sonra yeni üreticide BİREBİR aynı
 * `{id, zaman, ilkMi, oncedenDk}` listesini üretmeli. Eski üretici bu dosyada DONDURULDU
 * (refactor öncesi `core/bildirim/cumaPlani.ts`'in birebir kopyası) — yeni kod değiştikçe
 * karşılaştırma tabanı kaymasın.
 */
import { Coordinates, PrayerTimes } from 'adhan';
import { turkiyeHesapParametreleri } from '../../vakit/hesapParametreleri';
import type { Siklik } from '../../muhafiz/matrisTipleri';
import { vakitUyariPlaniOlustur } from '../../muhafiz/motorAdaptoru';
import { tarihiISOFormatinaCevir } from '../../utils/TarihYardimcisi';
import { hatirlatmaZamaniHesapla, sonrakiCumalar, CUMA_NASSI } from '../../utils/cumaYardimcisi';
import type { VakitMuhafizAyari } from '../../muhafiz/matrisTipleri';
import { VARSAYILAN_SES } from '../../muhafiz/matrisTipleri';
import { cumaAyarlariniNormalize } from '../../cuma/cumaAyarlari';
import { ekAdim } from '../../hatirlatma/adimDizisi';
import { cumaPlaniOlustur, CUMA_ID_ONEKI, PLANLANACAK_CUMA_SAYISI } from '../cumaPlani';
import { ekAlarmKurarMi, ekAnonsAlarmiKurarMi } from '../../hatirlatma/ekPlan';

/** DONDURULMUŞ eski pencere (refactor öncesi `cumaYardimcisi.cumaPenceresiOlustur`). */
const cumaPenceresiOlustur = (oncedenDk: number, siklik: Siklik): VakitMuhafizAyari => ({
    yon: 'cikisaDogru',
    seviyeler: [{ kademe: 'nazik', kanallar: { bildirim: true }, esikDk: oncedenDk, siklik, bildirimSesi: VARSAYILAN_SES, anonsMetni: '' }],
});

/** DONDURULMUŞ eski üretici (refactor öncesi). */
function eskiCumaPlani(
    koordinat: { lat: number; lng: number },
    ayarlar: { aktif: boolean; oncedenDk: number; siklik: Siklik },
    simdi: Date
): { id: string; zaman: Date; oncedenDk: number; ilkMi: boolean }[] {
    if (!ayarlar.aktif) return [];
    const coordinates = new Coordinates(koordinat.lat, koordinat.lng);
    const params = turkiyeHesapParametreleri();
    const pencere = cumaPenceresiOlustur(ayarlar.oncedenDk, ayarlar.siklik);
    const adimlar = vakitUyariPlaniOlustur(pencere, ayarlar.oncedenDk).map((a) => a.kalanDk);
    const plan: { id: string; zaman: Date; oncedenDk: number; ilkMi: boolean }[] = [];
    for (const cuma of sonrakiCumalar(simdi, PLANLANACAK_CUMA_SAYISI)) {
        const iso = tarihiISOFormatinaCevir(cuma);
        const ogleVakti = new PrayerTimes(coordinates, cuma, params).dhuhr;
        for (const [sira, kalanDk] of adimlar.entries()) {
            const zaman = hatirlatmaZamaniHesapla(ogleVakti, kalanDk);
            if (zaman.getTime() <= simdi.getTime()) continue;
            const ilkMi = sira === 0;
            plan.push({ id: ilkMi ? `${CUMA_ID_ONEKI}${iso}` : `${CUMA_ID_ONEKI}${iso}_${kalanDk}`, zaman, oncedenDk: kalanDk, ilkMi });
        }
    }
    return plan;
}

const ISTANBUL = { lat: 41.0082, lng: 28.9784 };
const ESKI_KAYITLAR: { aktif: boolean; oncedenDk: number; siklik: Siklik }[] = [
    { aktif: true, oncedenDk: 60, siklik: 'birkez' },
    { aktif: true, oncedenDk: 15, siklik: 'birkez' },
    { aktif: true, oncedenDk: 180, siklik: 'birkez' },
    { aktif: true, oncedenDk: 90, siklik: { herDk: 15 } },
    { aktif: true, oncedenDk: 180, siklik: { herDk: 5 } },
    { aktif: true, oncedenDk: 45, siklik: { herDk: 60 } },
    { aktif: false, oncedenDk: 60, siklik: 'birkez' },
];
// Çarşamba sabahı, cuma sabahı (o hafta dahil) ve cuma hatırlatma penceresinin ORTASI.
const ANLAR = [new Date(2026, 7, 5, 9, 0), new Date(2026, 7, 7, 8, 0), new Date(2026, 7, 7, 12, 30)];

describe('cumaPlaniOlustur — GÖÇ: eski kayıt BİREBİR aynı plan', () => {
    for (const kayit of ESKI_KAYITLAR) {
        for (const simdi of ANLAR) {
            it(`${JSON.stringify(kayit)} @ ${simdi.toISOString()}`, () => {
                const eski = eskiCumaPlani(ISTANBUL, kayit, simdi);
                const yeni = cumaPlaniOlustur(ISTANBUL, cumaAyarlariniNormalize(kayit), simdi).map((k) => ({
                    id: k.id,
                    zaman: k.zaman,
                    oncedenDk: k.oncedenDk,
                    ilkMi: k.ilkMi,
                }));
                expect(yeni).toEqual(eski);
            });
        }
    }
});

describe('cumaPlaniOlustur — çok adım, metin, alarm/anons, pay', () => {
    const SIMDI = new Date(2026, 7, 5, 9, 0);

    it('çok adım: cumanın İLK tetiği tarihsel kimliği alır, diğerleri `_<k>`; kronolojik', () => {
        const plan = cumaPlaniOlustur(ISTANBUL, { aktif: true, adimlar: [ekAdim(90), ekAdim(30)] }, SIMDI);
        const ilkCuma = plan.filter((k) => k.tarih === '2026-08-07');
        expect(ilkCuma.map((k) => k.id)).toEqual(['cuma_hatirlatma_2026-08-07', 'cuma_hatirlatma_2026-08-07_30']);
        expect(ilkCuma.map((k) => k.ilkMi)).toEqual([true, false]);
        for (let i = 1; i < plan.length; i++) expect(plan[i].zaman.getTime()).toBeGreaterThan(plan[i - 1].zaman.getTime());
        // Pencere sonu = öğle girişi.
        expect(ilkCuma[0].ogle.getTime() - ilkCuma[0].zaman.getTime()).toBe(90 * 60000);
    });

    it('nass yalnız İLK tetikte; anons metni nass İÇERMEZ ve öğle girişine kalan süreyi söyler', () => {
        const plan = cumaPlaniOlustur(ISTANBUL, { aktif: true, adimlar: [ekAdim(90, { herDk: 30 })] }, SIMDI);
        const ilkCuma = plan.filter((k) => k.tarih === '2026-08-07');
        expect(ilkCuma[0].govde).toContain(CUMA_NASSI);
        for (const k of ilkCuma.slice(1)) expect(k.govde).not.toContain('62/9');
        for (const k of plan) {
            expect(k.uyari.anonsMetni).not.toContain('62/9');
            expect(k.uyari.anonsMetni).toMatch(/^Cuma için öğle vaktine .+ kaldı\. Hazırlan, camiye yola çık\.$/);
            // Fıkıh nöbetçisi: secde/terk dili yok.
            expect(`${k.govde} ${k.uyari.anonsMetni}`).not.toMatch(/secde|terk/i);
        }
    });

    it('gerçek alarm yalnız adımın İLK tetiğinde; sesli adımda anons alarmı sayılır', () => {
        const plan = cumaPlaniOlustur(
            ISTANBUL,
            { aktif: true, adimlar: [ekAdim(60, { herDk: 30 }, { bildirim: true, sesli: true, alarm: true })] },
            SIMDI
        );
        const ilkCuma = plan.filter((k) => k.tarih === '2026-08-07');
        expect(ilkCuma.map((k) => ekAlarmKurarMi(k))).toEqual([true, false]);
        expect(ilkCuma.map((k) => ekAnonsAlarmiKurarMi(k))).toEqual([false, true]);
    });

    it('Android payı KRONOLOJİK keser (en uzak cumalar düşer)', () => {
        const ayar = { aktif: true, adimlar: [ekAdim(180, { herDk: 5 })] };
        const tam = cumaPlaniOlustur(ISTANBUL, ayar, SIMDI);
        const kesik = cumaPlaniOlustur(ISTANBUL, ayar, SIMDI, () => false, { alarmButcesi: 10 });
        expect(kesik).toEqual(tam.slice(0, 10));
    });

    it('özel gün: aralıktaki cuma atlanır, ufuk kaymaz', () => {
        const ayar = { aktif: true, adimlar: [ekAdim(60)] };
        const plan = cumaPlaniOlustur(ISTANBUL, ayar, SIMDI, (iso) => iso === '2026-08-14');
        expect(plan.map((k) => k.tarih)).toEqual(['2026-08-07', '2026-08-21', '2026-08-28']);
    });

    it('tüm adımlar kapalıysa plan boş', () => {
        expect(cumaPlaniOlustur(ISTANBUL, { aktif: true, adimlar: [ekAdim(60, 'birkez', {})] }, SIMDI)).toEqual([]);
    });
});
