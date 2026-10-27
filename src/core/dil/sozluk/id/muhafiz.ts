import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı Endonezcede: doğrudan, kısa emir ("tunaikan salat"), gerekirse "Anda";
 * "sujud" eylem olarak YAZILMAZ ("secdeye kapan" yasağının ikizi). Başlıkta süre "mnt":
 * "Dzuhur · 120 mnt" ilk 16 karaktere sığar. "!" yok.
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · {dk} mnt berlalu · waktu salat ⏰',
    giris2: '{ad} · {dk} mnt berlalu · jangan tunda salat ⚠️',
    giris3: '{ad} · {dk} mnt berlalu · salat menanti Anda 🔥',
    giris4: '{ad} · {dk} mnt berlalu · TUNAIKAN SALAT 🚨',
    erken3: '{ad} · {dk} mnt lagi · salat menanti Anda 🔥',
    erken4: '{ad} · {dk} mnt lagi · TUNAIKAN SALAT 🚨',
    cikis1: '{ad} · {dk} mnt lagi ⏰',
    cikis2: '{ad} · {dk} mnt · waktu makin sempit ⚠️',
    cikis3: '{ad} · {dk} mnt · waktu hampir lewat 🔥',
    cikis4: '{ad} · {dk} mnt · WAKTU HAMPIR HABIS 🚨',
  },
  girisHavuzu: {
    s1: ['Waktu salat sudah masuk; tunaikan selagi ada kesempatan.', 'Tunaikan selagi waktu masih lapang, jangan ditunda.'],
    s2: ['Makin ditunda, makin berat; jangan sisakan salat di akhir waktu.', 'Waktu terus berjalan — tunaikan salat sekarang.'],
    s3: [
      'Makin lama ditunda, makin dekat terlewat; tunaikan sekarang.',
      'Jangan berkata "nanti saja"; Anda bisa salat sekarang.',
      'Bangkitlah sekarang, daripada berkata "seandainya" beberapa menit lagi.',
    ],
    s4: ['Jangan tunda salat lebih lama lagi — tunaikan salat sekarang.', 'Tinggalkan yang sedang Anda kerjakan, tunaikan salat.'],
  },
  govde: {
    s1: 'Waktu mulai sempit; tunaikan selagi ada kesempatan.',
    s2: 'Jangan sisakan salat di akhir waktu; sekarang saat yang tepat.',
    s3: 'Waktu hampir habis; Anda masih bisa salat sekarang.',
    s4: 'Jika sudah salat, ketuk "Sudah salat"; jika belum, tunaikan salat sekarang.',
  },
  serit: {
    giris4: 'JANGAN TUNDA SALAT. Tunaikan salat sekarang. ({dk} mnt berlalu)',
    giris2: 'Waktu terus berjalan, jangan sisakan salat di akhir waktu. ({dk} mnt berlalu)',
    giris1: cogul({ other: 'Sudah {n} menit sejak waktu salat masuk.' }),
    erken4: 'Jangan tunda salat, tunaikan sekarang. ({dk} mnt lagi)',
    cikis4: 'WAKTU HAMPIR HABIS. Tunaikan salat sekarang. ({dk} mnt lagi)',
    cikis2: 'Waktu makin sempit, jangan sisakan salat di akhir waktu. ({dk} mnt lagi)',
    cikis1: cogul({ other: '{n} menit lagi waktu salat berakhir.' }),
  },
  geceCapasi: {
    baslik: '{ad} · salat sebelum tidur ⏰',
    govde: 'Jam tenang dimulai {dk} mnt lagi; tunaikan Isya sebelum tidur.',
  },
  icerik: {
    firsat: 'Waktu mulai sempit; tunaikan selagi ada kesempatan.',
    sonaBirakma: 'Jangan sisakan salat di akhir waktu; sekarang saat yang tepat.',
    fisilti: 'Jangan berkata "nanti saja"; waktu hampir habis, Anda bisa salat sekarang.',
    omur: 'Waktu terus berlalu; Anda masih punya kesempatan menunaikan salat ini tepat waktu.',
    keske: 'Bangkitlah sekarang, daripada berkata "seandainya" beberapa menit lagi.',
    namazaDur: 'Jika sudah salat, ketuk "Sudah salat"; jika belum, tunaikan salat sekarang.',
    sonDakika: 'Menit-menit terakhir. Tinggalkan yang sedang Anda kerjakan, tunaikan salat.',
  },
};
