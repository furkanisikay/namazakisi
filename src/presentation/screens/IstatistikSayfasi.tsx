/**
 * İstatistik sayfası
 * Günlük, Haftalık ve Aylık istatistikler - 3 tab yapısı
 * 
 * NativeWind + Expo Vector Icons ile güncellenmiş versiyon
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  namazlariYukle,
  haftalikIstatistikleriYukle,
  aylikIstatistikleriYukle
} from '../store/namazSlice';
import { YuklemeGostergesi } from '../components';
import { NAMAZ_ISIMLERI } from '../../core/constants/UygulamaSabitleri';
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
    <SafeAreaView className="flex-1" style={{ backgroundColor: renkler.arkaplan }} edges={['top', 'left', 'right']}>
      {/* Tab Bar - 3 Tab */}
      <View
        className="flex-row border-b"
        style={{ backgroundColor: renkler.kartArkaplan, borderBottomColor: renkler.sinir }}
      >
        <TouchableOpacity
          className="flex-1 py-3 items-center border-b-2"
          style={{ borderBottomColor: aktifTab === 'gunluk' ? renkler.birincil : 'transparent' }}
          onPress={() => setAktifTab('gunluk')}
        >
          <FontAwesome5
            name="chart-bar"
            size={16}
            color={aktifTab === 'gunluk' ? renkler.birincil : renkler.metinIkincil}
          />
          <Text
            className="text-xs mt-1"
            style={{
              color: aktifTab === 'gunluk' ? renkler.birincil : renkler.metinIkincil,
              fontWeight: aktifTab === 'gunluk' ? '700' : '500'
            }}
          >
            Günlük
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 py-3 items-center border-b-2"
          style={{ borderBottomColor: aktifTab === 'haftalik' ? renkler.birincil : 'transparent' }}
          onPress={() => setAktifTab('haftalik')}
        >
          <FontAwesome5
            name="calendar-week"
            size={16}
            color={aktifTab === 'haftalik' ? renkler.birincil : renkler.metinIkincil}
          />
          <Text
            className="text-xs mt-1"
            style={{
              color: aktifTab === 'haftalik' ? renkler.birincil : renkler.metinIkincil,
              fontWeight: aktifTab === 'haftalik' ? '700' : '500'
            }}
          >
            Haftalık
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 py-3 items-center border-b-2"
          style={{ borderBottomColor: aktifTab === 'aylik' ? renkler.birincil : 'transparent' }}
          onPress={() => setAktifTab('aylik')}
        >
          <FontAwesome5
            name="calendar-alt"
            size={16}
            color={aktifTab === 'aylik' ? renkler.birincil : renkler.metinIkincil}
          />
          <Text
            className="text-xs mt-1"
            style={{
              color: aktifTab === 'aylik' ? renkler.birincil : renkler.metinIkincil,
              fontWeight: aktifTab === 'aylik' ? '700' : '500'
            }}
          >
            Aylık
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
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
    </SafeAreaView>
  );
};

// ==================== GÜNLÜK İÇERİK ====================
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
      <View className="flex-1 items-center justify-center p-12">
        <Text className="text-base" style={{ color: renkler.metinIkincil }}>Henüz veri yok</Text>
      </View>
    );
  }

  const tamamlanan = namazlar.namazlar?.filter((n: any) => n.tamamlandi).length || 0;
  const toplam = namazlar.namazlar?.length || 5;
  const yuzde = toplam > 0 ? Math.round((tamamlanan / toplam) * 100) : 0;

  // Motivasyon mesaji
  const getMotivasyon = () => {
    if (yuzde === 100) return { mesaj: 'Mükemmel! Bugün tüm namazlarınızı kıldınız!', ikonAdi: 'trophy', renk: '#FFD700' };
    if (yuzde >= 80) return { mesaj: 'Harika gidiyoruz! Biraz daha gayret!', ikonAdi: 'chart-line', renk: renkler.birincil };
    if (yuzde >= 50) return { mesaj: 'İyi bir başlangıç! Devam edin!', ikonAdi: 'star', renk: renkler.durum.bilgi };
    return { mesaj: 'Bugün biraz daha gayret gösterebiliriz!', ikonAdi: 'heart', renk: '#FF9800' };
  };

  const motivasyon = getMotivasyon();

  return (
    <View className="p-4 pb-10">
      {/* Tamamlanma Karti */}
      <View
        className="rounded-2xl p-5 mb-4 shadow-lg"
        style={{ backgroundColor: renkler.birincil }}
      >
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-base font-semibold text-white">Bugünkü Durum</Text>
          <View className="bg-white/20 px-3 py-1 rounded-xl">
            <Text className="text-white font-bold text-xs">
              {new Date().getDate()}/{new Date().getMonth() + 1}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <View className="flex-1">
            <Text className="text-4xl font-bold text-white">{yuzde}%</Text>
            <Text className="text-sm text-white/70">Tamamlandı</Text>
          </View>
          <View className="w-24 items-center">
            <View className="w-24 h-2 bg-white/30 rounded-full overflow-hidden">
              <View className="h-full bg-white rounded-full" style={{ width: `${yuzde}%` }} />
            </View>
            <Text className="text-white font-bold mt-1 text-sm">{tamamlanan}/{toplam}</Text>
          </View>
        </View>
      </View>

      {/* Namaz Detaylari */}
      <View
        className="rounded-2xl p-4 mb-4 shadow-sm"
        style={{ backgroundColor: renkler.kartArkaplan }}
      >
        <View className="flex-row items-center mb-4">
          <FontAwesome5 name="list-alt" size={18} color={renkler.metin} />
          <Text className="text-base font-bold ml-2" style={{ color: renkler.metin }}>
            Namaz Detayları
          </Text>
        </View>
        {namazlar.namazlar?.map((namaz: any) => (
          <View
            key={namaz.namazAdi}
            className="flex-row items-center p-3.5 rounded-xl mb-2 border"
            style={{
              backgroundColor: namaz.tamamlandi ? `${renkler.birincil}10` : '#FFF3E0',
              borderColor: namaz.tamamlandi ? `${renkler.birincil}30` : '#FFE0B2',
            }}
          >
            <View
              className="w-8 h-8 rounded-lg items-center justify-center mr-3"
              style={{ backgroundColor: namaz.tamamlandi ? `${renkler.birincil}25` : '#FFE0B2' }}
            >
              <FontAwesome5
                name={namaz.tamamlandi ? 'check' : 'clock'}
                size={14}
                color={namaz.tamamlandi ? renkler.birincilKoyu : '#E65100'}
              />
            </View>
            <Text
              className="flex-1 text-base font-semibold"
              style={{ color: namaz.tamamlandi ? renkler.birincilKoyu : '#E65100' }}
            >
              {namaz.namazAdi}
            </Text>
            <View
              className="px-2.5 py-1 rounded-lg"
              style={{ backgroundColor: namaz.tamamlandi ? `${renkler.birincil}20` : '#FFE0B2' }}
            >
              <Text
                className="text-xs font-bold"
                style={{ color: namaz.tamamlandi ? renkler.birincilKoyu : '#E65100' }}
              >
                {namaz.tamamlandi ? 'Kılındı' : 'Bekliyor'}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Motivasyon Karti */}
      <View
        className="flex-row items-center p-4 rounded-2xl"
        style={{ backgroundColor: `${motivasyon.renk}15` }}
      >
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: `${motivasyon.renk}25` }}
        >
          <FontAwesome5 name={motivasyon.ikonAdi} size={18} color={motivasyon.renk} solid />
        </View>
        <Text className="flex-1 text-sm font-semibold" style={{ color: motivasyon.renk }}>
          {motivasyon.mesaj}
        </Text>
      </View>
    </View>
  );
};

// ==================== HAFTALIK İÇERİK ====================
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
      <View className="flex-1 items-center justify-center p-12">
        <Text className="text-base" style={{ color: renkler.metinIkincil }}>Henüz veri yok</Text>
      </View>
    );
  }

  return (
    <View className="p-4 pb-10">
      {/* Haftalik Grafik */}
      <View
        className="rounded-2xl p-4 mb-4 shadow-sm"
        style={{ backgroundColor: renkler.kartArkaplan }}
      >
        <Text className="text-base font-bold mb-4" style={{ color: renkler.metin }}>
          Haftalık Performans
        </Text>
        <View className="flex-row justify-around items-end h-32">
          {istatistik.gunlukVeriler?.map((gun: any) => {
            const yuzde = gun.tamamlanmaYuzdesi || 0;
            let barRenk: string = renkler.durum.hata;
            if (yuzde >= 80) barRenk = renkler.birincil;
            else if (yuzde >= 60) barRenk = '#FFC107';

            return (
              <View key={gun.tarih} className="items-center flex-1">
                <View
                  className="w-7 h-20 rounded justify-end overflow-hidden"
                  style={{ backgroundColor: renkler.sinir }}
                >
                  <View
                    className="w-full rounded"
                    style={{ height: `${yuzde}%`, backgroundColor: barRenk }}
                  />
                </View>
                <Text className="text-[10px] font-semibold mt-1" style={{ color: renkler.metin }}>
                  {gun.gunAdi}
                </Text>
                <Text className="text-[8px]" style={{ color: renkler.metinIkincil }}>
                  {gun.tamamlananNamaz}/{gun.toplamNamaz}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Haftalik Istatistikler */}
      <View className="flex-row justify-between mb-4">
        <View
          className="flex-1 items-center p-4 rounded-2xl mx-1"
          style={{ backgroundColor: `${renkler.birincil}10` }}
        >
          <View
            className="w-8 h-8 rounded-lg items-center justify-center mb-2"
            style={{ backgroundColor: renkler.birincil }}
          >
            <FontAwesome5 name="check" size={14} color="#FFF" />
          </View>
          <Text className="text-xl font-bold" style={{ color: renkler.birincil }}>
            {istatistik.tamamlananNamaz}
          </Text>
          <Text className="text-[10px] font-semibold mt-1" style={{ color: renkler.metin }}>Toplam Kılınan</Text>
          <Text className="text-[9px]" style={{ color: renkler.metinIkincil }}>Namaz</Text>
        </View>

        <View
          className="flex-1 items-center p-4 rounded-2xl mx-1"
          style={{ backgroundColor: `${renkler.durum.bilgi}10` }}
        >
          <View
            className="w-8 h-8 rounded-lg items-center justify-center mb-2"
            style={{ backgroundColor: renkler.durum.bilgi }}
          >
            <FontAwesome5 name="chart-line" size={14} color="#FFF" />
          </View>
          <Text className="text-xl font-bold" style={{ color: renkler.durum.bilgi }}>
            %{istatistik.tamamlanmaYuzdesi}
          </Text>
          <Text className="text-[10px] font-semibold mt-1" style={{ color: renkler.metin }}>Haftalık Oran</Text>
          <Text className="text-[9px]" style={{ color: renkler.metinIkincil }}>Başarı</Text>
        </View>

        <View
          className="flex-1 items-center p-4 rounded-2xl mx-1"
          style={{ backgroundColor: '#FFF8E1' }}
        >
          <View className="w-8 h-8 rounded-lg items-center justify-center mb-2" style={{ backgroundColor: '#FFB300' }}>
            <FontAwesome5 name="star" size={14} color="#FFF" solid />
          </View>
          <Text className="text-lg font-bold" style={{ color: '#FFB300' }}>
            {istatistik.enIyiGun?.gunAdi || '-'}
          </Text>
          <Text className="text-[10px] font-semibold mt-1" style={{ color: renkler.metin }}>En İyi Gün</Text>
          <Text className="text-[9px]" style={{ color: renkler.metinIkincil }}>
            {istatistik.enIyiGun ? `%${istatistik.enIyiGun.tamamlanmaYuzdesi}` : '-'}
          </Text>
        </View>
      </View>

      {/* Haftalik Hedefler */}
      <View
        className="rounded-2xl p-4 shadow-sm"
        style={{ backgroundColor: renkler.kartArkaplan }}
      >
        <Text className="text-base font-bold mb-4" style={{ color: renkler.metin }}>Haftalık Hedefler</Text>
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

// ==================== AYLIK İÇERİK ====================
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
      <View className="flex-1 items-center justify-center p-12">
        <Text className="text-base" style={{ color: renkler.metinIkincil }}>Henüz veri yok</Text>
      </View>
    );
  }

  const barRenkleri = [renkler.durum.bilgi, renkler.birincil, '#FF9800', '#9C27B0', renkler.durum.hata];

  return (
    <View className="p-4 pb-10">
      {/* Aylik Genel Bakis */}
      <View
        className="rounded-2xl p-4 mb-4 shadow-sm"
        style={{ backgroundColor: renkler.kartArkaplan }}
      >
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-base font-bold" style={{ color: renkler.metin }}>Aylık Genel Bakış</Text>
          <View className="px-3 py-1 rounded-xl" style={{ backgroundColor: `${renkler.birincil}15` }}>
            <Text className="text-xs font-bold" style={{ color: renkler.birincil }}>
              {istatistik.ayAdi} {istatistik.yil}
            </Text>
          </View>
        </View>
        <View className="flex-row justify-between">
          <View
            className="flex-1 items-center p-4 rounded-xl mx-1"
            style={{ backgroundColor: `${renkler.durum.bilgi}10` }}
          >
            <Text className="text-2xl font-bold" style={{ color: renkler.durum.bilgi }}>
              {new Date().getDate()}
            </Text>
            <Text className="text-xs font-semibold mt-1" style={{ color: renkler.metinIkincil }}>Toplam Gün</Text>
          </View>
          <View
            className="flex-1 items-center p-4 rounded-xl mx-1"
            style={{ backgroundColor: `${renkler.birincil}10` }}
          >
            <Text className="text-2xl font-bold" style={{ color: renkler.birincil }}>
              {istatistik.aktifGunSayisi}
            </Text>
            <Text className="text-xs font-semibold mt-1" style={{ color: renkler.metinIkincil }}>Aktif Gün</Text>
          </View>
          <View
            className="flex-1 items-center p-4 rounded-xl mx-1"
            style={{ backgroundColor: '#FFF3E0' }}
          >
            <Text className="text-2xl font-bold" style={{ color: '#FF9800' }}>
              %{istatistik.tamamlanmaYuzdesi}
            </Text>
            <Text className="text-xs font-semibold mt-1" style={{ color: renkler.metinIkincil }}>Oran</Text>
          </View>
        </View>
      </View>

      {/* Aylik Ilerleme - Namaz Bazinda */}
      <View
        className="rounded-2xl p-4 mb-4 shadow-sm"
        style={{ backgroundColor: renkler.kartArkaplan }}
      >
        <Text className="text-base font-bold mb-4" style={{ color: renkler.metin }}>Aylık İlerleme</Text>
        {NAMAZ_ISIMLERI.map((namazAdi, index) => {
          const yuzde = istatistik.namazBazindaYuzdeler?.[namazAdi] || 0;
          return (
            <View key={namazAdi} className="flex-row items-center mb-4">
              <Text className="w-16 text-sm font-semibold" style={{ color: renkler.metin }}>{namazAdi}</Text>
              <View className="flex-1 h-2.5 rounded-full mx-3 overflow-hidden" style={{ backgroundColor: renkler.sinir }}>
                <View
                  className="h-full rounded-full"
                  style={{ width: `${yuzde}%`, backgroundColor: barRenkleri[index % barRenkleri.length] }}
                />
              </View>
              <Text
                className="w-10 text-sm font-bold text-right"
                style={{ color: barRenkleri[index % barRenkleri.length] }}
              >
                %{yuzde}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Aylik Trendler */}
      <View
        className="rounded-2xl p-4 shadow-sm"
        style={{ backgroundColor: renkler.kartArkaplan }}
      >
        <Text className="text-base font-bold mb-4" style={{ color: renkler.metin }}>Aylık Trendler</Text>
        <TrendItem
          baslik="Başarı Oranı"
          deger={`%${istatistik.tamamlanmaYuzdesi} tamamlandı`}
          ikonAdi="chart-line"
          renk={renkler.birincil}
          renkler={renkler}
        />
        <TrendItem
          baslik="Aktif Günler"
          deger={`${istatistik.aktifGunSayisi} gün aktif`}
          ikonAdi="star"
          renk="#FFB300"
          renkler={renkler}
        />
        <TrendItem
          baslik="Toplam Namaz"
          deger={`${istatistik.tamamlananNamaz} namaz kılındı`}
          ikonAdi="mosque"
          renk={renkler.durum.bilgi}
          renkler={renkler}
        />
        {istatistik.tamamlanmaYuzdesi >= 80 ? (
          <TrendItem
            baslik="Hedef Durumu"
            deger="Hedef tamamlandı!"
            ikonAdi="trophy"
            renk="#FFD700"
            renkler={renkler}
          />
        ) : (
          <TrendItem
            baslik="Hedef Durumu"
            deger={`%80 hedefine ${80 - istatistik.tamamlanmaYuzdesi} puan kaldı`}
            ikonAdi="bullseye"
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
    <View className="mb-4">
      <View className="flex-row justify-between mb-1.5">
        <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>{baslik}</Text>
        <Text className="text-xs" style={{ color: renkler.metinIkincil }}>{mevcut}/{hedef}</Text>
      </View>
      <View className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: renkler.sinir }}>
        <View className="h-full rounded-full" style={{ width: `${yuzde}%`, backgroundColor: renk }} />
      </View>
    </View>
  );
};

// Trend Item
const TrendItem: React.FC<{
  baslik: string;
  deger: string;
  ikonAdi: string;
  renk: string;
  renkler: any;
}> = ({ baslik, deger, ikonAdi, renk, renkler }) => {
  return (
    <View className="flex-row items-center mb-4">
      <View className="w-9 h-9 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: `${renk}15` }}>
        <FontAwesome5 name={ikonAdi} size={16} color={renk} solid />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>{baslik}</Text>
        <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>{deger}</Text>
      </View>
    </View>
  );
};
