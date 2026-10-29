import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'Telefonda',
    telefonAciklama: 'Sübh siqnalı və təhəccüd oyatması telefonunuzda çalır.',
    saatBaslik: 'Saatda, səssizcə',
    saatAciklama:
      'Yalnız biləyiniz titrəyir, yanınızda yatan oyanmır. Saatda söndürməsəniz, telefonunuz {dk} dəqiqə sonra ehtiyat olaraq çalır. Saatınızda Namaz Akışı yoxdursa və ya yenilənməyibsə, telefonunuz hər səhər {dk} dəqiqə gec çalır.',
    saatAciklamaIos:
      'Yalnız biləyiniz titrəyir, yanınızda yatan oyanmır. Saatda söndürməsəniz, iPhone-unuz {dk} dəqiqə sonra ehtiyat olaraq çalır.',
    ikisiBaslik: 'Hər ikisində',
    ikisiAciklama: 'Saat və telefon eyni anda çalır; saatda söndürmək telefonu da susdurur.',
    ikisiAciklamaIos: 'Saat və iPhone eyni anda çalır; saatda söndürmək iPhone-u da susdurur.',
  },
  anons: {
    otomatikBaslik: 'Telefonda, uzaqdadırsa saatda',
    otomatikAciklama:
      'Telefonunuz yanınızda olanda oxumanı telefonunuz edir, saatınız qəsdən danışmır (iki cihaz eyni cümləni oxumasın). Telefonunuz uzaqda olanda oxumanı saatınız edir.',
    saatBaslik: 'Yalnız saatda',
    saatAciklama:
      'Səsli oxumanı həmişə saatınız edir, telefonunuz danışmır. Saatınız şarj olunarkən, telefonunuzla əlaqəsi olmayanda və ya saatda Namaz Akışı olmadıqda oxuma heç eşidilmir; bunu istəmirsinizsə, birinci seçimdən istifadə edin.',
    telefonBaslik: 'Yalnız telefonda',
    telefonAciklama: 'Saatınız heç danışmır.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Apple Watch-unuzda Namaz Akışı quraşdırılıbsa, iPhone-unuzla işləri bölüşür. Burada oyatmanın harada çalacağını seçirsiniz.',
    giris:
      'Saatınızda Namaz Akışı quraşdırılıbsa, telefonunuzla işləri bölüşür. Burada oyatmanın və səsli elanın harada eşidiləcəyini seçirsiniz.',
    uyandirmaBaslik: 'Oyatma harada çalsın?',
    uyandirmaNotu:
      'Oyatma "Vaxt çıxmazdan əvvəl" xatırlatmasında sübh vaxtı üçün açdığınız həqiqi siqnal və Nafilə namazlar bölməsində açdığınız təhəccüd oyatmasıdır.',
    uyandirmaNotuIos:
      'watchOS səssiz siqnalı yalnız saat tətbiqi açıq olanda qura bilər: saatınızda Namaz Akışı tətbiqini gündə bir dəfə açın, növbəti oyatma həmin an qurulur. Saat şarj olunarkən və ya tətbiq açılmayıbsa, iPhone-unuzun ehtiyat siqnalı çalır.',
    uyandirmaNotuAndroid: 'Saatınız şarj olunarkən çalmır; o zaman telefonunuz çalır.',
    muhafizAyarlari: '"Vaxt çıxmazdan əvvəl" parametrlərini açın',
    nafileAyarlari: 'Nafilə namaz parametrlərini açın',
    bilektenBaslik: 'Biləkdən edə biləcəkləriniz',
    bilektenIos: [
      'iPhone uzaqda olanda xatırlatmalar saatınızda çalır; ikisi birdən çalmır.',
      'Qıldığınız namazı biləkdən qeyd edirsiniz; iPhone qeydi alır.',
      'Təsbihatı Digital Crown ilə sayır, qibləni saatınızda tapırsınız.',
    ],
    anonsBaslik: 'Səsli oxuma harada olsun?',
    anonsNotu:
      'Yalnız səsli elanı açıq olan xatırlatmalar oxunur. İki cihaz eyni cümləni birlikdə oxumur. Məsciddə olanda və ya Namaz rejimi açıq olanda saatınız da danışmır. Saatınızda dinamik, mətn oxuma mühərriki və ya tətbiqin dilində səs yoxdursa, saat yalnız titrəyir. Saatın səsini Namaz Akışı saat tətbiqindəki "Səsi yoxlayın" ilə dərhal yoxlaya bilərsiniz.',
    bilekten: [
      'Namaz rejimini saatdakı düymə ilə aça və bağlaya bilərsiniz (vaxtın sonuna qədər, ən çox 30 dəqiqə).',
      'Məsciddə olanda saatınız vəziyyəti göstərir; "Bura məscid deyil" və "Məsciddəsiniz?" sualına biləkdən cavab verirsiniz.',
      'Saata sığmayan ekranları (Qəza dəftəri, Məsciddəyəm, parametrlər) "Telefonda açın" ilə telefonunuzda açırsınız.',
    ],
    namazModuNotu: 'Namaz rejimini saatdan aça bilmək üçün əvvəlcə telefonunuzda bir dəfə açmalısınız.',
    namazModuAyarlari: 'Namaz rejimi parametrlərini açın',
  },
  sayfa: {
    akilliSaat: 'Ağıllı saat',
    appleWatchOzet: 'Oyatma harada çalsın',
    saatOzet: 'Oyatma və səsli oxuma harada',
    canliEtkinlikler: 'Canlı fəaliyyətlər',
    canliSayaclar: 'Canlı sayğaclar',
    geriSayim: 'Geri sayım',
    gelismisErisim: 'Əlavə. Avtomatlaşdırmalar və Qıldım qeyd edən tətbiqlər',
    gelismis: 'Əlavə',
    otomasyonlar: 'Avtomatlaşdırmalar',
    otomasyonBaslik: 'Avtomatlaşdırmalarla istifadə edin',
    otomasyonOzet: 'Samsung Routines, Tasker, MacroDroid',
    kildimBaslik: 'Qıldım qeyd edən tətbiqlər',
    kildimOzet: 'İcazə verdiyiniz tətbiqlər',
  },
};
