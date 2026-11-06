import type { Sozluk } from '../tr';

/**
 * Telugu vakit adları (QuranEnc `telugu_muhammad` + HadeethEnc te yazımı, QE'nin ASCII
 * kesmeleri atılarak): ఫజ్ర్ · సూర్యోదయం · జుహ్ర్ · అస్ర్ · మగ్రిబ్ · ఇషా; cuma జుమా (QE 48).
 * Telugu yazısında büyük/küçük harf yok: `buyuk` ve `kucuk` `adlar` ile aynıdır; üst işaretler
 * büyük başlıkta kesilebilir (karede yakından bakın). Çizelge satırı (`imsakVakti`) fecir adıdır,
 * "Imsak" değil. Terimler: namaz నమాజ్ (tek biçim; ekler ZWNJ ile bitişir: నమాజ్‌ను, AOSP te
 * kalıbı) · Kıldım = "నమాజ్ ఆచరించాను" (HadeethEnc 10945 "నమాజు ఆచరించాను", tek biçime
 * uyarlandı) · Kılındı = "ఆచరించబడింది" (türetildi, DOĞRULANMADI) · kaza ఖజా · nafile నఫిల్ ·
 * kerahat "మక్రూహ్ సమయం" (türetildi) · kıble ఖిబ్లా · cami మస్జిద్ · ezan అజాన్ · abdest వుజూ ·
 * Namaz Muhafızı "నమాజ్ సంరక్షకుడు" · seri వరుస · hesap yöntemi "లెక్కింపు పద్ధతి". Yönetim kipi
 * మీరు + ‑ండి emri (Microsoft te, AOSP te); ibadete çağrı aynı kipin kısa emri ("నమాజ్‌ను
 * స్థాపించండి", meal 2:43); నువ్వు/నీవు YOK. Rakam Batı (CLDR `te` `latn`).
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'ఫజ్ర్', gunes: 'సూర్యోదయం', ogle: 'జుహ్ర్', ikindi: 'అస్ర్', aksam: 'మగ్రిబ్', yatsi: 'ఇషా' },
  buyuk: { imsak: 'ఫజ్ర్', gunes: 'సూర్యోదయం', ogle: 'జుహ్ర్', ikindi: 'అస్ర్', aksam: 'మగ్రిబ్', yatsi: 'ఇషా' },
  kucuk: { imsak: 'ఫజ్ర్', gunes: 'సూర్యోదయం', ogle: 'జుహ్ర్', ikindi: 'అస్ర్', aksam: 'మగ్రిబ్', yatsi: 'ఇషా' },
  imsakVakti: 'ఫజ్ర్',
  cuma: 'జుమా',
  cumaKucuk: 'జుమా',
  gunesDogusu: 'సూర్యోదయం',
  gunesDogusuKucuk: 'సూర్యోదయం',
  durum: { kilindi: 'ఆచరించబడింది', vaktiGeldi: 'సమయం అయింది', girmedi: 'ఇంకా సమయం కాలేదు', gecti: 'ఆచరించలేదు' },
  durumKucuk: { kilindi: 'ఆచరించబడింది', vaktiGeldi: 'సమయం అయింది', girmedi: 'ఇంకా సమయం కాలేదు', gecti: 'ఆచరించలేదు' },
  eylem: { kildim: 'నమాజ్ ఆచరించాను', kilindi: 'ఆచరించబడింది' },
  kerahatVakti: 'మక్రూహ్ సమయం',
  isaretle: 'ఆచరించినట్లు గుర్తించండి',
  geriAlEtiketi: '{durum}, రద్దు చేయడానికి నొక్కండి',
  geriAlindi: 'గుర్తు తీసివేయబడింది',
};
