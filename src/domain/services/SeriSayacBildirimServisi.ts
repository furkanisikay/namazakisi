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
      countdownBodyTemplate: 'Bugünkü namazların eksik, serini kaybetme.\n⏱️ {time}',
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
    if (!ayarlar.aktif) return;
    // Gun zaten tamsa hatirlatacak bir sey yok — kalici bir bildirimle
    // kullaniciyi bosuna mesgul etme.
    if (ayarlar.seriBugunTamMi) return;

    const simdi = new Date();
    const esik = ayarlar.esikDk ?? SERI_SAYAC_VARSAYILAN_ESIK_DK;
    if (!sayacBaslamaliMi(simdi, ayarlar.hedef, esik)) return;

    await this.kanalOlustur();
    this.nativeCountdownBaslat(
      `${BILDIRIM_SABITLERI.ONEKLEME.SERI_SAYAC}${bugunuAl()}`,
      (ayarlar.hedef as Date).getTime()
    );
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
