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
import { KAZA_VAKITLERI, kazaVaktiGoster, type KazaVakti } from '../../../core/kaza/kazaHareketi';
import { gunEkle } from '../../../core/utils/TarihYardimcisi';
import { TEMIZLIK_KAYNAK_ETIKETI, TEMIZLIK_KAYNAK_KUCUK, gunMetni } from '../../components/kaza/kazaMetinleri';
import { BolumBasligi, KazaBant, KazaDugme, KazaKart, SecimCipi } from '../../components/kaza/KazaOrtak';
import { BildirimModali } from '../../components/common/BildirimModali';
import { kisaBildirimGoster } from '../../components/common/KisaBildirim';
import { bicim, sayili, sayiYaz } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';

type Aralik = 'tumu' | 7 | 30 | 90;
const ARALIKLAR: readonly Aralik[] = ['tumu', 7, 30, 90];
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
  const metinler = useMetin();
  const sozluk = metinler.kaza;
  const m = sozluk.temizlik;
  const araliklar = useMemo(
    () => ARALIKLAR.map((id) => ({ id, etiket: id === 'tumu' ? m.tumZamanlar : sayili(sozluk.sonGun, id) })),
    [m, sozluk]
  );

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
      kisaBildirimGoster(m.uygulanamadi);
    } finally {
      setMesgul(false);
    }
  }, [adaylar, dispatch, m]);

  const geriAl = useCallback(async () => {
    if (!sonTemizlik) return;
    setMesgul(true);
    try {
      await dispatch(temizlikGeriAl({ temizlikId: sonTemizlik.id })).unwrap();
      kisaBildirimGoster(sozluk.temizlikGeriAlindi);
      setSonTemizlik(null);
    } catch {
      kisaBildirimGoster(m.geriAlinamadi);
    } finally {
      setMesgul(false);
    }
  }, [dispatch, sonTemizlik, m, sozluk]);

  if (!kazaDurumu) {
    return (
      <SafeAreaView style={[stiller.kap, { backgroundColor: renkler.arkaplan }]} edges={['bottom', 'left', 'right']}>
        <Text style={[stiller.alt, stiller.orta, { color: renkler.metinIkincil }]}>{sozluk.yukleniyor}</Text>
      </SafeAreaView>
    );
  }

  const fmt = sayiYaz;

  return (
    <SafeAreaView style={[stiller.kap, { backgroundColor: renkler.arkaplan }]} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={stiller.icerik}>
        <Text style={[stiller.ozet, { color: renkler.metinIkincil }]}>
          {m.ozet}
        </Text>

        {sonTemizlik && (
          <View>
            <KazaBant ikon="check-circle" renk={renkler.basarili} metin={sayili(m.gizlendi, sonTemizlik.adet)} />
            <KazaDugme etiket={m.geriAlin} ikon="undo" tur="ikincil" onPress={geriAl} devreDisi={mesgul} style={stiller.altBosluk} />
          </View>
        )}

        <BolumBasligi>{m.kaynak}</BolumBasligi>
        <View style={stiller.ciplar}>
          {TEMIZLIK_KAYNAKLARI.map((k) => (
            <SecimCipi key={k} coklu etiket={TEMIZLIK_KAYNAK_ETIKETI[k]} secili={kaynaklar.includes(k)} onPress={() => kaynakDegistir(k)} />
          ))}
        </View>

        <BolumBasligi>{m.tarihAraligi}</BolumBasligi>
        <View style={stiller.ciplar}>
          {araliklar.map((a) => (
            <SecimCipi key={String(a.id)} etiket={a.etiket} secili={aralik === a.id} onPress={() => setAralik(a.id)} />
          ))}
        </View>

        <BolumBasligi>{m.vakit}</BolumBasligi>
        <View style={stiller.ciplar}>
          <SecimCipi etiket={sozluk.kaynak.tumu} secili={vakit === null} onPress={() => setVakit(null)} />
          {KAZA_VAKITLERI.map((v) => (
            <SecimCipi key={v} etiket={kazaVaktiGoster(v)} secili={vakit === v} onPress={() => setVakit(v)} />
          ))}
        </View>

        <KazaKart style={stiller.ustBosluk}>
          <Text style={[stiller.baslik, { color: renkler.metin }]} accessibilityLiveRegion="polite">
            {adaylar.length > 0 ? sayili(m.gizlenecek, adaylar.length, { n: fmt(adaylar.length) }) : m.uyanYok}
          </Text>
          {adaylar.length > 0 && (
            <Text style={[stiller.alt, { color: renkler.metinIkincil }]}>
              {bicim(sozluk.kalanKazaOk, { eski: fmt(kazaDurumu.toplamKalan), yeni: yeniKalan === null ? '…' : fmt(yeniKalan) })}
            </Text>
          )}
          {adaylar.slice(0, ONIZLEME_SATIRI).map((a) => (
            <View key={a.id} style={[stiller.adaySatiri, { borderColor: renkler.sinir }]}>
              <Text style={[stiller.adayMetin, { color: renkler.metin }]}>
                {kazaVaktiGoster(a.vakit)} · {TEMIZLIK_KAYNAK_KUCUK[a.kaynak]}
              </Text>
              <Text style={[stiller.alt, { color: renkler.metinIkincil }]}>
                {a.kaynak === 'otomatik' || a.kaynak === 'bildirim' ? bicim(sozluk.satir.namazi, { gun: gunMetni(a.gun) }) : gunMetni(a.gun)} ·{' '}
                {a.etki > 0 ? `+${a.etki}` : a.etki < 0 ? `−${Math.abs(a.etki)}` : '0'}
              </Text>
            </View>
          ))}
          {adaylar.length > ONIZLEME_SATIRI && (
            <Text style={[stiller.alt, { color: renkler.metinIkincil }]}>{sayili(m.veDaha, adaylar.length - ONIZLEME_SATIRI, { n: fmt(adaylar.length - ONIZLEME_SATIRI) })}</Text>
          )}
        </KazaKart>

        <KazaDugme
          etiket={adaylar.length > 0 ? sayili(m.gizleyin, adaylar.length, { n: fmt(adaylar.length) }) : m.gizlenecekYok}
          ikon="eye-slash"
          onPress={() => setOnay(true)}
          devreDisi={adaylar.length === 0 || mesgul}
        />
      </ScrollView>

      <BildirimModali
        gorunur={onay}
        tip="bilgi"
        baslik={m.onayBaslik}
        mesaj={sayili(m.onayMesaj, adaylar.length, { n: fmt(adaylar.length) })}
        birincilEtiket={m.onayDugme}
        birincilIkon="eye-slash"
        onBirincil={uygula}
        kapatEtiketi={metinler.ortak.vazgecin}
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
