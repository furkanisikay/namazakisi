/**
 * Kaza Defteri Sayfası
 * Kaza namazı takibi: borç ekleme, tamamlama, motivasyon, mekruh vakit uyarısı
 */

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  kazaVerileriniYukle,
  borcEkle,
  kazaTamamla,
  sihirbazIleBaslat,
  gunlukHedefiGuncelle,
  gizlemeToggle,
} from '../store/kazaSlice';
import { useRenkler } from '../../core/theme';
import { KazaNamazAdi } from '../../core/types/KazaTipleri';
import {
  mekruhVakitKontrolEt,
  tahminiTarihiFormatla,
  motivasyonOnerileriHesapla,
} from '../../domain/services/KazaHesaplayiciServisi';

// ==================== TİPLER ====================

type ModalTipi =
  | { tip: 'borcEkle'; namazAdi: KazaNamazAdi }
  | { tip: 'topluTamamla'; namazAdi: KazaNamazAdi | null }
  | { tip: 'gunlukHedef' }
  | { tip: 'sihirbaz'; adim: 1 | 2 | 3 };

// ==================== NAMAZ SIRASI & İKON ====================

const NAMAZ_IKONLARI: Record<KazaNamazAdi, string> = {
  Sabah: 'sun',
  'Öğle': 'cloud-sun',
  'İkindi': 'cloud',
  'Akşam': 'moon',
  'Yatsı': 'star',
  Vitir: 'star-half-alt',
};

// ==================== ANA BİLEŞEN ====================

export const KazaDefteriSayfasi: React.FC = () => {
  const dispatch = useAppDispatch();
  const renkler = useRenkler();

  const { kazaDurumu, istatistik, yukleniyor } = useAppSelector((s) => s.kaza);
  const koordinatlar = useAppSelector((s) => s.konum.koordinatlar);

  // Modal state
  const [aktifModal, setAktifModal] = useState<ModalTipi | null>(null);
  const [modalGirdi, setModalGirdi] = useState('');

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

  // ==================== YÜKLEME ====================

  useEffect(() => {
    dispatch(kazaVerileriniYukle());
  }, [dispatch]);

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
  }, [koordinatlar]);

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
      Alert.alert('Hata', 'Geçerli bir sayı giriniz.');
      return;
    }
    const modal = aktifModal as { tip: 'topluTamamla'; namazAdi: KazaNamazAdi | null };
    dispatch(kazaTamamla({ namazAdi: modal.namazAdi, sayi }));
    tamamlamaFlash();
    setAktifModal(null);
    setModalGirdi('');
  }, [dispatch, aktifModal, modalGirdi, tamamlamaFlash]);

  const handleBorcEkleGonder = useCallback(() => {
    const sayi = parseInt(modalGirdi, 10);
    if (!sayi || sayi <= 0) {
      Alert.alert('Hata', 'Geçerli bir sayı giriniz.');
      return;
    }
    const modal = aktifModal as { tip: 'borcEkle'; namazAdi: KazaNamazAdi };
    dispatch(borcEkle({ namazAdi: modal.namazAdi, sayi }));
    setAktifModal(null);
    setModalGirdi('');
  }, [dispatch, aktifModal, modalGirdi]);

  const handleGunlukHedefGonder = useCallback(() => {
    const hedef = parseInt(modalGirdi, 10);
    if (isNaN(hedef) || hedef < 0) {
      Alert.alert('Hata', 'Geçerli bir sayı giriniz (0 = hedefsiz).');
      return;
    }
    dispatch(gunlukHedefiGuncelle({ hedef }));
    setAktifModal(null);
    setModalGirdi('');
  }, [dispatch, modalGirdi]);

  const handleSihirbazTamamla = useCallback(() => {
    const dogumYili = parseInt(sihirbazDogumYili, 10);
    const bugunYili = new Date().getFullYear();
    if (!dogumYili || dogumYili < 1900 || dogumYili > bugunYili - 5) {
      Alert.alert('Hata', 'Geçerli bir doğum yılı giriniz.');
      return;
    }
    const dogumTarihi = `${dogumYili}-01-01`;
    dispatch(
      sihirbazIleBaslat({
        dogumTarihi,
        ergenlikYasi: sihirbazErgenlikYasi,
        kildigiTahminiYuzdesi: sihirbazKildigiYuzde,
      })
    );
    setAktifModal(null);
    setSihirbazDogumYili('');
  }, [dispatch, sihirbazDogumYili, sihirbazErgenlikYasi, sihirbazKildigiYuzde]);

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
            onPress={() => dispatch(gizlemeToggle())}
            style={styles.ikonButon}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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

        {/* SİHİRBAZ BUTONU */}
        <TouchableOpacity
          onPress={() =>
            setAktifModal({ tip: 'sihirbaz', adim: 1 })
          }
          style={[
            styles.sihirbazButon,
            { borderColor: renkler.birincil, backgroundColor: renkler.kartArkaplan },
          ]}
        >
          <FontAwesome5 name="magic" size={16} color={renkler.birincil} />
          <Text style={[styles.sihirbazButonMetin, { color: renkler.birincil }]}>
            Hesaplama Sihirbazı ile Başla
          </Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ==================== MODALLER ==================== */}

      {/* BORÇ EKLE MODAL */}
      <Modal
        visible={aktifModal?.tip === 'borcEkle'}
        transparent
        animationType="fade"
        onRequestClose={() => setAktifModal(null)}
      >
        <KeyboardAvoidingView
          style={styles.modalArkaPlan}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.modalKonteyner, { backgroundColor: renkler.kartArkaplan }]}>
            <Text style={[styles.modalBaslik, { color: renkler.metin }]}>
              Borç Ekle —{' '}
              {aktifModal?.tip === 'borcEkle' ? aktifModal.namazAdi : ''}
            </Text>
            <Text style={[styles.modalAciklama, { color: renkler.metinIkincil }]}>
              Kaç kaza eklenmesini istiyorsunuz?
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                { borderColor: renkler.sinir, color: renkler.metin, backgroundColor: renkler.arkaplan },
              ]}
              keyboardType="number-pad"
              placeholder="Örn: 100"
              placeholderTextColor={renkler.metinIkincil}
              value={modalGirdi}
              onChangeText={setModalGirdi}
              autoFocus
            />
            <View style={styles.modalButonlar}>
              <TouchableOpacity
                onPress={() => { setAktifModal(null); setModalGirdi(''); }}
                style={[styles.modalIptalButon, { borderColor: renkler.sinir }]}
              >
                <Text style={[styles.modalIptalMetin, { color: renkler.metinIkincil }]}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleBorcEkleGonder}
                style={[styles.modalOnayButon, { backgroundColor: renkler.birincil }]}
              >
                <Text style={styles.modalOnayMetin}>Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* TOPLU TAMAMLA MODAL */}
      <Modal
        visible={aktifModal?.tip === 'topluTamamla'}
        transparent
        animationType="fade"
        onRequestClose={() => setAktifModal(null)}
      >
        <KeyboardAvoidingView
          style={styles.modalArkaPlan}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.modalKonteyner, { backgroundColor: renkler.kartArkaplan }]}>
            <Text style={[styles.modalBaslik, { color: renkler.metin }]}>
              Toplu Tamamla
              {aktifModal?.tip === 'topluTamamla' && aktifModal.namazAdi
                ? ` — ${aktifModal.namazAdi}`
                : ''}
            </Text>
            <Text style={[styles.modalAciklama, { color: renkler.metinIkincil }]}>
              Kaç kaza kıldınız?
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                { borderColor: renkler.sinir, color: renkler.metin, backgroundColor: renkler.arkaplan },
              ]}
              keyboardType="number-pad"
              placeholder="Örn: 5"
              placeholderTextColor={renkler.metinIkincil}
              value={modalGirdi}
              onChangeText={setModalGirdi}
              autoFocus
            />
            <View style={styles.modalButonlar}>
              <TouchableOpacity
                onPress={() => { setAktifModal(null); setModalGirdi(''); }}
                style={[styles.modalIptalButon, { borderColor: renkler.sinir }]}
              >
                <Text style={[styles.modalIptalMetin, { color: renkler.metinIkincil }]}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleTopluTamamlaGonder}
                style={[styles.modalOnayButon, { backgroundColor: renkler.birincil }]}
              >
                <Text style={styles.modalOnayMetin}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* GÜNLÜK HEDEF MODAL */}
      <Modal
        visible={aktifModal?.tip === 'gunlukHedef'}
        transparent
        animationType="fade"
        onRequestClose={() => setAktifModal(null)}
      >
        <KeyboardAvoidingView
          style={styles.modalArkaPlan}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.modalKonteyner, { backgroundColor: renkler.kartArkaplan }]}>
            <Text style={[styles.modalBaslik, { color: renkler.metin }]}>
              Günlük Hedef
            </Text>
            <Text style={[styles.modalAciklama, { color: renkler.metinIkincil }]}>
              Günlük kaç kaza kılmayı hedefliyorsunuz? (0 = hedefsiz)
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                { borderColor: renkler.sinir, color: renkler.metin, backgroundColor: renkler.arkaplan },
              ]}
              keyboardType="number-pad"
              placeholder="Örn: 3"
              placeholderTextColor={renkler.metinIkincil}
              value={modalGirdi}
              onChangeText={setModalGirdi}
              autoFocus
            />
            <View style={styles.modalButonlar}>
              <TouchableOpacity
                onPress={() => { setAktifModal(null); setModalGirdi(''); }}
                style={[styles.modalIptalButon, { borderColor: renkler.sinir }]}
              >
                <Text style={[styles.modalIptalMetin, { color: renkler.metinIkincil }]}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleGunlukHedefGonder}
                style={[styles.modalOnayButon, { backgroundColor: renkler.birincil }]}
              >
                <Text style={styles.modalOnayMetin}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
                  >
                    <Text style={[styles.modalIptalMetin, { color: renkler.metinIkincil }]}>İptal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const yil = parseInt(sihirbazDogumYili, 10);
                      if (!yil || yil < 1900 || yil > new Date().getFullYear() - 5) {
                        Alert.alert('Hata', 'Geçerli bir doğum yılı giriniz.');
                        return;
                      }
                      setAktifModal({ tip: 'sihirbaz', adim: 2 });
                    }}
                    style={[styles.modalOnayButon, { backgroundColor: renkler.birincil }]}
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
                  >
                    <Text style={[styles.modalIptalMetin, { color: renkler.metinIkincil }]}>← Geri</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setAktifModal({ tip: 'sihirbaz', adim: 3 })}
                    style={[styles.modalOnayButon, { backgroundColor: renkler.birincil }]}
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
                  >
                    <Text style={[styles.modalIptalMetin, { color: renkler.metinIkincil }]}>← Geri</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSihirbazTamamla}
                    style={[styles.modalOnayButon, { backgroundColor: renkler.birincil }]}
                  >
                    <Text style={styles.modalOnayMetin}>Hesapla</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
