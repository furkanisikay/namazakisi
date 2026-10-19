/**
 * Now Bar ve canlı sayaçlar (issue #282 ikinci aşama) — Android; iOS'ta aynı seçim
 * CANLI ETKİNLİK (Dinamik Ada / kilit ekranı, #295) olarak çalışır.
 *
 * Kullanıcı Android 16 Live Update'te (durum çubuğu çipi, One UI 8 Now Bar)
 * neyin görüneceğini öğe öğe açar ve her öğenin ne zaman başlayacağını seçer.
 * Aynı seçim Wear OS saatine de gider. Başlık navigasyon header'ındadır
 * (AGENTS.md: sayfa başlığı TEK yerde).
 *
 * İmza öğesi: durum kartındaki küçük "çip önizlemesi" — kullanıcıya durum
 * çubuğunda tam olarak ne göreceğini gösterir. Gerisi sakin liste.
 *
 * Değişiklikler anında diske yazılır; planlar (sayaçlar + Now Bar + saat)
 * debounce'lu yeniden kurulur, ekrandan çıkışta bekleyen tur hemen uygulanır
 * (`MuhafizAyarlariSayfasi` deseni).
 */
import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../core/theme';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { nowBarAyarlariniYukle, nowBarOgesiniGuncelle } from '../store/nowBarSlice';
import { Anahtar } from '../components/common/Anahtar';
import { SayisalSecici } from '../components/common/SayisalSecici';
import {
  NOW_BAR_BASLANGICLARI,
  NOW_BAR_OGE_BILGILERI,
  NOW_BAR_POLITIKA_UYARISI,
  NOW_BAR_SON_DK_ADIM,
  NOW_BAR_SON_DK_MAX,
  NOW_BAR_SON_DK_MIN,
  NOW_BAR_VAKITLERI,
  vakitSayacGereksinimNotu,
  type NowBarOgeAyari,
  type NowBarOgesi,
} from '../../core/sayac/nowBar';
import {
  canliAyarlariniAc,
  canliDurumu,
  canliTaniHam,
  type CanliDurum,
} from '../../../modules/expo-countdown-notification/src';
import {
  SAMSUNG_CANLI_BILDIRIM_IPUCU,
  canliTaniCoz,
  canliTaniSatirlari,
  canliTeshisi,
  type CanliTani,
} from '../../core/sayac/canliTani';
import { canliEtkinlikIzniAcik } from '../../../modules/expo-siri-kisayollari/src';
import { useCihazDurumu } from '../hooks/useCihazDurumu';
import { canliYuzeyAdi, type CihazDurumu } from '../../core/cihaz/durumNotlari';
import { androidApiEnAz } from '../../core/cihaz/surum';
import { muhafizUyarilanVakitleriBul } from '../../core/utils/vakitSayacYardimcisi';
import type { MuhafizMatrisi } from '../../core/muhafiz/matrisTipleri';
import {
  IOS_CANLI_AZAMI_SURE_MS,
  iosBaslangicSecenekleri,
  iosCanliOgesiMi,
  iosEtkinBaslangic,
} from '../../core/sayac/iosCanliEtkinlik';

const GRUPLAR: { baslik: string; ogeler: NowBarOgesi[] }[] = [
  { baslik: 'VAKİTLER', ogeler: ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'] },
  { baslik: 'RAMAZAN', ogeler: ['iftar', 'sahur'] },
  { baslik: 'CUMA VE NAFİLE', ogeler: ['cuma', 'kusluk', 'evvabin', 'teheccud'] },
  { baslik: 'SERİ', ogeler: ['seri'] },
];

/** Değişiklikleri tek yeniden planlamada birleştirme süresi. */
const PLAN_GECIKMESI_MS = 1200;

/** iOS (#295): canlı etkinlik izni → aynı üç durum (bilinmiyor = desteklenmiyor). */
const iosDurumuOku = async (): Promise<CanliDurum> => {
  const izin = await canliEtkinlikIzniAcik();
  return izin === true ? 'acik' : izin === false ? 'kapali' : 'desteklenmiyor';
};

/** Sistem öne çıkarma durumu; ayarlardan dönünce (AppState active) tazelenir. */
function useCanliDurum(): [CanliDurum | null, () => void] {
  const [durum, setDurum] = useState<CanliDurum | null>(null);
  const oku = useCallback(() => {
    (Platform.OS === 'ios' ? iosDurumuOku() : canliDurumu())
      .then(setDurum)
      .catch(() => setDurum('desteklenmiyor'));
  }, []);
  useEffect(() => {
    oku();
    const abone = AppState.addEventListener('change', (s) => {
      if (s === 'active') oku();
    });
    return () => abone.remove();
  }, [oku]);
  return [durum, oku];
}

/**
 * Android Now Bar tanısı (saha: "saatte görünüyor, telefonda görünmüyor"). Durumla
 * birlikte okunur; köprü fonksiyonu yoksa (eski ikili / dar mock) hiç okunmaz.
 */
function useCanliTani(durum: CanliDurum | null): [CanliTani | null, () => void] {
  const [tani, setTani] = useState<CanliTani | null>(null);
  const oku = useCallback(() => {
    if (Platform.OS !== 'android' || typeof canliTaniHam !== 'function') return;
    canliTaniHam()
      .then((ham) => setTani(canliTaniCoz(ham)))
      .catch(() => setTani(null));
  }, []);
  useEffect(() => {
    if (durum !== null) oku();
  }, [durum, oku]);
  return [tani, oku];
}

type DurumMetni = { baslik: string; aciklama: string; ikon: string };

/** Android canlı güncelleme Android 16 (API 36) ile geldi. */
const CANLI_API = 36;

/**
 * Android durum kartının metni — ÖLÇEREK (sade tasarım). "Now Bar" adı yalnız Samsung'da
 * geçer; "Android 16 ve üstünde çalışır" yalnız sürüm GERÇEKTEN eskiyse (gerçek sürümle)
 * söylenir; API 36+ cihazda `desteklenmiyor` geçici hata/eski ikili demektir → kart
 * satırı yok (`null`). Wear OS cümlesi yalnız bağlı bir saat varken.
 */
export function androidDurumMetni(durum: CanliDurum, cihaz: Pick<CihazDurumu, 'surum' | 'samsung' | 'esliSaat'>): DurumMetni | null {
  const yuzey = canliYuzeyAdi(cihaz.samsung);
  if (durum === 'acik') {
    return { baslik: 'Canlı güncellemeler açık', aciklama: `Açtığınız öğeler zamanı gelince ${yuzey} görünür.`, ikon: 'check-circle' };
  }
  if (durum === 'kapali') {
    return {
      baslik: 'Canlı güncellemeler kapalı',
      aciklama: 'Telefonunuzun ayarlarında bu uygulama için canlı güncellemeler kapalı. Sayaçlar sıradan bildirim olarak görünür.',
      ikon: 'pause-circle',
    };
  }
  if (androidApiEnAz(cihaz.surum, CANLI_API) !== false) return null;
  const saat = cihaz.esliSaat === 'esli' ? ' Wear OS saatiniz yine buradaki seçiminizi kullanır.' : '';
  return {
    baslik: 'Bu telefonda canlı sayaç yok',
    aciklama: `Canlı sayaçlar Android 16 ile gelir; bu telefon Android ${cihaz.surum?.tam ?? ''}. Sayaçlar sıradan bildirim olarak görünür.${saat}`,
    ikon: 'info-circle',
  };
}

/** iOS (#295): canlı etkinlik metinleri (iPhone'da "Now Bar" yoktur). */
const IOS_DURUM_METINLERI: Partial<Record<CanliDurum, DurumMetni>> = {
  acik: {
    baslik: 'Canlı etkinlikler açık',
    aciklama: 'Açtığınız öğeler zamanı gelince kilit ekranında ve Dinamik Ada\'da görünür.',
    ikon: 'check-circle',
  },
  kapali: {
    baslik: 'Canlı etkinlikler kapalı',
    aciklama: 'iPhone ayarlarında bu uygulama için canlı etkinlikler kapalı. Açmak için ayarları kullanabilirsiniz.',
    ikon: 'pause-circle',
  },
  // `desteklenmiyor` iPhone'da "bilinmiyor" demektir (dağıtım hedefi zaten iOS 16.4): SUS.
};

/** iOS'ta zamanlanmış başlatma yoktur (#295) — ekran bunu açıkça söyler (sessiz sapma yok). */
export const IOS_CANLI_SINIR_NOTU = `Canlı etkinlik yalnız uygulama açıkken başlatılabilir: sıradaki geri sayım, uygulamayı açtığınızda başlar. Başladıktan sonra uygulamayı kapatsanız da kilit ekranında ve Dinamik Ada'da sürer. iPhone bir canlı etkinliği en fazla ${
  IOS_CANLI_AZAMI_SURE_MS / 3_600_000
} saat gösterir; daha uzun aralıklarda geri sayım, bitişten ${
  IOS_CANLI_AZAMI_SURE_MS / 3_600_000
} saat önce başlar.`;

const iosMu = (): boolean => Platform.OS === 'ios';

const CIHAZ_ALANLARI = ['samsung', 'esliSaat'] as const;

export const NowBarAyarlariSayfasi: React.FC = () => {
  const renkler = useRenkler();
  const dispatch = useAppDispatch();
  const { ayarlar, yuklendi } = useAppSelector((s) => s.nowBar);
  const [durum, durumuOku] = useCanliDurum();
  const [tani, taniyiOku] = useCanliTani(durum);
  const [taniAcik, setTaniAcik] = useState(false);
  const { durum: cihaz } = useCihazDurumu(CIHAZ_ALANLARI, !iosMu());
  // Vakit "Sayaçla" notu için (ikisi de açılışta yüklenir; yoksa bilinmiyor → not yok).
  const sayacAktif = useAppSelector((s) => (s as { vakitSayac?: { ayarlar?: { aktif?: boolean } } }).vakitSayac?.ayarlar?.aktif ?? null);
  const muhafiz = useAppSelector((s) => (s as { muhafiz?: { aktif?: boolean; matris?: MuhafizMatrisi } }).muhafiz);
  const zamanlayici = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!yuklendi) dispatch(nowBarAyarlariniYukle());
  }, [dispatch, yuklendi]);

  const planlariKur = useCallback(() => {
    // TEMBEL: yayma zinciri native köprüleri çeker (AGENTS.md tembel require).
    const { nowBarDegistiUygula } = require('../../domain/services/NowBarDegisikligiServisi') as typeof import(
      '../../domain/services/NowBarDegisikligiServisi'
    );
    nowBarDegistiUygula().catch(() => undefined);
  }, []);

  // Ekrandan çıkışta bekleyen tur hemen uygulanır.
  useEffect(
    () => () => {
      if (zamanlayici.current) {
        clearTimeout(zamanlayici.current);
        zamanlayici.current = null;
        planlariKur();
      }
    },
    [planlariKur]
  );

  const guncelle = useCallback(
    (oge: NowBarOgesi, degisiklik: Partial<NowBarOgeAyari>) => {
      dispatch(nowBarOgesiniGuncelle({ oge, degisiklik }));
      if (zamanlayici.current) clearTimeout(zamanlayici.current);
      zamanlayici.current = setTimeout(() => {
        zamanlayici.current = null;
        planlariKur();
      }, PLAN_GECIKMESI_MS);
    },
    [dispatch, planlariKur]
  );

  const ayarlariAc = useCallback(() => {
    // iOS: canlı etkinlik izni uygulamanın kendi ayar sayfasındadır (dönüşte AppState okur).
    (iosMu() ? Linking.openSettings() : canliAyarlariniAc())
      .then(() => durumuOku())
      .catch(() => undefined);
  }, [durumuOku]);
  const ios = iosMu();
  const durumMetni: DurumMetni | null = durum ? (ios ? (IOS_DURUM_METINLERI[durum] ?? null) : androidDurumMetni(durum, cihaz)) : null;
  const uyarilanlar = muhafiz?.aktif && muhafiz.matris ? muhafizUyarilanVakitleriBul(muhafiz.matris) : null;
  const gruplar = ios
    ? GRUPLAR.map((g) => ({ ...g, ogeler: g.ogeler.filter(iosCanliOgesiMi) })).filter((g) => g.ogeler.length > 0)
    : GRUPLAR;

  const kartStili = { backgroundColor: renkler.kartArkaplan, borderRadius: 24 };
  const durumRengi =
    durum === 'acik' ? renkler.durum.basarili : durum === 'kapali' ? renkler.durum.dikkat : renkler.durum.bilgi;
  const ilkAcik = gruplar.flatMap((g) => g.ogeler).find((o) => ayarlar.ogeler[o].acik);
  // Tanı yalnız Android'de ve durum bilinince (desteklenmiyorsa söyleyecek yeni şey yok).
  // Tanı okunamadıysa (eski ikili) kart hiç çizilmez — "desteklenmiyor" demek durum kartıyla çelişirdi.
  const teshis = !ios && tani && durum && durum !== 'desteklenmiyor' ? canliTeshisi(durum, tani) : null;

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: renkler.arkaplan }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-sm mb-5" style={{ color: renkler.metinIkincil }}>
        {/* İki kısa cümle (öncelik sırası listesi kalktı — metin bütçesi). */}
        {ios
          ? "Kilit ekranında ve Dinamik Ada'da görünecek geri sayımı seçin. Aynı anda biri görünür."
          : `${cihaz.samsung === true ? "Durum çubuğunda ve Now Bar'da" : 'Durum çubuğunda'} görünecek geri sayımı seçin. Aynı anda biri öne çıkar.`}
      </Text>

      {/* Durum kartı + çip önizlemesi (imza öğesi) */}
      <View className="mb-6 p-4" style={kartStili} testID="now-bar-durum">
        <View className="flex-row items-center">
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: `${durumRengi}20` }}
          >
            <FontAwesome5 name={durumMetni ? durumMetni.ikon : 'stopwatch'} size={17} color={durumRengi} solid />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
              {durumMetni ? durumMetni.baslik : ios ? 'Canlı etkinlikler' : 'Canlı sayaçlar'}
            </Text>
            {durumMetni && (
              <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                {durumMetni.aciklama}
              </Text>
            )}
          </View>
        </View>

        {ilkAcik && (
          <View
            className="flex-row items-center self-start mt-4 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: `${renkler.birincil}20` }}
            accessibilityLabel={`Örnek: ${NOW_BAR_OGE_BILGILERI[ilkAcik].ad}, 12 dakika`}
            testID="now-bar-cip"
          >
            <FontAwesome5 name="stopwatch" size={11} color={renkler.birincil} solid />
            <Text className="text-xs font-bold ml-1.5" style={{ color: renkler.metin }}>
              {NOW_BAR_OGE_BILGILERI[ilkAcik].ad} · 12 dk
            </Text>
          </View>
        )}

        {durum === 'kapali' && (
          <TouchableOpacity
            className="flex-row items-center justify-center mt-4 py-3 rounded-2xl border"
            style={{ backgroundColor: renkler.arkaplan, borderColor: renkler.sinir, minHeight: 44 }}
            onPress={ayarlariAc}
            accessibilityRole="button"
            accessibilityLabel="Sistem ayarlarını açın"
          >
            <FontAwesome5 name="cog" size={13} color={renkler.birincil} style={{ marginRight: 8 }} />
            <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
              Sistem ayarlarını açın
            </Text>
          </TouchableOpacity>
        )}

        <View className="flex-row items-start mt-4 gap-2">
          <FontAwesome5 name="info-circle" size={12} color={renkler.metinIkincil} style={{ marginTop: 2 }} />
          <Text className="text-xs flex-1" style={{ color: renkler.metinIkincil }} testID="now-bar-politika">
            {ios ? IOS_CANLI_SINIR_NOTU : NOW_BAR_POLITIKA_UYARISI}
          </Text>
        </View>
      </View>

      {teshis && (
        <View className="mb-6 p-4" style={kartStili} testID="now-bar-tani">
          <View className="flex-row items-start gap-2">
            <FontAwesome5
              name={teshis.tip === 'oneCikti' ? 'check-circle' : 'stethoscope'}
              size={13}
              color={teshis.tip === 'oneCikti' ? renkler.durum.basarili : renkler.metinIkincil}
              style={{ marginTop: 2 }}
              solid
            />
            <Text className="text-sm flex-1" style={{ color: renkler.metin }} testID="now-bar-tani-teshis">
              {teshis.metin}
            </Text>
          </View>
          {teshis.samsungIpucu && (
            <Text className="text-xs mt-3" style={{ color: renkler.metinIkincil }} testID="now-bar-tani-samsung">
              {SAMSUNG_CANLI_BILDIRIM_IPUCU}
            </Text>
          )}
          <TouchableOpacity
            className="flex-row items-center justify-center mt-3 py-2.5 rounded-2xl border"
            style={{ backgroundColor: renkler.arkaplan, borderColor: renkler.sinir, minHeight: 44 }}
            onPress={() => {
              if (!taniAcik) taniyiOku();
              setTaniAcik((a) => !a);
            }}
            accessibilityRole="button"
            accessibilityState={{ expanded: taniAcik }}
            accessibilityLabel={taniAcik ? 'Tanı ayrıntılarını gizleyin' : 'Tanı ayrıntılarını gösterin'}
          >
            <FontAwesome5 name={taniAcik ? 'chevron-up' : 'chevron-down'} size={11} color={renkler.birincil} style={{ marginRight: 8 }} />
            <Text className="text-xs font-semibold" style={{ color: renkler.metin }}>
              {taniAcik ? 'Ayrıntıları gizleyin' : 'Ayrıntıları gösterin'}
            </Text>
          </TouchableOpacity>
          {taniAcik && durum && (
            <View className="mt-3" testID="now-bar-tani-ayrinti">
              {canliTaniSatirlari(durum, tani).map((s) => (
                <Text key={s} className="text-xs mb-1" style={{ color: renkler.metinIkincil }} selectable>
                  {s}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}

      {gruplar.map((grup) => (
        <View key={grup.baslik} className="mb-2">
          <Text className="text-xs font-bold tracking-wider mb-3" style={{ color: renkler.metinIkincil }}>
            {grup.baslik}
          </Text>
          {grup.ogeler.map((oge) => (
            <OgeKarti
              key={oge}
              oge={oge}
              ayar={ayarlar.ogeler[oge]}
              onDegis={guncelle}
              kartStili={kartStili}
              ios={ios}
              gereksinim={
                (NOW_BAR_VAKITLERI as readonly string[]).includes(oge)
                  ? vakitSayacGereksinimNotu(sayacAktif, uyarilanlar ? (uyarilanlar as readonly string[]).includes(oge) : null)
                  : NOW_BAR_OGE_BILGILERI[oge].sayacGereksinimi ?? null
              }
            />
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const OgeKarti: React.FC<{
  oge: NowBarOgesi;
  ayar: NowBarOgeAyari;
  onDegis: (oge: NowBarOgesi, d: Partial<NowBarOgeAyari>) => void;
  kartStili: object;
  /** iOS: "sayaçla" yok (sayaç bildirimi yok); kayıttaki "sayaçla" son dakikalar sayılır. */
  ios: boolean;
  /** "Sayaçla" seçiliyken gösterilecek tek cümle; `null` → satır yok (sorun yok/bilinmiyor). */
  gereksinim: string | null;
}> = ({ oge, ayar, onDegis, kartStili, ios, gereksinim }) => {
  const renkler = useRenkler();
  const bilgi = NOW_BAR_OGE_BILGILERI[oge];
  const secenekler = ios ? iosBaslangicSecenekleri(oge) : NOW_BAR_BASLANGICLARI[oge];
  const etkinBaslangic = ios ? iosEtkinBaslangic(ayar) : ayar.baslangic;
  return (
    <View className="mb-3 overflow-hidden" style={kartStili} testID={`now-bar-oge-${oge}`}>
      <View className="flex-row items-center p-4">
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: `${renkler.birincil}20` }}
        >
          <FontAwesome5 name={bilgi.ikon} size={16} color={renkler.birincil} solid />
        </View>
        <View className="flex-1 pr-2">
          <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
            {bilgi.ad}
          </Text>
          <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
            {bilgi.aciklama}
          </Text>
        </View>
        <Anahtar
          value={ayar.acik}
          onValueChange={(v) => onDegis(oge, { acik: v })}
          trackColor={{ false: renkler.sinir, true: `${renkler.birincil}60` }}
          thumbColor={ayar.acik ? renkler.birincil : '#f4f3f4'}
          accessibilityLabel={ios ? `${bilgi.ad} canlı etkinlikte` : `${bilgi.ad} Now Bar'da`}
        />
      </View>

      {ayar.acik && (
        <View className="px-4 pb-4 border-t" style={{ borderTopColor: `${renkler.sinir}50` }}>
          <Text className="text-xs font-bold tracking-wider mt-4 mb-2" style={{ color: renkler.metinIkincil }}>
            NE ZAMAN BAŞLASIN
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {secenekler.map((b) => {
              const secili = etkinBaslangic === b;
              const etiket = bilgi.baslangicEtiketleri[b] ?? b;
              return (
                <TouchableOpacity
                  key={b}
                  className="flex-row items-center justify-center py-2.5 px-3 rounded-2xl border"
                  style={{
                    backgroundColor: secili ? `${renkler.birincil}15` : renkler.arkaplan,
                    borderColor: secili ? renkler.birincil : renkler.sinir,
                    borderWidth: secili ? 2 : 1,
                    minHeight: 44,
                  }}
                  onPress={() => onDegis(oge, { baslangic: b })}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityState={{ selected: secili }}
                  accessibilityLabel={`${bilgi.ad}: ${etiket}`}
                >
                  <Text className="text-xs font-semibold" style={{ color: secili ? renkler.birincil : renkler.metin }}>
                    {etiket}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {etkinBaslangic === 'sonDk' && (
            <View
              className="flex-row items-center justify-between p-3.5 rounded-2xl border mt-2"
              style={{ backgroundColor: renkler.arkaplan, borderColor: renkler.sinir }}
            >
              <Text className="text-sm font-medium flex-1 pr-3" style={{ color: renkler.metin }}>
                Son
              </Text>
              <SayisalSecici
                deger={ayar.sonDk}
                min={NOW_BAR_SON_DK_MIN}
                max={NOW_BAR_SON_DK_MAX}
                adim={NOW_BAR_SON_DK_ADIM}
                birim="dk"
                onChange={(v) => onDegis(oge, { sonDk: v })}
                renk={renkler.birincil}
                aciklama={`${bilgi.ad} son dakika`}
              />
            </View>
          )}

          {!ios && gereksinim && (ayar.baslangic === 'sayacla' || !NOW_BAR_BASLANGICLARI[oge].includes('girince')) && (
            <View className="flex-row items-start mt-3 gap-2">
              <FontAwesome5 name="info-circle" size={12} color={renkler.metinIkincil} style={{ marginTop: 2 }} />
              <Text className="text-xs flex-1" style={{ color: renkler.metinIkincil }}>
                {gereksinim}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default NowBarAyarlariSayfasi;
