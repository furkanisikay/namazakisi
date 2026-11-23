/**
 * Günün ayeti ayarı (#380 widget, #381 duvar kâğıdı). İçerik ayarı YOK (sahip kararı: yalnız ayet).
 *
 * Duvar kâğıdı (taslak 2): görünüm kartı (kilit ve ana ekranın küçük önizlemesi + düzenleyici),
 * "Nerede", hazır görünümler. Zemin, yazı, süs ve Arapça düzenleyicidedir (`DuvarDuzenleyici`).
 * Android: anahtar açılırken onay penceresi (eski duvar kâğıdı saklanamaz + fıkıh notu). Sistem
 * engelliyse (iş/okul yönetimi) anahtar soluk ve nedeni yazılı; son otomatik değişim başarısızsa
 * bilgi satırı (sessiz sapma yok).
 * iOS: uygulama duvar kâğıdını değiştiremez → Kısayollar rehberi + görseli elle kaydetme; görünüm
 * ayarı Kısayollar görseline gider.
 * Duvar ayarı cihaza özgüdür, yedeklenmez (`GUNUN_AYETI_DUVAR`).
 */
import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Linking, Platform, ScrollView, Text, TouchableOpacity, View, type ViewInstance } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRenkler } from '../../core/theme';
import { dilinMealiVar } from '../../core/icerik/gununAyeti';
import { VARSAYILAN_DUVAR_AYARI, type DuvarKagidiAyari, type DuvarYeri } from '../../core/icerik/gununAyetiYuku';
import type { DuvarPlatformu } from '../../core/icerik/duvarTasarimi';
import { DUVAR_HAZIRLARI, gokMu, type DuvarHazirAdi } from '../../core/icerik/duvarCizimi';
import type { DuvarKagidiDurumu, GununAyetiServisi as ServisTipi } from '../../domain/services/GununAyetiServisi';
import type { AyarlarStackParamList } from '../../navigation/ayarlarEkranlari';
import { useAktifDil, useMetin } from '../hooks/useMetin';
import { BolumBasligi } from '../components/ortak/BolumBasligi';
import { NotSatiri } from '../components/ortak/NotSatiri';
import { AnahtarSatiri } from '../components/ortak/AnahtarSatiri';
import { SecenekListesi } from '../components/ortak/SecenekListesi';
import { BildirimModali } from '../components/common/BildirimModali';
import { kisaBildirimGoster } from '../components/common/KisaBildirim';
import { ayetGorseliniPaylas } from '../components/gununAyeti/AyetGorseli';
import { DuvarOnizleme } from '../components/gununAyeti/duvar/DuvarOnizleme';
import { useDuvarYaziTipleri } from '../components/gununAyeti/duvar/DuvarYazisi';
import { useFotoKaynagi } from '../components/gununAyeti/duvar/useFotoKaynagi';
import { useBugununAyeti } from '../components/gununAyeti/duvar/useBugununAyeti';
import { useAnlikDuvarAyari } from '../components/gununAyeti/duvar/useAnlikDuvarAyari';

/** Native köprüyü (siri modülü) jest'te ve açılışta yüklememek için tembel. */
const servis = (): ServisTipi =>
  (require('../../domain/services/GununAyetiServisi') as typeof import('../../domain/services/GununAyetiServisi')).GununAyetiServisi.getInstance();

const KISAYOLLAR_ADRESI = 'shortcuts://';

export const GununAyetiAyarlariSayfasi: React.FC = () => {
  const renkler = useRenkler();
  const s = useMetin();
  const m = s.gununAyeti;
  const dil = useAktifDil();
  const kart = { backgroundColor: renkler.kartArkaplan, borderRadius: 24, overflow: 'hidden' as const };
  // Android: başlatıcı destekliyorsa widget tek dokunuşla eklenir (sistemin onay penceresi);
  // desteklemiyorsa yalnız elle ekleme tarifi kalır.
  const [sabitlenebilir, setSabitlenebilir] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    let iptal = false;
    servis()
      .widgetSabitlenebilirMi()
      .then((d) => {
        if (!iptal) setSabitlenebilir(d);
      })
      .catch(() => undefined);
    return () => {
      iptal = true;
    };
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: renkler.arkaplan }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <BolumBasligi metin={m.ayar.widgetBolum} />
      <View style={[kart, { padding: 16, flexDirection: 'row', alignItems: 'center' }]}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: renkler.birincil + '20',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FontAwesome5 name="th-large" size={18} color={renkler.birincil} />
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: renkler.metin }}>{m.ayar.widgetEkleyin}</Text>
          <Text style={{ fontSize: 14, lineHeight: 20, marginTop: 2, color: renkler.metinIkincil }}>
            {Platform.OS === 'ios' ? m.ayar.widgetEkleyinAciklamaIos : m.ayar.widgetEkleyinAciklama}
          </Text>
        </View>
      </View>
      {sabitlenebilir ? (
        <TouchableOpacity
          testID="gunun-ayeti-widget-ekle"
          onPress={() => servis().widgetiSabitle().catch(() => false)}
          accessibilityRole="button"
          activeOpacity={0.8}
          style={{
            marginTop: 12,
            minHeight: 48,
            borderRadius: 16,
            backgroundColor: renkler.birincil,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FontAwesome5 name="plus" size={14} color="#FFFFFF" />
          <Text style={{ marginLeft: 8, fontSize: 15, fontWeight: '600', color: '#FFFFFF' }}>{m.ayar.widgetEkleDugme}</Text>
        </TouchableOpacity>
      ) : null}
      {/* Meali olmayan dilde widget (ve Android duvar kâğıdı) yalnız Arapça metni çizer: sessiz sapma bırakılmaz. */}
      {dilinMealiVar(dil) ? null : <NotSatiri testID="gunun-ayeti-meal-yok" metin={m.sayfa.mealYok} style={{ marginTop: 12 }} />}

      <BolumBasligi metin={m.ayar.duvarBolum} style={{ marginTop: 24 }} />
      <DuvarKagidiBolumu />
    </ScrollView>
  );
};

/** Hazır görünüm çiplerinin etiketleri (sözlükteki mevcut adlar). */
const hazirEtiketi = (ad: DuvarHazirAdi, s: ReturnType<typeof useMetin>): string => {
  const m = s.gununAyeti;
  if (ad === 'sade') return m.duvar.yaziTipleri.sade;
  if (ad === 'mihrap') return m.duvar.susler.mihrap;
  if (ad === 'gece') return m.ayar.zeminler.gece;
  return m.duvar.foto;
};

const ONIZLEME_YUKSEKLIGI = 188;

/**
 * Duvar kâğıdı bölümü (iki platform): görünüm kartı (iki küçük önizleme + "Görünümü
 * düzenleyin"), "Nerede", hazır görünümler. Android'de üstte açma anahtarı (onay penceresi +
 * fıkıh notu); iPhone'da altta Kısayollar rehberi.
 */
const DuvarKagidiBolumu: React.FC = () => {
  const renkler = useRenkler();
  const sozluk = useMetin();
  const m = sozluk.gununAyeti;
  const d = m.duvar;
  const vazgecin = sozluk.ortak.vazgecin;
  const navigation = useNavigation<NativeStackNavigationProp<AyarlarStackParamList>>();
  const gezinmeRef = useRef(navigation);
  gezinmeRef.current = navigation;
  const android = Platform.OS === 'android';
  const platform: DuvarPlatformu = Platform.OS === 'ios' ? 'ios' : 'android';
  const [ayar, setAyar] = useState<DuvarKagidiAyari | null>(null);
  const [durum, setDurum] = useState<DuvarKagidiDurumu | null>(null);
  const [onayGorunur, setOnayGorunur] = useState(false);
  const [yazilamadi, setYazilamadi] = useState(false);
  const ayet = useBugununAyeti();
  const yaziTipleri = useDuvarYaziTipleri();
  const foto = useFotoKaynagi(ayar?.foto.dosya ?? null);
  // Önizleme kilit ekranında ŞU AN çizileni gösterir ("vakte uysun"da o anın göğü).
  const anlikAyar = useAnlikDuvarAyari(ayar);

  const yukle = useCallback(() => {
    const sv = servis();
    return Promise.all([sv.duvarAyariOku(), android ? sv.duvarKagidiDurumu() : Promise.resolve(null)]).then(([a, dr]) => {
      setAyar(a);
      setDurum(dr);
      setYazilamadi(a.acik && dr?.sonHataVar === true);
    });
  }, [android]);

  useEffect(() => {
    let iptal = false;
    yukle().catch(() => {
      if (!iptal) setAyar(VARSAYILAN_DUVAR_AYARI);
    });
    // Düzenleyiciden dönünce kayıtlı görünüm yeniden okunur (abonelik bir kez; gezinme nesnesi
    // her çizimde yeni olabilir, bağımlılığa girerse ayar her çizimde diskten ezilirdi).
    const kaldir = gezinmeRef.current.addListener?.('focus', () => {
      yukle().catch(() => undefined);
    });
    return () => {
      iptal = true;
      kaldir?.();
    };
  }, [yukle]);

  const kaydet = useCallback(
    async (yeni: DuvarKagidiAyari, uygula: boolean) => {
      setAyar(yeni);
      const sv = servis();
      await sv.duvarAyariKaydet(yeni);
      if (!uygula || !yeni.acik || !android) return;
      const tamam = await sv.duvarKagidiniSimdiUygula();
      setYazilamadi(!tamam);
      if (tamam) kisaBildirimGoster(m.ayar.yerlestirildi);
    },
    [android, m.ayar.yerlestirildi]
  );

  if (!ayar) return <ActivityIndicator color={renkler.birincil} style={{ marginVertical: 24 }} />;

  const engelli = durum?.engelli === true;
  const yerler: { deger: DuvarYeri; etiket: string }[] = [
    { deger: 'kilit', etiket: m.ayar.yerler.kilit },
    { deger: 'ana', etiket: m.ayar.yerler.ana },
    { deger: 'ikisi', etiket: m.ayar.yerler.ikisi },
  ];
  const ekranOrani = (() => {
    const { width, height } = Dimensions.get('screen');
    return height / Math.max(1, width);
  })();
  const onizlemeG = Math.round(ONIZLEME_YUKSEKLIGI / ekranOrani);
  const kartStili = { backgroundColor: renkler.kartArkaplan, borderRadius: 24, padding: 16, marginTop: 12 };
  const aciklama = ayar.vakteUysun && gokMu(ayar.zemin) ? `${d.kartAciklama} ${d.kartVakteUyar}` : d.kartAciklama;

  return (
    <View>
      {android ? (
        <>
          <View style={{ backgroundColor: renkler.kartArkaplan, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 4 }}>
            <AnahtarSatiri
              testID="gunun-ayeti-duvar-anahtar"
              ikon="image"
              baslik={m.ayar.duvarAnahtar}
              ozet={engelli ? m.ayar.kullanilamiyor : ayar.acik ? m.ayar.duvarAcikOzet : m.ayar.duvarKapaliOzet}
              deger={ayar.acik && !engelli}
              devreDisi={engelli}
              onDegistir={(yeni) => {
                if (yeni) setOnayGorunur(true);
                else kaydet({ ...ayar, acik: false }, false).catch(() => undefined);
              }}
            />
          </View>
          {engelli ? <NotSatiri metin={m.ayar.engelli} tip="uyari" style={{ marginTop: 12 }} /> : null}
          {yazilamadi && ayar.acik && !engelli ? (
            <NotSatiri testID="gunun-ayeti-yazilamadi" metin={m.ayar.yazilamadi} tip="uyari" style={{ marginTop: 12 }} />
          ) : null}
        </>
      ) : null}

      {/* Görünüm kartı */}
      <View style={android ? kartStili : { ...kartStili, marginTop: 0 }}>
        {/* Başlık bölüm başlığında ("Duvar kâğıdı"); kart tekrarlamaz. */}
        <Text style={{ fontSize: 14, lineHeight: 20, color: renkler.metinIkincil }}>{aciklama}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 14 }}>
          {(['kilit', 'ana'] as const).map((ekran) => (
            <View key={ekran} style={{ alignItems: 'center' }}>
              <View
                testID={`duvar-onizleme-${ekran}`}
                accessible
                accessibilityRole="image"
                accessibilityLabel={`${m.ayar.onizlemeErisim}: ${m.ayar.yerler[ekran]}`}
                style={{ width: onizlemeG, height: ONIZLEME_YUKSEKLIGI, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: renkler.sinir }}
              >
                <DuvarOnizleme
                  genislik={onizlemeG}
                  yukseklik={ONIZLEME_YUKSEKLIGI}
                  ayar={anlikAyar ?? ayar}
                  ayet={ayet}
                  ekran={ekran}
                  platform={platform}
                  foto={foto}
                  yaziTipleri={yaziTipleri}
                  kimlik={`ayar-${ekran}`}
                />
              </View>
              <Text style={{ fontSize: 12, marginTop: 6, color: renkler.metinIkincil }}>{m.ayar.yerler[ekran]}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity
          testID="duvar-duzenle"
          onPress={() => navigation.navigate('DuvarDuzenleyici')}
          accessibilityRole="button"
          activeOpacity={0.8}
          style={{
            marginTop: 14,
            minHeight: 48,
            borderRadius: 16,
            backgroundColor: renkler.birincil,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FontAwesome5 name="pen" size={14} color="#FFFFFF" />
          <Text style={{ marginStart: 8, fontSize: 15, fontWeight: '600', color: '#FFFFFF' }}>{d.duzenleyin}</Text>
        </TouchableOpacity>
      </View>

      {/* Nerede */}
      <View style={kartStili}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10, color: renkler.metin }}>{m.ayar.yer}</Text>
        <SecenekListesi
          gorunum="cip"
          erisimEtiketi={m.ayar.yer}
          secenekler={yerler}
          secili={ayar.yer}
          onSec={(yer) => kaydet({ ...ayar, yer }, true).catch(() => undefined)}
        />
      </View>

      {/* Hazır görünümler */}
      <View style={kartStili}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: renkler.metin }}>{d.hazirBaslik}</Text>
        <Text style={{ fontSize: 14, lineHeight: 20, marginTop: 2, color: renkler.metinIkincil }}>{d.hazirAciklama}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {DUVAR_HAZIRLARI.map((ad) => (
            <TouchableOpacity
              key={ad}
              testID={`duvar-hazir-${ad}`}
              onPress={() => navigation.navigate('DuvarDuzenleyici', { hazir: ad })}
              accessibilityRole="button"
              activeOpacity={0.7}
              style={{
                minHeight: 44,
                paddingHorizontal: 16,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: renkler.sinir,
                backgroundColor: renkler.arkaplan,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              {ad === 'foto' ? <FontAwesome5 name="image" size={13} color={renkler.birincil} style={{ marginEnd: 6 }} /> : null}
              <Text style={{ fontSize: 14, color: renkler.metin }}>{hazirEtiketi(ad, sozluk)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {android && ayar.acik && !engelli ? <NotSatiri metin={m.ayar.kapatNotu} style={{ marginTop: 16 }} /> : null}
      {android ? null : (
        <View style={{ marginTop: 24 }}>
          <IosKisayolRehberi vakteUysun={ayar.vakteUysun && gokMu(ayar.zemin)} ayar={anlikAyar ?? ayar} foto={foto} yaziTipleri={yaziTipleri} />
        </View>
      )}

      {android ? (
        <BildirimModali
          gorunur={onayGorunur}
          tip="bilgi"
          baslik={m.onay.baslik}
          mesaj={m.onay.metin}
          icerik={<NotSatiri metin={m.ayar.arapcaNot} />}
          birincilEtiket={m.onay.acin}
          birincilIkon="image"
          onBirincil={() => {
            setOnayGorunur(false);
            kaydet({ ...ayar, acik: true }, true).catch(() => setYazilamadi(true));
          }}
          kapatEtiketi={vazgecin}
          onKapat={() => setOnayGorunur(false)}
        />
      ) : null}
    </View>
  );
};

type OnizlemeProps = React.ComponentProps<typeof DuvarOnizleme>;

/** Elle kaydedilen görsel, düzenleyicide kurulan görünümün kendisidir (ekran boyutunda, saat hayaleti yok). */
const IosKisayolRehberi: React.FC<{
  vakteUysun: boolean;
  ayar: DuvarKagidiAyari;
  foto: OnizlemeProps['foto'];
  yaziTipleri: OnizlemeProps['yaziTipleri'];
}> = ({ vakteUysun, ayar, foto, yaziTipleri }) => {
  const renkler = useRenkler();
  const m = useMetin().gununAyeti;
  const gorselRef = useRef<ViewInstance>(null);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const ayet = useBugununAyeti();
  const { width: ekranG, height: ekranY } = Dimensions.get('screen');
  // Ekran dışındaki tam boy sahne yalnız girdisi değişince yeniden çizilir (sayfanın her durumunda değil).
  const gizliGorsel = useMemo(
    () => (
      <DuvarOnizleme
        genislik={ekranG}
        yukseklik={ekranY}
        ayar={ayar}
        ayet={ayet}
        ekran={ayar.yer === 'ana' ? 'ana' : 'kilit'}
        platform="ios"
        foto={foto}
        yaziTipleri={yaziTipleri}
        kimlik="ios-kaydet"
      />
    ),
    [ekranG, ekranY, ayar, ayet, foto, yaziTipleri]
  );

  const kaydet = async () => {
    setKaydediliyor(true);
    try {
      if (!(await ayetGorseliniPaylas(gorselRef.current, m.baslik))) kisaBildirimGoster(m.sayfa.paylasilamadi);
    } catch {
      kisaBildirimGoster(m.sayfa.paylasilamadi);
    } finally {
      setKaydediliyor(false);
    }
  };

  const adimlar = [m.ios.adim1, m.ios.adim2, m.ios.adim3];

  return (
    <View>
      <View style={{ position: 'absolute', left: -10000, top: 0 }} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View ref={gorselRef} collapsable={false}>
          {gizliGorsel}
        </View>
      </View>
      <View style={{ backgroundColor: renkler.kartArkaplan, borderRadius: 24, padding: 16 }}>
        <Text style={{ fontSize: 15, lineHeight: 22, color: renkler.metin }}>{m.ios.aciklama}</Text>
        <Text style={{ fontSize: 14, fontWeight: '700', marginTop: 16, color: renkler.metinIkincil }}>{m.ios.ucAdim}</Text>
        {adimlar.map((adim, i) => (
          <View key={i} style={{ flexDirection: 'row', marginTop: 12 }}>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: renkler.birincil + '20',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: renkler.birincil }}>{i + 1}</Text>
            </View>
            <Text style={{ flex: 1, marginLeft: 12, fontSize: 15, lineHeight: 22, color: renkler.metin }}>{adim}</Text>
          </View>
        ))}
        <TouchableOpacity
          testID="gunun-ayeti-kisayollar"
          onPress={() => Linking.openURL(KISAYOLLAR_ADRESI).catch(() => undefined)}
          accessibilityRole="button"
          activeOpacity={0.8}
          style={{
            marginTop: 16,
            minHeight: 48,
            borderRadius: 16,
            backgroundColor: renkler.birincil,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FontAwesome5 name="external-link-alt" size={14} color="#FFFFFF" />
          <Text style={{ marginLeft: 8, fontSize: 15, fontWeight: '600', color: '#FFFFFF' }}>{m.ios.kisayollariAcin}</Text>
        </TouchableOpacity>
      </View>
      {/* Vakte uyan gök: Kısayollar görseli çalıştığı anın göğünü çizer; gün içinde ek otomasyonlar gerekir. */}
      {vakteUysun ? <NotSatiri testID="gunun-ayeti-vakte-uysun-ios" metin={m.duvar.vakteUysunIos} style={{ marginTop: 12 }} /> : null}

      <BolumBasligi metin={m.ios.elle} style={{ marginTop: 24 }} />
      <TouchableOpacity
        testID="gunun-ayeti-gorsel-kaydet"
        onPress={kaydet}
        disabled={kaydediliyor}
        accessibilityRole="button"
        accessibilityState={{ disabled: kaydediliyor, busy: kaydediliyor }}
        activeOpacity={0.7}
        style={{
          minHeight: 48,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: renkler.sinir,
          backgroundColor: renkler.arkaplan,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: kaydediliyor ? 0.6 : 1,
        }}
      >
        <FontAwesome5 name="download" size={14} color={renkler.metin} />
        <Text style={{ marginLeft: 8, fontSize: 15, fontWeight: '600', color: renkler.metin }}>{m.ios.gorseliKaydedin}</Text>
      </TouchableOpacity>
      <Text style={{ fontSize: 13, lineHeight: 19, marginTop: 8, color: renkler.metinIkincil }}>{m.ios.kaydetIpucu}</Text>
      <NotSatiri metin={m.ios.not} style={{ marginTop: 16 }} />
    </View>
  );
};

export default GununAyetiAyarlariSayfasi;
