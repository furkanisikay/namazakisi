import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { CameraView, useCameraPermissions } from 'expo-camera';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { aciNormalize, kabeyeMesafeKm, mesafeMetni, yonCumlesi } from '../../../core/kible/acilar';
import { KAMERA_OPTIGI, kabeyiIzdusur } from '../../../core/kible/kameraProjeksiyonu';
import type { KibleKaresi, KibleOzeti } from '../../hooks/useKible';
import { KabeSimgesi } from './KabeSimgesi';
import { HizaHalkasi } from './HizaHalkasi';
import { KibleYolu } from './KibleYolu';
import { bicim } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';

/** Kamera üstündeki yazılar için koyu tül (görüntü ne olursa olsun okunur). Dekoratif zemin. */
const TUL = 'rgba(0,0,0,0.55)';
const TUL_METNI = '#FFFFFF';
const KABE_BOYUT = 64;

/**
 * Kameralı kıble (kendi kodumuz; dış site/WebView yok, internet gerekmez).
 *
 * Kamera önizlemesinin üstüne Kâbe yönü iğne deliği modeliyle izdüşürülür
 * (`core/kible/kameraProjeksiyonu`): yön ekrandaysa orada Kâbe işareti ve mesafe, değilse
 * kenarda "sağa/sola dönün" oku; ayaktan Kâbe'ye zeminde bir yol (`KibleYolu`). Görüntü
 * yalnız ekranda gösterilir; kaydedilmez, hiçbir
 * yere gönderilmez.
 *
 * Kamera izni yalnız bu görünümde, kullanıcı "Kamerayı açın"a bastığında istenir; reddedilirse
 * kamerasız 3B pusulaya dönüş düğmesi sunulur (aynı yön hesabı).
 */
export const KameraGorunumu: React.FC<{
  aktif: boolean;
  kibleAcisi: number | null;
  konum: { lat: number; lng: number } | null;
  ozet: KibleOzeti;
  abone: (d: (k: KibleKaresi) => void) => () => void;
  vektorGuvenilir: boolean | null;
  hareketAzalt: boolean;
  onPusulaya: () => void;
}> = ({ aktif, kibleAcisi, konum, ozet, abone, vektorGuvenilir, hareketAzalt, onPusulaya }) => {
  const renkler = useRenkler();
  const metinler = useMetin().kible;
  const m = metinler.kamera;
  const [izin, izinIste] = useCameraPermissions();
  const [kameraHatasi, setKameraHatasi] = useState(false);
  const [alan, setAlan] = useState({ w: 0, h: 0 });
  const alanRef = useRef(alan);
  alanRef.current = alan;
  const kibleRef = useRef(kibleAcisi);
  kibleRef.current = kibleAcisi;

  const mx = useSharedValue(0);
  const my = useSharedValue(0);
  const gorunur = useSharedValue(0);
  const okYon = useSharedValue(0); // 1 sağ, −1 sol, 0 yok

  const optik = KAMERA_OPTIGI[Platform.OS === 'ios' ? 'ios' : 'android'];

  useEffect(
    () =>
      abone((k) => {
        const { w, h } = alanRef.current;
        const kible = kibleRef.current;
        if (!k.taban || kible === null || k.fark === null || w <= 0 || k.dikOrani < 0.5) {
          gorunur.value = 0;
          okYon.value = 0;
          return;
        }
        const iz = kabeyiIzdusur({
          taban: k.taban,
          kibleManyetik: aciNormalize(kible - k.manyetikSapma),
          fark: k.fark,
          genislik: w,
          yukseklik: h,
          optik,
        });
        if (iz.tur === 'ekranda') {
          mx.value = iz.x;
          my.value = iz.y;
          gorunur.value = 1;
          okYon.value = 0;
        } else {
          gorunur.value = 0;
          okYon.value = iz.yon === 'sag' ? 1 : -1;
        }
      }),
    [abone, gorunur, mx, my, okYon, optik],
  );

  const kabeStili = useAnimatedStyle(() => ({
    opacity: gorunur.value,
    transform: [{ translateX: mx.value - KABE_BOYUT / 2 }, { translateY: my.value - KABE_BOYUT / 2 }],
  }));
  const sagOkStili = useAnimatedStyle(() => ({ opacity: okYon.value > 0 ? 1 : 0 }));
  const solOkStili = useAnimatedStyle(() => ({ opacity: okYon.value < 0 ? 1 : 0 }));

  const ayarlariAc = useCallback(() => {
    void Linking.openSettings().catch(() => undefined);
  }, []);

  // ---- Kamerasız düşüş durumları ----
  const dususKarti = (ikon: string, baslik: string, metin: string, eylem?: { etiket: string; ikon: string; onPress: () => void }) => (
    <View style={styles.dusus}>
      <View style={[styles.kart, { backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }]}>
        <View style={[styles.cip, { backgroundColor: renkler.birincil + '20' }]}>
          <FontAwesome5 name={ikon} size={18} color={renkler.birincil} />
        </View>
        <Text style={[styles.kartBaslik, { color: renkler.metin }]}>{baslik}</Text>
        <Text style={[styles.kartMetin, { color: renkler.metinIkincil }]}>{metin}</Text>
        {eylem && (
          <TouchableOpacity
            onPress={eylem.onPress}
            accessibilityRole="button"
            accessibilityLabel={eylem.etiket}
            style={[styles.birincil, { backgroundColor: renkler.birincil }]}
          >
            <FontAwesome5 name={eylem.ikon} size={14} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.birincilMetin}>{eylem.etiket}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={onPusulaya}
          accessibilityRole="button"
          accessibilityLabel={m.pusulayiKullanin}
          style={[styles.ikincil, { backgroundColor: renkler.arkaplan, borderColor: renkler.sinir }]}
        >
          <FontAwesome5 name="compass" size={14} color={renkler.metin} style={{ marginRight: 8 }} />
          <Text style={[styles.ikincilMetin, { color: renkler.metin }]}>{m.pusulayiKullanin}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (vektorGuvenilir === false) {
    return dususKarti(
      'exclamation-circle',
      m.kullanilamiyorBaslik,
      m.kullanilamiyorMetin,
    );
  }
  if (!izin) return <View style={styles.dusus} />;
  if (!izin.granted) {
    return izin.canAskAgain
      ? dususKarti(
          'camera',
          m.izinBaslik,
          m.izinMetin,
          { etiket: m.kamerayiAcin, ikon: 'camera', onPress: () => void izinIste().catch(() => undefined) },
        )
      : dususKarti(
          'camera',
          m.izinKapaliBaslik,
          m.izinKapaliMetin,
          { etiket: m.ayarlariAcin, ikon: 'cog', onPress: ayarlariAc },
        );
  }
  if (kameraHatasi) {
    return dususKarti('video-slash', m.acilamadiBaslik, m.acilamadiMetin);
  }

  const mesafe = konum ? mesafeMetni(kabeyeMesafeKm(konum.lat, konum.lng)) : null;
  const cumle =
    !ozet.hazir || kibleAcisi === null || ozet.fark === null
      ? m.hesaplaniyor
      : !ozet.dik
        ? m.dikTutun
        : yonCumlesi(ozet.fark, ozet.hizali);

  return (
    <View
      style={styles.kap}
      onLayout={(e) => setAlan({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
    >
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        active={aktif}
        mute
        animateShutter={false}
        onMountError={() => setKameraHatasi(true)}
      />

      {/* Yerdeki yol: ayaktan Kâbe'ye (yalnız görsel; işaretin altında birleşir). */}
      <KibleYolu
        abone={abone}
        kibleAcisi={kibleAcisi}
        genislik={alan.w}
        yukseklik={alan.h}
        optik={optik}
        hizali={ozet.hizali && ozet.dik}
        renk={renkler.birincil}
        hareketAzalt={hareketAzalt}
      />

      {/* Ufuk/hedef çerçevesi: ortadaki daire; işaret onun içine gelince hizalısınız. */}
      <View pointerEvents="none" style={[styles.hedef, { top: alan.h / 2 - 48, left: alan.w / 2 - 48 }]}>
        <View style={[styles.hedefHalka, { borderColor: ozet.hizali ? renkler.birincil : 'rgba(255,255,255,0.75)' }]} />
      </View>
      <View pointerEvents="none" style={{ position: 'absolute', top: alan.h / 2 - 60, left: alan.w / 2 - 60 }}>
        <HizaHalkasi hizali={ozet.hizali && ozet.dik} renk={renkler.birincil} ustRenk="#FFFFFF" boyut={120} hareketAzalt={hareketAzalt} />
      </View>

      <Animated.View pointerEvents="none" testID="kamera-kabe-isareti" style={[styles.kabe, kabeStili]}>
        <KabeSimgesi boyut={KABE_BOYUT} kontur="rgba(255,255,255,0.8)" />
        {mesafe && (
          // İşaret kutusundan (64) GENİŞ kap: "2.405 km" iki satıra bölünmesin, ortalı kalsın.
          <View style={styles.etiketKap}>
            <View style={[styles.etiket, { backgroundColor: TUL }]}>
              <Text style={styles.etiketMetni} numberOfLines={1}>
                {mesafe}
              </Text>
            </View>
          </View>
        )}
      </Animated.View>

      <Animated.View pointerEvents="none" style={[styles.ok, styles.okSag, sagOkStili]}>
        <FontAwesome5 name="chevron-right" size={34} color={TUL_METNI} />
      </Animated.View>
      <Animated.View pointerEvents="none" style={[styles.ok, styles.okSol, solOkStili]}>
        <FontAwesome5 name="chevron-left" size={34} color={TUL_METNI} />
      </Animated.View>

      <View style={[styles.panel, { backgroundColor: TUL }]} accessible accessibilityLabel={cumle}>
        <Text testID="kamera-yon-cumlesi" style={styles.panelCumle}>
          {cumle}
        </Text>
        {mesafe && <Text style={styles.panelAlt}>{bicim(metinler.pusula.kabeUzakta, { mesafe })}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  kap: { flex: 1, overflow: 'hidden', backgroundColor: '#000000' },
  dusus: { flex: 1, justifyContent: 'center', padding: 16 },
  kart: { borderRadius: 24, borderWidth: 1, padding: 20, alignItems: 'center' },
  cip: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  kartBaslik: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  kartMetin: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 16 },
  birincil: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    alignSelf: 'stretch',
    borderRadius: 16,
    marginBottom: 10,
  },
  birincilMetin: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  ikincil: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    alignSelf: 'stretch',
    borderRadius: 16,
    borderWidth: 1,
  },
  ikincilMetin: { fontSize: 14, fontWeight: '600' },
  hedef: { position: 'absolute', width: 96, height: 96, alignItems: 'center', justifyContent: 'center' },
  hedefHalka: { width: 96, height: 96, borderRadius: 48, borderWidth: 2 },
  kabe: { position: 'absolute', top: 0, left: 0, width: KABE_BOYUT, alignItems: 'center' },
  etiketKap: { width: 160, marginTop: 6, alignItems: 'center' },
  etiket: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  etiketMetni: { color: TUL_METNI, fontSize: 12, fontWeight: '600', fontVariant: ['tabular-nums'] },
  ok: { position: 'absolute', top: '45%', width: 44, height: 64, alignItems: 'center', justifyContent: 'center' },
  okSag: { right: 8 },
  okSol: { left: 8 },
  panel: { position: 'absolute', left: 16, right: 16, bottom: 16, borderRadius: 20, paddingVertical: 12, paddingHorizontal: 16 },
  panelCumle: { color: TUL_METNI, fontSize: 18, fontWeight: '700', textAlign: 'center', fontVariant: ['tabular-nums'] },
  panelAlt: { color: 'rgba(255,255,255,0.85)', fontSize: 13, textAlign: 'center', marginTop: 2 },
});
