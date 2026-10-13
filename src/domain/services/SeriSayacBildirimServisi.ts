/**
 * Seri Sayaci Bildirim Servisi
 *
 * Seri gununun bitmesine kalan sureyi BUYUK bir geri sayimla gosterir (iftar ve
 * sahur sayaclariyla ayni native mekanizma). Amaci "bugunu kurtarmak icin hala
 * vakit var" demektir — bu yuzden yalnizca gun HENUZ TAM DEGILKEN cikar.
 *
 * STORE'A BAGIMLI DEGIL — TUM girdiler PARAMETREDIR. Bunun sebebi cuma
 * servisinden ogrenilen ders: `ArkaplanGorevServisi` headless calisir, orada
 * Redux YOKTUR. Servis store'dan okusaydi arka plan yolu SESSIZCE hicbir sey
 * yapmazdi — ve sayacin gorunmesi gereken pencere (imsak-2sa ≈ 01:30-04:30) tam
 * da kullanicinin uygulamayi acmadigi pencere oldugu icin ozellik pratikte hic
 * calismazdi.
 */

import { Platform } from 'react-native';
import { AndroidStyle } from '@notifee/react-native';
import { BILDIRIM_SABITLERI } from '../../core/constants/UygulamaSabitleri';
import { SERI_SAYAC_VARSAYILAN_ESIK_DK, sayacBaslamaliMi } from '../../core/seri/seriGunSonu';
import { bugunuAl } from '../../core/utils/TarihYardimcisi';
import { SayacBildirimTemeli, SayacKonfig } from './SayacBildirimTemeli';
import { SERI_SOZU } from '../../core/data/SeriSozu';
import { NOW_BAR_SON_DK_MAX } from '../../core/sayac/nowBar';

export interface SeriSayacAyarlari {
  /** Kullanici gun sonu hatirlatmasini acti mi? */
  aktif: boolean;
  /** Seri gununun bitisi = SU ANDAN SONRAKI ILK imsak (`sonrakiImsakVaktiBul`). */
  hedef: Date | null;
  /** Bugun zaten tam kilindiysa sayac HIC cikmaz. */
  seriBugunTamMi: boolean;
  /** Hedefe bu kadar kala baslar (dk). Verilmezse 2 saat. */
  esikDk?: number;
}

export class SeriSayacBildirimServisi extends SayacBildirimTemeli {
  private static instance: SeriSayacBildirimServisi;

  private constructor() { super(); }

  public static getInstance(): SeriSayacBildirimServisi {
    if (!SeriSayacBildirimServisi.instance) {
      SeriSayacBildirimServisi.instance = new SeriSayacBildirimServisi();
    }
    return SeriSayacBildirimServisi.instance;
  }

  protected get konfig(): SayacKonfig {
    return {
      idOneki: BILDIRIM_SABITLERI.ONEKLEME.SERI_SAYAC,
      kanalId: BILDIRIM_SABITLERI.KANALLAR.SERI_SAYAC,
      // Ilk surum — silinecek eski kanal yok; taban sinif silmeyi yok sayar.
      eskiKanalId: '',
      kanalAdi: 'Seri Sayacı',
      kanalAciklamasi: 'Seri gününün bitmesine geri sayım',
      // IBADETE CAGRI kaydi: "sen" + emir kipi (AGENTS.md bilincli istisnasi).
      countdownBaslik: '🔥 Serin Tehlikede',
      // Serinin dayandığı hadis (issue #72) genişletilmiş görünümde ikinci satırdır;
      // native taraf {time}/⏱️'i ayıklayıp kalanı açıklama alanına yazar.
      countdownBodyTemplate: `Bugünkü namazların eksik, serini kaybetme.\n«${SERI_SOZU.metin}» (Buhârî)\n⏱️ {time}`,
      themeType: 'seri',
      // Hedefte kaybolmali: chronometer sifiri gecince YUKARI sayar ve kullanici
      // "gun bitti" yerine artan bir sayac gorur.
      hedefteKaybol: true,
    };
  }

  /**
   * Sayaci kur ya da kaldir. HER cagrida once tumuyle temizler → idempotent;
   * arka plan gorevi 15 dk'da bir cagirabilir.
   */
  public async yapilandirVePlanla(ayarlar: SeriSayacAyarlari): Promise<void> {
    await this.tumBildirimleriniTemizle();

    if (Platform.OS !== 'android') return;
    // Gun zaten tamsa hatirlatacak bir sey yok — kalici bir bildirimle
    // kullaniciyi bosuna mesgul etme. Now Bar planlayıcısına da "aday yok".
    if (!ayarlar.aktif || ayarlar.seriBugunTamMi || !ayarlar.hedef) {
      return this.canliKaynagiBildir('seriSayac', []);
    }

    const simdi = new Date();
    const esik = ayarlar.esikDk ?? SERI_SAYAC_VARSAYILAN_ESIK_DK;
    const bildirimId = `${BILDIRIM_SABITLERI.ONEKLEME.SERI_SAYAC}${bugunuAl()}`;
    const hedefMs = ayarlar.hedef.getTime();

    // Now Bar (issue #282 ikinci aşama): seri YALNIZ kullanıcı Now Bar'da açarsa
    // öne çıkar (varsayılan kapalı — baskı hissi). Açıksa planlayıcı tam eşikte
    // (exact alarm) gösterir; bu servis kendi bildirimini kurmaz. "Son N dk"
    // seçimi en fazla `NOW_BAR_SON_DK_MAX` geriye uzanır.
    const karar = await this.canliKarari('seri');
    await this.canliKaynagiBildir('seriSayac', [
      this.canliAdayi(
        'seri',
        bildirimId,
        hedefMs - esik * 60 * 1000,
        hedefMs,
        { baslangicMs: hedefMs - esik * 60 * 1000, bolumler: [] },
        hedefMs - NOW_BAR_SON_DK_MAX * 60 * 1000
      ),
    ]);
    if (karar.devralir) return;
    if (!sayacBaslamaliMi(simdi, ayarlar.hedef, esik)) return;

    await this.kanalOlustur();
    // Eski yol seriyi öne ÇIKARMAZ (`canliGuncellemeyeUygunMu`).
    this.nativeCountdownBaslat(bildirimId, hedefMs);
  }

  /**
   * Taban sinif sozlesmesi geregi var; seri sayacinda "vakit girdi" bildirimi
   * YOKTUR (gun sonu hatirlatmasi ayri bir bildirim olarak zaten planlaniyor).
   */
  protected vakitGirdiBildirimIcerigi(bildirimId: string): any {
    return {
      id: bildirimId,
      title: '🔥 Seri Günü Bitti',
      body: 'Yeni gün başladı.',
      android: {
        channelId: this.konfig.kanalId,
        ongoing: false,
        autoCancel: true,
        timeoutAfter: 60 * 1000,
        pressAction: { id: 'default' },
        style: { type: AndroidStyle.BIGTEXT, text: 'Yeni gün başladı.' },
      },
    };
  }
}
