/**
 * İçe Aktarma Sihirbazı adım bileşenleri.
 *
 * Görsel dil Kurulum Sihirbazı ile birebir: büyük ikon kutusu, başlık/alt başlık,
 * InfoKutu, kart seçim deseni, CTA. Renkler tema-bağımlı (`useRenkler`). Tüm
 * kullanıcıya görünen metin kibar "siz" dilindedir.
 *
 * Bu dosya yalnız sunum bileşenlerini içerir; akış/state ana sayfadadır.
 */
import * as React from 'react';
import { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { styles } from './stiller';
import { useRenkler } from '../../../../core/theme';
import { useDonguAcik, useDonguAnimasyonu } from '../../../components/hareket/dongu';
import { bicim, metin, sayili } from '../../../../core/dil/aktifDil';
import { useMetin } from '../../../hooks/useMetin';
import type {
  BirlestirmeStratejisi,
  KategoriStratejisi,
  FarkOzeti,
} from '../../../../core/types';

type Renkler = ReturnType<typeof useRenkler>;

// ─── Strateji meta verisi ────────────────────────────────────────────────────

export interface StratejiMeta {
  id: BirlestirmeStratejisi;
  ad: string;
  ikon: string;
  aciklama: string;
  renkAnahtar: 'bilgi' | 'birincil' | 'uyari' | 'basarili';
  onerilen?: boolean;
  gelismis?: boolean;
}

/** Birleştirme stratejileri, etkin dilde (metinler `yedekleme.sihirbaz.strateji`). */
export function stratejiler(): StratejiMeta[] {
  const m = metin().yedekleme.sihirbaz.strateji;
  return [
    { id: 'akilli', ad: m.akilli, ikon: 'object-group', aciklama: m.akilliAciklama, renkAnahtar: 'bilgi', onerilen: true },
    { id: 'uzerineYaz', ad: m.uzerineYaz, ikon: 'sync-alt', aciklama: m.uzerineYazAciklama, renkAnahtar: 'uyari' },
    { id: 'eksikleriEkle', ad: m.eksikleriEkle, ikon: 'plus', aciklama: m.eksikleriEkleAciklama, renkAnahtar: 'basarili' },
    { id: 'gelismis', ad: m.gelismis, ikon: 'sliders-h', aciklama: m.gelismisAciklama, renkAnahtar: 'birincil', gelismis: true },
  ];
}

const stratejiRengi = (renkler: Renkler, anahtar: StratejiMeta['renkAnahtar']): string =>
  renkler[anahtar];

// ─── Yardımcı: InfoKutu ──────────────────────────────────────────────────────

export const InfoKutu: React.FC<{
  ikon: string;
  renk: string;
  baslik: string;
  aciklama: string;
  renkler: Renkler;
}> = ({ ikon, renk, baslik, aciklama, renkler }) => (
  <View style={[styles.infoKutu, { backgroundColor: renkler.arkaplan }]}>
    <View style={[styles.infoIkon, { backgroundColor: `${renk}18` }]}>
      <FontAwesome5 name={ikon} size={18} color={renk} />
    </View>
    <View style={styles.infoMetin}>
      <Text style={[styles.infoBaslik, { color: renkler.metin }]}>{baslik}</Text>
      <Text style={[styles.infoAciklama, { color: renkler.metinIkincil }]}>{aciklama}</Text>
    </View>
  </View>
);

// ─── Adım 0: Dosya seç ───────────────────────────────────────────────────────

export const DosyaSecAdimi: React.FC<{ renkler: Renkler }> = ({ renkler }) => {
  const m = useMetin().yedekleme.sihirbaz;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Sihirbaz sahnesi: görünürken döngü, tek kapı `hareket/dongu` (D-16; eskiden temizliksizdi).
  useDonguAnimasyonu(
    useDonguAcik(),
    () =>
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ]),
    () => pulseAnim.setValue(1)
  );

  return (
    <ScrollView style={styles.scrollAdim} contentContainerStyle={styles.scrollIcerik} showsVerticalScrollIndicator={false}>
      <Animated.View
        style={[
          styles.buyukIkonCember,
          { backgroundColor: `${renkler.birincil}20`, alignSelf: 'center', transform: [{ scale: pulseAnim }] },
        ]}
      >
        <FontAwesome5 name="file-import" size={42} color={renkler.birincil} />
      </Animated.View>
      <Text style={[styles.adimBaslik, { color: renkler.metin }]}>{m.dosyaSecBaslik}</Text>
      <Text style={[styles.adimAltBaslik, { color: renkler.metinIkincil }]}>
        {m.dosyaSecAlt}
      </Text>

      <InfoKutu
        renkler={renkler}
        ikon="lock"
        renk={renkler.basarili}
        baslik={m.guvendeBaslik}
        aciklama={m.guvendeAciklama}
      />
      <InfoKutu
        renkler={renkler}
        ikon="shield-alt"
        renk={renkler.bilgi}
        baslik={m.korunurBaslik}
        aciklama={m.korunurAciklama}
      />
    </ScrollView>
  );
};

// ─── Adım 1: Çöz & doğrula (yükleme) ─────────────────────────────────────────

export const CozumleniyorAdimi: React.FC<{ renkler: Renkler }> = ({ renkler }) => {
  const m = useMetin().yedekleme.sihirbaz;
  return (
    <View style={styles.merkezliIcerik}>
      <ActivityIndicator size="large" color={renkler.birincil} style={{ marginBottom: 20 }} />
      <Text style={[styles.adimBaslik, { color: renkler.metin }]}>{m.inceleniyor}</Text>
      <Text style={[styles.adimAltBaslik, { color: renkler.metinIkincil }]}>{m.inceleniyorAlt}</Text>
    </View>
  );
};

// ─── Hata ekranı (çözme hatası) ──────────────────────────────────────────────

export const CozmeHatasiAdimi: React.FC<{ renkler: Renkler }> = ({ renkler }) => {
  const m = useMetin().yedekleme.sihirbaz;
  return (
  <View style={styles.merkezliIcerik}>
    <View style={[styles.buyukIkonCember, { backgroundColor: `${renkler.hata}18` }]}>
      <FontAwesome5 name="exclamation-triangle" size={42} color={renkler.hata} />
    </View>
    <Text style={[styles.adimBaslik, { color: renkler.metin }]}>{m.okunamadi}</Text>
    <Text style={[styles.adimAltBaslik, { color: renkler.metinIkincil }]}>
      {m.okunamadiAlt}
    </Text>
    <View style={[styles.hataKutu, { backgroundColor: `${renkler.bilgi}12`, borderColor: `${renkler.bilgi}40` }]}>
      <FontAwesome5 name="info-circle" size={14} color={renkler.bilgi} />
      <Text style={[styles.hataKutuMetin, { color: renkler.metinIkincil }]}>
        {m.dosyaBicimi}
      </Text>
    </View>
  </View>
  );
};

// ─── Adım 2: Karşılaştır & strateji ──────────────────────────────────────────

const MetrikKart: React.FC<{
  renkler: Renkler;
  ikon: string;
  renk: string;
  sayi: number;
  etiket: string;
}> = ({ renkler, ikon, renk, sayi, etiket }) => (
  <View style={[styles.metrikKart, { backgroundColor: renkler.kartArkaplan, borderColor: `${renkler.sinir}80` }]}>
    <View style={[styles.metrikIkon, { backgroundColor: `${renk}18` }]}>
      <FontAwesome5 name={ikon} size={16} color={renk} />
    </View>
    <Text style={[styles.metrikSayi, { color: renk }]}>{sayi}</Text>
    <Text style={[styles.metrikEtiket, { color: renkler.metinIkincil }]}>{etiket}</Text>
  </View>
);

export const KarsilastirmaAdimi: React.FC<{
  renkler: Renkler;
  fark: FarkOzeti;
  seciliStrateji: BirlestirmeStratejisi;
  onStratejiSec: (s: BirlestirmeStratejisi) => void;
}> = ({ renkler, fark, seciliStrateji, onStratejiSec }) => {
  const m = useMetin().yedekleme.sihirbaz;
  const icerikSatirlari: { ikon: string; renk: string; metin: string }[] = [
    {
      ikon: 'calendar-check',
      renk: renkler.bilgi,
      metin: sayili(m.mevcutGun, fark.mevcutGunSayisi),
    },
    {
      ikon: 'medal',
      renk: renkler.uyari,
      metin: fark.rozetVar ? m.rozetVar : m.rozetYok,
    },
    {
      ikon: 'book',
      renk: renkler.basarili,
      metin: fark.kazaVar ? m.kazaVar : m.kazaYok,
    },
    {
      ikon: 'cog',
      renk: renkler.metinIkincil,
      metin: fark.ayarVar ? m.ayarVar : m.ayarYok,
    },
  ];

  return (
    <ScrollView style={styles.scrollAdim} contentContainerStyle={styles.scrollIcerik} showsVerticalScrollIndicator={false}>
      <View style={[styles.buyukIkonCember, { backgroundColor: `${renkler.birincil}20`, alignSelf: 'center' }]}>
        <FontAwesome5 name="balance-scale" size={40} color={renkler.birincil} />
      </View>
      <Text style={[styles.adimBaslik, { color: renkler.metin }]}>{m.hazir}</Text>
      <Text style={[styles.adimAltBaslik, { color: renkler.metinIkincil }]}>
        {m.hazirAlt}
      </Text>

      {/* Özet metrikler */}
      <View style={styles.metrikSatir}>
        <MetrikKart
          renkler={renkler}
          ikon="calendar-alt"
          renk={renkler.bilgi}
          sayi={fark.gelenGunSayisi}
          etiket={m.yedektekiGun}
        />
        <MetrikKart
          renkler={renkler}
          ikon="code-branch"
          renk={renkler.uyari}
          sayi={fark.cakisanGunSayisi}
          etiket={m.cakisanGun}
        />
      </View>

      {/* Yedek içeriği bilgi satırları */}
      <View style={[styles.bilgiSatirKart, { backgroundColor: renkler.kartArkaplan, borderColor: `${renkler.sinir}80` }]}>
        {icerikSatirlari.map((s, i) => (
          <View key={i} style={styles.bilgiSatir}>
            <FontAwesome5 name={s.ikon} size={14} color={s.renk} />
            <Text style={[styles.bilgiSatirMetin, { color: renkler.metinIkincil }]}>{s.metin}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.bolumBaslik, { color: renkler.metin }]}>{m.yontem}</Text>

      <View style={styles.stratejiListe}>
        {stratejiler().map((s) => {
          const renk = stratejiRengi(renkler, s.renkAnahtar);
          const secili = seciliStrateji === s.id;
          return (
            <TouchableOpacity
              key={s.id}
              accessibilityRole="button"
              accessibilityLabel={s.ad}
              accessibilityState={{ selected: secili }}
              style={[
                styles.stratejiKart,
                {
                  backgroundColor: renkler.kartArkaplan,
                  borderColor: secili ? renk : `${renkler.sinir}80`,
                  borderWidth: secili ? 2 : 1.5,
                },
              ]}
              onPress={() => onStratejiSec(s.id)}
              activeOpacity={0.75}
            >
              <View style={[styles.stratejiIkon, { backgroundColor: `${renk}18` }]}>
                <FontAwesome5 name={s.ikon} size={19} color={renk} />
              </View>
              <View style={styles.stratejiMetin}>
                <View style={styles.stratejiBaslikSatir}>
                  <Text style={[styles.stratejiAdi, { color: secili ? renk : renkler.metin }]}>{s.ad}</Text>
                  {s.onerilen && (
                    <View style={[styles.stratejiRozet, { backgroundColor: `${renk}18` }]}>
                      <Text style={[styles.stratejiRozetMetin, { color: renk }]}>{m.onerilen}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.stratejiAciklama, { color: renkler.metinIkincil }]}>{s.aciklama}</Text>
              </View>
              {s.gelismis ? (
                <View style={styles.stratejiSagIkon}>
                  <FontAwesome5 name="chevron-right" size={15} color={renkler.metinIkincil} />
                </View>
              ) : secili ? (
                <View style={[styles.secimDairesi, { backgroundColor: renk }]}>
                  <FontAwesome5 name="check" size={12} color="#fff" />
                </View>
              ) : (
                <View style={styles.stratejiSagIkon} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

// ─── Adım 2b: Gelişmiş kategori seçimi ───────────────────────────────────────

export interface KategoriMeta {
  id: 'namaz' | 'puan' | 'kaza' | 'ayarlar';
  ad: string;
  aciklama: string;
  ikon: string;
}

/** Gelişmiş birleştirmenin veri türleri, etkin dilde. */
export function kategoriler(): KategoriMeta[] {
  const m = metin().yedekleme.sihirbaz.kategori;
  return [
    { id: 'namaz', ad: m.namaz, aciklama: m.namazAciklama, ikon: 'pray' },
    { id: 'puan', ad: m.puan, aciklama: m.puanAciklama, ikon: 'star' },
    { id: 'kaza', ad: m.kaza, aciklama: m.kazaAciklama, ikon: 'book' },
    { id: 'ayarlar', ad: m.ayarlar, aciklama: m.ayarlarAciklama, ikon: 'cog' },
  ];
}

const kategoriSecenekleri = (): { id: KategoriStratejisi; kisa: string }[] => {
  const m = metin().yedekleme.sihirbaz;
  return [
    { id: 'akilli', kisa: m.kisaAkilli },
    { id: 'uzerineYaz', kisa: m.kisaUzerineYaz },
    { id: 'eksikleriEkle', kisa: m.kisaEksikler },
  ];
};

export const GelismisAdimi: React.FC<{
  renkler: Renkler;
  secimler: Record<KategoriMeta['id'], KategoriStratejisi>;
  onDegis: (kategori: KategoriMeta['id'], strateji: KategoriStratejisi) => void;
}> = ({ renkler, secimler, onDegis }) => {
  const m = useMetin().yedekleme.sihirbaz;
  return (
  <ScrollView style={styles.scrollAdim} contentContainerStyle={styles.scrollIcerik} showsVerticalScrollIndicator={false}>
    <View style={[styles.buyukIkonCember, { backgroundColor: `${renkler.birincil}20`, alignSelf: 'center' }]}>
      <FontAwesome5 name="sliders-h" size={40} color={renkler.birincil} />
    </View>
    <Text style={[styles.adimBaslik, { color: renkler.metin }]}>{m.gelismisBaslik}</Text>
    <Text style={[styles.adimAltBaslik, { color: renkler.metinIkincil }]}>
      {m.gelismisAlt}
    </Text>

    {kategoriler().map((k) => {
      const secili = secimler[k.id];
      return (
        <View
          key={k.id}
          style={[styles.kategoriKart, { backgroundColor: renkler.kartArkaplan, borderColor: `${renkler.sinir}80` }]}
        >
          <View style={styles.kategoriUst}>
            <View style={[styles.kategoriIkon, { backgroundColor: `${renkler.birincil}18` }]}>
              <FontAwesome5 name={k.ikon} size={16} color={renkler.birincil} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.kategoriBaslik, { color: renkler.metin }]}>{k.ad}</Text>
              <Text style={[styles.kategoriAciklama, { color: renkler.metinIkincil }]}>{k.aciklama}</Text>
            </View>
          </View>
          <View style={[styles.segmentSatir, { backgroundColor: renkler.arkaplan }]}>
            {kategoriSecenekleri().map((sec) => {
              const aktif = secili === sec.id;
              return (
                <TouchableOpacity
                  key={sec.id}
                  accessibilityRole="button"
                  accessibilityLabel={bicim(m.segmentErisim, { kategori: k.ad, secenek: sec.kisa })}
                  accessibilityState={{ selected: aktif }}
                  style={[styles.segmentButon, aktif && { backgroundColor: renkler.birincil }]}
                  onPress={() => onDegis(k.id, sec.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.segmentMetin,
                      { color: aktif ? renkler.birincilMetin : renkler.metinIkincil },
                    ]}
                  >
                    {sec.kisa}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      );
    })}
  </ScrollView>
  );
};

// ─── Adım 3: Uygulanıyor (ilerleme) ──────────────────────────────────────────

export const UygulaniyorAdimi: React.FC<{ renkler: Renkler }> = ({ renkler }) => {
  const m = useMetin().yedekleme.sihirbaz;
  return (
    <View style={styles.merkezliIcerik}>
      <ActivityIndicator size="large" color={renkler.birincil} style={{ marginBottom: 20 }} />
      <Text style={[styles.adimBaslik, { color: renkler.metin }]}>{m.aktariliyor}</Text>
      <Text style={[styles.yukleniyorMetin, { color: renkler.metinIkincil }]}>{m.aktariliyorAlt}</Text>
    </View>
  );
};

// ─── Uygulama hatası ─────────────────────────────────────────────────────────

export const UygulamaHatasiAdimi: React.FC<{ renkler: Renkler; hata: string | null }> = ({ renkler, hata }) => {
  const m = useMetin().yedekleme.sihirbaz;
  return (
  <View style={styles.merkezliIcerik}>
    <View style={[styles.buyukIkonCember, { backgroundColor: `${renkler.hata}18` }]}>
      <FontAwesome5 name="times-circle" size={44} color={renkler.hata} />
    </View>
    <Text style={[styles.adimBaslik, { color: renkler.metin }]}>{m.hataBaslik}</Text>
    <Text style={[styles.adimAltBaslik, { color: renkler.metinIkincil }]}>
      {m.hataAlt}
    </Text>
    {hata ? (
      <View style={[styles.hataKutu, { backgroundColor: `${renkler.hata}12`, borderColor: `${renkler.hata}40` }]}>
        <FontAwesome5 name="info-circle" size={14} color={renkler.hata} />
        <Text style={[styles.hataKutuMetin, { color: renkler.metinIkincil }]}>{hata}</Text>
      </View>
    ) : null}
  </View>
  );
};

// ─── Adım 4: Özet (başarı) ───────────────────────────────────────────────────

export const OzetAdimi: React.FC<{ renkler: Renkler; yazilanAnahtarSayisi: number }> = ({
  renkler,
  yazilanAnahtarSayisi,
}) => {
  const m = useMetin().yedekleme.sihirbaz;
  const bounceAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.spring(bounceAnim, {
      toValue: 1,
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [bounceAnim]);

  return (
    <View style={styles.merkezliIcerik}>
      <Animated.View style={[styles.basariIkonAlani, { transform: [{ scale: bounceAnim }] }]}>
        <FontAwesome5 name="check-circle" size={92} color={renkler.basarili} />
      </Animated.View>
      <Text style={[styles.adimBaslik, { color: renkler.metin }]}>{m.tamamBaslik}</Text>
      <Text style={[styles.adimAltBaslik, { color: renkler.metinIkincil }]}>
        {m.tamamAlt}
      </Text>

      <View style={[styles.ozetKutu, { backgroundColor: renkler.kartArkaplan, borderColor: `${renkler.sinir}80` }]}>
        <View style={styles.ozetSatir}>
          <FontAwesome5 name="check" size={14} color={renkler.basarili} />
          <Text style={[styles.ozetSatirMetin, { color: renkler.metinIkincil }]}>
            {m.guncellendi}
          </Text>
        </View>
        {yazilanAnahtarSayisi > 0 && (
          <View style={styles.ozetSatir}>
            <FontAwesome5 name="database" size={14} color={renkler.bilgi} />
            <Text style={[styles.ozetSatirMetin, { color: renkler.metinIkincil }]}>
              {sayili(m.birlestirildi, yazilanAnahtarSayisi)}
            </Text>
          </View>
        )}
        <View style={styles.ozetSatir}>
          <FontAwesome5 name="heart" size={14} color={renkler.hata} />
          <Text style={[styles.ozetSatirMetin, { color: renkler.metinIkincil }]}>
            {m.hayirli}
          </Text>
        </View>
      </View>
    </View>
  );
};
