/**
 * Kaza Defteri Sayfası (Kaza Defteri 2.0 — sekme kökü, kendi başlığını taşır)
 * Kaza namazı takibi: borç ekleme, tamamlama, motivasyon, mekruh vakit uyarısı,
 * otomatik ekleme durumu, kontrol bekleyen günler, fazla kılınan, bozuk kayıt
 * uyarısı. Sayılar diskteki hareket defterinden TÜRER (slice).
 */

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  TextInput,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  kazaVerileriniYukle,
  borcEkle,
  kazaTamamla,
  fazlayiSifirla,
  gunlukHedefiGuncelle,
  gizlemeToggle,
  kazaOneriAyarlariniYukle,
  kazaOneriAyarlariniGuncelle,
} from '../store/kazaSlice';
import { Anahtar } from '../components/common/Anahtar';
import { useRenkler } from '../../core/theme';
import { KazaNamazAdi } from '../../core/types/KazaTipleri';
import {
  mekruhVakitKontrolEt,
  tahminiTarihiFormatla,
  motivasyonOnerileriHesapla,
} from '../../domain/services/KazaHesaplayiciServisi';
import { useDonanimGeriTusu } from '../hooks/useDonanimGeriTusu';
import { SayiGirisModali } from '../components/common/SayiGirisModali';
import { BildirimModali } from '../components/common/BildirimModali';
import { KazaBekleyenGunlerModal } from '../components/kaza/KazaBekleyenGunlerModal';
import { KazaBant } from '../components/kaza/KazaOrtak';
import { gunMetni, saatMetni } from '../components/kaza/kazaMetinleri';
import type { KazaStackParamList } from '../../navigation/kazaEkranlari';

// ==================== TİPLER ====================

type ModalTipi =
  | { tip: 'borcEkle'; namazAdi: KazaNamazAdi }
  | { tip: 'topluTamamla'; namazAdi: KazaNamazAdi }
  | { tip: 'gunlukHedef' }
  | { tip: 'sihirbaz'; adim: 1 | 2 | 3 }
  | { tip: 'bekleyenGunler' }
  | { tip: 'fazlaSifirla' };

// ==================== NAMAZ SIRASI & İKON ====================

const NAMAZ_IKONLARI: Record<KazaNamazAdi, string> = {
  Sabah: 'sun',
  'Öğle': 'cloud-sun',
  'İkindi': 'cloud',
  'Akşam': 'moon',
  'Yatsı': 'star',
  Vitir: 'star-half-alt',
};

const DEFTER_BAGLANTILARI = [
  { ikon: 'history', metin: 'Hareket geçmişi', hedef: 'KazaGecmisi' },
  { ikon: 'robot', metin: 'Otomatik kaza ekleme', hedef: 'KazaOtomatikAyar' },
  { ikon: 'broom', metin: 'Kayıtları temizleyin', hedef: 'KazaTemizlik' },
] as const;

/** '201 kılındı · 30 elle, 12 otomatik eklendi' */
function kaynakOzetiMetni(ozet: { kilinan: number; elle: number; otomatik: number; bildirim: number }): string {
  const eklemeler = [
    ozet.elle ? `${ozet.elle} elle` : null,
    ozet.otomatik ? `${ozet.otomatik} otomatik` : null,
    ozet.bildirim ? `${ozet.bildirim} bildirimden` : null,
  ].filter(Boolean);
  const kilinan = `${ozet.kilinan.toLocaleString('tr-TR')} kılındı`;
  return eklemeler.length > 0 ? `${kilinan} · ${eklemeler.join(', ')} eklendi` : kilinan;
}

function otomatikCipMetni(aktif: boolean, sonTarama: string | null): string {
  if (!aktif) return 'Otomatik ekleme kapalı';
  return sonTarama ? `Otomatik ekleme açık · son tarama ${saatMetni(sonTarama)}` : 'Otomatik ekleme açık';
}

function bekleyenGunlerMetni(gunler: readonly string[]): string {
  if (gunler.length === 1) return `${gunMetni(gunler[0])} gününde hiç işaret yok`;
  return `${gunMetni(gunler[0])} – ${gunMetni(gunler[gunler.length - 1])} arasında hiç işaret olmayan günler var`;
}

// ==================== ANA BİLEŞEN ====================

export const KazaDefteriSayfasi: React.FC = () => {
  const dispatch = useAppDispatch();
  const renkler = useRenkler();
  const navigation = useNavigation<NativeStackNavigationProp<KazaStackParamList>>();

  const { kazaDurumu, istatistik, yukleniyor } = useAppSelector((s) => s.kaza);
  // Eski test/mock state'lerinde bu alanlar olmayabilir → güvenli varsayılan.
  const bozukAylar = useAppSelector((s) => s.kaza.bozukAylar) ?? [];
  const eskiKayitBozuk = useAppSelector((s) => s.kaza.eskiKayitBozuk) === true;
  const sonTarama = useAppSelector((s) => s.kaza.sonTarama) ?? null;
  // "Her farzdan sonra kaza önerin" (issue #294) — eski test/mock state'inde alan olmayabilir.
  const oneriAyarlari = useAppSelector((s) => s.kaza.oneriAyarlari);
  const oneriAyarlariYuklendi = useAppSelector((s) => s.kaza.oneriAyarlariYuklendi);
  const koordinatlar = useAppSelector((s) => s.konum.koordinatlar);

  // Modal state
  const [aktifModal, setAktifModal] = useState<ModalTipi | null>(null);
  const [modalGirdi, setModalGirdi] = useState('');

  // Alert.alert yerine tema-uyumlu hata bildirimi (tek-butonlu validasyon uyarıları)
  const [hataModali, setHataModali] = useState<{ gorunur: boolean; mesaj: string }>({
    gorunur: false,
    mesaj: '',
  });
  const hataGoster = useCallback((mesaj: string) => {
    setHataModali({ gorunur: true, mesaj });
  }, []);
  const hataKapat = useCallback(() => {
    setHataModali((onceki) => ({ ...onceki, gorunur: false }));
  }, []);

  // Sihirbaz state
  const [sihirbazDogumYili, setSihirbazDogumYili] = useState('');
  const [sihirbazErgenlikYasi, setSihirbazErgenlikYasi] = useState(14);
  const [sihirbazKildigiYuzde, setSihirbazKildigiYuzde] = useState(0);

  // Seçili motivasyon senaryosu
  const [motivasyonIndex, setMotivasyonIndex] = useState(2); // Varsayılan 3/vakit

  // Mekruh vakit
  const [mekruhBilgi, setMekruhBilgi] = useState<{ mekruhMu: boolean; aciklama: string | null }>({
    mekruhMu: false,
    aciklama: null,
  });

  // Animasyon: tamamlama flash
  const flashAnim = useRef(new Animated.Value(1)).current;

  // Donanım geri tuşu: sihirbazda önceki adıma dön, değilse aktif modalı kapat.
  // Bekleyen günler sayfası kendi geri tuşu kancasını taşır.
  const handleModalGeri = useCallback(() => {
    if (aktifModal?.tip === 'sihirbaz' && aktifModal.adim > 1) {
      setAktifModal({ tip: 'sihirbaz', adim: (aktifModal.adim - 1) as 1 | 2 | 3 });
    } else {
      setAktifModal(null);
    }
  }, [aktifModal]);
  useDonanimGeriTusu(aktifModal !== null && aktifModal.tip !== 'bekleyenGunler', handleModalGeri);

  // ==================== YÜKLEME ====================

  useEffect(() => {
    dispatch(kazaVerileriniYukle());
    dispatch(kazaOneriAyarlariniYukle());
  }, [dispatch]);

  const oneriAyariniDegistir = useCallback(
    (acik: boolean) => {
      dispatch(kazaOneriAyarlariniGuncelle({ farzSonrasiOner: acik }));
    },
    [dispatch]
  );

  // Mekruh vakit kontrolü — her dakika güncelle
  useEffect(() => {
    const kontrol = () => {
      if (koordinatlar?.lat && koordinatlar?.lng) {
        const sonuc = mekruhVakitKontrolEt(koordinatlar.lat, koordinatlar.lng);
        setMekruhBilgi({ mekruhMu: sonuc.mekruhMu, aciklama: sonuc.aciklama });
      }
    };
    kontrol();
    const interval = setInterval(kontrol, 60 * 1000);
    return () => clearInterval(interval);
    // Nesne yerine primitive bağımlılık: koordinatlar referansı değişse de (ör. her
    // render yeni nesne) yalnız gerçek lat/lng değişiminde yeniden kur → render döngüsü olmaz.
  }, [koordinatlar?.lat, koordinatlar?.lng]);

  // ==================== MOTİVASYON ====================

  const motivasyonOnerileri = useMemo(
    () => (kazaDurumu ? motivasyonOnerileriHesapla(kazaDurumu.toplamKalan) : []),
    [kazaDurumu?.toplamKalan]
  );
  const aktifOneri = motivasyonOnerileri[motivasyonIndex] ?? motivasyonOnerileri[0];

  // ==================== FLASH ANİMASYON ====================

  const tamamlamaFlash = useCallback(() => {
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 0.3, duration: 80, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [flashAnim]);

  // ==================== AKSİYONLAR ====================

  const handleTekTikTamamla = useCallback(
    (namazAdi: KazaNamazAdi) => {
      if (!kazaDurumu) return;
      const namaz = kazaDurumu.namazlar.find((n) => n.namazAdi === namazAdi);
      if (!namaz || namaz.kalanBorc <= 0) return;
      dispatch(kazaTamamla({ namazAdi, sayi: 1 }));
      tamamlamaFlash();
    },
    [dispatch, kazaDurumu, tamamlamaFlash]
  );

  const handleTopluTamamlaGonder = useCallback(() => {
    const sayi = parseInt(modalGirdi, 10);
    if (!sayi || sayi <= 0) {
      hataGoster('Geçerli bir sayı giriniz.');
      return;
    }
    const modal = aktifModal as { tip: 'topluTamamla'; namazAdi: KazaNamazAdi };
    dispatch(kazaTamamla({ namazAdi: modal.namazAdi, sayi }));
    tamamlamaFlash();
    setAktifModal(null);
    setModalGirdi('');
  }, [dispatch, aktifModal, modalGirdi, tamamlamaFlash, hataGoster]);

  const handleBorcEkleGonder = useCallback(() => {
    const sayi = parseInt(modalGirdi, 10);
    if (!sayi || sayi <= 0) {
      hataGoster('Geçerli bir sayı giriniz.');
      return;
    }
    const modal = aktifModal as { tip: 'borcEkle'; namazAdi: KazaNamazAdi };
    dispatch(borcEkle({ namazAdi: modal.namazAdi, sayi }));
    setAktifModal(null);
    setModalGirdi('');
  }, [dispatch, aktifModal, modalGirdi, hataGoster]);

  const handleGunlukHedefGonder = useCallback(() => {
    const hedef = parseInt(modalGirdi, 10);
    if (isNaN(hedef) || hedef < 0) {
      hataGoster('Geçerli bir sayı giriniz (0 = hedefsiz).');
      return;
    }
    dispatch(gunlukHedefiGuncelle({ hedef }));
    setAktifModal(null);
    setModalGirdi('');
  }, [dispatch, modalGirdi, hataGoster]);

  const handleSihirbazTamamla = useCallback(() => {
    const dogumYili = parseInt(sihirbazDogumYili, 10);
    const bugunYili = new Date().getFullYear();
    if (!dogumYili || dogumYili < 1900 || dogumYili > bugunYili - 5) {
      hataGoster('Geçerli bir doğum yılı giriniz.');
      return;
    }
    // Sihirbazın son adımı ÖNİZLEMEDİR: yeni taban yazılmadan önce neyin değişip
    // neyin kaldığı gösterilir (Kaza Defteri 2.0, ekran 4).
    setAktifModal(null);
    setSihirbazDogumYili('');
    navigation.navigate('KazaYenidenHesapla', {
      girdi: {
        dogumTarihi: `${dogumYili}-01-01`,
        ergenlikYasi: sihirbazErgenlikYasi,
        kildigiTahminiYuzdesi: sihirbazKildigiYuzde,
      },
    });
  }, [navigation, sihirbazDogumYili, sihirbazErgenlikYasi, sihirbazKildigiYuzde, hataGoster]);

  // ==================== YARDIMCI ====================

  const gunlukIlerlemeYuzdesi =
    kazaDurumu && kazaDurumu.gunlukHedef > 0
      ? Math.min(1, kazaDurumu.gunlukTamamlanan / kazaDurumu.gunlukHedef)
      : 0;

  const toplamIlerlemeYuzdesi =
    kazaDurumu && kazaDurumu.toplamTamamlanan + kazaDurumu.toplamKalan > 0
      ? Math.min(
          1,
          kazaDurumu.toplamTamamlanan /
            (kazaDurumu.toplamTamamlanan + kazaDurumu.toplamKalan)
        )
      : 0;

  const sayiGoster = useCallback(
    (sayi: number) => (kazaDurumu?.toplamGizleMi ? '••••' : sayi.toLocaleString('tr-TR')),
    [kazaDurumu?.toplamGizleMi]
  );

  // ==================== RENDER ====================

  if (yukleniyor || !kazaDurumu) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: renkler.arkaplan }]}>
        <View style={styles.yukleniyorKonteyner}>
          <Text style={[styles.yukleniyorMetin, { color: renkler.metinIkincil }]}>
            Yükleniyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: renkler.arkaplan }]} edges={['top']}>
      {/* BAŞLIK */}
      <View style={[styles.baslik, { backgroundColor: renkler.birincil }]}>
        <View style={styles.baslikIcerik}>
          <FontAwesome5 name="book" size={20} color="#fff" />
          <Text style={styles.baslikMetin}>Kaza Defteri</Text>
        </View>
        <View style={styles.baslikSagButonlar}>
          <TouchableOpacity
            onPress={() => navigation.navigate('KazaGecmisi')}
            style={styles.ikonButon}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Hareket geçmişini açın"
          >
            <FontAwesome5 name="history" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => dispatch(gizlemeToggle())}
            style={styles.ikonButon}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={kazaDurumu.toplamGizleMi ? 'Toplam sayıyı gösterin' : 'Toplam sayıyı gizleyin'}
          >
            <FontAwesome5
              name={kazaDurumu.toplamGizleMi ? 'eye-slash' : 'eye'}
              size={18}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollIcerik}
        showsVerticalScrollIndicator={false}
      >
        {/* MEKRUH VAKİT UYARISI */}
        {mekruhBilgi.mekruhMu && mekruhBilgi.aciklama && (
          <View style={[styles.mekruhBanner, { backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }]}>
            <FontAwesome5 name="exclamation-triangle" size={14} color={renkler.metinIkincil} />
            <Text style={[styles.mekruhMetin, { color: renkler.metinIkincil }]}>
              {mekruhBilgi.aciklama}
            </Text>
          </View>
        )}

        {/* BOZUK KAYIT UYARILARI — sayfa asla sonsuz yüklemede kalmaz */}
        {bozukAylar.length > 0 && (
          <KazaBant
            testID="kaza-bozuk-ay-bandi"
            ikon="exclamation-triangle"
            renk={renkler.dikkat}
            metin={
              bozukAylar.length === 1
                ? 'Bir aylık kayıt okunamadı; o ayın hareketleri sayılmıyor. Kayıt silinmedi, cihazınızda korunuyor.'
                : `${bozukAylar.length} aylık kayıt okunamadı; o ayların hareketleri sayılmıyor. Kayıtlar silinmedi, cihazınızda korunuyor.`
            }
          />
        )}
        {eskiKayitBozuk && (
          <KazaBant
            testID="kaza-eski-kayit-bandi"
            ikon="exclamation-triangle"
            renk={renkler.dikkat}
            metin="Önceki sürümdeki kaza kaydınız okunamadı ve aktarılamadı. Kayıt silinmedi; Ayarlar > Tanı ve Geri Bildirim'den bize bildirebilirsiniz."
          />
        )}

        {/* TOPLAM KART */}
        <Animated.View
          style={[
            styles.toplamKart,
            { backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir },
            { opacity: flashAnim },
          ]}
        >
          <View style={styles.toplamKartUst}>
            <View>
              <Text style={[styles.toplamEtiket, { color: renkler.metinIkincil }]}>
                Toplam Kalan Kaza
              </Text>
              <Text style={[styles.toplamSayi, { color: renkler.birincil }]}>
                {sayiGoster(kazaDurumu.toplamKalan)}
              </Text>
            </View>
            <View style={styles.toplamKartSag}>
              <Text style={[styles.tamamlananKucuk, { color: renkler.metinIkincil }]}>
                Tamamlanan
              </Text>
              <Text style={[styles.tamamlananSayi, { color: renkler.basarili || '#4CAF50' }]}>
                {sayiGoster(kazaDurumu.toplamTamamlanan)}
              </Text>
              {toplamIlerlemeYuzdesi > 0 && (
                <Text style={[styles.yuzdeMetin, { color: renkler.metinIkincil }]}>
                  %{Math.round(toplamIlerlemeYuzdesi * 100)}
                </Text>
              )}
            </View>
          </View>

          {/* Toplam ilerleme çubuğu */}
          {toplamIlerlemeYuzdesi > 0 && (
            <View style={[styles.progressKonteyner, { backgroundColor: renkler.sinir }]}>
              <View
                style={[
                  styles.progressDolgu,
                  {
                    backgroundColor: renkler.birincil,
                    width: `${toplamIlerlemeYuzdesi * 100}%`,
                  },
                ]}
              />
            </View>
          )}

          {/* Kaynak özeti: kılınan · elle · otomatik · bildirim */}
          {kazaDurumu.ozet && (
            <Text style={[styles.tahminiMetin, styles.kaynakOzeti, { color: renkler.metinIkincil }]}>
              {kaynakOzetiMetni(kazaDurumu.ozet)}
            </Text>
          )}

          {/* Fazla kılınan: AYRI gösterilir, sonradan eklenen borçtan düşülmez */}
          {(kazaDurumu.toplamFazla ?? 0) > 0 && (
            <TouchableOpacity
              onPress={() => setAktifModal({ tip: 'fazlaSifirla' })}
              accessibilityRole="button"
              accessibilityLabel={`${kazaDurumu.toplamFazla} kaza hesaplanan borçtan fazla kılınmış. Sıfırlamak için dokunun`}
              style={[styles.tahminiSatir, styles.fazlaSatir]}
            >
              <FontAwesome5 name="info-circle" size={12} color={renkler.bilgi} />
              <Text style={[styles.tahminiMetin, { color: renkler.metin }]}>
                {kazaDurumu.toplamFazla} fazla kılınmış ·{' '}
                <Text style={styles.altiCizili}>Sıfırlayın</Text>
              </Text>
            </TouchableOpacity>
          )}

          {/* Tahmini bitiş tarihi */}
          {istatistik?.tahminiTamamlanmaTarihi && (
            <View style={styles.tahminiSatir}>
              <FontAwesome5 name="bullseye" size={12} color={renkler.metinIkincil} />
              <Text style={[styles.tahminiMetin, { color: renkler.metinIkincil }]}>
                Mevcut temponuzda:{' '}
                <Text style={{ fontWeight: '700', color: renkler.metin }}>
                  {tahminiTarihiFormatla(istatistik.tahminiTamamlanmaTarihi)}
                </Text>
                {' '}bitiş
              </Text>
            </View>
          )}
        </Animated.View>

        {/* OTOMATİK EKLEME ÇİPİ */}
        {kazaDurumu.otomatik && (
          <TouchableOpacity
            onPress={() => navigation.navigate('KazaOtomatikAyar')}
            accessibilityRole="button"
            accessibilityLabel={`${otomatikCipMetni(kazaDurumu.otomatik.aktif, sonTarama)}. Ayarı açın`}
            style={[styles.otoCip, { backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }]}
          >
            <View style={[styles.oneriIkon, { backgroundColor: `${renkler.bilgi}20` }]}>
              <FontAwesome5 name="robot" size={13} color={renkler.bilgi} />
            </View>
            <Text style={[styles.otoCipMetin, { color: renkler.metin }]}>
              {otomatikCipMetni(kazaDurumu.otomatik.aktif, sonTarama)}
            </Text>
            <FontAwesome5 name="chevron-right" size={12} color={renkler.metinIkincil} />
          </TouchableOpacity>
        )}

        {/* KONTROL BEKLEYEN GÜNLER ("Bana sorun") */}
        {(kazaDurumu.bekleyenGunler?.length ?? 0) > 0 && (
          <View
            testID="kaza-bekleyen-gunler"
            style={[styles.oneriKart, { backgroundColor: renkler.kartArkaplan, borderColor: renkler.dikkat }]}
          >
            <View style={[styles.oneriIkon, { backgroundColor: `${renkler.dikkat}20` }]}>
              <FontAwesome5 name="calendar-check" size={14} color={renkler.dikkat} />
            </View>
            <View style={styles.oneriMetinler}>
              <Text style={[styles.gunlukHedefEtiket, { color: renkler.metin }]}>
                Kontrol bekleyen {kazaDurumu.bekleyenGunler.length} gün
              </Text>
              <Text style={[styles.hedefsizMetin, { color: renkler.metinIkincil }]}>
                {bekleyenGunlerMetni(kazaDurumu.bekleyenGunler)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setAktifModal({ tip: 'bekleyenGunler' })}
              accessibilityRole="button"
              accessibilityLabel="Kontrol bekleyen günleri inceleyin"
              style={[styles.inceleButon, { borderColor: renkler.sinir, backgroundColor: renkler.arkaplan }]}
            >
              <Text style={[styles.inceleMetin, { color: renkler.metin }]}>İnceleyin</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* MOTİVASYON KARTI */}
        {kazaDurumu.toplamKalan > 0 && motivasyonOnerileri.length > 0 && (
          <View
            style={[
              styles.motivasyonKart,
              { backgroundColor: renkler.kartArkaplan, borderColor: renkler.birincil + '40' },
            ]}
          >
            <View style={styles.motivasyonBaslik}>
              <FontAwesome5 name="lightbulb" size={14} color={renkler.birincil} />
              <Text style={[styles.motivasyonBaslikMetin, { color: renkler.birincil }]}>
                Küçük Adımlarla Büyük Hedef
              </Text>
            </View>

            {aktifOneri && (
              <Text style={[styles.motivasyonAciklama, { color: renkler.metin }]}>
                {aktifOneri.aciklama}
              </Text>
            )}

            {/* Senaryo butonları */}
            <View style={styles.senaryoButonlar}>
              {motivasyonOnerileri.map((oneri, index) => (
                <TouchableOpacity
                  key={oneri.kazaAdediPerVakit}
                  onPress={() => setMotivasyonIndex(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`Vakit başına ${oneri.kazaAdediPerVakit} kaza`}
                  accessibilityState={{ selected: motivasyonIndex === index }}
                  style={[
                    styles.senaryoButon,
                    {
                      backgroundColor:
                        motivasyonIndex === index
                          ? renkler.birincil
                          : renkler.arkaplan,
                      borderColor: renkler.birincil,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.senaryoButonMetin,
                      {
                        color:
                          motivasyonIndex === index ? '#fff' : renkler.birincil,
                      },
                    ]}
                  >
                    {oneri.kazaAdediPerVakit}/vakit
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* GÜNLÜK HEDEF */}
        <View
          style={[
            styles.gunlukHedefKart,
            { backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir },
          ]}
        >
          <View style={styles.gunlukHedefUst}>
            <Text style={[styles.gunlukHedefEtiket, { color: renkler.metin }]}>
              Günlük Hedef
            </Text>
            <TouchableOpacity
              onPress={() => {
                setModalGirdi(
                  kazaDurumu.gunlukHedef > 0
                    ? String(kazaDurumu.gunlukHedef)
                    : ''
                );
                setAktifModal({ tip: 'gunlukHedef' });
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Günlük hedefi düzenleyin"
            >
              <FontAwesome5 name="edit" size={14} color={renkler.metinIkincil} />
            </TouchableOpacity>
          </View>

          {kazaDurumu.gunlukHedef > 0 ? (
            <>
              <View style={styles.gunlukHedefSatir}>
                <Text style={[styles.gunlukHedefSayilar, { color: renkler.metinIkincil }]}>
                  {kazaDurumu.gunlukTamamlanan} / {kazaDurumu.gunlukHedef} kaza
                </Text>
                {kazaDurumu.gunlukTamamlanan >= kazaDurumu.gunlukHedef && (
                  <View style={[styles.hedefTamamBadge, { backgroundColor: renkler.birincil + '20' }]}>
                    <FontAwesome5 name="check-circle" size={12} color={renkler.birincil} />
                    <Text style={[styles.hedefTamamMetin, { color: renkler.birincil }]}>
                      Tamamlandı!
                    </Text>
                  </View>
                )}
              </View>
              <View style={[styles.progressKonteyner, { backgroundColor: renkler.sinir }]}>
                <View
                  style={[
                    styles.progressDolgu,
                    {
                      backgroundColor:
                        gunlukIlerlemeYuzdesi >= 1 ? renkler.basarili : renkler.birincil,
                      width: `${gunlukIlerlemeYuzdesi * 100}%`,
                    },
                  ]}
                />
              </View>
            </>
          ) : (
            <Text style={[styles.hedefsizMetin, { color: renkler.metinIkincil }]}>
              Henüz günlük hedef belirlenmedi. Düzenle butonuna dokunun.
            </Text>
          )}
        </View>

        {/* HER FARZLA BİR KAZA (issue #294) — yalnız borcu olan kullanıcıya görünür */}
        {oneriAyarlariYuklendi && oneriAyarlari && kazaDurumu.toplamKalan > 0 && (
          <View
            style={[
              styles.oneriKart,
              { backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir },
            ]}
          >
            <View style={[styles.oneriIkon, { backgroundColor: renkler.birincil + '20' }]}>
              <FontAwesome5 name="link" size={14} color={renkler.birincil} />
            </View>
            <View style={styles.oneriMetinler}>
              <Text style={[styles.gunlukHedefEtiket, { color: renkler.metin }]}>
                Her farzla bir kaza
              </Text>
              <Text style={[styles.hedefsizMetin, { color: renkler.metinIkincil }]}>
                Ana ekranda bir farzı kıldım olarak işaretlediğinizde bir kaza kılmayı önerir.
                Kerahat vaktinde sorulmaz.
              </Text>
            </View>
            <Anahtar
              value={oneriAyarlari.farzSonrasiOner}
              onValueChange={oneriAyariniDegistir}
              trackColor={{ false: renkler.sinir, true: `${renkler.birincil}60` }}
              thumbColor={oneriAyarlari.farzSonrasiOner ? renkler.birincil : '#f4f3f4'}
              accessibilityLabel="Her farzdan sonra kaza önerin"
            />
          </View>
        )}

        {/* NAMAZ KARTLARI */}
        <View style={styles.namazKartlarBaslik}>
          <Text style={[styles.bolumBasligi, { color: renkler.metin }]}>Namaz Bazında Takip</Text>
        </View>

        {kazaDurumu.namazlar.map((namaz) => (
          <View
            key={namaz.namazAdi}
            style={[
              styles.namazKart,
              { backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir },
            ]}
          >
            <View style={styles.namazKartSol}>
              <View
                style={[
                  styles.namazIkonKonteyner,
                  { backgroundColor: renkler.birincil + '15' },
                ]}
              >
                <FontAwesome5
                  name={NAMAZ_IKONLARI[namaz.namazAdi]}
                  size={16}
                  color={renkler.birincil}
                />
              </View>
              <View>
                <Text style={[styles.namazAdi, { color: renkler.metin }]}>
                  {namaz.namazAdi}
                </Text>
                <Text style={[styles.namazKalanMetin, { color: renkler.metinIkincil }]}>
                  {namaz.kalanBorc > 0 ? `${namaz.kalanBorc} kaza kaldı` : 'Borç yok'}
                </Text>
              </View>
            </View>

            <View style={styles.namazKartSag}>
              {/* Borç Ekle */}
              <TouchableOpacity
                onPress={() => {
                  setModalGirdi('');
                  setAktifModal({ tip: 'borcEkle', namazAdi: namaz.namazAdi });
                }}
                style={[styles.namazButon, { borderColor: renkler.sinir }]}
                // 32 dp kutu + 6 dp pay = 44 dp dokunma hedefi
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                accessibilityRole="button"
                accessibilityLabel={`${namaz.namazAdi} için kaza borcu ekleyin`}
              >
                <FontAwesome5 name="plus" size={12} color={renkler.metinIkincil} />
              </TouchableOpacity>

              {/* Tek Tık Tamamla */}
              <TouchableOpacity
                onPress={() => handleTekTikTamamla(namaz.namazAdi)}
                onLongPress={() => {
                  setModalGirdi('');
                  setAktifModal({ tip: 'topluTamamla', namazAdi: namaz.namazAdi });
                }}
                disabled={namaz.kalanBorc <= 0}
                accessibilityRole="button"
                accessibilityLabel={`${namaz.namazAdi} kazasını kıldım olarak işaretleyin`}
                accessibilityHint="Birden fazlasını işaretlemek için basılı tutun"
                style={[
                  styles.namazTamamlaButon,
                  {
                    backgroundColor:
                      namaz.kalanBorc > 0 ? renkler.birincil : renkler.sinir,
                  },
                ]}
              >
                <FontAwesome5
                  name="check"
                  size={12}
                  color={namaz.kalanBorc > 0 ? '#fff' : renkler.metinIkincil}
                />
                <Text
                  style={[
                    styles.namazTamamlaMetin,
                    {
                      color: namaz.kalanBorc > 0 ? '#fff' : renkler.metinIkincil,
                    },
                  ]}
                >
                  Kıldım
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* DEFTER BAĞLANTILARI */}
        {DEFTER_BAGLANTILARI.map((b) => (
          <TouchableOpacity
            key={b.hedef}
            onPress={() => navigation.navigate(b.hedef)}
            accessibilityRole="button"
            accessibilityLabel={b.metin}
            style={[styles.otoCip, { backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }]}
          >
            <View style={[styles.oneriIkon, { backgroundColor: `${renkler.birincil}20` }]}>
              <FontAwesome5 name={b.ikon} size={13} color={renkler.birincil} />
            </View>
            <Text style={[styles.otoCipMetin, { color: renkler.metin }]}>{b.metin}</Text>
            <FontAwesome5 name="chevron-right" size={12} color={renkler.metinIkincil} />
          </TouchableOpacity>
        ))}

        {/* SİHİRBAZ BUTONU */}
        <TouchableOpacity
          onPress={() =>
            setAktifModal({ tip: 'sihirbaz', adim: 1 })
          }
          style={[
            styles.sihirbazButon,
            { borderColor: renkler.birincil, backgroundColor: renkler.kartArkaplan },
          ]}
          accessibilityRole="button"
        >
          <FontAwesome5 name="magic" size={16} color={renkler.birincil} />
          <Text style={[styles.sihirbazButonMetin, { color: renkler.birincil }]}>
            {kazaDurumu.taban ? 'Yeniden hesaplayın' : 'Hesaplama sihirbazı ile başlayın'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ==================== MODALLER ==================== */}

      {/* BORÇ EKLE MODAL */}
      <SayiGirisModali
        gorunur={aktifModal?.tip === 'borcEkle'}
        baslik={`Borç Ekle — ${aktifModal?.tip === 'borcEkle' ? aktifModal.namazAdi : ''}`}
        aciklama="Kaç kaza eklenmesini istiyorsunuz?"
        placeholder="Örn: 100"
        onayMetni="Ekle"
        deger={modalGirdi}
        onDegisim={setModalGirdi}
        onIptal={() => { setAktifModal(null); setModalGirdi(''); }}
        onOnay={handleBorcEkleGonder}
      />

      {/* TOPLU TAMAMLA MODAL */}
      <SayiGirisModali
        gorunur={aktifModal?.tip === 'topluTamamla'}
        baslik={aktifModal?.tip === 'topluTamamla' ? `Toplu Tamamla — ${aktifModal.namazAdi}` : 'Toplu Tamamla'}
        aciklama="Kaç kaza kıldınız?"
        placeholder="Örn: 5"
        onayMetni="Kaydet"
        deger={modalGirdi}
        onDegisim={setModalGirdi}
        onIptal={() => { setAktifModal(null); setModalGirdi(''); }}
        onOnay={handleTopluTamamlaGonder}
      />

      {/* GÜNLÜK HEDEF MODAL */}
      <SayiGirisModali
        gorunur={aktifModal?.tip === 'gunlukHedef'}
        baslik="Günlük Hedef"
        aciklama="Günlük kaç kaza kılmayı hedefliyorsunuz? (0 = hedefsiz)"
        placeholder="Örn: 3"
        onayMetni="Kaydet"
        deger={modalGirdi}
        onDegisim={setModalGirdi}
        onIptal={() => { setAktifModal(null); setModalGirdi(''); }}
        onOnay={handleGunlukHedefGonder}
      />

      {/* SİHİRBAZ MODAL */}
      <Modal
        visible={aktifModal?.tip === 'sihirbaz'}
        transparent
        animationType="slide"
        onRequestClose={() => setAktifModal(null)}
      >
        <KeyboardAvoidingView
          style={styles.modalArkaPlan}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Backdrop: içeriği saran değil, absoluteFill ile kardeş → scroll/etkileşim bozulmaz */}
          <TouchableWithoutFeedback
            onPress={() => setAktifModal(null)}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <View style={[styles.sihirbazKonteyner, { backgroundColor: renkler.kartArkaplan }]}>
            <View style={styles.sihirbazBaslikSatir}>
              <FontAwesome5 name="magic" size={18} color={renkler.birincil} />
              <Text style={[styles.modalBaslik, { color: renkler.metin, marginLeft: 8 }]}>
                Hesaplama Sihirbazı
              </Text>
            </View>

            <Text style={[styles.sihirbazAdimMetin, { color: renkler.metinIkincil }]}>
              {aktifModal?.tip === 'sihirbaz' ? `Adım ${aktifModal.adim} / 3` : ''}
            </Text>

            {/* ADIM 1: Doğum Yılı */}
            {aktifModal?.tip === 'sihirbaz' && aktifModal.adim === 1 && (
              <>
                <Text style={[styles.sihirbazSoru, { color: renkler.metin }]}>
                  Doğum yılınız nedir?
                </Text>
                <TextInput
                  style={[
                    styles.modalInput,
                    { borderColor: renkler.sinir, color: renkler.metin, backgroundColor: renkler.arkaplan },
                  ]}
                  keyboardType="number-pad"
                  placeholder="Örn: 1995"
                  placeholderTextColor={renkler.metinIkincil}
                  value={sihirbazDogumYili}
                  onChangeText={setSihirbazDogumYili}
                  autoFocus
                  maxLength={4}
                />
                <View style={styles.modalButonlar}>
                  <TouchableOpacity
                    onPress={() => setAktifModal(null)}
                    style={[styles.modalIptalButon, { borderColor: renkler.sinir }]}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.modalIptalMetin, { color: renkler.metinIkincil }]}>İptal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const yil = parseInt(sihirbazDogumYili, 10);
                      if (!yil || yil < 1900 || yil > new Date().getFullYear() - 5) {
                        hataGoster('Geçerli bir doğum yılı giriniz.');
                        return;
                      }
                      setAktifModal({ tip: 'sihirbaz', adim: 2 });
                    }}
                    style={[styles.modalOnayButon, { backgroundColor: renkler.birincil }]}
                    accessibilityRole="button"
                    accessibilityLabel="İleri"
                  >
                    <Text style={styles.modalOnayMetin}>İleri →</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* ADIM 2: Ergenlik Yaşı */}
            {aktifModal?.tip === 'sihirbaz' && aktifModal.adim === 2 && (
              <>
                <Text style={[styles.sihirbazSoru, { color: renkler.metin }]}>
                  Ergenlik yaşınız neydi?
                </Text>
                <Text style={[styles.sihirbazAciklama, { color: renkler.metinIkincil }]}>
                  Namaz borcu ergenlikten itibaren başlar.
                </Text>
                <View style={styles.ergenlikButonlar}>
                  {[12, 13, 14, 15, 16].map((yas) => (
                    <TouchableOpacity
                      key={yas}
                      onPress={() => setSihirbazErgenlikYasi(yas)}
                      accessibilityRole="button"
                      accessibilityLabel={`${yas} yaş`}
                      accessibilityState={{ selected: sihirbazErgenlikYasi === yas }}
                      style={[
                        styles.ergenlikButon,
                        {
                          backgroundColor:
                            sihirbazErgenlikYasi === yas ? renkler.birincil : renkler.arkaplan,
                          borderColor: renkler.birincil,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.ergenlikButonMetin,
                          { color: sihirbazErgenlikYasi === yas ? '#fff' : renkler.birincil },
                        ]}
                      >
                        {yas}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.modalButonlar}>
                  <TouchableOpacity
                    onPress={() => setAktifModal({ tip: 'sihirbaz', adim: 1 })}
                    style={[styles.modalIptalButon, { borderColor: renkler.sinir }]}
                    accessibilityRole="button"
                    accessibilityLabel="Geri"
                  >
                    <Text style={[styles.modalIptalMetin, { color: renkler.metinIkincil }]}>← Geri</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setAktifModal({ tip: 'sihirbaz', adim: 3 })}
                    style={[styles.modalOnayButon, { backgroundColor: renkler.birincil }]}
                    accessibilityRole="button"
                    accessibilityLabel="İleri"
                  >
                    <Text style={styles.modalOnayMetin}>İleri →</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* ADIM 3: Kılınan Tahmini Yüzde */}
            {aktifModal?.tip === 'sihirbaz' && aktifModal.adim === 3 && (
              <>
                <Text style={[styles.sihirbazSoru, { color: renkler.metin }]}>
                  Ergenlikten bugüne namazlarınızın yaklaşık yüzde kaçını kıldınız?
                </Text>
                <View style={styles.yuzdeButonlar}>
                  {[0, 10, 25, 50, 75, 90].map((yuzde) => (
                    <TouchableOpacity
                      key={yuzde}
                      onPress={() => setSihirbazKildigiYuzde(yuzde)}
                      accessibilityRole="button"
                      accessibilityLabel={`Yüzde ${yuzde}`}
                      accessibilityState={{ selected: sihirbazKildigiYuzde === yuzde }}
                      style={[
                        styles.yuzdeButon,
                        {
                          backgroundColor:
                            sihirbazKildigiYuzde === yuzde ? renkler.birincil : renkler.arkaplan,
                          borderColor: renkler.birincil,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.yuzdeButonMetin,
                          {
                            color:
                              sihirbazKildigiYuzde === yuzde ? '#fff' : renkler.birincil,
                          },
                        ]}
                      >
                        %{yuzde}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={[styles.sihirbazNot, { color: renkler.metinIkincil }]}>
                  Şüphe durumunda daha düşük bir oran seçmeniz önerilir. Daha sonra namaz bazında ince ayar yapabilirsiniz.
                </Text>
                <View style={styles.modalButonlar}>
                  <TouchableOpacity
                    onPress={() => setAktifModal({ tip: 'sihirbaz', adim: 2 })}
                    style={[styles.modalIptalButon, { borderColor: renkler.sinir }]}
                    accessibilityRole="button"
                    accessibilityLabel="Geri"
                  >
                    <Text style={[styles.modalIptalMetin, { color: renkler.metinIkincil }]}>← Geri</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSihirbazTamamla}
                    style={[styles.modalOnayButon, { backgroundColor: renkler.birincil }]}
                    accessibilityRole="button"
                  >
                    <Text style={styles.modalOnayMetin}>Önizleyin</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* KONTROL BEKLEYEN GÜNLER */}
      <KazaBekleyenGunlerModal
        gorunur={aktifModal?.tip === 'bekleyenGunler'}
        gunler={kazaDurumu.bekleyenGunler ?? []}
        onKapat={() => setAktifModal(null)}
      />

      {/* FAZLA KILINANI SIFIRLA — kalan DEĞİŞMEZ, yalnız fazla göstergesi */}
      <BildirimModali
        gorunur={aktifModal?.tip === 'fazlaSifirla'}
        tip="bilgi"
        baslik="Fazla kılınan sıfırlansın mı?"
        mesaj={`Hesaplanan borçtan ${kazaDurumu.toplamFazla ?? 0} fazla kaza kılmışsınız. Bu sayı ileride eklenen borçlardan düşülmez, yalnız gösterilir. Sıfırlarsanız kalan değişmez; işlem hareket geçmişinde görünür.`}
        birincilEtiket="Sıfırlayın"
        birincilIkon="eraser"
        onBirincil={() => {
          dispatch(fazlayiSifirla());
          setAktifModal(null);
        }}
        kapatEtiketi="Vazgeçin"
        onKapat={() => setAktifModal(null)}
      />

      {/* Hata bildirimi — Alert.alert yerine tema-uyumlu modal */}
      <BildirimModali
        gorunur={hataModali.gorunur}
        tip="hata"
        baslik="Geçersiz giriş"
        mesaj={hataModali.mesaj}
        birincilEtiket="Tamam"
        birincilIkon="check"
        onBirincil={hataKapat}
        onKapat={hataKapat}
      />
    </SafeAreaView>
  );
};

// ==================== STİLLER ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  yukleniyorKonteyner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yukleniyorMetin: {
    fontSize: 16,
  },

  // BAŞLIK
  baslik: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  baslikIcerik: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  baslikMetin: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  baslikSagButonlar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ikonButon: {
    padding: 4,
  },

  // SCROLL
  scrollIcerik: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  // MEKRUH BANNER
  mekruhBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  mekruhMetin: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },

  // TOPLAM KART
  toplamKart: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  toplamKartUst: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  toplamEtiket: {
    fontSize: 13,
    marginBottom: 4,
  },
  toplamSayi: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
  },
  toplamKartSag: {
    alignItems: 'flex-end',
  },
  tamamlananKucuk: {
    fontSize: 12,
    marginBottom: 2,
  },
  tamamlananSayi: {
    fontSize: 24,
    fontWeight: '700',
  },
  yuzdeMetin: {
    fontSize: 12,
    marginTop: 2,
  },
  tahminiSatir: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  tahminiMetin: {
    fontSize: 13,
  },

  // PROGRESS BAR
  progressKonteyner: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressDolgu: {
    height: '100%',
    borderRadius: 3,
  },

  // MOTİVASYON
  motivasyonKart: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 12,
  },
  motivasyonBaslik: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  motivasyonBaslikMetin: {
    fontSize: 13,
    fontWeight: '700',
  },
  motivasyonAciklama: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 12,
  },
  senaryoButonlar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  senaryoButon: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  senaryoButonMetin: {
    fontSize: 13,
    fontWeight: '600',
  },

  // GÜNLÜK HEDEF
  gunlukHedefKart: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  gunlukHedefUst: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gunlukHedefEtiket: {
    fontSize: 15,
    fontWeight: '700',
  },
  gunlukHedefSatir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  gunlukHedefSayilar: {
    fontSize: 14,
  },
  hedefTamamBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  hedefTamamMetin: {
    fontSize: 12,
    fontWeight: '600',
  },
  hedefsizMetin: {
    fontSize: 13,
    lineHeight: 18,
  },

  // KAZA ÖNERİSİ
  oneriKart: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  oneriIkon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  oneriMetinler: {
    flex: 1,
    gap: 4,
  },

  // NAMAZ KARTLARI
  namazKartlarBaslik: {
    marginBottom: 8,
    marginTop: 4,
  },
  bolumBasligi: {
    fontSize: 15,
    fontWeight: '700',
  },
  namazKart: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  namazKartSol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  namazIkonKonteyner: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  namazAdi: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  namazKalanMetin: {
    fontSize: 12,
  },
  namazKartSag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  namazButon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  namazTamamlaButon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  namazTamamlaMetin: {
    fontSize: 13,
    fontWeight: '600',
  },

  // SİHİRBAZ BUTONU
  sihirbazButon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
  },
  kaynakOzeti: {
    marginTop: 8,
  },
  fazlaSatir: {
    minHeight: 44,
  },
  altiCizili: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  otoCip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    minHeight: 52,
    gap: 12,
  },
  otoCipMetin: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  inceleButon: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inceleMetin: {
    fontSize: 14,
    fontWeight: '700',
  },
  sihirbazButonMetin: {
    fontSize: 15,
    fontWeight: '600',
  },

  // MODALLER — ORTAK
  modalArkaPlan: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalKonteyner: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
  },
  modalBaslik: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  modalAciklama: {
    fontSize: 14,
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  modalButonlar: {
    flexDirection: 'row',
    gap: 12,
  },
  modalIptalButon: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  modalIptalMetin: {
    fontSize: 15,
    fontWeight: '600',
  },
  modalOnayButon: {
    flex: 1,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  modalOnayMetin: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },

  // SİHİRBAZ MODAL
  sihirbazKonteyner: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
  },
  sihirbazBaslikSatir: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sihirbazAdimMetin: {
    fontSize: 13,
    marginBottom: 16,
  },
  sihirbazSoru: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 22,
  },
  sihirbazAciklama: {
    fontSize: 13,
    marginBottom: 16,
  },
  sihirbazNot: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  ergenlikButonlar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  ergenlikButon: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  ergenlikButonMetin: {
    fontSize: 16,
    fontWeight: '700',
  },
  yuzdeButonlar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  yuzdeButon: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  yuzdeButonMetin: {
    fontSize: 15,
    fontWeight: '700',
  },
});
