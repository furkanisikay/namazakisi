/**
 * JS giriş noktalarının TEK kapısı: vakit ya da metin üretmeden önce hesap ayarı ve arayüz
 * dili diskten yüklenmiş olmalı. Headless/arka plan bağlamında App.tsx hiç çalışmaz;
 * beklenmezse yurt dışındaki kullanıcıya Diyanet saati, İngilizce kullanıcıya Türkçe
 * bildirim gider. ASLA reddetmez.
 */
import { HesapAyariServisi } from './HesapAyariServisi';
import { DilServisi } from './DilServisi';

export async function baglamHazir(): Promise<void> {
  await Promise.all([HesapAyariServisi.hazir(), DilServisi.hazir()]);
}
