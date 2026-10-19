import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRenkler } from '../../../core/theme';
import { kabeyeMesafeKm, mesafeMetni, yonCumlesi } from '../../../core/kible/acilar';
import { kalibrasyonIpucu } from '../../hooks/useKible';
import type { KibleKaresi, KibleOzeti } from '../../hooks/useKible';
import { KadranCizimi } from './KadranCizimi';
import { KabeSimgesi } from './KabeSimgesi';
import { HizaHalkasi } from './HizaHalkasi';
import { KADRAN_AZAMI_YATIS, KADRAN_ORANI, KADRAN_PERSPEKTIF } from './sabitler';

/**
 * Kamerasız 3B pusula.
 *
 * Telefon DÜZKEN klasik pusula: kadran yönle döner, Kâbe işareti üstteki çentiğe gelince
 * kıble yönündesiniz. Telefon DİKLEŞTİKÇE kadran perspektifle yere yatar (en çok
 * `KADRAN_AZAMI_YATIS`) ve Kâbe küpü halkanın üstünde ayağa kalkar — kamera görünümünün
 * kamerasız hâli. Geçiş sensörden sürekli (eğim oranı), animasyon zamanlayıcısı yok.
 *
 * Bütün hareket UI thread'inde: sensör karesi shared value'ya yazılır, React yeniden
 * çizmez. Metinler `ozet`ten (≤4/sn).
 */
export const PusulaGorunumu: React.FC<{
  kibleAcisi: number | null;
  konum: { lat: number; lng: number } | null;
  ozet: KibleOzeti;
  abone: (d: (k: KibleKaresi) => void) => () => void;
  pusulaDogrulugu: number | null;
  hareketAzalt: boolean;
  onKameraya?: () => void;
}> = ({ kibleAcisi, konum, ozet, abone, pusulaDogrulugu, hareketAzalt, onKameraya }) => {
  const renkler = useRenkler();
  const { width, height } = useWindowDimensions();
  const S = Math.min(width * KADRAN_ORANI, height * 0.46, 420);
  const R = S * 0.4; // kadrandaki Kâbe noktasının yarıçapı (KadranCizimi: y=20/200)
  const KABE = Math.round(S * 0.13);

  const surekli = useSharedValue(0);
  const dik = useSharedValue(0);
  const kible = useSharedValue(kibleAcisi ?? 0);

  useEffect(() => {
    kible.value = kibleAcisi ?? 0;
  }, [kibleAcisi, kible]);

  useEffect(
    () =>
      abone((k) => {
        surekli.value = k.surekliBaslik;
        dik.value = k.dikOrani;
      }),
    [abone, surekli, dik],
  );

  const kadranStili = useAnimatedStyle(() => ({
    transform: [
      { perspective: KADRAN_PERSPEKTIF },
      { rotateX: `${dik.value * KADRAN_AZAMI_YATIS}deg` },
      { rotate: `${-surekli.value}deg` },
    ],
  }));

  // Kâbe küpü kadranla birlikte YATMAZ: halkadaki yerinin izdüşümüne dik olarak oturur.
  const kabeStili = useAnimatedStyle(() => {
    const t = (dik.value * KADRAN_AZAMI_YATIS * Math.PI) / 180;
    const th = ((kible.value - surekli.value) * Math.PI) / 180;
    const x0 = R * Math.sin(th);
    const y0 = -R * Math.cos(th);
    const uzak = -y0 * Math.sin(t); // >0: ekrandan içeri
    const s = KADRAN_PERSPEKTIF / (KADRAN_PERSPEKTIF + uzak);
    const buyume = 1 + 0.55 * dik.value;
    return {
      transform: [
        { translateX: x0 * s },
        // Dikken küp halkanın üstünde "ayakta" durur: tabanı noktaya oturur.
        { translateY: y0 * Math.cos(t) * s - (KABE * buyume * dik.value) / 2 },
        { scale: s * buyume },
      ],
      // Kadranın arka yarısındaki (yatıkken) küp hafif soluk: önü-arkası okunur.
      opacity: 1 - 0.45 * dik.value * Math.max(0, -Math.cos(th)),
    };
  });

  const ufukStili = useAnimatedStyle(() => ({ opacity: dik.value }));

  const ipucu = kalibrasyonIpucu(pusulaDogrulugu);
  const vurgu = ozet.hizali ? renkler.birincil : renkler.metinIkincil;
  const mesafe = konum ? mesafeMetni(kabeyeMesafeKm(konum.lat, konum.lng)) : null;
  const cumle = !ozet.hazir
    ? 'Pusula hazırlanıyor…'
    : kibleAcisi === null || ozet.fark === null
      ? 'Konumunuz alınıyor…'
      : yonCumlesi(ozet.fark, ozet.hizali);

  return (
    <View style={styles.kap}>
      <View style={styles.ust}>
        <Text
          testID="kible-yon-cumlesi"
          style={[styles.cumle, { color: ozet.hizali ? renkler.birincil : renkler.metin }]}
          accessibilityRole="header"
        >
          {cumle}
        </Text>
        {kibleAcisi !== null && (
          <Text style={[styles.alt, { color: renkler.metinIkincil }]}>
            {mesafe ? `Kâbe ${mesafe} uzakta, ` : ''}kuzeyden {Math.round(kibleAcisi)}°
          </Text>
        )}
      </View>

      <View
        style={[styles.sahne, { width: S, height: S * 1.12 }]}
        accessible
        accessibilityLabel={`Kıble pusulası. ${cumle}`}
      >
        <Animated.View pointerEvents="none" style={[styles.ufuk, { top: S * 0.06, borderColor: renkler.sinir }, ufukStili]}>
          <Text style={[styles.ufukMetni, { color: renkler.metinIkincil }]}>ufuk</Text>
        </Animated.View>

        {/* Sabit çentik: telefonun baktığı yön */}
        <View style={[styles.centik, { top: S * 0.06 - 14 }]}>
          <FontAwesome5 name="caret-down" size={30} color={vurgu} />
        </View>

        <Animated.View
          style={[{ width: S, height: S, marginTop: S * 0.12, opacity: ozet.hazir ? 1 : 0.35 }, kadranStili]}
        >
          <KadranCizimi
            boyut={S}
            zemin={renkler.kartArkaplan}
            cizgi={renkler.sinir}
            metin={renkler.metin}
            kuzey={renkler.hata ?? renkler.metin}
            vurgu={renkler.birincil}
            kibleAcisi={kibleAcisi}
          />
        </Animated.View>

        {kibleAcisi !== null && ozet.hazir && (
          <Animated.View
            pointerEvents="none"
            testID="kible-kabe-isareti"
            style={[styles.kabe, { top: S * 0.12 + S / 2 - KABE / 2, left: S / 2 - KABE / 2, width: KABE, height: KABE }, kabeStili]}
          >
            <KabeSimgesi boyut={KABE} kontur={renkler.sinir} />
          </Animated.View>
        )}

        <View pointerEvents="none" style={[styles.merkez, { top: S * 0.12 + S / 2 - S * 0.17, left: S / 2 - S * 0.17 }]}>
          <HizaHalkasi
            hizali={ozet.hizali}
            renk={renkler.birincil}
            ustRenk={renkler.birincilMetin ?? '#FFFFFF'}
            boyut={S * 0.34}
            hareketAzalt={hareketAzalt}
          />
        </View>
      </View>

      {ipucu === 'belirgin' && (
        <View
          testID="kible-kalibrasyon-belirgin"
          accessible
          accessibilityLabel="Pusula doğruluğu düşük. Telefonunuzu havada 8 çizer gibi birkaç kez hareket ettirin."
          style={[styles.uyari, { borderLeftColor: renkler.dikkat ?? renkler.sinir, backgroundColor: renkler.kartArkaplan }]}
        >
          <FontAwesome5 name="infinity" size={14} color={renkler.dikkat ?? renkler.metin} style={{ marginRight: 10 }} />
          <Text style={[styles.uyariMetni, { color: renkler.metin }]}>
            Pusula doğruluğu düşük. Telefonunuzu havada 8 çizer gibi birkaç kez hareket ettirin.
          </Text>
        </View>
      )}
      {ipucu === 'sonuk' && (
        <Text style={[styles.bilgi, { color: renkler.metinIkincil }]}>
          Yön kayıyorsa telefonunuzu havada 8 çizer gibi hareket ettirin; mıknatıs ve metallerden uzak durun.
        </Text>
      )}
      {ozet.dik && onKameraya && (
        <TouchableOpacity
          onPress={onKameraya}
          accessibilityRole="button"
          accessibilityLabel="Kamerayla görün"
          style={[styles.cip, { borderColor: renkler.sinir, backgroundColor: renkler.kartArkaplan }]}
        >
          <FontAwesome5 name="camera" size={13} color={renkler.birincil} style={{ marginRight: 8 }} />
          <Text style={[styles.cipMetni, { color: renkler.metin }]}>Kamerayla görün</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  kap: { flex: 1, alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16 },
  ust: { alignItems: 'center', minHeight: 64, justifyContent: 'center', marginTop: 4 },
  cumle: { fontSize: 22, fontWeight: '700', textAlign: 'center', fontVariant: ['tabular-nums'] },
  alt: { fontSize: 14, marginTop: 4, textAlign: 'center', fontVariant: ['tabular-nums'] },
  sahne: { alignItems: 'center', marginTop: 8 },
  ufuk: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1, alignItems: 'flex-end' },
  ufukMetni: { fontSize: 11, marginTop: 2 },
  centik: { position: 'absolute', zIndex: 3, alignSelf: 'center' },
  kabe: { position: 'absolute', zIndex: 2 },
  merkez: { position: 'absolute', zIndex: 4 },
  uyari: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 3,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 12,
    alignSelf: 'stretch',
  },
  uyariMetni: { flex: 1, fontSize: 14 },
  bilgi: { textAlign: 'center', fontSize: 12, marginTop: 10, maxWidth: 320 },
  cip: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 12,
  },
  cipMetni: { fontSize: 14, fontWeight: '600' },
});
