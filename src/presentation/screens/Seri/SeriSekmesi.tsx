/**
 * SeriSekmesi — İlerleme sekmesinin üst bölümü (sade tasarım Dalga 4; eskiden
 * İstatistik ekranının dördüncü alt sekmesiydi).
 *
 * Başlık (mevcut seri + rekor) -> `Tesbih` (sıradaki rozet ilerlemesi) ->
 * `GokPaneli` (bugünü içeren ayın takımyıldızı). Tüm veri `useSeriAyi`'den
 * gelir; bu bileşen yalnız görüntüler ve hata/yükleniyor kapılarını yönetir.
 *
 * `IlerlemeSayfasi` bunu YALNIZ sekme odaktayken çizer (`useIsFocused`): sekmeler
 * mount kalır ve gök panelindeki parıltı/nabız döngüleri görünmezken de koşardı
 * ("boşta sıfır hareket"). Böylece sekmeye her girişte bileşen YENİDEN MOUNT olur ve
 * açılış animasyonu yeniden oynar. `gomulu` verilince kendi ScrollView'ını taşımaz
 * (dış sayfa tek kaydırmalıdır; iç içe ScrollView hareket çakışması yapar).
 *
 * HATA YOLU ZORUNLU (AGENTS.md'nin yaşanmış "sessiz sonsuz spinner" dersi):
 * `useSeriAyi().hata` doluysa kibar bir mesaj + "Yeniden deneyin" gösterilir,
 * ekran sonsuza kadar dönmez.
 */
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useAppSelector } from '../../store/hooks';
import { sonrakiHedefiBul } from '../../../domain/services/SeriHesaplayiciServisi';
import type { SeriHedefi } from '../../../core/types/SeriTipleri';
import { useSeriAyi } from '../../hooks/useSeriAyi';
import { SERI_SOZU } from '../../../core/data/SeriSozu';
// Barrel (`../../components`) yerine doğrudan dosyadan import edilir: barrel
// `AnimasyonluButon` üzerinden `expo-haptics`'i de sürükler, bu da testte
// gereksiz bir native-köprü mock zinciri gerektirirdi.
import { YuklemeGostergesi } from '../../components/YuklemeGostergesi';
import { Tesbih } from './Tesbih';
import { GokPaneli } from './GokPaneli';

/**
 * `SERI_HEDEFLERI[].ad` Title Case'dir (ör. "İlk Hafta"); `Tesbih` sentence-case
 * bekler (bkz. task-4-report.md). Runtime `toLowerCase`/`toLocaleLowerCase`
 * KULLANILMAZ — Türkçe İ/I çiftinde motor/Intl'e bağımlı yanlış sonuç riski
 * taşır (AGENTS.md'nin `toUpperCase` tuzağının ikizi). Yalnız 4 bilinen hedef
 * için sabit bir harita yeterli; bilinmeyen bir `rozetId`de (ileride yeni
 * hedef eklenirse) ham Title Case adına düşülür — `Tesbih` zaten boş/beklenmedik
 * `hedefAdi`'ye karşı savunmalıdır.
 */
const HEDEF_ADI_CUMLE_DURUMU: Record<string, string> = {
  ilk_adim: 'İlk hafta',
  aliskanlik_ustasi: 'Alışkanlık ustası',
  kararlilik: 'Kararlılık',
  efsane: 'Efsane',
};

function hedefAdiniSecCumleDurumu(hedef: SeriHedefi | null): string | undefined {
  if (!hedef) {
    return undefined;
  }
  return HEDEF_ADI_CUMLE_DURUMU[hedef.rozetId] ?? hedef.ad;
}

export const SeriSekmesi: React.FC<{ gomulu?: boolean }> = ({ gomulu = false }) => {
  const renkler = useRenkler();
  const enUzunSeri = useAppSelector((s) => s.seri.seriDurumu?.enUzunSeri ?? 0);
  const { yukleniyor, hata, izgara, zincirler, ayAdi, bugun, tamGunEsigi, mevcutSeri, yenidenDene } = useSeriAyi();

  // Gömülüyken dış ScrollView'da `flex-1` sıfır yüksekliğe iner → "Yeniden deneyin"
  // görünmezdi. İçerik yüksekliği + alt sınır kullanılır.
  const durumKabi = gomulu ? { minHeight: 240 } : { flex: 1 };

  if (hata) {
    // TEK mesaj gösterilir — `useSeriAyi` her zaman aynı sabit, kibar metni
    // döndürür (ham teknik hata Logger'a gider). Önceden burada AYRICA sabit
    // bir başlık da vardı ("Geçmiş kayıtlarınız okunamadı") — `hata` zaten bu
    // cümleyi taşıdığı için ekranda aynı mesaj iki kez görünüyordu (inceleme
    // bulgusu); tek mesaja indirildi.
    return (
      <View testID="seri-hata" className="items-center justify-center p-8" style={durumKabi}>
        <FontAwesome5 name="exclamation-triangle" size={28} color={renkler.durum.hata} />
        <Text className="text-base font-semibold mt-4 text-center" style={{ color: renkler.metin }}>
          {hata}
        </Text>
        <TouchableOpacity
          onPress={yenidenDene}
          accessibilityRole="button"
          accessibilityLabel="Seri verilerini yeniden deneyin"
          className="flex-row items-center mt-5 px-5 py-3 rounded-xl border"
          style={{ backgroundColor: renkler.arkaplan, borderColor: renkler.sinir, minHeight: 44 }}
        >
          <FontAwesome5 name="redo" size={14} color={renkler.birincil} />
          <Text className="ml-2 text-sm font-semibold" style={{ color: renkler.birincil }}>
            Yeniden deneyin
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (yukleniyor) {
    return (
      <View testID="seri-yukleniyor" style={durumKabi}>
        <YuklemeGostergesi mesaj="Seri verileriniz yükleniyor..." />
      </View>
    );
  }

  const sonrakiHedef = sonrakiHedefiBul(mevcutSeri);

  const govde = (
      <View className={gomulu ? '' : 'p-4 pb-10'}>
        <View className="flex-row items-end mb-3">
          <View>
            <Text style={{ fontSize: 40, fontWeight: '700', color: renkler.metin, letterSpacing: -1 }}>
              {mevcutSeri}
            </Text>
            <Text className="text-xs" style={{ color: renkler.metinIkincil }}>
              günlük seri
            </Text>
          </View>
          <View className="ml-auto items-end">
            <Text style={{ fontSize: 16, fontWeight: '700', color: renkler.metin }}>{enUzunSeri}</Text>
            <Text className="text-xs" style={{ color: renkler.metinIkincil }}>
              rekor
            </Text>
          </View>
        </View>

        <View className="mb-5">
          <Tesbih mevcutSeri={mevcutSeri} hedefGun={sonrakiHedef?.gun ?? null} hedefAdi={hedefAdiniSecCumleDurumu(sonrakiHedef)} />
        </View>

        <GokPaneli
          izgara={izgara}
          zincirler={zincirler}
          ayAdi={ayAdi}
          bugun={bugun}
          tamGunEsigi={tamGunEsigi}
          mevcutSeri={mevcutSeri}
        />

        {/* Serinin dayandığı söz (issue #72) — sakin bir alıntı; imza öğesi gök paneli kalır. */}
        <View
          testID="seri-sozu"
          accessible
          accessibilityLabel={`${SERI_SOZU.metin} Kaynak: ${SERI_SOZU.kaynak}`}
          className="flex-row mt-5 p-4 rounded-2xl"
          style={{ backgroundColor: renkler.birincil + '12' }}
        >
          <FontAwesome5 name="quote-left" size={14} color={renkler.birincil} style={{ marginTop: 2 }} />
          <View className="flex-1 ml-3">
            <Text className="text-sm" style={{ color: renkler.metin, lineHeight: 20, fontStyle: 'italic' }}>
              {SERI_SOZU.metin}
            </Text>
            <Text className="text-xs mt-2" style={{ color: renkler.metinIkincil }}>
              {SERI_SOZU.kaynak}
            </Text>
          </View>
        </View>
      </View>
  );

  return gomulu ? govde : <ScrollView className="flex-1">{govde}</ScrollView>;
};
