import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Paylaşım sözleri kişinin kendi sesidir; Boşnakçada geçmiş zaman cinsiyetli olduğu için
 * ("osvojio/osvojila sam") birinci tekil kalıplar şimdiki zaman ya da isim cümlesiyle yazıldı.
 */
export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Vaš niz gori',
    enUzun: cogul({ one: 'Najduži niz: {n} dan', few: 'Najduži niz: {n} dana', other: 'Najduži niz: {n} dana' }),
    gunBuyuk: cogul({ one: 'DAN', few: 'DANA', other: 'DANA' }),
    sonrakiHedef: 'Sljedeći cilj: {hedef}. dan ({durum})',
    kalanGun: cogul({ one: 'Još {n} dan', few: 'Još {n} dana', other: 'Još {n} dana' }),
    tamamlandi: 'Završeno',
    paylasErisim: 'Podijelite svoj napredak',
    paylasBuyuk: 'PODIJELITE SVOJ NAPREDAK',
  },

  hedefler: {
    ilk_adim: { ad: 'Prva sedmica', aciklama: 'Klanjajte 7 dana bez prekida', cumle: 'Prva sedmica' },
    aliskanlik_ustasi: { ad: 'Majstor navike', aciklama: '21 dan - vrijeme stvaranja navike', cumle: 'Majstor navike' },
    kararlilik: { ad: 'Odlučnost', aciklama: '60 dana bez prekida', cumle: 'Odlučnost' },
    efsane: { ad: 'Legenda', aciklama: '90 dana - izuzetna ustrajnost', cumle: 'Legenda' },
  },

  /** Klasični nazivi stupnjeva, transliterirani (ne prevedeni). */
  seviyeler: ['Mubtedi', 'Talib', 'Salik', 'Murid', 'Arif', 'Hafiz', 'Kamil'],

  rozetler: {
    ilk_adim: { ad: 'Prvi korak', aciklama: 'Završili ste prvu sedmicu.', kosul: 'Niz od 7 dana' },
    aliskanlik_ustasi: {
      ad: 'Majstor navike',
      aciklama: '21 dan - vrijeme stvaranja navike je završeno.',
      kosul: 'Niz od 21 dana',
    },
    kararlilik: { ad: 'Odlučni', aciklama: 'Klanjali ste 60 dana bez prekida.', kosul: 'Niz od 60 dana' },
    efsane: { ad: 'Legenda', aciklama: '90 dana - pokazali ste izuzetnu ustrajnost.', kosul: 'Niz od 90 dana' },
    toparlanma_ustasi: {
      ad: 'Majstor oporavka',
      aciklama: 'Tri puta ste završili režim oporavka.',
      kosul: '3 oporavka',
    },
    mukemmeliyetci: { ad: 'Perfekcionista', aciklama: '30 dana ste klanjali 5/5 namaza.', kosul: '30 dana po 5/5 namaza' },
    yuz_namaz: { ad: '100 namaza', aciklama: 'Ukupno ste klanjali 100 namaza.', kosul: 'Klanjati 100 namaza' },
    bin_namaz: { ad: '1000 namaza', aciklama: 'Ukupno ste klanjali 1000 namaza.', kosul: 'Klanjati 1000 namaza' },
  },

  rozetSeviyeleri: { bronz: 'BRONZA', gumus: 'SREBRO', altin: 'ZLATO', elmas: 'DIJAMANT' },

  gunBitis: {
    erken: 'Za one koji rano liježu',
    varsayilan: 'Zadano - na većini mjesta prije zore',
    gec: 'Za one koji kasno liježu',
  },

  kutlama: {
    rozetEklendi: '🏅 Dodano u Vašu kolekciju znački',
    paylasin: 'Podijelite',
    rozetBaslik: 'Neka Allah učini trajnim',
    rozetMesaj: 'Osvojili ste značku „{ad}”.',
    hedefBaslik: cogul({ one: '{n} dan', few: '{n} dana', other: '{n} dana' }),
    hedefMesaj: 'Ispunili ste cilj „{ad}”. Neka Allah učini trajnim.',
    seviyeBaslik: 'Vaš novi nivo',
    yeniRank: 'Novi stupanj: {rank}',
    seviyeMesaj: 'Sada nastavljate kao „{rank}”. Neka Allah učini trajnim.',
    toparlanmaBaslik: 'Vaš niz je vraćen',
    toparlanmaMesaj: cogul({
      one: 'Vaš niz od {n} dana nastavlja se tamo gdje je stao. Neka Allah podari ustrajnost.',
      few: 'Vaš niz od {n} dana nastavlja se tamo gdje je stao. Neka Allah podari ustrajnost.',
      other: 'Vaš niz od {n} dana nastavlja se tamo gdje je stao. Neka Allah podari ustrajnost.',
    }),
    enUzunBaslik: 'Vaš najduži niz',
    enUzunMesaj: cogul({
      one: '{n} dan; Vaš najduži niz do sada. Neka Allah učini trajnim.',
      few: '{n} dana; Vaš najduži niz do sada. Neka Allah učini trajnim.',
      other: '{n} dana; Vaš najduži niz do sada. Neka Allah učini trajnim.',
    }),
  },

  sekme: {
    hataOkunamadi: 'Vaši raniji zapisi trenutno se ne mogu očitati.',
    yenidenErisim: 'Ponovo učitajte podatke o nizu',
    yenidenDeneyin: 'Pokušajte ponovo',
    yukleniyor: 'Učitavaju se podaci o Vašem nizu...',
    gunlukSeri: 'dana u nizu',
    rekor: 'rekord',
    sozErisim: '{metin} Izvor: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Sljedeći cilj',
    tumu: 'Osvojili ste sve značke',
    kalan: cogul({ one: 'Značka {ad}: još {n} dan', few: 'Značka {ad}: još {n} dana', other: 'Značka {ad}: još {n} dana' }),
    tumuErisim: 'Osvojili ste sve značke: tesbih je potpuno pun.',
    erisim: 'Značka {ad}: završeno {n} od {hedef} dana.',
  },

  gok: {
    gunHarfleri: ['P', 'U', 'S', 'Č', 'P', 'S', 'N'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: 'Cilj ispunjen {n} dan', few: 'Cilj ispunjen {n} dana', other: 'Cilj ispunjen {n} dana' }),
    besVakit: cogul({
      one: 'Svih pet vakata u {n} danu',
      few: 'Svih pet vakata u {n} dana',
      other: 'Svih pet vakata u {n} dana',
    }),
    dondurulmus: cogul({ one: 'Zamrznut {n} dan', few: 'Zamrznuta {n} dana', other: 'Zamrznuto {n} dana' }),
    mevcutSeri: cogul({ one: 'Trenutni niz: {n} dan.', few: 'Trenutni niz: {n} dana.', other: 'Trenutni niz: {n} dana.' }),
  },

  hedefAyar: {
    azalt: 'Smanjite',
    deger: 'Vrijednost',
    artir: 'Povećajte',
    esik: cogul({ one: '{n} vakat', few: '{n} vakta', other: '{n} vakata' }),
    sifirlaBaslik: 'Poništavanje niza',
    sifirlaMesaj: 'Svi Vaši podaci o nizu (niz, značke, bodovi) bit će poništeni. Ovo se ne može vratiti. Želite li nastaviti?',
    sifirla: 'Poništite',
    iptal: 'Odustanite',
    basarili: 'Gotovo',
    sifirlandi: 'Vaši podaci o nizu su poništeni.',
    hedefAyarlari: 'POSTAVKE CILJA',
    tamGunEsigi: 'Prag punog dana',
    tamGunAciklama: 'Određuje najmanji broj namaza dnevno da bi se taj dan računao u Vaš niz',
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
    kartBaslik: 'REŽIM OPORAVKA',
    kartAltBaslik: 'Možete vratiti svoj niz',
    kartMesaj: 'Svoj niz od {vurgu} možete nastaviti tamo gdje ste stali.',
    oncekiGun: cogul({ one: '{n} dana', few: '{n} dana', other: '{n} dana' }),
    ilerleme: 'Završeno {tamam}/{hedef} dana',
    kalan: cogul({
      one: 'Kada još {n} dan klanjate svih pet vakata, Vaš niz se nastavlja tamo gdje je stao.',
      few: 'Kada još {n} dana klanjate svih pet vakata, Vaš niz se nastavlja tamo gdje je stao.',
      other: 'Kada još {n} dana klanjate svih pet vakata, Vaš niz se nastavlja tamo gdje je stao.',
    }),
    bugun: 'Kada završite današnji dan, Vaš niz se nastavlja tamo gdje je stao.',
    uyari: 'Dovoljno je da ove dane završite uzastopno; ako između ostane prazan dan, oporavak počinje ispočetka.',
    kapatErisim: 'Zatvorite detalje oporavka',
    anladim: 'Razumijem',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Podijelite svoj napredak',
    hazirDegilBaslik: 'Slika nije spremna',
    hazirDegilMesaj: 'Slika još nije spremna. Pokušajte ponovo za nekoliko sekundi.',
    olusturulamadiBaslik: 'Slika nije napravljena',
    olusturulamadiMesaj: 'Došlo je do greške pri izradi slike. Pokušajte ponovo.',
    kullanilamiyorBaslik: 'Dijeljenje nije dostupno',
    kullanilamiyorMesaj: 'Dijeljenje nije dostupno na ovom uređaju.',
    kapat: 'Zatvorite',
    hikaye: 'Dodajte u svoju priču',
    platformlar: 'Može se podijeliti na Instagramu, WhatsAppu i drugdje.',
    tamam: 'U redu',
    seriEnUzun: cogul({ one: 'Moj najduži niz: {n} dan', few: 'Moj najduži niz: {n} dana', other: 'Moj najduži niz: {n} dana' }),
    seriZincir: cogul({ one: 'DAN BEZ PREKIDA LANCA', few: 'DANA BEZ PREKIDA LANCA', other: 'DANA BEZ PREKIDA LANCA' }),
    seriSoz: '„Svaki dan mali korak, a u duši veliki mir. 🔥”',
    rozetYeni: 'NOVA ZNAČKA JE MOJA',
    rozetSozleri: [
      'Danas jedan dobar korak za sebe. 🌟',
      'Nastavljam s odlučnošću; ova značka je moja. 💪',
      'Jutarnji berićet je danas moj. 🌅',
      'I ja sam dio ovog toka koji godi duši. ✨',
      'Mali koraci donose veliki mir. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'NOVA ZNAČKA',
      hedef_tamamlandi: 'CILJ DOSTIGNUT',
      seviye_atlandi: 'NOVI NIVO',
      toparlanma_tamamlandi: 'NIZ VRAĆEN',
      en_uzun_seri: 'NOVI REKORD',
      varsayilan: 'USPJEH',
    },
    kutlamaSozleri: {
      rozet_kazanildi: [
        'Neka Gospodar učini trajnim. 🤲',
        'Mali koraci donose veliki mir. 🍃',
        'Neka Allah svima nama podari ustrajnost. 🌱',
      ],
      hedef_tamamlandi: ['Mali koraci donose veliki mir. 🍃', 'Neka Allah učini trajnim. 🤲', 'Svaki dan još jedan korak. 🌱'],
      seviye_atlandi: [
        'Svaki dan malo dalje; neka Allah olakša. 🍃',
        'Neka Allah učini trajnim. 🤲',
        'Putovanje se nastavlja. 🌱',
      ],
      toparlanma_tamamlandi: [
        'Nije važno pasti, važno je ustati. 🔄',
        'Neka Allah podari ustrajnost. 🤲',
        'Sa strpljenjem se svaki put pređe. 🌱',
      ],
      en_uzun_seri: [
        'Svaki dan mali korak, a u srcu veliki mir. 🍃',
        'Neka Allah učini trajnim. 🤲',
        'Neka Gospodar svima nama podari ustrajnost. 🌱',
      ],
    },
  },
};
