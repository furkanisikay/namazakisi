import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı Rumencede: 2. çoğul kibar emir (yönetim metniyle aynı), kısa ve doğrudan;
 * "vă rugăm", "dumneavoastră" ve "!" yok. Çağrı "Efectuați rugăciunea" (QuranEnc `romanian_project`
 * 2:43 "Efectuați Rugăciunea", arayüzde küçük r); "namaza dur" = "ridicați-vă la rugăciune"
 * (secde YAZILMAZ). Kullanıcıya dönük sıfat/ortaç yazılmaz (kibar biçimde cinsiyet ve sayı taşır).
 * Başlık önden okunur: vakit adı + süre ilk 16 karakterde ("Maghrib · 655 min").
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · {dk} min trecute · a sosit timpul ⏰',
    giris2: '{ad} · {dk} min trecute · nu amânați rugăciunea ⚠️',
    giris3: '{ad} · {dk} min trecute · rugăciunea vă așteaptă 🔥',
    giris4: '{ad} · {dk} min trecute · EFECTUAȚI RUGĂCIUNEA 🚨',
    erken3: '{ad} · {dk} min rămase · rugăciunea vă așteaptă 🔥',
    erken4: '{ad} · {dk} min rămase · EFECTUAȚI RUGĂCIUNEA 🚨',
    cikis1: '{ad} · {dk} min rămase ⏰',
    cikis2: '{ad} · {dk} min · timpul se scurtează ⚠️',
    cikis3: '{ad} · {dk} min · timpul se scurge 🔥',
    cikis4: '{ad} · {dk} min · TIMPUL SE ÎNCHEIE 🚨',
  },
  girisHavuzu: {
    s1: ['A sosit timpul rugăciunii; rugați-vă cât aveți ocazia.', 'Rugați-vă cât timpul vă este favorabil; nu lăsați pe mai târziu.'],
    s2: ['Cu cât amânați, cu atât devine mai greu; nu lăsați rugăciunea la final.', 'Timpul înaintează — rugați-vă acum.'],
    s3: [
      'Cu cât întârziați, cu atât vă apropiați de pierderea ei; rugați-vă acum.',
      'Nu spuneți „mă rog mai târziu”; vă puteți ruga acum.',
      'Ridicați-vă acum, ca să nu regretați peste câteva minute.',
    ],
    s4: ['Nu mai amânați rugăciunea — ridicați-vă acum la rugăciune.', 'Lăsați ce faceți și ridicați-vă la rugăciune.'],
  },
  govde: {
    s1: 'Timpul începe să se scurteze; rugați-vă cât aveți ocazia.',
    s2: 'Nu lăsați rugăciunea la final; acum este un moment potrivit.',
    s3: 'Timpul aproape s-a încheiat; încă vă puteți ruga acum.',
    s4: 'Dacă v-ați rugat, apăsați „M-am rugat”; dacă nu, ridicați-vă acum la rugăciune.',
  },
  serit: {
    giris4: 'NU AMÂNAȚI RUGĂCIUNEA. Ridicați-vă acum la rugăciune. (au trecut {dk} min)',
    giris2: 'Timpul înaintează; nu lăsați rugăciunea la final. (au trecut {dk} min)',
    giris1: cogul({
      one: 'A trecut {n} minut de la începutul timpului rugăciunii.',
      few: 'Au trecut {n} minute de la începutul timpului rugăciunii.',
      other: 'Au trecut {n} de minute de la începutul timpului rugăciunii.',
    }),
    erken4: 'Nu amânați rugăciunea; ridicați-vă acum la rugăciune. (mai sunt {dk} min)',
    cikis4: 'TIMPUL SE ÎNCHEIE. Ridicați-vă acum la rugăciune. (mai sunt {dk} min)',
    cikis2: 'Timpul se scurtează; nu lăsați rugăciunea la final. (mai sunt {dk} min)',
    cikis1: cogul({
      one: 'Mai este {n} minut până la sfârșitul timpului rugăciunii.',
      few: 'Mai sunt {n} minute până la sfârșitul timpului rugăciunii.',
      other: 'Mai sunt {n} de minute până la sfârșitul timpului rugăciunii.',
    }),
  },
  geceCapasi: {
    baslik: '{ad} · rugați-vă înainte de somn ⏰',
    govde: 'Orele de liniște încep în {dk} min; efectuați rugăciunea Ișa înainte de culcare.',
  },
  icerik: {
    firsat: 'Timpul începe să se scurteze; rugați-vă cât aveți ocazia.',
    sonaBirakma: 'Nu lăsați rugăciunea la final; acum este un moment potrivit.',
    fisilti: 'Nu spuneți „mă rog mai târziu”; timpul aproape s-a încheiat, vă puteți ruga acum.',
    omur: 'Timpul trece; încă aveți ocazia să efectuați această rugăciune la timp.',
    keske: 'Ridicați-vă acum, ca să nu regretați peste câteva minute.',
    namazaDur: 'Dacă v-ați rugat, apăsați „M-am rugat”; dacă nu, ridicați-vă acum la rugăciune.',
    sonDakika: 'Ultimele minute. Lăsați ce faceți și ridicați-vă la rugăciune.',
  },
};
