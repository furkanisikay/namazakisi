import { cogul } from '../../tipler';

/** Alan sözlüğü: ilerleme (sekme başlığı, kılma oranı, seviye ve rozetler). Kaynak Türkçe; aynı anahtarlar her dilde (`Sozluk` tipi). */
export const ilerleme = {
  baslik: 'İlerleme',
  kilma: {
    baslik: 'Kılma oranı',
    haftalik: 'Haftalık',
    /** Mağaza betikleri (Maestro, simülatör) Türkçe "Aylık" etiketini arar — Türkçesini değiştirmeyin. */
    aylik: 'Aylık',
    donemErisim: 'Kılma oranı dönemi',
    hesaplaniyor: 'Kılma oranınız hesaplanıyor',
    bosBaslik: 'Henüz kayıt yok',
    bosAciklama: 'Namazlarınızı işaretledikçe burada görünür.',
    yuzde: '%{n}',
    kilinan: 'Kılınan',
    oran: 'Oran',
    enIyiGun: 'En iyi gün',
    haftaHedefi: 'Bu haftanın hedefi',
    hedefAlt: cogul({ one: 'Seri hedefinize göre: günde {n} vakit', other: 'Seri hedefinize göre: günde {n} vakit' }),
    kilinanNamaz: 'Kılınan namaz',
    hedefeUlasan: 'Hedefe ulaşan gün',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Namaz kılınan gün',
    vakitVakit: 'Vakit vakit',
    yuzdeErisim: '{ad}: yüzde {n}',
  },
  rozetler: {
    baslik: 'Seviye ve rozetler',
    seviye: 'Seviye {n}',
    puan: 'Puan',
    kalanErisim: cogul({ one: '{rank} seviyesine {n} puan kaldı', other: '{rank} seviyesine {n} puan kaldı' }),
    enYuksek: 'En yüksek seviyedesiniz',
    kalan: cogul({ one: '{rank} için {n} puan kaldı', other: '{rank} için {n} puan kaldı' }),
    kilinanErisim: cogul({ one: '{n} namaz kılındı', other: '{n} namaz kılındı' }),
    namaz: cogul({ one: 'namaz', other: 'namaz' }),
    rozetErisim: '{toplam} rozetten {n} tanesi kazanıldı',
    rozet: cogul({ one: 'rozet', other: 'rozet' }),
  },
} as const;
