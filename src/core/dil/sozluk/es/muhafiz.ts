import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı İspanyolcada: "usted" + kısa, doğrudan emir ("Rece ahora", "Vaya a rezar").
 * Secde fiili ("póstrese") YAZILMAZ: kişi namaza durur → "rece", "vaya a rezar".
 * Başlıkta süre birimi "min": "Maghrib · 65 min" ilk 16 karaktere sığar. Sesli okuma metni
 * dakikayı tam söyler (`anons`). Ünlem ("¡…!") yazılmaz; aciliyet büyük harfle verilir.
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · {dk} min transcurridos · es la hora ⏰',
    giris2: '{ad} · {dk} min transcurridos · no lo retrase ⚠️',
    giris3: '{ad} · {dk} min transcurridos · su rezo le espera 🔥',
    giris4: '{ad} · {dk} min transcurridos · RECE YA 🚨',
    erken3: '{ad} · {dk} min restantes · su rezo le espera 🔥',
    erken4: '{ad} · {dk} min restantes · RECE YA 🚨',
    cikis1: '{ad} · {dk} min restantes ⏰',
    cikis2: '{ad} · {dk} min · el tiempo se acorta ⚠️',
    cikis3: '{ad} · {dk} min · el tiempo se escapa 🔥',
    cikis4: '{ad} · {dk} min · LA HORA TERMINA 🚨',
  },
  girisHavuzu: {
    s1: ['Ha llegado la hora del rezo; rece mientras pueda.', 'Rece mientras el tiempo juega a su favor; no lo deje para después.'],
    s2: ['Cuanto más lo aplaza, más pesa; no deje su rezo para el final.', 'El tiempo avanza — rece ahora.'],
    s3: [
      'Cuanto más lo retrasa, más cerca está de perderlo; rece ahora.',
      'No diga «rezaré luego»; puede rezar ahora.',
      'Levántese ahora en lugar de decir «ojalá» dentro de unos minutos.',
    ],
    s4: ['No retrase más su rezo — vaya a rezar ahora.', 'Deje lo que está haciendo y vaya a rezar.'],
  },
  govde: {
    s1: 'El tiempo empieza a acortarse; rece mientras pueda.',
    s2: 'No deje su rezo para el final; ahora es buen momento para rezar.',
    s3: 'La hora está a punto de terminar; aún puede rezar ahora.',
    s4: 'Si ya rezó, toque «Ya recé»; si no, vaya a rezar ahora.',
  },
  serit: {
    giris4: 'NO RETRASE SU REZO. Vaya a rezar ahora. ({dk} min transcurridos)',
    giris2: 'El tiempo avanza; no deje su rezo para el final. ({dk} min transcurridos)',
    giris1: cogul({
      one: 'La hora del rezo comenzó hace {n} minuto.',
      other: 'La hora del rezo comenzó hace {n} minutos.',
      many: 'La hora del rezo comenzó hace {n} de minutos.',
    }),
    erken4: 'No retrase su rezo, vaya a rezar ahora. ({dk} min restantes)',
    cikis4: 'LA HORA TERMINA. Vaya a rezar ahora. ({dk} min restantes)',
    cikis2: 'El tiempo se acorta; no deje su rezo para el final. ({dk} min restantes)',
    cikis1: cogul({
      one: 'Queda {n} minuto para que termine la hora del rezo.',
      other: 'Quedan {n} minutos para que termine la hora del rezo.',
      many: 'Quedan {n} de minutos para que termine la hora del rezo.',
    }),
  },
  geceCapasi: {
    baslik: '{ad} · rece antes de dormir ⏰',
    govde: 'Las horas de silencio empiezan en {dk} min; rece Isha antes de acostarse.',
  },
  icerik: {
    firsat: 'El tiempo empieza a acortarse; rece mientras pueda.',
    sonaBirakma: 'No deje su rezo para el final; ahora es buen momento para rezar.',
    fisilti: 'No diga «rezaré luego»; la hora está a punto de terminar, puede rezar ahora.',
    omur: 'El tiempo pasa; aún tiene la oportunidad de hacer este rezo a su hora.',
    keske: 'Levántese ahora en lugar de decir «ojalá» dentro de unos minutos.',
    namazaDur: 'Si ya rezó, toque «Ya recé»; si no, vaya a rezar ahora.',
    sonDakika: 'Los últimos minutos. Deje lo que está haciendo y vaya a rezar.',
  },
};
