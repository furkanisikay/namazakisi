/**
 * Gunluk namaz ozeti komponenti
 * Tamamlanma yuzdesi, ilerleme ve kutlama animasyonu gosterir
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GunlukNamazlar } from '../../core/types';
import { RENKLER, BOYUTLAR } from '../../core/constants/UygulamaSabitleri';
import { KutlamaAnimasyonu, BasariAnimasyonu } from './LottieAnimasyon';

interface GunlukOzetProps {
  gunlukNamazlar: GunlukNamazlar;
}

export const GunlukOzet: React.FC<GunlukOzetProps> = ({ gunlukNamazlar }) => {
  const [kutlamaGoster, setKutlamaGoster] = useState(false);
  const oncekiYuzdeRef = useRef<number | null>(null);
  const oncekiTarihRef = useRef<string | null>(null);

  const tamamlanan = gunlukNamazlar.namazlar.filter(n => n.tamamlandi).length;
  const toplam = gunlukNamazlar.namazlar.length;
  const yuzde = toplam > 0 ? Math.round((tamamlanan / toplam) * 100) : 0;
  const mevcutTarih = gunlukNamazlar.tarih;

  // %100'e ulasildiginda kutlama animasyonu goster
  // Sadece ayni gun icinde 100%'e ulasildiginda tetiklenir
  useEffect(() => {
    // Tarih degistiyse, onceki yuzdeyi mevcut yuzdeye esitle (kutlama yapma)
    if (oncekiTarihRef.current !== mevcutTarih) {
      oncekiYuzdeRef.current = yuzde;
      oncekiTarihRef.current = mevcutTarih;
      return;
    }
    
    // Ayni gun icinde 100%'e yeni ulasildiysa kutlama yap
    if (yuzde === 100 && oncekiYuzdeRef.current !== null && oncekiYuzdeRef.current < 100) {
      setKutlamaGoster(true);
    }
    
    oncekiYuzdeRef.current = yuzde;
  }, [yuzde, mevcutTarih]);

  const getMotivasyon = () => {
    if (yuzde === 100) return { mesaj: 'Mükemmel! Tüm namazlar kılındı! 🎉', renk: '#FFD700', ikon: '🏆' };
    if (yuzde >= 80) return { mesaj: 'Harika gidiyorsunuz! 💪', renk: RENKLER.BIRINCIL, ikon: '📈' };
    if (yuzde >= 50) return { mesaj: 'İyi bir başlangıç! 🌟', renk: RENKLER.BILGI, ikon: '🌟' };
    return { mesaj: 'Haydi başlayalım! 🤲', renk: '#FF9800', ikon: '🤲' };
  };

  const motivasyon = getMotivasyon();

  return (
    <View style={styles.container}>
      {/* Kutlama Animasyonu - %100 olunca gosterilir */}
      <KutlamaAnimasyonu 
        gorunsun={kutlamaGoster} 
        boyut={200}
        animasyonBittiCallback={() => setKutlamaGoster(false)}
      />

      <View style={styles.ustBolum}>
        <View style={styles.solBolum}>
          {/* %100 oldugunda basari animasyonu goster */}
          {yuzde === 100 ? (
            <View style={styles.basariAnimasyonContainer}>
              <BasariAnimasyonu boyut={60} gorunsun={true} />
            </View>
          ) : (
            <Text style={styles.yuzdeText}>{yuzde}%</Text>
          )}
          <Text style={styles.altText}>Tamamlandi</Text>
        </View>
        <View style={styles.ilerlemeContainer}>
          <View style={styles.ilerlemeDaire}>
            <View style={[
              styles.ilerlemeDolgu,
              { 
                width: `${yuzde}%`,
                backgroundColor: motivasyon.renk,
              }
            ]} />
          </View>
          <Text style={styles.sayi}>{tamamlanan}/{toplam}</Text>
        </View>
      </View>

      <View style={[styles.motivasyonContainer, { backgroundColor: `${motivasyon.renk}20` }]}>
        <Text style={styles.motivasyonIkon}>{motivasyon.ikon}</Text>
        <Text style={[styles.motivasyonText, { color: motivasyon.renk }]}>
          {motivasyon.mesaj}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: RENKLER.BEYAZ,
    borderRadius: BOYUTLAR.YUVARLATMA_BUYUK,
    padding: BOYUTLAR.PADDING_ORTA,
    margin: BOYUTLAR.MARGIN_ORTA,
    shadowColor: RENKLER.SIYAH,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'visible',
  },
  ustBolum: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: BOYUTLAR.MARGIN_ORTA,
  },
  solBolum: {
    alignItems: 'center',
  },
  basariAnimasyonContainer: {
    marginBottom: -8,
  },
  yuzdeText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: RENKLER.BIRINCIL,
  },
  altText: {
    fontSize: BOYUTLAR.FONT_KUCUK,
    color: RENKLER.GRI,
  },
  ilerlemeContainer: {
    flex: 1,
    marginLeft: BOYUTLAR.MARGIN_BUYUK,
    alignItems: 'flex-end',
  },
  ilerlemeDaire: {
    width: '100%',
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  ilerlemeDolgu: {
    height: '100%',
    borderRadius: 6,
  },
  sayi: {
    marginTop: 4,
    fontSize: BOYUTLAR.FONT_KUCUK,
    color: RENKLER.GRI_KOYU,
    fontWeight: '600',
  },
  motivasyonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: BOYUTLAR.PADDING_KUCUK,
    borderRadius: BOYUTLAR.YUVARLATMA_KUCUK,
    justifyContent: 'center',
  },
  motivasyonIkon: {
    fontSize: 18,
    marginRight: 8,
  },
  motivasyonText: {
    fontSize: BOYUTLAR.FONT_NORMAL,
    fontWeight: '600',
  },
});

