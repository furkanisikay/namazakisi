/**
 * Kaza ayarları (Kaza Defteri 2.0, ekran 3 — rota adı `KazaOtomatikAyar` korunur).
 *
 * Sade tasarım Dalga 4: kökteki "Her farzla bir kaza" anahtarı buraya taşındı (kaza
 * kökü yalnız kalan + vakit satırları taşır). Ayar yolu DEĞİŞMEDİ:
 * `kazaOneriAyarlariniYukle` / `kazaOneriAyarlariniGuncelle` (`KAZA_ONERI_AYARLARI`).
 * Eskiden yalnız borç varken görünürdü; artık ayar sayfasında her zaman görünür.
 *
 * Otomatik kaza ekleme:
 *
 * Varsayılan KAPALI. Açıldığı günden önceye kendiliğinden GİTMEZ; geçmişe dönük
 * tarama ayrı bir düğme ve ÖNİZLEME ister (en fazla `GECMIS_TARAMA_AZAMI_GUN`).
 * Ayar defterdedir (`otoAyar` hareketi) → iki cihaz aynı izdüşümü hesaplar.
 * Vitir ayrı bir anahtar DEĞİLDİR: ORTAK mezhep ayarına bağlıdır (Hanefî: vacip).
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { YonluIkon } from '../../components/common/YonluIkon';
import { useRenkler } from '../../../core/theme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  kazaVerileriniYukle,
  otomatikAyarla,
  kazaOneriAyarlariniYukle,
  kazaOneriAyarlariniGuncelle,
} from '../../store/kazaSlice';
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
import { bicim, sayili, sayiYaz } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';

const TARAMA_GUNLERI: readonly number[] = [7, 30, 90, GECMIS_TARAMA_AZAMI_GUN];
const NASIL_IKONLARI = ['hourglass-end', 'plus-circle', 'undo'] as const;

export const KazaOtomatikAyarSayfasi: React.FC = () => {
  const renkler = useRenkler();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const kazaDurumu = useAppSelector((s) => s.kaza.kazaDurumu);
  // "Her farzdan sonra kaza önerin" (issue #294) — eski test/mock state'inde alan olmayabilir.
  const oneriAyarlari = useAppSelector((s) => s.kaza.oneriAyarlari);
  const oneriAyarlariYuklendi = useAppSelector((s) => s.kaza.oneriAyarlariYuklendi);
  const [mezhep, setMezhep] = useState<Mezhep | null>(null);
  const [taramaGun, setTaramaGun] = useState<number | null>(null);
  const [onizleme, setOnizleme] = useState<KazaDefteri.GecmisTaramaOnizlemesi | null>(null);
  const [mesgul, setMesgul] = useState(false);
  const sozluk = useMetin().kaza;
  const m = sozluk.ayar;

  const taramaSecenekleri = useMemo(
    () =>
      TARAMA_GUNLERI.map((gun) => ({
        gun,
        etiket: gun === GECMIS_TARAMA_AZAMI_GUN ? m.sonYil : sayili(sozluk.sonGun, gun),
      })),
    [m, sozluk]
  );
  const nasilCalisir = useMemo(
    () => [m.nasil1, m.nasil2, m.nasil3].map((metin, i) => ({ ikon: NASIL_IKONLARI[i], metin })),
    [m]
  );

  useEffect(() => {
    dispatch(kazaOneriAyarlariniYukle());
  }, [dispatch]);

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
        kisaBildirimGoster(m.kaydedilemedi);
        return false;
      } finally {
        setMesgul(false);
      }
    },
    [dispatch, m]
  );

  const taramaSec = useCallback(
    async (gun: number) => {
      setTaramaGun(gun);
      setOnizleme(null);
      try {
        setOnizleme(await KazaDefteri.gecmisTaramaOnizlemesi(gunEkle(bugun, -gun)));
      } catch {
        kisaBildirimGoster(m.onizlemeHata);
      }
    },
    [bugun, m]
  );

  const taramayiUygula = useCallback(async () => {
    if (!onizleme) return;
    const tamam = await yaz(
      { aktif: true, gun: onizleme.baslangic, kayitsiz: oto?.kayitsiz },
      bicim(m.tarandi, { gun: gunMetni(onizleme.baslangic) })
    );
    if (tamam) {
      setTaramaGun(null);
      setOnizleme(null);
    }
  }, [onizleme, oto?.kayitsiz, yaz, m]);

  if (!kazaDurumu || !oto) {
    return (
      <SafeAreaView style={[stiller.kap, { backgroundColor: renkler.arkaplan }]} edges={['bottom', 'left', 'right']}>
        <Text style={[stiller.yukleniyor, { color: renkler.metinIkincil }]}>{sozluk.yukleniyor}</Text>
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
          {m.ozet}
        </Text>

        <KazaKart>
          <View style={stiller.anahtarSatiri}>
            <IkonCipi ikon="robot" renk={renkler.birincil} />
            <View style={stiller.esnek}>
              <Text style={[stiller.baslik, { color: renkler.metin }]}>{m.kilinmayanEkle}</Text>
              <Text style={[stiller.alt, { color: renkler.metinIkincil }]}>
                {oto.aktif && oto.baslangic ? bicim(m.acikBeri, { gun: gunMetni(oto.baslangic) }) : m.kapali}
              </Text>
            </View>
            <Anahtar
              value={oto.aktif}
              disabled={mesgul}
              onValueChange={(acik) => {
                void yaz(
                  { aktif: acik, kayitsiz: oto.kayitsiz },
                  acik ? sozluk.satir.otoAcildi : sozluk.satir.otoKapatildi
                );
              }}
              trackColor={{ false: renkler.sinir, true: `${renkler.birincil}60` }}
              thumbColor={oto.aktif ? renkler.birincil : renkler.kartArkaplan}
              accessibilityLabel={m.kilinmayanErisim}
            />
          </View>
        </KazaKart>

        <BolumBasligi>{m.herFarzBaslik}</BolumBasligi>
        <KazaKart>
          <View style={stiller.anahtarSatiri}>
            <IkonCipi ikon="link" renk={renkler.birincil} />
            <View style={stiller.esnek}>
              <Text style={[stiller.baslik, { color: renkler.metin }]}>{m.farzSonrasi}</Text>
              <Text style={[stiller.alt, { color: renkler.metinIkincil }]}>
                {m.farzSonrasiAlt}
              </Text>
            </View>
            {oneriAyarlariYuklendi && oneriAyarlari ? (
              <Anahtar
                value={oneriAyarlari.farzSonrasiOner}
                onValueChange={(acik) => {
                  dispatch(kazaOneriAyarlariniGuncelle({ farzSonrasiOner: acik }));
                }}
                trackColor={{ false: renkler.sinir, true: `${renkler.birincil}60` }}
                thumbColor={oneriAyarlari.farzSonrasiOner ? renkler.birincil : renkler.kartArkaplan}
                accessibilityLabel={m.farzSonrasiErisim}
              />
            ) : null}
          </View>
        </KazaKart>

        <BolumBasligi>{m.neOlurBaslik}</BolumBasligi>
        <KazaKart>
          {nasilCalisir.map((a, i) => (
            <View key={a.metin} style={[stiller.adim, i > 0 && stiller.adimAra]}>
              <IkonCipi ikon={a.ikon} renk={renkler.bilgi} boyut={32} />
              <Text style={[stiller.adimMetin, { color: renkler.metin }]}>{a.metin}</Text>
            </View>
          ))}
        </KazaKart>

        <BolumBasligi>{m.vitirBaslik}</BolumBasligi>
        <KazaKart>
          <View style={stiller.anahtarSatiri}>
            <IkonCipi ikon="star-half-alt" renk={renkler.vurgu} />
            <View style={stiller.esnek}>
              <Text style={[stiller.baslik, { color: renkler.metin }]}>
                {vitirEklenir === null ? m.mezhepOkunuyor : vitirEklenir ? m.vitirEklenir : m.vitirEklenmez}
              </Text>
              <Text style={[stiller.alt, { color: renkler.metinIkincil }]}>
                {mezhep
                  ? bicim(m.mezhep, { mezhep: MEZHEP_ADLARI[mezhep], vacip: vitirEklenir ? m.vitirVacip : '' })
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
            accessibilityLabel={m.mezhepErisim}
            style={stiller.baglanti}
          >
            <Text style={[stiller.baglantiMetin, { color: renkler.metin }]}>{m.mezhepDegistir}</Text>
            <YonluIkon name="chevron-right" size={12} color={renkler.metinIkincil} />
          </TouchableOpacity>
        </KazaKart>

        <BolumBasligi>{m.isaretsizBaslik}</BolumBasligi>
        <KazaKart>
          <View style={stiller.ciplar}>
            <SecimCipi
              etiket={m.banaSorun}
              secili={oto.kayitsiz === 'sor'}
              onPress={() => yaz({ aktif: oto.aktif, kayitsiz: 'sor' }, m.sorulacak)}
            />
            <SecimCipi
              etiket={m.dogrudanEkleyin}
              secili={oto.kayitsiz === 'ekle'}
              onPress={() => yaz({ aktif: oto.aktif, kayitsiz: 'ekle' }, m.dogrudanEklenecek)}
            />
          </View>
          <Text style={[stiller.alt, { color: renkler.metinIkincil }]}>
            {m.isaretsizAlt}
          </Text>
        </KazaKart>
        <Text style={[stiller.not, { color: renkler.metinIkincil }]}>
          {m.ozelGunNot}
        </Text>

        <BolumBasligi>{m.gecmisBaslik}</BolumBasligi>
        <KazaKart>
          <Text style={[stiller.alt, { color: renkler.metinIkincil }]}>
            {m.gecmisAlt}
          </Text>
          <View style={[stiller.ciplar, stiller.ustBosluk]}>
            {taramaSecenekleri.map((t) => (
              <SecimCipi key={t.gun} etiket={t.etiket} secili={taramaGun === t.gun} onPress={() => taramaSec(t.gun)} />
            ))}
          </View>
          {taramaGun !== null && taramaGereksiz && (
            <Text style={[stiller.alt, { color: renkler.metin }]}>
              {m.kapsiyor}
            </Text>
          )}
          {onizleme && !taramaGereksiz && (
            <View testID="gecmis-tarama-onizleme">
              <Text style={[stiller.baslik, { color: renkler.metin }]}>
                {onizleme.eklenecek > 0 ? sayili(m.kayitEklenecek, onizleme.eklenecek) : m.kayitYok}
              </Text>
              <Text style={[stiller.alt, { color: renkler.metinIkincil }]}>
                {bicim(m.onizlemeAlt, {
                  gun: gunMetni(onizleme.baslangic),
                  eski: sayiYaz(onizleme.eskiKalan),
                  yeni: sayiYaz(onizleme.yeniKalan),
                })}
                {onizleme.bekleyenGun > 0 ? sayili(m.bekleyenSorulacak, onizleme.bekleyenGun) : ''}
              </Text>
              {!oto.aktif && (
                <Text style={[stiller.alt, { color: renkler.metinIkincil }]}>{m.taramaAcar}</Text>
              )}
              <KazaDugme
                etiket={m.tarayin}
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
