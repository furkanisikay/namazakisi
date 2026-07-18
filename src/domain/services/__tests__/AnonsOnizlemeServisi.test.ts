/**
 * Adim onizlemesi — MOD BASINA hangi seslerin calacagi ve SIRASI.
 *
 * Native TTS koprusu (`requireNativeModule`) jest'te yoktur → mock zorunlu
 * (AGENTS.md tuzagi). Ses calar da mock'lanir ki cagri sayisi olculebilsin.
 */
const mockPlanlaAnons = jest.fn();
jest.mock('../../../../modules/expo-countdown-notification/src', () => ({
  planlaAnons: (...args: unknown[]) => mockPlanlaAnons(...args),
}));

const mockBildirimSesiniCal = jest.fn().mockResolvedValue(undefined);
// `bitisiniBekle` GERCEKTE sesin bitisini yoklar (ust sinirli). Testte aninda
// coz: olculen sey SIRA (once ses, sonra anons), bekleme suresi degil.
const mockBitisiniBekle = jest.fn().mockResolvedValue(undefined);
jest.mock('../OnizlemeSesServisi', () => ({
  OnizlemeSesServisi: {
    bildirimSesiniCal: (...args: unknown[]) => mockBildirimSesiniCal(...args),
    bitisiniBekle: (...args: unknown[]) => mockBitisiniBekle(...args),
    temizle: jest.fn(),
  },
}));

import {
  adimiOnizle,
  anonsuOnizle,
  ONIZLEME_ANONS_ID,
  ONIZLEME_GECIKMESI_MS,
  BILDIRIM_SONRASI_ANONS_GECIKMESI_MS,
} from '../AnonsOnizlemeServisi';

const METIN = 'İkindi vakti çıkıyor, son 10 dakika.';

/** planlaAnons(id, zaman, metin) → butona basildiktan sonraki gecikme (ms). */
const anonsGecikmesi = () => mockPlanlaAnons.mock.calls[0][1] - Date.now();

describe('adimiOnizle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("'sessiz' modda hicbir sey calmaz", async () => {
    await adimiOnizle({ mod: 'sessiz', bildirimSesi: 'can', cozulmusMetin: METIN });

    expect(mockBildirimSesiniCal).not.toHaveBeenCalled();
    expect(mockPlanlaAnons).not.toHaveBeenCalled();
  });

  it("'bildirim' modunda YALNIZ bildirim sesi calar (TTS yok)", async () => {
    await adimiOnizle({ mod: 'bildirim', bildirimSesi: 'melodi', cozulmusMetin: METIN });

    expect(mockBildirimSesiniCal).toHaveBeenCalledWith('melodi');
    expect(mockPlanlaAnons).not.toHaveBeenCalled();
  });

  it("'sesli' modunda YALNIZ TTS calar (bildirim sesi yok)", async () => {
    await adimiOnizle({ mod: 'sesli', bildirimSesi: 'can', cozulmusMetin: METIN });

    expect(mockBildirimSesiniCal).not.toHaveBeenCalled();
    expect(mockPlanlaAnons).toHaveBeenCalledTimes(1);
    const [id, , metin] = mockPlanlaAnons.mock.calls[0];
    expect(id).toBe(ONIZLEME_ANONS_ID);
    expect(metin).toBe(METIN);
  });

  it("'ikisi' modunda IKISI DE calar; anons bildirim sesinin ARDINDAN gelir", async () => {
    await adimiOnizle({ mod: 'ikisi', bildirimSesi: 'alarm', cozulmusMetin: METIN });

    expect(mockBildirimSesiniCal).toHaveBeenCalledWith('alarm');
    expect(mockPlanlaAnons).toHaveBeenCalledTimes(1);
    // ANONS SESIN BITISINI BEKLER — sabit pay DEGIL. Sabit 1800 ms'lik eski
    // gerekce ("palet sesleri kisa") palet kalkinca gecersizlesti: kullanici
    // 3 dakikalik bir muzik secebilir ve anons ustune binerdi.
    expect(mockBitisiniBekle).toHaveBeenCalledWith('alarm');
    expect(anonsGecikmesi()).toBeCloseTo(BILDIRIM_SONRASI_ANONS_GECIKMESI_MS, -2);
  });

  it("bekleme yalniz-TTS'te YAPILMAZ (beklenecek bir ses yok)", async () => {
    await adimiOnizle({ mod: 'sesli', bildirimSesi: 'can', cozulmusMetin: METIN });

    expect(mockBitisiniBekle).not.toHaveBeenCalled();
  });

  it("yalniz-TTS'te gecikme kisa tutulur (gereksiz sessizlik olmasin)", async () => {
    await adimiOnizle({ mod: 'sesli', bildirimSesi: 'can', cozulmusMetin: METIN });

    expect(anonsGecikmesi()).toBeCloseTo(ONIZLEME_GECIKMESI_MS, -2);
  });

  it("'sesli' ama metin bossa konusma yapilmaz", async () => {
    await adimiOnizle({ mod: 'sesli', bildirimSesi: 'can', cozulmusMetin: '   ' });

    expect(mockPlanlaAnons).not.toHaveBeenCalled();
    expect(mockBildirimSesiniCal).not.toHaveBeenCalled();
  });

  it("'ikisi' ama metin bossa yalniz bildirim sesi calar", async () => {
    await adimiOnizle({ mod: 'ikisi', bildirimSesi: 'can', cozulmusMetin: '' });

    expect(mockBildirimSesiniCal).toHaveBeenCalledWith('can');
    expect(mockPlanlaAnons).not.toHaveBeenCalled();
  });

  it('ust uste basmak yeni alarm EKLEMEZ — id SABIT kalir (native ezer)', async () => {
    await adimiOnizle({ mod: 'sesli', bildirimSesi: 'can', cozulmusMetin: METIN });
    await adimiOnizle({ mod: 'sesli', bildirimSesi: 'can', cozulmusMetin: METIN });

    expect(mockPlanlaAnons).toHaveBeenCalledTimes(2);
    expect(mockPlanlaAnons.mock.calls.every((c) => c[0] === ONIZLEME_ANONS_ID)).toBe(true);
  });

  it('native planlama patlarsa UI dusmez', async () => {
    mockPlanlaAnons.mockImplementationOnce(() => {
      throw new Error('native yok');
    });

    await expect(
      adimiOnizle({ mod: 'sesli', bildirimSesi: 'can', cozulmusMetin: METIN })
    ).resolves.toBeUndefined();
  });
});

describe('anonsuOnizle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('bos metni sessizce yok sayar', async () => {
    anonsuOnizle('');
    anonsuOnizle('   ');

    expect(mockPlanlaAnons).not.toHaveBeenCalled();
  });

  it('gecikme verilmezse varsayilani kullanir', async () => {
    anonsuOnizle(METIN);

    expect(anonsGecikmesi()).toBeCloseTo(ONIZLEME_GECIKMESI_MS, -2);
  });
});
