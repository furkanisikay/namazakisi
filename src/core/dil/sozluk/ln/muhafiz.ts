import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı: 2. çoğul kısa emir ("Botelema mpɔ na losambo", "Bosambela"; kök QE 2:43
 * "botelemisa losambo"), "!" yok. Secde karşılığı YAZILMAZ: kişi namaza durur. Başlıkta süre
 * birimi "m": "Maghrib · 655m" ilk 16 karaktere sığar.
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · {dk}m eleki · ntango ya losambo ⏰',
    giris2: '{ad} · {dk}m eleki · bowumisa losambo te ⚠️',
    giris3: '{ad} · {dk}m eleki · losambo ezali kozela 🔥',
    giris4: '{ad} · {dk}m eleki · BOTELEMA MPƆ NA LOSAMBO 🚨',
    erken3: '{ad} · {dk}m etikali · losambo ezali kozela 🔥',
    erken4: '{ad} · {dk}m etikali · BOTELEMA MPƆ NA LOSAMBO 🚨',
    cikis1: '{ad} · {dk}m etikali ⏰',
    cikis2: '{ad} · {dk}m · ntango ezali kosila ⚠️',
    cikis3: '{ad} · {dk}m · ntango ezali kokima 🔥',
    cikis4: '{ad} · {dk}m · NTANGO EZALI KOSILA 🚨',
  },
  girisHavuzu: {
    s1: ['Ntango ya losambo ekoki; bosambela ntango bozali na libaku.', 'Bosambela ntango ntango ezali naino; botika yango mpɔ na nsima te.'],
    s2: ['Soki bowumisi, ekokoma kilo; botika losambo na bino tii na suka te.', 'Ntango ezali koleka — bosambela sikoyo.'],
    s3: [
      'Soki bowumisi lisusu, bozali kopusana pene ya kobungisa yango; bosambela sikoyo.',
      'Boloba te "nakosambela nsima"; bokoki kosambela sikoyo.',
      'Botelema sikoyo, na esika ya koloba "soki" nsima ya miniti moke.',
    ],
    s4: ['Bowumisa losambo na bino lisusu te — botelema mpɔ na losambo sikoyo.', 'Botika oyo bozali kosala mpe botelema mpɔ na losambo.'],
  },
  govde: {
    s1: 'Ntango ebandi kosila; bosambela ntango bozali na libaku.',
    s2: 'Botika losambo na bino tii na suka te; sikoyo ezali ntango malamu ya kosambela.',
    s3: 'Ntango ekomi pene ya kosila; bokoki naino kosambela sikoyo.',
    s4: 'Soki bosambeli, bofina "Nasambeli"; soki te, botelema mpɔ na losambo sikoyo.',
  },
  serit: {
    giris4: 'BOWUMISA LOSAMBO TE. Botelema mpɔ na losambo sikoyo. (miniti {dk} eleki)',
    giris2: 'Ntango ezali koleka; botika losambo na bino tii na suka te. (miniti {dk} eleki)',
    giris1: cogul({
      one: 'Miniti {n} eleki banda ntango ya losambo ebandi.',
      other: 'Miniti {n} eleki banda ntango ya losambo ebandi.',
    }),
    erken4: 'Bowumisa losambo te; botelema mpɔ na losambo sikoyo. (miniti {dk} etikali)',
    cikis4: 'NTANGO EZALI KOSILA. Botelema mpɔ na losambo sikoyo. (miniti {dk} etikali)',
    cikis2: 'Ntango ezali kosila; botika losambo na bino tii na suka te. (miniti {dk} etikali)',
    cikis1: cogul({
      one: 'Etikali miniti {n} tii ntango ya losambo esila.',
      other: 'Etikali miniti {n} tii ntango ya losambo esila.',
    }),
  },
  geceCapasi: {
    baslik: '{ad} · bosambela liboso ya kolala ⏰',
    govde: 'Bangonga ya kimia ekobanda na miniti {dk}; bosambela Isha liboso ya kolala.',
  },
  icerik: {
    firsat: 'Ntango ebandi kosila; bosambela ntango bozali na libaku.',
    sonaBirakma: 'Botika losambo na bino tii na suka te; sikoyo ezali ntango malamu ya kosambela.',
    fisilti: 'Boloba te "nakosambela nsima"; ntango ekomi pene ya kosila, bokoki kosambela sikoyo.',
    omur: 'Ntango ezali koleka; bozali naino na libaku ya kosambela losambo oyo na ntango na yango.',
    keske: 'Botelema sikoyo, na esika ya koloba "soki" nsima ya miniti moke.',
    namazaDur: 'Soki bosambeli, bofina "Nasambeli"; soki te, botelema mpɔ na losambo sikoyo.',
    sonDakika: 'Miniti ya suka. Botika oyo bozali kosala mpe botelema mpɔ na losambo.',
  },
};
