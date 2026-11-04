import type { Sozluk } from '../tr';

/**
 * Kannada vakit adları (HadeethEnc kn ve IslamHouse kn kitapçığı; meal `kannada_hamza`):
 * ಫಜ್ರ್ · ಸೂರ್ಯೋದಯ · ಝುಹರ್ · ಅಸರ್ · ಮಗ್ರಿಬ್ · ಇಶಾ; cuma ಜುಮಾ (namazı "ಜುಮಾ ನಮಾಝ್").
 * Kannada yazısında büyük/küçük harf yoktur: `buyuk` ve `kucuk` `adlar` ile aynıdır; üst işaretler
 * büyük başlıkta kesilebilir (karede yakından bakın). Çizelge satırı (`imsakVakti`) fecir adıdır.
 * Yazım tek biçim: ನಮಾಝ್ (ಝ; ekli biçimler ನಮಾಝನ್ನು, ನಮಾಝಿನ, ನಮಾಝಿಗೆ, çoğul ನಮಾಝ್‌ಗಳು ZWNJ ile).
 * Terimler: Kıldım = "ನಮಾಝ್ ಮಾಡಿದೆ" (HadeethEnc 10945, 1. tekil cinsiyetsiz) · Kılındı =
 * "ನಿರ್ವಹಿಸಲಾಗಿದೆ" (türetildi) · kaza ಖಝಾ · nafile ಐಚ್ಛಿಕ ನಮಾಝ್ · kerahat ಮಕ್ರೂಹ್ ಸಮಯ ·
 * kıble ಕಿಬ್ಲಾ · cami ಮಸೀದಿ · ezan ಅಝಾನ್ · abdest ವುದೂ · kuşluk ದುಹಾ · teheccüd ತಹಜ್ಜುದ್ ·
 * vitir ವಿತ್ರ್ · seri ಸರಣಿ · Namaz Muhafızı ನಮಾಝ್ ರಕ್ಷಕ · hesap yöntemi ಲೆಕ್ಕಾಚಾರದ ವಿಧಾನ ·
 * Allah ಅಲ್ಲಾಹು (ilgi hâli ಅಲ್ಲಾಹನ) · Rab ಪರಿಪಾಲಕ · Kur'an ಕುರ್‌ಆನ್ · ayet ವಚನ · sure ಸೂರ ·
 * meal ಅರ್ಥಾನುವಾದ. Yönetim kipi "ನೀವು": düğme ve kısa etiket AOSP kn'nin saygılı ‑ಇ emri
 * ("ಆಯ್ಕೆಮಾಡಿ", "ರದ್ದುಮಾಡಿ"), cümle ve ibadete çağrı ‑ಇರಿ ("ನಮಾಝ್ ಸಂಸ್ಥಾಪಿಸಿರಿ", meal 2:43).
 * Ayarlar terimleri AOSP kn: ಸೆಟ್ಟಿಂಗ್‌ಗಳು, ಅಧಿಸೂಚನೆ, ಸ್ಥಳ, ಬ್ಯಾಟರಿ. Rakam Batı (CLDR `kn` `latn`).
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'ಫಜ್ರ್', gunes: 'ಸೂರ್ಯೋದಯ', ogle: 'ಝುಹರ್', ikindi: 'ಅಸರ್', aksam: 'ಮಗ್ರಿಬ್', yatsi: 'ಇಶಾ' },
  buyuk: { imsak: 'ಫಜ್ರ್', gunes: 'ಸೂರ್ಯೋದಯ', ogle: 'ಝುಹರ್', ikindi: 'ಅಸರ್', aksam: 'ಮಗ್ರಿಬ್', yatsi: 'ಇಶಾ' },
  kucuk: { imsak: 'ಫಜ್ರ್', gunes: 'ಸೂರ್ಯೋದಯ', ogle: 'ಝುಹರ್', ikindi: 'ಅಸರ್', aksam: 'ಮಗ್ರಿಬ್', yatsi: 'ಇಶಾ' },
  imsakVakti: 'ಫಜ್ರ್',
  cuma: 'ಜುಮಾ',
  cumaKucuk: 'ಜುಮಾ',
  gunesDogusu: 'ಸೂರ್ಯೋದಯ',
  gunesDogusuKucuk: 'ಸೂರ್ಯೋದಯ',
  durum: { kilindi: 'ನಿರ್ವಹಿಸಲಾಗಿದೆ', vaktiGeldi: 'ಸಮಯವಾಗಿದೆ', girmedi: 'ಇನ್ನೂ ಸಮಯವಾಗಿಲ್ಲ', gecti: 'ನಿರ್ವಹಿಸಲಾಗಿಲ್ಲ' },
  durumKucuk: { kilindi: 'ನಿರ್ವಹಿಸಲಾಗಿದೆ', vaktiGeldi: 'ಸಮಯವಾಗಿದೆ', girmedi: 'ಇನ್ನೂ ಸಮಯವಾಗಿಲ್ಲ', gecti: 'ನಿರ್ವಹಿಸಲಾಗಿಲ್ಲ' },
  eylem: { kildim: 'ನಮಾಝ್ ಮಾಡಿದೆ', kilindi: 'ನಿರ್ವಹಿಸಲಾಗಿದೆ' },
  kerahatVakti: 'ಮಕ್ರೂಹ್ ಸಮಯ',
  isaretle: 'ನಿರ್ವಹಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ',
  geriAlEtiketi: '{durum}, ರದ್ದುಗೊಳಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
  geriAlindi: 'ಗುರುತು ತೆಗೆದುಹಾಕಲಾಗಿದೆ',
};
