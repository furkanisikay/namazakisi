/**
 * Now Bar seçimi değişince planların yeniden kurulması (issue #282 ikinci aşama).
 *
 * Seçim yalnız planlayıcıyı değil SAYAÇLARI da ilgilendirir: bir öğe açılınca
 * sayaç kendi bildirimini bırakıp planlayıcıya devreder, kapanınca geri alır.
 * Bu yüzden sayaç listesi ikinci kez yazılmaz — konuma bağlı tüketicilerin TEK
 * yayma noktası (`konumDegistiUygula`) mevcut koordinatla koşturulur
 * (`OzelGunDegisikligiServisi` deseni; AGENTS.md "ikiz liste" dersi). Sayaçlar
 * pencerelerini bildirirken planlayıcı kendiliğinden yeniden planlar.
 *
 * Ekranda art arda dokunuşlar tek turda birleşsin diye çağıran debounce eder.
 * STORE'SUZ, asla fırlatmaz.
 *
 * iOS'ta (#295) aynı seçim canlı etkinliği (Live Activity) belirler.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { koordinatGecerliMi } from '../../core/nafile/gunVakitleri';
import { Logger } from '../../core/utils/Logger';
import { konumDegistiUygula } from './KonumDegisikligiServisi';
import { CanliSayacPlanlayici } from './CanliSayacPlanlayici';

export async function nowBarDegistiUygula(): Promise<void> {
  try {
    const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI);
    const k = ham ? (JSON.parse(ham) as { koordinatlar?: { lat: number; lng: number } } | null)?.koordinatlar : null;
    if (koordinatGecerliMi(k)) {
      await konumDegistiUygula(k);
      // iOS (#295): sayaç bildirimi yok → planlayıcıya bildiren de yok; canlı etkinlik
      // seçimi değişince doğrudan eşitlenir.
      if (Platform.OS === 'ios') await CanliSayacPlanlayici.getInstance().yenidenPlanla();
      return;
    }
    // Konum yok: sayaçlar zaten planlanmamıştır; yalnız planlayıcı (saat payı) tazelenir.
    await CanliSayacPlanlayici.getInstance().yenidenPlanla();
  } catch (e) {
    Logger.warn('NowBar', 'Planlar yeniden kurulamadi', e);
  }
}
