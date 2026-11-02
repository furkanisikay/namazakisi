import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'Li ser telefonê',
    telefonAciklama: 'Alarma Sibê û şiyarkirina Teheccudê li ser telefona we lê didin.',
    saatBaslik: 'Li ser saetê, bêdeng',
    saatAciklama:
      'Tenê zenda we dilerize, ji ber vê kesê ku li tenişta we radizê şiyar nabe. Heke hûn wê li ser saetê negirin, telefona we wekî piştgir piştî {dk} deqîqeyan lê dide. Heke Namaz Akışı li ser saeta we tune be an ne nûkirî be, telefona we her sibe {dk} deqîqe dereng lê dide.',
    saatAciklamaIos:
      'Tenê zenda we dilerize, ji ber vê kesê ku li tenişta we radizê şiyar nabe. Heke hûn wê li ser saetê negirin, iPhone a we wekî piştgir piştî {dk} deqîqeyan lê dide.',
    ikisiBaslik: 'Li ser herduyan',
    ikisiAciklama: 'Saet û telefon bi hev re lê didin; girtina wê li ser saetê telefonê jî bêdeng dike.',
    ikisiAciklamaIos: 'Saet û iPhone bi hev re lê didin; girtina wê li ser saetê iPhone jî bêdeng dike.',
  },
  anons: {
    otomatikBaslik: 'Li ser telefonê, gava dûr be li ser saetê',
    otomatikAciklama:
      'Gava telefona we bi we re be, telefona we bi deng dixwîne û saeta we bi zanebûn bêdeng dimîne (da ku her du cîhaz heman hevokê nexwînin). Gava telefona we dûr be, saeta we bi deng dixwîne.',
    saatBaslik: 'Tenê li ser saetê',
    saatAciklama:
      'Saeta we her dem bi deng dixwîne û telefona we bêdeng dimîne. Dema ku saeta we tê barkirin, bi telefona we ve ne girêdayî ye an Namaz Akışı li ser tune be, tiştek bi deng nayê xwendin; heke hûn vê naxwazin, vebijarka yekem bi kar bînin.',
    telefonBaslik: 'Tenê li ser telefonê',
    telefonAciklama: 'Saeta we qet naaxive.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Heke Namaz Akışı li ser Apple Watch a we sazkirî be, ew kar bi iPhone a we re parve dike. Li vir hûn hilbijêrin ka şiyarkirin li ku lê bide.',
    giris:
      'Heke Namaz Akışı li ser saeta we sazkirî be, ew kar bi telefona we re parve dike. Li vir hûn hilbijêrin ka şiyarkirin li ku lê bide û daxuyanî li ku bi deng bên xwendin.',
    uyandirmaBaslik: 'Şiyarkirin li ku lê bide?',
    uyandirmaNotu:
      'Şiyarkirin ew alarma rastîn e ku hûn ji bo Sibê di bîranîna “Berî ku dem biqede” de vedikin, û şiyarkirina Teheccudê ye ku hûn di Nimêjên nafile de vedikin.',
    uyandirmaNotuIos:
      'watchOS tenê dema ku sepana saetê vekirî be dikare alarmeke bêdeng saz bike: rojê carekê Namaz Akışı li ser saeta xwe vekin û şiyarkirina din wê demê tê sazkirin. Dema ku saet tê barkirin an sepan nehatibe vekirin, piştgira iPhone a we lê dide.',
    uyandirmaNotuAndroid: 'Dema ku saeta we tê barkirin lê nade; li şûna wê telefona we lê dide.',
    muhafizAyarlari: 'Mîhengên “Berî ku dem biqede” vekin',
    nafileAyarlari: 'Mîhengên nimêjên nafile vekin',
    bilektenBaslik: 'Tiştên ku hûn dikarin ji zenda xwe bikin',
    bilektenIos: [
      'Gava iPhone a we dûr be, bîranîn li ser saeta we lê didin; li ser herduyan lê nadin.',
      'Hûn nimêjên ku we kirine ji zenda xwe nîşan dikin; iPhone a we wan tomar dike.',
      'Hûn bi Digital Crown tesbîhê dijmêrin û Qibleyê li ser saeta xwe dibînin.',
    ],
    anonsBaslik: 'Bi deng xwendin li ku bibe?',
    anonsNotu:
      'Tenê bîranînên ku bi deng xwendina wan vekirî ye têne xwendin. Her du cîhaz heman hevokê bi hev re naxwînin. Dema ku hûn li mizgeftê ne an moda nimêjê vekirî ye, saeta we jî bêdeng dimîne. Heke di saeta we de hoparlor, motora axaftinê an dengekî bi zimanê sepanê tune be, ew tenê dilerize. Hûn dikarin dengê saetê bi “Dengê biceribînin” di sepana saetê ya Namaz Akışı de yekser biceribînin.',
    bilekten: [
      'Hûn dikarin moda nimêjê bi bişkoka li ser saetê vekin û bigirin (heta dawiya dema nimêjê, herî zêde 30 deqîqe).',
      'Li mizgeftê saeta we rewşê nîşan dide; hûn bersiva “Ev ne mizgeft e” û “Hûn li mizgeftê ne?” ji zenda xwe didin.',
      'Dîmenên ku li ser saetê cih nagirin (Deftera qezayê, Li mizgeftê, mîheng) bi “Li ser telefonê vekin” li ser telefona we vedibin.',
    ],
    namazModuNotu: 'Ji bo ku hûn moda nimêjê ji saetê vekin, pêşî carekê li ser telefona xwe vekin.',
    namazModuAyarlari: 'Mîhengên moda nimêjê vekin',
  },
  sayfa: {
    akilliSaat: 'Saeta aqilmend',
    appleWatchOzet: 'Şiyarkirin li ku lê dide',
    saatOzet: 'Şiyarkirin li ku lê dide û li ku bi deng dixwîne',
    canliEtkinlikler: 'Çalakiyên zindî',
    canliSayaclar: 'Jimartinên zindî',
    geriSayim: 'Jimartin',
    gelismisErisim: 'Pêşketî. Otomasyon û sepanên ku “Min nimêj kir” nîşan dikin',
    gelismis: 'Pêşketî',
    otomasyonlar: 'Otomasyon',
    otomasyonBaslik: 'Bi otomasyonan re bi kar bînin',
    otomasyonOzet: 'Samsung Routines, Tasker, MacroDroid',
    kildimBaslik: 'Sepanên ku “Min nimêj kir” nîşan dikin',
    kildimOzet: 'Sepanên ku we destûr daye wan',
  },
};
