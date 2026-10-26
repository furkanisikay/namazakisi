/**
 * Yazı yönü (soldan sağa / sağdan sola) — etkin dilin yönünü native tarafa yazar ve yön
 * değişince uygulamayı yeniden başlatır.
 *
 * `I18nManager.isRTL` yalnız uygulama BAŞLARKEN okunur (Android SharedPreferences, iOS
 * NSUserDefaults): `allowRTL`/`forceRTL` bu çalıştırmayı değil bir sonrakini etkiler. Soldan
 * sağa dilde `allowRTL(false)` da yazılır: varsayılan `allowRTL = true` olduğu için cihaz dili
 * Arapça olan telefonda Türkçe arayüz aynalanıyordu.
 *
 * YALNIZ ön plan (App.tsx, dil seçimi) çağırır; headless/arka plan giriş noktaları ÇAĞIRMAZ
 * (çizilen arayüz yoktur, yeniden başlatma arka plan görevini öldürür). Store'a bağımlı değil.
 */
import { I18nManager } from 'react-native';
import { Depolama } from '../../data/local/Depolama';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import { aktifDil } from '../../core/dil/aktifDil';
import { sagdanSolaMi } from '../../core/dil/yon';

/** Açılışta yön eşleşmezse yapılacak en fazla sessiz yeniden başlatma (sonsuz döngü YOK). */
export const YON_AZAMI_DENEME = 2;

export type AcilisYonSonucu = 'hazir' | 'yenidenBaslatiliyor';

const ANAHTAR = DEPOLAMA_ANAHTARLARI.YON_DENEMESI;

export const YonServisi = {
  /** Etkin dil sağdan sola mı? */
  istenenSagdanSola(): boolean {
    return sagdanSolaMi(aktifDil());
  },

  /**
   * Etkin dilin yönünü native'e yazar (bir sonraki başlatmada geçerli). Asla fırlatmaz.
   * Yazılan yön sağdan solaysa `true`.
   */
  uygula(): boolean {
    const rtl = YonServisi.istenenSagdanSola();
    try {
      I18nManager.allowRTL(rtl);
      I18nManager.forceRTL(rtl);
    } catch (e) {
      Logger.warn('YonServisi', 'Yazı yönü yazılamadı', e);
    }
    return rtl;
  },

  /** Çizilen yön istenenden farklı mı (yeniden başlatma bekliyor)? */
  bekliyorMu(): boolean {
    return Boolean(I18nManager.isRTL) !== YonServisi.istenenSagdanSola();
  },

  /**
   * Uygulamayı hemen yeniden başlatır. Native köprü yoksa (eski build, jest) ya da
   * başlatılamazsa `false` → çağıran ertelenmiş gibi davranır. Asla fırlatmaz.
   */
  async yenidenBaslat(): Promise<boolean> {
    try {
      // Tembel require: native köprü jest'te yoktur (AGENTS.md).
      const { yenidenBaslat } = require('../../../modules/expo-sistem-durumu/src') as typeof import('../../../modules/expo-sistem-durumu/src');
      return await yenidenBaslat();
    } catch (e) {
      Logger.warn('YonServisi', 'Yeniden başlatılamadı', e);
      return false;
    }
  },

  /**
   * Açılış kapısı (dil yüklendikten sonra, İLK ÇİZİMDEN ÖNCE): yönü yazar; çizilen yön farklıysa
   * kullanıcı henüz bir şey görmeden sessizce yeniden başlatır. Deneme sayacı DİSKTEDİR (JS
   * belleği yeniden başlatmada sıfırlanır): en fazla `YON_AZAMI_DENEME`, yön eşleşince silinir;
   * tükenirse ya da sayaç yazılamazsa yalnız loglanır ve açılış sürer. ASLA reddetmez.
   */
  async acilistaDenetle(): Promise<AcilisYonSonucu> {
    YonServisi.uygula();
    if (!YonServisi.bekliyorMu()) {
      try {
        if ((await Depolama.oku<unknown>(ANAHTAR)) != null) await Depolama.sil(ANAHTAR);
      } catch {
        // Sayaç silinemedi: bir sonraki eşleşmeyen açılışta daha az deneme kalır, zararsız.
      }
      return 'hazir';
    }
    let deneme: number;
    try {
      // Sayaç yeniden başlatmadan ÖNCE diske yazılmış olmalı (yükleme JS'i öldürür).
      // Tükenince YON_AZAMI_DENEME + 1'de durur (her açılışta büyümez).
      deneme = await Depolama.guncelle<number>(ANAHTAR, (m) =>
        Math.min((typeof m === 'number' && m >= 0 ? m : 0) + 1, YON_AZAMI_DENEME + 1)
      );
    } catch (e) {
      Logger.warn('YonServisi', 'Yön deneme sayacı yazılamadı, yeniden başlatılmıyor', e);
      return 'hazir';
    }
    if (deneme > YON_AZAMI_DENEME) {
      Logger.warn('YonServisi', `Yazı yönü ${YON_AZAMI_DENEME} yeniden başlatmada eşleşmedi; bu açılışta denenmiyor`);
      return 'hazir';
    }
    Logger.info('YonServisi', `Yazı yönü eşleşmiyor, yeniden başlatılıyor (deneme ${deneme})`);
    return (await YonServisi.yenidenBaslat()) ? 'yenidenBaslatiliyor' : 'hazir';
  },
};
