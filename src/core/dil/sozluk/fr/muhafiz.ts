import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı Fransızcada: "vous" + kısa, doğrudan emir ("Priez maintenant").
 * Secde fiili ("prosternez-vous") YAZILMAZ: kişi namaza durur → "priez", "allez prier".
 * Başlıkta süre birimi "min": "Maghrib · 65 min" ilk 16 karaktere sığar (üç haneli süre bir
 * karakter taşar). Sesli okuma metni dakikayı tam söyler (`anons`).
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · {dk} min passées · c’est l’heure ⏰',
    giris2: '{ad} · {dk} min passées · ne retardez pas ⚠️',
    giris3: '{ad} · {dk} min passées · votre prière vous attend 🔥',
    giris4: '{ad} · {dk} min passées · PRIEZ MAINTENANT 🚨',
    erken3: '{ad} · {dk} min restantes · votre prière vous attend 🔥',
    erken4: '{ad} · {dk} min restantes · PRIEZ MAINTENANT 🚨',
    cikis1: '{ad} · {dk} min restantes ⏰',
    cikis2: '{ad} · {dk} min · le temps se resserre ⚠️',
    cikis3: '{ad} · {dk} min · le temps s’échappe 🔥',
    cikis4: '{ad} · {dk} min · L’HEURE SE TERMINE 🚨',
  },
  girisHavuzu: {
    s1: ['L’heure de la prière est venue ; priez tant que vous le pouvez.', 'Priez pendant que le temps joue en votre faveur, ne remettez pas à plus tard.'],
    s2: ['Plus vous repoussez, plus cela pèse ; ne laissez pas votre prière pour la fin.', 'Le temps avance — priez maintenant.'],
    s3: [
      'Plus vous retardez, plus vous risquez de la manquer ; priez maintenant.',
      'Ne dites pas « je prierai plus tard » ; vous pouvez prier maintenant.',
      'Levez-vous maintenant plutôt que de dire « si seulement » dans quelques minutes.',
    ],
    s4: ['Ne retardez plus votre prière — allez prier maintenant.', 'Laissez ce que vous faites et allez prier.'],
  },
  govde: {
    s1: 'Le temps commence à se resserrer ; priez tant que vous le pouvez.',
    s2: 'Ne laissez pas votre prière pour la fin ; c’est maintenant le bon moment pour prier.',
    s3: 'L’heure est presque finie ; vous pouvez encore prier maintenant.',
    s4: 'Si vous avez prié, touchez « J’ai prié » ; sinon, allez prier maintenant.',
  },
  serit: {
    giris4: 'NE RETARDEZ PAS VOTRE PRIÈRE ! Allez prier maintenant ! ({dk} min passées)',
    giris2: 'Le temps avance ; ne laissez pas votre prière pour la fin. ({dk} min passées)',
    giris1: cogul({
      one: 'L’heure de la prière a commencé il y a {n} minute.',
      many: 'L’heure de la prière a commencé il y a {n} de minutes.',
      other: 'L’heure de la prière a commencé il y a {n} minutes.',
    }),
    erken4: 'Ne retardez pas votre prière, allez prier maintenant ! ({dk} min restantes)',
    cikis4: 'L’HEURE SE TERMINE ! Allez prier maintenant ! ({dk} min restantes)',
    cikis2: 'Le temps se resserre ; ne laissez pas votre prière pour la fin. ({dk} min restantes)',
    cikis1: cogul({
      one: 'Il reste {n} minute avant la fin de l’heure de prière.',
      many: 'Il reste {n} de minutes avant la fin de l’heure de prière.',
      other: 'Il reste {n} minutes avant la fin de l’heure de prière.',
    }),
  },
  geceCapasi: {
    baslik: '{ad} · priez avant de dormir ⏰',
    govde: 'Les heures calmes commencent dans {dk} min ; priez Isha avant d’aller vous coucher.',
  },
  icerik: {
    firsat: 'Le temps commence à se resserrer ; priez tant que vous le pouvez.',
    sonaBirakma: 'Ne laissez pas votre prière pour la fin ; c’est maintenant le bon moment pour prier.',
    fisilti: 'Ne dites pas « je prierai plus tard » ; l’heure est presque finie, vous pouvez prier maintenant.',
    omur: 'Le temps passe ; vous avez encore l’occasion d’accomplir cette prière à son heure.',
    keske: 'Levez-vous maintenant plutôt que de dire « si seulement » dans quelques minutes.',
    namazaDur: 'Si vous avez prié, touchez « J’ai prié » ; sinon, allez prier maintenant.',
    sonDakika: 'Les dernières minutes. Laissez ce que vous faites et allez prier.',
  },
};
