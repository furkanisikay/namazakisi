/**
 * Takvim izni isteği (issue #291, v0.31.0 iç testi): istek "verilmedi" derse
 * gerçek durum yeniden OKUNUR; `canAskAgain` doğru yolu (tekrar dene / ayarlar) seçer.
 */
const mockIste = jest.fn();
const mockOku = jest.fn();
jest.mock('expo-calendar/legacy', () => ({
    requestCalendarPermissionsAsync: (...a: unknown[]) => mockIste(...a),
    getCalendarPermissionsAsync: (...a: unknown[]) => mockOku(...a),
}));
const mockInfo = jest.fn();
jest.mock('../../../core/utils/Logger', () => ({
    Logger: { info: (...a: unknown[]) => mockInfo(...a), warn: jest.fn(), error: jest.fn() },
}));

import { takvimIzniIste } from '../TakvimEtkinlikOkuyucu';

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
