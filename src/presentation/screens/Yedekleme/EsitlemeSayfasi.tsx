/**
 * Cihazlar arası eşitleme (issue #288) — Ayarlar > Yedekleme & Aktarım > Eşitleme.
 *
 * Varsayılan KAPALI; açmak açık rıza + parola ister. Yalnız bu build'de yapılandırılmış
 * sağlayıcılar gösterilir (hiçbiri yoksa Yedekleme sayfası bu ekrana giden kartı hiç
 * çizmez). Başlık navigasyon header'ındadır (AGENTS.md "sayfa başlığı TEK yerde").
 */

import * as React from 'react';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRenkler } from '../../../core/theme';
import { Anahtar } from '../../components/common/Anahtar';
import { BildirimModali } from '../../components/common/BildirimModali';
import { kisaBildirimGoster } from '../../components/common/KisaBildirim';
import {
  EsitlemeAkisAdimi,
  EsitlemeAkisModali,
} from '../../components/esitleme/EsitlemeAkisModali';
import { esitlemeHataMetni, useEsitleme } from '../../hooks/useEsitleme';
import type { SaglayiciKimligi } from '../../../core/esitleme/esitlemeTipleri';

/** "13.10.2026 14:05" — Intl'e bağlı değil (Hermes). */
export function esitlemeZamaniniBicimle(iso: string | null): string {
  if (!iso) return 'Henüz eşitlenmedi';
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return 'Henüz eşitlenmedi';
  const iki = (n: number) => String(n).padStart(2, '0');
  return `${iki(t.getDate())}.${iki(t.getMonth() + 1)}.${t.getFullYear()} ${iki(t.getHours())}:${iki(t.getMinutes())}`;
}

/** Akışta kalıp kullanıcıya gösterilen (eşitlemeyi AÇMAYAN) hatalar. */
const AKISTA_KALAN_HATALAR = new Set(['parolaYanlis', 'bozukVeri', 'surumYeni', 'yapilandirilmamis']);

export const EsitlemeSayfasi: React.FC = () => {
  const renkler = useRenkler();
  const e = useEsitleme();
  const { yenile } = e;
  const [adim, setAdim] = useState<EsitlemeAkisAdimi | null>(null);
  const [secili, setSecili] = useState<SaglayiciKimligi | null>(null);
  const [akisHatasi, setAkisHatasi] = useState<string | null>(null);
  const [bilgi, setBilgi] = useState<{ tip: 'hata' | 'bilgi'; baslik: string; mesaj: string } | null>(null);

  useFocusEffect(
    useCallback(() => {
      yenile();
    }, [yenile])
  );

  const adimaGec = (yeni: EsitlemeAkisAdimi | null) => {
    setAkisHatasi(null);
    setAdim(yeni);
  };

  const saglayiciSec = async (kimlik: SaglayiciKimligi) => {
    setSecili(kimlik);
    setAkisHatasi(null);
    const baglanti = await e.baglan(kimlik);
    if (baglanti.tur === 'iptal') {
      setAkisHatasi(
        kimlik === 'icloud'
          ? 'Bu cihazda iCloud açık görünmüyor. Ayarlar\'dan iCloud\'a giriş yapıp yeniden deneyin.'
          : 'Hesabınıza bağlanılamadı. Yeniden deneyebilirsiniz.'
      );
      return;
    }
    if (baglanti.tur === 'hata') return setAkisHatasi(esitlemeHataMetni(baglanti.kod));
    const uzak = await e.uzakDurumu(kimlik);
    if (uzak.tur === 'hata') return setAkisHatasi(esitlemeHataMetni(uzak.kod));
    adimaGec({ tur: 'parola', kip: uzak.tur === 'var' ? 'katil' : 'yeni' });
  };

  const rizaVer = () => {
    if (e.saglayicilar.length === 1) {
      adimaGec({ tur: 'saglayici' });
      saglayiciSec(e.saglayicilar[0].kimlik);
      return;
    }
    adimaGec({ tur: 'saglayici' });
  };

  const parolaGir = async (parola: string) => {
    const kimlik = secili ?? e.durum.saglayici;
    if (!kimlik || adim?.tur !== 'parola') return;
    const sonuc = await e.kur(kimlik, parola, adim.kip === 'sifirla' ? 'sifirla' : 'baslat');
    if (sonuc.tur === 'hata' && AKISTA_KALAN_HATALAR.has(sonuc.kod)) {
      setAkisHatasi(
        sonuc.kod === 'parolaYanlis'
          ? 'Parola eşleşmedi. Diğer cihazınızda belirlediğiniz parolayı girin.'
          : esitlemeHataMetni(sonuc.kod)
      );
      return;
    }
    adimaGec(null);
    if (sonuc.tur === 'hata') {
      setBilgi({ tip: 'bilgi', baslik: 'Eşitleme açıldı', mesaj: esitlemeHataMetni(sonuc.kod) });
    } else {
      kisaBildirimGoster('Eşitleme açıldı. Kayıtlarınız eşitlendi.');
    }
  };

  const kapatSec = async (uzaktakiniSil: boolean) => {
    const sonuc = await e.kapat(uzaktakiniSil);
    if (!sonuc.basarili) {
      setAkisHatasi(`Buluttaki veri silinemedi. ${esitlemeHataMetni(sonuc.kod)}`);
      return;
    }
    adimaGec(null);
    kisaBildirimGoster(uzaktakiniSil ? 'Eşitleme kapatıldı ve buluttaki veri silindi.' : 'Eşitleme bu cihazda kapatıldı.');
  };

  const simdiEsitle = async () => {
    const sonuc = await e.esitle();
    if (sonuc.tur === 'hata') {
      setBilgi({ tip: 'hata', baslik: 'Eşitlenemedi', mesaj: esitlemeHataMetni(sonuc.kod) });
    } else if (sonuc.tur !== 'kapali') {
      kisaBildirimGoster('Kayıtlarınız eşitlendi.');
    }
  };

  /** Son hataya göre tek dokunuşluk çözüm. */
  const hataCozumu = (): { etiket: string; ikon: string; onPress: () => void } | null => {
    const kod = e.durum.sonHata;
    const kimlik = e.durum.saglayici;
    if (!kod || !kimlik) return null;
    if (kod === 'yetkiYok') {
      return {
        etiket: 'Yeniden bağlanın',
        ikon: 'plug',
        onPress: async () => {
          const b = await e.baglan(kimlik, true);
          if (b.tur === 'tamam') await simdiEsitle();
        },
      };
    }
    if (kod === 'parolaYanlis' || kod === 'parolaGerekli') {
      return {
        etiket: 'Parolayı girin',
        ikon: 'key',
        onPress: () => {
          setSecili(kimlik);
          adimaGec({ tur: 'parola', kip: 'katil' });
        },
      };
    }
    return null;
  };

  const saglayiciAdi = e.saglayicilar.find((s) => s.kimlik === e.durum.saglayici)?.ad ?? '';
  const cozum = hataCozumu();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: renkler.arkaplan }} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {e.saglayicilar.length === 0 ? (
          <View className="rounded-2xl p-5" style={{ backgroundColor: renkler.kartArkaplan }}>
            <Text className="text-sm leading-5" style={{ color: renkler.metinIkincil }}>
              Bu sürümde eşitleme hizmeti etkin değil. Verilerinizi Yedekleme sayfasından şifreli bir dosyayla
              taşıyabilirsiniz.
            </Text>
          </View>
        ) : (
          <>
            <View className="rounded-2xl p-5 mb-4" style={{ backgroundColor: renkler.kartArkaplan, borderRadius: 24 }}>
              <View className="flex-row items-center">
                <View
                  className="w-11 h-11 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: renkler.birincil + '20' }}
                >
                  <FontAwesome5 name="sync-alt" size={18} color={renkler.birincil} solid />
                </View>
                <View className="flex-1 mr-3">
                  <Text className="text-base font-bold" style={{ color: renkler.metin }}>
                    Cihazlar arası eşitleme
                  </Text>
                  <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                    {e.durum.aktif ? `Açık · ${saglayiciAdi}` : 'Kapalı'}
                  </Text>
                </View>
                {e.yuklendi ? (
                  <Anahtar
                    value={e.durum.aktif}
                    disabled={e.mesgul}
                    onValueChange={(acik) => adimaGec(acik ? { tur: 'riza' } : { tur: 'kapat' })}
                    trackColor={{ false: renkler.sinir, true: renkler.birincil }}
                    accessibilityLabel="Cihazlar arası eşitleme"
                    accessibilityRole="switch"
                  />
                ) : (
                  <ActivityIndicator color={renkler.birincil} />
                )}
              </View>
              <Text className="text-sm leading-5 mt-4" style={{ color: renkler.metinIkincil }}>
                Telefonunuz ve tabletiniz gibi cihazlarınızda namaz kayıtlarınızı, kaza defterinizi ve rozetlerinizi
                kendi bulut hesabınız üzerinden eşitleyin. Veriler gönderilmeden önce yalnız sizin bildiğiniz bir
                parolayla şifrelenir; biz göremeyiz.
              </Text>
            </View>

            {e.durum.aktif && (
              <View className="rounded-2xl p-5 mb-4" style={{ backgroundColor: renkler.kartArkaplan, borderRadius: 24 }}>
                <View className="flex-row items-center mb-3">
                  <FontAwesome5 name="history" size={14} color={renkler.metinIkincil} />
                  <Text className="text-sm ml-2 flex-1" style={{ color: renkler.metin }}>
                    Son eşitleme: {esitlemeZamaniniBicimle(e.durum.sonEsitleme)}
                  </Text>
                </View>
                {e.durum.sonHata ? (
                  <View className="flex-row items-start mb-3">
                    <FontAwesome5
                      name="exclamation-circle"
                      size={14}
                      color={e.durum.sonHata === 'agYok' ? renkler.metinIkincil : renkler.hata}
                      style={{ marginTop: 3 }}
                      solid
                    />
                    <Text className="text-sm leading-5 ml-2 flex-1" style={{ color: renkler.metin }}>
                      {esitlemeHataMetni(e.durum.sonHata)}
                    </Text>
                  </View>
                ) : null}
                {cozum ? (
                  <TouchableOpacity
                    className="flex-row items-center justify-center py-3 rounded-2xl mb-3"
                    style={{ backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir, minHeight: 44 }}
                    onPress={cozum.onPress}
                    disabled={e.mesgul}
                    accessibilityRole="button"
                    accessibilityLabel={cozum.etiket}
                  >
                    <FontAwesome5 name={cozum.ikon} size={13} color={renkler.metin} style={{ marginRight: 8 }} />
                    <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                      {cozum.etiket}
                    </Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  className="flex-row items-center justify-center py-3.5 rounded-2xl"
                  style={{ backgroundColor: renkler.birincil, opacity: e.mesgul ? 0.6 : 1, minHeight: 48 }}
                  onPress={simdiEsitle}
                  disabled={e.mesgul}
                  accessibilityRole="button"
                  accessibilityLabel="Şimdi eşitleyin"
                  accessibilityState={{ busy: e.mesgul, disabled: e.mesgul }}
                >
                  {e.mesgul ? (
                    <ActivityIndicator color={renkler.birincilMetin} />
                  ) : (
                    <>
                      <FontAwesome5 name="sync-alt" size={13} color={renkler.birincilMetin} style={{ marginRight: 8 }} />
                      <Text className="text-sm font-bold" style={{ color: renkler.birincilMetin }}>
                        Şimdi eşitleyin
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
                <Text className="text-xs leading-4 mt-3" style={{ color: renkler.metinIkincil }}>
                  Uygulama açıldığında ve arka planda aşağı yukarı 15 dakikada bir kendiliğinden eşitlenir. İnternet
                  yokken bekler, sonra yeniden dener.
                </Text>
              </View>
            )}

            <View className="flex-row items-start px-1">
              <FontAwesome5 name="lock" size={12} color={renkler.metinIkincil} style={{ marginTop: 3 }} />
              <Text className="text-xs leading-4 ml-2 flex-1" style={{ color: renkler.metinIkincil }}>
                Parolanız yalnız bu cihazın güvenli deposunda tutulur ve yedeğe girmez. Unutursanız buluttaki veri
                kurtarılamaz; cihazlarınızdaki kayıtlar yerinde kalır.
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      <EsitlemeAkisModali
        adim={adim}
        saglayicilar={e.saglayicilar}
        mesgul={e.mesgul}
        hata={akisHatasi}
        onRizaVer={rizaVer}
        onSaglayiciSec={saglayiciSec}
        onParola={parolaGir}
        onUnuttum={() => adimaGec({ tur: 'unuttum' })}
        onSifirlaOnay={() => adimaGec({ tur: 'parola', kip: 'sifirla' })}
        onKapatSec={kapatSec}
        onVazgec={() => {
          if (!e.mesgul) adimaGec(null);
        }}
      />

      <BildirimModali
        gorunur={bilgi !== null}
        tip={bilgi?.tip ?? 'bilgi'}
        baslik={bilgi?.baslik ?? ''}
        mesaj={bilgi?.mesaj ?? ''}
        onKapat={() => setBilgi(null)}
      />
    </SafeAreaView>
  );
};
