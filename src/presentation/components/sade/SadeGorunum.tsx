/**
 * Sade görünüm (issue #295) — yaşlı kullanıcılar için TEK ekran:
 * "Şimdi İkindi · 42 dk · [Kıldım]".
 *
 * Bu bileşen yalnız ÇİZER; işaretleme kararını vermez. "Kıldım" ana ekranın
 * mevcut yolunu çağırır (`AnaSayfa.namazToggle` → kerahat onay modalı aynen).
 * Durum ve okunacak metin saf çekirdekten gelir: `core/sade/sadeGorunum.ts`.
 *
 * Kurallar:
 * - SÜRE DAKİKADA BİR güncellenir (saniye yok): ana ekran saniyede bir çizilir,
 *   bu bileşen `React.memo` ile ondan yalıtılır ve kendi dakika saatini taşır.
 * - İmza öğesi TEK: vaktin geçen kısmını gösteren büyük halka. Geri kalanı sakin.
 * - Halkaya dokununca sesli okunur. Ekran okuyucu açıksa TTS KONUŞMAZ (iki ses
 *   üst üste binerdi) → metin ekran okuyucuya duyurulur.
 * - Yazı sistem ölçeğine saygılıdır; halka içindeki dev metinler taşmasın diye
 *   ölçek tavanı + `adjustsFontSizeToFit` kullanılır.
 * - TÜM METİN `renkler.metin`'dir: `metinIkincil` açık temada zeminle ~4.4:1 verir
 *   (küçük metinde AA sınırının altı); hiyerarşi boyut/kalınlıkla kurulur, renk
 *   soluklaştırmayla değil. `metinIkincil` yalnız dekoratif ikonda.
 */
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  AppState,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { KabulEkSatiri } from '../hareket/KabulEkSatiri';
import { useRenkler } from '../../../core/theme';
import { ACIK_TEMA } from '../../../core/theme/temalar';
import {
  okunurMetinRengi,
  sadeDurumuHesapla,
  sonrakiDakikayaKalanMs,
  type SadeVakitKodu,
} from '../../../core/sade/sadeGorunum';
import { sesliOku, sesliOkumaDestekleniyorMu } from '../../../domain/services/SesliOkumaServisi';
import { aktifDil, bicim } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';
import { useTurkceTtsDestegi } from '../../hooks/useTurkceTtsDestegi';

export interface SadeGorunumProps {
  vakit: SadeVakitKodu | null;
  giris: Date | null;
  /** ISO dizesi — `VakitBilgisi.sonrakiVakitGiris`. */
  sonrakiGirisIso: string | null;
  sonrakiVakit: SadeVakitKodu | null;
  tamamlandi: boolean;
  kayitHazir: boolean;
  mekruhMu: boolean;
  cumaEtiketi: boolean;
  /** Şu anki vakti işaretle (kerahat onayı çağıranda). */
  onKildim: () => void;
  /** Bu oturum için tüm uygulamayı aç. */
  onTumUygulama: () => void;
  /** Kılınınca düğmede yazan dua (`core/samimiyet/kabulDuasi`); verilmezse "Kılındı". */
  kabulMetni?: string;
  /** Kılınınca düğmenin altındaki kısa selam (sabah/yatsı). */
  kabulEki?: string | null;
  /** Başlıktaki günün selamı ("Hayırlı cumalar"); verilmezse "Şimdi". */
  gunSelami?: string | null;
}

/** Dakika sınırına hizalı saat: saniyede bir DEĞİL, dakikada bir yeniden çizer. */
function useDakikaSaati(): Date {
  const [simdi, setSimdi] = useState(() => new Date());
  useEffect(() => {
    let zamanlayici: ReturnType<typeof setTimeout> | null = null;
    const kur = () => {
      zamanlayici = setTimeout(() => {
        setSimdi(new Date());
        kur();
      }, sonrakiDakikayaKalanMs(Date.now()) + 50);
    };
    kur();
    const abonelik = AppState.addEventListener('change', (durum) => {
      if (durum === 'active') setSimdi(new Date());
    });
    return () => {
      if (zamanlayici) clearTimeout(zamanlayici);
      abonelik.remove();
    };
  }, []);
  return simdi;
}

function useEkranOkuyucuAcik(): boolean {
  const [acik, setAcik] = useState(false);
  useEffect(() => {
    let iptal = false;
    AccessibilityInfo.isScreenReaderEnabled()
      .then((deger) => {
        if (!iptal) setAcik(deger === true);
      })
      .catch(() => undefined);
    const abonelik = AccessibilityInfo.addEventListener('screenReaderChanged', (deger: boolean) =>
      setAcik(deger === true)
    );
    return () => {
      iptal = true;
      abonelik?.remove?.();
    };
  }, []);
  return acik;
}

const HALKA_KALINLIK = 14;

const SadeGorunumBileseni: React.FC<SadeGorunumProps> = ({
  vakit,
  giris,
  sonrakiGirisIso,
  sonrakiVakit,
  tamamlandi,
  kayitHazir,
  mekruhMu,
  cumaEtiketi,
  onKildim,
  onTumUygulama,
  kabulMetni,
  kabulEki,
  gunSelami,
}) => {
  const renkler = useRenkler();
  const metinler = useMetin();
  const simdi = useDakikaSaati();
  const ekranOkuyucu = useEkranOkuyucuAcik();
  const okumaVar = sesliOkumaDestekleniyorMu();
  const ttsDestegi = useTurkceTtsDestegi();
  const { width, height } = useWindowDimensions();

  const durum = useMemo(
    () =>
      sadeDurumuHesapla({
        vakit,
        giris,
        sonrakiGiris: sonrakiGirisIso ? new Date(sonrakiGirisIso) : null,
        sonrakiVakit,
        simdi,
        tamamlandi,
        kayitHazir,
        mekruhMu,
        cumaEtiketi,
        kabulMetni,
      }),
    // `metinler`: başlık ve sesli okuma cümleleri etkin dilde üretilir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vakit, giris, sonrakiGirisIso, sonrakiVakit, simdi, tamamlandi, kayitHazir, mekruhMu, cumaEtiketi, kabulMetni, metinler]
  );

  // Halka çapı: pencereye göre (telefon, açık katlanabilir, yatay tablet).
  const cap = Math.round(Math.max(200, Math.min(320, Math.min(width - 64, height * 0.42))));
  const yaricap = (cap - HALKA_KALINLIK) / 2;
  // Urduca Nestalik'in kendi satır yüksekliği ~2,5 em: halkadaki dört satır çemberi aşar.
  // Satır yüksekliği verilince metin kapısı onu 1,8 em'e çeker; diğer dillerde dokunulmaz.
  const satir = (punto: number) => (aktifDil() === 'ur' ? { lineHeight: punto } : null);
  const cevre = 2 * Math.PI * yaricap;

  // Kılındı geçişinde ölçülü bir "oturma" — hareket azaltıldıysa hiç kurulmaz.
  const olcek = useRef(new Animated.Value(1)).current;
  const oncekiTamamlandi = useRef(durum.tamamlandi);
  useEffect(() => {
    const yeniKilindi = durum.tamamlandi && !oncekiTamamlandi.current;
    oncekiTamamlandi.current = durum.tamamlandi;
    if (!yeniKilindi) return;
    AccessibilityInfo.announceForAccessibility(
      `${bicim(metinler.sade.isaretlendiDuyuru, { ad: durum.vakitAdi })}${kabulMetni ? ` ${kabulMetni}.` : ''}`
    );
    let iptal = false;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((azalt) => {
        if (iptal || azalt) return;
        olcek.setValue(0.94);
        Animated.spring(olcek, { toValue: 1, friction: 5, useNativeDriver: true }).start();
      })
      .catch(() => undefined);
    return () => {
      iptal = true;
    };
    // kabulMetni bağımlılık değil: duyuru yalnız geçiş anında.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durum.tamamlandi, durum.vakitAdi, olcek]);

  const oku = () => {
    if (ekranOkuyucu || !okumaVar) {
      AccessibilityInfo.announceForAccessibility(durum.okunacakMetin);
      return;
    }
    sesliOku(durum.okunacakMetin);
  };

  const dugmeMetinRengi = okunurMetinRengi(renkler.birincilKoyu, [
    renkler.birincilMetin,
    ACIK_TEMA.renkler.metin,
  ]);

  let dugmeEtiketi = metinler.vakit.eylem.kildim;
  let dugmeIkonu = 'check';
  let dugmeZemin = renkler.birincilKoyu;
  let dugmeKenar = renkler.birincilKoyu;
  let dugmeMetin = dugmeMetinRengi;
  if (durum.tamamlandi) {
    dugmeEtiketi = kabulMetni ?? metinler.vakit.eylem.kilindi;
    dugmeIkonu = 'check-circle';
    dugmeZemin = `${renkler.basarili}20`;
    dugmeKenar = renkler.basarili;
    dugmeMetin = renkler.metin;
  } else if (durum.tur !== 'vakit') {
    dugmeEtiketi = durum.tur === 'girmedi' ? metinler.sade.vakitGirmedi : metinler.sade.vakitHesaplaniyor;
    dugmeIkonu = 'hourglass-half';
    dugmeZemin = renkler.kartArkaplan;
    dugmeKenar = renkler.sinir;
    dugmeMetin = renkler.metin;
  }
  const dugmeEtkin = durum.kildimEtkin;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: renkler.arkaplan }} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: '100%', maxWidth: 560, alignItems: 'center' }}>
          {/* Günün selamı (cuma, kandil, Ramazan…) — sessiz tek satır, düz metin. */}
          {!!gunSelami && (
            <Text testID="sade-gun-selami" style={{ color: renkler.metin, fontSize: 20, fontWeight: '600', marginBottom: 12 }}>
              {gunSelami}
            </Text>
          )}
          {/* İmza öğesi: vaktin geçen kısmını gösteren halka. Dokununca sesli okunur. */}
          <TouchableOpacity
            testID="sade-halka"
            onPress={oku}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={durum.okunacakMetin}
            accessibilityHint={okumaVar && !ekranOkuyucu ? metinler.sade.sesliIpucu : undefined}
          >
            <Animated.View
              style={{ width: cap, height: cap, alignItems: 'center', justifyContent: 'center', transform: [{ scale: olcek }] }}
            >
              <View style={{ position: 'absolute', top: 0, left: 0 }} importantForAccessibility="no-hide-descendants">
                <Svg width={cap} height={cap}>
                  <Circle
                    cx={cap / 2}
                    cy={cap / 2}
                    r={yaricap}
                    stroke={renkler.sinir}
                    strokeWidth={HALKA_KALINLIK}
                    fill="none"
                  />
                  {durum.tur === 'vakit' && (
                    <Circle
                      cx={cap / 2}
                      cy={cap / 2}
                      r={yaricap}
                      stroke={durum.tamamlandi ? renkler.basarili : renkler.birincil}
                      strokeWidth={HALKA_KALINLIK}
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={`${cevre} ${cevre}`}
                      strokeDashoffset={cevre * (1 - durum.ilerleme)}
                      transform={`rotate(-90 ${cap / 2} ${cap / 2})`}
                    />
                  )}
                </Svg>
              </View>
              <View style={{ alignItems: 'center', paddingHorizontal: HALKA_KALINLIK * 2, maxWidth: cap - HALKA_KALINLIK * 2 }}>
                <Text style={[{ color: renkler.metin, fontSize: 20, fontWeight: '600' }, satir(20)]} maxFontSizeMultiplier={1.6}>
                  {durum.ustEtiket}
                </Text>
                <Text
                  testID="sade-vakit-adi"
                  style={[{ color: renkler.metin, fontSize: 52, fontWeight: '800' }, satir(52)]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.5}
                  maxFontSizeMultiplier={1.4}
                >
                  {durum.vakitAdi}
                </Text>
                {durum.tur !== 'yok' && (
                  <>
                    <Text style={[{ color: renkler.metin, fontSize: 18, marginTop: 6 }, satir(18)]} maxFontSizeMultiplier={1.6}>
                      {durum.kalanEtiketi}
                    </Text>
                    <Text
                      testID="sade-kalan"
                      style={[{ color: renkler.metin, fontSize: 38, fontWeight: '700' }, satir(38)]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.5}
                      maxFontSizeMultiplier={1.4}
                    >
                      {durum.kalanMetni}
                    </Text>
                  </>
                )}
              </View>
            </Animated.View>
          </TouchableOpacity>

          {okumaVar && (
            <View className="flex-row items-center mt-3" importantForAccessibility="no-hide-descendants">
              <FontAwesome5 name="volume-up" size={16} color={renkler.metinIkincil} style={{ marginRight: 8 }} />
              <Text style={{ color: renkler.metin, fontSize: 16 }}>{metinler.sade.sesliOkuyalim}</Text>
            </View>
          )}
          {okumaVar && ttsDestegi === false && (
            <Text style={{ color: renkler.metin, fontSize: 14, textAlign: 'center', marginTop: 6 }}>
              {metinler.sade.sesIndirin}
            </Text>
          )}

          {/* Tek büyük eylem. Kerahat vaktinde ENGELLENMEZ; onay modalı çağıranda. */}
          <TouchableOpacity
            testID="sade-kildim"
            onPress={onKildim}
            disabled={!dugmeEtkin}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={
              durum.tamamlandi
                ? `${bicim(metinler.sade.kilindiErisim, { ad: durum.vakitAdi })}${kabulMetni ? `. ${kabulMetni}` : ''}`
                : dugmeEtkin
                  ? bicim(metinler.sade.kildimErisim, { ad: durum.vakitAdi })
                  : dugmeEtiketi
            }
            accessibilityState={{ disabled: !dugmeEtkin }}
            className="flex-row items-center justify-center rounded-2xl mt-8"
            style={{
              width: '100%',
              minHeight: 76,
              paddingVertical: 16,
              paddingHorizontal: 20,
              backgroundColor: dugmeZemin,
              borderWidth: 2,
              borderColor: dugmeKenar,
            }}
          >
            <FontAwesome5 name={dugmeIkonu} size={26} color={durum.tamamlandi ? renkler.basarili : dugmeMetin} solid style={{ marginRight: 12 }} />
            <Text style={{ color: dugmeMetin, fontSize: 28, fontWeight: '800' }} maxFontSizeMultiplier={1.6}>
              {dugmeEtiketi}
            </Text>
          </TouchableOpacity>

          {!!kabulEki && (
            <KabulEkSatiri metin={kabulEki} gorunur={durum.tamamlandi} kimlik={durum.vakitAdi} testID="sade-kabul-eki" />
          )}

          {durum.kerahat && (
            <Text style={{ color: renkler.metin, fontSize: 16, textAlign: 'center', marginTop: 10 }}>
              {metinler.sade.kerahatNotu}
            </Text>
          )}

          {durum.sonrakiMetni && (
            <View className="items-center mt-8">
              <Text style={{ color: renkler.metin, fontSize: 18 }}>
                {durum.tur === 'girmedi' ? bicim(metinler.sade.vaktiEtiketi, { ad: durum.vakitAdi }) : metinler.sade.siradaki}
              </Text>
              <Text testID="sade-sonraki" style={{ color: renkler.metin, fontSize: 26, fontWeight: '700', marginTop: 2 }}>
                {durum.sonrakiMetni}
              </Text>
            </View>
          )}

          <TouchableOpacity
            testID="sade-tum-uygulama"
            onPress={onTumUygulama}
            accessibilityRole="button"
            accessibilityLabel={metinler.sade.tumUygulama}
            accessibilityHint={metinler.sade.tumUygulamaIpucu}
            className="items-center justify-center mt-10"
            style={{ minHeight: 48, paddingHorizontal: 16 }}
          >
            <Text style={{ color: renkler.metin, fontSize: 16, textDecorationLine: 'underline' }}>
              {metinler.sade.tumUygulama}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

/** Ana ekranın saniyelik çizimlerinden yalıtılır: prop'lar değişmedikçe çizilmez. */
export const SadeGorunum = React.memo(SadeGorunumBileseni);
