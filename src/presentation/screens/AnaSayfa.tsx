import * as React from 'react';
import { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import { View, Text, Platform, TouchableOpacity, StatusBar, ScrollView, ToastAndroid } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PagerView from 'react-native-pager-view';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { namazlariYukle, namazDurumunuDegistir, tumNamazlariTamamla, tumNamazlariSifirla, tarihiDegistir } from '../store/namazSlice';
import { seriVerileriniYukle, seriKontrolet, namazKilindiPuanla, kutlamayiKaldir, seriOzetiSelector, ilkKutlamaSelector } from '../store/seriSlice';
import { YuklemeGostergesi, KutlamaAnimasyonu, KutlamaModal, AnimasyonluButon } from '../components';
import { HomeHeader } from '../components/home/HomeHeader';
import { VakitKarti } from '../components/home/VakitKarti';
import { VakitAkisi } from '../components/home/VakitAkisi';
import { SeriKartiModal } from '../components/home/SeriKartiModal';
import { NamazAdi } from '../../core/constants/UygulamaSabitleri';
import { bugunuAl, tarihiGorunumFormatinaCevir, bugunMu, tarihiISOFormatinaCevir, gunEkle } from '../../core/utils/TarihYardimcisi';
import { useRenkler, useTema } from '../../core/theme';
import { useFeedback } from '../../core/feedback';
import { NamazMuhafiziServisi } from '../../domain/services/NamazMuhafiziServisi';
import { NamazVaktiHesaplayiciServisi, VakitBilgisi } from '../../domain/services/NamazVaktiHesaplayiciServisi';
import { ArkaplanMuhafizServisi } from '../../domain/services/ArkaplanMuhafizServisi';
import { VakitSayacBildirimServisi } from '../../domain/services/VakitSayacBildirimServisi';
import { ArkaplanGorevServisi } from '../../domain/services/ArkaplanGorevServisi';
import { muhafizAyarlariniYukle } from '../store/muhafizSlice';
import { store } from '../store/store';
import { BildirimServisi } from '../../domain/services/BildirimServisi';
import { HaptikServisi } from '../../core/feedback/HaptikServisi';
import { SesServisi } from '../../core/feedback/SesServisi';
import { FontAwesome5 } from '@expo/vector-icons';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { Namaz } from '../../core/types';
import { IftarSayaci } from '../components/IftarSayaci';
import { iftarSayacAyarlariniYukle } from '../store/iftarSayacSlice';

// Baslangic sayfasi
const BASLANGIC_SAYFA_INDEKSI = 1000;

export const AnaSayfa: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const pagerRef = useRef<PagerView>(null);
  const renkler = useRenkler();
  const { koyuMu } = useTema();
  const { tumNamazlarTamamlandiFeedback } = useFeedback();

  const [mevcutSayfaIndeksi, setMevcutSayfaIndeksi] = useState(BASLANGIC_SAYFA_INDEKSI);
  const [tarihSeciciGorunur, setTarihSeciciGorunur] = useState(false);
  const [seriModalGorunur, setSeriModalGorunur] = useState(false);
  const [kutlamaGoster, setKutlamaGoster] = useState(false);
  const [muhafizDurumu, setMuhafizDurumu] = useState<{ mesaj: string, seviye: number }>({ mesaj: '', seviye: 0 });
  const [vakitBilgisi, setVakitBilgisi] = useState<VakitBilgisi | null>(null);
  const [kalanSureStr, setKalanSureStr] = useState("00:00:00");

  const { mevcutTarih, gunlukNamazlar, yukleniyor, hata } = useAppSelector(state => state.namaz);
  const { ozelGunAyarlari, sonYukleme: seriSonYukleme } = useAppSelector(state => state.seri);
  const seriYuklendiMi = !!seriSonYukleme;
  const seriOzeti = useAppSelector(seriOzetiSelector);
  const ilkKutlama = useAppSelector(ilkKutlamaSelector);
  const muhafizAyarlari = useAppSelector((state) => state.muhafiz);
  const konumAyarlari = useAppSelector((state) => state.konum);

  const oncekiTamamlananRef = useRef<number>(0);
  const arkaplanMuhafizTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Servis vaktini NamazAdi enum'ına çeviren map
  const servisToNamazAdi: Record<string, NamazAdi> = useMemo(() => ({
    'imsak': NamazAdi.Sabah,
    'gunes': NamazAdi.Gunes,
    'ogle': NamazAdi.Ogle,
    'ikindi': NamazAdi.Ikindi,
    'aksam': NamazAdi.Aksam,
    'yatsi': NamazAdi.Yatsi
  }), []);

  // Tarih dönüşümleri
  const sayfaIndeksiniTariheCevir = useCallback((sayfaIndeksi: number): string => {
    const gunFarki = sayfaIndeksi - BASLANGIC_SAYFA_INDEKSI;
    return gunEkle(bugunuAl(), gunFarki);
  }, []);

  const tarihiSayfaIndeksineCevir = useCallback((tarih: string): number => {
    const bugun = new Date(bugunuAl());
    const hedefTarih = new Date(tarih);
    const gunFarki = Math.round((hedefTarih.getTime() - bugun.getTime()) / (1000 * 60 * 60 * 24));
    return BASLANGIC_SAYFA_INDEKSI + gunFarki;
  }, []);

  // Veri yükleme
  const namazlariGetir = useCallback((tarih: string) => {
    dispatch(namazlariYukle({ tarih }));
  }, [dispatch]);

  // Günlük namazları saat bilgisi ile zenginleştir
  const uiNamazlar = useMemo(() => {
    if (!gunlukNamazlar || !konumAyarlari.koordinatlar) return [];

    const date = new Date(mevcutTarih);
    const coordinates = new Coordinates(konumAyarlari.koordinatlar.lat, konumAyarlari.koordinatlar.lng);
    const params = CalculationMethod.Turkey();
    const prayerTimes = new PrayerTimes(coordinates, date, params);

    const zamanFormatla = (d: Date) => {
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    };

    const vakitSaatleri: Record<NamazAdi, string> = {
      [NamazAdi.Sabah]: zamanFormatla(prayerTimes.fajr),
      [NamazAdi.Gunes]: zamanFormatla(prayerTimes.sunrise),
      [NamazAdi.Ogle]: zamanFormatla(prayerTimes.dhuhr),
      [NamazAdi.Ikindi]: zamanFormatla(prayerTimes.asr),
      [NamazAdi.Aksam]: zamanFormatla(prayerTimes.maghrib),
      [NamazAdi.Yatsi]: zamanFormatla(prayerTimes.isha),
    };

    return gunlukNamazlar.namazlar.map(namaz => ({
      ...namaz,
      saat: vakitSaatleri[namaz.namazAdi] || ''
    }));
  }, [gunlukNamazlar, konumAyarlari.koordinatlar, mevcutTarih]);


  // Aktif Gün Hesaplama (İmsak öncesi ise önceki gün)
  const aktifGun = useMemo(() => {
    let tarih = bugunuAl();

    if (konumAyarlari.koordinatlar) {
      const now = new Date();
      const coordinates = new Coordinates(konumAyarlari.koordinatlar.lat, konumAyarlari.koordinatlar.lng);
      const params = CalculationMethod.Turkey();
      const prayerTimes = new PrayerTimes(coordinates, now, params);

      // Eğer şu an imsak vaktinden önceyse, aktif gün dündür (Yatsı süreci devam ediyor)
      if (now < prayerTimes.fajr) {
        tarih = gunEkle(tarih, -1);
      }
    }
    return tarih;
  }, [konumAyarlari.koordinatlar]); // Dependencies: updates when location changes (or strictly only initially mostly) - effectively runs fast.

  // Initial Load - Aktif güne git
  useEffect(() => {
    namazlariGetir(aktifGun);
    // Eğer başlangıçta aktif gün bugünden farklıysa (gece yarısı durumu), o güne git
    if (aktifGun !== mevcutTarih && mevcutSayfaIndeksi === BASLANGIC_SAYFA_INDEKSI) {
      const yeniIndeks = tarihiSayfaIndeksineCevir(aktifGun);
      // Dispatch ve setPage işlemleri namazlariGetir sonrasinda veya senkron
      dispatch(tarihiDegistir(aktifGun));
      setMevcutSayfaIndeksi(yeniIndeks);
      // Pager ref update needs delay usually or layout ready? 
      // InitialPage prop handles first render. But if we change state dynamic?
      // We will handle via useEffect dependency or explicit call.
      setTimeout(() => pagerRef.current?.setPage(yeniIndeks), 100);
    }

    dispatch(seriVerileriniYukle());
    dispatch(muhafizAyarlariniYukle());
    dispatch(iftarSayacAyarlariniYukle());
    BildirimServisi.getInstance().izinIste();

    ArkaplanGorevServisi.getInstance().kaydetVeBaslat()
      .then(basarili => basarili && console.log('[AnaSayfa] Arka plan görevi başlatıldı'))
      .catch(err => console.error('[AnaSayfa] Arka plan görevi hatası:', err));

    return () => {
      try { NamazMuhafiziServisi.getInstance().durdur(); } catch (e) { }
    };
  }, [aktifGun]); // Changed dependency from generic dispatch/namazlariGetir to aktifGun to trigger on recalc.

  // Seri Kontrolü
  useEffect(() => {
    // gunlukNamazlar yüklendiğinde, aktif gündeysek ve seri verileri yüklenmişse
    if (gunlukNamazlar && gunlukNamazlar.tarih === aktifGun && seriYuklendiMi) {
      dispatch(seriKontrolet({
        bugunNamazlar: gunlukNamazlar,
        dunNamazlar: null
      }));
    }
  }, [gunlukNamazlar, mevcutTarih, aktifGun, dispatch, seriYuklendiMi]);

  // Vakit Hesaplayıcı ve Sayaç
  useEffect(() => {
    const s = NamazVaktiHesaplayiciServisi.getInstance();
    s.yapilandir({
      latitude: konumAyarlari.koordinatlar.lat,
      longitude: konumAyarlari.koordinatlar.lng,
      method: 'Turkey',
      madhab: 'Hanafi'
    });

    const updateTimer = () => {
      const bilgi = s.getSuankiVakitBilgisi();
      setVakitBilgisi(bilgi);

      if (bilgi) {
        const simdi = new Date();
        const hedef = new Date(bilgi.sonrakiVakitGiris); // String ise Date'e
        let fark = hedef.getTime() - simdi.getTime();

        if (fark < 0) fark = 0;

        const saat = Math.floor(fark / (1000 * 60 * 60));
        const dakika = Math.floor((fark % (1000 * 60 * 60)) / (1000 * 60));
        const saniye = Math.floor((fark % (1000 * 60)) / 1000);

        setKalanSureStr(
          `${saat.toString().padStart(2, '0')}:${dakika.toString().padStart(2, '0')}:${saniye.toString().padStart(2, '0')}`
        );
      }
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);

    if (arkaplanMuhafizTimeoutRef.current) clearTimeout(arkaplanMuhafizTimeoutRef.current);

    // Not: ArkaplanMuhafizServisi.yapilandirVePlanla App.tsx'te cagriliyor
    // Burada tekrar cagirmak gereksiz ve cift bildirim planlamasina neden oluyor

    const muhafiz = NamazMuhafiziServisi.getInstance();
    if (muhafizAyarlari.aktif) {
      muhafiz.yapilandir({
        seviye1BaslangicDk: muhafizAyarlari.esikler.seviye1,
        seviye2BaslangicDk: muhafizAyarlari.esikler.seviye2,
        seviye3BaslangicDk: muhafizAyarlari.esikler.seviye3,
        seviye4BaslangicDk: muhafizAyarlari.esikler.seviye4,
        seviye1SiklikDk: muhafizAyarlari.sikliklar.seviye1,
        seviye2SiklikDk: muhafizAyarlari.sikliklar.seviye2,
        seviye3SiklikDk: muhafizAyarlari.sikliklar.seviye3,
        seviye4SiklikDk: muhafizAyarlari.sikliklar.seviye4,
      });
      muhafiz.baslat((mesaj, seviye) => {
        setMuhafizDurumu({ mesaj, seviye });
        if (seviye >= 3) { HaptikServisi.gucluTitresim(); SesServisi.bildirimSesiCal(); }
        else if (seviye > 0) { HaptikServisi.uyariTitresimi(); }
      });
    } else {
      muhafiz.durdur();
      setMuhafizDurumu({ mesaj: '', seviye: 0 });
    }

    return () => {
      clearInterval(timerInterval);
      muhafiz.durdur();
      if (arkaplanMuhafizTimeoutRef.current) clearTimeout(arkaplanMuhafizTimeoutRef.current);
    };
  }, [konumAyarlari.koordinatlar, muhafizAyarlari]);


  // Kutlama mantığı
  useEffect(() => {
    if (gunlukNamazlar) {
      const tamamlanan = gunlukNamazlar.namazlar.filter(n => n.tamamlandi).length;
      const toplam = gunlukNamazlar.namazlar.length;
      if (tamamlanan === toplam && oncekiTamamlananRef.current < toplam && oncekiTamamlananRef.current > 0) {
        setKutlamaGoster(true);
        tumNamazlarTamamlandiFeedback();
      }
      oncekiTamamlananRef.current = tamamlanan;
    }
  }, [gunlukNamazlar, tumNamazlarTamamlandiFeedback]);

  // Namaz İşlemleri
  const namazToggle = async (namazAdi: NamazAdi, tamamlandi: boolean) => {
    dispatch(namazDurumunuDegistir({ tarih: mevcutTarih, namazAdi: namazAdi, tamamlandi }));

    // Vakit donusumu (servis icin)
    const vakitDonusumu: Record<string, 'imsak' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi'> = {
      [NamazAdi.Sabah]: 'imsak',
      [NamazAdi.Ogle]: 'ogle',
      [NamazAdi.Ikindi]: 'ikindi',
      [NamazAdi.Aksam]: 'aksam',
      [NamazAdi.Yatsi]: 'yatsi',
    };
    const vakitAdi = vakitDonusumu[namazAdi];

    if (tamamlandi) {
      // Namaz kilindi - seri verileri yuklenmisse puan ekle
      if (seriYuklendiMi) {
        dispatch(namazKilindiPuanla({ namazSayisi: 1 }));
      }
      try { NamazMuhafiziServisi.getInstance().namazKilindiIsaretle(namazAdi); setMuhafizDurumu({ mesaj: '', seviye: 0 }); } catch (e) { }

      // Arka plan bildirimlerini iptal et
      if (vakitAdi) {
        try { await ArkaplanMuhafizServisi.getInstance().vakitBildirimleriniIptalEt(vakitAdi); } catch (e) { }
        try { await VakitSayacBildirimServisi.getInstance().vakitSayaciniIptalEt(vakitAdi); } catch (e) { }
      }
    } else {
      // Namaz kilmadim - bildirimleri yeniden aktif et
      if (vakitAdi) {
        try { await ArkaplanMuhafizServisi.getInstance().vakitKilindisiniGeriAl(vakitAdi); } catch (e) { }

        // Sayac aktifse yeniden planla
        try {
          const state = store.getState();
          if (state.vakitSayac?.ayarlar?.aktif) {
            const konumState = state.konum;
            const muhafizState = state.muhafiz;
            await VakitSayacBildirimServisi.getInstance().yapilandirVePlanla({
              aktif: true,
              koordinatlar: konumState.koordinatlar,
              seviye2Esik: muhafizState.esikler.seviye2,
            });
          }
        } catch (e) { }
      }
    }
  };

  const suankiVakitTamamla = () => {
    if (vakitBilgisi && vakitBilgisi.vakit) {
      const namazAdi = servisToNamazAdi[vakitBilgisi.vakit];
      if (namazAdi) {
        namazToggle(namazAdi, true);
      }
    }
  };

  const tumunuTamamla = () => dispatch(tumNamazlariTamamla({ tarih: mevcutTarih }));
  const tumunuSifirla = () => dispatch(tumNamazlariSifirla({ tarih: mevcutTarih }));

  // Sayfa içeriği render
  const sayfaIcerigiOlustur = (sayfaIndeksi: number) => {
    const sayfaTarihi = sayfaIndeksiniTariheCevir(sayfaIndeksi);
    const mevcutSayfaMi = sayfaIndeksi === mevcutSayfaIndeksi;

    if (!mevcutSayfaMi || !gunlukNamazlar) return <View key={sayfaIndeksi} className="flex-1" />;

    const tamamlanan = gunlukNamazlar.namazlar.filter(n => n.tamamlandi).length;
    const toplam = gunlukNamazlar.namazlar.length;
    const aktifGunKontrol = sayfaTarihi === aktifGun;

    // Şu anki vakit bilgisi (sadece aktif gün için geçerli)
    let suankiVakitAdi = "Vakit";
    let vakitAraligi = "00:00 - 00:00";
    let suankiVakitTamamlandi = false;
    let kilitli = false;

    if (aktifGunKontrol && vakitBilgisi) {
      // Eğer vakit 'Güneş' ise (kerahat vakti), kullanıcıya bir sonraki vakit olan 'Öğle'yi gösteriyoruz
      // Ancak buton 'Vakit Girmedi' şeklinde pasif olacak
      if (vakitBilgisi.vakit === 'gunes') {
        suankiVakitAdi = NamazAdi.Ogle;
        kilitli = true;
      } else {
        suankiVakitAdi = servisToNamazAdi[vakitBilgisi.vakit] || "Sabah";
      }

      const suankiNamaz = uiNamazlar.find(n => n.namazAdi === suankiVakitAdi);
      if (suankiNamaz) {
        suankiVakitTamamlandi = suankiNamaz.tamamlandi;

        const suankiIndex = uiNamazlar.findIndex(n => n.namazAdi === suankiVakitAdi);
        const sonrakiNamaz = uiNamazlar[suankiIndex + 1];

        // Eğer vakit gunes ise, UI'da Ogle gosteriyoruz.
        // Vakit aralığı: Ogle Saati - Ikindi Saati olmalı (Normal bir vakit gibi)
        // VakitKarti'na "Vakit Girmedi" durumunu yansıtmak için kilitli prop'u var.

        if (sonrakiNamaz) {
          vakitAraligi = `${suankiNamaz.saat} - ${sonrakiNamaz.saat}`;
        } else {
          vakitAraligi = `${suankiNamaz.saat} - ...`;
        }
      }
    }

    return (
      <ScrollView key={sayfaIndeksi} className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        <KutlamaAnimasyonu gorunsun={kutlamaGoster} boyut={300} animasyonBittiCallback={() => setKutlamaGoster(false)} />

        {/* Muhafiz Uyarı Kartı - Güneş (Kerahat) vaktinde muhafız uyarıları gizlenmeli mi? Genelde hayır, sabah namazını kaçırdıysa uyarabilir. */}
        {aktifGunKontrol && muhafizDurumu.seviye > 0 && !suankiVakitTamamlandi && (
          <View className="mb-4 p-4 rounded-xl flex-row items-center gap-3 shadow-sm"
            style={{ backgroundColor: muhafizDurumu.seviye >= 3 ? '#FEE2E2' : '#FFEDD5' }}>
            <FontAwesome5 name="exclamation-triangle" size={24} color={muhafizDurumu.seviye >= 3 ? '#DC2626' : '#EA580C'} />
            <View className="flex-1">
              <Text className="font-bold text-sm" style={{ color: muhafizDurumu.seviye >= 3 ? '#991B1B' : '#9A3412' }}>
                {muhafizDurumu.seviye >= 3 ? "⚠️ ŞEYTANLA MÜCADELE MODU" : "⚠️ VAKİT ÇIKIYOR"}
              </Text>
              <Text className="text-xs mt-1" style={{ color: muhafizDurumu.seviye >= 3 ? '#7F1D1D' : '#7C2D12' }}>
                {muhafizDurumu.mesaj}
              </Text>
            </View>
          </View>
        )}

        {/* İftar Sayacı - Sadece aktif gün gösterilir */}
        {aktifGunKontrol && (
          <IftarSayaci koordinatlar={konumAyarlari.koordinatlar} />
        )}

        {/* Ana Vakit Kartı (Hero) - Sadece aktif gün gösterilir */}
        {aktifGunKontrol ? (
          <VakitKarti
            vakitBilgisi={vakitBilgisi}
            kalanSureStr={kalanSureStr}
            suankiVakitAdi={suankiVakitAdi}
            vakitAraligi={vakitAraligi}
            tamamlandi={suankiVakitTamamlandi}
            onTamamla={suankiVakitTamamla}
            kilitli={kilitli}
          />
        ) : (
          <View className="mb-6 p-6 rounded-3xl items-center justify-center border"
            style={{ backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }}>
            <Text className="text-xl font-bold" style={{ color: renkler.metin }}>
              {tarihiGorunumFormatinaCevir(sayfaTarihi)}
            </Text>
            <Text className="text-sm mt-2" style={{ color: renkler.metinIkincil }}>
              Geçmiş gün görüntüleniyor
            </Text>
          </View>
        )}

        {/* Akış Listesi */}
        <VakitAkisi
          namazlar={uiNamazlar}
          suankiVakitAdi={aktifGunKontrol ? suankiVakitAdi : ''}
          tamamlananSayisi={tamamlanan}
          toplamSayi={toplam}
          onVakitTikla={(namazAdi, val) => namazToggle(namazAdi as NamazAdi, val)}
          aktifGunMu={aktifGunKontrol}
        />
        {/* ScrollView sonu için boşluk */}
        <View className="h-10" />
      </ScrollView>
    );
  };

  if (yukleniyor && !gunlukNamazlar) return <View className="flex-1 justify-center items-center" style={{ backgroundColor: renkler.arkaplan }}><YuklemeGostergesi mesaj="Yükleniyor..." /></View>;
  if (hata && !gunlukNamazlar) return <View className="flex-1 justify-center items-center p-6" style={{ backgroundColor: renkler.arkaplan }}><Text className="text-red-500 mb-4">{hata}</Text><AnimasyonluButon metin="Tekrar Dene" ikon="🔄" onPress={() => namazlariGetir(mevcutTarih)} tip="birincil" /></View>;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: renkler.arkaplan }} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor={renkler.kartArkaplan} barStyle={koyuMu ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <HomeHeader
        tarih={mevcutTarih}
        streakGun={seriOzeti ? seriOzeti.mevcutSeri : 0}
        bugunMu={bugunMu(mevcutTarih)}
        aktifGunMu={mevcutTarih === aktifGun}
        onTarihTikla={() => setTarihSeciciGorunur(true)}
        onSeriTikla={() => setSeriModalGorunur(true)}
        onKibleTikla={() => navigation.navigate('KibleSayfasi')}
      />

      {/* Pager */}
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={BASLANGIC_SAYFA_INDEKSI}
        onPageSelected={(e) => {
          const yeniIndeks = e.nativeEvent.position;
          const yeniTarih = sayfaIndeksiniTariheCevir(yeniIndeks);

          // Gelecek gunlere kayma engeli
          if (yeniTarih > aktifGun) {
            // Haptic feedback ve toast mesaji
            HaptikServisi.uyariTitresimi();
            if (Platform.OS === 'android') {
              ToastAndroid.show('Gelecek gunlere gidemezsiniz', ToastAndroid.SHORT);
            }
            // Aktif gune geri don
            pagerRef.current?.setPage(tarihiSayfaIndeksineCevir(aktifGun));
            return;
          }

          setMevcutSayfaIndeksi(yeniIndeks);
          dispatch(tarihiDegistir(yeniTarih));
          namazlariGetir(yeniTarih);
          oncekiTamamlananRef.current = 0;
        }}
      >
        {Array.from({ length: 2001 }, (_, i) => i).map(sayfaIndeksi => (
          <View key={sayfaIndeksi}>
            {Math.abs(sayfaIndeksi - mevcutSayfaIndeksi) <= 2 ? sayfaIcerigiOlustur(sayfaIndeksi) : <View className="flex-1" />}
          </View>
        ))}
      </PagerView>

      {/* Modals */}
      {tarihSeciciGorunur && (
        <DateTimePicker
          value={new Date(mevcutTarih)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date(aktifGun + 'T23:59:59')}
          onChange={(event, date) => {
            setTarihSeciciGorunur(Platform.OS === 'ios');
            if (event.type === 'dismissed') {
              return;
            }
            if (date) {
              const tarih = tarihiISOFormatinaCevir(date);

              // Gelecek tarih secilmisse engelle
              if (tarih > aktifGun) {
                return;
              }

              const indeks = tarihiSayfaIndeksineCevir(tarih);
              dispatch(tarihiDegistir(tarih));
              namazlariGetir(tarih);
              pagerRef.current?.setPage(indeks);
              setMevcutSayfaIndeksi(indeks);
            }
          }}
        />
      )}
      <KutlamaModal kutlama={ilkKutlama} gorunur={!!ilkKutlama} onKapat={() => dispatch(kutlamayiKaldir())} />

      <SeriKartiModal
        gorunur={seriModalGorunur}
        onKapat={() => setSeriModalGorunur(false)}
        mevcutSeri={seriOzeti ? seriOzeti.mevcutSeri : 0}
        enUzunSeri={seriOzeti ? seriOzeti.enUzunSeri : 0}
      />
    </SafeAreaView>
  );
};
