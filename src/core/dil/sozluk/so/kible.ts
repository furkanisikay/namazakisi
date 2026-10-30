import type { Sozluk } from '../tr';

export const kible: Sozluk['kible'] = {
  baslik: 'Qibla',
  yon: {
    hizali: 'Waxaad u jeeddaa Qiblada',
    arkada: 'Qibladu waa gadaashaada, soo jeeso',
    sagda: 'Qibladu waa {derece}° dhanka midigtaada',
    solda: 'Qibladu waa {derece}° dhanka bidixdaada',
  },
  harf: { kuzey: 'W', dogu: 'B', guney: 'K', bati: 'G' },
  sekme: {
    pusula: 'Jiheeye',
    pusulaErisim: 'Qaabka jiheeyaha',
    pusulaAciklama: 'Marka calaamadda Kacbadu gaarto godka sare, waxaad u jeeddaa Qiblada.',
    kamera: 'Kamarad',
    kameraErisim: 'Qaabka kamaradda',
    kameraAciklama: 'Taleefanka si toos ah u qabo; calaamadda Kacbadu waxay ka muuqanaysaa jihada Qiblada.',
  },
  sayfa: {
    baslatiliyor: 'Jiheeyaha waa la bilaabayaa…',
    izinKapali: 'Oggolaanshaha goobta waa dansan yahay; goobtaada ayaa loo baahan yahay si jihada loo helo.',
  },
  hata: {
    izinGerekli: 'Oggolaanshaha goobta ayaa loo baahan yahay si jihada Qiblada loo helo.',
    konumServisi: 'Adeegyada goobta lama gaari karo. Hubi dejinta goobta ee qalabkaaga.',
    baslatilamadi: 'Adeegga Qiblada lama bilaabi karin.',
  },
  pusula: {
    ufuk: 'jiifka',
    konumAliniyor: 'Goobtaada waa la helayaa…',
    hazirlaniyor: 'Jiheeyaha waa la diyaarinayaa…',
    kuzeydenAci: 'Qibladu waa {derece}° waqooyiga',
    kabeUzakta: 'Kacbadu waxay u jirtaa {mesafe}',
    kuzeydenSaatYonu: 'Jihada saacadda laga bilaabo waqooyiga',
    kuzeyden: '{derece}° waqooyiga',
    kabeUzaktaKuzeyden: 'Kacbadu waxay u jirtaa {mesafe}, {derece}° waqooyiga',
    pusulaErisim: 'Jiheeyaha Qiblada. {cumle}',
    pusulaYok: 'Qalabkani jiheeye ma laha; waxaan muujinaynaa jihada marka loo eego waqooyiga.',
    kayiyorsa: 'Haddii jihadu leexato, taleefankaaga hawada ugu dhaqaaji qaabka lambarka 8.',
    kamerayla: 'Ku eeg kamaradda',
  },
  kamera: {
    pusulayiKullanin: 'Isticmaal jiheeyaha',
    kullanilamiyorBaslik: 'Muuqaalka kamaradda laguma heli karo taleefankan',
    kullanilamiyorMetin:
      'Dareemayaasha taleefankaagu ma bixiyaan jiho la isku halleyn karo marka si toos ah loo qabto. Jiheeyuhu weli si sax ah ayuu jihada u muujinayaa.',
    izinBaslik: 'Ku arag Qiblada kamaraddaada',
    izinMetin:
      'Taleefankaaga si toos ah u qabo oo hareerahaaga eeg; calaamadda Kacbadu waxay ka muuqanaysaa jihada Qiblada. Tani waxay u baahan tahay oggolaanshaha kamaradda; sawirka lama duubo mana ka baxo taleefankaaga.',
    kamerayiAcin: 'Shid kamaradda',
    izinKapaliBaslik: 'Oggolaanshaha kamaradda waa dansan yahay',
    izinKapaliMetin: 'Waxaad ka oggolaan kartaa gelitaanka kamaradda Dejinta si aad u hesho muuqaalka kamaradda. Jiheeyuhu la\'aanteed wuu shaqeeyaa.',
    ayarlariAcin: 'Fur Dejinta',
    acilamadiBaslik: 'Kamaradda lama furi karin',
    acilamadiMetin: 'Kamaradda hadda lama heli karo. Waxaad Qiblada ku heli kartaa jiheeyaha.',
    hesaplaniyor: 'Jihada waa la raadinayaa…',
    dikTutun: 'Taleefankaaga si toos ah u qabo',
  },
  kalibrasyon: {
    tesekkurErisim: 'Mahadsanid, jihadu hadda way ka saxsan tahay',
    tesekkur: 'Mahadsanid, jihadu hadda way ka saxsan tahay ✓',
    baslik: 'Hagaaji jiheeyaha',
    sallayin: 'Taleefankaaga hawada ugu dhaqaaji qaabka lambarka 8.',
    metal: 'Ka fogow walxaha birta ah iyo galalka birlabka leh.',
    dogruluk: 'Saxnaanta',
    simdiDegil: 'Hadda maya',
  },
};
