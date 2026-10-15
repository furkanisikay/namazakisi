import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from 'adhan';
import { turkiyeHesapParametreleri } from '../hesapParametreleri';

/**
 * NÖBETÇİ: ikindi = asr-ı evvel (Diyanet takvimi). Hanefî asr-ı sânî'ye geçmek
 * ikindiyi ~40-45 dk kaydırır; bu test o "düzeltmeyi" görünür kılar.
 */
describe('turkiyeHesapParametreleri', () => {
    it('Diyanet (Turkey) yöntemi + asr-ı evvel (Madhab.Shafi, gölge 1×)', () => {
        const p = turkiyeHesapParametreleri();
        const turkey = CalculationMethod.Turkey();
        expect(p.method).toBe(turkey.method);
        expect(p.fajrAngle).toBe(turkey.fajrAngle);
        expect(p.ishaAngle).toBe(turkey.ishaAngle);
        expect(p.madhab).toBe(Madhab.Shafi);
        expect(p.madhab).not.toBe(Madhab.Hanafi);
    });

    it('her çağrı YENİ nesne döndürür (bir çağıranın değişikliği ötekine sızmaz)', () => {
        const a = turkiyeHesapParametreleri();
        a.madhab = Madhab.Hanafi;
        expect(turkiyeHesapParametreleri().madhab).toBe(Madhab.Shafi);
    });

    it('ikindi Hanefî asr-ı sânî\'den belirgin ÖNCEDİR (İstanbul, Ekim)', () => {
        const konum = new Coordinates(41.0082, 28.9784);
        const gun = new Date(2026, 9, 14);
        const evvel = new PrayerTimes(konum, gun, turkiyeHesapParametreleri()).asr.getTime();
        const saniParam = CalculationMethod.Turkey();
        saniParam.madhab = Madhab.Hanafi;
        const sani = new PrayerTimes(konum, gun, saniParam).asr.getTime();
        const farkDk = (sani - evvel) / 60_000;
        expect(farkDk).toBeGreaterThan(30);
        expect(farkDk).toBeLessThan(70);
    });
});
