import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRenkler } from '../../../core/theme';
import { kabeyeMesafeKm, mesafeMetni, yonCumlesi } from '../../../core/kible/acilar';
import { kalibrasyonIpucu } from '../../hooks/useKible';
import type { KibleKaresi, KibleOzeti } from '../../hooks/useKible';
import { HARF_HALKA_R, KABE_HALKA_R, KadranCizimi } from './KadranCizimi';
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
  /**
   * Cihazda pusula algılayıcısı yok: kadran KUZEY YUKARI sabit çizilir, Kâbe kıble açısında
   * durur, dönen hiçbir şey yoksa da ekran tam bir pusuladır (mağaza karesi simülatörde
   * bu dalı çeker). Yön cümlesi yerine büyük açı + yer adı.
   */
  statik?: boolean;
  /** Konumun görünen adı ("Fatih, İstanbul") ya da bilinmiyor. */
  yerAdi?: string | null;
  /** Kalibrasyon rehberi açıkken sakin ipucu satırı gizlenir (iki ipucu yan yana olmasın). */
  kalibrasyonAcik?: boolean;
}> = ({ kibleAcisi, konum, ozet, abone, pusulaDogrulugu, hareketAzalt, onKameraya, statik = false, yerAdi = null, kalibrasyonAcik = false }) => {
  const renkler = useRenkler();
  const { width, height } = useWindowDimensions();
  // Kadran ekranın görsel merkezini doldurur: üst/alt metinler sabit yükseklikte, gerisi kadran.
  // Yatay pencerede (tablet, açık Fold) yükseklik başlık + mod seçici + sekme çubuğunu da
  // taşır: 0,52 oranı kadranı taşırıyor, ortalanan blok yön cümlesini mod seçicinin
  // ÜSTÜNE itiyordu (tablet karesinde görüldü). Yatayda kadran daha alçak tutulur.
  const S = Math.min(width * KADRAN_ORANI, height * (width > height ? 0.4 : 0.52), 440);
  // Kâbe küpü dış halkanın İÇİNDE, kıble ışınının ucunda (KadranCizimi birimleri /200).
  const R = (S * KABE_HALKA_R) / 200;
  const KABE = Math.round(S * 0.12);
  // Kadranın sahne içindeki dikey yeri: dönen modda üstte çentik + ufuk için pay.
  const UST = statik ? 4 : Math.round(S * 0.1);

  const surekli = useSharedValue(0);
  const dik = useSharedValue(0);
  const kible = useSharedValue(kibleAcisi ?? 0);

  useEffect(() => {
    kible.value = kibleAcisi ?? 0;
  }, [kibleAcisi, kible]);

  useEffect(
    () =>
      statik
        ? undefined
        : abone((k) => {
        surekli.value = k.surekliBaslik;
        dik.value = k.dikOrani;
      }),
    [abone, surekli, dik, statik],
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
  const cumle = statik
    ? kibleAcisi === null
      ? 'Konumunuz alınıyor…'
      : `Kıble kuzeyden ${Math.round(kibleAcisi)}°`
    : !ozet.hazir
    ? 'Pusula hazırlanıyor…'
    : kibleAcisi === null || ozet.fark === null
      ? 'Konumunuz alınıyor…'
      : yonCumlesi(ozet.fark, ozet.hizali);

  return (
    <View style={styles.kap}>
      <View style={styles.ust}>
        {statik && kibleAcisi !== null ? (
          <Text testID="kible-statik-aci" style={[styles.buyukAci, { color: renkler.metin }]} accessibilityLabel={cumle}>
            {Math.round(kibleAcisi)}°
          </Text>
        ) : (
          <Text
            testID="kible-yon-cumlesi"
            style={[styles.cumle, { color: ozet.hizali ? renkler.birincil : renkler.metin }]}
            accessibilityRole="header"
          >
            {cumle}
          </Text>
        )}
        {statik && kibleAcisi !== null ? (
          <Text style={[styles.alt, { color: renkler.metinIkincil }]}>
            {[yerAdi, mesafe ? `Kâbe ${mesafe} uzakta` : null].filter(Boolean).join(', ') || 'Kuzeyden saat yönünde'}
          </Text>
        ) : kibleAcisi !== null && (
          <Text style={[styles.alt, { color: renkler.metinIkincil }]}>
            {mesafe ? `Kâbe ${mesafe} uzakta, ` : ''}kuzeyden {Math.round(kibleAcisi)}°
          </Text>
        )}
      </View>

      <View
        style={[styles.sahne, { width: S, height: S + UST, marginTop: statik ? 28 : 12 }]}
        accessible
        accessibilityLabel={`Kıble pusulası. ${cumle}`}
      >
        <Animated.View pointerEvents="none" style={[styles.ufuk, { top: UST / 2, borderColor: renkler.sinir }, ufukStili]}>
          <Text style={[styles.ufukMetni, { color: renkler.metinIkincil }]}>ufuk</Text>
        </Animated.View>

        {/* Sabit çentik: telefonun baktığı yön (statikte anlamsız: kadran kuzey yukarı). */}
        {!statik && (
          <View style={[styles.centik, { top: UST - 22 }]}>
            <FontAwesome5 name="caret-down" size={30} color={vurgu} />
          </View>
        )}

        <Animated.View
          style={[{ width: S, height: S, marginTop: UST, opacity: ozet.hazir || statik ? 1 : 0.35 }, kadranStili]}
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

        {YON_HARFLERI.map(([harf, aci]) => (
          <YonHarfi
            key={harf}
            harf={harf}
            aci={aci}
            yaricap={(S * HARF_HALKA_R) / 200}
            merkezY={UST + S / 2}
            merkezX={S / 2}
            surekli={surekli}
            dik={dik}
            renk={aci === 0 ? renkler.hata ?? renkler.metin : renkler.metin}
            boyut={Math.round(S * 0.075)}
          />
        ))}

        {kibleAcisi !== null && (ozet.hazir || statik) && (
          <Animated.View
            pointerEvents="none"
            testID="kible-kabe-isareti"
            style={[styles.kabe, { top: UST + S / 2 - KABE / 2, left: S / 2 - KABE / 2, width: KABE, height: KABE }, kabeStili]}
          >
            <KabeSimgesi boyut={KABE} kontur={renkler.sinir} />
          </Animated.View>
        )}

        {!statik && (
        <View pointerEvents="none" style={[styles.merkez, { top: UST + S / 2 - S * 0.17, left: S / 2 - S * 0.17 }]}>
          <HizaHalkasi
            hizali={ozet.hizali}
            renk={renkler.birincil}
            ustRenk={renkler.birincilMetin ?? '#FFFFFF'}
            boyut={S * 0.34}
            hareketAzalt={hareketAzalt}
          />
        </View>
        )}
      </View>

      {statik && (
        <View style={styles.statikBilgi}>
          <FontAwesome5 name="info-circle" size={13} color={renkler.metinIkincil} style={{ marginRight: 8 }} />
          <Text testID="kible-statik-bilgi" style={[styles.bilgiSatiri, { color: renkler.metinIkincil }]}>
            Bu cihazda pusula yok; kuzeye göre yönü gösteriyoruz.
          </Text>
        </View>
      )}

      {/* Doğruluk DÜŞÜKKEN ayrı uyarı yok: `KalibrasyonRehberi` (KibleSayfasi) açılır — iki
          ipucu yan yana gösterilmez. Bilinmiyorken yalnız sakin bir bilgi satırı. */}
      {!statik && !kalibrasyonAcik && ipucu === 'sonuk' && (
        <Text style={[styles.bilgi, { color: renkler.metinIkincil }]}>
          Yön kayıyorsa telefonunuzu havada 8 çizer gibi hareket ettirin.
        </Text>
      )}
      {!statik && ozet.dik && onKameraya && (
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

const YON_HARFLERI: Array<[string, number]> = [
  ['K', 0],
  ['D', 90],
  ['G', 180],
  ['B', 270],
];

/**
 * Yön harfi: KONUMU kadranla döner (ve yatıkken kadranın izdüşümüne oturur), harfin KENDİSİ
 * daima dik okunur — SVG'de kadranla birlikte çizilse "G" baş aşağı, "B" yan dönerdi.
 */
const YonHarfi: React.FC<{
  harf: string;
  aci: number;
  yaricap: number;
  merkezX: number;
  merkezY: number;
  surekli: SharedValue<number>;
  dik: SharedValue<number>;
  renk: string;
  boyut: number;
}> = ({ harf, aci, yaricap, merkezX, merkezY, surekli, dik, renk, boyut }) => {
  const kutu = boyut * 1.6;
  const stil = useAnimatedStyle(() => {
    const t = (dik.value * KADRAN_AZAMI_YATIS * Math.PI) / 180;
    const th = ((aci - surekli.value) * Math.PI) / 180;
    const y0 = -yaricap * Math.cos(th);
    const s = KADRAN_PERSPEKTIF / (KADRAN_PERSPEKTIF - y0 * Math.sin(t));
    return {
      transform: [
        { translateX: yaricap * Math.sin(th) * s },
        { translateY: y0 * Math.cos(t) * s },
        { scale: s },
      ],
    };
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.harf, { left: merkezX - kutu / 2, top: merkezY - kutu / 2, width: kutu, height: kutu }, stil]}
    >
      <Text style={{ color: renk, fontSize: boyut, fontWeight: aci === 0 ? '800' : '700' }}>{harf}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  harf: { position: 'absolute', zIndex: 2, alignItems: 'center', justifyContent: 'center' },
  kap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingBottom: 16 },
  buyukAci: { fontSize: 44, fontWeight: '800', textAlign: 'center', fontVariant: ['tabular-nums'], letterSpacing: -1 },
  statikBilgi: { flexDirection: 'row', alignItems: 'center', maxWidth: 340, marginTop: 24 },
  bilgiSatiri: { fontSize: 13, textAlign: 'center' },
  ust: { alignItems: 'center', justifyContent: 'center' },
  cumle: { fontSize: 22, fontWeight: '700', textAlign: 'center', fontVariant: ['tabular-nums'] },
  alt: { fontSize: 14, marginTop: 4, textAlign: 'center', fontVariant: ['tabular-nums'] },
  // Başlık ile kadran arası ~24–28 dp: ikisi tek blok olarak dikeyde ortalanır.
  sahne: { alignItems: 'center', marginTop: 24 },
  ufuk: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1, alignItems: 'flex-end' },
  ufukMetni: { fontSize: 11, marginTop: 2 },
  centik: { position: 'absolute', zIndex: 3, alignSelf: 'center' },
  kabe: { position: 'absolute', zIndex: 2 },
  merkez: { position: 'absolute', zIndex: 4 },
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
