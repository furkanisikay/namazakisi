/**
 * Seferîlik bilgi kartı metinleri (issue #296) — saf.
 *
 * KAYIT: arayüz metnidir, ibadete çağrı DEĞİL → kibar "siz" dili; emir/hüküm
 * kipi YOK ("kılmalısınız", "caizdir", "seferîsiniz" yazılmaz). Mezhep görüşü
 * Diyanet'e atıfla aktarılır, kullanıcının durumu hakkında karar verilmez.
 * Nöbetçi test (`seferilikMetni.test.ts`) yasak kipleri tarar.
 *
 * Her madde birincil DİYK metnine dayanır — kaynak notu:
 * `docs/superpowers/specs/2026-10-13-seferilik-bilgi-karti-kaynaklar.md`.
 * Birincil metni bulunmayan iddia (ör. kasrın Hanefî'de azimet olması) karta
 * KONMADI; yeni madde eklerken önce birincil kaynağı nota ekleyin.
 */
import { bicim, metin } from '../dil/aktifDil';
import { kmMetni } from './seferilikKarari';
import { MEZHEP_ADLARI, type Mezhep } from './seferilikAyarlari';

export interface KaynakBaglantisi {
  /** Bağlantının görünen adı (fetvanın sorusu). */
  etiket: string;
  url: string;
}

/** Din İşleri Yüksek Kurulu fetvaları (kurul.diyanet.gov.tr). */
export const SEFERILIK_KAYNAKLARI = {
  /** ≈90 km, Hanefî 15 gün / Şâfiî 4 gün, kasr. */
  vatan: {
    get etiket() {
      return metin().seferilik.kaynaklar.vatan;
    },
    url: 'https://kurul.diyanet.gov.tr/tr/fetva/seferi-sayilma-bakimindan-bulunulan-yerleri-ifade-eden/0193c42d-5c14-7784-0d36-180562700f47',
  },
  /** Cem: Hanefî'de Arafat/Müzdelife; diğer mezheplerde sefer mazereti. */
  cem: {
    get etiket() {
      return metin().seferilik.kaynaklar.cem;
    },
    url: 'https://kurul.diyanet.gov.tr/tr/fetva/namazlar-cem-edilmek-birlestirilmek-suretiyle-kilinabilir-mi/0193c42d-4df6-7e81-a5ab-dc99c59adece',
  },
  /** Yolculuğun ne zaman başladığı (meskûn mahalden çıkış). */
  baslangic: {
    get etiket() {
      return metin().seferilik.kaynaklar.baslangic;
    },
    url: 'https://kurul.diyanet.gov.tr/tr/fetva/seferiligin-baslangici-nasil-belirlenir/0193c42d-5c2b-7ba0-4ab5-e2b35365b083',
  },
  /** Ziyaret bağlamında aynı ölçüler. */
  ziyaret: {
    get etiket() {
      return metin().seferilik.kaynaklar.ziyaret;
    },
    url: 'https://kurul.diyanet.gov.tr/tr/fetva/anne-babasinin-yasadigi-beldeye-giden-kisi-seferi-olur-mu/0193c42d-5d08-7c36-6d03-f4153952d330',
  },
} satisfies Record<string, KaynakBaglantisi>;

/** Ayarlar sayfasında listelenen kaynaklar (sıra: en genelden özele). */
export const SEFERILIK_KAYNAK_LISTESI: readonly KaynakBaglantisi[] = [
  SEFERILIK_KAYNAKLARI.vatan,
  SEFERILIK_KAYNAKLARI.cem,
  SEFERILIK_KAYNAKLARI.baslangic,
  SEFERILIK_KAYNAKLARI.ziyaret,
];

/** Kart ve ayar sayfasında aynen kullanılan uyarı cümlesi. */
export const seferilikBilgiNotu = (): string => metin().seferilik.bilgiNotu;

export interface SeferilikKartMetni {
  baslik: string;
  mesafeSatiri: string;
  /** Mezhebe göre kısa bilgi maddeleri. */
  maddeler: string[];
  not: string;
  /** "Diyanet'te okuyun" düğmesinin açacağı ana fetva. */
  kaynak: KaynakBaglantisi;
}

/** Ana ekran kartının metni. `mesafeKm` ikamete kuş uçuşu uzaklıktır. */
export function seferilikKartMetniOlustur(mezhep: Mezhep, mesafeKm: number): SeferilikKartMetni {
  const m = metin().seferilik;
  return {
    baslik: m.baslik,
    mesafeSatiri: bicim(m.mesafeSatiri, { km: kmMetni(mesafeKm), mezhep: MEZHEP_ADLARI[mezhep] }),
    maddeler: [...m.maddeler[mezhep]],
    not: m.bilgiNotu,
    kaynak: SEFERILIK_KAYNAKLARI.vatan,
  };
}

/** Ayarlar listesindeki satır özeti. */
export function seferilikOzeti(kartAcik: boolean, mezhep: Mezhep): string {
  const m = metin().seferilik;
  return kartAcik ? bicim(m.ozetAcik, { mezhep: MEZHEP_ADLARI[mezhep] }) : m.ozetKapali;
}
