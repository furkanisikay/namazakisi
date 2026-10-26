/**
 * Yazı yönü değişimi (`domain/services/YonServisi`): dil değişimi yazı yönünü değiştirince
 * sorulan "şimdi yeniden başlatılsın mı?" sorusu ve Dil sayfasındaki bekleme satırı.
 * "RTL" gibi teknik terim yazılmaz: "yazı yönü".
 */
export const yon = {
  baslik: 'Yazı yönü değişecek',
  aciklama: 'Seçtiğiniz dil farklı bir yönde yazılıyor. Ekranların yeni yöne geçmesi için uygulamanın yeniden başlaması gerekiyor.',
  simdiBaslat: 'Şimdi yeniden başlatın',
  sonra: 'Sonra',
  /** "Sonra" denince kısa bildirim; Dil sayfasında yön beklerken kalıcı bilgi satırı. */
  bekliyor: 'Yazı yönü, uygulama yeniden başlatıldığında değişecek.',
} as const;
