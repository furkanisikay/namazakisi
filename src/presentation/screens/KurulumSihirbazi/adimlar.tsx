/**
 * KurulumSihirbazi adım bileşenleri (9 adım + InfoKutu yardımcı).
 * (Ana ekran dosyasını küçültmek için ayrıldı.)
 */
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Animated,
    Switch,
    FlatList,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { styles } from './stiller';
import { BildirimAyarlari, MuhafizYogunluk, KonumDurumu } from './tipler';
import { useTema } from '../../../core/theme';
import { RENK_PALETLERI } from '../../../core/theme/temalar';
import type { TemaModu } from '../../../core/theme/temalar';
import { TURKIYE_ILLERI_OFFLINE, Il } from '../../../domain/services/TurkiyeKonumServisi';

// ─── Adım 0: Hoş Geldiniz ────────────────────────────────────────────────────

export const HosgeldinizAdimi: React.FC = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulse2Anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.18, duration: 1400, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
    ])).start();
    setTimeout(() => {
      Animated.loop(Animated.sequence([
        Animated.timing(pulse2Anim, { toValue: 1.35, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulse2Anim, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ])).start();
    }, 500);
  }, []);

  return (
    <View style={styles.hosgeldinizIcerik}>
      <Animated.View style={[styles.halka2, { transform: [{ scale: pulse2Anim }] }]} />
      <Animated.View style={[styles.halka1, { transform: [{ scale: pulseAnim }] }]} />
      <View style={styles.moskeIkon}>
        <FontAwesome5 name="mosque" size={68} color="#fff" />
      </View>
      <Text style={styles.hosgeldinizBaslik}>Namaz Akışı</Text>
      <Text style={styles.hosgeldinizAltBaslik}>
        Günlük namazlarınızı takip etmenin en kolay yolu
      </Text>
      <Text style={styles.hosgeldinizAciklama}>
        Bu kurulum sihirbazı sizi yalnızca{' '}
        <Text style={{ fontWeight: '700' }}>birkaç dakika</Text> alacak.
        {'\n'}Adım adım uygulamayı size özel ayarlayacağız.
      </Text>
    </View>
  );
};

// ─── Adım 1: Bildirim İzni ───────────────────────────────────────────────────

export const BildirimIzniAdimi: React.FC<{
  bildirimIzni: 'bekliyor' | 'isteniyor' | 'verildi' | 'reddedildi';
}> = ({ bildirimIzni }) => {
  const bellAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (bildirimIzni === 'bekliyor') {
      Animated.loop(Animated.sequence([
        Animated.timing(bellAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(bellAnim, { toValue: -1, duration: 200, useNativeDriver: true }),
        Animated.timing(bellAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(bellAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.delay(2000),
      ])).start();
    }
  }, [bildirimIzni]);

  useEffect(() => {
    if (bildirimIzni === 'verildi') {
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();
    }
  }, [bildirimIzni]);

  const rotate = bellAnim.interpolate({ inputRange: [-1, 1], outputRange: ['-15deg', '15deg'] });

  // ── İsteniyor (loading) ──
  if (bildirimIzni === 'isteniyor') {
    return (
      <View style={styles.merkezliIcerik}>
        <ActivityIndicator size="large" color="#f59e0b" style={{ marginBottom: 20 }} />
        <Text style={styles.adimBaslik}>İzin Bekleniyor...</Text>
        <Text style={styles.adimAltBaslik}>Açılan sistem ekranında izin verin</Text>
      </View>
    );
  }

  // ── Verildi (başarı) ──
  if (bildirimIzni === 'verildi') {
    return (
      <View style={styles.merkezliIcerik}>
        <Animated.View style={[styles.buyukIkonCember, { backgroundColor: '#fef3c720', transform: [{ scale: scaleAnim }] }]}>
          <FontAwesome5 name="check-circle" size={52} color="#10b981" />
        </Animated.View>
        <Text style={styles.adimBaslik}>Bildirimler Açık!</Text>
        <Text style={styles.adimAltBaslik}>Namaz vakitleri yaklaştığında sizi bilgilendireceğiz.</Text>
        <Text style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', marginTop: 8 }}>
          Bir sonraki adıma geçiliyor...
        </Text>
      </View>
    );
  }

  // ── Reddedildi (fallback) ──
  if (bildirimIzni === 'reddedildi') {
    return (
      <View style={styles.merkezliIcerik}>
        <View style={[styles.buyukIkonCember, { backgroundColor: '#fef2f220' }]}>
          <FontAwesome5 name="bell-slash" size={44} color="#ef4444" />
        </View>
        <Text style={styles.adimBaslik}>İzin Verilmedi</Text>
        <Text style={styles.adimAltBaslik}>
          Bildirimler olmadan da uygulamayı kullanabilirsiniz.
          {'\n'}Daha sonra Ayarlar → Bildirimler bölümünden açabilirsiniz.
        </Text>
        <View style={[styles.bilgiKutu, { marginTop: 16 }]}>
          <FontAwesome5 name="info-circle" size={14} color="#3b82f6" />
          <Text style={styles.bilgiKutuMetin}>
            Bildirimleri açmak için telefonunuzun uygulama ayarlarından izin verebilirsiniz.
          </Text>
        </View>
      </View>
    );
  }

  // ── Bekliyor (varsayılan) ──
  return (
    <ScrollView style={styles.scrollAdim} contentContainerStyle={styles.scrollIcerik} showsVerticalScrollIndicator={false}>
      <Animated.View style={[styles.buyukIkonCember, { backgroundColor: '#fef3c720' }, { transform: [{ rotate }] }]}>
        <FontAwesome5 name="bell" size={44} color="#f59e0b" />
      </Animated.View>

      <Text style={styles.adimBaslik}>Bildirim İzni</Text>
      <Text style={styles.adimAltBaslik}>
        Namazları hiç kaçırmamak için bildirim iznine ihtiyacımız var
      </Text>

      <InfoKutu
        ikon="clock"
        renk="#3b82f6"
        baslik="Namaz Vakti Bildirimleri"
        aciklama="Seçtiğiniz namaz vakitleri yaklaştığında sizi önceden bilgilendiririz."
      />
      <InfoKutu
        ikon="shield-alt"
        renk="#10b981"
        baslik="Namaz Muhafızı"
        aciklama="Namaz kılana kadar artan hatırlatmalar göndeririz — vakti kaçırmanız imkansız olur."
      />
      <InfoKutu
        ikon="fire"
        renk="#f97316"
        baslik="Seri & Rozetler"
        aciklama="Seriniz tehlikedeyken veya yeni bir rozet kazandığınızda bildirim alırsınız."
      />

      <View style={styles.gizlilikBanner}>
        <FontAwesome5 name="lock" size={14} color="#059669" />
        <Text style={styles.gizlilikBannerMetin}>
          <Text style={{ fontWeight: '700' }}>Gizlilik güvencesi:</Text> Bildirimler{' '}
          <Text style={{ fontWeight: '700' }}>yalnızca namaz vakitleri</Text> için kullanılır.
          Reklam veya pazarlama amaçlı bildirim gönderilmez.
        </Text>
      </View>
    </ScrollView>
  );
};

// ─── Adım 2: Konum ───────────────────────────────────────────────────────────

export const KonumAdimi: React.FC<{
  konumDurumu: KonumDurumu;
  konumBilgi: string;
  manuelIl: Il | null;
  setManuelIl: (il: Il) => void;
  onIzinIste: () => void;
  onAtla: () => void;
  onManuelKaydet: () => void;
}> = ({ konumDurumu, konumBilgi, manuelIl, setManuelIl }) => {

  if (konumDurumu === 'gpsAliniyor') {
    return (
      <View style={styles.merkezliIcerik}>
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginBottom: 20 }} />
        <Text style={styles.adimBaslik}>Konum Alınıyor...</Text>
        <Text style={styles.adimAltBaslik}>GPS sinyali bekleniyor, lütfen bekleyin</Text>
      </View>
    );
  }

  if (konumDurumu === 'gpsBasarili') {
    return (
      <View style={styles.merkezliIcerik}>
        <View style={[styles.buyukIkonCember, { backgroundColor: '#10b98120' }]}>
          <FontAwesome5 name="check-circle" size={52} color="#10b981" />
        </View>
        <Text style={styles.adimBaslik}>Konum Alındı</Text>
        <Text style={styles.adimAltBaslik}>{konumBilgi}</Text>
        <Text style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', marginTop: 8 }}>
          Namaz vakitleri hesaplanıyor...
        </Text>
      </View>
    );
  }

  if (konumDurumu === 'gpsReddedildi') {
    return (
      <View style={{ flex: 1 }}>
        <View style={[styles.buyukIkonCember, { backgroundColor: '#6366f120', alignSelf: 'center' }]}>
          <FontAwesome5 name="city" size={40} color="#6366f1" />
        </View>
        <Text style={[styles.adimBaslik, { textAlign: 'center' }]}>Şehrinizi Seçin</Text>
        <Text style={[styles.adimAltBaslik, { textAlign: 'center', marginBottom: 12 }]}>
          Doğru namaz vakitleri için bulunduğunuz ili seçin
        </Text>
        {manuelIl && (
          <View style={styles.seciliIlBanner}>
            <FontAwesome5 name="map-marker-alt" size={14} color="#6366f1" />
            <Text style={styles.seciliIlMetin}>Seçili: {manuelIl.ad}</Text>
          </View>
        )}
        <FlatList
          data={TURKIYE_ILLERI_OFFLINE}
          keyExtractor={item => String(item.id)}
          style={styles.ilListesi}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.ilSatir,
                manuelIl?.id === item.id && styles.ilSatirSecili,
              ]}
              onPress={() => setManuelIl(item)}
              accessibilityRole="button"
              accessibilityLabel={`${item.ad} şehrini seç${manuelIl?.id === item.id ? ', şu an seçili' : ''}`}
            >
              <Text style={[
                styles.ilAdi,
                manuelIl?.id === item.id && styles.ilAdiSecili,
              ]}>
                {item.ad}
              </Text>
              {manuelIl?.id === item.id && (
                <FontAwesome5 name="check" size={14} color="#6366f1" />
              )}
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  // bekliyor durumu — varsayılan
  return (
    <ScrollView style={styles.scrollAdim} contentContainerStyle={styles.scrollIcerik} showsVerticalScrollIndicator={false}>
      <View style={[styles.buyukIkonCember, { backgroundColor: '#3b82f620', alignSelf: 'center' }]}>
        <FontAwesome5 name="map-marker-alt" size={44} color="#3b82f6" />
      </View>
      <Text style={styles.adimBaslik}>Konumunuz</Text>
      <Text style={styles.adimAltBaslik}>
        Namaz vakitleri ve kıble yönünün doğru hesaplanabilmesi için konum bilginize ihtiyacımız var
      </Text>

      <InfoKutu ikon="clock" renk="#10b981" baslik="Namaz Vakitleri" aciklama="Konum verisi yalnızca namaz vakitlerini hesaplamak için kullanılır. Coğrafi konuma göre vakitler farklılık gösterir." />
      <InfoKutu ikon="compass" renk="#f59e0b" baslik="Kıble Yönü" aciklama="Konum verisi, Kâbe'ye göre doğru kıble yönünün hesaplanmasında kullanılır." />
      <InfoKutu ikon="map-pin" renk="#8b5cf6" baslik="Seyahatte Otomatik Güncelleme" aciklama="İsteğe bağlı seyahat modu; siz bir şehirden diğerine geçtiğinizde namaz vakitlerini sessizce günceller. Varsayılan olarak kapalıdır." />

      <View style={styles.gizlilikBanner}>
        <FontAwesome5 name="lock" size={14} color="#059669" />
        <Text style={styles.gizlilikBannerMetin}>
          Konum veriniz{' '}
          <Text style={{ fontWeight: '700' }}>yalnızca cihazınızda işlenir</Text>;
          sunucularımıza gönderilmez, üçüncü taraflarla paylaşılmaz ve reklam/analitik amacıyla kullanılmaz.
        </Text>
      </View>
    </ScrollView>
  );
};

// ─── Adım 3: Tema ────────────────────────────────────────────────────────────

export const TemaAdimi: React.FC<{
  palet: typeof RENK_PALETLERI[0];
  mod: string;
  paletiDegistir: (id: string) => void;
  moduDegistir: (mod: TemaModu) => void;
}> = ({ palet, mod, paletiDegistir, moduDegistir }) => {
  const { koyuMu } = useTema();
  // Önizleme için seçili moda göre dark/light hesapla
  const onizlemeKoyu = mod === 'koyu' ? true : mod === 'acik' ? false : koyuMu;
  const onizlemeBg = onizlemeKoyu ? '#1f2937' : '#fff';
  const onizlemeMetin = onizlemeKoyu ? '#f9fafb' : '#111';
  const onizlemeMetinIkincil = onizlemeKoyu ? '#9ca3af' : '#6b7280';
  const onizlemeSinir = onizlemeKoyu ? '#374151' : '#e5e7eb';

  return (
  <ScrollView style={styles.scrollAdim} contentContainerStyle={styles.scrollIcerik} showsVerticalScrollIndicator={false}>
    <View style={[styles.buyukIkonCember, { backgroundColor: palet.birincil + '25', alignSelf: 'center' }]}>
      <FontAwesome5 name="palette" size={44} color={palet.birincil} />
    </View>
    <Text style={styles.adimBaslik}>Tema Seçin</Text>
    <Text style={styles.adimAltBaslik}>Renk paleti seçin — uygulama anlık olarak değişir</Text>

    {/* Canlı önizleme — seçili moda göre dark/light */}
    <View style={[styles.onizlemeKart, { borderColor: palet.birincil + '40', backgroundColor: onizlemeBg }]}>
      <View style={[styles.onizlemeBaslik, { backgroundColor: palet.birincil }]}>
        <FontAwesome5 name="mosque" size={14} color="#fff" />
        <Text style={styles.onizlemeBaslikMetin}>Namaz Akışı</Text>
      </View>
      <View style={styles.onizlemeIcerik}>
        <View style={[styles.onizlemeVakitSatir, { borderLeftColor: palet.birincil }]}>
          <Text style={[styles.onizlemeVakitAdi, { color: palet.birincil }]}>Öğle</Text>
          <Text style={[styles.onizlemeVakitSaat, { color: onizlemeMetinIkincil }]}>13:24</Text>
          <View style={[styles.onizlemeBadge, { backgroundColor: palet.birincilAcik }]}>
            <Text style={[styles.onizlemeBadgeMetin, { color: palet.birincilKoyu }]}>Aktif</Text>
          </View>
        </View>
        <View style={[styles.onizlemeVakitSatir, { borderLeftColor: onizlemeSinir }]}>
          <Text style={[styles.onizlemeVakitAdiPasif, { color: onizlemeMetinIkincil }]}>İkindi</Text>
          <Text style={[styles.onizlemeVakitSaat, { color: onizlemeMetinIkincil }]}>16:42</Text>
        </View>
      </View>
    </View>

    <Text style={styles.bolumBaslik}>Renk Paleti</Text>
    <View style={styles.paletIzgara}>
      {RENK_PALETLERI.map(p => (
        <TouchableOpacity
          key={p.id}
          style={[styles.paletKart, palet.id === p.id && { borderColor: p.birincil }]}
          onPress={() => paletiDegistir(p.id)}
          accessibilityRole="button"
          accessibilityLabel={`${p.ad} renk paleti${palet.id === p.id ? ', şu an seçili' : ''}`}
        >
          <View style={[styles.paletRenk, { backgroundColor: p.birincil }]} />
          <View style={[styles.paletVurgu, { backgroundColor: p.vurgu }]} />
          <Text style={[styles.paletAdi, palet.id === p.id && { color: p.birincil }]}>{p.ad}</Text>
          {palet.id === p.id && (
            <View style={[styles.paletSecimIsaret, { backgroundColor: p.birincil }]}>
              <FontAwesome5 name="check" size={9} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>

    <Text style={styles.bolumBaslik}>Görünüm Modu</Text>
    <View style={styles.modSecici}>
      {(['acik', 'sistem', 'koyu'] as TemaModu[]).map(m => (
        <TouchableOpacity
          key={m}
          style={[styles.modButon, mod === m && { backgroundColor: palet.birincil }]}
          onPress={() => moduDegistir(m)}
          accessibilityRole="button"
          accessibilityLabel={`${m === 'acik' ? 'Açık' : m === 'koyu' ? 'Koyu' : 'Sistem'} tema${mod === m ? ', şu an seçili' : ''}`}
        >
          <FontAwesome5
            name={m === 'acik' ? 'sun' : m === 'koyu' ? 'moon' : 'mobile-alt'}
            size={15}
            color={mod === m ? '#fff' : '#6b7280'}
          />
          <Text style={[styles.modButonMetin, mod === m && { color: '#fff' }]}>
            {m === 'acik' ? 'Açık' : m === 'koyu' ? 'Koyu' : 'Sistem'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
    <Text style={styles.modAciklama}>
      <FontAwesome5 name="info-circle" size={12} color="#9ca3af" />{' '}
      {mod === 'sistem'
        ? 'Telefonunuzun ayarına göre otomatik değişir'
        : mod === 'acik'
        ? 'Her zaman aydınlık görünüm kullanılır'
        : 'Her zaman karanlık görünüm kullanılır'}
    </Text>
  </ScrollView>
  );
};

// ─── Adım 4: Vakit Bildirimleri ──────────────────────────────────────────────

export const VakitBildirimAdimi: React.FC<{
  bildirimler: BildirimAyarlari;
  onToggle: (v: keyof BildirimAyarlari) => void;
}> = ({ bildirimler, onToggle }) => {
  const vakitler: { anahtar: keyof BildirimAyarlari; ad: string; ikon: string; renk: string; saat: string }[] = [
    { anahtar: 'imsak', ad: 'İmsak', ikon: 'star', renk: '#6366f1', saat: 'Sabah erkenden' },
    { anahtar: 'ogle', ad: 'Öğle', ikon: 'sun', renk: '#f59e0b', saat: 'Öğleden sonra' },
    { anahtar: 'ikindi', ad: 'İkindi', ikon: 'cloud-sun', renk: '#f97316', saat: 'İkindi vakti' },
    { anahtar: 'aksam', ad: 'Akşam', ikon: 'cloud', renk: '#ef4444', saat: 'Güneş batımında' },
    { anahtar: 'yatsi', ad: 'Yatsı', ikon: 'moon', renk: '#8b5cf6', saat: 'Geç akşam' },
  ];

  const aktifSayisi = Object.values(bildirimler).filter(Boolean).length;

  return (
    <ScrollView style={styles.scrollAdim} contentContainerStyle={styles.scrollIcerik} showsVerticalScrollIndicator={false}>
      <View style={[styles.buyukIkonCember, { backgroundColor: '#fef3c720', alignSelf: 'center' }]}>
        <FontAwesome5 name="bell" size={44} color="#f59e0b" />
      </View>
      <Text style={styles.adimBaslik}>Namaz Vakti Bildirimleri</Text>
      <Text style={styles.adimAltBaslik}>
        Hangi vakitlerde bildirim almak istediğinizi seçin
      </Text>

      <View style={styles.ozet}>
        <FontAwesome5 name="check-circle" size={14} color="#10b981" />
        <Text style={styles.ozetMetin}>
          {aktifSayisi === 0
            ? 'Hiç vakit bildirimi seçilmedi'
            : `${aktifSayisi} vakit için bildirim açık`}
        </Text>
      </View>

      <View style={styles.bildirimListe}>
        {vakitler.map(v => (
          <TouchableOpacity
            key={v.anahtar}
            style={[styles.bildirimSatir, bildirimler[v.anahtar] && { borderColor: v.renk + '50', borderWidth: 1.5 }]}
            onPress={() => onToggle(v.anahtar)}
            accessibilityRole="button"
            accessibilityLabel={`${v.ad} bildirimi, ${bildirimler[v.anahtar] ? 'açık' : 'kapalı'}`}
          >
            <View style={[styles.vakitIkon, { backgroundColor: v.renk + '18' }]}>
              <FontAwesome5 name={v.ikon} size={18} color={v.renk} />
            </View>
            <View style={styles.vakitMetin}>
              <Text style={styles.vakitAdi}>{v.ad}</Text>
              <Text style={styles.vakitAciklama}>{v.saat}</Text>
            </View>
            <Switch
              value={bildirimler[v.anahtar]}
              onValueChange={() => onToggle(v.anahtar)}
              trackColor={{ false: '#e5e7eb', true: v.renk + '70' }}
              thumbColor={bildirimler[v.anahtar] ? v.renk : '#d1d5db'}
            />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.bilgiKutu}>
        <FontAwesome5 name="info-circle" size={14} color="#3b82f6" />
        <Text style={styles.bilgiKutuMetin}>
          Bildirimler vakit girmeden birkaç dakika önce gelir. İstediğiniz zaman Ayarlar'dan düzenleyebilirsiniz.
        </Text>
      </View>
    </ScrollView>
  );
};

// ─── Adım 5: Muhafız Tanıtım ─────────────────────────────────────────────────

export const MuhafizTanitimAdimi: React.FC<{
  muhafizAktif: boolean;
  setMuhafizAktif: (aktif: boolean) => void;
}> = ({ muhafizAktif, setMuhafizAktif }) => {
  const [aktifSeviye, setAktifSeviye] = useState(0);
  const seviyeAnim = useRef(new Animated.Value(0)).current;

  const seviyeler = [
    { saat: '45 dk önce', baslik: '1. Hatırlatma', aciklama: 'Vakit yaklaşıyor, hazırlanmaya başlayın', renk: '#10b981', yogunluk: 1 },
    { saat: '25 dk önce', baslik: '2. Hatırlatma', aciklama: 'Biraz daha yakın, namazı kılmanın vakti geldi', renk: '#3b82f6', yogunluk: 2 },
    { saat: '10 dk önce', baslik: '3. Hatırlatma', aciklama: 'Son dakikalar! Namaz vakti çok yakın', renk: '#f59e0b', yogunluk: 3 },
    { saat: 'Vakit!', baslik: 'Son Çağrı', aciklama: 'Namazı kıldıysanız Muhafız susacak', renk: '#ef4444', yogunluk: 4 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setAktifSeviye(prev => (prev + 1) % seviyeler.length);
      Animated.sequence([
        Animated.timing(seviyeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(seviyeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const s = seviyeler[aktifSeviye];

  return (
    <ScrollView style={styles.scrollAdim} contentContainerStyle={styles.scrollIcerik} showsVerticalScrollIndicator={false}>
      <View style={[styles.buyukIkonCember, { backgroundColor: '#10b98120', alignSelf: 'center' }]}>
        <FontAwesome5 name="shield-alt" size={44} color="#10b981" />
      </View>
      <Text style={styles.adimBaslik}>Namaz Muhafızı</Text>
      <Text style={styles.adimAltBaslik}>
        Namazı kılana kadar artan sıklıkta hatırlatan özel koruma sistemi
      </Text>

      {/* Canlı animatik gösterim */}
      <View style={styles.muhafizAnimKart}>
        <View style={styles.muhafizAnimBaslik}>
          <FontAwesome5 name="shield-alt" size={14} color="#10b981" />
          <Text style={styles.muhafizAnimBaslikMetin}>Muhafız nasıl çalışır?</Text>
        </View>
        <View style={styles.muhafizSeviyeCizgi}>
          {seviyeler.map((sv, i) => (
            <View key={i} style={styles.muhafizSeviyeNokta}>
              <View style={[
                styles.muhafizNokta,
                { backgroundColor: i <= aktifSeviye ? sv.renk : '#e5e7eb' },
                i === aktifSeviye && { transform: [{ scale: 1.3 }] },
              ]} />
              {i < seviyeler.length - 1 && (
                <View style={[styles.muhafizCizgi, { backgroundColor: i < aktifSeviye ? sv.renk : '#e5e7eb' }]} />
              )}
            </View>
          ))}
        </View>
        <View style={[styles.muhafizAktifKart, { borderColor: s.renk + '40', backgroundColor: s.renk + '08' }]}>
          <View style={[styles.muhafizYogunlukBar, { backgroundColor: s.renk + '20' }]}>
            {Array.from({ length: s.yogunluk }).map((_, i) => (
              <FontAwesome5 key={i} name="bell" size={12} color={s.renk} />
            ))}
          </View>
          <Text style={[styles.muhafizSaatMetin, { color: s.renk }]}>{s.saat}</Text>
          <Text style={styles.muhafizSeviyeBaslik}>{s.baslik}</Text>
          <Text style={styles.muhafizSeviyeAciklama}>{s.aciklama}</Text>
        </View>
      </View>

      <InfoKutu
        ikon="check-circle"
        renk="#10b981"
        baslik="Namaz kılınca otomatik durur"
        aciklama="Ana ekranda 'Kıldım' butonuna dokunduğunuzda Muhafız o vakit için susar."
      />
      <InfoKutu
        ikon="sliders-h"
        renk="#6366f1"
        baslik="Tamamen özelleştirilebilir"
        aciklama="Her seviyenin zamanlamasını dakika dakika kendiniz ayarlayabilirsiniz."
      />

      <View style={[styles.muhafizToggle, muhafizAktif && styles.muhafizToggleAktif]}>
        <View style={styles.muhafizToggleSol}>
          <FontAwesome5
            name={muhafizAktif ? 'shield-alt' : 'shield'}
            size={22}
            color={muhafizAktif ? '#10b981' : '#9ca3af'}
          />
          <View>
            <Text style={styles.muhafizToggleBaslik}>Muhafızı Etkinleştir</Text>
            <Text style={styles.muhafizToggleAlt}>
              {muhafizAktif ? 'Aktif — namaz kaçırmayacaksınız' : 'Devre dışı'}
            </Text>
          </View>
        </View>
        <Switch
          value={muhafizAktif}
          onValueChange={setMuhafizAktif}
          trackColor={{ false: '#e5e7eb', true: '#10b98160' }}
          thumbColor={muhafizAktif ? '#10b981' : '#d1d5db'}
        />
      </View>
    </ScrollView>
  );
};

// ─── Adım 6: Muhafız Yoğunluk ────────────────────────────────────────────────

export const MuhafizYogunlukAdimi: React.FC<{
  yogunluk: MuhafizYogunluk;
  setYogunluk: (y: MuhafizYogunluk) => void;
  muhafizAktif: boolean;
}> = ({ yogunluk, setYogunluk, muhafizAktif }) => {

  const secenekler: {
    id: MuhafizYogunluk;
    ad: string;
    etiket: string;
    renk: string;
    detay: string;
    satir1: string;
    satir2: string;
    icin: string;
  }[] = [
    {
      id: 'hafif',
      ad: 'Hafif',
      etiket: 'Sakin',
      renk: '#10b981',
      detay: 'Gündelik hayatı az bölen, nazik hatırlatmalar',
      satir1: 'İlk hatırlatma vakitten 30 dk önce',
      satir2: 'Her 30 dakikada bir tekrar',
      icin: 'İçin: Zaten düzenli namaz kılanlar',
    },
    {
      id: 'normal',
      ad: 'Normal',
      etiket: 'Önerilen',
      renk: '#3b82f6',
      detay: 'Etkili ve dengeli — çoğu kullanıcı için ideal',
      satir1: 'İlk hatırlatma vakitten 45 dk önce',
      satir2: 'Her 20 dakikada bir tekrar',
      icin: 'İçin: Takibe ihtiyaç duyanlar',
    },
    {
      id: 'yogun',
      ad: 'Yoğun',
      etiket: 'Güçlü',
      renk: '#f97316',
      detay: 'Sık ve ısrarcı hatırlatmalar — kesinlikle kaçırmamak için',
      satir1: 'İlk hatırlatma vakitten 60 dk önce',
      satir2: 'Her 10 dakikada bir tekrar',
      icin: 'İçin: Yoğun tempolu hayat yaşayanlar',
    },
    {
      id: 'ozel',
      ad: 'Özel',
      etiket: 'Gelişmiş',
      renk: '#8b5cf6',
      detay: 'Her seviyenin zamanlamasını kendiniz belirleyin',
      satir1: 'Kurulum sonrası Ayarlar ekranından',
      satir2: '4 seviyeyi bağımsız yapılandırabilirsiniz',
      icin: 'İçin: Tam kontrol isteyenler',
    },
  ];

  if (!muhafizAktif) {
    return (
      <View style={styles.merkezliIcerik}>
        <View style={[styles.buyukIkonCember, { backgroundColor: '#f3f4f6' }]}>
          <FontAwesome5 name="shield" size={44} color="#9ca3af" />
        </View>
        <Text style={styles.adimBaslik}>Hatırlatma Yoğunluğu</Text>
        <Text style={styles.adimAltBaslik}>
          Muhafız devre dışı bırakıldı
        </Text>
        <View style={styles.bilgiKutu}>
          <FontAwesome5 name="info-circle" size={14} color="#6b7280" />
          <Text style={styles.bilgiKutuMetin}>
            Bir önceki adıma dönerek Muhafızı etkinleştirip yoğunluk seçebilirsiniz.
            İstediğiniz zaman Ayarlar → Namaz Muhafızı'ndan da açabilirsiniz.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollAdim} contentContainerStyle={styles.scrollIcerik} showsVerticalScrollIndicator={false}>
      <View style={[styles.buyukIkonCember, { backgroundColor: '#6366f120', alignSelf: 'center' }]}>
        <FontAwesome5 name="sliders-h" size={44} color="#6366f1" />
      </View>
      <Text style={styles.adimBaslik}>Hatırlatma Yoğunluğu</Text>
      <Text style={styles.adimAltBaslik}>
        Ne sıklıkta hatırlatılmak istediğinizi seçin
      </Text>

      <View style={styles.yogunlukListe}>
        {secenekler.map(s => {
          const secili = yogunluk === s.id;
          return (
            <TouchableOpacity
              key={s.id}
              style={[styles.yogunlukKart, secili && { borderColor: s.renk, borderWidth: 2, backgroundColor: s.renk + '06' }]}
              onPress={() => setYogunluk(s.id)}
              accessibilityRole="button"
              accessibilityLabel={`${s.ad} yoğunluk seviyesi, ${s.detay}${secili ? ', şu an seçili' : ''}`}
            >
              <View style={styles.yogunlukKartUst}>
                <View style={[styles.yogunlukIkon, { backgroundColor: s.renk + '18' }]}>
                  <FontAwesome5 name="bell" size={20} color={s.renk} />
                </View>
                <View style={styles.yogunlukBaslikAlani}>
                  <View style={styles.yogunlukBaslikSatir}>
                    <Text style={[styles.yogunlukAdi, secili && { color: s.renk }]}>{s.ad}</Text>
                    <View style={[styles.yogunlukEtiket, { backgroundColor: s.renk + '18' }]}>
                      <Text style={[styles.yogunlukEtiketMetin, { color: s.renk }]}>{s.etiket}</Text>
                    </View>
                  </View>
                  <Text style={styles.yogunlukDetay}>{s.detay}</Text>
                </View>
                {secili && (
                  <View style={[styles.secimDairesi, { backgroundColor: s.renk }]}>
                    <FontAwesome5 name="check" size={11} color="#fff" />
                  </View>
                )}
              </View>
              <View style={[styles.yogunlukDetayAlti, secili && { borderTopColor: s.renk + '30' }]}>
                <View style={styles.yogunlukSatir}>
                  <FontAwesome5 name="clock" size={11} color="#9ca3af" />
                  <Text style={styles.yogunlukSatirMetin}>{s.satir1}</Text>
                </View>
                <View style={styles.yogunlukSatir}>
                  <FontAwesome5 name="redo" size={11} color="#9ca3af" />
                  <Text style={styles.yogunlukSatirMetin}>{s.satir2}</Text>
                </View>
                <View style={styles.yogunlukSatir}>
                  <FontAwesome5 name="user" size={11} color="#9ca3af" />
                  <Text style={[styles.yogunlukSatirMetin, { fontStyle: 'italic' }]}>{s.icin}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

// ─── Adım 7: Özel Gün Modu ──────────────────────────────────────────────────

export const OzelGunAdimi: React.FC = () => (
  <ScrollView style={styles.scrollAdim} contentContainerStyle={styles.scrollIcerik} showsVerticalScrollIndicator={false}>
    <View style={[styles.buyukIkonCember, { backgroundColor: '#f59e0b20', alignSelf: 'center' }]}>
      <FontAwesome5 name="star" size={44} color="#f59e0b" />
    </View>
    <Text style={styles.adimBaslik}>Özel Gün Modu</Text>
    <Text style={styles.adimAltBaslik}>
      Serinizi koruyun — hayat her zaman kolay olmaz
    </Text>

    <View style={styles.bilgiKutu}>
      <FontAwesome5 name="info-circle" size={14} color="#f59e0b" />
      <Text style={styles.bilgiKutuMetin}>
        <Text style={{ fontWeight: '700' }}>Özel Gün Modu nedir?</Text>{' '}
        Hastalık, yolculuk, operasyon gibi durumlarda namazlarınızı kılamasanız bile serinizi kaybetmemenizi sağlar.
      </Text>
    </View>

    <InfoKutu
      ikon="heart"
      renk="#ef4444"
      baslik="Hastalık veya Yorgunluk"
      aciklama="Hasta olduğunuzda veya aşırı yorgunlukta seri koruması devreye girer, iyileşince kaldığınız yerden devam edersiniz."
    />
    <InfoKutu
      ikon="plane"
      renk="#3b82f6"
      baslik="Yolculuk"
      aciklama="Uzun seyahatlerde, özellikle uçuş veya transit geçişlerde namaz imkânı bulamasanız güvende olursunuz."
    />
    <InfoKutu
      ikon="hospital"
      renk="#8b5cf6"
      baslik="Operasyon / Hastane"
      aciklama="Tıbbi durumlarda aylarca süren seriniz tek günlük bir kesinti yüzünden kaybolmaz."
    />

    <View style={[styles.nasilKullanilirKart]}>
      <Text style={styles.nasilKullanilirBaslik}>
        <FontAwesome5 name="hand-pointer" size={13} color="#374151" />  Nasıl kullanılır?
      </Text>
      <View style={styles.adimAdimSatir}>
        <View style={styles.adimNumara}><Text style={styles.adimNumaraMetin}>1</Text></View>
        <Text style={styles.adimAdimMetin}>Ana ekranda bugünün tarihine uzun basın</Text>
      </View>
      <View style={styles.adimAdimSatir}>
        <View style={styles.adimNumara}><Text style={styles.adimNumaraMetin}>2</Text></View>
        <Text style={styles.adimAdimMetin}>"Özel Gün Olarak İşaretle" seçeneğini seçin</Text>
      </View>
      <View style={styles.adimAdimSatir}>
        <View style={styles.adimNumara}><Text style={styles.adimNumaraMetin}>3</Text></View>
        <Text style={styles.adimAdimMetin}>O gün seri sayımına dahil edilmez</Text>
      </View>
    </View>
  </ScrollView>
);

// ─── Adım 8: Hazır ──────────────────────────────────────────────────────────

export const HazirAdimi: React.FC = () => {
  const bounceAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.spring(bounceAnim, {
      toValue: 1,
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.hosgeldinizIcerik}>
      <Animated.View style={{ transform: [{ scale: bounceAnim }], marginBottom: 28 }}>
        <FontAwesome5 name="check-circle" size={96} color="#fff" />
      </Animated.View>
      <Text style={styles.hosgeldinizBaslik}>Her Şey Hazır!</Text>
      <Text style={styles.hosgeldinizAltBaslik}>Ayarlarınız başarıyla kaydedildi</Text>
      <Text style={styles.hosgeldinizAciklama}>
        İstediğiniz zaman{' '}
        <Text style={{ fontWeight: '700' }}>Ayarlar</Text> ekranından tüm
        tercihleri değiştirebilirsiniz.{'\n\n'}
        Hayırlı namazlar!
      </Text>
    </View>
  );
};

// ─── Yardımcı Bileşenler ─────────────────────────────────────────────────────

export const InfoKutu: React.FC<{
  ikon: string;
  renk: string;
  baslik: string;
  aciklama: string;
}> = ({ ikon, renk, baslik, aciklama }) => (
  <View style={styles.infoKutu}>
    <View style={[styles.infoIkon, { backgroundColor: renk + '18' }]}>
      <FontAwesome5 name={ikon} size={18} color={renk} />
    </View>
    <View style={styles.infoMetin}>
      <Text style={styles.infoBaslik}>{baslik}</Text>
      <Text style={styles.infoAciklama}>{aciklama}</Text>
    </View>
  </View>
);
