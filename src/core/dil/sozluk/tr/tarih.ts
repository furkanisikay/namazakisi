/** Gün ve ay adları (`Date.getDay()` / `getMonth()` sırası). */
export const tarih = {
  gunler: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
  /** Standart kısaltma; tam adın ilk üç harfi OLMAZ (Pazar/Pazartesi ikisi de "Paz" olurdu). */
  gunlerKisa: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
  aylar: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
  /** Ay adı TEK BAŞINA (takvim başlığı "Ekim 2026"). Bazı dillerde `aylar` tarih içindeki çekimli hâldir (Rusça "октября"). */
  aylarYalin: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
  /** Başlıktaki takvim yaprağı ("Oca"). */
  aylarKisa: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
  /** Haftalık panel (Pazartesi başlar). */
  haftaHarfleri: ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'],
  /** Uzun tarih: "18 Ocak 2026". */
  uzun: '{gun} {ay} {yil}',
} as const;
