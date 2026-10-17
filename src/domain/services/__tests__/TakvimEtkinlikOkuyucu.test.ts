/**
 * Takvim izni isteği (issue #291, v0.31.0 iç testi): istek "verilmedi" derse
 * gerçek durum yeniden OKUNUR; `canAskAgain` doğru yolu (tekrar dene / ayarlar) seçer.
 */
const mockIste = jest.fn();
const mockOku = jest.fn();
const mockTakvimler = jest.fn();
const mockEtkinlikler = jest.fn();
jest.mock('expo-calendar/legacy', () => ({
    EntityTypes: { EVENT: 'event' },
    requestCalendarPermissionsAsync: (...a: unknown[]) => mockIste(...a),
    getCalendarPermissionsAsync: (...a: unknown[]) => mockOku(...a),
    getCalendarsAsync: (...a: unknown[]) => mockTakvimler(...a),
    getEventsAsync: (...a: unknown[]) => mockEtkinlikler(...a),
}));
const mockInfo = jest.fn();
jest.mock('../../../core/utils/Logger', () => ({
    Logger: { info: (...a: unknown[]) => mockInfo(...a), warn: jest.fn(), error: jest.fn() },
}));

import { cakismaEtkinlikleriniOku, takvimIzniIste } from '../TakvimEtkinlikOkuyucu';

beforeEach(() => {
    jest.clearAllMocks();
    mockIste.mockResolvedValue({ status: 'granted', canAskAgain: true, granted: true });
    mockOku.mockResolvedValue({ status: 'denied', canAskAgain: true, granted: false });
});

describe('takvimIzniIste', () => {
    it('istek verildiyse yeniden okumaz', async () => {
        await expect(takvimIzniIste()).resolves.toEqual({ verildi: true, tekrarSorulabilir: true });
        expect(mockOku).not.toHaveBeenCalled();
    });

    it('istek "denied" dese de okuma "granted" ise VERİLDİ sayılır', async () => {
        mockIste.mockResolvedValue({ status: 'denied', canAskAgain: true, granted: false });
        mockOku.mockResolvedValue({ status: 'granted', canAskAgain: true, granted: true });
        await expect(takvimIzniIste()).resolves.toEqual({ verildi: true, tekrarSorulabilir: true });
    });

    it('istek fırlatırsa da okuma belirler', async () => {
        mockIste.mockRejectedValue(new Error('Another permissions request is in progress'));
        mockOku.mockResolvedValue({ status: 'granted', canAskAgain: true, granted: true });
        await expect(takvimIzniIste()).resolves.toEqual({ verildi: true, tekrarSorulabilir: true });
    });

    it('kalıcı ret: canAskAgain false → tekrar sorulamaz; ham durum loglanır', async () => {
        mockIste.mockResolvedValue({ status: 'denied', canAskAgain: false, granted: false });
        mockOku.mockResolvedValue({ status: 'denied', canAskAgain: false, granted: false });
        await expect(takvimIzniIste()).resolves.toEqual({ verildi: false, tekrarSorulabilir: false });
        expect(mockInfo).toHaveBeenCalledWith('TakvimEtkinlikOkuyucu', expect.stringContaining('canAskAgain=false'));
    });

    it('ret ama yeniden sorulabilir', async () => {
        mockIste.mockResolvedValue({ status: 'denied', canAskAgain: true, granted: false });
        await expect(takvimIzniIste()).resolves.toEqual({ verildi: false, tekrarSorulabilir: true });
    });
});

describe('cakismaEtkinlikleriniOku — eşzamanlı çağrılar (Promise.all)', () => {
    const bas = new Date(2026, 9, 12);
    const bit = new Date(2026, 9, 20);
    const etkinlik = {
        startDate: new Date(2026, 9, 13, 14, 0).toISOString(),
        endDate: new Date(2026, 9, 13, 15, 0).toISOString(),
        allDay: false,
        availability: 'busy',
        status: 'confirmed',
        title: 'Toplantı',
        notes: '',
    };

    beforeEach(() => {
        mockOku.mockResolvedValue({ status: 'granted' });
        mockTakvimler.mockResolvedValue([{ id: 'is' }]);
        mockEtkinlikler.mockResolvedValue([etkinlik]);
    });

    it('aynı aralığın eşzamanlı okumaları TEK köprü turunu paylaşır, sonuçlar bağımsız kopyadır', async () => {
        const [a, b] = await Promise.all([cakismaEtkinlikleriniOku(bas, bit), cakismaEtkinlikleriniOku(bas, bit)]);
        expect(mockEtkinlikler).toHaveBeenCalledTimes(1);
        expect(a).toEqual(b);
        expect(a.durum === 'tamam' && b.durum === 'tamam' && a.etkinlikler !== b.etkinlikler).toBe(true);
    });

    it('ardışık okuma KALICI önbelleğe takılmaz (takvim dışarıdan değişir)', async () => {
        await cakismaEtkinlikleriniOku(bas, bit);
        await cakismaEtkinlikleriniOku(bas, bit);
        expect(mockEtkinlikler).toHaveBeenCalledTimes(2);
    });

    it('farklı aralıklar paylaşılmaz; hata paylaşılan çağrılara aynen döner ve sonraki tur yeniden dener', async () => {
        await Promise.all([cakismaEtkinlikleriniOku(bas, bit), cakismaEtkinlikleriniOku(bas, new Date(2026, 9, 21))]);
        expect(mockEtkinlikler).toHaveBeenCalledTimes(2);
        mockEtkinlikler.mockRejectedValueOnce(new Error('binder'));
        const [x, y] = await Promise.all([cakismaEtkinlikleriniOku(bas, bit), cakismaEtkinlikleriniOku(bas, bit)]);
        expect(x).toEqual({ durum: 'hata' });
        expect(y).toEqual({ durum: 'hata' });
        await expect(cakismaEtkinlikleriniOku(bas, bit)).resolves.toMatchObject({ durum: 'tamam' });
    });
});
