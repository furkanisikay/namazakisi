/**
 * Istatistik sayfasi
 * Gunluk, Haftalik ve Aylik istatistikler - 3 tab yapisi
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  namazlariYukle,
  haftalikIstatistikleriYukle,
  aylikIstatistikleriYukle
} from '../store/namazSlice';
import { YuklemeGostergesi } from '../components';
import { BOYUTLAR, NAMAZ_ISIMLERI, RENKLER } from '../../core/constants/UygulamaSabitleri';
import { bugunuAl } from '../../core/utils/TarihYardimcisi';
import { useRenkler } from '../../core/theme';

type TabTipi = 'gunluk' | 'haftalik' | 'aylik';

export const IstatistikSayfasi: React.FC = () => {
  const dispatch = useAppDispatch();
  const renkler = useRenkler();
  const [aktifTab, setAktifTab] = useState<TabTipi>('gunluk');
  const { kullanici } = useAppSelector(state => state.auth);
  const {
    gunlukNamazlar,
    haftalikIstatistik,
    aylikIstatistik,
    yukleniyor
  } = useAppSelector(state => state.namaz);

  // Istatistikleri yukle
  const verileriYukle = useCallback(() => {
    switch (aktifTab) {
      case 'gunluk':
        dispatch(namazlariYukle({ tarih: bugunuAl() }));
        break;
      case 'haftalik':
        dispatch(haftalikIstatistikleriYukle());
        break;
      case 'aylik':
        dispatch(aylikIstatistikleriYukle());
        break;
    }
  }, [aktifTab, dispatch, kullanici]);

  useEffect(() => {
    verileriYukle();
  }, [verileriYukle]);

  return (
    <View style={[styles.container, { backgroundColor: renkler.arkaplan }]}>
      {/* Tab Bar - 3 Tab */}
      <View style={[styles.tabBar, { backgroundColor: renkler.kartArkaplan, borderBottomColor: renkler.sinir }]}>
        <TouchableOpacity
          style={[styles.tab, aktifTab === 'gunluk' && { borderBottomColor: renkler.birincil, borderBottomWidth: 2 }]}
          onPress={() => setAktifTab('gunluk')}
        >
          <Text style={styles.tabIkon}>📊</Text>
          <Text style={[styles.tabText, { color: renkler.metinIkincil }, aktifTab === 'gunluk' && { color: renkler.birincil, fontWeight: 'bold' }]}>
            Günlük
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, aktifTab === 'haftalik' && { borderBottomColor: renkler.birincil, borderBottomWidth: 2 }]}
          onPress={() => setAktifTab('haftalik')}
        >
          <Text style={styles.tabIkon}>📅</Text>
          <Text style={[styles.tabText, { color: renkler.metinIkincil }, aktifTab === 'haftalik' && { color: renkler.birincil, fontWeight: 'bold' }]}>
            Haftalık
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, aktifTab === 'aylik' && { borderBottomColor: renkler.birincil, borderBottomWidth: 2 }]}
          onPress={() => setAktifTab('aylik')}
        >
          <Text style={styles.tabIkon}>📆</Text>
          <Text style={[styles.tabText, { color: renkler.metinIkincil }, aktifTab === 'aylik' && { color: renkler.birincil, fontWeight: 'bold' }]}>
            Aylık
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.icerik}
        refreshControl={
          <RefreshControl
            refreshing={yukleniyor}
            onRefresh={verileriYukle}
            colors={[renkler.birincil]}
          />
        }
      >
        {aktifTab === 'gunluk' && (
          <GunlukIcerik
            namazlar={gunlukNamazlar}
            yukleniyor={yukleniyor}
            renkler={renkler}
          />
        )}
        {aktifTab === 'haftalik' && (
          <HaftalikIcerik
            istatistik={haftalikIstatistik}
            yukleniyor={yukleniyor}
            renkler={renkler}
          />
        )}
        {aktifTab === 'aylik' && (
          <AylikIcerik
            istatistik={aylikIstatistik}
            yukleniyor={yukleniyor}
            renkler={renkler}
          />
        )}
      </ScrollView>
    </View>
  );
};

// ==================== GUNLUK ICERIK ====================
const GunlukIcerik: React.FC<{ namazlar: any; yukleniyor: boolean; renkler: any }> = ({
  namazlar,
  yukleniyor,
  renkler
}) => {
  if (yukleniyor && !namazlar) {
    return <YuklemeGostergesi mesaj="Günlük veriler yükleniyor..." />;
  }

  if (!namazlar) {
    return (
      <View style={styles.bosContainer}>
        <Text style={[styles.bosText, { color: renkler.metinIkincil }]}>Henuz veri yok</Text>
      </View>
    );
  }

  const tamamlanan = namazlar.namazlar?.filter((n: any) => n.tamamlandi).length || 0;
  const toplam = namazlar.namazlar?.length || 5;
  const yuzde = toplam > 0 ? Math.round((tamamlanan / toplam) * 100) : 0;

  // Motivasyon mesaji
  const getMotivasyon = () => {
    if (yuzde === 100) return { mesaj: 'Mükemmel! Bugun tüm namazlarınızı kıldınız! 🎉', ikon: '🏆', renk: '#FFD700' };
    if (yuzde >= 80) return { mesaj: 'Harika gidiyoruz! Biraz daha gayret! 💪', ikon: '📈', renk: renkler.birincil };
    if (yuzde >= 50) return { mesaj: 'İyi bir başlangıç! Devam edin! 🌟', ikon: '🧠', renk: renkler.durum.bilgi };
    return { mesaj: 'Bugün biraz daha gayret gösterebiliriz! 🤲', ikon: '❤️', renk: '#FF9800' };
  };

  const motivasyon = getMotivasyon();

  return (
    <View style={styles.istatistikContainer}>
      {/* Tamamlanma Karti */}
      <View style={[styles.tamamlanmaKarti, { backgroundColor: renkler.birincil, shadowColor: renkler.birincil }]}>
        <View style={styles.tamamlanmaUst}>
          <Text style={styles.tamamlanmaBaslik}>Bugünkü Durum</Text>
          <View style={styles.tarihBadge}>
            <Text style={styles.tarihBadgeMetin}>
              {new Date().getDate()}/{new Date().getMonth() + 1}
            </Text>
          </View>
        </View>
        <View style={styles.tamamlanmaIcerik}>
          <View style={styles.tamamlanmaSol}>
            <Text style={styles.yuzdeText}>{yuzde}%</Text>
            <Text style={styles.tamamlandiMetin}>Tamamlandı</Text>
          </View>
          <View style={styles.daireContainer}>
            <View style={styles.daireArkaplan}>
              <View style={[styles.daireDolgu, {
                width: `${yuzde}%`,
              }]} />
            </View>
            <Text style={styles.daireMerkezMetin}>{tamamlanan}/{toplam}</Text>
          </View>
        </View>
      </View>

      {/* Namaz Detaylari */}
      <View style={[styles.detayKart, { backgroundColor: renkler.kartArkaplan }]}>
        <View style={styles.detayBaslik}>
          <Text style={styles.detayBaslikIkon}>📋</Text>
          <Text style={[styles.detayBaslikMetin, { color: renkler.metin }]}>Namaz Detayları</Text>
        </View>
        {namazlar.namazlar?.map((namaz: any) => (
          <View
            key={namaz.namazAdi}
            style={[
              styles.namazItem,
              namaz.tamamlandi
                ? { backgroundColor: `${renkler.birincil}15`, borderColor: `${renkler.birincil}40` }
                : { backgroundColor: '#FFF3E0', borderColor: '#FFE0B2' }
            ]}
          >
            <View style={[
              styles.namazItemIkon,
              namaz.tamamlandi
                ? { backgroundColor: `${renkler.birincil}30` }
                : { backgroundColor: '#FFE0B2' }
            ]}>
              <Text style={styles.namazIkonText}>
                {namaz.tamamlandi ? '✓' : '⏳'}
              </Text>
            </View>
            <Text style={[
              styles.namazAdiMetin,
              namaz.tamamlandi ? { color: renkler.birincilKoyu } : { color: '#E65100' }
            ]}>
              {namaz.namazAdi}
            </Text>
            <View style={[
              styles.namazDurumBadge,
              namaz.tamamlandi
                ? { backgroundColor: `${renkler.birincil}30` }
                : { backgroundColor: '#FFE0B2' }
            ]}>
              <Text style={[
                styles.namazDurumMetin,
                namaz.tamamlandi ? { color: renkler.birincilKoyu } : { color: '#E65100' }
              ]}>
                {namaz.tamamlandi ? '✓ Kılındı' : '○ Bekliyor'}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Motivasyon Karti */}
      <View style={[styles.motivasyonKart, { backgroundColor: `${motivasyon.renk}20` }]}>
        <View style={[styles.motivasyonIkon, { backgroundColor: `${motivasyon.renk}30` }]}>
          <Text style={styles.motivasyonIkonText}>{motivasyon.ikon}</Text>
        </View>
        <Text style={[styles.motivasyonMetin, { color: motivasyon.renk }]}>
          {motivasyon.mesaj}
        </Text>
      </View>
    </View>
  );
};

// ==================== HAFTALIK ICERIK ====================
const HaftalikIcerik: React.FC<{ istatistik: any; yukleniyor: boolean; renkler: any }> = ({
  istatistik,
  yukleniyor,
  renkler
}) => {
  if (yukleniyor && !istatistik) {
    return <YuklemeGostergesi mesaj="Haftalık istatistikler yükleniyor..." />;
  }

  if (!istatistik) {
    return (
      <View style={styles.bosContainer}>
        <Text style={[styles.bosText, { color: renkler.metinIkincil }]}>Henuz veri yok</Text>
      </View>
    );
  }

  return (
    <View style={styles.istatistikContainer}>
      {/* Haftalik Grafik */}
      <View style={[styles.grafikKart, { backgroundColor: renkler.kartArkaplan }]}>
        <Text style={[styles.grafikBaslik, { color: renkler.metin }]}>Haftalık Performans</Text>
        <View style={styles.grafikContainer}>
          {istatistik.gunlukVeriler?.map((gun: any) => {
            const yuzde = gun.tamamlanmaYuzdesi || 0;
            let barRenk: string = renkler.durum.hata;
            if (yuzde >= 80) barRenk = renkler.birincil;
            else if (yuzde >= 60) barRenk = '#FFC107';

            return (
              <View key={gun.tarih} style={styles.grafikBar}>
                <View style={[styles.barContainer, { backgroundColor: renkler.sinir }]}>
                  <View
                    style={[
                      styles.barDolgu,
                      {
                        height: `${yuzde}%`,
                        backgroundColor: barRenk,
                      }
                    ]}
                  />
                </View>
                <Text style={[styles.barEtiket, { color: renkler.metin }]}>{gun.gunAdi}</Text>
                <Text style={[styles.barDeger, { color: renkler.metinIkincil }]}>{gun.tamamlananNamaz}/{gun.toplamNamaz}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Haftalik Istatistikler */}
      <View style={styles.istatistikKartlari}>
        <View style={[styles.miniKart, { backgroundColor: `${renkler.birincil}15` }]}>
          <View style={[styles.miniKartIkon, { backgroundColor: renkler.birincil }]}>
            <Text style={styles.miniKartIkonText}>✓</Text>
          </View>
          <Text style={[styles.miniKartDeger, { color: renkler.birincil }]}>
            {istatistik.tamamlananNamaz}
          </Text>
          <Text style={[styles.miniKartBaslik, { color: renkler.metin }]}>Toplam Kılınan</Text>
          <Text style={[styles.miniKartAltBaslik, { color: renkler.metinIkincil }]}>Namaz</Text>
        </View>

        <View style={[styles.miniKart, { backgroundColor: `${renkler.durum.bilgi}15` }]}>
          <View style={[styles.miniKartIkon, { backgroundColor: renkler.durum.bilgi }]}>
            <Text style={styles.miniKartIkonText}>📈</Text>
          </View>
          <Text style={[styles.miniKartDeger, { color: renkler.durum.bilgi }]}>
            %{istatistik.tamamlanmaYuzdesi}
          </Text>
          <Text style={[styles.miniKartBaslik, { color: renkler.metin }]}>Haftalık Oran</Text>
          <Text style={[styles.miniKartAltBaslik, { color: renkler.metinIkincil }]}>Başarı</Text>
        </View>

        <View style={[styles.miniKart, { backgroundColor: '#FFF8E1' }]}>
          <View style={[styles.miniKartIkon, { backgroundColor: '#FFB300' }]}>
            <Text style={styles.miniKartIkonText}>⭐</Text>
          </View>
          <Text style={[styles.miniKartDeger, { color: '#FFB300' }]}>
            {istatistik.enIyiGun?.gunAdi || '-'}
          </Text>
          <Text style={[styles.miniKartBaslik, { color: renkler.metin }]}>En İyi Gün</Text>
          <Text style={[styles.miniKartAltBaslik, { color: renkler.metinIkincil }]}>
            {istatistik.enIyiGun ? `%${istatistik.enIyiGun.tamamlanmaYuzdesi}` : '-'}
          </Text>
        </View>
      </View>

      {/* Haftalik Hedefler */}
      <View style={[styles.hedeflerKart, { backgroundColor: renkler.kartArkaplan }]}>
        <Text style={[styles.hedeflerBaslik, { color: renkler.metin }]}>Haftalık Hedefler</Text>
        <HedefItem
          baslik="35 Namaz Hedefi"
          mevcut={istatistik.tamamlananNamaz}
          hedef={35}
          renk={renkler.birincil}
          renkler={renkler}
        />
        <HedefItem
          baslik="80% Başarı Oranı"
          mevcut={istatistik.tamamlanmaYuzdesi}
          hedef={80}
          renk={renkler.durum.bilgi}
          renkler={renkler}
        />
        <HedefItem
          baslik="Haftanın 7 Günü"
          mevcut={istatistik.gunlukVeriler?.filter((g: any) => g.tamamlananNamaz > 0).length || 0}
          hedef={7}
          renk="#9C27B0"
          renkler={renkler}
        />
      </View>
    </View>
  );
};

// ==================== AYLIK ICERIK ====================
const AylikIcerik: React.FC<{ istatistik: any; yukleniyor: boolean; renkler: any }> = ({
  istatistik,
  yukleniyor,
  renkler
}) => {
  if (yukleniyor && !istatistik) {
    return <YuklemeGostergesi mesaj="Aylık istatistikler yükleniyor..." />;
  }

  if (!istatistik) {
    return (
      <View style={styles.bosContainer}>
        <Text style={[styles.bosText, { color: renkler.metinIkincil }]}>Henuz veri yok</Text>
      </View>
    );
  }

  const barRenkleri = [renkler.durum.bilgi, renkler.birincil, '#FF9800', '#9C27B0', renkler.durum.hata];

  return (
    <View style={styles.istatistikContainer}>
      {/* Aylik Genel Bakis */}
      <View style={[styles.aylikGenelKart, { backgroundColor: renkler.kartArkaplan }]}>
        <View style={styles.aylikBaslikRow}>
          <Text style={[styles.aylikGenelBaslik, { color: renkler.metin }]}>Aylık Genel Bakış</Text>
          <View style={[styles.ayBadge, { backgroundColor: `${renkler.birincil}20` }]}>
            <Text style={[styles.ayBadgeMetin, { color: renkler.birincil }]}>
              {istatistik.ayAdi} {istatistik.yil}
            </Text>
          </View>
        </View>
        <View style={styles.aylikIstatRow}>
          <View style={[styles.aylikStatItem, { backgroundColor: `${renkler.durum.bilgi}15` }]}>
            <Text style={[styles.aylikStatDeger, { color: renkler.durum.bilgi }]}>
              {new Date().getDate()}
            </Text>
            <Text style={[styles.aylikStatEtiket, { color: renkler.metinIkincil }]}>Toplam Gün</Text>
          </View>
          <View style={[styles.aylikStatItem, { backgroundColor: `${renkler.birincil}15` }]}>
            <Text style={[styles.aylikStatDeger, { color: renkler.birincil }]}>
              {istatistik.aktifGunSayisi}
            </Text>
            <Text style={[styles.aylikStatEtiket, { color: renkler.metinIkincil }]}>Aktif Gün</Text>
          </View>
          <View style={[styles.aylikStatItem, { backgroundColor: '#FFF3E0' }]}>
            <Text style={[styles.aylikStatDeger, { color: '#FF9800' }]}>
              %{istatistik.tamamlanmaYuzdesi}
            </Text>
            <Text style={[styles.aylikStatEtiket, { color: renkler.metinIkincil }]}>Oran</Text>
          </View>
        </View>
      </View>

      {/* Aylik Ilerleme - Namaz Bazinda */}
      <View style={[styles.namazIlerlemeKart, { backgroundColor: renkler.kartArkaplan }]}>
        <Text style={[styles.namazIlerlemeBaslik, { color: renkler.metin }]}>Aylık İlerleme</Text>
        {NAMAZ_ISIMLERI.map((namazAdi, index) => {
          const yuzde = istatistik.namazBazindaYuzdeler?.[namazAdi] || 0;
          return (
            <View key={namazAdi} style={styles.ilerlemeRow}>
              <Text style={[styles.ilerlemeNamazAdi, { color: renkler.metin }]}>{namazAdi}</Text>
              <View style={[styles.ilerlemeBarContainer, { backgroundColor: renkler.sinir }]}>
                <View
                  style={[
                    styles.ilerlemeBarDolgu,
                    {
                      width: `${yuzde}%`,
                      backgroundColor: barRenkleri[index % barRenkleri.length]
                    }
                  ]}
                />
              </View>
              <Text style={[styles.ilerlemeYuzde, { color: barRenkleri[index % barRenkleri.length] }]}>
                %{yuzde}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Aylik Trendler */}
      <View style={[styles.trendlerKart, { backgroundColor: renkler.kartArkaplan }]}>
        <Text style={[styles.trendlerBaslik, { color: renkler.metin }]}>Aylık Trendler</Text>
        <TrendItem
          baslik="Basarı Oranı"
          deger={`%${istatistik.tamamlanmaYuzdesi} tamamlandı`}
          ikon="📈"
          renk={renkler.birincil}
          renkler={renkler}
        />
        <TrendItem
          baslik="Aktif Günler"
          deger={`${istatistik.aktifGunSayisi} gün aktif`}
          ikon="⭐"
          renk="#FFB300"
          renkler={renkler}
        />
        <TrendItem
          baslik="Toplam Namaz"
          deger={`${istatistik.tamamlananNamaz} namaz kılındı`}
          ikon="🕌"
          renk={renkler.durum.bilgi}
          renkler={renkler}
        />
        {istatistik.tamamlanmaYuzdesi >= 80 ? (
          <TrendItem
            baslik="Hedef Durumu"
            deger="Hedef tamamlandı! 🎉"
            ikon="🏆"
            renk="#FFD700"
            renkler={renkler}
          />
        ) : (
          <TrendItem
            baslik="Hedef Durumu"
            deger={`%80 hedefine ${80 - istatistik.tamamlanmaYuzdesi} puan kaldı`}
            ikon="🎯"
            renk="#FF9800"
            renkler={renkler}
          />
        )}
      </View>
    </View>
  );
};

// ==================== YARDIMCI KOMPONENTLER ====================

// Hedef Item
const HedefItem: React.FC<{
  baslik: string;
  mevcut: number;
  hedef: number;
  renk: string;
  renkler: any;
}> = ({ baslik, mevcut, hedef, renk, renkler }) => {
  const yuzde = Math.min((mevcut / hedef) * 100, 100);

  return (
    <View style={styles.hedefItem}>
      <View style={styles.hedefBaslikRow}>
        <Text style={[styles.hedefItemBaslik, { color: renkler.metin }]}>{baslik}</Text>
        <Text style={[styles.hedefItemDeger, { color: renkler.metinIkincil }]}>{mevcut}/{hedef}</Text>
      </View>
      <View style={[styles.hedefBarContainer, { backgroundColor: renkler.sinir }]}>
        <View
          style={[styles.hedefBarDolgu, { width: `${yuzde}%`, backgroundColor: renk }]}
        />
      </View>
    </View>
  );
};

// Trend Item
const TrendItem: React.FC<{
  baslik: string;
  deger: string;
  ikon: string;
  renk: string;
  renkler: any;
}> = ({ baslik, deger, ikon, renk, renkler }) => {
  return (
    <View style={styles.trendItem}>
      <View style={[styles.trendIkon, { backgroundColor: `${renk}20` }]}>
        <Text style={styles.trendIkonText}>{ikon}</Text>
      </View>
      <View style={styles.trendMetinler}>
        <Text style={[styles.trendBaslik, { color: renkler.metin }]}>{baslik}</Text>
        <Text style={[styles.trendDeger, { color: renkler.metinIkincil }]}>{deger}</Text>
      </View>
    </View>
  );
};

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RENKLER.ARKAPLAN,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: RENKLER.BEYAZ,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabAktif: {
    borderBottomColor: RENKLER.BIRINCIL,
  },
  tabIkon: {
    fontSize: 16,
    marginBottom: 4,
  },
  tabText: {
    fontSize: BOYUTLAR.FONT_KUCUK,
    color: RENKLER.GRI,
    fontWeight: '500',
  },
  tabTextAktif: {
    color: RENKLER.BIRINCIL,
    fontWeight: 'bold',
  },
  icerik: {
    flex: 1,
  },
  istatistikContainer: {
    padding: BOYUTLAR.PADDING_ORTA,
    paddingBottom: BOYUTLAR.PADDING_BUYUK * 2,
  },
  bosContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  bosText: {
    fontSize: BOYUTLAR.FONT_ORTA,
    color: RENKLER.GRI,
  },

  // Bolum Basligi
  bolumBasligi: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RENKLER.BEYAZ,
    padding: BOYUTLAR.PADDING_ORTA,
    borderRadius: BOYUTLAR.YUVARLATMA_BUYUK,
    marginBottom: BOYUTLAR.MARGIN_ORTA,
    shadowColor: RENKLER.SIYAH,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  baslikIkon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baslikIkonText: {
    fontSize: 20,
  },
  bolumBaslikMetin: {
    fontSize: BOYUTLAR.FONT_BUYUK,
    fontWeight: 'bold',
    color: RENKLER.GRI_KOYU,
    marginLeft: BOYUTLAR.MARGIN_ORTA,
  },

  // Tamamlanma Karti
  tamamlanmaKarti: {
    backgroundColor: RENKLER.BIRINCIL,
    borderRadius: BOYUTLAR.YUVARLATMA_BUYUK,
    padding: BOYUTLAR.PADDING_BUYUK,
    marginBottom: BOYUTLAR.MARGIN_ORTA,
    shadowColor: RENKLER.BIRINCIL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  tamamlanmaUst: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: BOYUTLAR.MARGIN_ORTA,
  },
  tamamlanmaBaslik: {
    fontSize: BOYUTLAR.FONT_ORTA,
    fontWeight: '600',
    color: RENKLER.BEYAZ,
  },
  tarihBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tarihBadgeMetin: {
    color: RENKLER.BEYAZ,
    fontWeight: 'bold',
    fontSize: BOYUTLAR.FONT_KUCUK,
  },
  tamamlanmaIcerik: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tamamlanmaSol: {
    flex: 1,
  },
  yuzdeText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: RENKLER.BEYAZ,
  },
  tamamlandiMetin: {
    fontSize: BOYUTLAR.FONT_NORMAL,
    color: 'rgba(255,255,255,0.7)',
  },
  daireContainer: {
    width: 100,
    alignItems: 'center',
  },
  daireArkaplan: {
    width: 100,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  daireDolgu: {
    height: '100%',
    backgroundColor: RENKLER.BEYAZ,
    borderRadius: 4,
  },
  daireMerkezMetin: {
    color: RENKLER.BEYAZ,
    fontWeight: 'bold',
    marginTop: 4,
    fontSize: BOYUTLAR.FONT_NORMAL,
  },

  // Detay Karti
  detayKart: {
    backgroundColor: RENKLER.BEYAZ,
    borderRadius: BOYUTLAR.YUVARLATMA_BUYUK,
    padding: BOYUTLAR.PADDING_ORTA,
    marginBottom: BOYUTLAR.MARGIN_ORTA,
    shadowColor: RENKLER.SIYAH,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detayBaslik: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: BOYUTLAR.MARGIN_ORTA,
  },
  detayBaslikIkon: {
    fontSize: 20,
    marginRight: BOYUTLAR.MARGIN_KUCUK,
  },
  detayBaslikMetin: {
    fontSize: BOYUTLAR.FONT_ORTA,
    fontWeight: 'bold',
    color: RENKLER.GRI_KOYU,
  },

  // Namaz Item
  namazItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: BOYUTLAR.PADDING_ORTA,
    borderRadius: BOYUTLAR.YUVARLATMA_ORTA,
    marginBottom: BOYUTLAR.MARGIN_KUCUK,
  },
  namazItemTamamlandi: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  namazItemBekliyor: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  namazItemIkon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: BOYUTLAR.MARGIN_ORTA,
  },
  namazItemIkonTamamlandi: {
    backgroundColor: '#C8E6C9',
  },
  namazItemIkonBekliyor: {
    backgroundColor: '#FFE0B2',
  },
  namazIkonText: {
    fontSize: 16,
  },
  namazAdiMetin: {
    flex: 1,
    fontSize: BOYUTLAR.FONT_ORTA,
    fontWeight: '600',
  },
  namazAdiTamamlandi: {
    color: RENKLER.BIRINCIL_KOYU,
  },
  namazAdiBekliyor: {
    color: '#E65100',
  },
  namazDurumBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  namazDurumTamamlandi: {
    backgroundColor: '#C8E6C9',
  },
  namazDurumBekliyor: {
    backgroundColor: '#FFE0B2',
  },
  namazDurumMetin: {
    fontSize: BOYUTLAR.FONT_KUCUK,
    fontWeight: 'bold',
  },
  namazDurumMetinTamamlandi: {
    color: RENKLER.BIRINCIL_KOYU,
  },
  namazDurumMetinBekliyor: {
    color: '#E65100',
  },

  // Motivasyon Karti
  motivasyonKart: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: BOYUTLAR.PADDING_ORTA,
    borderRadius: BOYUTLAR.YUVARLATMA_BUYUK,
    marginBottom: BOYUTLAR.MARGIN_ORTA,
  },
  motivasyonIkon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: BOYUTLAR.MARGIN_ORTA,
  },
  motivasyonIkonText: {
    fontSize: 20,
  },
  motivasyonMetin: {
    flex: 1,
    fontSize: BOYUTLAR.FONT_ORTA,
    fontWeight: '600',
  },

  // Grafik Karti
  grafikKart: {
    backgroundColor: RENKLER.BEYAZ,
    borderRadius: BOYUTLAR.YUVARLATMA_BUYUK,
    padding: BOYUTLAR.PADDING_ORTA,
    marginBottom: BOYUTLAR.MARGIN_ORTA,
    shadowColor: RENKLER.SIYAH,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  grafikBaslik: {
    fontSize: BOYUTLAR.FONT_ORTA,
    fontWeight: 'bold',
    color: RENKLER.GRI_KOYU,
    marginBottom: BOYUTLAR.MARGIN_ORTA,
  },
  grafikContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  grafikBar: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    width: 30,
    height: 80,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barDolgu: {
    width: '100%',
    borderRadius: 4,
  },
  barEtiket: {
    fontSize: 10,
    color: RENKLER.GRI_KOYU,
    marginTop: 4,
    fontWeight: '600',
  },
  barDeger: {
    fontSize: 8,
    color: RENKLER.GRI,
  },

  // Mini Kartlar
  istatistikKartlari: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: BOYUTLAR.MARGIN_ORTA,
  },
  miniKart: {
    flex: 1,
    alignItems: 'center',
    padding: BOYUTLAR.PADDING_ORTA,
    borderRadius: BOYUTLAR.YUVARLATMA_BUYUK,
    marginHorizontal: 4,
  },
  miniKartIkon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  miniKartIkonText: {
    fontSize: 16,
    color: RENKLER.BEYAZ,
  },
  miniKartDeger: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  miniKartBaslik: {
    fontSize: 10,
    fontWeight: '600',
    color: RENKLER.GRI_KOYU,
    marginTop: 4,
  },
  miniKartAltBaslik: {
    fontSize: 9,
    color: RENKLER.GRI,
  },

  // Hedefler Karti
  hedeflerKart: {
    backgroundColor: RENKLER.BEYAZ,
    borderRadius: BOYUTLAR.YUVARLATMA_BUYUK,
    padding: BOYUTLAR.PADDING_ORTA,
    marginBottom: BOYUTLAR.MARGIN_ORTA,
    shadowColor: RENKLER.SIYAH,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  hedeflerBaslik: {
    fontSize: BOYUTLAR.FONT_ORTA,
    fontWeight: 'bold',
    color: RENKLER.GRI_KOYU,
    marginBottom: BOYUTLAR.MARGIN_ORTA,
  },
  hedefItem: {
    marginBottom: BOYUTLAR.MARGIN_ORTA,
  },
  hedefBaslikRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  hedefItemBaslik: {
    fontSize: BOYUTLAR.FONT_NORMAL,
    fontWeight: '600',
    color: RENKLER.GRI_KOYU,
  },
  hedefItemDeger: {
    fontSize: BOYUTLAR.FONT_KUCUK,
    color: RENKLER.GRI,
  },
  hedefBarContainer: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  hedefBarDolgu: {
    height: '100%',
    borderRadius: 3,
  },

  // Aylik Kartlar
  aylikGenelKart: {
    backgroundColor: RENKLER.BEYAZ,
    borderRadius: BOYUTLAR.YUVARLATMA_BUYUK,
    padding: BOYUTLAR.PADDING_ORTA,
    marginBottom: BOYUTLAR.MARGIN_ORTA,
    shadowColor: RENKLER.SIYAH,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  aylikBaslikRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: BOYUTLAR.MARGIN_ORTA,
  },
  aylikGenelBaslik: {
    fontSize: BOYUTLAR.FONT_ORTA,
    fontWeight: 'bold',
    color: RENKLER.GRI_KOYU,
  },
  ayBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ayBadgeMetin: {
    color: RENKLER.BILGI,
    fontWeight: 'bold',
    fontSize: BOYUTLAR.FONT_KUCUK,
  },
  aylikIstatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aylikStatItem: {
    flex: 1,
    alignItems: 'center',
    padding: BOYUTLAR.PADDING_ORTA,
    borderRadius: BOYUTLAR.YUVARLATMA_ORTA,
    marginHorizontal: 4,
  },
  aylikStatDeger: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  aylikStatEtiket: {
    fontSize: BOYUTLAR.FONT_KUCUK,
    fontWeight: '600',
    color: RENKLER.GRI,
    marginTop: 4,
  },

  // Namaz Ilerleme Karti
  namazIlerlemeKart: {
    backgroundColor: RENKLER.BEYAZ,
    borderRadius: BOYUTLAR.YUVARLATMA_BUYUK,
    padding: BOYUTLAR.PADDING_ORTA,
    marginBottom: BOYUTLAR.MARGIN_ORTA,
    shadowColor: RENKLER.SIYAH,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  namazIlerlemeBaslik: {
    fontSize: BOYUTLAR.FONT_ORTA,
    fontWeight: 'bold',
    color: RENKLER.GRI_KOYU,
    marginBottom: BOYUTLAR.MARGIN_ORTA,
  },
  ilerlemeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: BOYUTLAR.MARGIN_ORTA,
  },
  ilerlemeNamazAdi: {
    width: 60,
    fontSize: BOYUTLAR.FONT_NORMAL,
    fontWeight: '600',
    color: RENKLER.GRI_KOYU,
  },
  ilerlemeBarContainer: {
    flex: 1,
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  ilerlemeBarDolgu: {
    height: '100%',
    borderRadius: 5,
  },
  ilerlemeYuzde: {
    width: 40,
    fontSize: BOYUTLAR.FONT_NORMAL,
    fontWeight: 'bold',
    textAlign: 'right',
  },

  // Trendler Karti
  trendlerKart: {
    backgroundColor: RENKLER.BEYAZ,
    borderRadius: BOYUTLAR.YUVARLATMA_BUYUK,
    padding: BOYUTLAR.PADDING_ORTA,
    marginBottom: BOYUTLAR.MARGIN_ORTA,
    shadowColor: RENKLER.SIYAH,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  trendlerBaslik: {
    fontSize: BOYUTLAR.FONT_ORTA,
    fontWeight: 'bold',
    color: RENKLER.GRI_KOYU,
    marginBottom: BOYUTLAR.MARGIN_ORTA,
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: BOYUTLAR.MARGIN_ORTA,
  },
  trendIkon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: BOYUTLAR.MARGIN_ORTA,
  },
  trendIkonText: {
    fontSize: 18,
  },
  trendMetinler: {
    flex: 1,
  },
  trendBaslik: {
    fontSize: BOYUTLAR.FONT_NORMAL,
    fontWeight: '600',
    color: RENKLER.GRI_KOYU,
  },
  trendDeger: {
    fontSize: BOYUTLAR.FONT_KUCUK,
    color: RENKLER.GRI,
    marginTop: 2,
  },
});

