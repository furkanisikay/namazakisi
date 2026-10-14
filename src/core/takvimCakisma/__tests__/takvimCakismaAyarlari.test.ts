import {
    TAKVIM_CAKISMA_ONCE_MAX_DK,
    TAKVIM_CAKISMA_ONCE_MIN_DK,
    VARSAYILAN_TAKVIM_CAKISMA_AYARLARI,
    takvimCakismaAyarlariniNormalize,
} from '../takvimCakismaAyarlari';

describe('takvimCakismaAyarlariniNormalize', () => {
    it('varsayılan KAPALI, ad GİZLİ, 30 dk', () => {
        expect(VARSAYILAN_TAKVIM_CAKISMA_AYARLARI).toEqual({ aktif: false, oncedenDk: 30, baslikGoster: false });
        expect(takvimCakismaAyarlariniNormalize(null)).toEqual(VARSAYILAN_TAKVIM_CAKISMA_AYARLARI);
        expect(takvimCakismaAyarlariniNormalize('bozuk')).toEqual(VARSAYILAN_TAKVIM_CAKISMA_AYARLARI);
    });

    it('RIZA UYDURULAMAZ: rıza kaydı olmayan "açık" ayar KAPALI okunur', () => {
        expect(takvimCakismaAyarlariniNormalize({ aktif: true }).aktif).toBe(false);
        expect(takvimCakismaAyarlariniNormalize({ aktif: true, rizaZamani: 'tarih değil' }).aktif).toBe(false);
        const r = takvimCakismaAyarlariniNormalize({ aktif: true, rizaZamani: '2026-10-13T10:00:00.000Z' });
        expect(r).toMatchObject({ aktif: true, rizaZamani: '2026-10-13T10:00:00.000Z' });
    });

    it('süre sınırlara çekilir ve yuvarlanır; bozuk değer varsayılana düşer', () => {
        expect(takvimCakismaAyarlariniNormalize({ oncedenDk: 1 }).oncedenDk).toBe(TAKVIM_CAKISMA_ONCE_MIN_DK);
        expect(takvimCakismaAyarlariniNormalize({ oncedenDk: 9999 }).oncedenDk).toBe(TAKVIM_CAKISMA_ONCE_MAX_DK);
        expect(takvimCakismaAyarlariniNormalize({ oncedenDk: 44.6 }).oncedenDk).toBe(45);
        expect(takvimCakismaAyarlariniNormalize({ oncedenDk: 'x' }).oncedenDk).toBe(30);
    });

    it('baslikGoster yalnız açıkça true iken açık', () => {
        expect(takvimCakismaAyarlariniNormalize({ baslikGoster: 'true' }).baslikGoster).toBe(false);
        expect(takvimCakismaAyarlariniNormalize({ baslikGoster: true }).baslikGoster).toBe(true);
    });
});
