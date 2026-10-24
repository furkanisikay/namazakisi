/**
 * Hareket ayrıntısı (Kaza Defteri 2.0, ekran 6) — alttan açılan sayfa.
 *
 * Yanlış pozitifi ayıklamanın iki yolu: önerilen yol NAMAZ KAYDINI düzeltir
 * (otomatik kayıt namaz kaydının aynasıdır → kendiliğinden düşer); ikincisi
 * yalnız bu satırı geri alınabilir bir temizlikle gizler. Silme yoktur.
 */
import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { useRenkler } from '../../../core/theme';
import { useDonanimGeriTusu } from '../../hooks/useDonanimGeriTusu';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { kazaVerileriniYukle, temizlikGeriAl, temizlikUygula } from '../../store/kazaSlice';
import { namazDurumunuDegistir } from '../../store/namazSlice';
import { puanlamayiYenidenHesapla } from '../../store/seriSlice';
import { NamazAdi } from '../../../core/constants/UygulamaSabitleri';
import { tarihiISOFormatinaCevir } from '../../../core/utils/TarihYardimcisi';
import type { GecmisSatiri } from '../../../core/kaza/kazaDefteriHesabi';
import { GIZLENEBILIR_KAYNAKLAR, type KazaVakti } from '../../../core/kaza/kazaHareketi';
import {
  KAYNAK_GORUNUMU,
  deltaMetni,
  gunMetni,
  saatMetni,
  satirBasligi,
} from './kazaMetinleri';
import { IkonCipi, KazaDugme, kaynakRengi } from './KazaOrtak';
import { kisaBildirimGoster } from '../common/KisaBildirim';
import { bicim, sayili } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';

/** Defter vakti → namaz kaydı adı (vitir'in kaydı yoktur: yatsıya bağlıdır). */
const NAMAZ_KAYDI: Record<KazaVakti, NamazAdi> = {
  sabah: NamazAdi.Sabah,
  ogle: NamazAdi.Ogle,
  ikindi: NamazAdi.Ikindi,
  aksam: NamazAdi.Aksam,
  yatsi: NamazAdi.Yatsi,
  vitir: NamazAdi.Yatsi,
};

interface Props {
  satir: GecmisSatiri | null;
  cihaz: string | null;
  onKapat: () => void;
}

export const KazaHareketAyrintiModal: React.FC<Props> = ({ satir, cihaz, onKapat }) => {
  const renkler = useRenkler();
  const dispatch = useAppDispatch();
  const hareketler = useAppSelector((s) => s.kaza.hareketler);
  const metinler = useMetin();
  const m = metinler.kaza.ayrinti;
  const [mesgul, setMesgul] = useState(false);
  const gorunur = satir !== null;
  useDonanimGeriTusu(gorunur, onKapat);

  /** Gizli satırı gizleyen (geri alınmamış) temizlik. */
  const gizleyenTemizlik = useMemo(() => {
    if (!satir?.gizli) return null;
    const geriAlinan = new Set(hareketler.filter((h) => h.kaynak === 'temizlikGeriAl').map((h) => h.hedefId));
    return (
      [...hareketler]
        .reverse()
        .find((h) => h.kaynak === 'temizlik' && !geriAlinan.has(h.id) && h.hedefIdler?.includes(satir.kimlik)) ?? null
    );
  }, [satir, hareketler]);

  const calistir = useCallback(
    async (is: () => Promise<unknown>, basari: string) => {
      setMesgul(true);
      try {
        await is();
        kisaBildirimGoster(basari);
        onKapat();
      } catch {
        kisaBildirimGoster(m.hata);
      } finally {
        setMesgul(false);
      }
    },
    [onKapat, m]
  );

  if (!satir) return null;
  const gorunum = KAYNAK_GORUNUMU[satir.tur];
  const renk = kaynakRengi(renkler, gorunum.renk);
  const delta = deltaMetni(satir);
  const otomatikMi = satir.tur === 'otomatik' && !satir.gizli;
  const gizlenebilir =
    !satir.gizli && !!satir.hareket && (GIZLENEBILIR_KAYNAKLAR as readonly string[]).includes(satir.tur) && !satir.hareket.gocmis;

  const kildimIsaretle = () =>
    calistir(async () => {
      if (!satir.gun || !satir.vakit) throw new Error('Gün yok');
      await dispatch(
        namazDurumunuDegistir({ tarih: satir.gun, namazAdi: NAMAZ_KAYDI[satir.vakit], tamamlandi: true })
      ).unwrap();
      // Puan kayıttan TÜRER. Seri geçmiş gün için yeniden kurulmaz (AnaSayfa'nın
      // geçmiş gün yoluyla aynı); metin bu yüzden yalnız puanı vaat eder.
      await dispatch(puanlamayiYenidenHesapla({ sessiz: true }));
      await dispatch(kazaVerileriniYukle());
    }, m.kildimBasari);

  const gizle = () =>
    calistir(() => dispatch(temizlikUygula({ hedefIdler: [satir.kimlik] })).unwrap(), m.cikarildi);

  const temizligiGeriAl = (temizlikId: string) =>
    calistir(() => dispatch(temizlikGeriAl({ temizlikId })).unwrap(), metinler.kaza.temizlikGeriAlindi);

  const satirlar: Array<[string, string]> = [];
  if (satir.tur === 'otomatik' && satir.gun) {
    satirlar.push([m.neden, bicim(m.nedenMetni, { gun: gunMetni(satir.gun) })]);
  }
  if (satir.gun && satir.tur !== 'otomatik') satirlar.push([m.namazGunu, gunMetni(satir.gun)]);
  satirlar.push([m.eklendigiAn, `${gunMetni(tarihiISOFormatinaCevir(new Date(satir.zaman)))} ${saatMetni(satir.zaman)}`]);
  if (satir.cihaz) satirlar.push([m.cihaz, satir.cihaz === cihaz ? m.buCihaz : bicim(m.baskaCihaz, { cihaz: satir.cihaz })]);
  if (satir.hareket?.not) satirlar.push([m.not, satir.hareket.not]);
  satirlar.push([m.kimlik, satir.kimlik]);

  return (
    <Modal visible={gorunur} animationType="fade" transparent statusBarTranslucent onRequestClose={onKapat}>
      <View style={stiller.kapsayici}>
        <TouchableWithoutFeedback onPress={onKapat} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <View style={[StyleSheet.absoluteFill, stiller.perde]} />
        </TouchableWithoutFeedback>
        <View style={[stiller.sayfa, { backgroundColor: renkler.kartArkaplan }]} accessibilityViewIsModal>
          <ScrollView contentContainerStyle={stiller.icerik}>
            <View style={stiller.ust}>
              <IkonCipi ikon={gorunum.ikon} renk={renk} boyut={44} />
              <View style={stiller.ustMetin}>
                <Text style={[stiller.baslik, { color: renkler.metin }]} accessibilityRole="header">
                  {satirBasligi(satir)}
                </Text>
                <Text style={[stiller.alt, { color: renkler.metinIkincil }]}>
                  {gorunum.etiket}
                  {satir.gizli ? m.gizlenmis : ''}
                </Text>
              </View>
              {delta !== '' && <Text style={[stiller.delta, { color: renkler.metin }]}>{delta}</Text>}
            </View>

            {satirlar.map(([etiket, deger]) => (
              <View key={etiket} style={[stiller.bilgiSatiri, { borderColor: renkler.sinir }]}>
                <Text style={[stiller.bilgiEtiket, { color: renkler.metinIkincil }]}>{etiket}</Text>
                <Text style={[stiller.bilgiDeger, { color: renkler.metin }]} selectable>
                  {deger}
                </Text>
              </View>
            ))}

            {otomatikMi && (
              <>
                <Text style={[stiller.soru, { color: renkler.metin }]}>{m.soru}</Text>
                <KazaDugme
                  etiket={satir.vakit === 'vitir' ? m.yatsiyiKildim : m.kildimIsaretleyin}
                  ikon="check"
                  onPress={kildimIsaretle}
                  devreDisi={mesgul}
                />
                <Text style={[stiller.not, { color: renkler.metinIkincil }]}>
                  {m.kayitDuzelir}
                </Text>
                <KazaDugme etiket={m.yalnizDefterden} tur="ikincil" onPress={gizle} devreDisi={mesgul} />
              </>
            )}
            {gizlenebilir && (
              <KazaDugme etiket={m.defterdenCikarin} ikon="eye-slash" tur="ikincil" onPress={gizle} devreDisi={mesgul} />
            )}
            {gizleyenTemizlik && (
              <>
                <Text style={[stiller.not, { color: renkler.metinIkincil }]}>
                  {sayili(m.temizlikleGizlendi, gizleyenTemizlik.hedefIdler?.length ?? 0)}
                </Text>
                <KazaDugme
                  etiket={m.temizligiGeriAlin}
                  ikon="undo"
                  tur="ikincil"
                  onPress={() => temizligiGeriAl(gizleyenTemizlik.id)}
                  devreDisi={mesgul}
                />
              </>
            )}
            {satir.tur === 'temizlik' && !satir.geriAlindi && (
              <KazaDugme
                etiket={m.temizligiGeriAlin}
                ikon="undo"
                tur="ikincil"
                onPress={() => temizligiGeriAl(satir.kimlik)}
                devreDisi={mesgul}
              />
            )}
            <View style={stiller.bosluk} />
            <KazaDugme etiket={metinler.ortak.kapatin} tur="ikincil" onPress={onKapat} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const stiller = StyleSheet.create({
  kapsayici: { flex: 1, justifyContent: 'flex-end' },
  perde: { backgroundColor: 'rgba(0,0,0,0.45)' },
  sayfa: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' },
  icerik: { padding: 20, paddingBottom: 32, gap: 10 },
  ust: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
  ustMetin: { flex: 1 },
  baslik: { fontSize: 17, fontWeight: '700' },
  alt: { fontSize: 13, marginTop: 2 },
  delta: { fontSize: 20, fontWeight: '800' },
  bilgiSatiri: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 8, gap: 12 },
  bilgiEtiket: { fontSize: 13 },
  bilgiDeger: { fontSize: 13, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  soru: { fontSize: 15, fontWeight: '700', marginTop: 8 },
  not: { fontSize: 12, lineHeight: 17 },
  bosluk: { height: 4 },
});
