import * as React from 'react';
import { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import { View, Text, Platform, StatusBar, AppState, AppStateStatus, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import PagerView from 'react-native-pager-view';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { useAppDispatch, useAppSelector } from '../store/hooks';
import { namazlariYukle, namazDurumunuDegistir, tumNamazlariTamamla, tumNamazlariSifirla, tarihiDegistir } from '../store/namazSlice';
import { seriVerileriniYukle, seriKontrolet, puanlamayiYenidenHesapla, kutlamayiKaldir, seriOzetiSelector, ilkKutlamaSelector } from '../store/seriSlice';
import { useKonumYenile } from '../hooks/useKonumYenile';
import { YuklemeGostergesi, KutlamaAnimasyonu, KutlamaModal, AnimasyonluButon, ToparlanmaModal } from '../components';
import { HomeHeader } from '../components/home/HomeHeader';
import { VakitKarti } from '../components/home/VakitKarti';
import { kisaBildirimGoster } from '../components/common/KisaBildirim';
import { VakitAkisi } from '../components/home/VakitAkisi';
import { SeriKartiModal } from '../components/home/SeriKartiModal';
import { KerahatOnayModal } from '../components/home/KerahatOnayModal';
import { KazaOneriModal } from '../components/home/KazaOneriModal';
import { useFarzSonrasiKazaOnerisi } from '../hooks/useFarzSonrasiKazaOnerisi';
import { useSadeGorunum } from '../hooks/useSadeGorunum';
import { SadeGorunum } from '../components/sade/SadeGorunum';
import { GunSayfasiDuzeni } from '../components/home/GunSayfasiDuzeni';
import { MasaustuGeriSayim } from '../components/home/MasaustuGeriSayim';
import { SeferilikBilgiKarti, useSeferilikKartiGorunur } from '../components/home/SeferilikBilgiKarti';
import { DurumAlani, DurumSeridi, type DurumAlaniOgesi } from '../components/home/DurumAlani';
import { durumlariBirlestir } from '../../core/anaEkran/durumAlani';
import { kerahatMetniSec, type KerahatTuru } from '../../core/anaEkran/kerahatNotu';
import { useEkranSinifi } from '../hooks/useEkranSinifi';
import { useKatlanmaPosturu } from '../hooks/useKatlanmaPosturu';
import { gunDuzeniSec } from '../../core/utils/katlanmaPosturu';
import { useNafilePencereleri } from '../hooks/useNafilePencereleri';
import { nafileZincirSatirlariOlustur } from '../../core/nafile/nafileZinciri';
import { NamazAdi } from '../../core/constants/UygulamaSabitleri';
import { bugunuAl, tarihiGorunumFormatinaCevir, bugunMu, tarihiISOFormatinaCevir, gunEkle, ISOTarihiDateNesnesiNeCevir } from '../../core/utils/TarihYardimcisi';
import { sayacBaslangicEsikleriHesapla, muhafizUyarilanVakitleriBul } from '../../core/utils/vakitSayacYardimcisi';
import { muhafizMatrisiniCoz } from '../../core/muhafiz/motorAdaptoru';
import { aktifGunuHesapla, gelecekGuneGecisMi } from '../../core/utils/gunNavigasyonYardimcisi';
import { namazGorunenAdi } from '../../core/utils/cumaYardimcisi';
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
import { OnizlemeSesServisi } from '../../domain/services/OnizlemeSesServisi';
import { VARSAYILAN_SES } from '../../core/muhafiz/matrisTipleri';
import { Coordinates, PrayerTimes } from 'adhan';
import { turkiyeHesapParametreleri } from '../../core/vakit/hesapParametreleri';
import { Logger } from '../../core/utils/Logger';

// Baslangic sayfasi
const GECMIS_GUN_SAYISI = 90; // 3 ay geri
const GELECEK_GUN_SAYISI = 1; // 1 gun ileri (yarin)
const TOPLAM_SAYFA_SAYISI = GECMIS_GUN_SAYISI + 1 + GELECEK_GUN_SAYISI; // 3 ay geri + bugun + yarin
const BASLANGIC_SAYFA_INDEKSI = GECMIS_GUN_SAYISI; // bugun
const SAYFA_INDEKSLERI = Array.from({ length: TOPLAM_SAYFA_SAYISI }, (_, i) => i);

export const AnaSayfa: React.FC = () => {
  const dispatch = useAppDispatch();
  const pagerRef = useRef<PagerView>(null);
  const renkler = useRenkler();
  const { koyuMu } = useTema();
  // Katlanabilir/tablet (issue #283): pencere ≥600 dp ise gün sayfası iki bölmeli;
  // yarı açık + yatay menteşede (masaüstü postürü) üstte büyük geri sayım, altta akış.
  // Telefonda (kompakt, düz) düzen birebir eskisi gibi tek sütundur.
  const katlanmaPosturu = useKatlanmaPosturu();
  const gunDuzeni = gunDuzeniSec(useEkranSinifi(), katlanmaPosturu);
  const { tumNamazlarTamamlandiFeedback } = useFeedback();

  const [mevcutSayfaIndeksi, setMevcutSayfaIndeksi] = useState(BASLANGIC_SAYFA_INDEKSI);
  const [tarihSeciciGorunur, setTarihSeciciGorunur] = useState(false);
  const [seriModalGorunur, setSeriModalGorunur] = useState(false);
  const [toparlanmaModalGorunur, setToparlanmaModalGorunur] = useState(false);
  const [kutlamaGoster, setKutlamaGoster] = useState(false);
  const [muhafizDurumu, setMuhafizDurumu] = useState<{ mesaj: string, seviye: number }>({ mesaj: '', seviye: 0 });
  const [vakitBilgisi, setVakitBilgisi] = useState<VakitBilgisi | null>(null);
  const [kalanSureStr, setKalanSureStr] = useState("00:00:00");
  const [mekruhBilgi, setMekruhBilgi] = useState<{ mekruhMu: boolean; aciklama: string | null; tur?: KerahatTuru }>({
    mekruhMu: false,
    aciklama: null,
  });
  // Kerahat vaktinde işaretleme öncesi kibar onay modalı için bekleyen namaz (issue #82).
  // null değilse modal görünür; onaylanırsa bu namaz "kılındı" işaretlenir.
  const [kerahatOnayBekleyen, setKerahatOnayBekleyen] = useState<NamazAdi | null>(null);
  // "Her farzla bir kaza" önerisi (issue #294): karar saf çekirdekte, burada yalnız tetiklenir.
  const kazaOnerisi = useFarzSonrasiKazaOnerisi();
  // Sade görünüm (issue #295): açıksa ana ekranın yerine tek ekran çizilir (aşağıda seçim dalı).
  const sade = useSadeGorunum();
  // Seferîlik kartı (issue #296) tek durum alanında yalnız "kazanan" uyarıyken çizilir;
  // diskteki konumu işleme (ilk ikamet / eve dönüş) bu kancada KOŞULSUZ sürer.
  const seferilikGorunur = useSeferilikKartiGorunur();

  // Stabil callbackler (gereksiz re-render önlemek için)
  const handleTarihTikla = useCallback(() => setTarihSeciciGorunur(true), []);
  const handleSeriTikla = useCallback(() => setSeriModalGorunur(true), []);
  const handleToparlanmaModalGoster = useCallback(() => setToparlanmaModalGorunur(true), []);

  const { mevcutTarih, gunlukNamazlar, yukleniyor, hata } = useAppSelector(state => state.namaz);
  const { ozelGunAyarlari, sonYukleme: seriSonYukleme } = useAppSelector(state => state.seri);
  const seriYuklendiMi = !!seriSonYukleme;
  const seriOzeti = useAppSelector(seriOzetiSelector);
  const seriDurumu = useAppSelector(state => state.seri.seriDurumu);
  const ilkKutlama = useAppSelector(ilkKutlamaSelector);
  const muhafizAyarlari = useAppSelector((state) => state.muhafiz);
  const konumAyarlari = useAppSelector((state) => state.konum);
  // Cuma etiketi yalniz kullanici cuma hatirlatmasini actiysa gosterilir —
  // cuma herkese farz-i ayn degildir, etiketi herkese dayatmayiz.
  const cumaEtiketi = useAppSelector((state) => state.cumaHatirlatma.ayarlar.aktif);
  const nafileAyarlari = useAppSelector((state) => state.nafile.ayarlar);
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

  /**
   * Konum çipindeki yenile düğmesi (yalnız otomatik modda görünür).
   *
   * Neden var: otomatik modda konum yalnız bölge (geofence) çıkışında tazelenir;
   * bölge kurulamadıysa uygulama başka şehirde bile eski konuma göre hesap yapar.
   * Kullanıcının tek çaresi konum modunu manuele alıp otomatiğe döndürmekti.
   */
  const konumYenile = useKonumYenile();

  const oncekiTamamlananRef = useRef<number>(0);
  const arkaplanMuhafizTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Programatik pager geçişi (açılış snap'i / tarih seçici / aktif güne dönüş) sırasında
  // onPageSelected'ın yanlışlıkla "gelecek gün" toast'ı + geri-snap yapmasını önleyen bayrak.
  // Yalnızca kullanıcı ELLE gelecek bir güne kaydırınca toast çıkmalı (#13 + gece yarısı bug).
  const programatikGecisRef = useRef(false);
  // Pager'ın GERÇEKTEN gösterdiği sayfa indeksi. `mevcutSayfaIndeksi` state'ini
  // izleyen bir effect ile senkronlanmaz — o effect bu dosyada daha ÖNCE tanımlı
  // olduğu için mount turunda açılış effect'inden önce çalışır ve ref'i "bugün"e
  // geri yazardı; açılış effect'i de pager zaten aktif gündeyken gereksiz bir
  // sayfa komutu gönderip programatik bayrağı ASILI bırakırdı (bayrak ancak bir
  // onPageSelected ile tüketilir; komut sayfayı değiştirmediği için o olay hiç
  // gelmez) → kullanıcının bir sonraki elle kaydırmasındaki "gelecek gün" uyarısı
  // yutulurdu. Bu yüzden ref, sayfanın değiştiği ÜÇ yerde elle yazılır.
  const mevcutSayfaIndeksiRef = useRef(BASLANGIC_SAYFA_INDEKSI);
  /** İlk render mı? Açılış sayfası state'ini bir kez hizalamak için. */
  const ilkKareRef = useRef(true);

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

    // YEREL takvim günü: `new Date('YYYY-MM-DD')` UTC gece yarısı olarak okunur ve UTC'nin
    // gerisindeki saat dilimlerinde adhan ÖNCEKİ günün vakitlerini hesaplar (AGENTS.md).
    const date = ISOTarihiDateNesnesiNeCevir(mevcutTarih);
    const coordinates = new Coordinates(konumAyarlari.koordinatlar.lat, konumAyarlari.koordinatlar.lng);
    const params = turkiyeHesapParametreleri();
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
      const params = turkiyeHesapParametreleri();
      const prayerTimes = new PrayerTimes(coordinates, now, params);
      imsakZamani = prayerTimes.fajr;
    }

    return aktifGunuHesapla(bugun, now, imsakZamani, gunEkle(bugun, -1));
  }, [konumAyarlari.koordinatlar, vakitBilgisi?.vakit]); // vakitBilgisi.vakit degisince aktif gun yeniden hesaplanir (imsak gecisi = yeni gun)

  // Nafile satırları (issue #77): "Günlük Akış" zincirinde kendi farzlarının ardına
  // girer. Pencereler AKTİF GÜN tabanlı (gece yarısı sonrası = dün). Ekran saniyede
  // bir çizildiği için dizi DAKİKA anahtarıyla memo'lanır: VakitAkisi memo'su yalnız
  // dakika dönünce (aktif/geçti durumu değişebilir) kırılır.
  const { pencereler: nafilePencereleri } = useNafilePencereleri(aktifGun);
  const nafileDakikasi = Math.floor(Date.now() / 60000);
  // Gösterge NAFİLE BAŞINADIR (`gosterge`); `gostergeAktif` "en az biri açık" türevidir.
  const { gostergeAktif: nafileGostergesi, gosterge: nafileGosterge, teheccud: nafileTeheccud } = nafileAyarlari;
  const nafileSatirlari = useMemo(
    () =>
      nafileGostergesi
        ? nafileZincirSatirlariOlustur(
            nafilePencereleri,
            new Date(nafileDakikasi * 60000),
            nafileTeheccud.pencere,
            nafileGosterge
          )
        : undefined,
    [nafileGostergesi, nafileGosterge, nafilePencereleri, nafileDakikasi, nafileTeheccud.pencere]
  );

  // Pager'ın AÇILIŞ sayfası: aktif gün (gece yarısından sonra yatsı sürerken = dün).
  // Önceden `initialPage` sabit "bugün" idi ve doğru sayfaya mount effect'indeki
  // setPageWithoutAnimation ile geçilmeye çalışılıyordu; PagerView'a mount anında
  // gönderilen bu imperatif komut native tarafta layout'tan önce geldiği için
  // yutulabiliyor ve uygulama gece yarısından sonra BUGÜN'de açılıyordu. Doğru
  // sayfada DOĞMAK, sonradan düzeltmeye çalışmaktan sağlamdır. İlk render'da
  // dondurulur — sonraki gün geçişleri pager'ı kendiliğinden kaydırmamalı.
  const ilkSayfaIndeksiRef = useRef<number | null>(null);
  if (ilkSayfaIndeksiRef.current === null) {
    ilkSayfaIndeksiRef.current = tarihiSayfaIndeksineCevir(aktifGun);
    // Pager bu sayfada DOĞACAK; ref'i baştan doğru değere kur, yoksa mount
    // effect'i "sayfa değişmeli" sanıp gereksiz komut gönderir ve programatik
    // bayrağı asılı bırakır.
    mevcutSayfaIndeksiRef.current = ilkSayfaIndeksiRef.current;
  }
  const ilkSayfaIndeksi = ilkSayfaIndeksiRef.current;

  // Pager açılış sayfasında DOĞDUĞU için sayfa indeksi state'i de ilk render'da
  // oraya çekilir. Yoksa gece yarısı senaryosunda (pager 89, state 90) mount
  // effect'i state'i düzeltene kadar sayfa `mevcutSayfaMi` kapısına takılıp BOŞ
  // çizilirdi — kullanıcı kısa bir boş kare görürdü.
  if (ilkKareRef.current) {
    ilkKareRef.current = false;
    if (mevcutSayfaIndeksi !== ilkSayfaIndeksi) setMevcutSayfaIndeksi(ilkSayfaIndeksi);
  }

  // ---- Tarih seçici (DateTimePicker) ----
  // DİKKAT — bu üç değer ve geri çağrı STABİL olmak ZORUNDA. RNDateTimePickerAndroid
  // dialog'u `[onChange, value.getTime(), mode]` bağımlılıklı bir effect içinde açar
  // (node_modules/@react-native-community/datetimepicker/src/datetimepicker.android.js).
  // Ana ekran geri sayım sayacı yüzünden SANİYEDE BİR re-render olduğundan, inline bir
  // ok fonksiyonu her saniye yeni referans üretiyor → dialog yeniden açılıyor ve
  // kullanıcının seçtiği gün `value`ya (= bugün) geri dönüyordu. Kullanıcı bunu
  // "seçiyorum, 1-2 sn sonra kendiliğinden bugüne dönüyor" diye yaşadı.
  const tarihSeciciDegeri = useMemo(() => ISOTarihiDateNesnesiNeCevir(mevcutTarih), [mevcutTarih]);
  const tarihSeciciEnEski = useMemo(
    () => ISOTarihiDateNesnesiNeCevir(gunEkle(bugunuAl(), -GECMIS_GUN_SAYISI)),
    []
  );
  const tarihSeciciEnYeni = useMemo(() => {
    const sinir = ISOTarihiDateNesnesiNeCevir(aktifGun);
    sinir.setHours(23, 59, 59, 999);
    return sinir;
  }, [aktifGun]);

  const handleTarihSecildi = useCallback((event: DateTimePickerEvent, date?: Date) => {
    setTarihSeciciGorunur(Platform.OS === 'ios');
    if (event.type === 'dismissed' || !date) {
      return;
    }

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
    if (indeks !== mevcutSayfaIndeksiRef.current) {
      programatikGecisRef.current = true;
      pagerRef.current?.setPage(indeks);
      setMevcutSayfaIndeksi(indeks);
      mevcutSayfaIndeksiRef.current = indeks;
    }
  }, [aktifGun, dispatch, namazlariGetir, tarihiSayfaIndeksineCevir]);

  // Initial Load - Aktif güne git
  useEffect(() => {
    namazlariGetir(aktifGun);
    // Aktif gün gösterilen günden farklıysa (gece yarısı: yatsı sürerken aktif gün dün)
    // doğrudan aktif güne yerleş. setPageWithoutAnimation ile GÖRÜNÜR zıplama olmaz; ayrıca
    // programatikGecisRef set edilerek onPageSelected'ın "gelecek gün" toast'ı bastırılır
    // (pager initialPage=bugün iken aktif gün dün olunca yanlış toast çıkıyordu).
    if (aktifGun !== mevcutTarih) {
      const yeniIndeks = tarihiSayfaIndeksineCevir(aktifGun);
      dispatch(tarihiDegistir(aktifGun));
      setMevcutSayfaIndeksi(yeniIndeks);
      // Pager zaten hedef sayfadaysa (açılış: initialPage = aktif gün) komut GÖNDERME:
      // setPage event üretmeyeceği için programatik bayrak asılı kalır ve kullanıcının
      // bir sonraki elle kaydırmasındaki uyarıyı yutardı.
      if (yeniIndeks !== mevcutSayfaIndeksiRef.current) {
        programatikGecisRef.current = true;
        pagerRef.current?.setPageWithoutAnimation(yeniIndeks);
      }
      mevcutSayfaIndeksiRef.current = yeniIndeks;
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

  // Sade görünüm (issue #295) daima AKTİF GÜNÜ işaretler. Kullanıcı geçmiş bir güne
  // bakarken açtıysa gösterilen gün aktif güne çekilir; pager sade görünümde ÇİZİLMEZ,
  // normal görünüme dönünce DOĞRU sayfada doğsun diye açılış indeksi de güncellenir
  // (pager mount'ta imperatif komutla düzeltilmez — AGENTS.md).
  useEffect(() => {
    if (!sade.etkin) return;
    const indeks = tarihiSayfaIndeksineCevir(aktifGun);
    ilkSayfaIndeksiRef.current = indeks;
    mevcutSayfaIndeksiRef.current = indeks;
    programatikGecisRef.current = false;
    setMevcutSayfaIndeksi(indeks);
    if (mevcutTarih !== aktifGun) {
      dispatch(tarihiDegistir(aktifGun));
      namazlariGetir(aktifGun);
    }
  }, [sade.etkin, aktifGun, mevcutTarih, dispatch, namazlariGetir, tarihiSayfaIndeksineCevir]);

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
        setMuhafizDurumu(prev => prev.seviye !== 0 || prev.mesaj !== '' ? { mesaj: '', seviye: 0 } : prev);
      }
      oncekiVakitRef.current = bilgi?.vakit || null;

      // Fonksiyonel guncelleme ile vakit bilgisi degismediyse bail out (onceki referansi dondur)
      setVakitBilgisi(prev => {
         if (!prev && !bilgi) return prev;
         if (prev && bilgi && prev.vakit === bilgi.vakit && prev.sonrakiVakitGiris === bilgi.sonrakiVakitGiris) return prev;
         return bilgi;
      });

      if (bilgi) {
        const simdi = new Date();
        const hedef = new Date(bilgi.sonrakiVakitGiris);
        let fark = hedef.getTime() - simdi.getTime();

        if (fark < 0) fark = 0;

        const saat = Math.floor(fark / (1000 * 60 * 60));
        const dakika = Math.floor((fark % (1000 * 60 * 60)) / (1000 * 60));
        const saniye = Math.floor((fark % (1000 * 60)) / 1000);

        const yeniKalanSureStr = `${saat.toString().padStart(2, '0')}:${dakika.toString().padStart(2, '0')}:${saniye.toString().padStart(2, '0')}`;

        // Eger kalan sure stringi ayniysa re-render'dan kacin
        setKalanSureStr(prev => prev === yeniKalanSureStr ? prev : yeniKalanSureStr);
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
      // Faz 3: banner da vakit x seviye matrisinden okur (matris yoksa eski alanlardan türetilir).
      muhafiz.yapilandir(muhafizMatrisiniCoz(muhafizAyarlari));
      // ÖNCE diskteki kılınmışlık kaydını yükle, SONRA başlat. Aksi halde açılışta
      // bellek-içi map boş olur ve zaten kılınmış namaza vakte kısa süre kala (seviye >= 3)
      // çan sesi çalardı (#92). baslat() ilk kontrolEt'i hemen çağırdığından sıra önemli.
      muhafiz.acilistaKilinanlariYukle().finally(() => {
        if (iptalEdildi) return;
        muhafiz.baslat((mesaj, seviye, bildirimSesi, sistemAlarmi) => {
          setMuhafizDurumu({ mesaj, seviye });
          // Gerçek alarm (issue #74) bu dakikada kendi sesini çalar: ikinci ses/titreşim YOK.
          if (sistemAlarmi) return;
          if (seviye >= 3) {
            HaptikServisi.gucluTitresim();
            // ADIMIN KENDİ SESİ çalınır. Eskiden burada `SesServisi.bildirimSesiCal()`
            // vardı: paketlenmiş `bildirim.mp3`'ü çalıyor, seviyenin `bildirimSesi`
            // alanını hiç okumuyordu → aynı adım uygulama AÇIKKEN varsayılan çan,
            // KAPALIYKEN (kanal sesi) kullanıcının seçtiği ses ile duyuluyordu.
            //
            // iOS'TA ÇALINMAZ — ÇİFT SES KURALI. iOS'ta zamanlanmış bildirim
            // uygulama ÖN PLANDAYKEN DE teslim edilir ve kendi sesini çalar;
            // burada bir ses daha çalsaydı aynı uyarı iki kez duyulurdu.
            // Banner yine çizilir, titreşim yine olur. Kuralın diğer yarısı
            // `NamazMuhafiziServisi.onPlanAnonsuPlanla` içinde.
            if (Platform.OS !== 'ios') {
              void OnizlemeSesServisi.bildirimSesiniCal(bildirimSesi ?? VARSAYILAN_SES);
            }
          }
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
        setMekruhBilgi({ mekruhMu: sonuc.mekruhMu, aciklama: sonuc.aciklama, tur: sonuc.tur });
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
    // Kaza önerisi (issue #294): yalnız aktif günün o anki vaktinde, kerahat dışında,
    // borç varsa sorar. Geri almada (tamamlandi=false) bekleyen değerlendirmeyi iptal eder.
    void kazaOnerisi.degerlendir({
      kilinanNamaz: namazAdi,
      tamamlandi,
      gosterilenGun: mevcutTarih,
      aktifGun,
      suankiVakitNamazi: vakitBilgisi?.vakit ? servisToNamazAdi[vakitBilgisi.vakit] ?? null : null,
      koordinat: konumAyarlari.koordinatlar,
    });
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
            const matris = muhafizMatrisiniCoz(muhafizState);
            await VakitSayacBildirimServisi.getInstance().yapilandirVePlanla({
              aktif: true,
              koordinatlar: konumState.koordinatlar,
              baslangicEsikleri: sayacBaslangicEsikleriHesapla(
                state.vakitSayac?.ayarlar?.sayacBaslangicSeviyesi,
                matris
              ),
              muhafizAktif: muhafizState.aktif,
              muhafizUyarilanVakitler: muhafizUyarilanVakitleriBul(matris),
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

  // "Kıldım" (vakit kartı + sade görünüm; ikisi de React.memo'lu düğme) için
  // referans-kararlı geri çağrı: ekran saniyede bir çizilir. AYNI yol —
  // suankiVakitTamamla → namazToggle → kerahat onay modalı.
  const suankiVakitTamamlaRef = useRef(suankiVakitTamamla);
  suankiVakitTamamlaRef.current = suankiVakitTamamla;
  const handleSuankiKildim = useCallback(() => suankiVakitTamamlaRef.current(), []);

  // Vakit kartından GERİ ALMA (kılındı → kılınmadı): kullanıcı listeye inmeden işareti
  // kaldırabilsin. Aynı `namazToggle` yolu (false yönü kerahat onayı istemez; muhafız ve
  // sayaç geri alımı namazIsaretle'de). Ref ile referans-kararlı (saniyelik çizim).
  const suankiVakitGeriAl = () => {
    if (vakitBilgisi && vakitBilgisi.vakit) {
      const namazAdi = servisToNamazAdi[vakitBilgisi.vakit];
      if (namazAdi) {
        namazToggle(namazAdi, false);
      }
    }
  };
  const suankiVakitGeriAlRef = useRef(suankiVakitGeriAl);
  suankiVakitGeriAlRef.current = suankiVakitGeriAl;
  const handleSuankiGeriAl = useCallback(() => suankiVakitGeriAlRef.current(), []);

  // Toplu islemler gunlukNamazlar'i degistirir -> useEffect (seriKontrolet -> reconcile) otomatik kosar
  const tumunuTamamla = () => dispatch(tumNamazlariTamamla({ tarih: mevcutTarih }));
  const tumunuSifirla = () => dispatch(tumNamazlariSifirla({ tarih: mevcutTarih }));

  // Tek durum alanının adayları (öncelik sırasını DurumAlani verir). Kerahat, muhafız ve
  // seferîlik yalnız aktif günde anlamlıdır; toparlanma her günde.
  // Renkler dekoratif token (kenar çizgisi + ikon çipi); metin daima tema metni.
  const toparlanma = seriOzeti?.toparlanmaModu ? seriOzeti.toparlanmaIlerleme : undefined;
  // Kerahat metni duruma göre (saf karar): gurubda bugünün ikindisi kılınmadıysa
  // "bekleyin" değil "şimdi kılabilirsiniz" (core/anaEkran/kerahatNotu). Kayıt aktif güne
  // ait değilse ikindi durumu bilinmiyor sayılır (servisin metni kalır).
  const ikindiKilindi =
    gunlukNamazlar && gunlukNamazlar.tarih === aktifGun
      ? !!gunlukNamazlar.namazlar.find((n) => n.namazAdi === NamazAdi.Ikindi)?.tamamlandi
      : null;
  const kerahatMetni = kerahatMetniSec({ aciklama: mekruhBilgi.aciklama, tur: mekruhBilgi.tur, ikindiKilindi });
  const durumOgeleriOlustur = (aktifGunKontrol: boolean, suankiTamamlandi: boolean): DurumAlaniOgesi[] => {
    const ogeler: DurumAlaniOgesi[] = [];
    const kerahatEtkin = aktifGunKontrol && mekruhBilgi.mekruhMu && !!kerahatMetni;
    const muhafizEtkin = aktifGunKontrol && muhafizDurumu.seviye > 0 && !suankiTamamlandi;
    // İkisi birlikteyse TEK kart: muhafız önde, kerahat altında kısa not.
    const { muhafizKerahatNotu } = durumlariBirlestir([
      ...(kerahatEtkin ? (['kerahat'] as const) : []),
      ...(muhafizEtkin ? (['muhafiz'] as const) : []),
    ]);
    if (kerahatEtkin && !muhafizKerahatNotu) {
      ogeler.push({
        anahtar: 'kerahat',
        ozet: 'kerahat vakti',
        dugum: <DurumSeridi testID="durum-kerahat" ikon="hourglass-half" renk={renkler.dikkat} baslik="Kerahat vakti" metin={kerahatMetni} />,
      });
    }
    if (muhafizEtkin) {
      // Mesaj servisten gelir ve ibadete çağrı kaydındadır ("sen" dili BİLİNÇLİ) — dokunulmaz.
      const sert = muhafizDurumu.seviye >= 3;
      ogeler.push({
        anahtar: 'muhafiz',
        ozet: 'vakit çıkıyor',
        dugum: (
          <DurumSeridi
            testID="durum-muhafiz"
            ikon="exclamation-triangle"
            renk={sert ? renkler.hata : renkler.dikkat}
            baslik={sert ? 'Şeytanla mücadele modu' : 'Vakit çıkıyor'}
            metin={muhafizDurumu.mesaj}
            alt={
              muhafizKerahatNotu ? (
                <View testID="durum-muhafiz-kerahat-notu" style={{ flexDirection: 'row', marginTop: 6 }}>
                  <Text style={{ fontSize: 13, lineHeight: 18, color: renkler.metin }}>{`Kerahat vakti: ${kerahatMetni}`}</Text>
                </View>
              ) : undefined
            }
          />
        ),
      });
    }
    if (toparlanma) {
      const oran = toparlanma.hedef > 0 ? Math.min(1, toparlanma.tamamlanan / toparlanma.hedef) : 0;
      ogeler.push({
        anahtar: 'toparlanma',
        ozet: 'toparlanma',
        dugum: (
          <DurumSeridi
            testID="durum-toparlanma"
            ikon="bolt"
            renk={renkler.birincil}
            baslik={`Toparlanma · ${toparlanma.tamamlanan}/${toparlanma.hedef} gün`}
            onPress={handleToparlanmaModalGoster}
            erisimEtiketi={`Toparlanma, ${toparlanma.tamamlanan} / ${toparlanma.hedef} gün tamamlandı. Ayrıntılar için dokunun`}
            alt={
              <View style={{ height: 4, marginTop: 8, borderRadius: 2, backgroundColor: renkler.sinir, overflow: 'hidden' }}>
                <View style={{ height: 4, width: `${oran * 100}%`, backgroundColor: renkler.birincil }} />
              </View>
            }
          />
        ),
      });
    }
    if (aktifGunKontrol && seferilikGorunur) {
      ogeler.push({ anahtar: 'seferilik', ozet: 'yolculuk bilgisi', dugum: <SeferilikBilgiKarti /> });
    }
    return ogeler;
  };

  // Sayfa içeriği render
  const sayfaIcerigiOlustur = (sayfaIndeksi: number) => {
    const sayfaTarihi = sayfaIndeksiniTariheCevir(sayfaIndeksi);
    const mevcutSayfaMi = sayfaIndeksi === mevcutSayfaIndeksi;

    if (!mevcutSayfaMi || !gunlukNamazlar) return <View key={sayfaIndeksi} className="flex-1" />;

    const tamamlanan = gunlukNamazlar.namazlar.filter(n => n.tamamlandi).length;
    const toplam = gunlukNamazlar.namazlar.length;
    const aktifGunKontrol = sayfaTarihi === aktifGun;
    // Gosterilen gunun tarihi (Date) — cuma etiketi BU gune gore hesaplanir;
    // `new Date()` kullanilsaydi gecmis gune bakarken yanlis etiket cikardi.
    const sayfaTarihiDate = ISOTarihiDateNesnesiNeCevir(sayfaTarihi);

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
          // Yatsı zincirin son vaktidir; çıkışı ertesi imsaktır ve servis onu
          // `vakitBilgisi.saat` olarak zaten verir ("..." yazmak bitişi gizliyordu).
          const cikis = vakitBilgisi.saat;
          vakitAraligi = `${suankiNamaz.saat} - ${cikis.getHours().toString().padStart(2, '0')}:${cikis.getMinutes().toString().padStart(2, '0')}`;
        }
      }
    }

    // Üst bölüm (uyarı bantları + şu anki vakit kartı) ile akış AYRI düğümlerdir:
    // telefonda tek sütunda alt alta, katlanabilir/tablette iki bölmede yan yana
    // çizilir (issue #283). Bileşenler ve prop'ları iki düzende AYNIDIR.
    // Uyarı bantları: telefonda/iki bölmede vakit kartının ÜSTÜNDE, masaüstü
    // postüründe alt yarıda akışın üstünde (dik yarı yalnız geri sayımı taşır).
    const bantlar = (
      <>
        <KutlamaAnimasyonu gorunsun={kutlamaGoster} boyut={300} animasyonBittiCallback={() => setKutlamaGoster(false)} />

        {/* TEK durum alanı (sade tasarım, Dalga 2): aynı anda yalnız en önemli uyarı,
            diğerleri "+N daha" arkasında. Öncelik: core/anaEkran/durumAlani. */}
        <DurumAlani ogeler={durumOgeleriOlustur(aktifGunKontrol, suankiVakitTamamlandi)} />
      </>
    );

    const gecmisGunKarti = (
      <View className="mb-6 p-6 rounded-3xl items-center justify-center border"
        style={{ backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }}>
        <Text className="text-xl font-bold" style={{ color: renkler.metin }}>
          {tarihiGorunumFormatinaCevir(sayfaTarihi)}
        </Text>
        <Text className="text-sm mt-2" style={{ color: renkler.metinIkincil }}>
          Geçmiş gün görüntüleniyor
        </Text>
      </View>
    );
    const gorunenVakitAdi = namazGorunenAdi(suankiVakitAdi, sayfaTarihiDate, cumaEtiketi);

    const ustBolum = (
      <>
        {bantlar}

        {/* Ana Vakit Kartı (Hero) - Sadece aktif gün gösterilir */}
        {aktifGunKontrol ? (
          <VakitKarti
            vakitBilgisi={vakitBilgisi}
            kalanSureStr={kalanSureStr}
            suankiVakitAdi={suankiVakitAdi}
            vakitAraligi={vakitAraligi}
            tamamlandi={suankiVakitTamamlandi}
            kayitHazir={gunlukNamazlar.tarih === sayfaTarihi}
            onTamamla={handleSuankiKildim}
            onGeriAl={handleSuankiGeriAl}
            kayitKimligi={`${sayfaTarihi}_${suankiVakitAdi}`}
            kilitli={kilitli}
            konumModu={konumAyarlari.konumModu}
            konumMetni={konumMetni}
            onKonumYenile={konumYenile.yenile}
            konumYenileniyor={konumYenile.yenileniyor}
            gorunenVakitAdi={gorunenVakitAdi}
          />
        ) : (
          gecmisGunKarti
        )}

      </>
    );

    const akis = (
      <>
        {/* Akış Listesi — memo'lu: gün ISO dizesiyle geçer ki saniyelik geri sayım
            render'ı memo'yu kırmasın. "Vakit geçti mi" içeride `new Date()` okur ama
            satır yalnız prop değişince yeniden çizilir; doğruluk, satır saatlerinin
            (`uiNamazlar`) servisle aynı adhan parametrelerinden gelmesine ve vakit
            girince `suankiVakitAdi`'nin değişip yeniden çizimi tetiklemesine bağlıdır. */}
        <VakitAkisi
          namazlar={uiNamazlar}
          suankiVakitAdi={aktifGunKontrol ? suankiVakitAdi : ''}
          tamamlananSayisi={tamamlanan}
          toplamSayi={toplam}
          onVakitTikla={handleVakitTikla}
          aktifGunMu={aktifGunKontrol}
          kilitli={kilitli}
          gunTarihiIso={sayfaTarihi}
          cumaEtiketi={cumaEtiketi}
          // Nafile yalnız aktif günde: geçmiş günde "şu an vakti girdi" anlamsız.
          nafileSatirlari={aktifGunKontrol ? nafileSatirlari : undefined}
        />
      </>
    );

    if (gunDuzeni === 'masaustu') {
      // Masaüstü postürü: dik duran üst yarı salt gösterimdir (büyük geri sayım);
      // "Kıldım" masadaki alt yarıdan, akış satırından işaretlenir.
      const masaustuUst = aktifGunKontrol ? (
        <MasaustuGeriSayim
          vakitAdi={gorunenVakitAdi}
          kalanSureStr={kalanSureStr}
          vakitAraligi={vakitAraligi}
          tamamlandi={suankiVakitTamamlandi}
          kilitli={kilitli}
        />
      ) : (
        <View className="flex-1 justify-center px-5">{gecmisGunKarti}</View>
      );
      return (
        <GunSayfasiDuzeni
          key={sayfaIndeksi}
          duzen="masaustu"
          ustBolum={ustBolum}
          akis={akis}
          masaustuUst={masaustuUst}
          masaustuBantlar={bantlar}
          mentese={katlanmaPosturu.mentese}
        />
      );
    }

    return <GunSayfasiDuzeni key={sayfaIndeksi} duzen={gunDuzeni} ustBolum={ustBolum} akis={akis} />;
  };

  // Sade görünüm ayarı diskten okunmadan karar verilmez (normal ekran bir an görünüp
  // sade görünüme zıplamasın).
  if (!sade.yuklendi) return <View className="flex-1 justify-center items-center" style={{ backgroundColor: renkler.arkaplan }}><YuklemeGostergesi mesaj="Yükleniyor..." /></View>;

  // ---- Sade görünüm (issue #295): tek ekran; işaretleme ve modallar ana ekranla AYNI ----
  if (sade.etkin) {
    const sadeKayitHazir = !!gunlukNamazlar && gunlukNamazlar.tarih === aktifGun;
    const sadeNamazAdi = vakitBilgisi?.vakit ? servisToNamazAdi[vakitBilgisi.vakit] : undefined;
    const sadeTamamlandi =
      sadeKayitHazir && !!gunlukNamazlar.namazlar.find(n => n.namazAdi === sadeNamazAdi)?.tamamlandi;
    return (
      <View className="flex-1" style={{ backgroundColor: renkler.arkaplan }}>
        <StatusBar backgroundColor={renkler.arkaplan} barStyle={koyuMu ? 'light-content' : 'dark-content'} />
        <SadeGorunum
          vakit={vakitBilgisi?.vakit ?? null}
          giris={vakitBilgisi?.giris ?? null}
          sonrakiGirisIso={vakitBilgisi?.sonrakiVakitGiris || null}
          sonrakiVakit={(vakitBilgisi?.sonrakiVakitAdi as VakitBilgisi['vakit'] | undefined) ?? null}
          tamamlandi={sadeTamamlandi}
          kayitHazir={sadeKayitHazir}
          mekruhMu={mekruhBilgi.mekruhMu}
          cumaEtiketi={cumaEtiketi}
          onKildim={handleSuankiKildim}
          onTumUygulama={sade.tumUygulamayiAc}
        />
        <KutlamaModal kutlama={ilkKutlama} gorunur={!!ilkKutlama} onKapat={() => dispatch(kutlamayiKaldir())} />
        <KazaOneriModal
          gorunur={kazaOnerisi.oneri !== null && !ilkKutlama}
          kilinanFarz={kazaOnerisi.oneri?.kilinanFarz ?? null}
          kazaNamazi={kazaOnerisi.oneri?.kazaNamazi ?? null}
          isleniyor={kazaOnerisi.isleniyor}
          onKildim={kazaOnerisi.kildim}
          onSimdiDegil={kazaOnerisi.simdiDegil}
          onBirDahaSorma={kazaOnerisi.birDahaSorma}
        />
        <KerahatOnayModal
          gorunur={kerahatOnayBekleyen !== null}
          aciklama={kerahatMetni}
          namazAdi={kerahatOnayBekleyen ?? ''}
          onOnayla={kerahatOnayla}
          onVazgec={kerahatVazgec}
        />
      </View>
    );
  }

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
        toparlanmaModu={seriOzeti?.toparlanmaModu}
        toparlanmaIlerleme={seriOzeti?.toparlanmaIlerleme}
      />

      {/* Sade görünümden bu oturum için çıkıldıysa geri dönüş (issue #295). Uyarı değil,
          kalıcı küçük bağlantı: durum alanında "+N daha" arkasında kaybolmasın. */}
      {sade.geciciCikista && (
        <TouchableOpacity
          onPress={sade.sadeyeDon}
          accessibilityRole="button"
          accessibilityLabel="Sade görünüme dönün"
          testID="sade-donus-baglantisi"
          style={{ alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', minHeight: 44, paddingHorizontal: 16 }}
        >
          <FontAwesome5 name="compress-alt" size={12} color={renkler.birincil} style={{ marginRight: 6 }} />
          <Text style={{ fontSize: 14, fontWeight: '600', color: renkler.birincil }}>Sade görünüme dönün</Text>
        </TouchableOpacity>
      )}

      {/* Pager */}
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={ilkSayfaIndeksi}
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
            kisaBildirimGoster('Gelecek günlere gidemezsiniz');
            // Aktif gune geri don
            programatikGecisRef.current = true;
            pagerRef.current?.setPage(tarihiSayfaIndeksineCevir(aktifGun));
            return;
          }

          setMevcutSayfaIndeksi(yeniIndeks);
          mevcutSayfaIndeksiRef.current = yeniIndeks;
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
          value={tarihSeciciDegeri}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={tarihSeciciEnEski}
          maximumDate={tarihSeciciEnYeni}
          onChange={handleTarihSecildi}
        />
      )}
      <KutlamaModal kutlama={ilkKutlama} gorunur={!!ilkKutlama} onKapat={() => dispatch(kutlamayiKaldir())} />

      {/* Kerahat (mekruh) vaktinde işaretleme öncesi kibar onay (issue #82) */}
      {/* Kutlama modalı açıkken beklesin; kapanınca görünür (iki modal üst üste binmesin). */}
      <KazaOneriModal
        gorunur={kazaOnerisi.oneri !== null && !ilkKutlama}
        kilinanFarz={kazaOnerisi.oneri?.kilinanFarz ?? null}
        kazaNamazi={kazaOnerisi.oneri?.kazaNamazi ?? null}
        isleniyor={kazaOnerisi.isleniyor}
        onKildim={kazaOnerisi.kildim}
        onSimdiDegil={kazaOnerisi.simdiDegil}
        onBirDahaSorma={kazaOnerisi.birDahaSorma}
      />

      <KerahatOnayModal
        gorunur={kerahatOnayBekleyen !== null}
        aciklama={kerahatMetni}
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
