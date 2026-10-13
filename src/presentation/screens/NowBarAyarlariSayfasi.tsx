/**
 * Now Bar ve canlı sayaçlar (issue #282 ikinci aşama) — yalnız Android.
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
import { AppState, ScrollView, Text, TouchableOpacity, View } from 'react-native';
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
  type NowBarOgeAyari,
  type NowBarOgesi,
} from '../../core/sayac/nowBar';
import {
  canliAyarlariniAc,
  canliDurumu,
  type CanliDurum,
} from '../../../modules/expo-countdown-notification/src';

const GRUPLAR: { baslik: string; ogeler: NowBarOgesi[] }[] = [
  { baslik: 'VAKİTLER', ogeler: ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'] },
  { baslik: 'RAMAZAN', ogeler: ['iftar', 'sahur'] },
  { baslik: 'CUMA VE NAFİLE', ogeler: ['cuma', 'kusluk', 'evvabin', 'teheccud'] },
  { baslik: 'SERİ', ogeler: ['seri'] },
];

/** Değişiklikleri tek yeniden planlamada birleştirme süresi. */
const PLAN_GECIKMESI_MS = 1200;

/** Sistem öne çıkarma durumu; ayarlardan dönünce (AppState active) tazelenir. */
function useCanliDurum(): [CanliDurum | null, () => void] {
  const [durum, setDurum] = useState<CanliDurum | null>(null);
  const oku = useCallback(() => {
    canliDurumu()
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

const DURUM_METINLERI: Record<CanliDurum, { baslik: string; aciklama: string; ikon: string }> = {
  acik: {
    baslik: 'Canlı güncellemeler açık',
    aciklama: 'Açtığınız öğeler zamanı gelince durum çubuğunda ve Now Bar\'da görünür.',
    ikon: 'check-circle',
  },
  kapali: {
    baslik: 'Canlı güncellemeler kapalı',
    aciklama:
      'Telefonunuzun ayarlarında bu uygulama için canlı güncellemeler kapalı. Sayaçlar sıradan bildirim olarak görünür.',
    ikon: 'pause-circle',
  },
  desteklenmiyor: {
    baslik: 'Android 16 ve üstünde çalışır',
    aciklama:
      'Bu telefonda sayaçlar sıradan bildirim olarak görünür. Wear OS saatiniz yine buradaki seçiminizi kullanır.',
    ikon: 'info-circle',
  },
};

export const NowBarAyarlariSayfasi: React.FC = () => {
  const renkler = useRenkler();
  const dispatch = useAppDispatch();
  const { ayarlar, yuklendi } = useAppSelector((s) => s.nowBar);
  const [durum, durumuOku] = useCanliDurum();
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
    canliAyarlariniAc()
      .then(() => durumuOku())
      .catch(() => undefined);
  }, [durumuOku]);

  const kartStili = { backgroundColor: renkler.kartArkaplan, borderRadius: 24 };
  const durumRengi =
    durum === 'acik' ? renkler.durum.basarili : durum === 'kapali' ? renkler.durum.dikkat : renkler.durum.bilgi;
  const ilkAcik = GRUPLAR.flatMap((g) => g.ogeler).find((o) => ayarlar.ogeler[o].acik);

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: renkler.arkaplan }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-sm mb-5" style={{ color: renkler.metinIkincil }}>
        Durum çubuğunda ve Now Bar'da hangi geri sayımın görüneceğini seçebilirsiniz. Aynı anda yalnız biri öne
        çıkar: vakit çıkışı, iftar, sahur, cuma, nafile, seri sırasıyla.
      </Text>

      {/* Durum kartı + çip önizlemesi (imza öğesi) */}
      <View className="mb-6 p-4" style={kartStili} testID="now-bar-durum">
        <View className="flex-row items-center">
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: `${durumRengi}20` }}
          >
            <FontAwesome5 name={durum ? DURUM_METINLERI[durum].ikon : 'circle-notch'} size={17} color={durumRengi} solid />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
              {durum ? DURUM_METINLERI[durum].baslik : 'Denetleniyor…'}
            </Text>
            {durum && (
              <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                {DURUM_METINLERI[durum].aciklama}
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

        {durum !== 'acik' && durum !== null && (
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
            {NOW_BAR_POLITIKA_UYARISI}
          </Text>
        </View>
      </View>

      {GRUPLAR.map((grup) => (
        <View key={grup.baslik} className="mb-2">
          <Text className="text-xs font-bold tracking-wider mb-3" style={{ color: renkler.metinIkincil }}>
            {grup.baslik}
          </Text>
          {grup.ogeler.map((oge) => (
            <OgeKarti key={oge} oge={oge} ayar={ayarlar.ogeler[oge]} onDegis={guncelle} kartStili={kartStili} />
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
}> = ({ oge, ayar, onDegis, kartStili }) => {
  const renkler = useRenkler();
  const bilgi = NOW_BAR_OGE_BILGILERI[oge];
  const secenekler = NOW_BAR_BASLANGICLARI[oge];
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
          accessibilityLabel={`${bilgi.ad} Now Bar'da`}
        />
      </View>

      {ayar.acik && (
        <View className="px-4 pb-4 border-t" style={{ borderTopColor: `${renkler.sinir}50` }}>
          <Text className="text-xs font-bold tracking-wider mt-4 mb-2" style={{ color: renkler.metinIkincil }}>
            NE ZAMAN BAŞLASIN
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {secenekler.map((b) => {
              const secili = ayar.baslangic === b;
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

          {ayar.baslangic === 'sonDk' && (
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

          {bilgi.sayacGereksinimi && (ayar.baslangic === 'sayacla' || !NOW_BAR_BASLANGICLARI[oge].includes('girince')) && (
            <View className="flex-row items-start mt-3 gap-2">
              <FontAwesome5 name="info-circle" size={12} color={renkler.metinIkincil} style={{ marginTop: 2 }} />
              <Text className="text-xs flex-1" style={{ color: renkler.metinIkincil }}>
                {bilgi.sayacGereksinimi}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default NowBarAyarlariSayfasi;
