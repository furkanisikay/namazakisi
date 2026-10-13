/**
 * Seferîlik bilgi kartı — konum işleyici (issue #296). STORE'A BAĞIMLI DEĞİLDİR.
 *
 * Kararı saf çekirdek verir (`core/seferilik/seferilikKarari`); burası yalnız
 * kararın diske yansıyan iki yan etkisini uygular:
 * - İkamet hiç yoksa ilk geçerli konumu ikamet olarak yazar.
 * - İkamete dönüldüyse "bu yolculukta kapattım" hafızasını sıfırlar.
 *
 * İki yerden çağrılır: `KonumDegisikligiServisi.konumDegistiUygula` (arka plan
 * bölge çıkışı / onarım — kullanıcı uygulamayı açmadan eve dönse de hafıza
 * sıfırlansın) ve ana ekran kartı (uygulama açılışı + elle/manuel konum
 * değişimi — o yollar yayma listesinden geçmez). Kart bildirim GÖNDERMEZ;
 * şehir değişimini zaten `konumDegisimBildirimi` sessizce bildirir.
 *
 * NEDEN KART KONUMU DİSKTEN OKUR: `konumSlice`'ın başlangıç değeri İstanbul'dur
 * ve "yüklendi" bayrağı yoktur. Ana ekran açılış zinciri konumu diskten
 * okumadan çizilebilir; store'daki koordinatla karar verilseydi Erzurum'daki
 * kullanıcının ilk ikameti İstanbul yazılır ve ilk açılışta "≈870 km yolculuk"
 * kartı çıkardı. Disk kaydı yoksa (kurulum bitmemiş) hiçbir şey yazılmaz.
 */
import { Depolama } from '../../data/local/Depolama';
import { LocalSeferilikServisi } from '../../data/local/LocalSeferilikServisi';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import {
  konumKaydindanAd,
  seferilikDurumunuHesapla,
  type Koordinat,
  type KonumKaydiGirdisi,
} from '../../core/seferilik/seferilikKarari';
import {
  gecerliKoordinatMi,
  type SeferilikAyarlari,
  type SeferilikKartHafizasi,
} from '../../core/seferilik/seferilikAyarlari';

export interface SeferilikDiskDurumu {
  ayarlar: SeferilikAyarlari;
  hafiza: SeferilikKartHafizasi;
}

export interface SeferilikKonumluDurum extends SeferilikDiskDurumu {
  /** Diskteki (uygulamanın gerçekten kullandığı) konum; yoksa null. */
  konum: Koordinat | null;
  /** O konumun gösterim adı ("Burası evim" bunu kaydeder). */
  konumAdi?: string;
}

export const SeferilikServisi = {
  /** Konumu işler ve diskteki güncel durumu döndürür. Yazım hatası fırlatabilir; çağıran yakalar. */
  async konumIsle(konum: Koordinat, konumAdi?: string): Promise<SeferilikDiskDurumu> {
    let ayarlar = await LocalSeferilikServisi.ayarlariOku();
    let hafiza = await LocalSeferilikServisi.hafizaOku();
    const sonuc = seferilikDurumunuHesapla({ ayarlar, hafiza, konum, konumAdi });

    if (sonuc.yeniIkamet) {
      const yeniIkamet = sonuc.yeniIkamet;
      // Atomik: arada başka bir yol ikamet yazdıysa (ör. "Burası evim") EZME.
      ayarlar = await LocalSeferilikServisi.ayarlariGuncelle((m) =>
        m.ikamet ? m : { ...m, ikamet: yeniIkamet },
      );
    }
    if (sonuc.hafizaSifirla) {
      hafiza = await LocalSeferilikServisi.hafizaYaz({ yolculuktaKapatildi: false });
    }
    return { ayarlar, hafiza };
  },

  /**
   * Ana ekranın yolu: konumu DİSKTEKİ konum kaydından okur (bkz. dosya başı),
   * işler ve konumu da döndürür. Kayıt yoksa/bozuksa yalnız mevcut durumu okur.
   */
  async diskKonumunuIsle(): Promise<SeferilikKonumluDurum> {
    const kayit = await Depolama.oku<KonumKaydiGirdisi>(DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI);
    if (!kayit || typeof kayit !== 'object' || !gecerliKoordinatMi(kayit.koordinatlar)) {
      const [ayarlar, hafiza] = await Promise.all([
        LocalSeferilikServisi.ayarlariOku(),
        LocalSeferilikServisi.hafizaOku(),
      ]);
      return { ayarlar, hafiza, konum: null };
    }
    const konum: Koordinat = { lat: kayit.koordinatlar.lat, lng: kayit.koordinatlar.lng };
    const konumAdi = konumKaydindanAd(kayit);
    const durum = await SeferilikServisi.konumIsle(konum, konumAdi);
    return { ...durum, konum, konumAdi };
  },
};
