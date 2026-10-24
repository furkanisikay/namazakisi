/**
 * Cihazlar arası eşitleme (issue #288) — kurulum / parola / kapatma akışı modalı.
 *
 * Adımlar: `riza` (açık rıza: ne gider, kim görür, parola kurtarılamaz) → `saglayici`
 * (yalnız yapılandırılmış olanlar) → `parola` (uzakta kayıt yoksa İKİ kez, varsa bir
 * kez) → isteğe bağlı `unuttum` (uzaktakini silip yeniden kurma onayı). `kapat` ayrı
 * giriş noktasıdır (yalnız bu cihaz / buluttakini de sil).
 *
 * Görsel dil `BildirimModali` ile aynı (fade + kardeş backdrop + donanım geri tuşu).
 * Akış durumu (hangi adım, hangi sağlayıcı) ekranda tutulur; modal yalnız çizer.
 */

import * as React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useDonanimGeriTusu } from '../../hooks/useDonanimGeriTusu';
import { PAROLA_EN_AZ_UZUNLUK, parolaSorunu } from '../../../core/esitleme/anahtarTuretme';
import type { SaglayiciKimligi } from '../../../core/esitleme/esitlemeTipleri';
import { bicim } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';

export type EsitlemeAkisAdimi =
  | { tur: 'riza' }
  | { tur: 'saglayici' }
  /** `yeni`: uzakta kayıt yok (iki kez sorulur); `katil`: var (bir kez). */
  | { tur: 'parola'; kip: 'yeni' | 'katil' | 'sifirla' }
  | { tur: 'unuttum' }
  | { tur: 'kapat' };

export interface EsitlemeAkisModaliProps {
  adim: EsitlemeAkisAdimi | null;
  saglayicilar: { kimlik: SaglayiciKimligi; ad: string }[];
  mesgul: boolean;
  /** Adımın altında gösterilen hata (ör. "Parola eşleşmedi"). */
  hata: string | null;
  onRizaVer: () => void;
  onSaglayiciSec: (kimlik: SaglayiciKimligi) => void;
  /**
   * Seçmeden ÖNCE bilinen engeller (ör. iCloud'a giriş yapılmamış): düğme pasif olur,
   * sebep altında yazılır. Bilinmeyen durumda boş bırakın (sus).
   */
  saglayiciEngelleri?: Partial<Record<SaglayiciKimligi, string>>;
  /** Cihaz çevrimdışı: bağlanma düğmeleri pasif, sebep söylenir. `null`/undefined = bilinmiyor. */
  cevrimdisi?: boolean | null;
  onParola: (parola: string) => void;
  onUnuttum: () => void;
  onSifirlaOnay: () => void;
  onKapatSec: (uzaktakiniSil: boolean) => void;
  onVazgec: () => void;
}

const Dugme: React.FC<{
  etiket: string;
  ikon?: string;
  birincil?: boolean;
  tehlikeli?: boolean;
  pasif?: boolean;
  onPress: () => void;
}> = ({ etiket, ikon, birincil, tehlikeli, pasif, onPress }) => {
  const renkler = useRenkler();
  const dolu = birincil || tehlikeli;
  return (
    <TouchableOpacity
      className="flex-row items-center justify-center py-3.5 rounded-2xl mt-3"
      style={{
        backgroundColor: tehlikeli ? renkler.hata : birincil ? renkler.birincil : renkler.arkaplan,
        borderWidth: dolu ? 0 : 1,
        borderColor: renkler.sinir,
        opacity: pasif ? 0.5 : 1,
        minHeight: 48,
      }}
      onPress={onPress}
      disabled={pasif}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={etiket}
      accessibilityState={{ disabled: !!pasif }}
    >
      {ikon ? (
        <FontAwesome5
          name={ikon}
          size={13}
          color={dolu ? renkler.birincilMetin : renkler.metinIkincil}
          style={{ marginRight: 8 }}
          solid
        />
      ) : null}
      <Text className="text-sm font-bold" style={{ color: dolu ? renkler.birincilMetin : renkler.metinIkincil }}>
        {etiket}
      </Text>
    </TouchableOpacity>
  );
};

const Madde: React.FC<{ ikon: string; metin: string }> = ({ ikon, metin }) => {
  const renkler = useRenkler();
  return (
    <View className="flex-row items-start mb-2.5">
      <View className="w-6 items-center pt-0.5">
        <FontAwesome5 name={ikon} size={13} color={renkler.birincil} solid />
      </View>
      <Text className="flex-1 text-sm leading-5" style={{ color: renkler.metin }}>
        {metin}
      </Text>
    </View>
  );
};

const ParolaAlani: React.FC<{
  etiket: string;
  deger: string;
  onChange: (m: string) => void;
  yeni: boolean;
}> = ({ etiket, deger, onChange, yeni }) => {
  const renkler = useRenkler();
  return (
    <View className="mb-3">
      <Text className="text-xs font-semibold mb-1.5" style={{ color: renkler.metinIkincil }}>
        {etiket}
      </Text>
      <TextInput
        value={deger}
        onChangeText={onChange}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        textContentType={yeni ? 'newPassword' : 'password'}
        autoComplete={yeni ? 'new-password' : 'current-password'}
        accessibilityLabel={etiket}
        placeholderTextColor={renkler.metinIkincil}
        style={{
          borderWidth: 1,
          borderColor: renkler.sinir,
          borderRadius: 14,
          paddingHorizontal: 14,
          paddingVertical: 12,
          color: renkler.metin,
          backgroundColor: renkler.arkaplan,
          fontSize: 15,
        }}
      />
    </View>
  );
};

export const EsitlemeAkisModali: React.FC<EsitlemeAkisModaliProps> = ({
  adim,
  saglayicilar,
  mesgul,
  hata,
  onRizaVer,
  onSaglayiciSec,
  saglayiciEngelleri,
  cevrimdisi,
  onParola,
  onUnuttum,
  onSifirlaOnay,
  onKapatSec,
  onVazgec,
}) => {
  const renkler = useRenkler();
  const m = useMetin().yedekleme.akis;
  const gorunur = adim !== null;
  const [parola, setParola] = React.useState('');
  const [tekrar, setTekrar] = React.useState('');
  const [yerelHata, setYerelHata] = React.useState<string | null>(null);

  // Adım değişince alanlar temizlenir (parola bellekte gereğinden uzun kalmasın).
  const adimTuru = adim?.tur ?? null;
  const parolaKipi = adim?.tur === 'parola' ? adim.kip : null;
  React.useEffect(() => {
    setParola('');
    setTekrar('');
    setYerelHata(null);
  }, [adimTuru, parolaKipi]);

  useDonanimGeriTusu(gorunur, onVazgec);

  const parolaGonder = () => {
    if (!adim || adim.tur !== 'parola') return;
    if (adim.kip !== 'katil') {
      const sorun = parolaSorunu(parola);
      if (sorun) return setYerelHata(sorun);
      if (parola !== tekrar) return setYerelHata(m.parolalarFarkli);
    } else if (!parola) {
      return setYerelHata(m.parolaGirin);
    }
    setYerelHata(null);
    onParola(parola);
  };

  const baslikVeIkon = (): { baslik: string; ikon: string } => {
    switch (adim?.tur) {
      case 'riza':
        return { baslik: m.rizaBaslik, ikon: 'sync-alt' };
      case 'saglayici':
        return { baslik: m.saglayiciBaslik, ikon: 'cloud' };
      case 'parola':
        return adim.kip === 'katil'
          ? { baslik: m.parolaKatilBaslik, ikon: 'key' }
          : { baslik: m.parolaYeniBaslik, ikon: 'key' };
      case 'unuttum':
        return { baslik: m.unuttumBaslik, ikon: 'exclamation-triangle' };
      case 'kapat':
        return { baslik: m.kapatBaslik, ikon: 'power-off' };
      default:
        return { baslik: '', ikon: 'sync-alt' };
    }
  };
  const { baslik, ikon } = baslikVeIkon();
  const gosterilenHata = yerelHata ?? hata;
  const tehlikeAdimi = adim?.tur === 'unuttum';

  return (
    <Modal visible={gorunur} animationType="fade" transparent statusBarTranslucent onRequestClose={onVazgec}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <TouchableWithoutFeedback onPress={mesgul ? undefined : onVazgec}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
        </TouchableWithoutFeedback>

        <View
          style={{
            width: '90%',
            maxWidth: 440,
            backgroundColor: renkler.kartArkaplan,
            borderRadius: 24,
            padding: 22,
            borderWidth: 1,
            borderColor: renkler.sinir,
          }}
        >
          <View className="flex-row items-center mb-4">
            <View
              className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
              style={{ backgroundColor: (tehlikeAdimi ? renkler.hata : renkler.birincil) + '20' }}
            >
              <FontAwesome5 name={ikon} size={18} color={tehlikeAdimi ? renkler.hata : renkler.birincil} solid />
            </View>
            <Text className="flex-1 text-base font-bold" style={{ color: renkler.metin }} accessibilityRole="header">
              {baslik}
            </Text>
          </View>

          {adim?.tur === 'riza' && (
            <View>
              <Madde ikon="user-shield" metin={m.riza1} />
              <Madde ikon="lock" metin={m.riza2} />
              <Madde ikon="exchange-alt" metin={m.riza3} />
              <Madde ikon="code-branch" metin={m.riza4} />
              <Madde ikon="key" metin={m.riza5} />
              <Dugme etiket={m.anladim} ikon="check" birincil onPress={onRizaVer} />
              <Dugme etiket={m.vazgecin} onPress={onVazgec} />
            </View>
          )}

          {adim?.tur === 'saglayici' && (
            <View>
              <Text className="text-sm leading-5 mb-1" style={{ color: renkler.metinIkincil }}>
                {m.saglayiciAciklama}
              </Text>
              {cevrimdisi === true ? (
                <Text className="text-sm leading-5 mt-3" style={{ color: renkler.metin }} accessibilityLiveRegion="polite">
                  {m.cevrimdisi}
                </Text>
              ) : null}
              {saglayicilar.map((s) => {
                const engel = saglayiciEngelleri?.[s.kimlik];
                const kapali = mesgul || cevrimdisi === true || !!engel;
                return (
                  <View key={s.kimlik}>
                    <Dugme
                      etiket={s.ad}
                      ikon={s.kimlik === 'googleDrive' ? 'cloud-upload-alt' : 'cloud'}
                      birincil
                      pasif={kapali}
                      onPress={() => {
                        if (!kapali) onSaglayiciSec(s.kimlik);
                      }}
                    />
                    {engel ? (
                      <Text className="text-sm leading-5 mt-2" style={{ color: renkler.metin }}>
                        {engel}
                      </Text>
                    ) : null}
                  </View>
                );
              })}
              {mesgul ? (
                <View className="items-center py-2 mt-2">
                  <ActivityIndicator color={renkler.birincil} />
                </View>
              ) : null}
              {gosterilenHata ? (
                <Text className="text-sm leading-5 mt-3" style={{ color: renkler.hata }} accessibilityLiveRegion="polite">
                  {gosterilenHata}
                </Text>
              ) : null}
              <Dugme etiket={m.vazgecin} pasif={mesgul} onPress={onVazgec} />
            </View>
          )}

          {adim?.tur === 'parola' && (
            <View>
              <Text className="text-sm leading-5 mb-4" style={{ color: renkler.metinIkincil }}>
                {adim.kip === 'katil'
                  ? m.katilAciklama
                  : bicim(m.yeniAciklama, { n: PAROLA_EN_AZ_UZUNLUK })}
              </Text>
              <ParolaAlani etiket={m.parola} deger={parola} onChange={setParola} yeni={adim.kip !== 'katil'} />
              {adim.kip !== 'katil' && (
                <ParolaAlani etiket={m.parolaTekrar} deger={tekrar} onChange={setTekrar} yeni />
              )}
              {gosterilenHata ? (
                <Text className="text-sm leading-5 mb-1" style={{ color: renkler.hata }} accessibilityLiveRegion="polite">
                  {gosterilenHata}
                </Text>
              ) : null}
              {mesgul ? (
                <View className="flex-row items-center justify-center py-3.5 mt-3">
                  <ActivityIndicator color={renkler.birincil} />
                  <Text className="text-sm ml-3" style={{ color: renkler.metinIkincil }}>
                    {m.anahtarHazirlaniyor}
                  </Text>
                </View>
              ) : (
                <Dugme
                  etiket={adim.kip === 'katil' ? m.baslatin : m.kaydedin}
                  ikon="lock"
                  birincil
                  onPress={parolaGonder}
                />
              )}
              {adim.kip === 'katil' && !mesgul ? (
                <Dugme etiket={m.unuttum} onPress={onUnuttum} />
              ) : null}
              <Dugme etiket={m.vazgecin} pasif={mesgul} onPress={onVazgec} />
            </View>
          )}

          {adim?.tur === 'unuttum' && (
            <View>
              <Text className="text-sm leading-5" style={{ color: renkler.metin }}>
                {m.unuttumAciklama}
              </Text>
              <Dugme etiket={m.silVeBasla} ikon="trash-alt" tehlikeli pasif={mesgul} onPress={onSifirlaOnay} />
              <Dugme etiket={m.vazgecin} pasif={mesgul} onPress={onVazgec} />
            </View>
          )}

          {adim?.tur === 'kapat' && (
            <View>
              <Text className="text-sm leading-5" style={{ color: renkler.metin }}>
                {m.kapatAciklama}
              </Text>
              {gosterilenHata ? (
                <Text className="text-sm leading-5 mt-2" style={{ color: renkler.hata }} accessibilityLiveRegion="polite">
                  {gosterilenHata}
                </Text>
              ) : null}
              <Dugme etiket={m.yalnizBuCihaz} ikon="power-off" birincil pasif={mesgul} onPress={() => onKapatSec(false)} />
              <Dugme etiket={m.buluttakiniSil} ikon="trash-alt" tehlikeli pasif={mesgul} onPress={() => onKapatSec(true)} />
              <Dugme etiket={m.vazgecin} pasif={mesgul} onPress={onVazgec} />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};
