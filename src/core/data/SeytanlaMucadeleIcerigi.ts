export interface MucadeleIcerigi {
    id: string;
    metin: string;
    kaynak?: string; // Hadis kaynağı veya Ayet no
    siddetSeviyesi: 1 | 2 | 3; // 1: Hafif, 2: Orta, 3: Sert (Münafık hadisleri vb.)
}

export const SEYTANLA_MUCADELE_ICERIGI: MucadeleIcerigi[] = [
    // Seviye 1: Teşvik edici
    {
        id: 't1',
        metin: 'Namaz, müminin miracıdır. Rabbin seni bekliyor.',
        siddetSeviyesi: 1
    },
    {
        id: 't2',
        metin: 'Secde et ve yaklaş. (Alak Suresi, 19)',
        kaynak: 'Kuran-ı Kerim',
        siddetSeviyesi: 1
    },

    // Seviye 2: Uyarıcı
    {
        id: 'u1',
        metin: 'Namazı kasten terk eden kimse, Allah\'ın korumasından uzaklaşır.',
        kaynak: 'Hadis-i Şerif',
        siddetSeviyesi: 2
    },
    {
        id: 'u2',
        metin: 'Vakit geçiyor, ömür bitiyor. Bu namaz son namazın olabilir.',
        siddetSeviyesi: 2
    },

    // Seviye 3: Sert (Son 15 dk)
    {
        id: 's1',
        metin: 'Münafıklara en ağır gelen namaz yatsı ve sabah namazıdır. Onlardaki sevabı bilselerdi emekleyerek de olsa gelirlerdi.',
        kaynak: 'Buhari, Ezan 34',
        siddetSeviyesi: 3
    },
    {
        id: 's2',
        metin: 'Kişi ile şirk ve küfür arasında namazı terk etmek vardır.',
        kaynak: 'Müslim, İman 134',
        siddetSeviyesi: 3
    },
    {
        id: 's3',
        metin: 'Namazı zayi ettiler ve şehvetlerine uydular. Onlar Gayya kuyusunu boylayacaklardır.',
        kaynak: 'Meryem Suresi, 59',
        siddetSeviyesi: 3
    },
    {
        id: 's4',
        metin: 'Şeytan şu an sana "Sonra kılarsın" diye fısıldıyor. Onu dinleme!',
        siddetSeviyesi: 3
    }
];
