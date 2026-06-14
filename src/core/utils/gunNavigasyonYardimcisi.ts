/**
 * Ana ekran gün navigasyonu için saf (yan etkisiz) yardımcılar.
 *
 * Ana ekran, hangi günün "aktif" olduğunu ve açılışta hangi sayfada
 * açılacağını yönetir. Bu mantık daha önce doğrudan AnaSayfa içindeki
 * effect/memo zincirine gömülüydü ve iki bug'a yol açıyordu:
 *
 *   1. (#13) DateTimePicker'dan geçmiş bir gün seçince hemen bugüne/aktif güne
 *      geri dönüyordu (snap-back).
 *   2. Gece yarısından sonra (yatsı sürerken) açılışta önce bugüne, sonra
 *      görünür biçimde önceki güne (aktif gün) zıplıyor ve "gelecek günlere
 *      gidemezsiniz" toast'ı çıkıyordu.
 *
 * Çözüm: kararları buraya saf fonksiyonlar olarak çıkarmak — açılışta pager
 * DOĞRUDAN aktif günde açılır (görünür zıplama yok), ve "gelecek gün" engeli
 * yalnızca gerçekten gelecek bir güne gidildiğinde devreye girer.
 *
 * Tarih biçimi her yerde ISO 'YYYY-MM-DD' (yerel gün). adhan/PrayerTimes'a
 * bağımlı OLMAMAK için imsak (fajr) zamanı dışarıdan parametre verilir.
 */

/**
 * Aktif günü hesaplar: kullanıcı imsak vaktinden ÖNCEYSE (yatsı süreci hâlâ
 * devam ediyor) aktif gün dündür; aksi halde bugündür.
 *
 * @param bugun       Bugünün ISO tarihi ('YYYY-MM-DD').
 * @param simdi       Şu anki zaman.
 * @param imsakZamani Bugünün imsak (fajr) zamanı. null ise (konum/hesaplama
 *                    yoksa) önceki güne kaydırma yapılmaz, aktif gün = bugün.
 * @param oncekiGun   Bugünden bir önceki günün ISO tarihi (gunEkle ile hesaplanır).
 */
export const aktifGunuHesapla = (
  bugun: string,
  simdi: Date,
  imsakZamani: Date | null,
  oncekiGun: string
): string => {
  if (imsakZamani && simdi < imsakZamani) {
    return oncekiGun;
  }
  return bugun;
};

/**
 * Bir sayfaya/güne gitmenin "gelecek gün" olduğu için engellenmesi gerekip
 * gerekmediğini söyler. Yalnızca hedef tarih aktif günden SONRAYSA engellenir.
 *
 * Eşit (aktif güne dönüş) veya geçmiş günler serbesttir; bu sayede açılışta
 * pager'ın aktif güne yerleşmesi yanlışlıkla "gelecek gün" sayılıp toast
 * tetiklemez (gece yarısı bug'ı).
 */
export const gelecekGuneGecisMi = (hedefTarih: string, aktifGun: string): boolean => {
  return hedefTarih > aktifGun;
};
