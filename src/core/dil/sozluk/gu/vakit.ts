import type { Sozluk } from '../tr';

/**
 * Gucaratça vakit adları (HadeethEnc gu çoğunluk yazımı; meal `gujarati_omari`): ફજર · સૂર્યોદય ·
 * ઝોહર · અસર · મગરિબ · ઈશા; cuma જુમ્મા (namazı "જુમ્માની નમાઝ"). Gucaratçada büyük/küçük harf
 * yoktur: `buyuk` ve `kucuk` `adlar` ile aynıdır; Gucarati üst işaretleri büyük başlıkta kesilebilir
 * (karede yakından bakın). Çizelge satırı (`imsakVakti`) fecir adıdır, "Imsak" değil.
 * Yazım tek biçim: નમાઝ (નમાજ değil), ઝોહર, અસર, ઈશા, જુમ્મા, વઝૂ, વિત્ર.
 * Terimler: Kıldım = "નમાઝ પઢી લીધી" (fiil dişil nesneye uyar, konuşandan bağımsız) · Kılındı =
 * "પઢી લીધી" · kaza કઝા (કઝા નમાઝ) · nafile નફિલ · kerahat મકરૂહ સમય · kıble કિબ્લા ·
 * cami મસ્જિદ · ezan અઝાન · abdest વઝૂ · kuşluk ચાશ્ત · teheccüd તહજ્જુદ · vitir વિત્ર ·
 * seri સિલસિલો · Namaz Muhafızı નમાઝ મુહાફિઝ · hesap yöntemi ગણતરીની પદ્ધતિ · Allah અલ્લાહ ·
 * Kur'an કુરઆન · ayet આયત · sure સૂરત · meal અનુવાદ.
 * Yönetim kipi "તમે" + saygılı -ો emri ("પસંદ કરો", "ફરી પ્રયાસ કરો"); "આપ" yalnız Peygamber
 * bağlamındadır, arayüzde yok. İbadete çağrı aynı biçimin kısa emri ("નમાઝ પઢો", "નમાઝ કાયમ કરો",
 * "નમાઝ માટે ઊભા થાઓ"). Ayarlar terimleri AOSP gu: સેટિંગ, નોટિફિકેશન, લોકેશન, બૅટરી.
 * Cümle sonu nokta "."; rakam Batı (0-9).
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'ફજર', gunes: 'સૂર્યોદય', ogle: 'ઝોહર', ikindi: 'અસર', aksam: 'મગરિબ', yatsi: 'ઈશા' },
  buyuk: { imsak: 'ફજર', gunes: 'સૂર્યોદય', ogle: 'ઝોહર', ikindi: 'અસર', aksam: 'મગરિબ', yatsi: 'ઈશા' },
  kucuk: { imsak: 'ફજર', gunes: 'સૂર્યોદય', ogle: 'ઝોહર', ikindi: 'અસર', aksam: 'મગરિબ', yatsi: 'ઈશા' },
  imsakVakti: 'ફજર',
  cuma: 'જુમ્મા',
  cumaKucuk: 'જુમ્મા',
  gunesDogusu: 'સૂર્યોદય',
  gunesDogusuKucuk: 'સૂર્યોદય',
  durum: { kilindi: 'પઢી લીધી', vaktiGeldi: 'સમય થઈ ગયો', girmedi: 'હજુ સમય નથી', gecti: 'નથી પઢી' },
  durumKucuk: { kilindi: 'પઢી લીધી', vaktiGeldi: 'સમય થઈ ગયો', girmedi: 'હજુ સમય નથી', gecti: 'નથી પઢી' },
  eylem: { kildim: 'નમાઝ પઢી લીધી', kilindi: 'પઢી લીધી' },
  kerahatVakti: 'મકરૂહ સમય',
  isaretle: 'પઢી લીધી તરીકે નોંધો',
  geriAlEtiketi: '{durum}, પાછું લેવા ટૅપ કરો',
  geriAlindi: 'નિશાન હટાવ્યું',
};
