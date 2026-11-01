import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı Portekizcede: kişisiz 3. tekil kibar emir, kısa ("Cumpra a oração", 17:78
 * kalıbı; "Reze agora"); "por favor" ve "!" yok, secde YAZILMAZ. Başlıkta süre "{dk} min":
 * "Magrib · 655 min" ilk 16 karaktere sığar.
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · {dk} min passados · é a hora ⏰',
    giris2: '{ad} · {dk} min passados · não adie a oração ⚠️',
    giris3: '{ad} · {dk} min passados · a oração espera por si 🔥',
    giris4: '{ad} · {dk} min passados · CUMPRA A ORAÇÃO 🚨',
    erken3: '{ad} · {dk} min restantes · a oração espera por si 🔥',
    erken4: '{ad} · {dk} min restantes · CUMPRA A ORAÇÃO 🚨',
    cikis1: '{ad} · {dk} min restantes ⏰',
    cikis2: '{ad} · {dk} min · o tempo está a acabar ⚠️',
    cikis3: '{ad} · {dk} min · o tempo está a fugir 🔥',
    cikis4: '{ad} · {dk} min · A HORA ESTÁ A TERMINAR 🚨',
  },
  girisHavuzu: {
    s1: ['É a hora da oração; reze enquanto tem oportunidade.', 'Reze enquanto o tempo está do seu lado; não deixe para depois.'],
    s2: ['Quanto mais adia, mais pesa; não deixe a oração para o fim.', 'O tempo avança — reze agora.'],
    s3: [
      'Quanto mais adia, mais perto fica de a perder; reze agora.',
      'Não diga «rezo mais tarde»; pode rezar agora.',
      'Levante-se agora, em vez de dizer «quem me dera» daqui a uns minutos.',
    ],
    s4: ['Não adie mais a oração — cumpra a oração agora.', 'Pare o que está a fazer e cumpra a oração.'],
  },
  govde: {
    s1: 'O tempo começa a escassear; reze enquanto tem oportunidade.',
    s2: 'Não deixe a oração para o fim; agora é um bom momento para rezar.',
    s3: 'O tempo está quase a acabar; ainda pode rezar agora.',
    s4: 'Se já rezou, toque em «Rezei»; se não, cumpra a oração agora.',
  },
  serit: {
    giris4: 'NÃO ADIE A ORAÇÃO. Cumpra a oração agora. ({dk} min passados)',
    giris2: 'O tempo avança; não deixe a oração para o fim. ({dk} min passados)',
    giris1: cogul({ one: 'Passou {n} minuto desde o início da hora da oração.', many: 'Passaram {n} de minutos desde o início da hora da oração.', other: 'Passaram {n} minutos desde o início da hora da oração.' }),
    erken4: 'Não adie a oração; cumpra a oração agora. ({dk} min restantes)',
    cikis4: 'A HORA ESTÁ A TERMINAR. Cumpra a oração agora. ({dk} min restantes)',
    cikis2: 'O tempo está a acabar; não deixe a oração para o fim. ({dk} min restantes)',
    cikis1: cogul({ one: 'Falta {n} minuto para o fim da hora da oração.', many: 'Faltam {n} de minutos para o fim da hora da oração.', other: 'Faltam {n} minutos para o fim da hora da oração.' }),
  },
  geceCapasi: {
    baslik: '{ad} · reze antes de dormir ⏰',
    govde: 'O período de silêncio começa dentro de {dk} min; reze o Ishá antes de se deitar.',
  },
  icerik: {
    firsat: 'O tempo começa a escassear; reze enquanto tem oportunidade.',
    sonaBirakma: 'Não deixe a oração para o fim; agora é um bom momento para rezar.',
    fisilti: 'Não diga «rezo mais tarde»; o tempo está quase a acabar, pode rezar agora.',
    omur: 'O tempo está a passar; ainda tem oportunidade de rezar esta oração a tempo.',
    keske: 'Levante-se agora, em vez de dizer «quem me dera» daqui a uns minutos.',
    namazaDur: 'Se já rezou, toque em «Rezei»; se não, cumpra a oração agora.',
    sonDakika: 'Os últimos minutos. Pare o que está a fazer e cumpra a oração.',
  },
};
