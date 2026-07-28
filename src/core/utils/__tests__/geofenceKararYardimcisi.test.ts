/**
 * Geofence karar yardimcisi testleri
 *
 * NÖBETÇİ: Buradaki iki kural, geofencing'e geçişin tek gerçek riskini kapatır.
 * expo-location `INITIAL_TRIGGER_EXIT`'i SABİT kodlar — bölge eklendiğinde cihaz
 * çemberin dışındaysa anında yeni bir çıkış olayı doğar. Bayat bir konuma
 * yeniden merkezlenmek bu yüzden sonsuz döngüye girer (her tur reverse-geocode +
 * tüm muhafız bildirimlerinin yeniden planlanması). `konumTazeMi` gevşetilirse
 * bu testler kırılmalıdır.
 */

import {
    konumTazeMi,
    olayIslenebilirMi,
    KONUM_TAZELIK_SINIRI_MS,
    GEOFENCE_OLAY_BEKLEMESI_MS,
} from '../geofenceKararYardimcisi';

const SIMDI = new Date('2026-07-27T12:00:00.000Z').getTime();

describe('konumTazeMi', () => {
    it('az once alinan sabitleme TAZE sayilmali', () => {
        expect(konumTazeMi(SIMDI - 5_000, SIMDI)).toBe(true);
    });

    it('tam sinirdaki sabitleme TAZE sayilmali (kapsayici ust sinir)', () => {
        expect(konumTazeMi(SIMDI - KONUM_TAZELIK_SINIRI_MS, SIMDI)).toBe(true);
    });

    it('sinirin 1ms otesindeki sabitleme BAYAT sayilmali', () => {
        expect(konumTazeMi(SIMDI - KONUM_TAZELIK_SINIRI_MS - 1, SIMDI)).toBe(false);
    });

    it('KRITIK: onbellekten gelen eski sabitleme (10dk) BAYAT olmali — dongu korumasi', () => {
        // Bu deger true donerse, uretim bayat merkeze yeniden kayit yapar ve
        // INITIAL_TRIGGER_EXIT sikí dongusu baslar.
        expect(konumTazeMi(SIMDI - 10 * 60 * 1000, SIMDI)).toBe(false);
    });

    it('zaman damgasi yoksa/gecersizse GUVENME (false)', () => {
        expect(konumTazeMi(undefined, SIMDI)).toBe(false);
        expect(konumTazeMi(null, SIMDI)).toBe(false);
        expect(konumTazeMi(NaN, SIMDI)).toBe(false);
        expect(konumTazeMi(Infinity, SIMDI)).toBe(false);
    });

    it('gelecek tarihli damga (saat kaymasi) GUVENILMEZ sayilmali', () => {
        expect(konumTazeMi(SIMDI + 60_000, SIMDI)).toBe(false);
    });

    it('sinir disaridan verilebilmeli', () => {
        expect(konumTazeMi(SIMDI - 30_000, SIMDI, 10_000)).toBe(false);
        expect(konumTazeMi(SIMDI - 30_000, SIMDI, 60_000)).toBe(true);
    });
});

describe('olayIslenebilirMi', () => {
    it('ilk olay (kayit yok) islenebilmeli', () => {
        expect(olayIslenebilirMi(null, SIMDI)).toBe(true);
        expect(olayIslenebilirMi(undefined, SIMDI)).toBe(true);
        expect(olayIslenebilirMi('', SIMDI)).toBe(true);
    });

    it('bekleme penceresi ICINDE gelen olay ATLANMALI (patlama korumasi)', () => {
        const sonOlay = new Date(SIMDI - 5_000).toISOString();
        expect(olayIslenebilirMi(sonOlay, SIMDI)).toBe(false);
    });

    it('bekleme suresi dolduktan sonraki olay islenebilmeli', () => {
        const sonOlay = new Date(SIMDI - GEOFENCE_OLAY_BEKLEMESI_MS).toISOString();
        expect(olayIslenebilirMi(sonOlay, SIMDI)).toBe(true);
    });

    it('gercek yolculuk araligi (saatler) elenmemeli', () => {
        const sonOlay = new Date(SIMDI - 3 * 60 * 60 * 1000).toISOString();
        expect(olayIslenebilirMi(sonOlay, SIMDI)).toBe(true);
    });

    it('BOZUK zaman damgasi takibi kalici KILITLEMEMELI (islenebilir)', () => {
        // Tek bir bozuk deger yuzunden konum takibi sonsuza kadar susmamali.
        expect(olayIslenebilirMi('bozuk-tarih', SIMDI)).toBe(true);
    });

    it('gelecek tarihli damga (saat geri alindi) kilitlenmeye yol acmamali', () => {
        const sonOlay = new Date(SIMDI + 60 * 60 * 1000).toISOString();
        expect(olayIslenebilirMi(sonOlay, SIMDI)).toBe(true);
    });

    it('bekleme suresi disaridan verilebilmeli', () => {
        const sonOlay = new Date(SIMDI - 30_000).toISOString();
        expect(olayIslenebilirMi(sonOlay, SIMDI, 10_000)).toBe(true);
        expect(olayIslenebilirMi(sonOlay, SIMDI, 60_000)).toBe(false);
    });
});
