import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Seri = "niz". "!" ve övgü yok; paylaşım metinlerinde 1. tekil geçmiş zaman cinsiyetli olduğundan
 * kişisiz/şimdiki zaman kalıpları seçildi ("Osvojena nova značka").
 */
export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Vaš niz gori',
    enUzun: cogul({ one: 'Najduži niz: {n} dan', few: 'Najduži niz: {n} dana', other: 'Najduži niz: {n} dana' }),
    gunBuyuk: cogul({ one: 'DAN', few: 'DANA', other: 'DANA' }),
    sonrakiHedef: 'Sljedeći cilj: {hedef}. dan ({durum})',
    kalanGun: cogul({ one: 'Preostao je {n} dan', few: 'Preostala su {n} dana', other: 'Preostalo je {n} dana' }),
    tamamlandi: 'Dovršeno',
    paylasErisim: 'Podijelite svoj napredak',
    paylasBuyuk: 'PODIJELITE SVOJ NAPREDAK',
  },

  hedefler: {
    ilk_adim: { ad: 'Prvi tjedan', aciklama: 'Klanjajte 7 dana bez prekida', cumle: 'Prvi tjedan' },
    aliskanlik_ustasi: { ad: 'Majstor navike', aciklama: '21 dan - razdoblje stvaranja navike', cumle: 'Majstor navike' },
    kararlilik: { ad: 'Ustrajnost', aciklama: '60 dana bez prekida', cumle: 'Ustrajnost' },
    efsane: { ad: 'Legenda', aciklama: '90 dana - iznimna ustrajnost', cumle: 'Legenda' },
  },

  /** Klasik derece adları, harf çevirisiyle (çeviri değil). */
  seviyeler: ['Mubtedi', 'Talib', 'Salik', 'Murid', 'Arif', 'Hafiz', 'Kamil'],

  rozetler: {
    ilk_adim: { ad: 'Prvi korak', aciklama: 'Završili ste prvi tjedan.', kosul: 'Niz od 7 dana' },
    aliskanlik_ustasi: {
      ad: 'Majstor navike',
      aciklama: '21 dan - razdoblje stvaranja navike je završeno.',
      kosul: 'Niz od 21 dana',
    },
    kararlilik: { ad: 'Ustrajnost', aciklama: 'Klanjali ste 60 dana bez prekida.', kosul: 'Niz od 60 dana' },
    efsane: { ad: 'Legenda', aciklama: '90 dana - pokazali ste iznimnu ustrajnost.', kosul: 'Niz od 90 dana' },
    toparlanma_ustasi: {
      ad: 'Majstor oporavka',
      aciklama: 'Način oporavka dovršili ste 3 puta.',
      kosul: '3 oporavka',
    },
    mukemmeliyetci: { ad: 'Pet od pet', aciklama: 'Klanjali ste 5/5 tijekom 30 dana.', kosul: '30 dana s 5/5 namaza' },
    yuz_namaz: { ad: '100 namaza', aciklama: 'Ukupno ste klanjali 100 namaza.', kosul: 'Klanjajte 100 namaza' },
    bin_namaz: { ad: '1000 namaza', aciklama: 'Ukupno ste klanjali 1000 namaza.', kosul: 'Klanjajte 1000 namaza' },
  },

  rozetSeviyeleri: { bronz: 'BRONČANA', gumus: 'SREBRNA', altin: 'ZLATNA', elmas: 'DIJAMANTNA' },

  gunBitis: {
    erken: 'Za one koji rano liježu',
    varsayilan: 'Zadano - na većini mjesta prije sabaha',
    gec: 'Za one koji kasno liježu',
  },

  kutlama: {
    rozetEklendi: '🏅 Dodano u vašu zbirku znački',
    paylasin: 'Podijelite',
    rozetBaslik: 'Neka Allah to učini trajnim',
    rozetMesaj: 'Osvojili ste značku „{ad}“.',
    hedefBaslik: cogul({ one: '{n} dan', few: '{n} dana', other: '{n} dana' }),
    hedefMesaj: 'Ostvarili ste cilj „{ad}“. Neka Allah to učini trajnim.',
    yeniRank: 'Nova razina: {rank}',
    seviyeBaslik: 'Vaša nova razina',
    seviyeMesaj: 'Sada nastavljate kao „{rank}“. Neka Allah to učini trajnim.',
    toparlanmaBaslik: 'Vaš se niz vratio',
    toparlanmaMesaj: cogul({
      one: 'Vaš niz od {n} dana nastavlja se ondje gdje je stao. Neka Allah podari ustrajnost.',
      few: 'Vaš niz od {n} dana nastavlja se ondje gdje je stao. Neka Allah podari ustrajnost.',
      other: 'Vaš niz od {n} dana nastavlja se ondje gdje je stao. Neka Allah podari ustrajnost.',
    }),
    enUzunBaslik: 'Vaš najduži niz',
    enUzunMesaj: cogul({
      one: '{n} dan: vaš dosad najduži niz. Neka Allah to učini trajnim.',
      few: '{n} dana: vaš dosad najduži niz. Neka Allah to učini trajnim.',
      other: '{n} dana: vaš dosad najduži niz. Neka Allah to učini trajnim.',
    }),
  },

  sekme: {
    hataOkunamadi: 'Vaše prošle zapise trenutačno nije moguće pročitati.',
    yenidenErisim: 'Ponovno učitajte podatke o nizu',
    yenidenDeneyin: 'Pokušajte ponovno',
    yukleniyor: 'Učitavanje podataka o nizu…',
    gunlukSeri: 'dana niza',
    rekor: 'rekord',
    sozErisim: '{metin} Izvor: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Sljedeći cilj',
    tumu: 'Osvojili ste sve značke',
    kalan: cogul({ one: 'Značka {ad}: preostao je {n} dan', few: 'Značka {ad}: preostala su {n} dana', other: 'Značka {ad}: preostalo je {n} dana' }),
    tumuErisim: 'Osvojili ste sve značke: tesbih je pun.',
    erisim: 'Značka {ad}: dovršeno {n} od {hedef} dana.',
  },

  gok: {
    gunHarfleri: ['P', 'U', 'S', 'Č', 'P', 'S', 'N'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: '{n} dan s ostvarenim ciljem', few: '{n} dana s ostvarenim ciljem', other: '{n} dana s ostvarenim ciljem' }),
    besVakit: cogul({ one: '{n} dan sa svih pet namaza', few: '{n} dana sa svih pet namaza', other: '{n} dana sa svih pet namaza' }),
    dondurulmus: cogul({ one: '{n} zamrznuti dan', few: '{n} zamrznuta dana', other: '{n} zamrznutih dana' }),
    mevcutSeri: cogul({ one: 'Trenutačni niz: {n} dan.', few: 'Trenutačni niz: {n} dana.', other: 'Trenutačni niz: {n} dana.' }),
  },

  hedefAyar: {
    azalt: 'Smanji',
    deger: 'Vrijednost',
    artir: 'Povećaj',
    esik: cogul({ one: '{n} namaz', few: '{n} namaza', other: '{n} namaza' }),
    sifirlaBaslik: 'Poništite niz',
    sifirlaMesaj: 'Svi vaši podaci o nizu (niz, značke, bodovi) bit će poništeni. To se ne može vratiti. Želite li nastaviti?',
    sifirla: 'Poništite',
    iptal: 'Odustanite',
    basarili: 'Gotovo',
    sifirlandi: 'Vaši su podaci o nizu poništeni.',
    hedefAyarlari: 'POSTAVKE CILJA',
    tamGunEsigi: 'Prag punog dana',
    tamGunAciklama: 'Određuje najmanji broj namaza u danu potreban da se taj dan uračuna u vaš niz',
    sifirlama: 'PONIŠTAVANJE',
    verileriSifirla: 'Poništite podatke o nizu',
    verileriSifirlaAlt: 'Briše sve podatke o nizu, značkama i bodovima',
  },

  rozetKarti: {
    erisim: 'Značka {ad}, {durum}',
    kazanildi: 'osvojena',
    kilitli: 'zaključana',
  },

  toparlanma: {
    kartBaslik: 'NAČIN OPORAVKA',
    kartAltBaslik: 'Svoj niz možete vratiti',
    kartMesaj: 'Svoj niz od {vurgu} možete nastaviti ondje gdje ste stali.',
    oncekiGun: cogul({ one: '{n} dana', few: '{n} dana', other: '{n} dana' }),
    ilerleme: 'Dovršeno {tamam}/{hedef} dana',
    kalan: cogul({
      one: 'Klanjajte svih pet namaza još {n} dan i vaš se niz nastavlja ondje gdje je stao.',
      few: 'Klanjajte svih pet namaza još {n} dana i vaš se niz nastavlja ondje gdje je stao.',
      other: 'Klanjajte svih pet namaza još {n} dana i vaš se niz nastavlja ondje gdje je stao.',
    }),
    bugun: 'Upotpunite današnji dan i vaš se niz nastavlja ondje gdje je stao.',
    uyari: 'Dani moraju biti uzastopni; ako se između propusti dan, oporavak počinje ispočetka.',
    kapatErisim: 'Zatvorite pojedinosti oporavka',
    anladim: 'Razumijem',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Podijelite svoj napredak',
    hazirDegilBaslik: 'Slika nije spremna',
    hazirDegilMesaj: 'Slika još nije spremna. Pokušajte ponovno za nekoliko sekundi.',
    olusturulamadiBaslik: 'Sliku nije bilo moguće izraditi',
    olusturulamadiMesaj: 'Došlo je do pogreške pri izradi slike. Pokušajte ponovno.',
    kullanilamiyorBaslik: 'Dijeljenje nije dostupno',
    kullanilamiyorMesaj: 'Dijeljenje nije dostupno na ovom uređaju.',
    kapat: 'Zatvorite',
    hikaye: 'Dodajte u priču',
    platformlar: 'Može se podijeliti na Instagramu, WhatsAppu i drugdje.',
    tamam: 'U redu',
    seriEnUzun: cogul({ one: 'Moj najduži niz: {n} dan', few: 'Moj najduži niz: {n} dana', other: 'Moj najduži niz: {n} dana' }),
    seriZincir: cogul({ one: 'DAN BEZ PREKIDA', few: 'DANA BEZ PREKIDA', other: 'DANA BEZ PREKIDA' }),
    seriSoz: '„Svaki dan mali korak, velik mir u duši. 🔥“',
    rozetYeni: 'OSVOJENA NOVA ZNAČKA',
    rozetSozleri: [
      'Danas još jedan dobar korak za sebe. 🌟',
      'Nastavljam odlučno; ova je značka moja. 💪',
      'Blagoslov jutra nije me zaobišao. 🌅',
      'Dio sam ovog tijeka koji godi mojoj duši. ✨',
      'Mali koraci donose velik mir. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'OSVOJENA NOVA ZNAČKA',
      hedef_tamamlandi: 'CILJ JE OSTVAREN',
      seviye_atlandi: 'NOVA RAZINA',
      toparlanma_tamamlandi: 'OPET NA PRAVOM PUTU',
      en_uzun_seri: 'NOVI REKORD',
      varsayilan: 'POSTIGNUĆE',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Neka moj Gospodar to učini trajnim. 🤲', 'Mali koraci donose velik mir. 🍃', 'Neka Allah svima nama podari ustrajnost. 🌱'],
      hedef_tamamlandi: ['Mali koraci donose velik mir. 🍃', 'Neka Allah to učini trajnim. 🤲', 'Svaki dan još jedan korak. 🌱'],
      seviye_atlandi: [
        'Svaki dan malo dalje; neka Allah olakša. 🍃',
        'Neka Allah to učini trajnim. 🤲',
        'Putovanje se nastavlja. 🌱',
      ],
      toparlanma_tamamlandi: [
        'Nije važno pasti, nego ustati. 🔄',
        'Neka Allah podari ustrajnost. 🤲',
        'Svaki se put prelazi sa strpljenjem. 🌱',
      ],
      en_uzun_seri: [
        'Svaki dan mali korak, velik mir u srcu. 🍃',
        'Neka Allah to učini trajnim. 🤲',
        'Neka moj Gospodar svima nama podari ustrajnost. 🌱',
      ],
    },
  },
};
