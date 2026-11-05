import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'Na telefone',
    telefonAciklama: 'Alarme ya Fajr mpe kolamusa mpɔ na Tahajjud ebɛtaka na telefone na bino.',
    saatBaslik: 'Na montre, na kimia',
    saatAciklama:
      'Kaka loboko na bino nde eningani, yango wana moto oyo alali pembeni na bino alamuki te. Soki bokangi yango te na montre, telefone na bino ekobɛta lokola lisungi nsima ya miniti {dk}. Soki Namaz Akışı ezali te na montre na bino to ezali ya sika te, telefone na bino ekobɛta na retare ya miniti {dk} ntɔngɔ nyɔnsɔ.',
    saatAciklamaIos:
      'Kaka loboko na bino nde eningani, yango wana moto oyo alali pembeni na bino alamuki te. Soki bokangi yango te na montre, iPhone na bino ekobɛta lokola lisungi nsima ya miniti {dk}.',
    ikisiBaslik: 'Na nyɔnsɔ mibale',
    ikisiAciklama: 'Montre mpe telefone ebɛtaka elongo; kokanga yango na montre ekangaka mpe telefone.',
    ikisiAciklamaIos: 'Montre mpe iPhone ebɛtaka elongo; kokanga yango na montre ekangaka mpe iPhone.',
  },
  anons: {
    otomatikBaslik: 'Na telefone, na montre soki telefone ezali mosika',
    otomatikAciklama:
      'Soki telefone ezali na bino, telefone nde etangaka na mongongo mpe montre efandaka nyɛɛ na mokano (mpɔ ete bisaleli mibale etanga te maloba mɔkɔ). Soki telefone ezali mosika, montre nde etangaka na mongongo.',
    saatBaslik: 'Kaka na montre',
    saatAciklama:
      'Montre na bino etangaka ntango nyɔnsɔ na mongongo mpe telefone efandaka nyɛɛ. Ntango montre ezali kozwa kura, ekangami te na telefone to ezali na Namaz Akışı te, elɔkɔ mɔkɔ te etangami na mongongo; soki bolingi yango te, bosalela boponi ya liboso.',
    telefonBaslik: 'Kaka na telefone',
    telefonAciklama: 'Montre na bino elobaka soki moke te.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Soki Namaz Akışı etiami na Apple Watch na bino, ekabolaka mosala na iPhone na bino. Awa bopona esika oyo kolamusa ekobɛta.',
    giris:
      'Soki Namaz Akışı etiami na montre na bino, ekabolaka mosala na telefone na bino. Awa bopona esika oyo kolamusa ekobɛta mpe esika oyo mayebisi ekotangama na mongongo.',
    uyandirmaBaslik: 'Kolamusa ebɛta wapi?',
    uyandirmaNotu:
      'Kolamusa ezali alarme ya solo oyo bofungolaka mpɔ na Fajr na bokundoli "Liboso ntango esila" mpe kolamusa mpɔ na Tahajjud oyo bofungolaka na Losambo ya suna.',
    uyandirmaNotuIos:
      'watchOS ekoki kotia alarme ya kimia kaka ntango aplikasiɔ ya montre efungwami: bofungola Namaz Akışı na montre na bino mbala mɔkɔ na mokɔlɔ mpe kolamusa oyo elandi ekotiama na ntango wana. Ntango montre ezali kozwa kura to soki aplikasiɔ efungwamaki te, lisungi ya iPhone na bino nde ekobɛta.',
    uyandirmaNotuAndroid: 'Montre na bino ebɛtaka te ntango ezali kozwa kura; telefone na bino nde ebɛtaka.',
    muhafizAyarlari: 'Bofungola mibongiseli ya "Liboso ntango esila"',
    nafileAyarlari: 'Bofungola mibongiseli ya Losambo ya suna',
    bilektenBaslik: 'Oyo bokoki kosala na loboko',
    bilektenIos: [
      'Ntango iPhone na bino ezali mosika, bokundoli ebɛtaka na montre na bino; ebɛtaka te na nyɔnsɔ mibale.',
      'Botiaka elembo na losambo oyo bosambeli na loboko na bino; iPhone na bino ebombaka yango.',
      'Botangaka tasbih na Digital Crown mpe boyebaka Qibla na montre na bino.',
    ],
    anonsBaslik: 'Kotanga na mongongo esalema wapi?',
    anonsNotu:
      'Kaka bokundoli oyo kotanga na mongongo efungwami nde etangamaka. Bisaleli mibale etangaka te maloba mɔkɔ elongo. Montre na bino efandaka mpe nyɛɛ ntango bozali na moskeye to soki Ndɛngɛ ya losambo efungwami. Soki montre na bino ezali na mongongo te, na motuka ya kotanga maloba te to na mongongo ya lokota ya aplikasiɔ te, eningani kaka. Bokoki komeka lokito ya montre noki na "Bomeka lokito" na aplikasiɔ ya montre Namaz Akışı.',
    bilekten: [
      'Bokoki kofungola mpe kokanga Ndɛngɛ ya losambo na butɔ ya montre (tii suka ya ntango ya losambo, miniti 30 koleka te).',
      'Na moskeye, montre na bino elakisaka ezalela; boyanolaka "Oyo ezali moskeye te" mpe "Bozali na moskeye?" na loboko na bino.',
      'Bilili oyo ekoki na montre te (Buku ya qada, Nazali na moskeye, mibongiseli) efungwamaka na telefone na bino na "Bofungola na telefone".',
    ],
    namazModuNotu: 'Mpɔ na kofungola Ndɛngɛ ya losambo na montre, bofungola yango liboso mbala mɔkɔ na telefone na bino.',
    namazModuAyarlari: 'Bofungola mibongiseli ya Ndɛngɛ ya losambo',
  },
  sayfa: {
    akilliSaat: 'Montre ya mayele',
    appleWatchOzet: 'Esika kolamusa ebɛtaka',
    saatOzet: 'Esika kolamusa ebɛtaka mpe etangaka na mongongo',
    canliEtkinlikler: 'Live Activities',
    canliSayaclar: 'Kotanga ntango na mbalakaka',
    geriSayim: 'Kotanga ntango',
    gelismisErisim: 'Mosusu koleka. Automation mpe ba aplikasiɔ oyo etiaka elembo "Nasambeli"',
    gelismis: 'Mosusu koleka',
    otomasyonlar: 'Automation',
    otomasyonBaslik: 'Kosalela na automation',
    otomasyonOzet: 'Samsung Routines, Tasker, MacroDroid',
    kildimBaslik: 'Ba aplikasiɔ oyo etiaka elembo "Nasambeli"',
    kildimOzet: 'Ba aplikasiɔ oyo bopesi ndingisa',
  },
};
