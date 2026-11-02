import type { Sozluk } from '../tr';

/**
 * Kurmancî (Hawar Latin; uygulama kodu `ku`, Soranî `ckb` ayrı dil). Vakit adları ku.wikipedia
 * "Nimêj" rekât tablosundan: Sibe · Nîvro · Esir · Êvar · Eşa (Esir/Piştî nîvro, Mexreb/Êvar,
 * Eşa/Şev çiftlerinden ana oturum kararı); güneş "Rojhilat", güneş doğuşu "Hilatina rojê"
 * (Latin kaynakta DOĞRULANMADI). Çizelge satırı (`imsakVakti`) fecir adıdır, "Imsak" değil
 * (ckb emsali: sabah adı). Cuma "Înî" (CLDR), cuma namazı "nimêja înê".
 * `buyuk` elle yazılır (`toUpperCase` YASAK; ç ê î û ş → Ç Ê Î Û Ş). Hawar alfabesinde noktasız ı
 * ve noktalı İ YOK (CLDR ku: i → I).
 * Hitap: yönetim "hûn" (küçük) + 2. çoğul emir ("Bajêr hilbijêrin"); ibadete çağrı "tu" + tekil
 * emir ("Rabe nimêjê", "Nimêja xwe bike"), Soranî emsali.
 * Terimler: namaz nimêj · kılmak nimêj kirin · Allah Xwedê · Kıldım "Min nimêj kir" · Kılındı
 * "Hat kirin" · kaza qeza · nafile nafile · kerahat dema mekrûh · kıble qible · cami mizgeft ·
 * abdest destnimêj · ezan ezan · seri zincîr · Namaz Muhafızı Parêzvanê Nimêjê · hesap yöntemi
 * rêbaza hesabkirinê · kuşluk Duha · evvâbîn Ewwabîn · teheccüd Teheccud · vitir witr · sahur
 * paşîv · iftar fitar · Ramazan Remezan · bayram cejn · Allah kabul etsin "Xwedê qebûl bike".
 * Kıldım/Kılındı/kabul/kaza/kerahat/sahur/iftar türetildi, yerli okuyucuyla DOĞRULANMADI.
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Sibe', gunes: 'Rojhilat', ogle: 'Nîvro', ikindi: 'Esir', aksam: 'Êvar', yatsi: 'Eşa' },
  buyuk: { imsak: 'SIBE', gunes: 'ROJHILAT', ogle: 'NÎVRO', ikindi: 'ESIR', aksam: 'ÊVAR', yatsi: 'EŞA' },
  kucuk: { imsak: 'sibe', gunes: 'rojhilat', ogle: 'nîvro', ikindi: 'esir', aksam: 'êvar', yatsi: 'eşa' },
  imsakVakti: 'Sibe',
  cuma: 'Înî',
  cumaKucuk: 'înî',
  gunesDogusu: 'Hilatina rojê',
  gunesDogusuKucuk: 'hilatina rojê',
  durum: { kilindi: 'Hat kirin', vaktiGeldi: 'Dem hat', girmedi: 'Hîn nehatiye', gecti: 'Nehat kirin' },
  durumKucuk: { kilindi: 'hat kirin', vaktiGeldi: 'dem hat', girmedi: 'hîn nehatiye', gecti: 'nehat kirin' },
  eylem: { kildim: 'Min nimêj kir', kilindi: 'Hat kirin' },
  kerahatVakti: 'Dema mekrûh',
  isaretle: 'Wekî kirî nîşan bikin',
  geriAlEtiketi: '{durum}, ji bo vegerandinê bitikînin',
  geriAlindi: 'Nîşan hate rakirin',
};
