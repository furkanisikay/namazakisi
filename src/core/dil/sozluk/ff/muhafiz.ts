import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı Pular'da tekil emir: "Juulu", "Ñiiɓu juulde" (QuranEnc 17:78 "Ñiiɓu juulde
 * nde"); "secde" karşılığı YAZILMAZ. Başlıkta süre birimi "hj" (hojom): "Futuroo · 655hj" ilk 16
 * karaktere sığar.
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · {dk}hj ɓenii · ko waqutu juulde ⏰',
    giris2: '{ad} · {dk}hj ɓenii · wota a leelin juulde maa ⚠️',
    giris3: '{ad} · {dk}hj ɓenii · juulde maa hino sabbi maa 🔥',
    giris4: '{ad} · {dk}hj ɓenii · ÑIIƁU JUULDE 🚨',
    erken3: '{ad} · {dk}hj heddii · juulde maa hino sabbi maa 🔥',
    erken4: '{ad} · {dk}hj heddii · ÑIIƁU JUULDE 🚨',
    cikis1: '{ad} · {dk}hj heddii ⏰',
    cikis2: '{ad} · {dk}hj · waqutu hino raɓɓina ⚠️',
    cikis3: '{ad} · {dk}hj · waqutu hino dogga 🔥',
    cikis4: '{ad} · {dk}hj · WAQUTU ON HINO GASA 🚨',
  },
  girisHavuzu: {
    s1: ['Ko waqutu juulde; juulu tuma hiɗa heɓi sahaa.', 'Juulu tuma waqutu hino e maa; wota a acc ɗum ngam caggal.'],
    s2: ['So a ɓuri leelinde ɗum, ɗum ɓuray teddude; wota a acc juulde maa haa waqutu gasa.', 'Waqutu hino yaha — juulu jooni.'],
    s3: [
      'So a ɓuri leelinde, a ɓuray ɓadaade majjinde ɗum; juulu jooni.',
      'Wota a wi’u "mi juulay caggal"; a waawii juulude jooni.',
      'Ummo jooni, adii nde a wi’ata "si tawno" caggal hojomaaji seeɗa.',
    ],
    s4: ['Wota a leelin juulde maa kadi — ñiiɓu juulde jooni.', 'Accu ko mbaɗ-ɗaa kon, ñiiɓu juulde.'],
  },
  govde: {
    s1: 'Waqutu on fuɗɗii raɓɓinde; juulu tuma hiɗa heɓi sahaa.',
    s2: 'Wota a acc juulde maa haa waqutu gasa; jooni ko sahaa moƴƴo ngam juulude.',
    s3: 'Waqutu on ɓadii gasde; hiɗa waawi juulude jooni.',
    s4: 'So a juulii, dobu "Mi juulii"; so wonaa, ñiiɓu juulde jooni.',
  },
  serit: {
    giris4: 'WOTA A LEELIN JUULDE MAA. Ñiiɓu juulde jooni. ({dk} hojomaaji ɓenii)',
    giris2: 'Waqutu hino yaha; wota a acc juulde maa haa waqutu gasa. ({dk} hojomaaji ɓenii)',
    giris1: cogul({ one: '{n} hojom ɓenii gila waqutu juulde heewi.', other: '{n} hojomaaji ɓenii gila waqutu juulde heewi.' }),
    erken4: 'Wota a leelin juulde maa; ñiiɓu juulde jooni. ({dk} hojomaaji heddii)',
    cikis4: 'WAQUTU ON HINO GASA. Ñiiɓu juulde jooni. ({dk} hojomaaji heddii)',
    cikis2: 'Waqutu hino raɓɓina; wota a acc juulde maa haa waqutu gasa. ({dk} hojomaaji heddii)',
    cikis1: cogul({ one: '{n} hojom heddii haa waqutu juulde gasa.', other: '{n} hojomaaji heddii haa waqutu juulde gasa.' }),
  },
  geceCapasi: {
    baslik: '{ad} · juulu adii ɗaanaade ⏰',
    govde: 'Saa’iiji deƴƴere fuɗɗoto caggal {dk} hojomaaji; juulu geeƴe adii lelaade.',
  },
  icerik: {
    firsat: 'Waqutu on fuɗɗii raɓɓinde; juulu tuma hiɗa heɓi sahaa.',
    sonaBirakma: 'Wota a acc juulde maa haa waqutu gasa; jooni ko sahaa moƴƴo ngam juulude.',
    fisilti: 'Wota a wi’u "mi juulay caggal"; waqutu ɓadii gasde, a waawii juulude jooni.',
    omur: 'Waqutu hino ɓenna; hiɗa heɓi sahaa juulude juulde ndee e waqutu mum.',
    keske: 'Ummo jooni, adii nde a wi’ata "si tawno" caggal hojomaaji seeɗa.',
    namazaDur: 'So a juulii, dobu "Mi juulii"; so wonaa, ñiiɓu juulde jooni.',
    sonDakika: 'Hojomaaji sakkitoraaji. Accu ko mbaɗ-ɗaa kon, ñiiɓu juulde.',
  },
};
