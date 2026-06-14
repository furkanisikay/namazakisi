/**
 * Guncelleme Bildirimi Bileseni
 *
 * Yeni bir guncelleme mevcut oldugunda ekranin altindan
 * kayarak cikan animasyonlu bildirim paneli.
 *
 * Ozellikler:
 * - Animasyonlu giris/cikis (alttan kayma + fade)
 * - Tema destekli (acik/koyu)
 * - Ikon tabanli (emoji yok)
 * - Minimal ve bilgilendirici tasarim
 * - "Guncelle" ve "Sonra" butonlari
 * - Versiyon bilgisi ve degisiklik notlari
 */

import * as React from 'react';
import { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  Linking,
  Platform,
} from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRenkler } from '../../../core/theme';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { Logger } from '../../../core/utils/Logger';
import {
  guncellemeErtele,
  bildirimiKapat,
  indirmeTamamlandiIsaretle,
  indirmeDurumuSifirla,
} from '../../store/guncellemeSlice';
import { yayinTarihiniFormatla, guvenilirBaglantiMi } from '../../../domain/services/GuncellemeServisi';
import { PlayStoreModulu } from '../../../domain/services/PlayStoreGuncellemeModulu';

/**
 * Guncelleme bildirimi bileseni
 * App.tsx'de NavigationContainer icine yerlestirilir
 */
export const GuncellemeBildirimi: React.FC = () => {
  const renkler = useRenkler();
  const dispatch = useAppDispatch();

  const guncellemeMevcut = useAppSelector((state) => state.guncelleme.guncellemeMevcut);
  const bilgi = useAppSelector((state) => state.guncelleme.bilgi);
  const bildirimiKapatti = useAppSelector((state) => state.guncelleme.bildirimiKapatti);
  const indirmeTamamlandi = useAppSelector((state) => state.guncelleme.indirmeTamamlandi);


  // Animasyon degerleri
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Issue #91: completeUpdate yalnizca BIR KEZ cagrilsin. completeUpdate uygulamayi
  // yeniden baslatir; birden fazla tetik (cift tiklama, tekrar DOWNLOADED olayi)
  // ust uste restart denemesine yol acardi.
  const tamamlamaBaslatildi = useRef(false);

  // Indirme tamamlandi onayi: Play Store esnek guncelleme indirilince kullaniciya
  // "Yeniden baslat" sorulur; onay UI'i ana guncelleme banner'i kapatilmis olsa
  // bile gosterilir (kullanici "Guncelle"ye basinca banner kapanir, indirme arka
  // planda devam eder, sonra bu onay cikar).
  // indirmeTamamlandi YALNIZCA Play Store esnek-güncelleme akışında set edilir
  // (install dinleyici + bekleyenGuncellemeVarMi) → kaynak zaten playstore.
  // guncellemeMevcut/bilgi'ye BAĞLAMA: indirme DOWNLOADED'a geçince native
  // updateAvailability artık UPDATE_AVAILABLE dönmez → guncellemeKontrolEt
  // bilgi'yi null'a çekebilir; o durumda da onay kartı gösterilmeli (#104 review).
  const yenidenBaslatGoster = indirmeTamamlandi;

  const gosterilsinMi =
    (guncellemeMevcut && bilgi && !bildirimiKapatti) || yenidenBaslatGoster;

  useEffect(() => {
    if (gosterilsinMi) {
      // Giris animasyonu
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Cikis animasyonu
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 250,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [gosterilsinMi, slideAnim, fadeAnim]);

  // Play Store: DOWNLOADED durumunu dinle.
  // ISSUE #91: indirme bitince OTOMATIK completeUpdate cagirma. completeUpdate
  // uygulamayi aninda yeniden baslatir; kullanici ekrani gormeden disari atilirdi.
  // Bunun yerine durumu Redux'a isaretle -> kullaniciya "Yeniden baslat" ONAYI gosterilir.
  useEffect(() => {
    if (bilgi?.kaynak !== 'playstore') return;

    const abonelikIptal = PlayStoreModulu.installDurumDinle((olay) => {
      if (olay.installStatus === 11 /* DOWNLOADED */) {
        dispatch(indirmeTamamlandiIsaretle());
      }
    });

    return abonelikIptal;
  }, [bilgi?.kaynak, dispatch]);

  /**
   * "Yeniden baslat" onayina basildi.
   * completeUpdate uygulamayi yeniden baslatip guncellemeyi kurar — bu YALNIZCA
   * kullanici onayinca cagrilir (issue #91). Idempotent: bir kez tetiklenir.
   */
  const yenidenBaslatBasildi = useCallback(async () => {
    if (tamamlamaBaslatildi.current) return;
    tamamlamaBaslatildi.current = true;
    try {
      const basarili = await PlayStoreModulu.guncellemeYuklemeyiTamamla();
      if (!basarili) {
        // Native modül hazır değil / Android dışı: fırlatmaz, false döner → tekrar denenebilsin.
        tamamlamaBaslatildi.current = false;
        Logger.warn('GuncellemeBildirimi', 'Güncelleme tamamlanamadı (modül false döndü)');
      }
    } catch (hata: any) {
      // Tamamlama basarisizsa kullanici tekrar deneyebilsin
      tamamlamaBaslatildi.current = false;
      Logger.warn('GuncellemeBildirimi', 'Güncelleme tamamlanamadı', hata?.message);
    }
  }, []);

  /**
   * Guncelleme butonuna basildi.
   * Play Store'dan kurulmuşsa: native in-app update flow başlatır ve
   * kendi UI'ını hemen kapatır (Play Store kendi sheet'ini gösterir).
   * GitHub/sideload kurulumda: indirme bağlantısını açar.
   */
  const guncelleBasildi = useCallback(async () => {
    if (!bilgi) return;

    if (bilgi.kaynak === 'playstore') {
      // Kendi UI'ını kapat — Play Store native sheet devralır
      dispatch(bildirimiKapat());
      try {
        await PlayStoreModulu.esnekGuncellemeBaslat();
      } catch (hata: any) {
        Logger.warn('GuncellemeBildirimi', 'Play Store update başlatılamadı', hata?.message);
      }
    } else {
      // GitHub / sideload — mevcut davranış
      if (bilgi.indirmeBaglantisi && guvenilirBaglantiMi(bilgi.indirmeBaglantisi)) {
        Linking.openURL(bilgi.indirmeBaglantisi).catch((hata) => {
          Logger.warn('GuncellemeBildirimi', 'Baglanti acilamadi', hata);
        });
      }
    }
  }, [bilgi, dispatch]);

  /**
   * Erteleme butonuna basildi
   */
  const sonraBasildi = useCallback(() => {
    if (bilgi?.yeniVersiyon) {
      dispatch(guncellemeErtele(bilgi.yeniVersiyon));
    } else {
      dispatch(bildirimiKapat());
    }
  }, [bilgi, dispatch]);

  // Gosterilmeyecekse bos render
  if ((!guncellemeMevcut || !bilgi) && !yenidenBaslatGoster) {
    return null;
  }

  const formatlananTarih = bilgi ? yayinTarihiniFormatla(bilgi.yayinTarihi) : '';

  // Indirme tamamlandi: kullaniciya "Yeniden baslat" ONAY kartini goster
  // (otomatik restart YOK — issue #91).
  if (yenidenBaslatGoster) {
    return (
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
        pointerEvents="auto"
      >
        <View
          style={{
            marginHorizontal: 12,
            marginBottom: Platform.OS === 'ios' ? 34 : 80,
            borderRadius: 16,
            overflow: 'hidden',
            backgroundColor: renkler.kartArkaplan,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 16,
            borderWidth: 1,
            borderColor: renkler.sinir,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 8,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: `${renkler.basarili}26`,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <MaterialIcons name="check-circle" size={24} color={renkler.basarili} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: renkler.metin }}>
                Güncelleme indirildi
              </Text>
              <Text style={{ fontSize: 12, color: renkler.metinIkincil, marginTop: 2 }}>
                Kurulumu tamamlamak için uygulamayı yeniden başlatın.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => dispatch(indirmeDurumuSifirla())}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel="Kapat"
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: `${renkler.metinIkincil}26`,
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 8,
              }}
            >
              <MaterialIcons name="close" size={16} color={renkler.metinIkincil} />
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: 'row',
              paddingHorizontal: 16,
              paddingBottom: 16,
              gap: 8,
            }}
          >
            <TouchableOpacity
              onPress={yenidenBaslatBasildi}
              style={{
                flex: 1,
                flexDirection: 'row',
                paddingVertical: 10,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: renkler.basarili,
                gap: 6,
              }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="restart-alt" size={16} color="#FFFFFF" />
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFFFFF' }}>
                Yeniden Başlat
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  }

  // Buradan sonrası normal güncelleme banner'ı — bilgi kesin dolu (yukarıda guard'landı).
  if (!bilgi) {
    return null;
  }

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
      pointerEvents={gosterilsinMi ? 'auto' : 'none'}
    >
      {/* Yarim saydam arka plan overlay */}
      <View
        style={{
          marginHorizontal: 12,
          marginBottom: Platform.OS === 'ios' ? 34 : 80,
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: renkler.kartArkaplan,
          // Golge
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 16,
          borderWidth: 1,
          borderColor: renkler.sinir,
        }}
      >
        {/* Ust kisim - ikon ve versiyon bilgisi */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 8,
          }}
        >
          {/* Guncelleme ikonu */}
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: `${renkler.bilgi}26`,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <MaterialIcons
              name="system-update"
              size={24}
              color={renkler.bilgi}
            />
          </View>

          {/* Baslik ve versiyon */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: '700',
                color: renkler.metin,
              }}
            >
              Yeni Sürüm Mevcut
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <FontAwesome5
                name="code-branch"
                size={10}
                color={renkler.metinIkincil}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: renkler.metinIkincil,
                  marginLeft: 4,
                }}
              >
                v{bilgi.mevcutVersiyon}
              </Text>
              <MaterialIcons
                name="arrow-forward"
                size={12}
                color={renkler.metinIkincil}
                style={{ marginHorizontal: 4 }}
              />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: renkler.bilgi,
                }}
              >
                {bilgi.yeniVersiyonEtiketi ?? `v${bilgi.yeniVersiyon}`}
              </Text>
              {formatlananTarih ? (
                <Text
                  style={{
                    fontSize: 11,
                    color: renkler.metinIkincil,
                    marginLeft: 8,
                  }}
                >
                  {formatlananTarih}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Kapat butonu */}
          <TouchableOpacity
            onPress={sonraBasildi}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: `${renkler.metinIkincil}26`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialIcons
              name="close"
              size={16}
              color={renkler.metinIkincil}
            />
          </TouchableOpacity>
        </View>

        {/* Degisiklik notlari (kisaltilmis) */}
        {bilgi.degisiklikNotlari ? (
          <View
            style={{
              marginHorizontal: 16,
              marginBottom: 12,
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor: `${renkler.metinIkincil}14`,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: renkler.metinIkincil,
                lineHeight: 18,
              }}
              numberOfLines={3}
            >
              {bilgi.degisiklikNotlari}
            </Text>
          </View>
        ) : null}

        {/* Butonlar */}
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 16,
            paddingBottom: 16,
            gap: 8,
          }}
        >
          {/* Sonra butonu */}
          <TouchableOpacity
            onPress={sonraBasildi}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: `${renkler.metinIkincil}1F`,
            }}
            activeOpacity={0.7}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: renkler.metinIkincil,
              }}
            >
              Sonra
            </Text>
          </TouchableOpacity>

          {/* Guncelle butonu */}
          <TouchableOpacity
            onPress={guncelleBasildi}
            style={{
              flex: 2,
              flexDirection: 'row',
              paddingVertical: 10,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: renkler.bilgi,
              gap: 6,
            }}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="file-download"
              size={16}
              color="#FFFFFF"
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: '#FFFFFF',
              }}
            >
              Güncelle
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};
