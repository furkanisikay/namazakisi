/**
 * Rozetler Sayfasi
 * Kullanicinin kazandigi ve kazanabilecegi rozetleri gosteren galeri sayfasi
 * Ayrica seviye/rank bilgisini de icerir
 */

import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { seriVerileriniYukle } from '../store/seriSlice';
import { RozetKarti, YuklemeGostergesi } from '../components';
import { useRenkler } from '../../core/theme';
import { BOYUTLAR, ROZET_RENKLERI } from '../../core/constants/UygulamaSabitleri';
import {
  ROZET_TANIMLARI,
  SEVIYE_TANIMLARI,
  RozetTipi,
} from '../../core/types/SeriTipleri';

type TabTipi = 'tumu' | 'seri' | 'ozel' | 'toplam';

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

  if (yukleniyor && rozetDetaylari.length === 0) {
    return <YuklemeGostergesi mesaj="Rozetler yükleniyor..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: renkler.arkaplan }]}>
      <ScrollView
        contentContainerStyle={styles.icerik}
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
          style={[styles.seviyeKart, { backgroundColor: renkler.kartArkaplan }]}
        >
          <View style={styles.seviyeUst}>
            <View style={styles.seviyeBilgi}>
              <Text style={styles.seviyeIkon}>
                {seviyeDurumu?.rankIkonu || '🌙'}
              </Text>
              <View style={styles.seviyeMetinler}>
                <Text style={[styles.seviyeRank, { color: renkler.metin }]}>
                  {seviyeDurumu?.rank || 'Mübtedi'}
                </Text>
                <Text style={[styles.seviyeNumara, { color: renkler.birincil }]}>
                  Seviye {seviyeDurumu?.mevcutSeviye || 1}
                </Text>
              </View>
            </View>
            <View style={styles.puanBilgi}>
              <Text style={[styles.puanBaslik, { color: renkler.metinIkincil }]}>
                Toplam Puan
              </Text>
              <Text style={[styles.puanDeger, { color: renkler.birincil }]}>
                {seviyeDurumu?.toplamPuan || 0}
              </Text>
            </View>
          </View>

          {/* Seviye progress bar */}
          <View style={styles.seviyeProgressContainer}>
            <View
              style={[
                styles.seviyeProgressArkaplan,
                { backgroundColor: renkler.sinir },
              ]}
            >
              <View
                style={[
                  styles.seviyeProgressDolgu,
                  {
                    backgroundColor: renkler.birincil,
                    width: `${seviyeIlerleme}%`,
                  },
                ]}
              />
            </View>
            <View style={styles.seviyeProgressMetinler}>
              <Text style={[styles.seviyeProgressMetin, { color: renkler.metinIkincil }]}>
                {seviyeDurumu?.mevcutSeviyePuani || 0} puan
              </Text>
              {sonrakiSeviye && (
                <Text style={[styles.seviyeProgressMetin, { color: renkler.metinIkincil }]}>
                  {sonrakiSeviye.rank} için {seviyeDurumu?.sonrakiSeviyeKalanPuan || 0} kaldı
                </Text>
              )}
            </View>
          </View>

          {/* Istatistikler */}
          <View style={styles.istatistiklerContainer}>
            <View style={[styles.istatistikItem, { backgroundColor: `${renkler.birincil}15` }]}>
              <Text style={styles.istatistikIkon}>🕌</Text>
              <Text style={[styles.istatistikDeger, { color: renkler.birincil }]}>
                {toplamKilinanNamaz}
              </Text>
              <Text style={[styles.istatistikEtiket, { color: renkler.metinIkincil }]}>
                Namaz
              </Text>
            </View>
            <View style={[styles.istatistikItem, { backgroundColor: `${ROZET_RENKLERI.ALTIN}15` }]}>
              <Text style={styles.istatistikIkon}>🏅</Text>
              <Text style={[styles.istatistikDeger, { color: ROZET_RENKLERI.ALTIN }]}>
                {kazanilanSayisi}/{toplamRozet}
              </Text>
              <Text style={[styles.istatistikEtiket, { color: renkler.metinIkincil }]}>
                Rozet
              </Text>
            </View>
          </View>
        </View>

        {/* Tab Bar */}
        <View style={[styles.tabBar, { backgroundColor: renkler.kartArkaplan }]}>
          {[
            { id: 'tumu' as TabTipi, etiket: 'Tümü', ikon: '🏆' },
            { id: 'seri' as TabTipi, etiket: 'Seri', ikon: '🔥' },
            { id: 'ozel' as TabTipi, etiket: 'Özel', ikon: '⭐' },
            { id: 'toplam' as TabTipi, etiket: 'Toplam', ikon: '📊' },
          ].map((tab) => (
            <View
              key={tab.id}
              style={[
                styles.tab,
                aktifTab === tab.id && {
                  borderBottomColor: renkler.birincil,
                  borderBottomWidth: 2,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabMetin,
                  {
                    color: aktifTab === tab.id ? renkler.birincil : renkler.metinIkincil,
                  },
                ]}
                onPress={() => setAktifTab(tab.id)}
              >
                {tab.ikon} {tab.etiket}
              </Text>
            </View>
          ))}
        </View>

        {/* Rozet Listesi */}
        <View style={styles.rozetlerContainer}>
          <Text style={[styles.bolumBaslik, { color: renkler.metinIkincil }]}>
            {aktifTab === 'tumu'
              ? 'TÜM ROZETLER'
              : aktifTab === 'seri'
                ? 'SERİ ROZETLERİ'
                : aktifTab === 'ozel'
                  ? 'ÖZEL ROZETLER'
                  : 'TOPLAM ROZETLER'}
          </Text>

          {filtrelenmisRozetler.length === 0 ? (
            <View style={styles.bosContainer}>
              <Text style={[styles.bosMetin, { color: renkler.metinIkincil }]}>
                Bu kategoride rozet bulunamadi
              </Text>
            </View>
          ) : (
            filtrelenmisRozetler.map((rozet) => (
              <RozetKarti key={rozet.id} rozet={rozet} />
            ))
          )}
        </View>

        {/* Seviye Yol Haritasi */}
        <View style={styles.yolHaritasiContainer}>
          <Text style={[styles.bolumBaslik, { color: renkler.metinIkincil }]}>
            SEVİYE YOL HARİTASI
          </Text>

          <View
            style={[
              styles.yolHaritasiKart,
              { backgroundColor: renkler.kartArkaplan },
            ]}
          >
            {SEVIYE_TANIMLARI.map((seviye, index) => {
              const aktifMi = seviyeDurumu?.mevcutSeviye === seviye.seviye;
              const tamamlandiMi = (seviyeDurumu?.mevcutSeviye || 1) > seviye.seviye;

              return (
                <View key={seviye.seviye} style={styles.seviyeItem}>
                  <View
                    style={[
                      styles.seviyeItemDaire,
                      tamamlandiMi && { backgroundColor: renkler.birincil },
                      aktifMi && {
                        backgroundColor: `${renkler.birincil}30`,
                        borderColor: renkler.birincil,
                        borderWidth: 3,
                      },
                      !tamamlandiMi && !aktifMi && { backgroundColor: renkler.sinir },
                    ]}
                  >
                    <Text
                      style={[
                        styles.seviyeItemIkon,
                        { opacity: tamamlandiMi || aktifMi ? 1 : 0.4 },
                      ]}
                    >
                      {tamamlandiMi ? '✓' : seviye.ikon}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.seviyeItemRank,
                      {
                        color: aktifMi
                          ? renkler.birincil
                          : tamamlandiMi
                            ? renkler.metin
                            : renkler.metinIkincil,
                        fontWeight: aktifMi ? 'bold' : 'normal',
                      },
                    ]}
                  >
                    {seviye.rank}
                  </Text>
                  <Text
                    style={[
                      styles.seviyeItemPuan,
                      { color: renkler.metinIkincil },
                    ]}
                  >
                    {seviye.minPuan}+
                  </Text>

                  {/* Baglanti cizgisi */}
                  {index < SEVIYE_TANIMLARI.length - 1 && (
                    <View
                      style={[
                        styles.baglantiCizgisi,
                        {
                          backgroundColor: tamamlandiMi
                            ? renkler.birincil
                            : renkler.sinir,
                        },
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Alt bosluk */}
        <View style={styles.altBosluk} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  icerik: {
    padding: BOYUTLAR.PADDING_ORTA,
    paddingBottom: BOYUTLAR.PADDING_BUYUK * 2,
  },
  // Seviye Karti
  seviyeKart: {
    borderRadius: BOYUTLAR.YUVARLATMA_BUYUK,
    padding: BOYUTLAR.PADDING_BUYUK,
    marginBottom: BOYUTLAR.MARGIN_ORTA,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  seviyeUst: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: BOYUTLAR.MARGIN_ORTA,
  },
  seviyeBilgi: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seviyeIkon: {
    fontSize: 48,
    marginRight: BOYUTLAR.MARGIN_ORTA,
  },
  seviyeMetinler: {},
  seviyeRank: {
    fontSize: BOYUTLAR.FONT_BUYUK,
    fontWeight: 'bold',
  },
  seviyeNumara: {
    fontSize: BOYUTLAR.FONT_NORMAL,
    fontWeight: '600',
  },
  puanBilgi: {
    alignItems: 'flex-end',
  },
  puanBaslik: {
    fontSize: BOYUTLAR.FONT_KUCUK,
  },
  puanDeger: {
    fontSize: BOYUTLAR.FONT_BASLIK,
    fontWeight: 'bold',
  },
  seviyeProgressContainer: {
    marginBottom: BOYUTLAR.MARGIN_ORTA,
  },
  seviyeProgressArkaplan: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  seviyeProgressDolgu: {
    height: '100%',
    borderRadius: 4,
  },
  seviyeProgressMetinler: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  seviyeProgressMetin: {
    fontSize: BOYUTLAR.FONT_KUCUK,
  },
  istatistiklerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  istatistikItem: {
    flex: 1,
    alignItems: 'center',
    padding: BOYUTLAR.PADDING_ORTA,
    borderRadius: BOYUTLAR.YUVARLATMA_ORTA,
    marginHorizontal: 4,
  },
  istatistikIkon: {
    fontSize: 24,
    marginBottom: 4,
  },
  istatistikDeger: {
    fontSize: BOYUTLAR.FONT_BUYUK,
    fontWeight: 'bold',
  },
  istatistikEtiket: {
    fontSize: BOYUTLAR.FONT_KUCUK,
  },
  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    borderRadius: BOYUTLAR.YUVARLATMA_ORTA,
    marginBottom: BOYUTLAR.MARGIN_ORTA,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: BOYUTLAR.PADDING_ORTA,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabMetin: {
    fontSize: BOYUTLAR.FONT_KUCUK,
    fontWeight: '600',
  },
  // Rozetler
  rozetlerContainer: {
    marginBottom: BOYUTLAR.MARGIN_BUYUK,
  },
  bolumBaslik: {
    fontSize: BOYUTLAR.FONT_KUCUK,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: BOYUTLAR.MARGIN_ORTA,
  },
  bosContainer: {
    alignItems: 'center',
    padding: BOYUTLAR.PADDING_BUYUK,
  },
  bosMetin: {
    fontSize: BOYUTLAR.FONT_NORMAL,
  },
  // Yol Haritasi
  yolHaritasiContainer: {
    marginBottom: BOYUTLAR.MARGIN_BUYUK,
  },
  yolHaritasiKart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: BOYUTLAR.PADDING_ORTA,
    borderRadius: BOYUTLAR.YUVARLATMA_BUYUK,
    overflow: 'hidden',
  },
  seviyeItem: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  seviyeItemDaire: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  seviyeItemIkon: {
    fontSize: 16,
  },
  seviyeItemRank: {
    fontSize: 9,
    textAlign: 'center',
  },
  seviyeItemPuan: {
    fontSize: 8,
    marginTop: 2,
  },
  baglantiCizgisi: {
    position: 'absolute',
    top: 18,
    right: -25,
    width: 50,
    height: 2,
    zIndex: -1,
  },
  altBosluk: {
    height: 40,
  },
});


