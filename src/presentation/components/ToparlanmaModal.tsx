/**
 * Toparlanma Modu Modal
 * Seri toparlanma durumunu tam ekranda gösterir
 */
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ToparlanmaKarti } from './ToparlanmaKarti';
import type { ToparlanmaDurumu } from '../../core/types/SeriTipleri';
import { useRenkler } from '../../core/theme';

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

  return (
    <Modal
      visible={gorunur}
      transparent
      animationType="slide"
      onRequestClose={onKapat}
    >
      {/* Overlay — tıklayınca kapat */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onKapat}
      >
        {/* Bottom sheet — tıklamayı durdur */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={e => e.stopPropagation()}
          style={[styles.sheet, { backgroundColor: renkler.arkaplan }]}
        >
          {/* Drag handle */}
          <View style={[styles.handle, { backgroundColor: renkler.sinir }]} />

          <ToparlanmaKarti
            toparlanmaDurumu={toparlanmaDurumu}
            oncekiSeri={oncekiSeri}
          />

          <TouchableOpacity
            style={[styles.anladimButon, { backgroundColor: renkler.birincil }]}
            onPress={onKapat}
            accessibilityLabel="Toparlanma modalını kapat"
            accessibilityRole="button"
          >
            <Text style={styles.anladimMetin}>Anladım</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
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
