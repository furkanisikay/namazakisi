import * as React from 'react';
import { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import { View, Text, Platform, TouchableOpacity, StatusBar, ScrollView, ToastAndroid, AppState, AppStateStatus, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PagerView from 'react-native-pager-view';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useNavigation } from '@react-navigation/native';
import type { RootNavigationProp } from '../../navigation/AppNavigator';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { namazlariYukle, namazDurumunuDegistir, tumNamazlariTamamla, tumNamazlariSifirla, tarihiDegistir } from '../store/namazSlice';
import { seriVerileriniYukle, seriKontrolet, puanlamayiYenidenHesapla, kutlamayiKaldir, seriOzetiSelector, ilkKutlamaSelector } from '../store/seriSlice';
import { YuklemeGostergesi, KutlamaAnimasyonu, KutlamaModal, AnimasyonluButon, ToparlanmaModal } from '../components';
import { HomeHeader } from '../components/home/HomeHeader';
import { VakitKarti } from '../components/home/VakitKarti';
import { VakitAkisi } from '../components/home/VakitAkisi';
import { SeriKartiModal } from '../components/home/SeriKartiModal';
import { KerahatOnayModal } from '../components/home/KerahatOnayModal';
import { NamazAdi } from '../../core/constants/UygulamaSabitleri';
import { bugunuAl, tarihiGorunumFormatinaCevir, bugunMu, tarihiISOFormatinaCevir, gunEkle, ISOTarihiDateNesnesiNeCevir } from '../../core/utils/TarihYardimcisi';
import { sayacBaslangicEsikDkHesapla } from '../../core/utils/vakitSayacYardimcisi';
import { aktifGunuHesapla, gelecekGuneGecisMi } from '../../core/utils/gunNavigasyonYardimcisi';
import { useRenkler, useTema } from '../../core/theme';
import { useFeedback } from '../../core/feedback';
import { NamazMuhafiziServisi } from '../../domain/services/NamazMuhafiziServisi';
import { NamazVaktiHesaplayiciServisi, VakitBilgisi } from '../../domain/services/NamazVaktiHesaplayiciServisi';
import { mekruhVakitKontrolEt } from '../../domain/services/KazaHesaplayiciServisi';
import { ArkaplanMuhafizServisi } from '../../domain/services/ArkaplanMuhafizServisi';
import { VakitSayacBildirimServisi } from '../../domain/services/VakitSayacBildirimServisi';
import { BildirimServisi } from '../../domain/services/BildirimServisi';
import { ArkaplanGorevServisi } from '../../domain/services/ArkaplanGorevServisi';
import { store } from '../store/store';
import { HaptikServisi } from '../../core/feedback/HaptikServisi';
import { SesServisi } from '../../core/feedback/SesServisi';
import { FontAwesome5 } from '@expo/vector-icons';
import { SERI_RENKLERI } from '../../core/constants/UygulamaSabitleri';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { Namaz } from '../../core/types';
import { Logger } from '../../core/utils/Logger';

// Baslangic sayfasi
const GECMIS_GUN_SAYISI = 90; // 3 ay geri
const GELECEK_GUN_SAYISI = 1; // 1 gun ileri (yarin)
const TOPLAM_SAYFA_SAYISI = GECMIS_GUN_SAYISI + 1 + GELECEK_GUN_SAYISI; // 3 ay geri + bugun + yarin
const BASLANGIC_SAYFA_INDEKSI = GECMIS_GUN_SAYISI; // bugun
const SAYFA_INDEKSLERI = Array.from({ length: TOPLAM_SAYFA_SAYISI }, (_, i) => i);

export const AnaSayfa: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const dispatch = useAppDispatch();
  const pagerRef = useRef<PagerView>(null);
  const renkler = useRenkler();
  const { koyuMu } = useTema();
  const { tumNamazlarTamamlandiFeedback } = useFeedback();

  const [mevcutSayfaIndeksi, setMevcutSayfaIndeksi] = useState(BASLANGIC_SAYFA_INDEKSI);
  const [tarihSeciciGorunur, setTarihSeciciGorunur] = useState(false);
  const [seriModalGorunur, setSeriModalGorunur] = useState(false);
  const [toparlanmaModalGorunur, setToparlanmaModalGorunur] = useState(false);
  const [kutlamaGoster, setKutlamaGoster] = useState(false);
  const [muhafizDurumu, setMuhafizDurumu] = useState<{ mesaj: string, seviye: number }>({ mesaj: '', seviye: 0 });
  const [vakitBilgisi, setVakitBilgisi] = useState<VakitBilgisi | null>(null);
  const [kalanSureStr, setKalanSureStr] = useState("00:00:00");
  const [mekruhBilgi, setMekruhBilgi] = useState<{ mekruhMu: boolean; aciklama: string | null }>({
    mekruhMu: false,
    aciklama: null,
  });
  // Kerahat vaktinde işaretleme öncesi kibar onay modalı için bekleyen namaz (issue #82).
  // null değilse modal görünür; onaylanırsa bu namaz "kılındı" işaretlenir.
  const [kerahatOnayBekleyen, setKerahatOnayBekleyen] = useState<NamazAdi | null>(null);

  const { mevcutTarih, gunlukNamazlar, yukleniyor, hata } = useAppSelector(state => state.namaz);
  const { ozelGunAyarlari, sonYukleme: seriSonYukleme } = useAppSelector(state => state.seri);
  const seriYuklendiMi = !!seriSonYukleme;
  const seriOzeti = useAppSelector(seriOzetiSelector);
  const seriDurumu = useAppSelector(state => state.seri.seriDurumu);
  const ilkKutlama = useAppSelector(ilkKutlamaSelector);
  const muhafizAyarlari = useAppSelector((state) => state.muhafiz);
  const konumAyarlari = useAppSelector((state) => state.konum);
  // useEffect bagimliliklarinda obje referansi yerine stabil string kullanilir
  // (Redux dispatch sonrasi ayni degerlerle bile yeni obje olusturulur, bu gereksiz tetiklemeyi onler)
  const konumAyarlariStr = JSON.stringify(konumAyarlari.koordinatlar);
  const muhafizAyarlariStr = JSON.stringify(muhafizAyarlari);

  const konumMetni = (() => {
    if (konumAyarlari.konumModu === 'oto') {
      const { gpsAdres } = konumAyarlari;
      if (gpsAdres?.ilce && gpsAdres?.il) return `${gpsAdres.ilce}, ${gpsAdres.il}`;
      return gpsAdres?.ilce || gpsAdres?.il || 'GPS aktif';
    }
    if (konumAyarlari.seciliIlceAdi && konumAyarlari.seciliIlAdi) {
      return `${konumAyarlari.seciliIlceAdi}, ${konumAyarlari.seciliIlAdi}`;
    }
    return konumAyarlari.seciliIlAdi || undefined;
  })();

  const oncekiTamamlananRef = useRef<number>(0);
  const arkaplanMuhafizTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Programatik pager geçişi (açılış snap'i / tarih seçici / aktif güne dönüş) sırasında
  // onPageSelected'ın yanlışlıkla "gelecek gün" toast'ı + geri-snap yapmasını önleyen bayrak.
  // Yalnızca kullanıcı ELLE gelecek bir güne kaydırınca toast çıkmalı (#13 + gece yarısı bug).
  const programatikGecisRef = useRef(false);

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
    // YEREL-gün aritmetiği (ISOTarihiDateNesnesiNeCevir) ile hesapla — sayfaIndeksiniTariheCevir
    // (gunEkle) ile TUTARLI olmalı. Önceden `new Date(isoString)` UTC gece yarısı üretip
    // negatif timezone'larda ±1 gün kayma riski taşıyordu (#13 kırılganlık kaynağı).
    const bugun = ISOTarihiDateNesnesiNeCevir(bugunuAl());
    const hedefTarih = ISOTarihiDateNesnesiNeCevir(tarih);
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


  // Aktif Gün Hesaplama (İmsak öncesi ise önceki gün — yatsı süreci devam ediyor).
  // Karar mantığı saf yardımcıda (gunNavigasyonYardimcisi.aktifGunuHesapla) — adhan'a
  // bağımlı olmadan test edilebilir; AnaSayfa yalnız imsak (fajr) zamanını besler.
  const aktifGun = useMemo(() => {
    const bugun = bugunuAl();
    const now = new Date();
    let imsakZamani: Date | null = null;

    if (konumAyarlari.koordinatlar) {
      const coordinates = new Coordinates(konumAyarlari.koordinatlar.lat, konumAyarlari.koordinatlar.lng);
      const params = CalculationMethod.Turkey();
      const prayerTimes = new PrayerTimes(coordinates, now, params);
      imsakZamani = prayerTimes.fajr;
    }

    return aktifGunuHesapla(bugun, now, imsakZamani, gunEkle(bugun, -1));
  }, [konumAyarlari.koordinatlar, vakitBilgisi?.vakit]); // vakitBilgisi.vakit degisince aktif gun yeniden hesaplanir (imsak gecisi = yeni gun)

  // Initial Load - Aktif güne git
  useEffect(() => {
    namazlariGetir(aktifGun);
    // Aktif gün gösterilen günden farklıysa (gece yarısı: yatsı sürerken aktif gün dün)
    // doğrudan aktif güne yerleş. setPageWithoutAnimation ile GÖRÜNÜR zıplama olmaz; ayrıca
    // programatikGecisRef set edilerek onPageSelected'ın "gelecek gün" toast'ı bastırılır
    // (pager initialPage=bugün iken aktif gün dün olunca yanlış toast çıkıyordu).
    if (aktifGun !== mevcutTarih) {
      const yeniIndeks = tarihiSayfaIndeksineCevir(aktifGun);
      programatikGecisRef.current = true;
      dispatch(tarihiDegistir(aktifGun));
      setMevcutSayfaIndeksi(yeniIndeks);
      pagerRef.current?.setPageWithoutAnimation(yeniIndeks);
    }

    dispatch(seriVerileriniYukle());
    // Puanlama/seri senkronu, gunlukNamazlar yuklenince yukaridaki useEffect ile
    // (seriKontrolet -> reconcile) otomatik ve SIRALI kosar.
    // muhafizAyarlariniYukle, iftarSayacAyarlariniYukle, sahurSayacAyarlariniYukle
    // ve BildirimServisi.izinIste App.tsx arkaplanMuhafiziBildirimleriniPlanla icerisinde
    // konum yuklendikten sonra paralel yukleniyor

    ArkaplanGorevServisi.getInstance().kaydetVeBaslat()
      .then(basarili => {
        if (basarili) {
          Logger.info('AnaSayfa', 'Arka plan görevi başlatıldı');
        }
      })
      .catch(err => {
        Logger.error('AnaSayfa', 'Arka plan görevi hatası', err);
      });

    return () => {
      try { NamazMuhafiziServisi.getInstance().durdur(); } catch (e) { }
    };
  }, [aktifGun]);

  // Seri + puanlama senkronu: gunlukNamazlar her degistiginde (yukleme/toggle/toplu) once
  // seriKontrolet'i AWAIT edip ARDINDAN reconcile'i zincirle -> TEK-YAZICI, yaris yok.
  // Ilk senkron (acilis) SESSIZ; sonraki (gercek kullanici eylemi) seviye atlamada kutlar.
  const seriIlkSenkronRef = useRef(true);
  const migreEdildi = useAppSelector((state) => state.seri.migreEdildi);
  useEffect(() => {
    if (gunlukNamazlar && gunlukNamazlar.tarih === aktifGun && seriYuklendiMi) {
      // Ilk senkron YALNIZ migrasyon yapildiysa sessiz (de-inflasyon yanlis kutlama tetiklemesin).
      // Migrasyon yoksa ilk senkron da seviye atlamayi kutlar -> arka planda kazanilan seviye yutulmaz.
      const sessiz = seriIlkSenkronRef.current && migreEdildi;
      seriIlkSenkronRef.current = false;
      const bugunNamazlar = gunlukNamazlar;
      (async () => {
        await dispatch(seriKontrolet({ bugunNamazlar, dunNamazlar: null }));
        dispatch(puanlamayiYenidenHesapla({ sessiz }));
      })();
    }
  }, [gunlukNamazlar, mevcutTarih, aktifGun, dispatch, seriYuklendiMi, migreEdildi]);

  // Vakit Hesaplayıcı ve Sayaç
  useEffect(() => {
    const s = NamazVaktiHesaplayiciServisi.getInstance();
    s.yapilandir({
      latitude: konumAyarlari.koordinatlar.lat,
      longitude: konumAyarlari.koordinatlar.lng,
      method: 'Turkey',
      madhab: 'Hanafi'
    });

    // Onceki vakit bilgisini ref'te tut (gecis tespiti icin)
    const oncekiVakitRef = { current: vakitBilgisi?.vakit || null };

    const updateTimer = () => {
      const bilgi = s.getSuankiVakitBilgisi();

      // Vakit gecisi tespiti (debug)
      if (bilgi && oncekiVakitRef.current && bilgi.vakit !== oncekiVakitRef.current) {
        Logger.info('AnaSayfa/Timer', `*** VAKIT GECISI: ${oncekiVakitRef.current} -> ${bilgi.vakit} ***`);
        Logger.info('AnaSayfa/Timer', `Sonraki vakit: ${bilgi.sonrakiVakitAdi}, giris: ${bilgi.sonrakiVakitGiris}`);
        // Vakit degisince muhafiz uyarisini sifirla (yeni vakit icin tekrar hesaplanacak)
        setMuhafizDurumu({ mesaj: '', seviye: 0 });
      }
      oncekiVakitRef.current = bilgi?.vakit || null;

      setVakitBilgisi(bilgi);

      if (bilgi) {
        const simdi = new Date();
        const hedef = new Date(bilgi.sonrakiVakitGiris);
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

    // Timer interval refs
    let timerInterval: NodeJS.Timeout | null = null;

    // Uygulama on plandayken calistir, arkada kapat 
    // (Boylece Background state update sirasina bagli react navigation render crush'lari onlenir)
    const startLocalTimer = () => {
      if (!timerInterval) {
        timerInterval = setInterval(updateTimer, 1000);
      }
    };

    const stopLocalTimer = () => {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    };

    // Ilk render'da ac ve AppState dinleyicisine ekle
    startLocalTimer();

    if (arkaplanMuhafizTimeoutRef.current) clearTimeout(arkaplanMuhafizTimeoutRef.current);

    // Effect temizlenirse geç gelen async baslat'ı iptal et (eski effect'in muhafızı
    // yeniden başlatmasını / stale callback set etmesini önler).
    let iptalEdildi = false;

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
      // ÖNCE diskteki kılınmışlık kaydını yükle, SONRA başlat. Aksi halde açılışta
      // bellek-içi map boş olur ve zaten kılınmış namaza vakte kısa süre kala (seviye >= 3)
      // çan sesi çalardı (#92). baslat() ilk kontrolEt'i hemen çağırdığından sıra önemli.
      muhafiz.acilistaKilinanlariYukle().finally(() => {
        if (iptalEdildi) return;
        muhafiz.baslat((mesaj, seviye) => {
          setMuhafizDurumu({ mesaj, seviye });
          if (seviye >= 3) { HaptikServisi.gucluTitresim(); SesServisi.bildirimSesiCal(); }
          else if (seviye > 0) { HaptikServisi.uyariTitresimi(); }
        });
      });
    } else {
      muhafiz.durdur();
      setMuhafizDurumu({ mesaj: '', seviye: 0 });
    }

    const appStateEvent = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        updateTimer();
        startLocalTimer();
      } else {
        stopLocalTimer();
      }
    });

    return () => {
      iptalEdildi = true;
      stopLocalTimer();
      appStateEvent.remove();
      muhafiz.durdur();
      if (arkaplanMuhafizTimeoutRef.current) clearTimeout(arkaplanMuhafizTimeoutRef.current);
    };
  }, [konumAyarlariStr, muhafizAyarlariStr]);

  // Kerahat vakti kontrolü — her dakika güncelle
  useEffect(() => {
    const kontrol = () => {
      const { lat, lng } = konumAyarlari.koordinatlar || {};
      if (lat && lng) {
        const sonuc = mekruhVakitKontrolEt(lat, lng, 'farz');
        setMekruhBilgi({ mekruhMu: sonuc.mekruhMu, aciklama: sonuc.aciklama });
      }
    };
    kontrol();
    const interval = setInterval(kontrol, 60 * 1000);
    return () => clearInterval(interval);
  }, [konumAyarlariStr]);

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

  // Namaz İşlemleri — gerçek işaretleme (kerahat onayından geçtikten sonra çağrılır)
  const namazIsaretle = async (namazAdi: NamazAdi, tamamlandi: boolean) => {
    dispatch(namazDurumunuDegistir({ tarih: mevcutTarih, namazAdi: namazAdi, tamamlandi }));
    // Puanlama + seri: gunlukNamazlar degisince yukaridaki useEffect (seriKontrolet -> reconcile)
    // SIRALI ve TEK-YAZICI olarak otomatik kosar; burada ayrica dispatch GEREKMEZ (yaris onlenir).

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
      try { if (vakitAdi) NamazMuhafiziServisi.getInstance().namazKilindiIsaretle(vakitAdi); setMuhafizDurumu({ mesaj: '', seviye: 0 }); } catch (e) { }

      // Zamanlanmış/aktif tüm vakit bildirimlerini temizle
      if (vakitAdi) {
        try { await BildirimServisi.getInstance().vakitKilindiTemizle(vakitAdi, mevcutTarih); } catch (e) { }
      }
    } else {
      // Namaz kilmadim - bildirimleri yeniden aktif et
      if (vakitAdi) {
        try { NamazMuhafiziServisi.getInstance().namazKilindiTemizle(vakitAdi); } catch (e) { }
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
              baslangicEsikDk: sayacBaslangicEsikDkHesapla(
                state.vakitSayac?.ayarlar?.sayacBaslangicSeviyesi,
                muhafizState
              ),
              muhafizAktif: muhafizState.aktif,
            });
          }
        } catch (e) { }
      }
    }
  };

  // Namaz toggle giriş noktası — kerahat (mekruh) vaktinde işaretlemeyi ENGELLEMEZ,
  // önce kibar bir onay modalı gösterir (issue #82). Kullanıcı onaylarsa işaretlenir.
  // Sadece AKTİF günde + "kılındı" yönünde işaretlerken uyarı çıkar; geçmiş gün ve
  // "kılmadım" (geri alma) doğrudan geçer.
  const namazToggle = async (namazAdi: NamazAdi, tamamlandi: boolean) => {
    if (tamamlandi && mekruhBilgi.mekruhMu && mevcutTarih === aktifGun) {
      setKerahatOnayBekleyen(namazAdi);
      return;
    }
    await namazIsaretle(namazAdi, tamamlandi);
  };

  // Kerahat onay modalı sonucu: onaylanırsa bekleyen namazı işaretle, her durumda kapat.
  const kerahatOnayla = () => {
    const bekleyen = kerahatOnayBekleyen;
    setKerahatOnayBekleyen(null);
    if (bekleyen) {
      namazIsaretle(bekleyen, true);
    }
  };
  const kerahatVazgec = () => setKerahatOnayBekleyen(null);

  // VakitAkisi (React.memo) icin referans-kararli onVakitTikla:
  // ref ile en guncel namazToggle'i cagirir, her render'da yeni fonksiyon olusmaz.
  const namazToggleRef = useRef(namazToggle);
  namazToggleRef.current = namazToggle;
  const handleVakitTikla = useCallback((namazAdi: string, val: boolean) => {
    namazToggleRef.current(namazAdi as NamazAdi, val);
  }, []);

  const suankiVakitTamamla = () => {
    if (vakitBilgisi && vakitBilgisi.vakit) {
      const namazAdi = servisToNamazAdi[vakitBilgisi.vakit];
      if (namazAdi) {
        namazToggle(namazAdi, true);
      }
    }
  };

  // Toplu islemler gunlukNamazlar'i degistirir -> useEffect (seriKontrolet -> reconcile) otomatik kosar
  const tumunuTamamla = () => dispatch(tumNamazlariTamamla({ tarih: mevcutTarih }));
  const tumunuSifirla = () => dispatch(tumNamazlariSifirla({ tarih: mevcutTarih }));

  const handleTarihTikla = useCallback(() => setTarihSeciciGorunur(true), []);
  const handleSeriTikla = useCallback(() => setSeriModalGorunur(true), []);
  const handleKibleTikla = useCallback(() => navigation?.navigate('KibleSayfasi'), [navigation]);

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
      // Eğer vakit 'Güneş' ise (şuruk/istiwa kerahat vakti), kullanıcıya bir sonraki vakit olan 'Öğle'yi gösteriyoruz
      // Ancak buton 'Vakit Girmedi' şeklinde pasif olacak
      if (vakitBilgisi.vakit === 'gunes') {
        // Güneş (şuruk/istiwa) vaktinde henüz Öğle vakti GİRMEDİĞİ için buton "Vakit Girmedi"
        // olarak kilitli kalır (bu bir kerahat engeli değil, vaktin girmemiş olmasıdır).
        suankiVakitAdi = NamazAdi.Ogle;
        kilitli = true;
      } else {
        // Vakti girmiş namazlarda kerahat (gurub vb.) işaretlemeyi ENGELLEMEZ (issue #82):
        // buton açık kalır; işaretlemeden önce kibar onay modalı gösterilir (kerahatOnayBekleyen).
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

        {/* Kerahat Vakti Uyarı Bannerı */}
        {aktifGunKontrol && mekruhBilgi.mekruhMu && mekruhBilgi.aciklama && (
          <View className="mb-4 p-3 rounded-xl flex-row items-start gap-3 border"
            style={{ backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }}>
            <FontAwesome5 name="exclamation-triangle" size={14} color={renkler.metinIkincil} style={{ marginTop: 2 }} />
            <Text className="flex-1 text-xs leading-5 font-medium" style={{ color: renkler.metinIkincil }}>
              {mekruhBilgi.aciklama}
            </Text>
          </View>
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
            konumModu={konumAyarlari.konumModu}
            konumMetni={konumMetni}
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
          onVakitTikla={handleVakitTikla}
          aktifGunMu={aktifGunKontrol}
          kilitli={kilitli}
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
        onTarihTikla={handleTarihTikla}
        onSeriTikla={handleSeriTikla}
        onKibleTikla={handleKibleTikla}
        toparlanmaModu={seriOzeti?.toparlanmaModu}
        toparlanmaIlerleme={seriOzeti?.toparlanmaIlerleme}
      />

      {/* Toparlanma Banner */}
      {seriOzeti?.toparlanmaModu && seriOzeti.toparlanmaIlerleme && (
        <TouchableOpacity
          style={[
            anaSayfaStilleri.toparlanmaBanner,
            { backgroundColor: koyuMu ? '#78350f30' : '#fef3c7', borderColor: '#f59e0b' },
          ]}
          onPress={() => setToparlanmaModalGorunur(true)}
          activeOpacity={0.8}
          accessibilityLabel="Toparlanma modu detayı için dokun"
          accessibilityRole="button"
        >
          <Text style={{ color: '#92400e', fontWeight: '700', fontSize: 13, flex: 1 }}>
            ⚡ Toparlanma Modu — {seriOzeti.toparlanmaIlerleme.tamamlanan}/{seriOzeti.toparlanmaIlerleme.hedef} gün tamamlandı
          </Text>
          <View style={anaSayfaStilleri.bannerProgressArkaplan}>
            <View
              style={[
                anaSayfaStilleri.bannerProgressDolgu,
                {
                  width: `${seriOzeti.toparlanmaIlerleme.hedef > 0 ? (seriOzeti.toparlanmaIlerleme.tamamlanan / seriOzeti.toparlanmaIlerleme.hedef) * 100 : 0}%`,
                },
              ]}
            />
          </View>
          <FontAwesome5 name="chevron-right" size={12} color="#92400e" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      )}

      {/* Pager */}
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={BASLANGIC_SAYFA_INDEKSI}
        onPageSelected={(e) => {
          const yeniIndeks = e.nativeEvent.position;
          const yeniTarih = sayfaIndeksiniTariheCevir(yeniIndeks);

          // Programatik geçiş (açılış snap'i / tarih seçici / aktif güne dönüş) ise toast
          // ve geri-snap YAPMA — yalnız state'i senkronize et. Bayrağı tüket.
          const programatik = programatikGecisRef.current;
          programatikGecisRef.current = false;

          // Gelecek günlere kayma engeli — SADECE kullanıcı ELLE gelecek bir güne kaydırınca.
          // Programatik geçişler (ör. gece yarısı pager initialPage=bugün iken aktif gün dün)
          // yanlışlıkla "gelecek gün" sayılıp toast tetiklemesin (#13 + gece yarısı bug).
          if (!programatik && gelecekGuneGecisMi(yeniTarih, aktifGun)) {
            HaptikServisi.uyariTitresimi();
            if (Platform.OS === 'android') {
              ToastAndroid.show('Gelecek gunlere gidemezsiniz', ToastAndroid.SHORT);
            }
            // Aktif gune geri don
            programatikGecisRef.current = true;
            pagerRef.current?.setPage(tarihiSayfaIndeksineCevir(aktifGun));
            return;
          }

          setMevcutSayfaIndeksi(yeniIndeks);
          dispatch(tarihiDegistir(yeniTarih));
          namazlariGetir(yeniTarih);
          oncekiTamamlananRef.current = 0;
        }}
      >
        {SAYFA_INDEKSLERI.map(sayfaIndeksi => (
          <View key={sayfaIndeksi}>
            {Math.abs(sayfaIndeksi - mevcutSayfaIndeksi) <= 1 ? sayfaIcerigiOlustur(sayfaIndeksi) : <View className="flex-1" />}
          </View>
        ))}
      </PagerView>

      {/* Modals */}
      {tarihSeciciGorunur && (
        <DateTimePicker
          value={new Date(mevcutTarih)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date(gunEkle(bugunuAl(), -GECMIS_GUN_SAYISI) + 'T00:00:00')}
          maximumDate={new Date(aktifGun + 'T23:59:59')}
          onChange={(event, date) => {
            setTarihSeciciGorunur(Platform.OS === 'ios');
            if (event.type === 'dismissed') {
              return;
            }
            if (date) {
              const tarih = tarihiISOFormatinaCevir(date);

              // Gelecek tarih secilmisse engelle
              if (gelecekGuneGecisMi(tarih, aktifGun)) {
                return;
              }

              // Programatik geçiş: setPage'in tetikleyeceği onPageSelected'ın seçilen günü
              // "gelecek gün" sanıp aktif güne geri-snap etmesini önle (#13 kök neden).
              // Bayrak yalnız GERÇEKTEN farklı sayfaya geçişte set edilir; aynı sayfaya
              // setPage event üretmez ve bayrak asılı kalıp sonraki kaydırmayı bozardı.
              const indeks = tarihiSayfaIndeksineCevir(tarih);
              dispatch(tarihiDegistir(tarih));
              namazlariGetir(tarih);
              if (indeks !== mevcutSayfaIndeksi) {
                programatikGecisRef.current = true;
                pagerRef.current?.setPage(indeks);
                setMevcutSayfaIndeksi(indeks);
              }
            }
          }}
        />
      )}
      <KutlamaModal kutlama={ilkKutlama} gorunur={!!ilkKutlama} onKapat={() => dispatch(kutlamayiKaldir())} />

      {/* Kerahat (mekruh) vaktinde işaretleme öncesi kibar onay (issue #82) */}
      <KerahatOnayModal
        gorunur={kerahatOnayBekleyen !== null}
        aciklama={mekruhBilgi.aciklama}
        namazAdi={kerahatOnayBekleyen ?? ''}
        onOnayla={kerahatOnayla}
        onVazgec={kerahatVazgec}
      />

      <SeriKartiModal
        gorunur={seriModalGorunur}
        onKapat={() => setSeriModalGorunur(false)}
        mevcutSeri={seriOzeti ? seriOzeti.mevcutSeri : 0}
        enUzunSeri={seriOzeti ? seriOzeti.enUzunSeri : 0}
      />

      {/* Toparlanma Modal */}
      {seriDurumu?.toparlanmaDurumu && (
        <ToparlanmaModal
          gorunur={toparlanmaModalGorunur}
          onKapat={() => setToparlanmaModalGorunur(false)}
          toparlanmaDurumu={seriDurumu.toparlanmaDurumu}
          oncekiSeri={seriDurumu.toparlanmaDurumu.oncekiSeri}
        />
      )}
    </SafeAreaView>
  );
};

const anaSayfaStilleri = StyleSheet.create({
  toparlanmaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 4,
  },
  bannerProgressArkaplan: {
    height: 3,
    backgroundColor: '#f59e0b40',
    borderRadius: 2,
    width: 60,
    overflow: 'hidden',
  },
  bannerProgressDolgu: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 2,
  },
});
