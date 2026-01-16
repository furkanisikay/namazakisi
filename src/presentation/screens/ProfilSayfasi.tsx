/**
 * Profil sayfasi
 * Yerel profil modu (Offline-only)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useAppSelector } from '../store/hooks';
import { BOYUTLAR } from '../../core/constants/UygulamaSabitleri';
import { useRenkler } from '../../core/theme';

export const ProfilSayfasi: React.FC = () => {
  const renkler = useRenkler();
  const { kullanici } = useAppSelector((state) => state.auth);

  return (
    <ScrollView style={[styles.container, { backgroundColor: renkler.arkaplan }]}>
      {/* Kullanici Bilgisi */}
      <View style={[styles.profilKart, { backgroundColor: renkler.birincil }]}>
        <View style={[styles.avatar, { backgroundColor: renkler.kartArkaplan }]}>
          <Text style={[styles.avatarText, { color: renkler.birincil }]}>
            {kullanici?.adSoyad?.[0]?.toUpperCase() || 'M'}
          </Text>
        </View>
        <Text style={[styles.kullaniciAdi, { color: '#FFFFFF' }]}>
          {kullanici?.adSoyad || 'Misafir Kullanıcı'}
        </Text>
        <Text style={[styles.durumText, { color: renkler.birincilAcik }]}>
          Yerel Mod
        </Text>
      </View>

      {/* Yerel Veri Bilgisi */}
      <View style={[styles.senkKart, { backgroundColor: renkler.kartArkaplan }]}>
        <Text style={[styles.senkBaslik, { color: renkler.metin }]}>💾 Veri Durumu</Text>

        <View style={[styles.senkRow, { borderBottomColor: renkler.sinir }]}>
          <Text style={[styles.senkEtiket, { color: renkler.metinIkincil }]}>Depolama:</Text>
          <Text style={[styles.senkDeger, { color: renkler.birincil }]}>
            Sadece Cihazda (Offline)
          </Text>
        </View>

        <View style={styles.bilgiContainer}>
          <Text style={[styles.bilgiText, { color: renkler.metinIkincil }]}>
            Bu versiyonda verileriniz sadece telefonunuzda saklanır. Uygulamayı silerseniz verileriniz kaybolabilir.
          </Text>
        </View>
      </View>

      {/* Aciklama */}
      <View style={[styles.aciklama, { backgroundColor: renkler.birincilAcik }]}>
        <Text style={[styles.aciklamaBaslik, { color: renkler.birincilKoyu }]}>ℹ️ Bilgi</Text>
        <Text style={[styles.aciklamaText, { color: renkler.birincilKoyu }]}>
          • Namaz Akışı açık kaynak projesidir.{'\n'}
          • İnternet bağlantısına ihtiyaç duymaz.{'\n'}
          • Gizliliğinize önem verir, veri toplamaz.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profilKart: {
    padding: BOYUTLAR.PADDING_BUYUK,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: BOYUTLAR.MARGIN_ORTA,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  kullaniciAdi: {
    fontSize: BOYUTLAR.FONT_BUYUK,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  durumText: {
    fontSize: BOYUTLAR.FONT_NORMAL,
  },
  senkKart: {
    margin: BOYUTLAR.MARGIN_ORTA,
    borderRadius: BOYUTLAR.YUVARLATMA_ORTA,
    padding: BOYUTLAR.PADDING_ORTA,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  senkBaslik: {
    fontSize: BOYUTLAR.FONT_ORTA,
    fontWeight: 'bold',
    marginBottom: BOYUTLAR.MARGIN_ORTA,
  },
  senkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  senkEtiket: {
    fontSize: BOYUTLAR.FONT_NORMAL,
  },
  senkDeger: {
    fontSize: BOYUTLAR.FONT_NORMAL,
    fontWeight: '500',
  },
  bilgiContainer: {
    marginTop: BOYUTLAR.MARGIN_ORTA,
  },
  bilgiText: {
    fontSize: BOYUTLAR.FONT_KUCUK,
    fontStyle: 'italic',
  },
  aciklama: {
    margin: BOYUTLAR.MARGIN_ORTA,
    padding: BOYUTLAR.PADDING_ORTA,
    borderRadius: BOYUTLAR.YUVARLATMA_ORTA,
  },
  aciklamaBaslik: {
    fontSize: BOYUTLAR.FONT_NORMAL,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  aciklamaText: {
    fontSize: BOYUTLAR.FONT_KUCUK,
    lineHeight: 20,
  },
});

