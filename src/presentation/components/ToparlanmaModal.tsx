/**
 * Toparlanma Modu Modal
 * Seri toparlanma durumunu tam ekranda gösterir
 */
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { ToparlanmaKarti } from './ToparlanmaKarti';
import type { ToparlanmaDurumu } from '../../core/types/SeriTipleri';
import { useRenkler } from '../../core/theme';
import { useDonanimGeriTusu } from '../hooks/useDonanimGeriTusu';
import { useMetin } from '../hooks/useMetin';

interface ToparlanmaModalProps {
  gorunur: boolean;
  onKapat: () => void;
  toparlanmaDurumu: ToparlanmaDurumu;
  oncekiSeri: number;
}

export const ToparlanmaModal: React.FC<ToparlanmaModalProps> = ({
  gorunur,
  onKapat,
  toparlanmaDurumu,
  oncekiSeri,
}) => {
  const renkler = useRenkler();
  const m = useMetin().seri.toparlanma;
  useDonanimGeriTusu(gorunur, onKapat);

  return (
    <Modal
      visible={gorunur}
      transparent
      animationType="slide"
      onRequestClose={onKapat}
    >
      <View style={styles.overlayContainer}>
        {/* Backdrop — absolute fill sibling */}
        <Pressable
          style={[StyleSheet.absoluteFill, styles.overlayBackdrop]}
          onPress={onKapat}
        />
        {/* Bottom sheet */}
        <View style={[styles.sheet, { backgroundColor: renkler.arkaplan }]}>
          {/* Drag handle */}
          <View style={[styles.handle, { backgroundColor: renkler.sinir }]} />

          <ToparlanmaKarti
            toparlanmaDurumu={toparlanmaDurumu}
            oncekiSeri={oncekiSeri}
          />

          <TouchableOpacity
            style={[styles.anladimButon, { backgroundColor: renkler.birincil }]}
            onPress={onKapat}
            accessibilityLabel={m.kapatErisim}
            accessibilityRole="button"
          >
            <Text style={styles.anladimMetin}>{m.anladim}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  anladimButon: {
    marginHorizontal: 24,
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  anladimMetin: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
