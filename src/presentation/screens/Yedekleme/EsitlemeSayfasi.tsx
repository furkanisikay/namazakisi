/**
 * Cihazlar arası eşitleme (issue #288) — Ayarlar > Yedekleme & Aktarım > Eşitleme.
 *
 * Varsayılan KAPALI; açmak açık rıza + parola ister. Yalnız bu build'de yapılandırılmış
 * sağlayıcılar gösterilir (hiçbiri yoksa Yedekleme sayfası bu ekrana giden kartı hiç
 * çizmez). Başlık navigasyon header'ındadır (AGENTS.md "sayfa başlığı TEK yerde").
 */

import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { YonluIkon } from '../../components/common/YonluIkon';
import { useFocusEffect } from '@react-navigation/native';
import { useRenkler } from '../../../core/theme';
import { Anahtar } from '../../components/common/Anahtar';
import { BildirimModali } from '../../components/common/BildirimModali';
import { kisaBildirimGoster } from '../../components/common/KisaBildirim';
import {
  EsitlemeAkisAdimi,
  EsitlemeAkisModali,
} from '../../components/esitleme/EsitlemeAkisModali';
import { esitlemeBeklemeMetni, esitlemeHataMetni, useEsitleme } from '../../hooks/useEsitleme';
import type { SaglayiciKimligi } from '../../../core/esitleme/esitlemeTipleri';
import { bicim, metin } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';
import { EsitlemeSikligi, gorunurBeklemeMi } from '../../../core/esitleme/esitlemePolitikasi';
import { hatirlatmaEtkisi } from '../../../core/sistem/sistemDurumu';
import { useSistemDurumu } from '../../hooks/useSistemDurumu';
import { useSistemKosullari } from '../../hooks/useSistemKosullari';
import { usePilRehberi } from '../../hooks/usePilRehberi';
import { PilRehberModal } from '../../components/pil/PilRehberi';

/** "13.10.2026 14:05" — Intl'e bağlı değil (Hermes). */
export function esitlemeZamaniniBicimle(iso: string | null): string {
  if (!iso) return metin().yedekleme.esitleme.henuzEsitlenmedi;
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return metin().yedekleme.esitleme.henuzEsitlenmedi;
  const iki = (n: number) => String(n).padStart(2, '0');
  // Gün ve ay adı etkin dilin sözlüğünden ("13 Ekim 2026" / "13 October 2026"); sayısal biçim dile göre okunmaz.
  const tarihSozlugu = metin().tarih;
  const gun = bicim(tarihSozlugu.uzun, { gun: t.getDate(), ay: tarihSozlugu.aylar[t.getMonth()], yil: t.getFullYear() });
  return `${gun} ${iki(t.getHours())}:${iki(t.getMinutes())}`;
}

/** Sıklık seçenekleri (ekran sırası); etiketler sözlükte (`yedekleme.esitleme.siklik`). */
const SIKLIKLAR: readonly EsitlemeSikligi[] = ['degisince', 'ceyrek', 'saatlik', 'gunluk', 'elle'];

/** Sıklık seçenekleri, etkin dilde. */
export function siklikSecenekleri(): readonly { deger: EsitlemeSikligi; etiket: string }[] {
  const m = metin().yedekleme.esitleme.siklik;
  return SIKLIKLAR.map((deger) => ({ deger, etiket: m[deger] }));
}

/** Seçili sıklığın tek cümlelik açıklaması. */
export function siklikAciklamasi(siklik: EsitlemeSikligi): string {
  const m = metin().yedekleme.esitleme.siklikAciklama;
  return siklik in m ? m[siklik] : m.elle;
}

/** Akışta kalıp kullanıcıya gösterilen (eşitlemeyi AÇMAYAN) hatalar. */
const AKISTA_KALAN_HATALAR = new Set(['parolaYanlis', 'bozukVeri', 'surumYeni', 'yapilandirilmamis']);

export const EsitlemeSayfasi: React.FC = () => {
  const renkler = useRenkler();
  const m = useMetin().yedekleme.esitleme;
  const e = useEsitleme();
  const { yenile } = e;
  const [adim, setAdim] = useState<EsitlemeAkisAdimi | null>(null);
  const [secili, setSecili] = useState<SaglayiciKimligi | null>(null);
  const [akisHatasi, setAkisHatasi] = useState<string | null>(null);
  const [nasilAcik, setNasilAcik] = useState(false);
  // "Hatırlatmalar …" cümlesi TEK kaynaktan (Ayarlar çipiyle aynı): pil muafiyeti + kısıt.
  const sistem = useSistemDurumu();
  const kosullar = useSistemKosullari();
  const pilRehberi = usePilRehberi(sistem);
  const etki = hatirlatmaEtkisi(kosullar, sistem.pil?.muaf ?? null);
  const [bilgi, setBilgi] = useState<{ tip: 'hata' | 'bilgi'; baslik: string; mesaj: string } | null>(null);

  useFocusEffect(
    useCallback(() => {
      yenile();
    }, [yenile])
  );

  // Sağlayıcı seçimi açıkken ÖNCEDEN ölç (dokunup başarısız olduktan SONRA değil):
  // iCloud'a giriş yapılmış mı, cihaz çevrimiçi mi. Okunamayan durumda sus.
  const [icloudEngeli, setIcloudEngeli] = useState<string | null>(null);
  const [cevrimdisi, setCevrimdisi] = useState<boolean | null>(null);
  const saglayiciAdimi = adim?.tur === 'saglayici';
  useEffect(() => {
    if (!saglayiciAdimi) return;
    let iptal = false;
    let abonelik: (() => void) | undefined;
    if (e.saglayicilar.some((s) => s.kimlik === 'icloud')) {
      const ic = require('../../../../modules/expo-icloud-esitleme/src') as typeof import('../../../../modules/expo-icloud-esitleme/src');
      if (ic.icloudModuluVarMi()) {
        void ic.icloudHesapVarMi().then((var_) => {
          // Yalnız KESİN "yok" engel yazar; bilinmiyor (`null`, köprü hatası) → sus.
          if (!iptal) setIcloudEngeli(var_ === false ? metin().yedekleme.esitleme.icloudGirisYok : null);
        });
      }
    }
    try {
      const NetInfo = (require('@react-native-community/netinfo') as typeof import('@react-native-community/netinfo')).default;
      abonelik = NetInfo.addEventListener((d) => {
        if (!iptal) setCevrimdisi(d.isConnected === false ? true : d.isConnected === true ? false : null);
      });
    } catch {
      // Ağ durumu okunamıyor → sus.
    }
    return () => {
      iptal = true;
      abonelik?.();
    };
  }, [saglayiciAdimi, e.saglayicilar]);

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
          ? m.icloudKapali
          : m.baglanilamadi
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
          ? m.parolaEslesmedi
          : esitlemeHataMetni(sonuc.kod)
      );
      return;
    }
    adimaGec(null);
    if (sonuc.tur === 'hata') {
      setBilgi({ tip: 'bilgi', baslik: m.acildiBaslik, mesaj: esitlemeHataMetni(sonuc.kod) });
    } else {
      kisaBildirimGoster(m.acildi);
    }
  };

  const kapatSec = async (uzaktakiniSil: boolean) => {
    const sonuc = await e.kapat(uzaktakiniSil);
    if (!sonuc.basarili) {
      setAkisHatasi(bicim(m.silinemedi, { neden: esitlemeHataMetni(sonuc.kod) }));
      return;
    }
    adimaGec(null);
    kisaBildirimGoster(uzaktakiniSil ? m.kapatildiSilindi : m.kapatildi);
  };

  const simdiEsitle = async () => {
    const sonuc = await e.esitle();
    if (sonuc.tur === 'hata') {
      setBilgi({ tip: 'hata', baslik: m.esitlenemedi, mesaj: esitlemeHataMetni(sonuc.kod) });
    } else if (sonuc.tur !== 'kapali') {
      kisaBildirimGoster(m.esitlendi);
    }
  };

  /** Son hataya göre tek dokunuşluk çözüm. */
  const hataCozumu = (): { etiket: string; ikon: string; onPress: () => void } | null => {
    const kod = e.durum.sonHata;
    const kimlik = e.durum.saglayici;
    if (!kod || !kimlik) return null;
    if (kod === 'yetkiYok') {
      return {
        etiket: m.yenidenBaglanin,
        ikon: 'plug',
        onPress: async () => {
          const b = await e.baglan(kimlik, true);
          if (b.tur === 'tamam') await simdiEsitle();
        },
      };
    }
    if (kod === 'parolaYanlis' || kod === 'parolaGerekli') {
      return {
        etiket: m.parolayiGirin,
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
  const bulutAdi = saglayiciAdi || (e.saglayicilar[0]?.ad ?? m.bulut);
  const cozum = hataCozumu();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: renkler.arkaplan }} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {e.saglayicilar.length === 0 ? (
          <View className="rounded-2xl p-5" style={{ backgroundColor: renkler.kartArkaplan }}>
            <Text className="text-sm leading-5" style={{ color: renkler.metinIkincil }}>
              {m.hizmetYok}
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
                    {m.baslik}
                  </Text>
                  <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                    {e.durum.aktif ? bicim(m.acik, { saglayici: saglayiciAdi }) : m.kapali}
                  </Text>
                </View>
                {e.yuklendi ? (
                  <Anahtar
                    value={e.durum.aktif}
                    disabled={e.mesgul}
                    onValueChange={(acik) => adimaGec(acik ? { tur: 'riza' } : { tur: 'kapat' })}
                    trackColor={{ false: renkler.sinir, true: renkler.birincil }}
                    accessibilityLabel={m.baslik}
                    accessibilityRole="switch"
                  />
                ) : (
                  <ActivityIndicator color={renkler.birincil} />
                )}
              </View>
              <View className="mt-4">
                {[
                  { ikon: 'cloud', metin: bicim(m.bulutAlani, { bulut: bulutAdi }) },
                  { ikon: 'lock', metin: m.sifreli },
                ].map((satir) => (
                  <View key={satir.ikon} className="flex-row items-center mb-1.5">
                    <FontAwesome5 name={satir.ikon} size={13} color={renkler.birincil} style={{ width: 22 }} solid />
                    <Text className="text-sm ml-1 flex-1" style={{ color: renkler.metin }}>
                      {satir.metin}
                    </Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                className="flex-row items-center mt-1"
                style={{ minHeight: 44 }}
                onPress={() => setNasilAcik((a) => !a)}
                accessibilityRole="button"
                accessibilityState={{ expanded: nasilAcik }}
                accessibilityLabel={m.nasil}
                testID="esitleme-nasil-calisir"
              >
                <FontAwesome5
                  name={nasilAcik ? 'chevron-up' : 'chevron-down'}
                  size={11}
                  color={renkler.birincil}
                  style={{ width: 22 }}
                />
                <Text className="text-sm font-semibold ml-1" style={{ color: renkler.birincil }}>
                  {m.nasil}
                </Text>
              </TouchableOpacity>
              {nasilAcik && (
                <Text className="text-sm leading-5 mt-1" style={{ color: renkler.metinIkincil }}>
                  {m.nasilMetin}
                </Text>
              )}
            </View>

            {e.durum.aktif && (
              <View className="rounded-2xl p-5 mb-4" style={{ backgroundColor: renkler.kartArkaplan, borderRadius: 24 }}>
                <View className="flex-row items-center mb-3">
                  <FontAwesome5 name="history" size={14} color={renkler.metinIkincil} />
                  <Text className="text-sm ml-2 flex-1" style={{ color: renkler.metin }}>
                    {bicim(m.sonEsitleme, { zaman: esitlemeZamaniniBicimle(e.durum.sonEsitleme) })}
                  </Text>
                </View>
                {gorunurBeklemeMi(e.durum.sonBekleme) && e.durum.sonBekleme ? (
                  <View className="flex-row items-start mb-3" testID="esitleme-bekleme">
                    <FontAwesome5
                      name="hourglass-half"
                      size={14}
                      color={renkler.metinIkincil}
                      style={{ marginTop: 3 }}
                      solid
                    />
                    <Text className="text-sm leading-5 ml-2 flex-1" style={{ color: renkler.metin }}>
                      {esitlemeBeklemeMetni(e.durum.sonBekleme)}
                    </Text>
                  </View>
                ) : null}
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
                  accessibilityLabel={m.simdiEsitleyin}
                  accessibilityState={{ busy: e.mesgul, disabled: e.mesgul }}
                >
                  {e.mesgul ? (
                    <ActivityIndicator color={renkler.birincilMetin} />
                  ) : (
                    <>
                      <FontAwesome5 name="sync-alt" size={13} color={renkler.birincilMetin} style={{ marginRight: 8 }} />
                      <Text className="text-sm font-bold" style={{ color: renkler.birincilMetin }}>
                        {m.simdiEsitleyin}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {e.durum.aktif && (
              <View className="rounded-2xl p-5 mb-4" style={{ backgroundColor: renkler.kartArkaplan, borderRadius: 24 }}>
                <View className="flex-row items-center mb-3">
                  <View
                    className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: renkler.birincil + '20' }}
                  >
                    <FontAwesome5 name="clock" size={15} color={renkler.birincil} solid />
                  </View>
                  <Text className="text-base font-bold flex-1" style={{ color: renkler.metin }}>
                    {m.otomatik}
                  </Text>
                </View>
                <View className="flex-row flex-wrap" accessibilityRole="radiogroup">
                  {siklikSecenekleri().map((sec) => {
                    const secili = e.tercihler.siklik === sec.deger;
                    return (
                      <TouchableOpacity
                        key={sec.deger}
                        className="px-3 rounded-full mr-2 mb-2 items-center justify-center"
                        style={{
                          minHeight: 44,
                          backgroundColor: secili ? renkler.birincil : renkler.arkaplan,
                          borderWidth: 1,
                          borderColor: secili ? renkler.birincil : renkler.sinir,
                        }}
                        onPress={() => e.tercihleriDegistir({ siklik: sec.deger })}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: secili, checked: secili }}
                        accessibilityLabel={bicim(m.siklikErisim, { siklik: sec.etiket })}
                        testID={`esitleme-siklik-${sec.deger}`}
                      >
                        <Text
                          className="text-sm font-semibold"
                          style={{ color: secili ? renkler.birincilMetin : renkler.metin }}
                        >
                          {sec.etiket}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Text className="text-xs leading-4 mt-1 mb-2" style={{ color: renkler.metinIkincil }}>
                  {siklikAciklamasi(e.tercihler.siklik)}
                </Text>
                {e.tercihler.siklik !== 'elle' && (
                  <>
                    {(
                      [
                        { anahtar: 'yalnizWifi', ikon: 'wifi', etiket: m.yalnizWifi },
                        { anahtar: 'yalnizSarjda', ikon: 'plug', etiket: m.yalnizSarjda },
                      ] as const
                    ).map((satir) => (
                      <View key={satir.anahtar} className="flex-row items-center py-2" style={{ minHeight: 48 }}>
                        <FontAwesome5 name={satir.ikon} size={14} color={renkler.metinIkincil} style={{ width: 22 }} solid />
                        <Text className="text-sm flex-1 ml-1" style={{ color: renkler.metin }}>
                          {satir.etiket}
                        </Text>
                        <Anahtar
                          value={e.tercihler[satir.anahtar]}
                          onValueChange={(acik) => e.tercihleriDegistir({ [satir.anahtar]: acik })}
                          trackColor={{ false: renkler.sinir, true: renkler.birincil }}
                          accessibilityLabel={satir.etiket}
                          accessibilityRole="switch"
                          testID={`esitleme-${satir.anahtar}`}
                        />
                      </View>
                    ))}
                    <View className="flex-row items-start mt-1">
                      <FontAwesome5 name="battery-quarter" size={12} color={renkler.metinIkincil} style={{ marginTop: 2 }} />
                      <Text className="text-xs leading-4 ml-2 flex-1" style={{ color: renkler.metinIkincil }}>
                        {m.gucTasarrufu}
                        {etki === 'etkilenmez' ? m.hatirlatmaEtkilenmez : ''}
                      </Text>
                    </View>
                    {etki === 'gecikebilir' && (
                      <TouchableOpacity
                        className="flex-row items-center mt-1"
                        style={{ minHeight: 44 }}
                        onPress={pilRehberi.rehberiAc}
                        accessibilityRole="button"
                        accessibilityLabel={m.pilUyarisi}
                        testID="esitleme-pil-uyarisi"
                      >
                        <FontAwesome5
                          name="exclamation-triangle"
                          size={12}
                          color={renkler.durum.dikkat}
                          style={{ width: 20 }}
                          solid
                        />
                        <Text className="text-xs font-semibold flex-1" style={{ color: renkler.metin }}>
                          {m.pilUyarisi}
                        </Text>
                        <YonluIkon name="chevron-right" size={11} color={renkler.metinIkincil} />
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            )}

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
        saglayiciEngelleri={icloudEngeli ? { icloud: icloudEngeli } : undefined}
        cevrimdisi={cevrimdisi}
        onParola={parolaGir}
        onUnuttum={() => adimaGec({ tur: 'unuttum' })}
        onSifirlaOnay={() => adimaGec({ tur: 'parola', kip: 'sifirla' })}
        onKapatSec={kapatSec}
        onVazgec={() => {
          if (!e.mesgul) adimaGec(null);
        }}
      />

      <PilRehberModal
        gorunur={pilRehberi.rehberGorunur}
        samsung={pilRehberi.samsung}
        onAc={pilRehberi.ayarlariAc}
        onKapat={pilRehberi.rehberiKapat}
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
