/**
 * Sağdan sola (Arapça, Urduca) çizimde Yoga'nın KENDİLİĞİNDEN aynalamadığı şeyler için tek kapı.
 *
 * Yoga `row`, `left/right`, `margin/padding` (NativeWind `ml-/pr-` dahil) ve `textAlign`
 * `left/right`'ı RN 0.86'da kendisi çevirir (start/end gibi davranır). Çevirmedikleri:
 * - ikon glifleri (ok/şerit yönü) → `yonluIkonStili` / `YonluIkon`,
 * - `transform: translateX` (fiziksel piksel) → `yatayIsaret()` ile çarp,
 * - SVG koordinatları (hiç aynalanmaz) → üstüne `left:` ile oturan katman varsa kapsayıcıya
 *   `SOLDAN_SAGA` (coğrafi/çizim sahnesi) ya da yalnız çizgi taşıyan SVG'ye `aynaStili()`.
 *
 * `I18nManager.isRTL` her çağrıda okunur (modül düzeyinde DEĞİL): yön yalnız açılışta değişir
 * ama testler `jest.replaceProperty(I18nManager, 'isRTL', true)` ile kurar.
 * `I18nManager`'a YAZMA yalnız `YonServisi`'nindir; burası yalnız okur.
 */
import { I18nManager, type TextStyle, type ViewStyle } from 'react-native';

/**
 * Anlamı okuma yönüne bağlı ikonlar (ileri/geri, liste "içeri gir" oku, sıra oku, giriş/çıkış
 * kapısı). Burada OLMAYANLAR bilinçlidir: `play` (medya), `undo`/`redo`/`redo-alt`/`sync-alt`
 * (dairesel dönüş oku — saat yönü gibi aynalanmaz), `caret-down`, `chevron-up/down`,
 * `location-arrow`, `compass`, `external-link-alt`, `share-alt`, `paper-plane`, `quote-left`,
 * `hand-pointer`, `level-up-alt`, `exchange-alt` (simetrik). Kıble kamerasındaki sağ/sol
 * okları FİZİKSEL dönüş yönüdür; orada bu kapı çağrılmaz.
 */
export const YONLU_IKONLAR: ReadonlySet<string> = new Set([
  'chevron-right',
  'chevron-left',
  'chevron-circle-right',
  'chevron-circle-left',
  'angle-right',
  'angle-left',
  'angle-double-right',
  'angle-double-left',
  'arrow-right',
  'arrow-left',
  'arrow-circle-right',
  'arrow-circle-left',
  'arrow-alt-circle-right',
  'arrow-alt-circle-left',
  'long-arrow-alt-right',
  'long-arrow-alt-left',
  'caret-right',
  'caret-left',
  'sign-in-alt',
  'sign-out-alt',
  // MaterialIcons
  'arrow-forward',
  'arrow-back',
  'arrow-forward-ios',
  'arrow-back-ios',
  'navigate-next',
  'navigate-before',
]);

/** Arayüz şu an sağdan sola mı çiziliyor? */
export const sagdanSolaCiziliyor = (): boolean => Boolean(I18nManager.isRTL);

/** Yatay `translateX` kaymalarının işareti: soldan sağa 1, sağdan sola -1. */
export const yatayIsaret = (): 1 | -1 => (sagdanSolaCiziliyor() ? -1 : 1);

export const yonluIkonMu = (ad: string | null | undefined): boolean => ad != null && YONLU_IKONLAR.has(ad);

const AYNA: ViewStyle & TextStyle = { transform: [{ scaleX: -1 }] };

/** Sağdan solada yatay ayna, değilse `undefined` (stil dizisine güvenle eklenir). */
export const aynaStili = (): typeof AYNA | undefined => (sagdanSolaCiziliyor() ? AYNA : undefined);

/** İkon yönlüyse ve arayüz sağdan solaysa aynalar; aksi hâlde `undefined`. */
export const yonluIkonStili = (ad: string | null | undefined): typeof AYNA | undefined =>
  yonluIkonMu(ad) ? aynaStili() : undefined;

/**
 * Coğrafi ya da çizim sahnesinin kapsayıcısı: içindeki `left:`/`row` aynalanmaz (doğu hep sağda,
 * SVG koordinatıyla örtüşür). Fabric'te Yoga `direction` her iki platformda uygulanır.
 */
export const SOLDAN_SAGA: ViewStyle = { direction: 'ltr' };

/**
 * Arapça ayet metni her arayüz dilinde SAĞA yaslanır. RN 0.86 `textAlign: 'right'`'ı sağdan sola
 * çizimde SOLA çevirir; orada hizayı bırakmak (doğal hiza) metni sağda tutar.
 */
const SAGA_YASLI: TextStyle = { textAlign: 'right' };
const DOGAL_HIZA: TextStyle = {};
export const sagaYasliMetin = (): TextStyle => (sagdanSolaCiziliyor() ? DOGAL_HIZA : SAGA_YASLI);
