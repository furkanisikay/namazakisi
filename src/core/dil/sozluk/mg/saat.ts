import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: "Amin'ny finday",
    telefonAciklama: 'Maneno amin\'ny findainao ny fanairana Fajr sy ny fanairana Tahadjoud.',
    saatBaslik: "Amin'ny famantaranandro, mangina",
    saatAciklama:
      "Ny tananao ihany no mihetsiketsika, ka tsy mifoha izay matory eo akaikinao. Raha tsy vonoinao eo amin'ny famantaranandro, dia maneno ho fiarovana ny findainao {dk} minitra aty aoriana. Raha tsy ao amin'ny famantaranandronao ny Namaz Akışı na tsy nohavaozina, dia maneno tara {dk} minitra isa-maraina ny findainao.",
    saatAciklamaIos:
      "Ny tananao ihany no mihetsiketsika, ka tsy mifoha izay matory eo akaikinao. Raha tsy vonoinao eo amin'ny famantaranandro, dia maneno ho fiarovana ny iPhone-nao {dk} minitra aty aoriana.",
    ikisiBaslik: "Amin'izy roa",
    ikisiAciklama: "Miara-maneno ny famantaranandro sy ny finday; ny famonoana eo amin'ny famantaranandro dia mampangina ny finday koa.",
    ikisiAciklamaIos: "Miara-maneno ny famantaranandro sy ny iPhone; ny famonoana eo amin'ny famantaranandro dia mampangina ny iPhone koa.",
  },
  anons: {
    otomatikBaslik: "Amin'ny finday, amin'ny famantaranandro rehefa lavitra ny finday",
    otomatikAciklama:
      'Rehefa miaraka aminao ny findainao, ny findainao no mamaky mafy ary mangina nahy ny famantaranandronao (mba tsy hamakian\'ny fitaovana roa ny fehezanteny mitovy). Rehefa lavitra ny findainao, ny famantaranandronao no mamaky mafy.',
    saatBaslik: "Amin'ny famantaranandro ihany",
    saatAciklama:
      'Mamaky mafy foana ny famantaranandronao ary mangina ny findainao. Raha mbola sarihina ny famantaranandronao, tsy mifandray amin\'ny findainao na tsy misy Namaz Akışı, dia tsy misy vakiana mafy; raha tsy tianao izany, ampiasao ny safidy voalohany.',
    telefonBaslik: "Amin'ny finday ihany",
    telefonAciklama: 'Tsy miteny mihitsy ny famantaranandronao.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      "Raha voapetraka ao amin'ny Apple Watch-nao ny Namaz Akışı, dia mizara ny asa amin'ny iPhone-nao izy. Eto no hifidiananao izay haneno ny fanairana.",
    giris:
      "Raha voapetraka ao amin'ny famantaranandronao ny Namaz Akışı, dia mizara ny asa amin'ny findainao izy. Eto no hifidiananao izay haneno ny fanairana sy izay hamakiana mafy ny filazana.",
    uyandirmaBaslik: 'Aiza no tokony haneno ny fanairana?',
    uyandirmaNotu:
      "Ny fanairana dia ny fanairana tena izy alefanao ho an'ny Fajr ao amin'ny fampahatsiahivana « Alohan'ny hifaranan'ny fotoana » sy ny fanairana Tahadjoud alefanao ao amin'ny Soalat fanampiny.",
    uyandirmaNotuIos:
      "Tsy afaka mametraka fanairana mangina ny watchOS raha tsy misokatra ny fampiharana ao amin'ny famantaranandro: sokafy indray mandeha isan'andro ao amin'ny famantaranandronao ny Namaz Akışı dia voapetraka amin'izay ny fanairana manaraka. Raha sarihina ny famantaranandro na tsy nosokafana ny fampiharana, dia maneno ny fiarovana ao amin'ny iPhone-nao.",
    uyandirmaNotuAndroid: 'Tsy maneno ny famantaranandronao raha sarihina; ny findainao no maneno ho solony.',
    muhafizAyarlari: "Sokafy ny fikirana « Alohan'ny hifaranan'ny fotoana »",
    nafileAyarlari: 'Sokafy ny fikirana Soalat fanampiny',
    bilektenBaslik: "Izay azonao atao amin'ny tananao",
    bilektenIos: [
      "Rehefa lavitra ny iPhone-nao, maneno eo amin'ny famantaranandronao ny fampahatsiahivana; tsy maneno amin'izy roa izy.",
      "Marihinao eo amin'ny tananao ny soalat vitanao; raketin'ny iPhone-nao izany.",
      "Manisa tasbih amin'ny Digital Crown ianao ary mahita ny Kibla eo amin'ny famantaranandronao.",
    ],
    anonsBaslik: 'Aiza no tokony hamakiana mafy?',
    anonsNotu:
      "Ny fampahatsiahivana nalefa ny famakiana mafy ihany no vakiana. Tsy miara-mamaky fehezanteny mitovy ny fitaovana roa. Mangina koa ny famantaranandronao raha ao amin'ny moske ianao na mandeha ny Fomba soalat. Raha tsy manana fanamafisam-peo, motera famakiana soratra na feo amin'ny fitenin'ny fampiharana ny famantaranandronao, dia mihetsiketsika fotsiny izy. Azonao andramana avy hatrany ny feon'ny famantaranandro amin'ny « Andramo ny feo » ao amin'ny fampiharana Namaz Akışı amin'ny famantaranandro.",
    bilekten: [
      "Azonao alefa sy vonoina amin'ny bokotra eo amin'ny famantaranandro ny Fomba soalat (hatramin'ny fiafaran'ny fotoanan'ny soalat, 30 minitra farafahabetsany).",
      "Ao amin'ny moske, asehon'ny famantaranandronao ny toe-javatra; valianao eo amin'ny tananao ny « Tsy moske ity » sy ny « Ao amin'ny moske ve ianao? ».",
      "Ireo efijery tsy omby eo amin'ny famantaranandro (Bokin'ny fanefana, Ao amin'ny moske, fikirana) dia misokatra ao amin'ny findainao amin'ny « Sokafy amin'ny finday ».",
    ],
    namazModuNotu: "Mba handefasana ny Fomba soalat avy amin'ny famantaranandro, alefaso indray mandeha aloha ao amin'ny findainao izy.",
    namazModuAyarlari: 'Sokafy ny fikirana Fomba soalat',
  },
  sayfa: {
    akilliSaat: 'Famantaranandro marani-tsaina',
    appleWatchOzet: "Izay hanenoan'ny fanairana",
    saatOzet: "Izay hanenoan'ny fanairana sy hamakiana mafy",
    canliEtkinlikler: 'Hetsika mivantana',
    canliSayaclar: 'Fanisana mihemotra mivantana',
    geriSayim: 'Fanisana mihemotra',
    gelismisErisim: 'Mandroso. Asa mandeha ho azy sy fampiharana manamarika ny « Nivavaka aho »',
    gelismis: 'Mandroso',
    otomasyonlar: 'Asa mandeha ho azy',
    otomasyonBaslik: "Ampiasao amin'ny asa mandeha ho azy",
    otomasyonOzet: 'Samsung Routines, Tasker, MacroDroid',
    kildimBaslik: 'Fampiharana manamarika ny « Nivavaka aho »',
    kildimOzet: 'Fampiharana nomenao alalana',
  },
};
