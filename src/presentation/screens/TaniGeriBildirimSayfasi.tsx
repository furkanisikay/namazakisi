/**
 * Tanı ve Geri Bildirim Sayfası
 * Sorun bildirme, tanı kaydı önizleme ve hatırlatma toggle'ı
 */

import * as React from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { useRenkler } from '../../core/theme';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { hatirlatmayiGuncelle } from '../store/taniSlice';
import { TaniOnizleme } from '../components/Tani/TaniOnizleme';

/**
 * Tanı ve Geri Bildirim Ayarları Sayfası
 */
export const TaniGeriBildirimSayfasi: React.FC = () => {
  const renkler = useRenkler();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const hatirlatmaAcik = useAppSelector((state: { tani: { hatirlatmaAcik: boolean } }) => state.tani.hatirlatmaAcik);
  const [onizleme, setOnizleme] = useState(false);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: renkler.arkaplan }} edges={['top', 'left', 'right']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingVertical: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Başlık */}
        <View className="px-4 mb-6">
          <Text
            className="text-2xl font-bold mb-2"
            style={{ color: renkler.metin }}
          >
            Tanı ve Geri Bildirim
          </Text>
          <Text
            className="text-sm leading-5"
            style={{ color: renkler.metinIkincil }}
          >
            Bir sorun yaşarsanız teknik tanı kaydını bize iletebilirsiniz. Hiçbir şey otomatik gönderilmez; kişisel verileriniz paylaşılmaz.
          </Text>
        </View>

        {/* Birincil eylem: Sorun Bildir */}
        <View className="px-4 mb-6">
          <TouchableOpacity
            onPress={() => setOnizleme(true)}
            activeOpacity={0.8}
            className="flex-row items-center justify-center py-4 rounded-xl"
            style={{ backgroundColor: renkler.birincil }}
          >
            <FontAwesome5
              name="comment-dots"
              size={18}
              color={renkler.birincilMetin ?? '#FFFFFF'}
              solid
            />
            <Text
              className="text-base font-bold ml-2"
              style={{ color: renkler.birincilMetin ?? '#FFFFFF' }}
            >
              Sorun Bildir
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hatırlatma toggle */}
        <View className="mb-2">
          <Text
            className="text-xs font-bold tracking-wider mx-4 mb-3"
            style={{ color: renkler.metinIkincil }}
          >
            AYARLAR
          </Text>

          <View
            className="flex-row items-center py-3.5 px-4 mx-4 mb-2 rounded-xl"
            style={{ backgroundColor: renkler.kartArkaplan }}
          >
            <View
              className="w-11 h-11 rounded-xl items-center justify-center mr-3.5"
              style={{ backgroundColor: `${renkler.birincil}15` }}
            >
              <FontAwesome5
                name="bell"
                size={20}
                color={renkler.birincil}
                solid
              />
            </View>
            <View className="flex-1">
              <Text
                className="text-base font-semibold"
                style={{ color: renkler.metin }}
              >
                Sorun algılandığında hatırlat
              </Text>
              <Text
                className="text-xs mt-0.5"
                style={{ color: renkler.metinIkincil }}
              >
                Hata tespit edilince bildirim gösterir
              </Text>
            </View>
            <Switch
              value={hatirlatmaAcik}
              onValueChange={(v) => { dispatch(hatirlatmayiGuncelle(v)); }}
              trackColor={{ false: renkler.sinir, true: `${renkler.birincil}60` }}
              thumbColor={hatirlatmaAcik ? renkler.birincil : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Diğer eylemler */}
        <View className="mb-2">
          <Text
            className="text-xs font-bold tracking-wider mx-4 mb-3"
            style={{ color: renkler.metinIkincil }}
          >
            ARAÇLAR
          </Text>

          {/* Gönderilecek bilgiyi önizle */}
          <TouchableOpacity
            onPress={() => setOnizleme(true)}
            activeOpacity={0.7}
            className="flex-row items-center py-3.5 px-4 mx-4 mb-2 rounded-xl"
            style={{ backgroundColor: renkler.kartArkaplan }}
          >
            <View
              className="w-11 h-11 rounded-xl items-center justify-center mr-3.5"
              style={{ backgroundColor: `${renkler.birincil}15` }}
            >
              <FontAwesome5
                name="eye"
                size={20}
                color={renkler.birincil}
              />
            </View>
            <View className="flex-1">
              <Text
                className="text-base font-semibold"
                style={{ color: renkler.metin }}
              >
                Gönderilecek bilgiyi önizle
              </Text>
              <Text
                className="text-xs mt-0.5"
                style={{ color: renkler.metinIkincil }}
              >
                Ne gönderileceğini görmek için inceleyin
              </Text>
            </View>
            <FontAwesome5
              name="chevron-right"
              size={14}
              color={renkler.metinIkincil}
            />
          </TouchableOpacity>

          {/* Tanı kayıtlarını görüntüle */}
          <TouchableOpacity
            onPress={() => navigation.navigate('DebugLogs' as never)}
            activeOpacity={0.7}
            className="flex-row items-center py-3.5 px-4 mx-4 mb-2 rounded-xl"
            style={{ backgroundColor: renkler.kartArkaplan }}
          >
            <View
              className="w-11 h-11 rounded-xl items-center justify-center mr-3.5"
              style={{ backgroundColor: `${renkler.birincil}15` }}
            >
              <FontAwesome5
                name="list-alt"
                size={20}
                color={renkler.birincil}
              />
            </View>
            <View className="flex-1">
              <Text
                className="text-base font-semibold"
                style={{ color: renkler.metin }}
              >
                Tanı kayıtlarını görüntüle
              </Text>
              <Text
                className="text-xs mt-0.5"
                style={{ color: renkler.metinIkincil }}
              >
                Hata ayıklama loglarını inceleyin
              </Text>
            </View>
            <FontAwesome5
              name="chevron-right"
              size={14}
              color={renkler.metinIkincil}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Tanı önizleme modalı */}
      <TaniOnizleme
        gorunur={onizleme}
        baglam={null}
        onKapat={() => setOnizleme(false)}
        onLoglariGor={() => {
          setOnizleme(false);
          navigation.navigate('DebugLogs' as never);
        }}
      />
    </SafeAreaView>
  );
};
