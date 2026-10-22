/**
 * Ekranlar için sistem koşulları (güç/veri tasarrufu, ağ, şarj). Tek native
 * dinleyiciyi paylaşır; köprüsüz build'de ve jest'te değer "bilinmiyor" kalır ve
 * hiç değişmez.
 */
import { useSyncExternalStore } from 'react';
import type { SistemDurumu } from '../../core/sistem/sistemDurumu';
import { sistemKosullarinaAbone, sonSistemKosullari } from '../../domain/services/SistemKosullariServisi';

export function useSistemKosullari(): SistemDurumu {
  return useSyncExternalStore(sistemKosullarinaAbone, sonSistemKosullari, sonSistemKosullari);
}
