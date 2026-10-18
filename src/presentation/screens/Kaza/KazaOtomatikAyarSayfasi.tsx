/**
 * Otomatik kaza ekleme ayarı (Kaza Defteri 2.0, ekran 3).
 *
 * Varsayılan KAPALI. Açıldığı günden önceye kendiliğinden GİTMEZ; geçmişe dönük
 * tarama ayrı bir düğme ve ÖNİZLEME ister (en fazla `GECMIS_TARAMA_AZAMI_GUN`).
 * Ayar defterdedir (`otoAyar` hareketi) → iki cihaz aynı izdüşümü hesaplar.
 * Vitir ayrı bir anahtar DEĞİLDİR: ORTAK mezhep ayarına bağlıdır (Hanefî: vacip).
 */
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { kazaVerileriniYukle, otomatikAyarla } from '../../store/kazaSlice';
import * as KazaDefteri from '../../../domain/services/KazaDefteriServisi';
import { LocalMezhepServisi } from '../../../data/local/LocalMezhepServisi';
import { MEZHEP_ADLARI, vitirOtomatikEklenirMi, type Mezhep } from '../../../core/mezhep/mezhepAyari';
import { GECMIS_TARAMA_AZAMI_GUN } from '../../../core/kaza/kazaDefteriHesabi';
import { gunEkle } from '../../../core/utils/TarihYardimcisi';
import { Anahtar } from '../../components/common/Anahtar';
import { kisaBildirimGoster } from '../../components/common/KisaBildirim';
import { BolumBasligi, IkonCipi, KazaDugme, KazaKart, SecimCipi } from '../../components/kaza/KazaOrtak';
import { gunMetni } from '../../components/kaza/kazaMetinleri';
import type { KayitsizGunTercihi } from '../../../core/kaza/kazaHareketi';

const TARAMA_SECENEKLERI: ReadonlyArray<{ gun: number; etiket: string }> = [
  { gun: 7, etiket: 'Son 7 gün' },
  { gun: 30, etiket: 'Son 30 gün' },
  { gun: 90, etiket: 'Son 90 gün' },
  { gun: GECMIS_TARAMA_AZAMI_GUN, etiket: 'Son 1 yıl' },
];

const NASIL_CALISIR: ReadonlyArray<{ ikon: string; metin: string }> = [
  { ikon: 'hourglass-end', metin: 'Vakit işaretlenmeden çıkar' },
  { ikon: 'plus-circle', metin: 'Namaz günü bitince (ertesi imsak) deftere +1 eklenir' },
  { ikon: 'undo', metin: 'Sonra "kıldım" derseniz kendiliğinden geri alınır' },
];

export const KazaOtomatikAyarSayfasi: React.FC = () => {
  const renkler = useRenkler();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const kazaDurumu = useAppSelector((s) => s.kaza.kazaDurumu);
  const [mezhep, setMezhep] = useState<Mezhep | null>(null);
  const [taramaGun, setTaramaGun] = useState<number | null>(null);
  const [onizleme, setOnizleme] = useState<KazaDefteri.GecmisTaramaOnizlemesi | null>(null);
  const [mesgul, setMesgul] = useState(false);

  useEffect(() => {
    if (!kazaDurumu) dispatch(kazaVerileriniYukle());
    let iptal = false;
    LocalMezhepServisi.oku().then((m) => {
      if (!iptal) setMezhep(m);
    });
    return () => {
      iptal = true;
    };
  }, [dispatch, kazaDurumu]);

  const oto = kazaDurumu?.otomatik;
  const bugun = KazaDefteri.bugunNamazGunuAl();

  const yaz = useCallback(
    async (arg: { aktif: boolean; kayitsiz?: KayitsizGunTercihi; gun?: string }, basari: string) => {
      setMesgul(true);
      try {
        await dispatch(otomatikAyarla(arg)).unwrap();
        kisaBildirimGoster(basari);
        return true;
      } catch {
        kisaBildirimGoster('Ayar kaydedilemedi. Lütfen tekrar deneyin.');
        return false;
      } finally {
        setMesgul(false);
      }
    },
    [dispatch]
  );

  const taramaSec = useCallback(
    async (gun: number) => {
      setTaramaGun(gun);
      setOnizleme(null);
      try {
        setOnizleme(await KazaDefteri.gecmisTaramaOnizlemesi(gunEkle(bugun, -gun)));
      } catch {
        kisaBildirimGoster('Önizleme hazırlanamadı. Lütfen tekrar deneyin.');
      }
    },
    [bugun]
  );

  const taramayiUygula = useCallback(async () => {
    if (!onizleme) return;
    const tamam = await yaz(
      { aktif: true, gun: onizleme.baslangic, kayitsiz: oto?.kayitsiz },
      `${gunMetni(onizleme.baslangic)} itibarıyla tarandı`
    );
    if (tamam) {
      setTaramaGun(null);
      setOnizleme(null);
    }
  }, [onizleme, oto?.kayitsiz, yaz]);

  if (!kazaDurumu || !oto) {
    return (
      <SafeAreaView style={[stiller.kap, { backgroundColor: renkler.arkaplan }]} edges={['bottom', 'left', 'right']}>
        <Text style={[stiller.yukleniyor, { color: renkler.metinIkincil }]}>Yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  const vitirEklenir = mezhep ? vitirOtomatikEklenirMi(mezhep) : null;
  // Başlangıç zaten seçilen aralıktan eskiyse taranacak bir şey yoktur.
  const taramaGereksiz =
    taramaGun !== null && oto.aktif && !!oto.baslangic && oto.baslangic <= gunEkle(bugun, -taramaGun);

  return (
    <SafeAreaView style={[stiller.kap, { backgroundColor: renkler.arkaplan }]} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={stiller.icerik}>
        <Text style={[stiller.ozet, { color: renkler.metinIkincil }]}>
          İşaretlemediğiniz farzlar, namaz günü bitince deftere kendiliğinden eklenir.
        </Text>

        <KazaKart>
          <View style={stiller.anahtarSatiri}>
            <IkonCipi ikon="robot" renk={renkler.birincil} />
            <View style={stiller.esnek}>
              <Text style={[stiller.baslik, { color: renkler.metin }]}>Kılınmayan farzları ekleyin</Text>
              <Text style={[stiller.alt, { color: renkler.metinIkincil }]}>
                {oto.aktif && oto.baslangic ? `${gunMetni(oto.baslangic)}'den beri açık` : 'Kapalı'}
              </Text>
            </View>
            <Anahtar
              value={oto.aktif}
              disabled={mesgul}
              onValueChange={(acik) => {
                void yaz(
                  { aktif: acik, kayitsiz: oto.kayitsiz },
                  acik ? 'Otomatik ekleme açıldı' : 'Otomatik ekleme kapatıldı'
                );
              }}
              trackColor={{ false: renkler.sinir, true: `${renkler.birincil}60` }}
              thumbColor={oto.aktif ? renkler.birincil : renkler.kartArkaplan}
              accessibilityLabel="Kılınmayan farzları otomatik ekleyin"
            />
          </View>
        </KazaKart>

        <BolumBasligi>Nasıl çalışır</BolumBasligi>
        <KazaKart>
          {NASIL_CALISIR.map((a, i) => (
            <View key={a.metin} style={[stiller.adim, i > 0 && stiller.adimAra]}>
              <IkonCipi ikon={a.ikon} renk={renkler.bilgi} boyut={32} />
              <Text style={[stiller.adimMetin, { color: renkler.metin }]}>{a.metin}</Text>
            </View>
          ))}
        </KazaKart>

        <BolumBasligi>Vitir</BolumBasligi>
        <KazaKart>
          <View style={stiller.anahtarSatiri}>
            <IkonCipi ikon="star-half-alt" renk={renkler.vurgu} />
            <View style={stiller.esnek}>
              <Text style={[stiller.baslik, { color: renkler.metin }]}>
                {vitirEklenir === null
                  ? 'Mezhebiniz okunuyor…'
                  : vitirEklenir
                    ? 'Yatsıyla birlikte vitir de eklenir'
                    : 'Vitir eklenmez'}
              </Text>
              <Text style={[stiller.alt, { color: renkler.metinIkincil }]}>
                {mezhep
                  ? `Mezhep: ${MEZHEP_ADLARI[mezhep]}${vitirEklenir ? ' · vitir vaciptir' : ''}. Namaz vakitlerini etkilemez.`
                  : ''}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() =>
              (navigation as unknown as { navigate: (ad: string, p?: object) => void }).navigate('Ayarlar', {
                screen: 'NamazVakitleriAyarlari',
              })
            }
            accessibilityRole="button"
            accessibilityLabel="Mezhebi ortak ayardan değiştirin"
            style={stiller.baglanti}
          >
            <Text style={[stiller.baglantiMetin, { color: renkler.metin }]}>Mezhebi değiştirin</Text>
            <FontAwesome5 name="chevron-right" size={12} color={renkler.metinIkincil} />
          </TouchableOpacity>
        </KazaKart>

        <BolumBasligi>Hiç işaret olmayan günler</BolumBasligi>
        <KazaKart>
          <View style={stiller.ciplar}>
            <SecimCipi
              etiket="Bana sorun"
              secili={oto.kayitsiz === 'sor'}
              onPress={() => yaz({ aktif: oto.aktif, kayitsiz: 'sor' }, 'Bu günler size sorulacak')}
            />
            <SecimCipi
              etiket="Doğrudan ekleyin"
              secili={oto.kayitsiz === 'ekle'}
              onPress={() => yaz({ aktif: oto.aktif, kayitsiz: 'ekle' }, 'Bu günler doğrudan eklenecek')}
            />
          </View>
          <Text style={[stiller.alt, { color: renkler.metinIkincil }]}>
            Uygulamayı açmadığınız günler yanlışlıkla borç yazmasın diye önce size gösterilir.
          </Text>
        </KazaKart>
        <Text style={[stiller.not, { color: renkler.metinIkincil }]}>
          Özel gün kaydı olan günler (hayız, nifas) eklenmez. Her otomatik kayıt hareket geçmişinde görünür ve tek
          dokunuşla kaldırılabilir.
        </Text>

        <BolumBasligi>Geçmiş günleri tarayın</BolumBasligi>
        <KazaKart>
          <Text style={[stiller.alt, { color: renkler.metinIkincil }]}>
            Başlangıcı geriye alırsanız kaç kayıt ekleneceğini önce gösteririz. En fazla bir yıl geriye gidilebilir.
          </Text>
          <View style={[stiller.ciplar, stiller.ustBosluk]}>
            {TARAMA_SECENEKLERI.map((t) => (
              <SecimCipi key={t.gun} etiket={t.etiket} secili={taramaGun === t.gun} onPress={() => taramaSec(t.gun)} />
            ))}
          </View>
          {taramaGun !== null && taramaGereksiz && (
            <Text style={[stiller.alt, { color: renkler.metin }]}>
              Otomatik ekleme bu aralığı zaten kapsıyor; eklenecek yeni kayıt yok.
            </Text>
          )}
          {onizleme && !taramaGereksiz && (
            <View testID="gecmis-tarama-onizleme">
              <Text style={[stiller.baslik, { color: renkler.metin }]}>
                {onizleme.eklenecek > 0 ? `${onizleme.eklenecek} kayıt eklenecek` : 'Eklenecek kayıt yok'}
              </Text>
              <Text style={[stiller.alt, { color: renkler.metinIkincil }]}>
                {gunMetni(onizleme.baslangic)}'den itibaren · Kalan kaza {onizleme.eskiKalan.toLocaleString('tr-TR')} →{' '}
                {onizleme.yeniKalan.toLocaleString('tr-TR')}
                {onizleme.bekleyenGun > 0 ? ` · ${onizleme.bekleyenGun} işaretsiz gün size sorulacak` : ''}
              </Text>
              {!oto.aktif && (
                <Text style={[stiller.alt, { color: renkler.metinIkincil }]}>Tarama otomatik eklemeyi de açar.</Text>
              )}
              <KazaDugme
                etiket="Tarayın ve ekleyin"
                ikon="search"
                onPress={taramayiUygula}
                devreDisi={mesgul || (onizleme.eklenecek === 0 && onizleme.bekleyenGun === 0)}
                style={stiller.ustBosluk}
              />
            </View>
          )}
        </KazaKart>
      </ScrollView>
    </SafeAreaView>
  );
};

const stiller = StyleSheet.create({
  kap: { flex: 1 },
  icerik: { padding: 16, paddingBottom: 32 },
  yukleniyor: { textAlign: 'center', marginTop: 32, fontSize: 15 },
  ozet: { fontSize: 14, lineHeight: 20, marginBottom: 12, marginHorizontal: 4 },
  anahtarSatiri: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  esnek: { flex: 1 },
  baslik: { fontSize: 15, fontWeight: '700' },
  alt: { fontSize: 13, lineHeight: 18, marginTop: 2 },
  adim: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  adimAra: { marginTop: 12 },
  adimMetin: { flex: 1, fontSize: 14 },
  ciplar: { flexDirection: 'row', flexWrap: 'wrap' },
  not: { fontSize: 12, lineHeight: 17, marginBottom: 8, marginHorizontal: 4 },
  ustBosluk: { marginTop: 10 },
  baglanti: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44, marginTop: 8 },
  baglantiMetin: { fontSize: 14, fontWeight: '600' },
});
