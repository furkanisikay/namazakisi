import type { Sozluk } from '../tr';

/** Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'Henefî', safii: 'Şafiî' },
  kaynaklar: {
    vatan: 'Welat, cihê rûniştinê û mana demkî di warê rêwîtiyê de (bi Tirkî)',
    cem: 'Gelo nimêj dikarin bên kombûnkirin (cem)? (bi Tirkî)',
    baslangic: 'Rêwîtî kengî dest pê dike? (bi Tirkî)',
    ziyaret: 'Gelo kesê ku diçe bajarê dê û bavê xwe rêwî ye? (bi Tirkî)',
  },
  bilgiNotu:
    'Ev agahî ye, ne fetwa. Ka hûn wekî rêwî têne hesibandin an na, bi armanc û dirêjahiya rêwîtiya we û bi niyeta we ve girêdayî ye.',
  baslik: 'Wisa xuya dike ku hûn di rêwîtiyê de ne',
  mesafeSatiri: 'Hûn bi xêza rast nêzîkî {km} km ji cihê rûniştina xwe dûr in. Tiştên ku Diyanet ji bo mezheba {mezhep} radigihîne:',
  maddeler: {
    hanefi: [
      'Di mezheba Henefî de dûrahiya rêwîtiyê (sefer) nêzîkî 90 km ye. Kesê ku niyeta wî ew e ku li cihê ku diçê kêmtir ji 15 rojan bimîne, rêwî tê hesibandin.',
      'Rêwî nimêjên ferz ên çar riketî wekî du riketan dike (qesr).',
      'Di mezheba Henefî de kombûnkirina du nimêjan (cem) tenê di Hecê de, li Erefat û Muzdelîfeyê ye. Diyanet herwiha destnîşan dike ku di uzrên giran ên wekî rêwîtiyê de mirov dikare li dû nêrîna mezhebên din biçe.',
    ],
    safii: [
      'Di mezheba Şafiî de jî dûrahiya rêwîtiyê nêzîkî 90 km ye. Heke mana li cihê ku diçê, bêyî rojên hatin û çûnê, kêmtir ji 4 rojan be, hukmên rêwîtiyê didomin.',
      'Rêwî nimêjên ferz ên çar riketî wekî du riketan dike (qesr).',
      'Di mezheba Şafiî de rêwîtî ji bo kombûnkirina (cem) Nîvro bi Esirê re û Êvarê bi Eşayê re uzreke derbasdar e.',
    ],
  },
  ozetAcik: 'Vekirî · {mezhep}',
  ozetKapali: 'Girtî',
  baglantiAcilamadi: 'Girêdan nehate vekirin. Girêdana înternetê ya xwe kontrol bikin.',
  ikametGuncellendi: 'Cihê rûniştina we hate nûkirin',
  ikametKaydedilemedi: 'Cihê rûniştina we nehate tomarkirin',
  kartiKapatin: 'Karta rêwîtiyê bigirin',
  burasiEvimErisim: 'Mala min li vir e, wekî cihê rûniştina min tomar bikin',
  burasiEvim: 'Mala min ev e',
  diyanetteOkuyunErisim: 'Fetwaya Diyanetê di gerokê de bixwînin',
  diyanetteOkuyun: 'Li Diyanetê bixwînin',
  sayfa: {
    kayitliKonum: 'Cihê tomarkirî',
    henuzKaydedilmedi: 'Hîn nehatiye tomarkirin — cihê we yê yekem wekî cihê rûniştina we tê hesibandin',
    buradasiniz: 'Hûn niha li vir in',
    uzaktasiniz: 'Hûn niha bi xêza rast nêzîkî {km} km dûr in',
    konumBilinmiyor: 'Cihê we hîn nayê zanîn; pêşî cihekî hilbijêrin',
    giris:
      'Gava hûn nêzîkî {km} km ji cihê rûniştina xwe dûr bin, li ser dîmena sereke karteke agahiyê ya kurt xuya dibe ku fetwayên Diyanetê kurt dike. Kart her rêwîtiyê carekê xuya dibe û agahdarî naşîne.',
    bilgiKarti: 'Karta agahiyê',
    kartBaslik: 'Karta agahiyên rêwîtiyê',
    gosterilir: 'Li ser dîmena sereke tê nîşandan',
    gosterilmez: 'Nayê nîşandan',
    mezhepNotu: 'Kart li dû mezheba we diçe; hûn dikarin wê di Mîheng › Demên nimêjê de hilbijêrin.',
    ikametYeri: 'Cihê rûniştinê',
    ikametYapErisim: 'Cihê xwe yê niha wekî cihê rûniştina xwe tomar bikin',
    ikametYap: 'Cihê niha bikin cihê rûniştinê',
    kaynaklar: 'Çavkanî (Desteya Bilind a Karên Olî ya Diyanetê)',
    kaynakErisim: '{etiket}. Di gerokê de vedibe',
    /** Türkçe dışında gösterilmez (yalnız Türkiye hizmeti). */
    fetvaHatti: 'Ji bo pirsan, hûn dikarin li xeta fetwayê ya Diyanetê 190 bigerin.',
  },
};
