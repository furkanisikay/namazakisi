/**
 * Seri sekmesi "gök haritası" için aylık ızgarayı üretir. Her hücre bir gün;
 * ızgara PAZARTESİ başlar (haftaninBaslangiciniAl ile aynı hafta kuralı).
 *
 * SAF: React/Redux/AsyncStorage/native import yok, `new Date()` (güncel
 * zaman) çağrılmaz — `bugun` dışarıdan enjekte edilir.
 */
import {
  gunEkle,
  ayinSonGunuAl,
  haftaninBaslangiciniAl,
  ISOTarihiDateNesnesiNeCevir,
} from '../utils/TarihYardimcisi';

export type GunDurumu =
  | { tip: 'kilindi'; vakitler: readonly boolean[] } // uzunluk 5, NAMAZ_ISIMLERI sirasi
  | { tip: 'dondurulmus' }
  | { tip: 'gelecek' };

export interface IzgaraGunu {
  tarih: string; // ISO (yyyy-MM-dd)
  gunNo: number; // ayin gunu
  digerAy: boolean; // komsu ay — soluk cizilir ama GERCEKTIR
  durum: GunDurumu;
}

export interface AylikIzgaraGirdisi {
  yil: number;
  ay: number; // 0-tabanli (JS Date.getMonth() ile ayni)
  kayitlar: Record<string, boolean[]>; // tarih -> 5 vakit (NAMAZ_ISIMLERI sirasi)
  dondurulmusTarihler: ReadonlySet<string>;
  bugun: string; // ENJEKTE — core new Date() cagirmaz
}

// readonly: bu tek dizi tum kayitsiz gunler arasinda PAYLASILIR (bkz. asagidaki
// kullanim) — sunum katmani bunu mutasyona ugratirsa tum bos gunler birden
// bozulur. Tip sistemi bu riski engeller (kopyalamaya gerek yok, cunku hicbir
// tuketici mevcut olarak mutasyon yapmiyor; bkz. zincir.ts, gokErisimEtiketi.ts).
const BOS_VAKITLER: readonly boolean[] = [false, false, false, false, false];

const ikiHaneliAyStr = (ay: number): string => String(ay + 1).padStart(2, '0');

/**
 * Verilen yil/ay icin ekrana cizilecek izgaranin tarih araligini hesaplar
 * (ayin 1'inden once gelen/ayni gune denk gelen pazartesiden, ayin son
 * gununden sonra gelen/ayni gune denk gelen pazara kadar).
 *
 * TEK KAYNAK: bu aralik hem `aylikIzgaraOlustur` (asagida) hem de
 * `useSeriAyi` tarafindan `localTarihAraligindakiNamazlariGetir` cagrisinda
 * KULLANILMALI — once ikisi ayni 5 satiri ayri ayri hesapliyordu (inceleme
 * bulgusu). Bugun eslesiyorlardi ama tesadufe baglıydı: bu fonksiyonun
 * bitis kurali degisirse hook'un okuma araligi sessizce dar kalabilir ve
 * son hucreler bos gorunurdu.
 */
export function izgaraAraligi(yil: number, ay: number): { baslangic: string; bitis: string } {
  const ayinIlkGunuIso = `${yil}-${ikiHaneliAyStr(ay)}-01`;
  const ayinSonGunuIso = ayinSonGunuAl(ayinIlkGunuIso);

  const baslangic = haftaninBaslangiciniAl(ayinIlkGunuIso);
  const sonHaftaBaslangici = haftaninBaslangiciniAl(ayinSonGunuIso);
  const bitis = gunEkle(sonHaftaBaslangici, 6);

  return { baslangic, bitis };
}

/**
 * Verilen yil/ay icin aylik izgarayi olusturur.
 *
 * Izgara, ayin 1'inden once gelen (veya ayni gune denk gelen) pazartesiden,
 * ayin son gununden sonra gelen (veya ayni gune denk gelen) pazara kadar
 * doldurulur. Bu, aya gore 28, 35 veya 42 hucre uretebilir — "hep 35"
 * varsayimi YANLIS (ör. pazartesi baslayan 28 gunluk Subat).
 */
export function aylikIzgaraOlustur(g: AylikIzgaraGirdisi): IzgaraGunu[] {
  const { baslangic: izgaraBaslangici, bitis: izgaraBitisi } = izgaraAraligi(g.yil, g.ay);

  const izgara: IzgaraGunu[] = [];
  let mevcutTarih = izgaraBaslangici;

  while (mevcutTarih <= izgaraBitisi) {
    const tarihObj = ISOTarihiDateNesnesiNeCevir(mevcutTarih);
    const digerAy = tarihObj.getMonth() !== g.ay || tarihObj.getFullYear() !== g.yil;

    let durum: GunDurumu;
    if (mevcutTarih > g.bugun) {
      // Dondurulmus kontrolu kilinmisliktan ONCE gelir; ama gelecek gunler
      // ikisinden de once elenir — henuz yasanmamis bir gun ne kilinmis
      // ne dondurulmus olabilir.
      durum = { tip: 'gelecek' };
    } else if (g.dondurulmusTarihler.has(mevcutTarih)) {
      durum = { tip: 'dondurulmus' };
    } else {
      durum = { tip: 'kilindi', vakitler: g.kayitlar[mevcutTarih] ?? BOS_VAKITLER };
    }

    izgara.push({
      tarih: mevcutTarih,
      gunNo: tarihObj.getDate(),
      digerAy,
      durum,
    });

    mevcutTarih = gunEkle(mevcutTarih, 1);
  }

  return izgara;
}
