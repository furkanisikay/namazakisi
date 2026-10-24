/**
 * Günün ayeti ayarı (#380 widget, #381 duvar kâğıdı). İçerik ayarı YOK (sahip kararı: yalnız ayet).
 *
 * Android: duvar kâğıdı anahtarı açılırken onay penceresi (eski duvar kâğıdı saklanamaz + fıkıh
 * notu), yer/zemin/Arapça seçimi, önizleme. Sistem engelliyse (iş/okul yönetimi) anahtar soluk ve
 * nedeni yazılı; son otomatik değişim başarısızsa bilgi satırı (sessiz sapma yok).
 * iOS: uygulama duvar kâğıdını değiştiremez → Kısayollar rehberi + görseli elle kaydetme.
 * Duvar ayarı cihaza özgüdür, yedeklenmez (`GUNUN_AYETI_DUVAR`).
 */
import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Linking, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../core/theme';
import { aktifNamazGunu, gununAyetiGorunumu, gununAyetiKaydi, isoGun } from '../../core/icerik/gununAyeti';
import {
  VARSAYILAN_DUVAR_AYARI,
  koordinatImsakKaynagi,
  type DuvarKagidiAyari,
  type DuvarYeri,
  type DuvarZemini,
} from '../../core/icerik/gununAyetiYuku';
import type { DuvarKagidiDurumu, GununAyetiServisi as ServisTipi } from '../../domain/services/GununAyetiServisi';
import { useAppSelector } from '../store/hooks';
import { useAktifDil, useMetin } from '../hooks/useMetin';
import { BolumBasligi } from '../components/ortak/BolumBasligi';
import { NotSatiri } from '../components/ortak/NotSatiri';
import { AnahtarSatiri } from '../components/ortak/AnahtarSatiri';
import { SecenekListesi } from '../components/ortak/SecenekListesi';
import { BildirimModali } from '../components/common/BildirimModali';
import { kisaBildirimGoster } from '../components/common/KisaBildirim';
import { AyetGorseli, ayetGorseliniPaylas } from '../components/gununAyeti/AyetGorseli';

/** Native köprüyü (siri modülü) jest'te ve açılışta yüklememek için tembel. */
const servis = (): ServisTipi =>
  (require('../../domain/services/GununAyetiServisi') as typeof import('../../domain/services/GununAyetiServisi')).GununAyetiServisi.getInstance();

const KISAYOLLAR_ADRESI = 'shortcuts://';

export const GununAyetiAyarlariSayfasi: React.FC = () => {
  const renkler = useRenkler();
  const s = useMetin();
  const m = s.gununAyeti;
  const kart = { backgroundColor: renkler.kartArkaplan, borderRadius: 24, overflow: 'hidden' as const };

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

      <BolumBasligi metin={m.ayar.duvarBolum} style={{ marginTop: 24 }} />
      {Platform.OS === 'android' ? <AndroidDuvarKagidi /> : <IosKisayolRehberi />}
    </ScrollView>
  );
};

const AndroidDuvarKagidi: React.FC = () => {
  const renkler = useRenkler();
  const m = useMetin().gununAyeti;
  const [ayar, setAyar] = useState<DuvarKagidiAyari | null>(null);
  const [durum, setDurum] = useState<DuvarKagidiDurumu | null>(null);
  const [onayGorunur, setOnayGorunur] = useState(false);
  const [yazilamadi, setYazilamadi] = useState(false);
  const [onizleme, setOnizleme] = useState<string | null>(null);
  const [onizlemeYukleniyor, setOnizlemeYukleniyor] = useState(false);

  useEffect(() => {
    let iptal = false;
    const sv = servis();
    Promise.all([sv.duvarAyariOku(), sv.duvarKagidiDurumu()])
      .then(([a, d]) => {
        if (iptal) return;
        setAyar(a);
        setDurum(d);
        setYazilamadi(a.acik && d.sonHataVar);
      })
      .catch(() => {
        if (!iptal) setAyar(VARSAYILAN_DUVAR_AYARI);
      });
    return () => {
      iptal = true;
    };
  }, []);

  const kaydet = useCallback(async (yeni: DuvarKagidiAyari, uygula: boolean) => {
    setAyar(yeni);
    setOnizleme(null);
    const sv = servis();
    await sv.duvarAyariKaydet(yeni);
    if (!uygula || !yeni.acik) return;
    const tamam = await sv.duvarKagidiniSimdiUygula();
    setYazilamadi(!tamam);
    if (tamam) kisaBildirimGoster(m.ayar.yerlestirildi);
  }, [m.ayar.yerlestirildi]);

  const onizle = async () => {
    setOnizlemeYukleniyor(true);
    const { width, height } = Dimensions.get('screen');
    const genislik = 540;
    const uri = await servis().duvarOnizlemesi(genislik, (genislik * height) / Math.max(width, 1));
    setOnizleme(uri);
    setOnizlemeYukleniyor(false);
  };

  if (!ayar) return <ActivityIndicator color={renkler.birincil} style={{ marginVertical: 24 }} />;

  const engelli = durum?.engelli === true;
  const yerler: { deger: DuvarYeri; etiket: string }[] = [
    { deger: 'kilit', etiket: m.ayar.yerler.kilit },
    { deger: 'ana', etiket: m.ayar.yerler.ana },
    { deger: 'ikisi', etiket: m.ayar.yerler.ikisi },
  ];
  const zeminler: { deger: DuvarZemini; etiket: string }[] = [
    { deger: 'gece', etiket: m.ayar.zeminler.gece },
    { deger: 'kagit', etiket: m.ayar.zeminler.kagit },
    { deger: 'palet', etiket: m.ayar.zeminler.palet },
  ];

  return (
    <View>
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

      {ayar.acik && !engelli ? (
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: renkler.metinIkincil }}>{m.ayar.yer}</Text>
          <SecenekListesi
            gorunum="cip"
            erisimEtiketi={m.ayar.yer}
            secenekler={yerler}
            secili={ayar.yer}
            onSec={(yer) => kaydet({ ...ayar, yer }, true).catch(() => undefined)}
          />
          <Text style={{ fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 8, color: renkler.metinIkincil }}>
            {m.ayar.zemin}
          </Text>
          <SecenekListesi
            gorunum="cip"
            erisimEtiketi={m.ayar.zemin}
            secenekler={zeminler}
            secili={ayar.zemin}
            onSec={(zemin) =>
              kaydet({ ...ayar, zemin, paletRenk: zemin === 'palet' ? renkler.birincil : ayar.paletRenk }, true).catch(
                () => undefined
              )
            }
          />
          <View style={{ backgroundColor: renkler.kartArkaplan, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 4, marginTop: 16 }}>
            <AnahtarSatiri
              testID="gunun-ayeti-arapca"
              ikon="language"
              baslik={m.ayar.arapca}
              deger={ayar.arapca}
              onDegistir={(arapca) => kaydet({ ...ayar, arapca }, true).catch(() => undefined)}
            />
          </View>
          <NotSatiri metin={m.ayar.arapcaNot} style={{ marginTop: 12 }} />

          <TouchableOpacity
            testID="gunun-ayeti-onizle"
            onPress={() => onizle().catch(() => setOnizlemeYukleniyor(false))}
            disabled={onizlemeYukleniyor}
            accessibilityRole="button"
            accessibilityState={{ disabled: onizlemeYukleniyor, busy: onizlemeYukleniyor }}
            activeOpacity={0.7}
            style={{
              marginTop: 16,
              minHeight: 48,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: renkler.sinir,
              backgroundColor: renkler.arkaplan,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {onizlemeYukleniyor ? (
              <ActivityIndicator color={renkler.birincil} />
            ) : (
              <FontAwesome5 name="eye" size={14} color={renkler.metin} />
            )}
            <Text style={{ marginLeft: 8, fontSize: 15, fontWeight: '600', color: renkler.metin }}>{m.ayar.onizleyin}</Text>
          </TouchableOpacity>
          {onizleme ? (
            <Image
              source={{ uri: onizleme }}
              accessible
              accessibilityLabel={m.ayar.onizlemeErisim}
              resizeMode="contain"
              style={{ width: '60%', aspectRatio: 9 / 19.5, alignSelf: 'center', marginTop: 16, borderRadius: 24 }}
            />
          ) : null}
          <NotSatiri metin={m.ayar.kapatNotu} style={{ marginTop: 16 }} />
        </View>
      ) : null}

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
        onKapat={() => setOnayGorunur(false)}
      />
    </View>
  );
};

const IosKisayolRehberi: React.FC = () => {
  const renkler = useRenkler();
  const m = useMetin().gununAyeti;
  const dil = useAktifDil();
  const koordinat = useAppSelector((state) => state.konum.koordinatlar);
  const gorselRef = useRef<View>(null);
  const [kaydediliyor, setKaydediliyor] = useState(false);

  const lat = koordinat?.lat ?? 0;
  const lng = koordinat?.lng ?? 0;
  const ayet = useMemo(() => {
    const gun = aktifNamazGunu(new Date(), koordinatImsakKaynagi(lat === 0 && lng === 0 ? null : { lat, lng }));
    return gununAyetiGorunumu(gununAyetiKaydi(isoGun(gun)), dil);
  }, [lat, lng, dil]);

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
        <AyetGorseli ref={gorselRef} ayet={ayet} tur="duvar" />
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
