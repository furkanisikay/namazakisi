// Khmer yazısında büyük/küçük harf yok (`buyuk` = `kucuk` = `adlar`); sözcük arası boşluk yok (Tayca gibi). Sayı ile birim boşluklu (CLDR "5 នាទី"). Rakam Batı (CLDR `km` `latn`).
import type { Sozluk } from '../tr';

/**
 * Khmerce terim kararları (kaynak: `scratchpad/w4/dalga12-terimler.md` > Khmer; QuranEnc `khmer_rwwad`,
 * `khmer_cambodia`; HadeethEnc km). Yazım birliği HadeethEnc km yazımıdır (en tutarlı, en çok geçen):
 * - Namaz សឡាត (iki meal, HE); basının ថ្វាយបង្គំ'ü ("tapınma") KULLANILMAZ. Kılmak: សឡាត fiil olarak,
 *   resmî dilde ប្រតិបត្តិសឡាត (meal 2:43, 17:78).
 * - Vakitler (Cham/Malay kökenli topluluk normu): ស៊ូពុស · ថ្ងៃរះ · ហ្ស៊ូហូរ · អាសើរ · ម៉ាហ្គ្រិប · អ៊ីស្ហា.
 *   Çizelge satırı (`imsakVakti`) da fecir adı ស៊ូពុស. Yatsı អ៊ីស្ហា'dır; çıplak "អ៊ីសា" Hz. Îsâ'nın adıdır.
 * - Cuma ជុមអាត់ (HE "សឡាតជុមអាត់"), kıble គិបឡាត់, cami ម៉ាស្ជិត, ezan អាហ្សាន, abdest វូហ្ទុ,
 *   Allah អល់ឡោះ, Kur'an គម្ពីរគួរអាន, ayet អាយ៉ាត់, sure ស៊ូរ៉ោះ, rekât រ៉ក្អាត់, imam អ៊ីម៉ាំ, dua ទូអា,
 *   zikir ហ្ស៊ីកៀរ, sünnet ស៊ុណ្ណះ, Ramazan រ៉ម៉ាហ្ទន, oruç បួស, iftar ស្រាយបួស, sahur សាហួរ,
 *   Kadir gecesi ឡៃឡាទុលក៏ទើរ (HE).
 * - Nafile សឡាតបន្ថែម (meal 17:79), teheccüd សឡាតតះជុត, vitir វីតៀរ, kasr "បង្រួមសឡាត" (meal 4:101).
 * - Kaza "សឡាតសងវិញ" (HE 65088 "…សងវិញ" kalıbından TÜRETİLDİ); Kaza Defteri "បញ្ជីសឡាតសងវិញ".
 * - "Kıldım" បានសឡាតហើយ, "Kılındı" បានសឡាត, "Allah kabul etsin" សូមអល់ឡោះទទួលយក — türetildi.
 * - Kerahat vakti "ពេលហាមសឡាត" (HE 10604 betimlemesinden; DOĞRULANMADI).
 * - Seri និរន្តរភាព, Namaz Muhafızı អ្នកការពារសឡាត, hesap yöntemi វិធីគណនា.
 * Hitap (Microsoft km): zamirsiz; zamir gerekirse អ្នក, លោកអ្នក YOK, kullanıcı ağzından ខ្ញុំ.
 * İbadete çağrı aynı biçimde kısa emir ("ក្រោកសឡាត", meal 17:79 kalıbı; "ដល់ពេលសឡាតហើយ"); mealin ចូរ'u
 * taşınmaz. Tümce sonu "។", düğme/etiket noktasız; iki nokta "៖". ZWSP (U+200B) kullanılmaz (QE/HE gibi).
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'ស៊ូពុស', gunes: 'ថ្ងៃរះ', ogle: 'ហ្ស៊ូហូរ', ikindi: 'អាសើរ', aksam: 'ម៉ាហ្គ្រិប', yatsi: 'អ៊ីស្ហា' },
  buyuk: { imsak: 'ស៊ូពុស', gunes: 'ថ្ងៃរះ', ogle: 'ហ្ស៊ូហូរ', ikindi: 'អាសើរ', aksam: 'ម៉ាហ្គ្រិប', yatsi: 'អ៊ីស្ហា' },
  kucuk: { imsak: 'ស៊ូពុស', gunes: 'ថ្ងៃរះ', ogle: 'ហ្ស៊ូហូរ', ikindi: 'អាសើរ', aksam: 'ម៉ាហ្គ្រិប', yatsi: 'អ៊ីស្ហា' },
  imsakVakti: 'ស៊ូពុស',
  cuma: 'ជុមអាត់',
  cumaKucuk: 'ជុមអាត់',
  gunesDogusu: 'ថ្ងៃរះ',
  gunesDogusuKucuk: 'ថ្ងៃរះ',
  durum: { kilindi: 'បានសឡាត', vaktiGeldi: 'ដល់ពេលសឡាត', girmedi: 'មិនទាន់ដល់ពេល', gecti: 'មិនបានសឡាត' },
  durumKucuk: { kilindi: 'បានសឡាត', vaktiGeldi: 'ដល់ពេលសឡាត', girmedi: 'មិនទាន់ដល់ពេល', gecti: 'មិនបានសឡាត' },
  eylem: { kildim: 'បានសឡាតហើយ', kilindi: 'បានសឡាត' },
  kerahatVakti: 'ពេលហាមសឡាត',
  isaretle: 'សម្គាល់ថាបានសឡាត',
  geriAlEtiketi: '{durum} ប៉ះដើម្បីមិនធ្វើវិញ',
  geriAlindi: 'បានដកការសម្គាល់',
};
