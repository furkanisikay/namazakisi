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
  seferilikBilgiNotu,
  SEFERILIK_KAYNAK_LISTESI,
  type KaynakBaglantisi,
} from '../../core/seferilik/seferilikMetni';
import { useMetin } from '../hooks/useMetin';
import { aktifDil, bicim } from '../../core/dil/aktifDil';

export const SeferilikAyarlariSayfasi: React.FC = () => {
  const renkler = useRenkler();
  const s = useMetin();
  const m = s.seferilik.sayfa;
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
    ? ikamet.ad ?? m.kayitliKonum
    : m.henuzKaydedilmedi;
  const uzaklikMetni = uzaklik === null
    ? ''
    : uzaklik < 1
      ? m.buradasiniz
      : bicim(m.uzaktasiniz, { km: kmMetni(uzaklik) });

  const kaynagiAc = (kaynak: KaynakBaglantisi) => {
    Linking.openURL(kaynak.url).catch(() => {
      kisaBildirimGoster(s.seferilik.baglantiAcilamadi);
    });
  };
  const evimYap = async () => {
    const tamam = await buradaIkametEt();
    kisaBildirimGoster(tamam ? s.seferilik.ikametGuncellendi : m.konumBilinmiyor);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: renkler.arkaplan }} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}>
        <Text className="text-sm leading-5 mx-4 mb-4" style={{ color: renkler.metinIkincil }}>
          {bicim(m.giris, { km: SEFER_MESAFESI_KM[ayarlar.mezhep] })}
        </Text>

        <AyarGrubu baslik={m.bilgiKarti}>
          <AyarSatiri
            varyant="toggle"
            ikon={<FontAwesome5 name="route" size={18} color={renkler.birincil} />}
            baslik={m.kartBaslik}
            ozet={ayarlar.kartAcik ? m.gosterilir : m.gosterilmez}
            deger={ayarlar.kartAcik}
            onDegistir={kartAcikAyarla}
          />
        </AyarGrubu>

        <Text className="text-xs leading-5 mx-4 -mt-4 mb-6" style={{ color: renkler.metinIkincil }}>
          {m.mezhepNotu}
        </Text>

        <AyarGrubu baslik={m.ikametYeri}>
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
              accessibilityLabel={m.ikametYapErisim}
              className="flex-row items-center justify-center rounded-xl border mt-3"
              style={{ minHeight: 44, backgroundColor: renkler.arkaplan, borderColor: renkler.sinir }}
            >
              <FontAwesome5 name="home" size={13} color={renkler.metin} style={{ marginRight: 6 }} />
              <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                {m.ikametYap}
              </Text>
            </TouchableOpacity>
          </View>
        </AyarGrubu>

        <AyarGrubu baslik={m.kaynaklar}>
          {SEFERILIK_KAYNAK_LISTESI.map((kaynak) => (
            <TouchableOpacity
              key={kaynak.url}
              onPress={() => kaynagiAc(kaynak)}
              accessibilityRole="link"
              accessibilityLabel={bicim(m.kaynakErisim, { etiket: kaynak.etiket })}
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
          {/* 190 Diyanet Fetva Hattı Türkiye'ye özgüdür: yalnız Türkçede gösterilir. */}
          {aktifDil() === 'tr' ? `${seferilikBilgiNotu()} ${m.fetvaHatti}` : seferilikBilgiNotu()}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};
