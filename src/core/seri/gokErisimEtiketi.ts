/**
 * Gök panelinin erişilebilirlik özet etiketini üretir.
 *
 * Salt-Svg bir panel ekran okuyucuya hiçbir şey söylemez; bu etiket zorunludur
 * (bkz. tasarım spec §4b). Etiket, panelin görsel durumlarıyla (§1 Görsel
 * sözleşme) BİREBİR aynı, birbirini dışlayan üç kategoriyi sayar: yalnız
 * eşiği tutturan günler ("hedef tutuldu"), tam beş vakti tamamlayan günler
 * ("beş vakit tamamlandı") ve dondurulmuş günler.
 *
 * KOMŞU AY GÜNLERİ (`digerAy: true`) DE SAYIMA KATILIR — bilinçli. Gök paneli
 * komşu ayın günlerini soluk ama GERÇEK olarak gösterir (bkz. tasarım spec
 * §1 "Ay sınırı tanımaz") ve zincir onlardan geçer; ekran okuyucu kullanıcısı
 * panelde görünen her hücreyi duymalı, yalnızca "kendi ayı" olanları değil —
 * aksi halde sayılar görsel panelle tutarsız olur (ör. panelde 35 hücre
 * görünürken özet yalnızca 31'ini sayar).
 */
import { IzgaraGunu } from './aylikIzgara';
import { gunTamMi } from './gunTamMi';

const BES_VAKIT = 5;

/**
 * @param izgara - `aylikIzgaraOlustur` çıktısı
 * @param ayAdi - Görüntülenen ayın adı (ör. "Temmuz 2026")
 * @param mevcutSeri - Motorun güncel seri sayısı (`seriSlice.seriDurumu.mevcutSeri`)
 * @param tamGunEsigi - Tam gün eşiği (`seriSlice.ayarlar.tamGunEsigi`)
 * @returns "Temmuz 2026. 18 gün hedef tutuldu, 12 günde beş vakit tamamlandı,
 *          2 gün dondurulmuş. Mevcut seri 15 gün." bicimindeki ozet metin
 */
export function gokErisimEtiketi(
  izgara: IzgaraGunu[],
  ayAdi: string,
  mevcutSeri: number,
  tamGunEsigi: number
): string {
  let hedefTutulan = 0;
  let besVakitTamamlanan = 0;
  let dondurulmus = 0;

  for (const gun of izgara) {
    if (gun.durum.tip === 'dondurulmus') {
      dondurulmus++;
      continue;
    }
    if (gun.durum.tip !== 'kilindi') {
      continue; // 'gelecek' — henuz yasanmamis, ozete girmez
    }

    const kilinanSayisi = gun.durum.vakitler.filter(Boolean).length;
    if (kilinanSayisi === BES_VAKIT) {
      besVakitTamamlanan++;
    } else if (gunTamMi(kilinanSayisi, tamGunEsigi)) {
      hedefTutulan++;
    }
  }

  return (
    `${ayAdi}. ${hedefTutulan} gün hedef tutuldu, ${besVakitTamamlanan} günde beş vakit tamamlandı, ` +
    `${dondurulmus} gün dondurulmuş. Mevcut seri ${mevcutSeri} gün.`
  );
}
