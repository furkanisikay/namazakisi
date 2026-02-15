/**
 * Rozetler Sayfasi
 * Kullanicinin kazandigi ve kazanabilecegi rozetleri gosteren galeri sayfasi
 * Ayrica seviye/rank bilgisini de icerir
 * 
 * NativeWind + Expo Vector Icons ile guncellenmis versiyon
 */

import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { seriVerileriniYukle } from '../store/seriSlice';
import { RozetKarti, YuklemeGostergesi } from '../components';
import { PaylasimModal } from '../components/Sharing/PaylasimModal';
import { PaylasilabilirRozet } from '../components/Sharing/PaylasilabilirRozet';
import { useRenkler } from '../../core/theme';
import { ROZET_RENKLERI } from '../../core/constants/UygulamaSabitleri';
import {
  ROZET_TANIMLARI,
  SEVIYE_TANIMLARI,
  RozetTipi,
} from '../../core/types/SeriTipleri';

type TabTipi = 'tumu' | 'seri' | 'ozel' | 'toplam';

// Tab ikon eslesmesi
const TAB_IKONLARI: Record<TabTipi, { name: string; solid?: boolean }> = {
  tumu: { name: 'trophy', solid: true },
  seri: { name: 'fire-alt', solid: true },
  ozel: { name: 'star', solid: true },
  toplam: { name: 'chart-bar', solid: true },
};

// Seviye ikon eslesmesi (emoji yerine FontAwesome5)
const SEVIYE_IKONLARI: Record<string, string> = {
  '🌙': 'moon',
  '⭐': 'star',
  '🌟': 'star',
  '💫': 'star',
  '✨': 'magic',
  '🏆': 'trophy',
  '👑': 'crown',
};

/**
 * Rozetler Sayfasi Komponenti
 */
export const RozetlerSayfasi: React.FC = () => {
  const dispatch = useAppDispatch();
  const renkler = useRenkler();
  const [aktifTab, setAktifTab] = useState<TabTipi>('tumu');

  const { kullanici } = useAppSelector((state) => state.auth);
  const {
    rozetDetaylari,
    seviyeDurumu,
    toplamKilinanNamaz,
    yukleniyor,
  } = useAppSelector((state) => state.seri);

  // Verileri yukle
  const verileriYukle = useCallback(() => {
    dispatch(seriVerileriniYukle());
  }, [dispatch, kullanici]);

  useEffect(() => {
    verileriYukle();
  }, [verileriYukle]);

  // Filtrelenmis rozetler
  const filtrelenmisRozetler = rozetDetaylari.filter((rozet) => {
    if (aktifTab === 'tumu') return true;
    return rozet.tip === aktifTab;
  });

  // Kazanilan rozet sayisi
  const kazanilanSayisi = rozetDetaylari.filter((r) => r.kazanildiMi).length;
  const toplamRozet = ROZET_TANIMLARI.length;

  // Seviye ilerleme yuzdesi
  const seviyeIlerleme = seviyeDurumu
    ? (seviyeDurumu.mevcutSeviyePuani /
      (seviyeDurumu.mevcutSeviyePuani + seviyeDurumu.sonrakiSeviyeKalanPuan)) *
    100
    : 0;

  // Sonraki seviye
  const sonrakiSeviye = seviyeDurumu
    ? SEVIYE_TANIMLARI.find((s) => s.seviye === seviyeDurumu.mevcutSeviye + 1)
    : null;

  // Seviye ikonu al
  const seviyeIkonuAl = (emojiIkon: string | undefined): string => {
    if (!emojiIkon) return 'moon';
    return SEVIYE_IKONLARI[emojiIkon] || 'moon';
  };

  // Paylasim icin state
  const [paylasimModalGorunur, setPaylasimModalGorunur] = useState(false);
  const [secilenRozet, setSecilenRozet] = useState<any>(null);

  const rozetPaylas = (rozet: any) => {
    if (rozet.kazanildiMi) {
      setSecilenRozet(rozet);
      setPaylasimModalGorunur(true);
    }
  };

  if (yukleniyor && rozetDetaylari.length === 0) {
    return <YuklemeGostergesi mesaj="Rozetler yükleniyor..." />;
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: renkler.arkaplan }} edges={['top', 'left', 'right']}>
      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={yukleniyor}
            onRefresh={verileriYukle}
            colors={[renkler.birincil]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Seviye Karti */}
        <View
          className="rounded-2xl p-5 mb-4 shadow-sm"
          style={{ backgroundColor: renkler.kartArkaplan }}
        >
          {/* Ust Bilgi */}
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <View
                className="w-14 h-14 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${renkler.birincil}20` }}
              >
                <FontAwesome5
                  name={seviyeIkonuAl(seviyeDurumu?.rankIkonu)}
                  size={24}
                  color={renkler.birincil}
                  solid
                />
              </View>
              <View>
                <Text
                  className="text-xl font-bold"
                  style={{ color: renkler.metin }}
                >
                  {seviyeDurumu?.rank || 'Mübtedi'}
                </Text>
                <Text
                  className="text-sm font-semibold"
                  style={{ color: renkler.birincil }}
                >
                  Seviye {seviyeDurumu?.mevcutSeviye || 1}
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text
                className="text-xs"
                style={{ color: renkler.metinIkincil }}
              >
                Toplam Puan
              </Text>
              <Text
                className="text-2xl font-bold"
                style={{ color: renkler.birincil }}
              >
                {seviyeDurumu?.toplamPuan || 0}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="mb-4">
            <View
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: renkler.sinir }}
            >
              <View
                className="h-full rounded-full"
                style={{
                  backgroundColor: renkler.birincil,
                  width: `${seviyeIlerleme}%`,
                }}
              />
            </View>
            <View className="flex-row justify-between mt-1">
              <Text
                className="text-xs"
                style={{ color: renkler.metinIkincil }}
              >
                {seviyeDurumu?.mevcutSeviyePuani || 0} puan
              </Text>
              {sonrakiSeviye && (
                <Text
                  className="text-xs"
                  style={{ color: renkler.metinIkincil }}
                >
                  {sonrakiSeviye.rank} için {seviyeDurumu?.sonrakiSeviyeKalanPuan || 0} kaldı
                </Text>
              )}
            </View>
          </View>

          {/* Istatistikler */}
          <View className="flex-row justify-around">
            <View
              className="flex-1 items-center py-3 rounded-xl mx-1"
              style={{ backgroundColor: `${renkler.birincil}10` }}
            >
              <FontAwesome5
                name="mosque"
                size={20}
                color={renkler.birincil}
                solid
              />
              <Text
                className="text-lg font-bold mt-1"
                style={{ color: renkler.birincil }}
              >
                {toplamKilinanNamaz}
              </Text>
              <Text
                className="text-xs"
                style={{ color: renkler.metinIkincil }}
              >
                Namaz
              </Text>
            </View>
            <View
              className="flex-1 items-center py-3 rounded-xl mx-1"
              style={{ backgroundColor: `${ROZET_RENKLERI.ALTIN}10` }}
            >
              <FontAwesome5
                name="medal"
                size={20}
                color={ROZET_RENKLERI.ALTIN}
                solid
              />
              <Text
                className="text-lg font-bold mt-1"
                style={{ color: ROZET_RENKLERI.ALTIN }}
              >
                {kazanilanSayisi}/{toplamRozet}
              </Text>
              <Text
                className="text-xs"
                style={{ color: renkler.metinIkincil }}
              >
                Rozet
              </Text>
            </View>
          </View>
        </View>

        {/* Tab Bar */}
        <View
          className="flex-row rounded-xl mb-4 overflow-hidden"
          style={{ backgroundColor: renkler.kartArkaplan }}
        >
          {([
            { id: 'tumu' as TabTipi, etiket: 'Tümü' },
            { id: 'seri' as TabTipi, etiket: 'Seri' },
            { id: 'ozel' as TabTipi, etiket: 'Özel' },
            { id: 'toplam' as TabTipi, etiket: 'Toplam' },
          ]).map((tab) => {
            const aktifMi = aktifTab === tab.id;
            const ikonBilgi = TAB_IKONLARI[tab.id];
            return (
              <TouchableOpacity
                key={tab.id}
                className="flex-1 py-3 items-center border-b-2"
                style={{
                  borderBottomColor: aktifMi ? renkler.birincil : 'transparent',
                }}
                onPress={() => setAktifTab(tab.id)}
                activeOpacity={0.7}
              >
                <FontAwesome5
                  name={ikonBilgi.name}
                  size={14}
                  color={aktifMi ? renkler.birincil : renkler.metinIkincil}
                  solid={ikonBilgi.solid}
                />
                <Text
                  className="text-xs font-semibold mt-1"
                  style={{
                    color: aktifMi ? renkler.birincil : renkler.metinIkincil,
                  }}
                >
                  {tab.etiket}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Rozet Listesi */}
        <View className="mb-6">
          <Text
            className="text-xs font-bold tracking-wider mb-3"
            style={{ color: renkler.metinIkincil }}
          >
            {aktifTab === 'tumu'
              ? 'TÜM ROZETLER'
              : aktifTab === 'seri'
                ? 'SERİ ROZETLERİ'
                : aktifTab === 'ozel'
                  ? 'ÖZEL ROZETLER'
                  : 'TOPLAM ROZETLER'}
          </Text>

          {filtrelenmisRozetler.length === 0 ? (
            <View className="items-center py-8">
              <FontAwesome5
                name="search"
                size={24}
                color={renkler.metinIkincil}
              />
              <Text
                className="text-sm mt-2"
                style={{ color: renkler.metinIkincil }}
              >
                Bu kategoride rozet bulunamadi
              </Text>
            </View>
          ) : (
            filtrelenmisRozetler.map((rozet) => (
              <RozetKarti
                key={rozet.id}
                rozet={rozet}
                onPress={() => rozetPaylas(rozet)}
              />
            ))
          )}
        </View>

        {/* Seviye Yol Haritasi */}
        <View className="mb-6">
          <Text
            className="text-xs font-bold tracking-wider mb-3"
            style={{ color: renkler.metinIkincil }}
          >
            SEVİYE YOL HARİTASI
          </Text>

          <View
            className="flex-row justify-between items-start p-3 rounded-2xl overflow-hidden"
            style={{ backgroundColor: renkler.kartArkaplan }}
          >
            {SEVIYE_TANIMLARI.map((seviye, index) => {
              const aktifMi = seviyeDurumu?.mevcutSeviye === seviye.seviye;
              const tamamlandiMi = (seviyeDurumu?.mevcutSeviye || 1) > seviye.seviye;

              return (
                <View key={seviye.seviye} className="items-center flex-1 relative">
                  <View
                    className="w-9 h-9 rounded-full items-center justify-center mb-1"
                    style={{
                      backgroundColor: tamamlandiMi
                        ? renkler.birincil
                        : aktifMi
                          ? `${renkler.birincil}30`
                          : renkler.sinir,
                      borderWidth: aktifMi ? 2 : 0,
                      borderColor: aktifMi ? renkler.birincil : 'transparent',
                    }}
                  >
                    {tamamlandiMi ? (
                      <FontAwesome5 name="check" size={14} color="#fff" />
                    ) : (
                      <FontAwesome5
                        name={seviyeIkonuAl(seviye.ikon)}
                        size={12}
                        color={aktifMi ? renkler.birincil : renkler.metinIkincil}
                        solid
                        style={{ opacity: aktifMi ? 1 : 0.5 }}
                      />
                    )}
                  </View>
                  <Text
                    className="text-center"
                    style={{
                      fontSize: 8,
                      color: aktifMi
                        ? renkler.birincil
                        : tamamlandiMi
                          ? renkler.metin
                          : renkler.metinIkincil,
                      fontWeight: aktifMi ? 'bold' : 'normal',
                    }}
                  >
                    {seviye.rank}
                  </Text>
                  <Text
                    className="text-center mt-0.5"
                    style={{ fontSize: 7, color: renkler.metinIkincil }}
                  >
                    {seviye.minPuan}+
                  </Text>

                  {/* Baglanti cizgisi */}
                  {index < SEVIYE_TANIMLARI.length - 1 && (
                    <View
                      className="absolute top-4 -right-6 w-12 h-0.5 -z-10"
                      style={{
                        backgroundColor: tamamlandiMi
                          ? renkler.birincil
                          : renkler.sinir,
                      }}
                    />
                  )}
                </View>
              );
            })}
          </View>
        </View>


      </ScrollView>

      {/* Paylasim Modali */}
      <PaylasimModal
        gorunur={paylasimModalGorunur}
        onKapat={() => setPaylasimModalGorunur(false)}
      >
        {secilenRozet && <PaylasilabilirRozet rozet={secilenRozet} />}
      </PaylasimModal>
    </SafeAreaView>
  );
};
