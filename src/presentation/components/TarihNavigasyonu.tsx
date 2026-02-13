/**
 * Tarih navigasyonu komponenti
 * Gunler arasi gecis icin ok butonlari
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RENKLER, BOYUTLAR } from '../../core/constants/UygulamaSabitleri';
import { 
  tarihiGorunumFormatinaCevir, 
  gunAdiniAl, 
  bugunMu 
} from '../../core/utils/TarihYardimcisi';

interface TarihNavigasyonuProps {
  tarih: string;
  onOncekiGun: () => void;
  onSonrakiGun: () => void;
  onBugune: () => void;
}

export const TarihNavigasyonu: React.FC<TarihNavigasyonuProps> = ({
  tarih,
  onOncekiGun,
  onSonrakiGun,
  onBugune,
}) => {
  const bugunMuKontrol = bugunMu(tarih);

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.okButonu} 
        onPress={onOncekiGun}
        activeOpacity={0.7}
      >
        <Text style={styles.okText}>◀</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tarihContainer}
        onPress={onBugune}
        activeOpacity={0.7}
      >
        <Text style={styles.gunAdi}>{gunAdiniAl(tarih)}</Text>
        <Text style={styles.tarih}>{tarihiGorunumFormatinaCevir(tarih)}</Text>
        {bugunMuKontrol && (
          <View style={styles.bugunBadge}>
            <Text style={styles.bugunText}>Bugün</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.okButonu} 
        onPress={onSonrakiGun}
        activeOpacity={0.7}
      >
        <Text style={styles.okText}>▶</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: RENKLER.BEYAZ,
    padding: BOYUTLAR.PADDING_ORTA,
    marginHorizontal: BOYUTLAR.MARGIN_ORTA,
    marginTop: BOYUTLAR.MARGIN_ORTA,
    borderRadius: BOYUTLAR.YUVARLATMA_ORTA,
    shadowColor: RENKLER.SIYAH,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  okButonu: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: RENKLER.GRI_ACIK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  okText: {
    fontSize: 18,
    color: RENKLER.BIRINCIL,
    fontWeight: 'bold',
  },
  tarihContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: BOYUTLAR.MARGIN_ORTA,
  },
  gunAdi: {
    fontSize: BOYUTLAR.FONT_BUYUK,
    fontWeight: 'bold',
    color: RENKLER.BIRINCIL,
  },
  tarih: {
    fontSize: BOYUTLAR.FONT_NORMAL,
    color: RENKLER.GRI_KOYU,
    marginTop: 2,
  },
  bugunBadge: {
    backgroundColor: RENKLER.BIRINCIL,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  bugunText: {
    color: RENKLER.BEYAZ,
    fontSize: BOYUTLAR.FONT_KUCUK,
    fontWeight: 'bold',
  },
});

