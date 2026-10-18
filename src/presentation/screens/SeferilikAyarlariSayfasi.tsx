/**
 * Yolculuk (seferîlik) bilgisi ayarları (issue #296).
 *
 * Kart HÜKÜM VERMEZ; bu sayfa yalnız kartı açar/kapatır ve ikamet yerini
 * gösterir/değiştirir. Mezhep (ortak ayar) Dalga 3'te "Namaz vakitleri" sayfasına
 * taşındı; kart içeriği o seçime göre değişir.
 */
import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../core/theme';
import { useSeferilik } from '../hooks/useSeferilik';
import { AyarGrubu } from './Ayarlar/AyarGrubu';
import { AyarSatiri } from './Ayarlar/AyarSatiri';
import { kisaBildirimGoster } from '../components/common/KisaBildirim';
import {
  SEFER_MESAFESI_KM,
  ikametUzakligiKm,
  kmMetni,
} from '../../core/seferilik/seferilikKarari';
import {
  SEFERILIK_BILGI_NOTU,
  SEFERILIK_KAYNAK_LISTESI,
  type KaynakBaglantisi,
} from '../../core/seferilik/seferilikMetni';

export const SeferilikAyarlariSayfasi: React.FC = () => {
  const renkler = useRenkler();
  const { durum, kartAcikAyarla, konumuIsle, buradaIkametEt } = useSeferilik();

  // Sayfa açılınca diskteki konumu işle: "Burası evim" güncel konumu kaydetsin.
  useEffect(() => {
    konumuIsle();
  }, [konumuIsle]);

  if (!durum) return null;
  const { ayarlar, sonKonum } = durum;
  const ikamet = ayarlar.ikamet;
  const uzaklik = ikamet && sonKonum ? ikametUzakligiKm(ikamet, sonKonum) : null;

  const ikametMetni = ikamet
    ? ikamet.ad ?? 'Kayıtlı konum'
    : 'Henüz kaydedilmedi — ilk konumunuz ikamet yeri sayılır';
  const uzaklikMetni = uzaklik === null
    ? ''
    : uzaklik < 1
      ? 'Şu an buradasınız'
      : `Şu an kuş uçuşu yaklaşık ${kmMetni(uzaklik)} km uzaktasınız`;

  const kaynagiAc = (kaynak: KaynakBaglantisi) => {
    Linking.openURL(kaynak.url).catch(() => {
      kisaBildirimGoster('Bağlantı açılamadı. İnternet bağlantınızı kontrol edin.');
    });
  };
  const evimYap = async () => {
    const tamam = await buradaIkametEt();
    kisaBildirimGoster(tamam ? 'İkamet yeriniz güncellendi' : 'Konumunuz henüz bilinmiyor; önce konum seçin');
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: renkler.arkaplan }} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}>
        <Text className="text-sm leading-5 mx-4 mb-4" style={{ color: renkler.metinIkincil }}>
          İkamet yerinizden yaklaşık {SEFER_MESAFESI_KM[ayarlar.mezhep]} km uzaklaştığınızda ana ekranda,
          Diyanet'in fetvalarını özetleyen kısa bir bilgi kartı görürsünüz. Kart yolculuk başına bir kez
          çıkar, bildirim göndermez.
        </Text>

        <AyarGrubu baslik="Bilgi kartı">
          <AyarSatiri
            varyant="toggle"
            ikon={<FontAwesome5 name="route" size={18} color={renkler.birincil} />}
            baslik="Yolculuk bilgi kartı"
            ozet={ayarlar.kartAcik ? 'Ana ekranda gösterilir' : 'Gösterilmez'}
            deger={ayarlar.kartAcik}
            onDegistir={kartAcikAyarla}
          />
        </AyarGrubu>

        <Text className="text-xs leading-5 mx-4 -mt-4 mb-6" style={{ color: renkler.metinIkincil }}>
          Kartın içeriği mezhebinize göredir; mezhebi Ayarlar › Namaz vakitleri'nden seçebilirsiniz.
        </Text>

        <AyarGrubu baslik="İkamet yeri">
          <View className="px-4 py-3">
            <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
              {ikametMetni}
            </Text>
            {uzaklikMetni !== '' && (
              <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                {uzaklikMetni}
              </Text>
            )}
            <TouchableOpacity
              onPress={evimYap}
              accessibilityRole="button"
              accessibilityLabel="Şu anki konumunuzu ikamet yeri olarak kaydedin"
              className="flex-row items-center justify-center rounded-xl border mt-3"
              style={{ minHeight: 44, backgroundColor: renkler.arkaplan, borderColor: renkler.sinir }}
            >
              <FontAwesome5 name="home" size={13} color={renkler.metin} style={{ marginRight: 6 }} />
              <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                Şu anki konumu ikamet yeri yapın
              </Text>
            </TouchableOpacity>
          </View>
        </AyarGrubu>

        <AyarGrubu baslik="Kaynaklar (Diyanet Din İşleri Yüksek Kurulu)">
          {SEFERILIK_KAYNAK_LISTESI.map((kaynak) => (
            <TouchableOpacity
              key={kaynak.url}
              onPress={() => kaynagiAc(kaynak)}
              accessibilityRole="link"
              accessibilityLabel={`${kaynak.etiket}. Tarayıcıda açılır`}
              className="flex-row items-center px-4 py-3"
              style={{ minHeight: 48 }}
            >
              <Text className="flex-1 text-sm" style={{ color: renkler.metin }}>
                {kaynak.etiket}
              </Text>
              <FontAwesome5 name="external-link-alt" size={12} color={renkler.metinIkincil} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          ))}
        </AyarGrubu>

        <Text className="text-xs leading-5 mx-4" style={{ color: renkler.metinIkincil }}>
          {SEFERILIK_BILGI_NOTU} Sorularınız için 190 Diyanet Fetva Hattı'nı arayabilirsiniz.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};
