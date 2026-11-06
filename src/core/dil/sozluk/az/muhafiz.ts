import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadətə çağırış: "sən" + qısa əmr. "Səcdəyə qapan" YAZILMIR → "namaza dur". Başlıqda vaxt adı və
 * müddət ilk 16 simvoldadır ("Məğrib · 655 dəq"). Tərif və "!" yoxdur.
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · {dk} dəq keçdi · vaxt daxil oldu ⏰',
    giris2: '{ad} · {dk} dəq keçdi · namazını gecikdirmə ⚠️',
    giris3: '{ad} · {dk} dəq keçdi · namaz səni gözləyir 🔥',
    giris4: '{ad} · {dk} dəq keçdi · NAMAZA DUR 🚨',
    erken3: '{ad} · {dk} dəq qaldı · namaz səni gözləyir 🔥',
    erken4: '{ad} · {dk} dəq qaldı · NAMAZA DUR 🚨',
    cikis1: '{ad} · {dk} dəq qaldı ⏰',
    cikis2: '{ad} · {dk} dəq · vaxt daralır ⚠️',
    cikis3: '{ad} · {dk} dəq · vaxt qaçır 🔥',
    cikis4: '{ad} · {dk} dəq · VAXT ÇIXIR 🚨',
  },
  girisHavuzu: {
    s1: ['Namaz vaxtı daxil oldu; fürsət varkən qıl.', 'Vaxt sənin xeyrinə ikən qıl, sonraya qalmasın.'],
    s2: ['Təxirə saldıqca ağırlaşır; namazı sona saxlama.', 'Vaxt irəliləyir — namazını indi qıl.'],
    s3: [
      'Namazı gecikdirdikcə qaçırmağa yaxınlaşırsan; dərhal qıl.',
      '"Sonra qılaram" demə; indi qıla bilərsən.',
      'Bir neçə dəqiqə sonra "kaş" deməkdənsə, indi qalx.',
    ],
    s4: ['Namazı daha çox gecikdirmə — dərhal namaza dur.', 'Əlindəkini burax, namaza dur.'],
  },
  govde: {
    s1: 'Vaxt daralmağa başladı, fürsət varkən qıl.',
    s2: 'Namazı sona saxlama; indi qılmaq üçün vaxt uyğundur.',
    s3: 'Vaxt bitmək üzrədir; indi qıla bilərsən.',
    s4: "Qılmısansa 'Qıldım' düyməsinə bas; qılmamısansa dərhal namaza dur.",
  },
  serit: {
    giris4: 'NAMAZI GECİKDİRMƏ. Dərhal namaza dur. ({dk} dəq keçdi)',
    giris2: 'Vaxt irəliləyir, namazı sona saxlama. ({dk} dəq keçdi)',
    giris1: cogul({ one: 'Namaz vaxtı daxil olandan {n} dəqiqə keçib.', other: 'Namaz vaxtı daxil olandan {n} dəqiqə keçib.' }),
    erken4: 'Namazı gecikdirmə, dərhal namaza dur. ({dk} dəq qaldı)',
    cikis4: 'VAXT ÇIXIR. Dərhal namaza dur. ({dk} dəq qaldı)',
    cikis2: 'Vaxt daralır, namazı sona saxlama. ({dk} dəq qaldı)',
    cikis1: cogul({ one: 'Namaz vaxtının bitməsinə {n} dəqiqə qalıb.', other: 'Namaz vaxtının bitməsinə {n} dəqiqə qalıb.' }),
  },
  geceCapasi: {
    baslik: '{ad} · yatmazdan əvvəl qıl ⏰',
    govde: 'Gecə sakitliyinə {dk} dəq qalıb; yatmazdan əvvəl işa namazını qıl.',
  },
  icerik: {
    firsat: 'Vaxt daralmağa başladı, fürsət varkən qıl.',
    sonaBirakma: 'Namazı sona saxlama; indi qılmaq üçün vaxt uyğundur.',
    fisilti: '"Sonra qılaram" demə; vaxt bitmək üzrədir, indi qıla bilərsən.',
    omur: 'Vaxt keçir; bu namazı vaxtında qılmaq üçün hələ fürsətin var.',
    keske: 'Bir neçə dəqiqə sonra "kaş" deməkdənsə, indi qalx.',
    namazaDur: "Qılmısansa 'Qıldım' düyməsinə bas; qılmamısansa dərhal namaza dur.",
    sonDakika: 'Son dəqiqələr. Əlindəkini burax, namaza dur.',
  },
};
