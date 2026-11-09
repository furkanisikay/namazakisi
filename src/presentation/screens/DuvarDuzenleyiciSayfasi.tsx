/**
 * Duvar kâğıdı düzenleyicisi (taslak 2, sahip onaylı 2026-11-07): telefonun kilit/ana ekranı
 * üzerinde canlı önizleme. Yazı sürüklenir (dikey konum + yatay hiza), iki parmakla büyür;
 * saat ve alt simge alanı kesik çizgiyle görünür ve yazı oraya GİREMEZ (sözleşme:
 * `IZINLI_BANTLAR` + `yaziYerlesimi`). Alt tepside Zemin / Yazı / Süs sekmeleri.
 *
 * Taslak YEREL kalır: düzenlerken servis çağrılmaz (yük yazımı `acik: true` iken kilit ekranını
 * değiştirirdi). "Uygulayın" kaydeder; Android'de duvar kâğıdı açıksa hemen uygular, kapalıysa
 * yalnız kaydeder (`acik: true` yalnız ayar sayfasındaki onaydan sonra yazılır). "Vazgeçin"
 * ve geri tuşu taslağı atar; bu oturumda seçilip uygulanmayan fotoğraf kopyaları silinir.
 *
 * Kendi üst çubuğunu taşır (`headerShown: false`, sihirbaz istisnası gibi). Önizleme tuvali
 * alttaki tepsinin üstüne SIĞDIRILIR (tam ekran değil): Android kilit ekranında yazının
 * varsayılan yeri (%64–%84) tepsinin altında kalırdı.
 */
import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, PanResponder, Platform, ScrollView, Text, TouchableOpacity, View, type GestureResponderEvent } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';
import { useRenkler } from '../../core/theme';
import { bicim } from '../../core/dil/aktifDil';
import { VARSAYILAN_MERKEZ, type DuvarEkrani, type DuvarPlatformu, type SusTuru, type YaziHizasi, type YaziTipi } from '../../core/icerik/duvarTasarimi';
import {
  HIZA_ESIGI,
  duvarRenkleri,
  duvarYazisiYeri,
  fotoKaydir,
  gokMu,
  hazirUygula,
  hizaSec,
  istenenMerkez,
  surukleMerkezi,
} from '../../core/icerik/duvarCizimi';
import { VARSAYILAN_DUVAR_AYARI, type DuvarKagidiAyari, type DuvarZemini } from '../../core/icerik/gununAyetiYuku';
import type { GununAyetiServisi as ServisTipi } from '../../domain/services/GununAyetiServisi';
import type { AyarlarStackParamList } from '../../navigation/ayarlarEkranlari';
import { Logger } from '../../core/utils/Logger';
import { useMetin } from '../hooks/useMetin';
import { Anahtar } from '../components/common/Anahtar';
import { NotSatiri } from '../components/ortak/NotSatiri';
import { kisaBildirimGoster } from '../components/common/KisaBildirim';
import { sagdanSolaCiziliyor } from '../components/common/yon';
import { DuvarOnizleme } from '../components/gununAyeti/duvar/DuvarOnizleme';
import { DuvarSahnesi, type FotoKaynagi } from '../components/gununAyeti/duvar/DuvarSahnesi';
import { DuvarHayaleti } from '../components/gununAyeti/duvar/DuvarHayaleti';
import { Kaydirici } from '../components/gununAyeti/duvar/Kaydirici';
import { fizikselHiza, useDuvarYaziTipleri, yaziTipiAdi } from '../components/gununAyeti/duvar/DuvarYazisi';
import { fotografSecVeKopyala, fotografiSil } from '../components/gununAyeti/duvar/duvarFotografi';
import { useFotoKaynagiDurumu } from '../components/gununAyeti/duvar/useFotoKaynagi';
import { useBugununAyeti } from '../components/gununAyeti/duvar/useBugununAyeti';
import { ZEMIN_SIRASI, zeminEtiketi } from '../components/gununAyeti/duvar/duvarEtiketleri';

/** Native köprüyü (siri modülü) jest'te ve açılışta yüklememek için tembel. */
const servis = (): ServisTipi =>
  (require('../../domain/services/GununAyetiServisi') as typeof import('../../domain/services/GununAyetiServisi')).GununAyetiServisi.getInstance();

type Sekme = 'zemin' | 'yazi' | 'sus';

/** Yazı tipi örneği (dil-bağımsız harf örneği, çeviri değil). */
const YAZI_ORNEGI = 'Aa';
const TIPLER: readonly YaziTipi[] = ['klasik', 'zarif', 'sade'];
const HIZALAR: readonly YaziHizasi[] = ['bas', 'orta', 'son'];
const SUSLER: readonly SusTuru[] = ['mihrap', 'yildiz', 'girih', 'yok'];

const sinirla = (v: number, alt: number, ust: number) => Math.min(ust, Math.max(alt, v));
const iki = (n: number) => String(n).padStart(2, '0');

interface Baslangic {
  merkez: number;
  kayma: number;
  olcek: number;
  foto: DuvarKagidiAyari['foto'];
  mesafe: number | null;
}

const mesafe = (e: GestureResponderEvent): number | null => {
  const t = e.nativeEvent.touches;
  if (!t || t.length < 2) return null;
  return Math.hypot(t[0].pageX - t[1].pageX, t[0].pageY - t[1].pageY);
};

export const DuvarDuzenleyiciSayfasi: React.FC = () => {
  const renkler = useRenkler();
  const s = useMetin();
  const m = s.gununAyeti;
  const d = m.duvar;
  const navigation = useNavigation<NativeStackNavigationProp<AyarlarStackParamList>>();
  const route = useRoute<RouteProp<AyarlarStackParamList, 'DuvarDuzenleyici'>>();
  const hazir = route.params?.hazir;
  const insets = useSafeAreaInsets();
  const platform: DuvarPlatformu = Platform.OS === 'ios' ? 'ios' : 'android';
  const yaziTipleri = useDuvarYaziTipleri();
  const ayet = useBugununAyeti();

  const [kayitli, setKayitli] = useState<DuvarKagidiAyari | null>(null);
  const [taslak, setTaslak] = useState<DuvarKagidiAyari | null>(null);
  const [sekme, setSekme] = useState<Sekme>('zemin');
  const [ekranSecimi, setEkranSecimi] = useState<DuvarEkrani>('kilit');
  const [yeniFoto, setYeniFoto] = useState<FotoKaynagi | null>(null);
  const [fotoHatasi, setFotoHatasi] = useState(false);
  const [iosAktarilamadi, setIosAktarilamadi] = useState(false);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [alan, setAlan] = useState({ g: 0, y: 0 });
  const [kilavuz, setKilavuz] = useState<{ dikey: boolean; yatay: number | null } | null>(null);
  const blok = useRef(0);
  const geciciDosyalar = useRef(new Set<string>());
  const kayitliRef = useRef<DuvarKagidiAyari | null>(null);
  const uygulandi = useRef(false);
  // Çift dokunuş kapısı eşzamanlı olmalı: state yeniden çizimden önce güncellenmez.
  const kaydediliyorRef = useRef(false);

  const fotoSec = useCallback(async () => {
    setFotoHatasi(false);
    try {
      const f = await fotografSecVeKopyala();
      if (!f) return;
      // iPhone'da Kısayollar görseli fotoğrafı göremiyorsa kullanılmaz: önizleme fotoğraf gösterirken
      // kilit ekranı gece zeminine düşerdi (sessiz sapma). Kopya silinir, uyarı satırı kalır.
      setIosAktarilamadi(f.iosAktarilamadi);
      if (f.iosAktarilamadi) {
        await fotografiSil(f.dosya);
        return;
      }
      geciciDosyalar.current.add(f.dosya);
      setYeniFoto({ uri: f.uri, genislik: f.genislik, yukseklik: f.yukseklik });
      setTaslak((t) => (t ? { ...t, zemin: 'foto', foto: { ...t.foto, dosya: f.dosya, x: 0.5, y: 0.5, yakinlik: 1 } } : t));
      setSekme('zemin');
    } catch (e) {
      Logger.warn('DuvarDuzenleyici', 'Fotoğraf seçilemedi', e);
      setFotoHatasi(true);
    }
  }, []);

  useEffect(() => {
    let iptal = false;
    servis()
      .duvarAyariOku()
      .catch(() => VARSAYILAN_DUVAR_AYARI)
      .then((a) => {
        if (iptal) return;
        kayitliRef.current = a;
        setKayitli(a);
        setTaslak(hazir && hazir !== 'foto' ? hazirUygula(a, hazir) : a);
        // Seçici geçiş animasyonu bitince açılır (iOS'ta geçiş sürerken sunulan seçici görünmeyebilir).
        if (hazir === 'foto') {
          const kaldir = navigation.addListener('transitionEnd', (olay) => {
            if (olay.data?.closing) return;
            kaldir();
            if (!iptal) fotoSec().catch(() => undefined);
          });
        }
      });
    return () => {
      iptal = true;
    };
    // Yalnız açılışta: hazır görünüm bir kez uygulanır.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Uygulanmadan çıkılırsa bu oturumda kopyalanan fotoğraflar silinir.
  useEffect(
    () => () => {
      if (uygulandi.current) return;
      const kalici = kayitliRef.current?.foto.dosya ?? null;
      geciciDosyalar.current.forEach((dosya) => {
        if (dosya !== kalici) fotografiSil(dosya).catch(() => undefined);
      });
    },
    []
  );

  const { kaynak: foto, okunamadi: fotoOkunamadi } = useFotoKaynagiDurumu(taslak?.foto.dosya ?? null, yeniFoto);
  const ekran: DuvarEkrani = !taslak || taslak.yer === 'ikisi' ? ekranSecimi : taslak.yer;

  // Tuval: ekran oranında, tepsinin üstündeki alana sığar.
  const ekranOrani = useMemo(() => {
    const { width, height } = Dimensions.get('screen');
    return height / Math.max(1, width);
  }, []);
  const tuvalY = alan.g > 0 ? Math.min(alan.y - 16, (alan.g - 32) * ekranOrani) : 0;
  const tuvalG = tuvalY / ekranOrani;
  const tepsiY = sinirla(Dimensions.get('window').height * 0.4, 280, 380);

  const anlik = useRef({ taslak, ekran, sekme, tuvalG, tuvalY, foto, platform, b: null as Baslangic | null });
  anlik.current = { ...anlik.current, taslak, ekran, sekme, tuvalG, tuvalY, foto, platform };

  const yanit = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => anlik.current.taslak !== null,
      onMoveShouldSetPanResponder: () => anlik.current.taslak !== null,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        const a = anlik.current;
        if (!a.taslak) return;
        const merkez = duvarYazisiYeri(istenenMerkez(a.taslak, a.ekran, a.platform), blok.current, a.platform, a.ekran).merkez;
        const fiz = fizikselHiza(a.taslak.yazi.hiza, sagdanSolaCiziliyor());
        const kayma = fiz === 'center' ? 0 : (fiz === 'left' ? -1 : 1) * HIZA_ESIGI * 1.5;
        a.b = { merkez, kayma, olcek: a.taslak.yazi.olcek, foto: a.taslak.foto, mesafe: mesafe(e) };
      },
      onPanResponderMove: (e, g) => {
        const a = anlik.current;
        const b = a.b;
        if (!a.taslak || !b || a.tuvalY <= 0) return;
        const fotoKipi = a.sekme === 'zemin' && a.taslak.zemin === 'foto' && a.foto !== null;
        const simdi = mesafe(e);
        if (simdi !== null) {
          // İki parmak: yazı boyutu ya da fotoğraf yakınlığı.
          if (b.mesafe === null) {
            b.mesafe = simdi;
            return;
          }
          const oran = simdi / Math.max(1, b.mesafe);
          if (fotoKipi && a.foto) {
            const yakinlik = sinirla(b.foto.yakinlik * oran, 1, 4);
            const konum = fotoKaydir(a.tuvalG, a.tuvalY, a.foto.genislik, a.foto.yukseklik, { ...b.foto, yakinlik }, 0, 0);
            setTaslak((t) => (t ? { ...t, foto: { ...t.foto, yakinlik, ...konum } } : t));
          } else {
            const olcek = Math.round(sinirla(b.olcek * oran, 0.7, 1.6) * 100) / 100;
            setTaslak((t) => (t ? { ...t, yazi: { ...t.yazi, olcek } } : t));
          }
          return;
        }
        if (b.mesafe !== null) return; // iki parmak bırakıldı: kalan parmak yazıyı kaydırmasın
        if (fotoKipi && a.foto) {
          const konum = fotoKaydir(a.tuvalG, a.tuvalY, a.foto.genislik, a.foto.yukseklik, b.foto, g.dx, g.dy);
          setTaslak((t) => (t ? { ...t, foto: { ...t.foto, ...konum } } : t));
          return;
        }
        const { merkez, oturdu } = surukleMerkezi(b.merkez + g.dy / a.tuvalY, blok.current, a.platform, a.ekran);
        const hiza = hizaSec(b.kayma + g.dx / Math.max(1, a.tuvalG), sagdanSolaCiziliyor());
        const alanAdi = a.ekran === 'kilit' ? 'kilitY' : 'anaY';
        setTaslak((t) => (t ? { ...t, yazi: { ...t.yazi, [alanAdi]: merkez, hiza } } : t));
        setKilavuz({ dikey: hiza === 'orta', yatay: oturdu ? VARSAYILAN_MERKEZ[a.platform][a.ekran] : null });
      },
      onPanResponderRelease: () => {
        anlik.current.b = null;
        setKilavuz(null);
      },
      onPanResponderTerminate: () => {
        anlik.current.b = null;
        setKilavuz(null);
      },
    })
  ).current;

  const blokOlc = useCallback((kesir: number) => {
    blok.current = kesir;
  }, []);

  const guncelle = useCallback((f: (t: DuvarKagidiAyari) => DuvarKagidiAyari) => setTaslak((t) => (t ? f(t) : t)), []);

  const zeminSec = (zemin: DuvarZemini) => {
    if (zemin === 'foto') {
      // Kayıtlı kopya okunamıyorsa (silinmiş, başka cihazdan) yeniden seçtirilir; yoksa kullanıcı takılırdı.
      // Boyut okuması sürerken (açılış) kayıtlı fotoğrafa dönülür; yalnız okunamadıysa seçici açılır.
      if (taslak?.foto.dosya && !fotoOkunamadi) guncelle((t) => ({ ...t, zemin }));
      else fotoSec().catch(() => undefined);
      return;
    }
    guncelle((t) => ({ ...t, zemin, paletRenk: zemin === 'palet' ? renkler.birincil : t.paletRenk }));
  };

  const vazgec = () => navigation.goBack();

  const uygula = async () => {
    if (!taslak || !kayitli || kaydediliyorRef.current) return;
    kaydediliyorRef.current = true;
    setKaydediliyor(true);
    try {
      const sv = servis();
      await sv.duvarAyariKaydet(taslak);
      uygulandi.current = true;
      // Değiştirilen ve kullanılmayan kopyalar silinir (yeni kopya kaydedildikten SONRA).
      const silinecek = new Set([...geciciDosyalar.current, kayitli.foto.dosya]);
      silinecek.delete(taslak.foto.dosya);
      await Promise.all([...silinecek].map((dosya) => fotografiSil(dosya)));
      if (Platform.OS === 'android' && taslak.acik) {
        const tamam = await sv.duvarKagidiniSimdiUygula();
        kisaBildirimGoster(tamam ? m.ayar.yerlestirildi : m.ayar.yazilamadi, !tamam);
      } else {
        kisaBildirimGoster(d.kaydedildi);
      }
      navigation.goBack();
    } catch (e) {
      Logger.warn('DuvarDuzenleyici', 'Görünüm kaydedilemedi', e);
      kaydediliyorRef.current = false;
      setKaydediliyor(false);
    }
  };

  const simdi = useMemo(() => new Date(), []);
  const saat = `${iki(simdi.getHours())}:${iki(simdi.getMinutes())}`;
  const tarih = bicim(m.sayfa.tarih, { gunAdi: s.tarih.gunler[simdi.getDay()], gun: simdi.getDate(), ay: s.tarih.aylar[simdi.getMonth()] });

  if (!taslak) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: renkler.arkaplan }}>
        <ActivityIndicator color={renkler.birincil} />
      </View>
    );
  }

  const renk = duvarRenkleri(taslak.zemin === 'foto' && !foto ? { ...taslak, zemin: 'gece' } : taslak);
  const sekmeler: { ad: Sekme; etiket: string }[] = [
    { ad: 'zemin', etiket: m.ayar.zemin },
    { ad: 'yazi', etiket: d.sekmeler.yazi },
    { ad: 'sus', etiket: d.sekmeler.sus },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: renkler.arkaplan }}>
      {/* Üst çubuk: Vazgeçin · (Kilit/Ana) · Uygulayın */}
      <View style={{ paddingTop: insets.top, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', minHeight: 56 + insets.top }}>
        <TouchableOpacity
          testID="duvar-vazgec"
          onPress={vazgec}
          accessibilityRole="button"
          style={{ minHeight: 44, minWidth: 44, justifyContent: 'center', paddingHorizontal: 8 }}
        >
          <Text style={{ fontSize: 15, fontWeight: '600', color: renkler.metin }}>{s.ortak.vazgecin}</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          {taslak.yer === 'ikisi' ? (
            <View accessibilityRole="radiogroup" accessibilityLabel={d.duzenlenenEkran} style={{ flexDirection: 'row', backgroundColor: renkler.kartArkaplan, borderRadius: 14, padding: 3 }}>
              {(['kilit', 'ana'] as const).map((e) => {
                const secili = ekranSecimi === e;
                return (
                  <TouchableOpacity
                    key={e}
                    testID={`duvar-ekran-${e}`}
                    onPress={() => setEkranSecimi(e)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: secili }}
                    style={{ minHeight: 44, paddingHorizontal: 12, justifyContent: 'center', borderRadius: 11, backgroundColor: secili ? renkler.birincil : 'transparent' }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: secili ? '#FFFFFF' : renkler.metinIkincil }}>{m.ayar.yerler[e]}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}
        </View>
        <TouchableOpacity
          testID="duvar-uygula"
          onPress={() => {
            uygula().catch(() => undefined);
          }}
          disabled={kaydediliyor}
          accessibilityRole="button"
          accessibilityState={{ disabled: kaydediliyor, busy: kaydediliyor }}
          style={{
            minHeight: 44,
            paddingHorizontal: 16,
            borderRadius: 22,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: renkler.birincil,
            opacity: kaydediliyor ? 0.7 : 1,
          }}
        >
          {kaydediliyor ? <ActivityIndicator size="small" color="#FFFFFF" /> : <FontAwesome5 name="check" size={13} color="#FFFFFF" />}
          <Text style={{ marginStart: 8, fontSize: 15, fontWeight: '600', color: '#FFFFFF' }}>{d.uygulayin}</Text>
        </TouchableOpacity>
      </View>

      {/* Tuval */}
      <View
        testID="duvar-alan"
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        onLayout={(e) => setAlan({ g: e.nativeEvent.layout.width, y: e.nativeEvent.layout.height })}
      >
        {tuvalY > 0 ? (
          <View
            testID="duvar-tuval"
            accessible
            accessibilityRole="adjustable"
            accessibilityLabel={`${m.ayar.onizlemeErisim}. ${d.yaziErisim}`}
            accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
            onAccessibilityAction={(e) => {
              // Ekran okuyucu: yukarı/aşağı kaydırma yazıyı %3 taşır (izinli banda kıstırılır).
              const yon = e.nativeEvent.actionName === 'increment' ? -1 : 1;
              const mevcut = duvarYazisiYeri(istenenMerkez(taslak, ekran, platform), blok.current, platform, ekran).merkez;
              const { merkez } = surukleMerkezi(mevcut + yon * 0.03, blok.current, platform, ekran);
              guncelle((t) => ({ ...t, yazi: { ...t.yazi, [ekran === 'kilit' ? 'kilitY' : 'anaY']: merkez } }));
            }}
            style={{ width: tuvalG, height: tuvalY, borderRadius: 24, overflow: 'hidden' }}
            {...yanit.panHandlers}
          >
            <DuvarOnizleme
              genislik={tuvalG}
              yukseklik={tuvalY}
              ayar={taslak}
              ayet={ayet}
              ekran={ekran}
              platform={platform}
              foto={foto}
              yaziTipleri={yaziTipleri}
              kimlik="duzenleyici"
              onBlokYuksekligi={blokOlc}
            >
              <DuvarHayaleti
                genislik={tuvalG}
                yukseklik={tuvalY}
                platform={platform}
                ekran={ekran}
                renk={renk.metin}
                saat={saat}
                tarih={tarih}
                saatEtiketi={d.saat}
                dikeyKilavuz={kilavuz?.dikey === true}
                yatayKilavuz={kilavuz?.yatay ?? null}
              />
            </DuvarOnizleme>
          </View>
        ) : null}
      </View>

      {/* Tepsi */}
      <View
        style={{
          height: tepsiY + insets.bottom,
          paddingBottom: insets.bottom,
          backgroundColor: renkler.kartArkaplan,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingTop: 10,
        }}
      >
        <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: renkler.sinir, alignSelf: 'center', marginBottom: 10 }} />
        <View accessibilityRole="tablist" style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 6 }}>
          {sekmeler.map((k) => {
            const secili = sekme === k.ad;
            return (
              <TouchableOpacity
                key={k.ad}
                testID={`duvar-sekme-${k.ad}`}
                onPress={() => setSekme(k.ad)}
                accessibilityRole="tab"
                accessibilityState={{ selected: secili }}
                style={{ flex: 1, minHeight: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: secili ? renkler.birincil : renkler.arkaplan }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: secili ? '#FFFFFF' : renkler.metinIkincil }}>{k.etiket}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
          {sekme === 'zemin' ? (
            <ZeminSekmesi
              taslak={taslak}
              foto={foto}
              fotoHatasi={fotoHatasi}
              iosAktarilamadi={iosAktarilamadi}
              onZemin={zeminSec}
              onFotoDegistir={() => {
                fotoSec().catch(() => undefined);
              }}
              guncelle={guncelle}
            />
          ) : sekme === 'yazi' ? (
            <YaziSekmesi taslak={taslak} mealVar={ayet.meal !== null} yaziTipleri={yaziTipleri} guncelle={guncelle} />
          ) : (
            <SusSekmesi taslak={taslak} foto={foto} guncelle={guncelle} />
          )}
        </ScrollView>
      </View>
    </View>
  );
};

// --- Sekmeler -----------------------------------------------------------------------------

type Guncelle = (f: (t: DuvarKagidiAyari) => DuvarKagidiAyari) => void;

const AnahtarSatir: React.FC<{ baslik: string; aciklama?: string; deger: boolean; onDegistir: (d: boolean) => void; testID: string }> = ({
  baslik,
  aciklama,
  deger,
  onDegistir,
  testID,
}) => {
  const renkler = useRenkler();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 56, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: renkler.sinir }}>
      <View style={{ flex: 1, marginEnd: 12 }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: renkler.metin }}>{baslik}</Text>
        {aciklama ? <Text style={{ fontSize: 13, lineHeight: 18, marginTop: 2, color: renkler.metinIkincil }}>{aciklama}</Text> : null}
      </View>
      <Anahtar
        testID={testID}
        value={deger}
        onValueChange={onDegistir}
        trackColor={{ false: renkler.sinir, true: `${renkler.birincil}60` }}
        thumbColor={deger ? renkler.birincil : undefined}
        accessibilityRole="switch"
        accessibilityLabel={baslik}
        accessibilityState={{ checked: deger }}
      />
    </View>
  );
};

const ZeminSekmesi: React.FC<{
  taslak: DuvarKagidiAyari;
  foto: FotoKaynagi | null;
  fotoHatasi: boolean;
  iosAktarilamadi: boolean;
  onZemin: (z: DuvarZemini) => void;
  onFotoDegistir: () => void;
  guncelle: Guncelle;
}> = ({ taslak, foto, fotoHatasi, iosAktarilamadi, onZemin, onFotoDegistir, guncelle }) => {
  const renkler = useRenkler();
  const s = useMetin();
  const d = s.gununAyeti.duvar;
  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} accessibilityRole="radiogroup" accessibilityLabel={s.gununAyeti.ayar.zemin} contentContainerStyle={{ gap: 10 }}>
        {ZEMIN_SIRASI.map((z) => {
          const secili = taslak.zemin === z;
          const etiket = zeminEtiketi(z, s);
          return (
            <TouchableOpacity
              key={z}
              testID={`duvar-zemin-${z}`}
              onPress={() => onZemin(z)}
              accessibilityRole="radio"
              accessibilityLabel={etiket}
              accessibilityState={{ selected: secili }}
              style={{ width: 58, alignItems: 'center' }}
            >
              <View
                style={{
                  width: 54,
                  height: 82,
                  borderRadius: 12,
                  overflow: 'hidden',
                  borderWidth: 2,
                  borderColor: secili ? renkler.birincil : 'transparent',
                  borderStyle: z === 'foto' && !foto ? 'dashed' : 'solid',
                  backgroundColor: renkler.arkaplan,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {z === 'foto' && !foto ? (
                  <FontAwesome5 name="image" size={18} color={renkler.birincil} />
                ) : (
                  <DuvarSahnesi
                    genislik={50}
                    yukseklik={78}
                    ayar={{ ...taslak, zemin: z, paletRenk: z === 'palet' ? (taslak.zemin === 'palet' ? taslak.paletRenk : renkler.birincil) : taslak.paletRenk }}
                    kutu={null}
                    foto={foto}
                    susGoster={false}
                    kimlik={`kare-${z}`}
                  />
                )}
              </View>
              <Text numberOfLines={1} style={{ fontSize: 11, marginTop: 5, color: secili ? renkler.birincil : renkler.metinIkincil, fontWeight: secili ? '700' : '400' }}>
                {etiket}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {fotoHatasi ? <NotSatiri testID="duvar-foto-hata" metin={d.fotoKaydedilemedi} tip="uyari" style={{ marginTop: 12 }} /> : null}
      {iosAktarilamadi ? <NotSatiri testID="duvar-foto-ios" metin={d.fotoAktarilamadi} tip="uyari" style={{ marginTop: 12 }} /> : null}

      {taslak.zemin === 'foto' && foto ? (
        <View style={{ marginTop: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 44, height: 58, borderRadius: 10, overflow: 'hidden', borderWidth: 2, borderColor: renkler.birincil }}>
              <DuvarSahnesi genislik={40} yukseklik={54} ayar={taslak} kutu={null} foto={foto} susGoster={false} kimlik="foto-kucuk" />
            </View>
            <View style={{ flex: 1, marginStart: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: renkler.metin }}>{d.fotografiniz}</Text>
              <Text style={{ fontSize: 12, marginTop: 2, color: renkler.metinIkincil }}>{d.fotoIpucu}</Text>
            </View>
            <TouchableOpacity testID="duvar-foto-degistir" onPress={onFotoDegistir} accessibilityRole="button" style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: renkler.birincil }}>{d.degistirin}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 8 }}>
            <Kaydirici
              testID="duvar-karartma"
              etiket={d.karartma}
              deger={taslak.foto.karartma}
              min={0}
              max={0.85}
              onDegistir={(karartma) => guncelle((t) => ({ ...t, foto: { ...t.foto, karartma } }))}
            />
            <Kaydirici
              testID="duvar-bulaniklik"
              etiket={d.bulaniklik}
              deger={taslak.foto.bulaniklik}
              min={0}
              max={1}
              onDegistir={(bulaniklik) => guncelle((t) => ({ ...t, foto: { ...t.foto, bulaniklik } }))}
            />
          </View>
          <AnahtarSatir
            testID="duvar-okunurluk"
            baslik={d.okunurluk}
            aciklama={d.okunurlukAciklama}
            deger={taslak.foto.okunurluk}
            onDegistir={(okunurluk) => guncelle((t) => ({ ...t, foto: { ...t.foto, okunurluk } }))}
          />
        </View>
      ) : null}

      {gokMu(taslak.zemin) ? (
        <AnahtarSatir
          testID="duvar-vakte-uysun"
          baslik={d.vakteUysun}
          aciklama={Platform.OS === 'android' ? `${d.vakteUysunAciklama} ${d.vakteUysunAndroid}` : d.vakteUysunAciklama}
          deger={taslak.vakteUysun}
          onDegistir={(vakteUysun) => guncelle((t) => ({ ...t, vakteUysun }))}
        />
      ) : null}
    </View>
  );
};

const HizaIkonu: React.FC<{ hiza: 'left' | 'center' | 'right'; renk: string }> = ({ hiza, renk }) => {
  const satirlar: [number, number][] =
    hiza === 'left' ? [[1, 15], [1, 10], [1, 13]] : hiza === 'right' ? [[1, 15], [6, 15], [3, 15]] : [[1, 15], [4, 12], [2, 14]];
  return (
    <Svg width={16} height={14} viewBox="0 0 16 14">
      {satirlar.map(([a, b], i) => (
        <Path key={i} d={`M${a} ${2 + i * 5}H${b}`} stroke={renk} strokeWidth={2} strokeLinecap="round" />
      ))}
    </Svg>
  );
};

const YaziSekmesi: React.FC<{ taslak: DuvarKagidiAyari; mealVar: boolean; yaziTipleri: { klasik?: string; zarif?: string }; guncelle: Guncelle }> = ({
  taslak,
  mealVar,
  yaziTipleri,
  guncelle,
}) => {
  const renkler = useRenkler();
  const s = useMetin();
  const m = s.gununAyeti;
  const d = m.duvar;
  const rtl = sagdanSolaCiziliyor();
  return (
    <View>
      <View accessibilityRole="radiogroup" accessibilityLabel={d.sekmeler.yazi} style={{ flexDirection: 'row', gap: 8 }}>
        {TIPLER.map((tip) => {
          const secili = taslak.yazi.tip === tip;
          return (
            <TouchableOpacity
              key={tip}
              testID={`duvar-tip-${tip}`}
              onPress={() => guncelle((t) => ({ ...t, yazi: { ...t.yazi, tip } }))}
              accessibilityRole="radio"
              accessibilityLabel={d.yaziTipleri[tip]}
              accessibilityState={{ selected: secili }}
              style={{
                flex: 1,
                minHeight: 64,
                borderRadius: 14,
                borderWidth: secili ? 2 : 1,
                borderColor: secili ? renkler.birincil : renkler.sinir,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 8,
              }}
            >
              <Text style={{ fontSize: 24, color: renkler.metin, fontFamily: yaziTipiAdi(tip, yaziTipleri) }}>{YAZI_ORNEGI}</Text>
              <Text style={{ fontSize: 12, marginTop: 2, color: secili ? renkler.birincil : renkler.metinIkincil, fontWeight: secili ? '700' : '400' }}>{d.yaziTipleri[tip]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={{ marginTop: 10 }}>
        <Kaydirici
          testID="duvar-boyut"
          etiket={d.boyut}
          deger={taslak.yazi.olcek}
          min={0.7}
          max={1.6}
          onDegistir={(olcek) => guncelle((t) => ({ ...t, yazi: { ...t.yazi, olcek } }))}
        />
      </View>
      <View accessibilityRole="radiogroup" accessibilityLabel={d.hiza} style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
        {HIZALAR.map((hiza) => {
          const secili = taslak.yazi.hiza === hiza;
          return (
            <TouchableOpacity
              key={hiza}
              testID={`duvar-hiza-${hiza}`}
              onPress={() => guncelle((t) => ({ ...t, yazi: { ...t.yazi, hiza } }))}
              accessibilityRole="radio"
              accessibilityLabel={d.hizalar[hiza]}
              accessibilityState={{ selected: secili }}
              style={{
                width: 48,
                height: 44,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: secili ? `${renkler.birincil}20` : renkler.arkaplan,
                borderWidth: secili ? 2 : 0,
                borderColor: renkler.birincil,
              }}
            >
              <HizaIkonu hiza={fizikselHiza(hiza, rtl)} renk={secili ? renkler.birincil : renkler.metinIkincil} />
            </TouchableOpacity>
          );
        })}
      </View>
      {mealVar ? (
        <>
          <AnahtarSatir testID="duvar-arapca" baslik={m.ayar.arapca} deger={taslak.arapca} onDegistir={(arapca) => guncelle((t) => ({ ...t, arapca }))} />
          <NotSatiri metin={m.ayar.arapcaNot} style={{ marginTop: 8 }} />
        </>
      ) : (
        <NotSatiri metin={m.sayfa.mealYok} style={{ marginTop: 12 }} />
      )}
    </View>
  );
};

const SusIkonu: React.FC<{ tur: SusTuru; renk: string }> = ({ tur, renk }) => {
  if (tur === 'yok') return null;
  return (
    <Svg width={30} height={30} viewBox="0 0 30 30">
      {tur === 'mihrap' ? <Path d="M7 30V15a8 8 0 0 1 16 0v15" fill="none" stroke={renk} strokeOpacity={0.8} strokeWidth={1.8} /> : null}
      {tur === 'yildiz' ? (
        <>
          <Rect x={8} y={8} width={14} height={14} fill="none" stroke={renk} strokeOpacity={0.8} strokeWidth={1.6} />
          <Polygon points="15,5.1 24.9,15 15,24.9 5.1,15" fill="none" stroke={renk} strokeOpacity={0.8} strokeWidth={1.6} />
        </>
      ) : null}
      {tur === 'girih' ? (
        <>
          <Path d="M15 3l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill="none" stroke={renk} strokeOpacity={0.8} strokeWidth={1.3} />
          <Circle cx={15} cy={15} r={3} fill="none" stroke={renk} strokeOpacity={0.8} strokeWidth={1.1} />
        </>
      ) : null}
    </Svg>
  );
};

const SusSekmesi: React.FC<{ taslak: DuvarKagidiAyari; foto: FotoKaynagi | null; guncelle: Guncelle }> = ({ taslak, foto, guncelle }) => {
  const renkler = useRenkler();
  const s = useMetin();
  const d = s.gununAyeti.duvar;
  const renk = duvarRenkleri(taslak.zemin === 'foto' && !foto ? { ...taslak, zemin: 'gece' } : taslak);
  return (
    <View>
      <View accessibilityRole="radiogroup" accessibilityLabel={d.sekmeler.sus} style={{ flexDirection: 'row', gap: 8 }}>
        {SUSLER.map((tur) => {
          const secili = taslak.sus.tur === tur;
          return (
            <TouchableOpacity
              key={tur}
              testID={`duvar-sus-${tur}`}
              onPress={() => guncelle((t) => ({ ...t, sus: { ...t.sus, tur } }))}
              accessibilityRole="radio"
              accessibilityLabel={d.susler[tur]}
              accessibilityState={{ selected: secili }}
              style={{ flex: 1, alignItems: 'center' }}
            >
              <View
                style={{
                  width: '100%',
                  height: 60,
                  borderRadius: 12,
                  overflow: 'hidden',
                  borderWidth: 2,
                  borderColor: secili ? renkler.birincil : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <View style={{ position: 'absolute', left: 0, top: 0 }}>
                  <DuvarSahnesi genislik={90} yukseklik={60} ayar={taslak} kutu={null} foto={foto} susGoster={false} kimlik={`sus-${tur}`} />
                </View>
                <SusIkonu tur={tur} renk={renk.metin} />
              </View>
              <Text style={{ fontSize: 12, marginTop: 5, color: secili ? renkler.birincil : renkler.metinIkincil, fontWeight: secili ? '700' : '400' }}>{d.susler[tur]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={{ marginTop: 10 }}>
        <Kaydirici
          testID="duvar-belirginlik"
          etiket={d.belirginlik}
          deger={taslak.sus.belirginlik}
          min={0}
          max={1}
          devreDisi={taslak.sus.tur === 'yok'}
          onDegistir={(belirginlik) => guncelle((t) => ({ ...t, sus: { ...t.sus, belirginlik } }))}
        />
      </View>
    </View>
  );
};

export default DuvarDuzenleyiciSayfasi;
