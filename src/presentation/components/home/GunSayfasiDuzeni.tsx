/**
 * Ana ekranın tek gün sayfasının DÜZENİ (issue #283 — katlanabilir/tablet).
 *
 * - Kompakt (telefon): tek sütun, tek ScrollView — eski düzenle BİREBİR aynı.
 * - Orta/geniş (Fold iç ekranı, tablet): iki bölme — solda üst bölüm (uyarı
 *   bantları + şu anki vakit kartı: geri sayım, Kıldım), sağda "Günlük Akış".
 *   Her bölme kendi içinde kayar; akış uzasa da vakit kartı görünür kalır.
 *
 * Yalnız yerleşimi bilir; içerik çağırandan hazır düğüm olarak gelir. Böylece
 * AnaSayfa'nın pager/gün navigasyonu ve saniyelik render mantığına dokunmadan
 * iki düzen aynı bileşenleri yeniden kullanır.
 */
import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

interface GunSayfasiDuzeniProps {
  /** `useEkranSinifi` → `ikiBolmeliMi` sonucu. */
  ikiBolmeli: boolean;
  /** Uyarı bantları + şu anki vakit kartı (ya da geçmiş gün kartı). */
  ustBolum: React.ReactNode;
  /** Günlük Akış. */
  akis: React.ReactNode;
}

export const GunSayfasiDuzeni: React.FC<GunSayfasiDuzeniProps> = ({ ikiBolmeli, ustBolum, akis }) => {
  if (!ikiBolmeli) {
    return (
      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        {ustBolum}
        {akis}
        {/* ScrollView sonu için boşluk */}
        <View className="h-10" />
      </ScrollView>
    );
  }

  return (
    <View testID="anasayfa-iki-bolme" style={stiller.ikiBolme}>
      <ScrollView testID="anasayfa-sol-bolme" style={stiller.solBolme} showsVerticalScrollIndicator={false}>
        {ustBolum}
        <View className="h-10" />
      </ScrollView>
      <ScrollView testID="anasayfa-sag-bolme" style={stiller.sagBolme} showsVerticalScrollIndicator={false}>
        {akis}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
};

const stiller = StyleSheet.create({
  ikiBolme: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 20,
  },
  // Akış sütunu biraz daha geniş: satırlar saat | halka | kart üç sütunludur,
  // vakit kartı ise tek blok — prototipteki 1 : 1.1 oranı.
  solBolme: { flex: 1 },
  sagBolme: { flex: 1.1 },
});
