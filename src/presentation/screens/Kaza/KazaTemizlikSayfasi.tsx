/**
 * Kayıtları temizleyin (Kaza Defteri 2.0, ekran 5).
 *
 * SİLME YOK, GİZLEME VAR: temizlik kendisi bir harekettir → başka cihazdan gelen
 * eşitleme gizleneni geri getiremez ve geri alma her zaman mümkündür. Kaynak,
 * tarih aralığı ve vakitle süzülür; kaç kaydın etkileneceği ve kalanın ne
 * olacağı ÖNCEDEN gösterilir (defterin kendi türetmesiyle ölçülür).
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRenkler } from '../../../core/theme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { kazaVerileriniYukle, temizlikGeriAl, temizlikUygula } from '../../store/kazaSlice';
import * as KazaDefteri from '../../../domain/services/KazaDefteriServisi';
import {
  TEMIZLIK_KAYNAKLARI,
  temizlikAdaylari,
  type TemizlikKaynagi,
} from '../../../core/kaza/kazaDefteriHesabi';
import { KAZA_VAKITLERI, KAZA_VAKTI_ADI, type KazaVakti } from '../../../core/kaza/kazaHareketi';
import { gunEkle } from '../../../core/utils/TarihYardimcisi';
import { TEMIZLIK_KAYNAK_ETIKETI, TEMIZLIK_KAYNAK_KUCUK, gunMetni } from '../../components/kaza/kazaMetinleri';
import { BolumBasligi, KazaBant, KazaDugme, KazaKart, SecimCipi } from '../../components/kaza/KazaOrtak';
import { BildirimModali } from '../../components/common/BildirimModali';
import { kisaBildirimGoster } from '../../components/common/KisaBildirim';

type Aralik = 'tumu' | 7 | 30 | 90;
const ARALIKLAR: ReadonlyArray<{ id: Aralik; etiket: string }> = [
  { id: 'tumu', etiket: 'Tüm zamanlar' },
  { id: 7, etiket: 'Son 7 gün' },
  { id: 30, etiket: 'Son 30 gün' },
  { id: 90, etiket: 'Son 90 gün' },
];
const ONIZLEME_SATIRI = 5;

export const KazaTemizlikSayfasi: React.FC = () => {
  const renkler = useRenkler();
  const dispatch = useAppDispatch();
  const { kazaDurumu, hareketler } = useAppSelector((s) => s.kaza);
  const [kaynaklar, setKaynaklar] = useState<TemizlikKaynagi[]>(['otomatik']);
  const [aralik, setAralik] = useState<Aralik>('tumu');
  const [vakit, setVakit] = useState<KazaVakti | null>(null);
  const [yeniKalan, setYeniKalan] = useState<number | null>(null);
  const [onay, setOnay] = useState(false);
  const [sonTemizlik, setSonTemizlik] = useState<{ id: string; adet: number } | null>(null);
  const [mesgul, setMesgul] = useState(false);

  useEffect(() => {
    if (!kazaDurumu) dispatch(kazaVerileriniYukle());
  }, [dispatch, kazaDurumu]);

  const adaylar = useMemo(() => {
    if (!kazaDurumu) return [];
    const bugun = KazaDefteri.bugunNamazGunuAl();
    return temizlikAdaylari(hareketler, kazaDurumu.otomatikKayitlar, {
      kaynaklar,
      baslangic: aralik === 'tumu' ? null : gunEkle(bugun, -aralik),
      bitis: null,
      vakit,
    });
  }, [hareketler, kazaDurumu, kaynaklar, aralik, vakit]);

  // Kalanın ne olacağını defterin KENDİ türetmesiyle ölç (kronolojik fold).
  useEffect(() => {
    let iptal = false;
    setYeniKalan(null);
    if (adaylar.length === 0) return;
    KazaDefteri.temizlikOnizlemesi(adaylar.map((a) => a.id))
      .then((o) => {
        if (!iptal) setYeniKalan(o.yeniKalan);
      })
      .catch(() => undefined);
    return () => {
      iptal = true;
    };
  }, [adaylar]);

  const kaynakDegistir = (k: TemizlikKaynagi) =>
    setKaynaklar((m) => (m.includes(k) ? m.filter((x) => x !== k) : [...m, k]));

  const uygula = useCallback(async () => {
    setOnay(false);
    setMesgul(true);
    try {
      const sonuc = await dispatch(temizlikUygula({ hedefIdler: adaylar.map((a) => a.id) })).unwrap();
      setSonTemizlik({ id: sonuc.temizlikId, adet: adaylar.length });
    } catch {
      kisaBildirimGoster('Temizlik uygulanamadı. Lütfen tekrar deneyin.');
    } finally {
      setMesgul(false);
    }
  }, [adaylar, dispatch]);

  const geriAl = useCallback(async () => {
    if (!sonTemizlik) return;
    setMesgul(true);
    try {
      await dispatch(temizlikGeriAl({ temizlikId: sonTemizlik.id })).unwrap();
      kisaBildirimGoster('Temizlik geri alındı');
      setSonTemizlik(null);
    } catch {
      kisaBildirimGoster('Geri alınamadı. Hareket geçmişinden tekrar deneyebilirsiniz.');
    } finally {
      setMesgul(false);
    }
  }, [dispatch, sonTemizlik]);

  if (!kazaDurumu) {
    return (
      <SafeAreaView style={[stiller.kap, { backgroundColor: renkler.arkaplan }]} edges={['bottom', 'left', 'right']}>
        <Text style={[stiller.alt, stiller.orta, { color: renkler.metinIkincil }]}>Yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  const fmt = (n: number) => n.toLocaleString('tr-TR');

  return (
    <SafeAreaView style={[stiller.kap, { backgroundColor: renkler.arkaplan }]} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={stiller.icerik}>
        <Text style={[stiller.ozet, { color: renkler.metinIkincil }]}>
          Kayıtlar silinmez, gizlenir. Her temizlik hareket geçmişinde görünür ve geri alınabilir.
        </Text>

        {sonTemizlik && (
          <View>
            <KazaBant ikon="check-circle" renk={renkler.basarili} metin={`${sonTemizlik.adet} kayıt gizlendi.`} />
            <KazaDugme etiket="Geri alın" ikon="undo" tur="ikincil" onPress={geriAl} devreDisi={mesgul} style={stiller.altBosluk} />
          </View>
        )}

        <BolumBasligi>Kaynak</BolumBasligi>
        <View style={stiller.ciplar}>
          {TEMIZLIK_KAYNAKLARI.map((k) => (
            <SecimCipi key={k} coklu etiket={TEMIZLIK_KAYNAK_ETIKETI[k]} secili={kaynaklar.includes(k)} onPress={() => kaynakDegistir(k)} />
          ))}
        </View>

        <BolumBasligi>Tarih aralığı</BolumBasligi>
        <View style={stiller.ciplar}>
          {ARALIKLAR.map((a) => (
            <SecimCipi key={String(a.id)} etiket={a.etiket} secili={aralik === a.id} onPress={() => setAralik(a.id)} />
          ))}
        </View>

        <BolumBasligi>Vakit</BolumBasligi>
        <View style={stiller.ciplar}>
          <SecimCipi etiket="Tümü" secili={vakit === null} onPress={() => setVakit(null)} />
          {KAZA_VAKITLERI.map((v) => (
            <SecimCipi key={v} etiket={KAZA_VAKTI_ADI[v]} secili={vakit === v} onPress={() => setVakit(v)} />
          ))}
        </View>

        <KazaKart style={stiller.ustBosluk}>
          <Text style={[stiller.baslik, { color: renkler.metin }]} accessibilityLiveRegion="polite">
            {adaylar.length > 0 ? `${fmt(adaylar.length)} kayıt gizlenecek` : 'Süzgece uyan kayıt yok'}
          </Text>
          {adaylar.length > 0 && (
            <Text style={[stiller.alt, { color: renkler.metinIkincil }]}>
              Kalan kaza {fmt(kazaDurumu.toplamKalan)} → {yeniKalan === null ? '…' : fmt(yeniKalan)}
            </Text>
          )}
          {adaylar.slice(0, ONIZLEME_SATIRI).map((a) => (
            <View key={a.id} style={[stiller.adaySatiri, { borderColor: renkler.sinir }]}>
              <Text style={[stiller.adayMetin, { color: renkler.metin }]}>
                {KAZA_VAKTI_ADI[a.vakit]} · {TEMIZLIK_KAYNAK_KUCUK[a.kaynak]}
              </Text>
              <Text style={[stiller.alt, { color: renkler.metinIkincil }]}>
                {a.kaynak === 'otomatik' || a.kaynak === 'bildirim' ? `${gunMetni(a.gun)} namazı` : gunMetni(a.gun)} ·{' '}
                {a.etki > 0 ? `+${a.etki}` : a.etki < 0 ? `−${Math.abs(a.etki)}` : '0'}
              </Text>
            </View>
          ))}
          {adaylar.length > ONIZLEME_SATIRI && (
            <Text style={[stiller.alt, { color: renkler.metinIkincil }]}>ve {fmt(adaylar.length - ONIZLEME_SATIRI)} kayıt daha</Text>
          )}
        </KazaKart>

        <KazaDugme
          etiket={adaylar.length > 0 ? `${fmt(adaylar.length)} kaydı gizleyin` : 'Gizlenecek kayıt yok'}
          ikon="eye-slash"
          onPress={() => setOnay(true)}
          devreDisi={adaylar.length === 0 || mesgul}
        />
      </ScrollView>

      <BildirimModali
        gorunur={onay}
        tip="bilgi"
        baslik="Kayıtlar gizlensin mi?"
        mesaj={`${fmt(adaylar.length)} kayıt defterden gizlenecek. Hiçbiri silinmez; hareket geçmişinden geri alabilirsiniz.`}
        birincilEtiket="Gizleyin"
        birincilIkon="eye-slash"
        onBirincil={uygula}
        kapatEtiketi="Vazgeçin"
        onKapat={() => setOnay(false)}
      />
    </SafeAreaView>
  );
};

const stiller = StyleSheet.create({
  kap: { flex: 1 },
  icerik: { padding: 16, paddingBottom: 32 },
  ozet: { fontSize: 14, lineHeight: 20, marginBottom: 8, marginHorizontal: 4 },
  ciplar: { flexDirection: 'row', flexWrap: 'wrap' },
  baslik: { fontSize: 16, fontWeight: '700' },
  alt: { fontSize: 13, lineHeight: 18, marginTop: 2 },
  orta: { textAlign: 'center', marginTop: 32 },
  adaySatiri: { borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: 8, marginTop: 8 },
  adayMetin: { fontSize: 14, fontWeight: '600' },
  ustBosluk: { marginTop: 8 },
  altBosluk: { marginBottom: 12 },
});
