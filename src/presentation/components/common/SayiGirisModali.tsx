import * as React from 'react';
import {
  Modal,
  KeyboardAvoidingView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRenkler } from '../../../core/theme';
import { useDonanimGeriTusu } from '../../hooks/useDonanimGeriTusu';

/**
 * Tek sayı girişli onay modalı (number-pad + İptal/Onay).
 * KazaDefteri'ndeki borç-ekle / toplu-tamamla / günlük-hedef modalları için ortak.
 */
export interface SayiGirisModaliProps {
  gorunur: boolean;
  baslik: string;
  aciklama: string;
  placeholder: string;
  onayMetni: string;
  deger: string;
  onDegisim: (deger: string) => void;
  onIptal: () => void;
  onOnay: () => void;
}

export const SayiGirisModali: React.FC<SayiGirisModaliProps> = ({
  gorunur,
  baslik,
  aciklama,
  placeholder,
  onayMetni,
  deger,
  onDegisim,
  onIptal,
  onOnay,
}) => {
  const renkler = useRenkler();

  useDonanimGeriTusu(gorunur, onIptal);

  return (
    <Modal visible={gorunur} transparent animationType="fade" onRequestClose={onIptal}>
      <KeyboardAvoidingView
        style={styles.modalArkaPlan}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Backdrop: icerigi saran degil, absoluteFill ile kardes → TextInput/scroll takilmaz */}
        <TouchableWithoutFeedback onPress={onIptal} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <View style={[StyleSheet.absoluteFill, styles.backdrop]} />
        </TouchableWithoutFeedback>
        <View style={[styles.modalKonteyner, { backgroundColor: renkler.kartArkaplan }]}>
          <Text style={[styles.modalBaslik, { color: renkler.metin }]}>{baslik}</Text>
          <Text style={[styles.modalAciklama, { color: renkler.metinIkincil }]}>{aciklama}</Text>
          <TextInput
            style={[
              styles.modalInput,
              { borderColor: renkler.sinir, color: renkler.metin, backgroundColor: renkler.arkaplan },
            ]}
            keyboardType="number-pad"
            placeholder={placeholder}
            placeholderTextColor={renkler.metinIkincil}
            value={deger}
            onChangeText={onDegisim}
            autoFocus
          />
          <View style={styles.modalButonlar}>
            <TouchableOpacity
              onPress={onIptal}
              style={[styles.modalIptalButon, { borderColor: renkler.sinir }]}
              accessibilityRole="button"
              accessibilityLabel="İptal"
            >
              <Text style={[styles.modalIptalMetin, { color: renkler.metinIkincil }]}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onOnay}
              style={[styles.modalOnayButon, { backgroundColor: renkler.birincil }]}
              accessibilityRole="button"
              accessibilityLabel={onayMetni}
            >
              <Text style={[styles.modalOnayMetin, { color: renkler.birincilMetin }]}>{onayMetni}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalArkaPlan: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalKonteyner: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
  },
  modalBaslik: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  modalAciklama: {
    fontSize: 14,
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  modalButonlar: {
    flexDirection: 'row',
    gap: 12,
  },
  modalIptalButon: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  modalIptalMetin: {
    fontSize: 15,
    fontWeight: '600',
  },
  modalOnayButon: {
    flex: 1,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  modalOnayMetin: {
    fontSize: 15,
    fontWeight: '700',
  },
});
