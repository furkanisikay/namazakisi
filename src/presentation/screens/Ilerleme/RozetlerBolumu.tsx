/**
 * İlerleme sekmesi — "Seviye ve rozetler" bölümü (eski Rozetler SEKMESİ).
 *
 * Sade tasarım Dalga 4: rozetler ayrı bir alt sekme değil, İlerleme sayfasının en
 * altındaki bölümdür. Sadeleşme:
 *   - 4'lü filtre çubuğu (Tümü/Seri/Özel/Toplam) kaldırıldı; rozetler tek listede,
 *     kazanılanlar önce.
 *   - Okunmayacak kadar küçük (7–8 pt) yazılı "Seviye yol haritası" kaldırıldı; seviye
 *     kartı sonraki seviyeyi ve kalan puanı zaten söyler.
 * Veri seri dilimindedir; YÜKLEMEZ (ana ekran ve seri bölümü `seriVerileriniYukle`yi
 * zaten çağırır — aynı thunk'ı ikinci kez paralel tetiklemek göç yazımlarını yarıştırırdı).
 * Rozete dokunmak (kazanıldıysa) paylaşım kartını açar.
 */
import React, { useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useAppSelector } from '../../store/hooks';
import { RozetKarti } from '../../components/RozetKarti';
import { PaylasimModal } from '../../components/Sharing/PaylasimModal';
import { PaylasilabilirRozet } from '../../components/Sharing/PaylasilabilirRozet';
import { BolumBasligi } from '../../components/ortak/BolumBasligi';
import { useRenkler } from '../../../core/theme';
import { ROZET_RENKLERI } from '../../../core/constants/UygulamaSabitleri';
import { ROZET_TANIMLARI, SEVIYE_TANIMLARI, seviyeAdi, type RozetDetay } from '../../../core/types/SeriTipleri';
import { bicim, sayili } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';

// Seviye ikon eşlemesi (emoji yerine FontAwesome5)
const SEVIYE_IKONLARI: Record<string, string> = {
  '🌙': 'moon',
  '⭐': 'star',
  '🌟': 'star',
  '💫': 'star',
  '✨': 'magic',
  '🏆': 'trophy',
  '👑': 'crown',
};

const seviyeIkonuAl = (emojiIkon: string | undefined): string => (emojiIkon ? SEVIYE_IKONLARI[emojiIkon] || 'moon' : 'moon');

export const RozetlerBolumu: React.FC = () => {
  const renkler = useRenkler();
  const m = useMetin().ilerleme.rozetler;
  const { rozetDetaylari, seviyeDurumu, toplamKilinanNamaz } = useAppSelector((state) => state.seri);
  const [secilenRozet, setSecilenRozet] = useState<RozetDetay | null>(null);

  // Kazanılanlar önce; kendi içlerinde tanım sırası korunur (sort kararlıdır).
  const rozetler = useMemo(
    () => [...rozetDetaylari].sort((a, b) => Number(b.kazanildiMi) - Number(a.kazanildiMi)),
    [rozetDetaylari]
  );
  const kazanilanSayisi = rozetDetaylari.filter((r) => r.kazanildiMi).length;
  const toplamRozet = ROZET_TANIMLARI.length;

  const seviyeIlerleme = seviyeDurumu
    ? (seviyeDurumu.mevcutSeviyePuani / Math.max(1, seviyeDurumu.mevcutSeviyePuani + seviyeDurumu.sonrakiSeviyeKalanPuan)) * 100
    : 0;
  const sonrakiSeviye = seviyeDurumu ? SEVIYE_TANIMLARI.find((s) => s.seviye === seviyeDurumu.mevcutSeviye + 1) : null;
  // Rank adı seviye numarasından, etkin dilde (`seviyeDurumu.rank` diske yazılır, dil değişince bayatlar).
  const mevcutSeviye = seviyeDurumu?.mevcutSeviye || 1;
  const kalanPuan = seviyeDurumu?.sonrakiSeviyeKalanPuan || 0;

  return (
    <View testID="rozetler-bolumu">
      <BolumBasligi metin={m.baslik} ikon="trophy" />

      {/* Seviye kartı */}
      <View style={{ backgroundColor: renkler.kartArkaplan, borderRadius: 24, padding: 16, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
                backgroundColor: renkler.birincil + '20',
              }}
            >
              <FontAwesome5 name={seviyeIkonuAl(seviyeDurumu?.rankIkonu)} size={22} color={renkler.birincil} solid />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: renkler.metin }}>{seviyeAdi(mevcutSeviye)}</Text>
              <Text style={{ fontSize: 14, color: renkler.metinIkincil }}>{bicim(m.seviye, { n: mevcutSeviye })}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 12, color: renkler.metinIkincil }}>{m.puan}</Text>
            <Text style={{ fontSize: 22, fontWeight: '700', color: renkler.metin }}>{seviyeDurumu?.toplamPuan || 0}</Text>
          </View>
        </View>

        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel={
            sonrakiSeviye
              ? sayili(m.kalanErisim, kalanPuan, { rank: sonrakiSeviye.rank })
              : m.enYuksek
          }
          accessibilityValue={{ min: 0, max: 100, now: Math.round(seviyeIlerleme) }}
        >
          <View style={{ height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: renkler.sinir }}>
            <View style={{ height: '100%', borderRadius: 4, width: `${seviyeIlerleme}%`, backgroundColor: renkler.birincil }} />
          </View>
          {sonrakiSeviye ? (
            <Text style={{ fontSize: 14, color: renkler.metinIkincil, marginTop: 6 }}>
              {sayili(m.kalan, kalanPuan, { rank: sonrakiSeviye.rank })}
            </Text>
          ) : null}
        </View>

        <View style={{ flexDirection: 'row', marginTop: 12, marginHorizontal: -4 }}>
          <View
            accessible
            accessibilityLabel={sayili(m.kilinanErisim, toplamKilinanNamaz)}
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 16, marginHorizontal: 4, backgroundColor: renkler.birincil + '10' }}
          >
            <FontAwesome5 name="mosque" size={16} color={renkler.birincil} solid />
            <Text style={{ fontSize: 16, fontWeight: '700', color: renkler.metin, marginLeft: 8 }}>{toplamKilinanNamaz}</Text>
            <Text style={{ fontSize: 14, color: renkler.metinIkincil, marginLeft: 4 }}>{sayili(m.namaz, toplamKilinanNamaz)}</Text>
          </View>
          <View
            accessible
            accessibilityLabel={bicim(m.rozetErisim, { toplam: toplamRozet, n: kazanilanSayisi })}
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 16, marginHorizontal: 4, backgroundColor: ROZET_RENKLERI.ALTIN + '18' }}
          >
            <FontAwesome5 name="medal" size={16} color={ROZET_RENKLERI.ALTIN} solid />
            <Text style={{ fontSize: 16, fontWeight: '700', color: renkler.metin, marginLeft: 8 }}>
              {kazanilanSayisi}/{toplamRozet}
            </Text>
            <Text style={{ fontSize: 14, color: renkler.metinIkincil, marginLeft: 4 }}>{sayili(m.rozet, toplamRozet)}</Text>
          </View>
        </View>
      </View>

      {rozetler.map((rozet) => (
        <RozetKarti key={rozet.id} rozet={rozet} onPress={rozet.kazanildiMi ? () => setSecilenRozet(rozet) : undefined} />
      ))}

      <PaylasimModal gorunur={secilenRozet !== null} onKapat={() => setSecilenRozet(null)}>
        {secilenRozet && <PaylasilabilirRozet rozet={secilenRozet} />}
      </PaylasimModal>
    </View>
  );
};
