/**
 * "Bölgenizin takvimi" — başka ülkeye geçince BİR KEZ sorulan öneri (ülke başına).
 *
 * Bugünün vakitlerini iki yöntemle yan yana gösterir; kullanıcı ya bölgenin takvimine
 * geçer ya mevcut yöntemde kalır. İkisi de cevabı hafızaya yazar (`sorulanUlkeler`),
 * aynı ülke için bir daha sorulmaz. Yöntem asla sessizce değişmez.
 */
import React, { useMemo } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Coordinates, PrayerTimes } from 'adhan';
import { useRenkler } from '../../../core/theme';
import { useDonanimGeriTusu } from '../../hooks/useDonanimGeriTusu';
import { HESAP_PROFILLERI, hesapParametreleriOlustur, type HesapAyari } from '../../../core/vakit/hesapProfilleri';
import type { UlkeVarsayilani } from '../../../core/vakit/ulkeProfilleri';
import { GUVEN_METNI, PROFIL_ADLARI } from '../../../core/vakit/profilAdlari';
import { bicim } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';

interface Props {
  gorunur: boolean;
  ulkeAdi: string;
  yerAdi: string;
  koordinat: { lat: number; lng: number } | null;
  mevcut: HesapAyari;
  oneri: UlkeVarsayilani;
  onKabul: () => void;
  onReddet: () => void;
}

const VAKITLER = [
  ['imsak', 'fajr'],
  ['gunes', 'sunrise'],
  ['ogle', 'dhuhr'],
  ['ikindi', 'asr'],
  ['aksam', 'maghrib'],
  ['yatsi', 'isha'],
] as const;

const ss = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

export const BolgeTakvimiModali: React.FC<Props> = ({ gorunur, ulkeAdi, yerAdi, koordinat, mevcut, oneri, onKabul, onReddet }) => {
  const renkler = useRenkler();
  const metinler = useMetin();
  const m = metinler.hesap.oneri;
  useDonanimGeriTusu(gorunur, onReddet);

  const satirlar = useMemo(() => {
    if (!koordinat) return [];
    const k = new Coordinates(koordinat.lat, koordinat.lng);
    const bugun = new Date();
    const baglam = { tarih: bugun, enlem: koordinat.lat };
    const a = new PrayerTimes(k, bugun, hesapParametreleriOlustur(mevcut, baglam));
    const b = new PrayerTimes(k, bugun, hesapParametreleriOlustur({ profil: oneri.profil, ikindi: oneri.ikindi }, baglam));
    return VAKITLER.map(([kod, alan]) => ({ kod, eski: ss(a[alan]), yeni: ss(b[alan]) }));
  }, [koordinat, mevcut, oneri]);

  const eskiAd = HESAP_PROFILLERI[mevcut.profil]?.kisaAd ?? '';
  const yeniAd = HESAP_PROFILLERI[oneri.profil].kisaAd;

  return (
    <Modal visible={gorunur} animationType="fade" transparent statusBarTranslucent onRequestClose={onReddet}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <TouchableWithoutFeedback onPress={onReddet}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
        </TouchableWithoutFeedback>
        <View
          style={{
            width: '90%',
            maxWidth: 440,
            backgroundColor: renkler.kartArkaplan,
            borderRadius: 24,
            padding: 22,
            borderWidth: 1,
            borderColor: renkler.sinir,
          }}
          testID="bolge-takvimi-modali"
        >
          <View className="flex-row items-center mb-3">
            <View className="w-11 h-11 rounded-2xl items-center justify-center mr-3" style={{ backgroundColor: renkler.durum.bilgi + '20' }}>
              <FontAwesome5 name="globe-europe" size={18} color={renkler.durum.bilgi} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold" style={{ color: renkler.metin }}>
                {ulkeAdi}
              </Text>
              {/* Ülke adına ek getirilmez ("…'dasınız"): Türkçe ses uyumu ada göre değişir. */}
              <Text className="text-sm" style={{ color: renkler.metinIkincil }}>
                {yerAdi ? bicim(m.bulunduguYer, { yer: yerAdi }) : m.bulunduguUlke}
              </Text>
            </View>
          </View>

          <Text className="text-sm leading-5 mb-3" style={{ color: renkler.metin }}>
            {bicim(m.soru, { profil: PROFIL_ADLARI[oneri.profil] })}
          </Text>

          {satirlar.length > 0 && (
            <View className="rounded-2xl mb-3" style={{ borderWidth: 1, borderColor: renkler.sinir, overflow: 'hidden' }}>
              <View className="flex-row px-3 py-2" style={{ backgroundColor: renkler.arkaplan }}>
                <Text className="flex-1 text-xs font-bold" style={{ color: renkler.metinIkincil }}>
                  {m.vakit}
                </Text>
                <Text className="flex-1 text-xs font-bold text-center" style={{ color: renkler.metinIkincil }}>
                  {eskiAd}
                </Text>
                <Text className="flex-1 text-xs font-bold text-center" style={{ color: renkler.metinIkincil }}>
                  {yeniAd}
                </Text>
              </View>
              {satirlar.map((s) => (
                <View key={s.kod} className="flex-row px-3 py-1.5" style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: renkler.sinir }}>
                  <Text className="flex-1 text-sm" style={{ color: renkler.metin }}>
                    {metinler.vakit.adlar[s.kod]}
                  </Text>
                  <Text className="flex-1 text-sm text-center" style={{ color: renkler.metinIkincil }}>
                    {s.eski}
                  </Text>
                  <Text className="flex-1 text-sm text-center font-bold" style={{ color: renkler.metin }}>
                    {s.yeni}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {oneri.guven === 'genel' && (
            <Text className="text-xs mb-3" style={{ color: renkler.metinIkincil }}>
              {bicim(m.genelUyari, { guven: GUVEN_METNI.genel })}
            </Text>
          )}

          <TouchableOpacity
            className="flex-row items-center justify-center rounded-2xl mb-2"
            style={{ backgroundColor: renkler.birincil, minHeight: 50 }}
            onPress={onKabul}
            accessibilityRole="button"
            accessibilityLabel={bicim(m.gecin, { ad: yeniAd })}
          >
            <FontAwesome5 name="check" size={14} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text className="text-base font-bold" style={{ color: '#FFFFFF' }}>
              {bicim(m.gecin, { ad: yeniAd })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center justify-center rounded-2xl"
            style={{ backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir, minHeight: 48 }}
            onPress={onReddet}
            accessibilityRole="button"
            accessibilityLabel={bicim(m.devam, { ad: eskiAd })}
          >
            <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
              {bicim(m.devam, { ad: eskiAd })}
            </Text>
          </TouchableOpacity>
          <Text className="text-xs text-center mt-3" style={{ color: renkler.metinIkincil }}>
            {m.birKez}
          </Text>
        </View>
      </View>
    </Modal>
  );
};
