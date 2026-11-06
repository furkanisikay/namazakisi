import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı: mealin çoğul emri ("Edsambayang kanu", QE 2:45; "tindeg kanu"), kısa,
 * "!" yok. Secde karşılığı YAZILMAZ → "tindeg kanu sa sambayang" (namaza durun). Geciktirme
 * "isundul" (QE 7:34 "di makasundul" = geciktiremez). Başlıkta süre birimi "m": "Maghrib · 655m"
 * ilk 16 karaktere sığar; girişten sonra "den" (artık), çıkışa kalan "pan" (daha).
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · {dk}m den · waktu nu sambayang ⏰',
    giris2: '{ad} · {dk}m den · di nu isundul su sambayang ⚠️',
    giris3: '{ad} · {dk}m den · pedtagad su sambayang nu 🔥',
    giris4: '{ad} · {dk}m den · TINDEG KANU SA SAMBAYANG 🚨',
    erken3: '{ad} · {dk}m pan · pedtagad su sambayang nu 🔥',
    erken4: '{ad} · {dk}m pan · TINDEG KANU SA SAMBAYANG 🚨',
    cikis1: '{ad} · {dk}m pan ⏰',
    cikis2: '{ad} · {dk}m · pedpaydu den su timpu ⚠️',
    cikis3: '{ad} · {dk}m · pedlipus su timpu 🔥',
    cikis4: '{ad} · {dk}m · MALIPUS DEN SU WAKTU 🚨',
  },
  girisHavuzu: {
    s1: ['Waktu den nu sambayang; edsambayang kanu sa aden pan timpu.', 'Edsambayang kanu sa aden pan timpu; di nu ibagak sa ulyan.'],
    s2: ['Amayka pedsundulen nu, mas mabegat; di nu ibagak su sambayang nu sa kalipus.', 'Pedlipus su timpu — edsambayang kanu saguna.'],
    s3: [
      'Amayka pedsundulen nu, masiken den i di kanu makasambayang; edsambayang kanu saguna.',
      'Di nu edtalun "Edsambayang ako sa ulyan"; makasambayang kanu saguna.',
      'Tindeg kanu saguna, sa di pan kanu makatalu sa "upama ka" sa paydu a minutu.',
    ],
    s4: ['Di nu den isundul su sambayang nu — tindeg kanu sa sambayang saguna.', 'Tagaken nu su galebek nu endu tindeg kanu sa sambayang.'],
  },
  govde: {
    s1: 'Pedpaydu den su timpu; edsambayang kanu sa aden pan timpu.',
    s2: 'Di nu ibagak su sambayang nu sa kalipus; mapya a waktu saguna para edsambayang.',
    s3: 'Masiken den malipus su timpu; makasambayang kanu pan saguna.',
    s4: 'Amayka midsambayang kanu den, i-tap su "Midsambayang ako"; amayka da, tindeg kanu sa sambayang saguna.',
  },
  serit: {
    giris4: 'DI NU ISUNDUL SU SAMBAYANG NU. Tindeg kanu sa sambayang saguna. ({dk} min a nalipus)',
    giris2: 'Pedlipus su timpu; di nu ibagak su sambayang nu sa kalipus. ({dk} min a nalipus)',
    giris1: cogul({
      one: '{n} minutu den sa ulyan nu kinapamula nu waktu nu sambayang.',
      other: '{n} minutu den sa ulyan nu kinapamula nu waktu nu sambayang.',
    }),
    erken4: 'Di nu isundul su sambayang nu; tindeg kanu sa sambayang saguna. ({dk} min pan)',
    cikis4: 'MALIPUS DEN SU WAKTU. Tindeg kanu sa sambayang saguna. ({dk} min pan)',
    cikis2: 'Pedpaydu den su timpu; di nu ibagak su sambayang nu sa kalipus. ({dk} min pan)',
    cikis1: cogul({
      one: '{n} minutu pan taman sa kalipus nu waktu nu sambayang.',
      other: '{n} minutu pan taman sa kalipus nu waktu nu sambayang.',
    }),
  },
  geceCapasi: {
    baslik: '{ad} · edsambayang sa di pan matulug ⏰',
    govde: 'Magpamula su manga oras a da suara sa {dk} min; edsambayang kanu sa Isha sa di pan matulug.',
  },
  icerik: {
    firsat: 'Pedpaydu den su timpu; edsambayang kanu sa aden pan timpu.',
    sonaBirakma: 'Di nu ibagak su sambayang nu sa kalipus; mapya a waktu saguna para edsambayang.',
    fisilti: 'Di nu edtalun "Edsambayang ako sa ulyan"; masiken den malipus su timpu, makasambayang kanu pan saguna.',
    omur: 'Pedlipus su timpu; aden pan timpu nu para makasambayang sa sambayang ini sa waktu nin.',
    keske: 'Tindeg kanu saguna, sa di pan kanu makatalu sa "upama ka" sa paydu a minutu.',
    namazaDur: 'Amayka midsambayang kanu den, i-tap su "Midsambayang ako"; amayka da, tindeg kanu sa sambayang saguna.',
    sonDakika: 'Su ulyanan a manga minutu. Tagaken nu su galebek nu endu tindeg kanu sa sambayang.',
  },
};
