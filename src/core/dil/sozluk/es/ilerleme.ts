import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Progreso',
  kilma: {
    baslik: 'Tasa de rezo',
    haftalik: 'Semana',
    aylik: 'Mes',
    donemErisim: 'Periodo de la tasa de rezo',
    hesaplaniyor: 'Calculando su tasa de rezo',
    bosBaslik: 'Aún no hay registros',
    bosAciklama: 'Aparece aquí a medida que marca sus rezos.',
    yuzde: '{n} %',
    kilinan: 'Rezados',
    oran: 'Tasa',
    enIyiGun: 'Mejor día',
    haftaHedefi: 'Objetivo de la semana',
    hedefAlt: cogul({
      one: 'Según su objetivo de racha: {n} rezo al día',
      other: 'Según su objetivo de racha: {n} rezos al día',
      many: 'Según su objetivo de racha: {n} de rezos al día',
    }),
    kilinanNamaz: 'Rezos hechos',
    hedefeUlasan: 'Días con el objetivo cumplido',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Días con rezo',
    vakitVakit: 'Por rezo',
    yuzdeErisim: '{ad}: {n} por ciento',
  },
  rozetler: {
    baslik: 'Nivel e insignias',
    seviye: 'Nivel {n}',
    puan: 'Puntos',
    kalanErisim: cogul({
      one: 'Falta {n} punto para el nivel {rank}',
      other: 'Faltan {n} puntos para el nivel {rank}',
      many: 'Faltan {n} de puntos para el nivel {rank}',
    }),
    enYuksek: 'Está en el nivel más alto',
    kalan: cogul({ one: 'Falta {n} punto para {rank}', other: 'Faltan {n} puntos para {rank}', many: 'Faltan {n} de puntos para {rank}' }),
    kilinanErisim: cogul({ one: '{n} rezo hecho', other: '{n} rezos hechos', many: '{n} de rezos hechos' }),
    namaz: cogul({ one: 'rezo', other: 'rezos', many: 'de rezos' }),
    rozetErisim: '{n} de {toplam} insignias obtenidas',
    rozet: cogul({ one: 'insignia', other: 'insignias', many: 'de insignias' }),
  },
};
