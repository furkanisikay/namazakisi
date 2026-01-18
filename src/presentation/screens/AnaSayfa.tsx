/**
 * Ana sayfa ekrani
 */

import * as React from 'react';
import { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Platform,
  TouchableOpacity,
  Animated,
  Easing,
  StatusBar,
  ScrollView,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  namazlariYukle,
  namazDurumunuDegistir,
  tumNamazlariTamamla,
  tumNamazlariSifirla,
  tarihiDegistir,
} from '../store/namazSlice';
import {
  seriVerileriniYukle,
  seriKontrolet,
  namazKilindiPuanla,
  kutlamayiKaldir,
  seriOzetiSelector,
  ilkKutlamaSelector,
  ozelGunBitir,
  ozelGunIptal,
} from '../store/seriSlice';
import {
  DaireselProgress,
  NamazGrid,
  MotivasyonBanner,
  AnimasyonluButon,
  YuklemeGostergesi,
  KutlamaAnimasyonu,
  SeriAtesiKarti,
  ToparlanmaKarti,
  OzelGunKarti,
  KutlamaModal,
  KalanSureSayaci,
  AnimasyonluSayac,
} from '../components';
import { NamazAdi } from '../../core/constants/UygulamaSabitleri';
import {
  bugunuAl,
  tarihiGorunumFormatinaCevir,
  gunAdiniAl,
  bugunMu,
  tarihiISOFormatinaCevir,
  gunEkle,
} from '../../core/utils/TarihYardimcisi';
import { useRenkler, useTema } from '../../core/theme';
import { useFeedback } from '../../core/feedback';
import { NamazMuhafiziServisi } from '../../domain/services/NamazMuhafiziServisi';
import { NamazVaktiHesaplayiciServisi, VakitBilgisi } from '../../domain/services/NamazVaktiHesaplayiciServisi';
import { ArkaplanMuhafizServisi } from '../../domain/services/ArkaplanMuhafizServisi';
import { ArkaplanGorevServisi } from '../../domain/services/ArkaplanGorevServisi';
import { muhafizAyarlariniYukle } from '../store/muhafizSlice';
import { BildirimServisi } from '../../domain/services/BildirimServisi';
import { HaptikServisi } from '../../core/feedback/HaptikServisi';
import { SesServisi } from '../../core/feedback/SesServisi';

// Baslangic sayfasi (ortada)
const BASLANGIC_SAYFA_INDEKSI = 1000;

export const AnaSayfa: React.FC = () => {
  const dispatch = useAppDispatch();
  const pagerRef = useRef<PagerView>(null);
  const renkler = useRenkler();
  const { koyuMu } = useTema();
  const { tumNamazlarTamamlandiFeedback, butonTiklandiFeedback } = useFeedback();

  const [mevcutSayfaIndeksi, setMevcutSayfaIndeksi] = useState(BASLANGIC_SAYFA_INDEKSI);
  const [tarihSeciciGorunur, setTarihSeciciGorunur] = useState(false);
  const [kutlamaGoster, setKutlamaGoster] = useState(false);
  const [muhafizDurumu, setMuhafizDurumu] = useState<{ mesaj: string, seviye: number }>({ mesaj: '', seviye: 0 });
  const [vakitBilgisi, setVakitBilgisi] = useState<VakitBilgisi | null>(null);

  // Animasyon degerleri - useNativeDriver: false cunku opacity ve translateY interpolate kullaniliyor
  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  const {
    mevcutTarih,
    gunlukNamazlar,
    yukleniyor,
    guncelleniyor,
    hata,
  } = useAppSelector(state => state.namaz);
  const { kullanici } = useAppSelector(state => state.auth);

  // Seri state
  const { seriDurumu, bekleyenKutlamalar, ozelGunAyarlari } = useAppSelector(state => state.seri);
  const seriOzeti = useAppSelector(seriOzetiSelector);
  const ilkKutlama = useAppSelector(ilkKutlamaSelector);

  // Onceki tamamlanan sayisi (kutlama icin)
  const oncekiTamamlananRef = useRef<number>(0);

  // Giris animasyonlari - useNativeDriver: false cunku interpolate kullaniliyor
  useEffect(() => {
    Animated.stagger(150, [
      Animated.spring(headerAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: false,
      }),
      Animated.spring(contentAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  // Sayfa indeksini tarihe cevir
  const sayfaIndeksiniTariheCevir = useCallback((sayfaIndeksi: number): string => {
    const gunFarki = sayfaIndeksi - BASLANGIC_SAYFA_INDEKSI;
    return gunEkle(bugunuAl(), gunFarki);
  }, []);

  // Tarihi sayfa indeksine cevir
  const tarihiSayfaIndeksineCevir = useCallback((tarih: string): number => {
    const bugun = new Date(bugunuAl());
    const hedefTarih = new Date(tarih);
    const gunFarki = Math.round((hedefTarih.getTime() - bugun.getTime()) / (1000 * 60 * 60 * 24));
    return BASLANGIC_SAYFA_INDEKSI + gunFarki;
  }, []);

  // Namazlari yukle
  const namazlariGetir = useCallback((tarih: string) => {
    dispatch(namazlariYukle({
      tarih,
    }));
  }, [dispatch, kullanici]);

  // Ilk yukleme
  useEffect(() => {
    const bugun = bugunuAl();
    namazlariGetir(bugun);
    // Seri verilerini de yukle
    dispatch(seriVerileriniYukle());
    // Muhafiz ayarlarini yukle
    dispatch(muhafizAyarlariniYukle());

    // Bildirim izinlerini iste
    BildirimServisi.getInstance().izinIste();

    // Arka plan görevini başlat (telefon restart sonrası için)
    ArkaplanGorevServisi.getInstance().kaydetVeBaslat()
      .then(basarili => {
        if (basarili) {
          console.log('[AnaSayfa] Arka plan görevi başlatıldı');
        }
      })
      .catch(err => console.error('[AnaSayfa] Arka plan görevi hatası:', err));

    return () => {
      try {
        NamazMuhafiziServisi.getInstance().durdur();
      } catch (e) { }
    };
  }, [namazlariGetir, dispatch, kullanici]);

  // Tum namazlar tamamlandiginda kutlama
  // Bug 3 duzeltmesi: tumNamazlarTamamlandiFeedback dependency array'e eklendi
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

  // Sayfa degistiginde
  const sayfaDegistigindeIsle = (e: { nativeEvent: { position: number } }) => {
    const yeniIndeks = e.nativeEvent.position;
    setMevcutSayfaIndeksi(yeniIndeks);
    const yeniTarih = sayfaIndeksiniTariheCevir(yeniIndeks);
    dispatch(tarihiDegistir(yeniTarih));
    namazlariGetir(yeniTarih);
    oncekiTamamlananRef.current = 0; // Sayfa degisince sifirla
  };

  // Tarih seciciden tarih secildiginde
  const tarihSecildigindeIsle = (event: any, seciliTarih?: Date) => {
    setTarihSeciciGorunur(Platform.OS === 'ios');

    if (seciliTarih) {
      const yeniTarih = tarihiISOFormatinaCevir(seciliTarih);
      const yeniIndeks = tarihiSayfaIndeksineCevir(yeniTarih);

      dispatch(tarihiDegistir(yeniTarih));
      namazlariGetir(yeniTarih);
      oncekiTamamlananRef.current = 0;

      pagerRef.current?.setPage(yeniIndeks);
      setMevcutSayfaIndeksi(yeniIndeks);
    }
  };

  // Bugune don
  const buguneDon = async () => {
    await butonTiklandiFeedback();
    const bugun = bugunuAl();
    const bugunIndeks = BASLANGIC_SAYFA_INDEKSI;

    dispatch(tarihiDegistir(bugun));
    namazlariGetir(bugun);
    oncekiTamamlananRef.current = 0;
    pagerRef.current?.setPage(bugunIndeks);
    setMevcutSayfaIndeksi(bugunIndeks);
  };

  // Namaz durumunu degistir
  const namazToggle = async (namazAdi: string, tamamlandi: boolean) => {
    dispatch(namazDurumunuDegistir({
      tarih: mevcutTarih,
      namazAdi: namazAdi as NamazAdi,
      tamamlandi,
    }));

    // Eger namaz tamamlandiysa puan ekle
    if (tamamlandi) {
      dispatch(namazKilindiPuanla({
        namazSayisi: 1,
      }));
      // Muhafiz'a bildir (on plandaki servis icin)
      try {
        NamazMuhafiziServisi.getInstance().namazKilindiIsaretle(namazAdi);
        setMuhafizDurumu({ mesaj: '', seviye: 0 }); // Bildirimi temizle
      } catch (e) { }

      // Arka plan muhafiz bildirimlerini iptal et
      // namazAdi -> vakit adi donusumu
      const vakitDonusumu: Record<string, 'imsak' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi'> = {
        'Sabah': 'imsak',
        'Ogle': 'ogle',
        'Ikindi': 'ikindi',
        'Aksam': 'aksam',
        'Yatsi': 'yatsi',
      };

      const vakitAdi = vakitDonusumu[namazAdi];
      if (vakitAdi) {
        try {
          await ArkaplanMuhafizServisi.getInstance().vakitBildirimleriniIptalEt(vakitAdi);
          console.log(`[AnaSayfa] ${namazAdi} icin arka plan bildirimleri iptal edildi`);
        } catch (e) {
          console.error('[AnaSayfa] Bildirim iptal hatasi:', e);
        }
      }
    }
  };

  // Seri kontrolu - gun degistiginde veya namazlar yuklendiginde
  useEffect(() => {
    if (gunlukNamazlar && bugunMu(mevcutTarih)) {
      // Dunun verilerini almak icin onceki gunu hesapla
      const dun = gunEkle(mevcutTarih, -1);
      // Seri kontrolu yap
      dispatch(seriKontrolet({
        bugunNamazlar: gunlukNamazlar,
        dunNamazlar: null, // Basit implementasyon - dun verisini ayr yerde almak gerekir
      }));
    }
  }, [gunlukNamazlar, mevcutTarih, dispatch, kullanici]);

  const muhafizAyarlari = useAppSelector((state) => state.muhafiz);
  const konumAyarlari = useAppSelector((state) => state.konum);

  // Arka plan muhafiz bildirimleri icin debounce ref
  const arkaplanMuhafizTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const s = NamazVaktiHesaplayiciServisi.getInstance();

    // Vakit hesaplayiciyi her zaman yapılandır (Sayaç için gerekli)
    s.yapilandir({
      latitude: konumAyarlari.koordinatlar.lat,
      longitude: konumAyarlari.koordinatlar.lng,
      method: 'Turkey',
      madhab: 'Hanafi'
    });

    const guncelle = () => {
      const bilgi = s.getSuankiVakitBilgisi();
      setVakitBilgisi(bilgi);
    };

    guncelle();
    const interval = setInterval(guncelle, 60000);

    // Arka plan muhafiz bildirimlerini debounce ile guncelle
    // Kullanici hizli tiklasa bile sadece son ayar uygulanir
    if (arkaplanMuhafizTimeoutRef.current) {
      clearTimeout(arkaplanMuhafizTimeoutRef.current);
    }

    arkaplanMuhafizTimeoutRef.current = setTimeout(async () => {
      console.log('[AnaSayfa] Arka plan muhafiz bildirimleri guncelleniyor (debounced)');
      try {
        // Sıklıklar için varsayılan değerler
        const sikliklar = muhafizAyarlari.sikliklar || { seviye1: 15, seviye2: 10, seviye3: 5, seviye4: 1 };

        await ArkaplanMuhafizServisi.getInstance().yapilandirVePlanla({
          aktif: muhafizAyarlari.aktif,
          koordinatlar: konumAyarlari.koordinatlar,
          esikler: {
            seviye1: muhafizAyarlari.esikler.seviye1,
            seviye1Siklik: sikliklar.seviye1 || 15,
            seviye2: muhafizAyarlari.esikler.seviye2,
            seviye2Siklik: sikliklar.seviye2 || 10,
            seviye3: muhafizAyarlari.esikler.seviye3,
            seviye3Siklik: sikliklar.seviye3 || 5,
            seviye4: muhafizAyarlari.esikler.seviye4,
            seviye4Siklik: sikliklar.seviye4 || 1,
          },
        });
      } catch (err) {
        console.error('[AnaSayfa] Arka plan muhafiz hatasi:', err);
      }
    }, 1000); // 1 saniye bekle, kullanici durunca uygula

    // Muhafiz servisi sadece aktifse başlasın (on plan icin)
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

        // Uygulama açıkken sadece titreşim ve ses ile uyar
        // Bildirim göndermiyoruz çünkü ArkaplanMuhafizServisi zaten zamanlanmış
        // bildirimler gönderiyor - bu çift bildirime neden oluyordu
        if (seviye >= 3) {
          HaptikServisi.gucluTitresim();
          SesServisi.bildirimSesiCal();
        } else {
          HaptikServisi.uyariTitresimi();
        }
      });
    } else {
      muhafiz.durdur();
      setMuhafizDurumu({ mesaj: '', seviye: 0 });
    }

    return () => {
      clearInterval(interval);
      muhafiz.durdur();
      // Debounce timeout'u temizle
      if (arkaplanMuhafizTimeoutRef.current) {
        clearTimeout(arkaplanMuhafizTimeoutRef.current);
      }
    };
  }, [muhafizAyarlari, konumAyarlari.koordinatlar]);

  // Kutlama modalini kapat
  const kutlamaKapat = () => {
    dispatch(kutlamayiKaldir());
  };

  // Tumunu tamamla
  const tumunuTamamla = () => {
    dispatch(tumNamazlariTamamla({
      tarih: mevcutTarih,
    }));
  };

  // Tumunu sifirla
  const tumunuSifirla = () => {
    dispatch(tumNamazlariSifirla({
      tarih: mevcutTarih,
    }));
  };

  // Tarih etiketi
  const getTarihEtiketi = (tarih: string) => {
    const bugun = new Date(bugunuAl());
    const hedefTarih = new Date(tarih);
    const gunFarki = Math.round((hedefTarih.getTime() - bugun.getTime()) / (1000 * 60 * 60 * 24));

    if (gunFarki === 0) return 'Bugun';
    if (gunFarki === -1) return 'Dun';
    if (gunFarki === 1) return 'Yarin';
    return gunAdiniAl(tarih);
  };

  // Istatistikler
  const tamamlanan = gunlukNamazlar?.namazlar.filter(n => n.tamamlandi).length || 0;
  const toplam = gunlukNamazlar?.namazlar.length || 5;
  const yuzde = toplam > 0 ? Math.round((tamamlanan / toplam) * 100) : 0;
  const bugunMuKontrol = bugunMu(mevcutTarih);
  const tarihEtiketi = getTarihEtiketi(mevcutTarih);

  // Sayfa icerigi olustur
  const sayfaIcerigiOlustur = (sayfaIndeksi: number) => {
    const sayfaTarihi = sayfaIndeksiniTariheCevir(sayfaIndeksi);
    const mevcutSayfaMi = sayfaIndeksi === mevcutSayfaIndeksi;

    if (!mevcutSayfaMi || !gunlukNamazlar) {
      return <View key={sayfaIndeksi} style={styles.bosKonteyner} />;
    }

    return (
      <View key={sayfaIndeksi} style={[styles.sayfaContainer, { backgroundColor: renkler.arkaplan }]}>
        {/* Kutlama Animasyonu */}
        <KutlamaAnimasyonu
          gorunsun={kutlamaGoster}
          boyut={300}
          animasyonBittiCallback={() => setKutlamaGoster(false)}
        />

        {/* Header - Tarih */}
        <Animated.View
          style={[
            styles.headerContainer,
            {
              backgroundColor: renkler.kartArkaplan,
              borderBottomColor: renkler.sinir,
              opacity: headerAnim,
              transform: [{
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.tarihButonu}
            onPress={() => setTarihSeciciGorunur(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.tarihIkon}>📅</Text>
            <View style={styles.tarihMetinContainer}>
              <Text style={[styles.tarihMetin, { color: renkler.metin }]}>
                {tarihiGorunumFormatinaCevir(sayfaTarihi)}
              </Text>
              <View style={styles.kaydirmaIpucu}>
                <Text style={[styles.kaydirmaIpucuMetin, { color: renkler.metinIkincil }]}>
                  ◀ Kaydırarak gün değiştir ▶
                </Text>
              </View>
            </View>

            {bugunMuKontrol && vakitBilgisi && (
              <View style={styles.sayacContainer}>
                <AnimasyonluSayac
                  hedefZaman={vakitBilgisi.sonrakiVakitGiris}
                  seviye={muhafizDurumu.seviye}
                  konumModu={konumAyarlari.konumModu}
                />
              </View>
            )}

            {!bugunMuKontrol && (
              <View style={[
                styles.tarihEtiketi,
                { backgroundColor: renkler.birincilAcik }
              ]}>
                <Text style={[
                  styles.tarihEtiketiMetin,
                  { color: renkler.birincil }
                ]}>
                  {tarihEtiketi}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Ana Icerik */}
        <Animated.View
          style={[
            styles.anaIcerik,
            {
              opacity: contentAnim,
              transform: [{
                translateY: contentAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              }],
            },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollIcerik}
          >

            {/* Seri Atesi Karti veya Toparlanma Karti */}
            {/* Muhafiz Bildirimi (Varsa) */}
            {muhafizDurumu.seviye > 0 && (
              <View style={[
                styles.muhafizContainer,
                {
                  backgroundColor: muhafizDurumu.seviye >= 3 ? '#FF3B30' : '#FF9500',
                  transform: [{ scale: muhafizDurumu.seviye >= 3 ? 1.05 : 1 }]
                }
              ]}>
                <Text style={styles.muhafizBaslik}>
                  {muhafizDurumu.seviye >= 3 ? "⚠️ ŞEYTANLA MÜCADELE MODU" : "⚠️ VAKİT ÇIKIYOR"}
                </Text>
                <Text style={styles.muhafizMetin}>{muhafizDurumu.mesaj}</Text>
              </View>
            )}

            {seriDurumu?.toparlanmaDurumu ? (
              <ToparlanmaKarti
                toparlanmaDurumu={seriDurumu.toparlanmaDurumu}
                oncekiSeri={seriDurumu.toparlanmaDurumu.oncekiSeri}
              />
            ) : (
              <>
                {ozelGunAyarlari.aktifOzelGun && (
                  <OzelGunKarti
                    aktifOzelGun={ozelGunAyarlari.aktifOzelGun}
                    onBitir={() => dispatch(ozelGunBitir())}
                    onIptal={() => dispatch(ozelGunIptal())}
                  />
                )}
                <SeriAtesiKarti
                  mevcutSeri={seriOzeti.mevcutSeri}
                  enUzunSeri={seriOzeti.enUzunSeri}
                  sonrakiHedef={seriOzeti.sonrakiHedef}
                  hedefeKalanGun={seriOzeti.hedefeKalanGun}
                />
              </>
            )}

            {/* Dairesel Progress */}
            {/* <View style={styles.progressContainer}>
              <DaireselProgress
                yuzde={yuzde}
                boyut={140}
                cizgiKalinligi={12}
                animasyonSuresi={1200}
                ekBilgi={`${tamamlanan}/${toplam} Namaz`}
              />
            </View> */}

            {/* Namaz Grid */}
            <View style={styles.gridContainer}>
              <NamazGrid
                namazlar={gunlukNamazlar.namazlar}
                onToggle={namazToggle}
                disabled={guncelleniyor}
              />
            </View>

            {/* Motivasyon Banner */}
            <MotivasyonBanner
              tamamlanan={tamamlanan}
              toplam={toplam}
            />
          </ScrollView>
        </Animated.View>

        {/* Alt Butonlar */}
        <View style={[styles.altButonlar, { backgroundColor: renkler.kartArkaplan, borderTopColor: renkler.sinir }]}>
          <View style={styles.butonSatiri}>
            <View style={styles.butonWrapper}>
              <AnimasyonluButon
                metin="Tümünü Tamamla"
                ikon="✓"
                onPress={tumunuTamamla}
                tip="birincil"
                disabled={guncelleniyor || tamamlanan === toplam}
                tamGenislik
              />
            </View>
            <View style={styles.butonAraligi} />
            <View style={styles.butonWrapper}>
              <AnimasyonluButon
                metin="Sıfırla"
                ikon="↺"
                onPress={tumunuSifirla}
                tip="ikincil"
                disabled={guncelleniyor || tamamlanan === 0}
                tamGenislik
              />
            </View>
          </View>
        </View>
      </View >
    );
  };

  if (yukleniyor && !gunlukNamazlar) {
    return (
      <View style={[styles.yuklemeContainer, { backgroundColor: renkler.arkaplan }]}>
        <YuklemeGostergesi mesaj="Namazlar yükleniyor..." />
      </View>
    );
  }

  if (hata && !gunlukNamazlar) {
    return (
      <View style={[styles.hataContainer, { backgroundColor: renkler.arkaplan }]}>
        <Text style={styles.hataIkon}>😔</Text>
        <Text style={[styles.hataText, { color: renkler.hata }]}>
          {hata}
        </Text>
        <AnimasyonluButon
          metin="Tekrar Dene"
          ikon="🔄"
          onPress={() => namazlariGetir(mevcutTarih)}
          tip="birincil"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: renkler.arkaplan }]}>
      <StatusBar
        backgroundColor={renkler.birincil}
        barStyle={koyuMu ? 'light-content' : 'dark-content'}
      />

      {/* Bugun'e Don Butonu - Header'in altinda konumlandirildi */}
      {!bugunMuKontrol && (
        <TouchableOpacity
          style={[styles.buguneDonButonu, { backgroundColor: renkler.birincil }]}
          onPress={buguneDon}
          activeOpacity={0.8}
        >
          <Text style={styles.buguneDonMetin}>📍 Bugune Don</Text>
        </TouchableOpacity>
      )}

      {/* Kaydirmali Sayfa Gorunumu */}
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={BASLANGIC_SAYFA_INDEKSI}
        onPageSelected={sayfaDegistigindeIsle}
        overdrag={true}
      >
        {Array.from({ length: 2001 }, (_, i) => i).map(sayfaIndeksi => (
          <View key={sayfaIndeksi} collapsable={false}>
            {Math.abs(sayfaIndeksi - mevcutSayfaIndeksi) <= 2
              ? sayfaIcerigiOlustur(sayfaIndeksi)
              : <View style={styles.bosKonteyner} />
            }
          </View>
        ))}
      </PagerView>

      {/* Tarih Secici Dialog */}
      {tarihSeciciGorunur && (
        <DateTimePicker
          value={new Date(mevcutTarih)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={tarihSecildigindeIsle}
          maximumDate={new Date(gunEkle(bugunuAl(), 365))}
          minimumDate={new Date('2020-01-01')}
        />
      )}

      {/* Kutlama Modal */}
      <KutlamaModal
        kutlama={ilkKutlama}
        gorunur={!!ilkKutlama}
        onKapat={kutlamaKapat}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pagerView: {
    flex: 1,
  },
  sayfaContainer: {
    flex: 1,
  },
  bosKonteyner: {
    flex: 1,
  },
  yuklemeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  hataIkon: {
    fontSize: 64,
    marginBottom: 16,
  },
  hataText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  tarihButonu: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  tarihIkon: {
    fontSize: 28,
    marginRight: 12,
  },
  tarihMetinContainer: {
    flex: 1,
    marginRight: 8,
  },
  sayacContainer: {
    minWidth: 85,
    alignItems: 'flex-end',
  },
  tarihMetin: {
    fontSize: 18,
    fontWeight: '700',
  },
  kaydirmaIpucu: {
    marginTop: 2,
  },
  kaydirmaIpucuMetin: {
    fontSize: 11,
  },
  tarihEtiketi: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tarihEtiketiMetin: {
    fontSize: 13,
    fontWeight: '700',
  },
  anaIcerik: {
    flex: 1,
    paddingVertical: 8,
  },
  scrollIcerik: {
    paddingBottom: 16,
  },
  progressContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  gridContainer: {
    paddingHorizontal: 8,
  },
  altButonlar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  butonSatiri: {
    flexDirection: 'row',
  },
  butonWrapper: {
    flex: 1,
  },
  butonAraligi: {
    width: 12,
  },
  buguneDonButonu: {
    position: 'absolute',
    top: 70,
    left: 16,
    zIndex: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buguneDonMetin: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  muhafizContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  muhafizBaslik: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 14,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  muhafizMetin: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
  },
});
