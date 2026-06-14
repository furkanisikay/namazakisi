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
import { FontAwesome5 } from '@expo/vector-icons';
import { styles } from './stiller';
import { useRenkler } from '../../../../core/theme';
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

export const STRATEJILER: StratejiMeta[] = [
  {
    id: 'akilli',
    ad: 'Akıllı birleştir',
    ikon: 'object-group',
    aciklama:
      'Hiçbir kayıt kaybolmaz; kılınan namazlarınız birleşir, puanınız yeniden hesaplanır.',
    renkAnahtar: 'bilgi',
    onerilen: true,
  },
  {
    id: 'uzerineYaz',
    ad: 'Üzerine yaz',
    ikon: 'sync-alt',
    aciklama:
      'Yedek baz alınır; mevcut verileriniz yedektekiyle değiştirilir.',
    renkAnahtar: 'uyari',
  },
  {
    id: 'eksikleriEkle',
    ad: 'Sadece eksikleri ekle',
    ikon: 'plus',
    aciklama:
      'Sizde olmayanlar eklenir; çakışan her şey olduğu gibi korunur.',
    renkAnahtar: 'basarili',
  },
  {
    id: 'gelismis',
    ad: 'Gelişmiş',
    ikon: 'sliders-h',
    aciklama:
      'Namaz, puan, kaza ve ayarlar için ayrı ayrı strateji seçin.',
    renkAnahtar: 'birincil',
    gelismis: true,
  },
];

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
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

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
      <Text style={[styles.adimBaslik, { color: renkler.metin }]}>Yedek Dosyanızı Seçin</Text>
      <Text style={[styles.adimAltBaslik, { color: renkler.metinIkincil }]}>
        Daha önce oluşturduğunuz Namaz Akışı yedek dosyasını seçerek verilerinizi geri yükleyin
      </Text>

      <InfoKutu
        renkler={renkler}
        ikon="lock"
        renk={renkler.basarili}
        baslik="Verileriniz güvende"
        aciklama="Yedeğiniz yalnızca cihazınızda çözülür; hiçbir veri sunucuya gönderilmez."
      />
      <InfoKutu
        renkler={renkler}
        ikon="shield-alt"
        renk={renkler.bilgi}
        baslik="Mevcut verileriniz korunur"
        aciklama="İçe aktarmadan önce nasıl birleştirileceğini siz seçersiniz; istemeden hiçbir şey kaybolmaz."
      />
    </ScrollView>
  );
};

// ─── Adım 1: Çöz & doğrula (yükleme) ─────────────────────────────────────────

export const CozumleniyorAdimi: React.FC<{ renkler: Renkler }> = ({ renkler }) => (
  <View style={styles.merkezliIcerik}>
    <ActivityIndicator size="large" color={renkler.birincil} style={{ marginBottom: 20 }} />
    <Text style={[styles.adimBaslik, { color: renkler.metin }]}>Dosyanız İnceleniyor...</Text>
    <Text style={[styles.adimAltBaslik, { color: renkler.metinIkincil }]}>
      Yedeğiniz çözülüyor ve doğrulanıyor, lütfen bekleyin
    </Text>
  </View>
);

// ─── Hata ekranı (çözme hatası) ──────────────────────────────────────────────

export const CozmeHatasiAdimi: React.FC<{ renkler: Renkler }> = ({ renkler }) => (
  <View style={styles.merkezliIcerik}>
    <View style={[styles.buyukIkonCember, { backgroundColor: `${renkler.hata}18` }]}>
      <FontAwesome5 name="exclamation-triangle" size={42} color={renkler.hata} />
    </View>
    <Text style={[styles.adimBaslik, { color: renkler.metin }]}>Dosya Okunamadı</Text>
    <Text style={[styles.adimAltBaslik, { color: renkler.metinIkincil }]}>
      Bu dosya bir Namaz Akışı yedeği değil veya bozulmuş. Lütfen doğru yedek dosyasını seçtiğinizden emin olun.
    </Text>
    <View style={[styles.hataKutu, { backgroundColor: `${renkler.bilgi}12`, borderColor: `${renkler.bilgi}40` }]}>
      <FontAwesome5 name="info-circle" size={14} color={renkler.bilgi} />
      <Text style={[styles.hataKutuMetin, { color: renkler.metinIkincil }]}>
        Yedek dosyaları "namaz-yedek-…json" biçimindedir ve yalnızca bu uygulama ile oluşturulur.
      </Text>
    </View>
  </View>
);

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
  const icerikSatirlari: { ikon: string; renk: string; metin: string }[] = [
    {
      ikon: 'calendar-check',
      renk: renkler.bilgi,
      metin: `Cihazınızda şu an ${fark.mevcutGunSayisi} günlük namaz kaydı var.`,
    },
    {
      ikon: 'medal',
      renk: renkler.uyari,
      metin: fark.rozetVar ? 'Yedekte rozet kazanımlarınız var.' : 'Yedekte rozet kaydı yok.',
    },
    {
      ikon: 'book',
      renk: renkler.basarili,
      metin: fark.kazaVar ? 'Yedekte kaza namazı defteri var.' : 'Yedekte kaza defteri yok.',
    },
    {
      ikon: 'cog',
      renk: renkler.metinIkincil,
      metin: fark.ayarVar ? 'Yedekte uygulama ayarlarınız var.' : 'Yedekte ayar kaydı yok.',
    },
  ];

  return (
    <ScrollView style={styles.scrollAdim} contentContainerStyle={styles.scrollIcerik} showsVerticalScrollIndicator={false}>
      <View style={[styles.buyukIkonCember, { backgroundColor: `${renkler.birincil}20`, alignSelf: 'center' }]}>
        <FontAwesome5 name="balance-scale" size={40} color={renkler.birincil} />
      </View>
      <Text style={[styles.adimBaslik, { color: renkler.metin }]}>Yedeğiniz Hazır</Text>
      <Text style={[styles.adimAltBaslik, { color: renkler.metinIkincil }]}>
        Yedeğinizi nasıl birleştirmek istediğinizi seçin
      </Text>

      {/* Özet metrikler */}
      <View style={styles.metrikSatir}>
        <MetrikKart
          renkler={renkler}
          ikon="calendar-alt"
          renk={renkler.bilgi}
          sayi={fark.gelenGunSayisi}
          etiket="Yedekteki gün"
        />
        <MetrikKart
          renkler={renkler}
          ikon="code-branch"
          renk={renkler.uyari}
          sayi={fark.cakisanGunSayisi}
          etiket="Çakışan gün"
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

      <Text style={[styles.bolumBaslik, { color: renkler.metin }]}>Birleştirme Yöntemi</Text>

      <View style={styles.stratejiListe}>
        {STRATEJILER.map((s) => {
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
                      <Text style={[styles.stratejiRozetMetin, { color: renk }]}>ÖNERİLEN</Text>
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

export const KATEGORILER: KategoriMeta[] = [
  { id: 'namaz', ad: 'Namaz Kayıtları', aciklama: 'Kıldığınız namazlar', ikon: 'pray' },
  { id: 'puan', ad: 'Puan & Rozetler', aciklama: 'İlerleme ve kazanımlar', ikon: 'star' },
  { id: 'kaza', ad: 'Kaza Defteri', aciklama: 'Kaza namazı takibi', ikon: 'book' },
  { id: 'ayarlar', ad: 'Uygulama Ayarları', aciklama: 'Konum, bildirim, tema', ikon: 'cog' },
];

const KATEGORI_SECENEKLERI: { id: KategoriStratejisi; kisa: string }[] = [
  { id: 'akilli', kisa: 'Akıllı' },
  { id: 'uzerineYaz', kisa: 'Üzerine yaz' },
  { id: 'eksikleriEkle', kisa: 'Eksikler' },
];

export const GelismisAdimi: React.FC<{
  renkler: Renkler;
  secimler: Record<KategoriMeta['id'], KategoriStratejisi>;
  onDegis: (kategori: KategoriMeta['id'], strateji: KategoriStratejisi) => void;
}> = ({ renkler, secimler, onDegis }) => (
  <ScrollView style={styles.scrollAdim} contentContainerStyle={styles.scrollIcerik} showsVerticalScrollIndicator={false}>
    <View style={[styles.buyukIkonCember, { backgroundColor: `${renkler.birincil}20`, alignSelf: 'center' }]}>
      <FontAwesome5 name="sliders-h" size={40} color={renkler.birincil} />
    </View>
    <Text style={[styles.adimBaslik, { color: renkler.metin }]}>Gelişmiş Birleştirme</Text>
    <Text style={[styles.adimAltBaslik, { color: renkler.metinIkincil }]}>
      Her veri türü için ayrı bir yöntem belirleyebilirsiniz
    </Text>

    {KATEGORILER.map((k) => {
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
            {KATEGORI_SECENEKLERI.map((sec) => {
              const aktif = secili === sec.id;
              return (
                <TouchableOpacity
                  key={sec.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${k.ad} — ${sec.kisa}`}
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

// ─── Adım 3: Uygulanıyor (ilerleme) ──────────────────────────────────────────

export const UygulaniyorAdimi: React.FC<{ renkler: Renkler }> = ({ renkler }) => (
  <View style={styles.merkezliIcerik}>
    <ActivityIndicator size="large" color={renkler.birincil} style={{ marginBottom: 20 }} />
    <Text style={[styles.adimBaslik, { color: renkler.metin }]}>İçe Aktarılıyor...</Text>
    <Text style={[styles.yukleniyorMetin, { color: renkler.metinIkincil }]}>
      Verileriniz güvenle birleştiriliyor.{'\n'}Bu işlem birkaç saniye sürebilir.
    </Text>
  </View>
);

// ─── Uygulama hatası ─────────────────────────────────────────────────────────

export const UygulamaHatasiAdimi: React.FC<{ renkler: Renkler; hata: string | null }> = ({ renkler, hata }) => (
  <View style={styles.merkezliIcerik}>
    <View style={[styles.buyukIkonCember, { backgroundColor: `${renkler.hata}18` }]}>
      <FontAwesome5 name="times-circle" size={44} color={renkler.hata} />
    </View>
    <Text style={[styles.adimBaslik, { color: renkler.metin }]}>İçe Aktarma Tamamlanamadı</Text>
    <Text style={[styles.adimAltBaslik, { color: renkler.metinIkincil }]}>
      Verileriniz birleştirilirken bir sorun oluştu. Mevcut verileriniz olduğu gibi korundu; lütfen tekrar deneyin.
    </Text>
    {hata ? (
      <View style={[styles.hataKutu, { backgroundColor: `${renkler.hata}12`, borderColor: `${renkler.hata}40` }]}>
        <FontAwesome5 name="info-circle" size={14} color={renkler.hata} />
        <Text style={[styles.hataKutuMetin, { color: renkler.metinIkincil }]}>{hata}</Text>
      </View>
    ) : null}
  </View>
);

// ─── Adım 4: Özet (başarı) ───────────────────────────────────────────────────

export const OzetAdimi: React.FC<{ renkler: Renkler; yazilanAnahtarSayisi: number }> = ({
  renkler,
  yazilanAnahtarSayisi,
}) => {
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
      <Text style={[styles.adimBaslik, { color: renkler.metin }]}>İçe Aktarma Tamamlandı</Text>
      <Text style={[styles.adimAltBaslik, { color: renkler.metinIkincil }]}>
        Yedeğiniz başarıyla geri yüklendi. Verileriniz hazır!
      </Text>

      <View style={[styles.ozetKutu, { backgroundColor: renkler.kartArkaplan, borderColor: `${renkler.sinir}80` }]}>
        <View style={styles.ozetSatir}>
          <FontAwesome5 name="check" size={14} color={renkler.basarili} />
          <Text style={[styles.ozetSatirMetin, { color: renkler.metinIkincil }]}>
            Namaz kayıtlarınız, puanınız ve ayarlarınız güncellendi.
          </Text>
        </View>
        {yazilanAnahtarSayisi > 0 && (
          <View style={styles.ozetSatir}>
            <FontAwesome5 name="database" size={14} color={renkler.bilgi} />
            <Text style={[styles.ozetSatirMetin, { color: renkler.metinIkincil }]}>
              {yazilanAnahtarSayisi} veri kümesi güvenle birleştirildi.
            </Text>
          </View>
        )}
        <View style={styles.ozetSatir}>
          <FontAwesome5 name="heart" size={14} color={renkler.hata} />
          <Text style={[styles.ozetSatirMetin, { color: renkler.metinIkincil }]}>
            Hayırlı namazlar!
          </Text>
        </View>
      </View>
    </View>
  );
};
