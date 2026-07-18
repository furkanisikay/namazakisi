/**
 * Onizleme bildirim sesi calari — tekillik / basa sarma / serbest birakma.
 * `expo-audio` global moduleNameMapper mock'undan gelir (jest.config.js).
 */

/**
 * Servis modul-DUZEYINDE durum tutar (aktif calar, ses modu bayragi) → her test
 * taze bir kayit defteri ister.
 *
 * DIKKAT: `expo-audio` da AYNI izole defterden alinmalidir. Dosyanin tepesinde
 * `import { createAudioPlayer }` ile alinan ornek BASKA bir modul ornegidir ve
 * servisin kullandigi mock'u hic gormez ("0 kez cagrildi" yanilgisi).
 */
const tazeKur = () => {
  let servis!: typeof import('../OnizlemeSesServisi').OnizlemeSesServisi;
  let audio!: {
    createAudioPlayer: jest.Mock;
    setAudioModeAsync: jest.Mock;
  };
  jest.isolateModules(() => {
    audio = require('expo-audio');
    servis = require('../OnizlemeSesServisi').OnizlemeSesServisi;
  });

  /** En son olusturulan sahte calar. */
  const sonCalar = () => audio.createAudioPlayer.mock.results.at(-1)!.value;

  return { servis, audio, sonCalar };
};

describe('OnizlemeSesServisi', () => {
  it('sesi calar ve sessiz modda duyulsun diye ses modunu ayarlar', async () => {
    const { servis, audio, sonCalar } = tazeKur();

    await servis.bildirimSesiniCal('can');

    expect(audio.createAudioPlayer).toHaveBeenCalledTimes(1);
    expect(audio.setAudioModeAsync).toHaveBeenCalledWith(
      expect.objectContaining({ playsInSilentMode: true })
    );
    expect(sonCalar().play).toHaveBeenCalledTimes(1);
  });

  it('ust uste basinca ses UST USTE BINMEZ: tek calar, basa sarilir', async () => {
    const { servis, audio, sonCalar } = tazeKur();

    await servis.bildirimSesiniCal('can');
    const calar = sonCalar();
    await servis.bildirimSesiniCal('can');
    await servis.bildirimSesiniCal('can');

    // Ayni kaynak → yeni calar YARATILMAZ (sizinti yok), mevcut olan yeniden calar
    expect(audio.createAudioPlayer).toHaveBeenCalledTimes(1);
    expect(calar.play).toHaveBeenCalledTimes(3);
    // Calarken tekrar basilirsa durdurulur; HER seferinde basa sarilir —
    // aksi halde bitmis ses son konumunda kalir ve ikinci basista ses cikmaz.
    expect(calar.pause).toHaveBeenCalledTimes(2);
    expect(calar.seekTo).toHaveBeenCalledTimes(3);
    expect(calar.seekTo).toHaveBeenLastCalledWith(0);
  });

  it('ses modu yalniz BIR KEZ ayarlanir', async () => {
    const { servis, audio } = tazeKur();

    await servis.bildirimSesiniCal('can');
    await servis.bildirimSesiniCal('melodi');

    expect(audio.setAudioModeAsync).toHaveBeenCalledTimes(1);
  });

  it('temizle() calari serbest birakir ve sonraki calma yeni calar yaratir', async () => {
    const { servis, audio, sonCalar } = tazeKur();

    await servis.bildirimSesiniCal('can');
    const calar = sonCalar();
    servis.temizle();

    expect(calar.release).toHaveBeenCalledTimes(1);

    await servis.bildirimSesiniCal('can');
    expect(audio.createAudioPlayer).toHaveBeenCalledTimes(2);
  });

  it('temizle() idempotenttir (calar yokken patlamaz)', () => {
    const { servis } = tazeKur();

    expect(() => {
      servis.temizle();
      servis.temizle();
    }).not.toThrow();
  });

  it('calar olusturulamazsa sessizce vazgecer — UI dusmez', async () => {
    const { servis, audio } = tazeKur();
    audio.createAudioPlayer.mockImplementationOnce(() => {
      throw new Error('native yok');
    });

    await expect(servis.bildirimSesiniCal('can')).resolves.toBeUndefined();
  });

  it('bilinmeyen ses id patlamaz (varsayilana duser)', async () => {
    const { servis, sonCalar } = tazeKur();

    await expect(servis.bildirimSesiniCal('boyle-bir-ses-yok')).resolves.toBeUndefined();
    expect(sonCalar().play).toHaveBeenCalledTimes(1);
  });
});
