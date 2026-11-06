import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Ɓeydoral',
  kilma: {
    baslik: 'Tolno juulde',
    haftalik: 'Yontere',
    aylik: 'Lewru',
    donemErisim: 'Sahaa tolno juulde',
    hesaplaniyor: 'Tolno juulde mon hino hiisee',
    bosBaslik: 'Alaa winndannde haa jooni',
    bosAciklama: 'Ɓanngoto ɗoo so on maandinii juulɗe mon.',
    yuzde: '{n}%',
    kilinan: 'Juulaaɗe',
    oran: 'Tolno',
    enIyiGun: 'Ñalawma ɓurɗo',
    haftaHedefi: 'Faandaare yontere ndee',
    hedefAlt: cogul({ one: 'Rewrude e faandaare jokkondiral mon: {n} juulde ñalawma kala', other: 'Rewrude e faandaare jokkondiral mon: {n} juulɗe ñalawma kala' }),
    kilinanNamaz: 'Juulɗe juulaaɗe',
    hedefeUlasan: 'Ñalɗe faandaare hewtaa',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Ñalɗe juulaaɗe',
    vakitVakit: 'Juulde kala',
    yuzdeErisim: '{ad}: {n} e teemedere',
  },
  rozetler: {
    baslik: 'Daraja e maanɗe',
    seviye: 'Daraja {n}',
    puan: 'Poenji',
    kalanErisim: cogul({ one: '{n} poen haa daraja {rank}', other: '{n} poenji haa daraja {rank}' }),
    enYuksek: 'On ngoni e daraja ɓurnde toowde',
    kalan: cogul({ one: '{n} poen haa {rank}', other: '{n} poenji haa {rank}' }),
    kilinanErisim: cogul({ one: '{n} juulde juulaama', other: '{n} juulɗe juulaama' }),
    namaz: cogul({ one: 'juulde', other: 'juulɗe' }),
    rozetErisim: '{n} maanɗe e {toplam} heɓaama',
    rozet: cogul({ one: 'maande', other: 'maanɗe' }),
  },
};
