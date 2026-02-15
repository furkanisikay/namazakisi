import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTema } from '../../../core/theme';
import { PaylasimModal } from '../Sharing/PaylasimModal';
import { PaylasilabilirSeri } from '../Sharing/PaylasilabilirSeri';

interface SeriKartiModalProps {
    gorunur: boolean;
    onKapat: () => void;
    mevcutSeri: number;
    enUzunSeri: number;
}

export const SeriKartiModal: React.FC<SeriKartiModalProps> = ({
    gorunur,
    onKapat,
    mevcutSeri,
    enUzunSeri
}) => {
    const { koyuMu } = useTema();
    const [paylasimModalGorunur, setPaylasimModalGorunur] = useState(false);

    // Hedef hesaplama (basit mantık: sonraki eşiği bul)
    const hedefler = [7, 21, 60];
    const sonrakiHedef = hedefler.find(h => h > mevcutSeri) || 60;
    const kalanGun = sonrakiHedef - mevcutSeri;

    const HedefCircle = ({ target, icon, color, label }: { target: number, icon: string, color: string, label?: string }) => {
        // Renk mapping
        const colorMap: Record<string, string> = {
            'green-300': '#86efac',
            'yellow-300': '#fde047',
            'blue-300': '#93c5fd',
        };
        const hexColor = colorMap[color] || '#ffffff';
        const isReached = mevcutSeri >= target;

        return (
            <View className="flex-col items-center">
                <View className={`w-12 h-12 rounded-full border-2 flex items-center justify-center bg-white/10 backdrop-blur-sm ${isReached ? 'border-white' : 'border-white/40'}`}>
                    <Text>
                        {/* MaterialIcons is not directly compatible with string name for all without mapping, but user asked for design replication */}
                        {/* Using FontAwesome5/MaterialIcons mapping based on look */}
                        {icon === 'eco' && <MaterialIcons name="eco" size={24} color={hexColor} />}
                        {icon === 'local_fire_department' && <MaterialIcons name="local-fire-department" size={24} color={hexColor} />}
                        {icon === 'diamond' && <FontAwesome5 name="gem" size={20} color={hexColor} />}
                    </Text>
                </View>
                <Text className="text-xs mt-1 font-medium text-white">{target}</Text>
                {/* {label && <Text className="text-[10px] text-white/70">{label}</Text>} */}
            </View>
        );
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={gorunur}
            onRequestClose={onKapat}
        >
            <TouchableOpacity
                activeOpacity={1}
                onPress={onKapat}
                className="flex-1 justify-center items-center bg-black/60 p-4"
            >
                <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()} className="w-full">
                    {/* Main Gradient Card */}
                    <LinearGradient
                        colors={['#fb923c', '#ea580c']} // orange-400 to orange-600
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="rounded-3xl p-6 overflow-hidden shadow-lg relative"
                        style={{ elevation: 10, shadowColor: '#fb923c', shadowOpacity: 0.5, shadowRadius: 20 }}
                    >
                        {/* Background Decor */}
                        <View className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" style={{ transform: [{ scale: 1.5 }] }} />

                        {/* Header */}
                        <View className="flex-row justify-between items-start mb-2">
                            <View>
                                <Text className="font-bold text-lg leading-tight uppercase tracking-wide text-white opacity-90">
                                    Seri ateşin yanıyor!
                                </Text>
                                <Text className="text-sm text-orange-100 mt-1">
                                    En uzun seri: {enUzunSeri} gün
                                </Text>
                            </View>
                            <MaterialIcons name="local-fire-department" size={40} color="#fde047" />
                        </View>

                        {/* Main Count */}
                        <View className="items-center py-6">
                            <Text className="text-6xl font-bold text-white drop-shadow-sm">
                                {mevcutSeri}
                            </Text>
                            <Text className="text-xl font-medium tracking-widest uppercase text-white opacity-90 mt-1">
                                GÜN
                            </Text>
                        </View>

                        {/* Milestones */}
                        <View className="flex-row justify-center items-center gap-2 mb-6">
                            <HedefCircle target={7} icon="eco" color="green-300" />
                            <MaterialIcons name="arrow-forward" size={16} color="rgba(255,255,255,0.4)" />
                            <HedefCircle target={21} icon="local_fire_department" color="yellow-300" />
                            <MaterialIcons name="arrow-forward" size={16} color="rgba(255,255,255,0.4)" />
                            <HedefCircle target={60} icon="diamond" color="blue-300" />
                        </View>

                        {/* Footer Pill */}
                        <View className="items-center mb-4">
                            <View className="bg-black/10 px-4 py-1.5 rounded-full">
                                <Text className="text-xs text-orange-100 font-medium">
                                    Sonraki hedef: {sonrakiHedef}. Gün ({kalanGun > 0 ? `${kalanGun} gün kaldı` : 'Tamamlandı!'})
                                </Text>
                            </View>
                        </View>

                        {/* Paylas Butonu */}
                        <TouchableOpacity
                            onPress={() => setPaylasimModalGorunur(true)}
                            className="bg-white/20 py-3 rounded-xl flex-row items-center justify-center space-x-2 border border-white/30"
                            activeOpacity={0.8}
                        >
                            <FontAwesome5 name="share-alt" size={16} color="white" style={{ marginRight: 8 }} />
                            <Text className="text-white font-bold text-sm">BAŞARIMI PAYLAŞ</Text>
                        </TouchableOpacity>

                    </LinearGradient>
                </TouchableOpacity>
            </TouchableOpacity>

            {/* Paylasim Modali */}
            <PaylasimModal
                gorunur={paylasimModalGorunur}
                onKapat={() => setPaylasimModalGorunur(false)}
            >
                <PaylasilabilirSeri mevcutSeri={mevcutSeri} enUzunSeri={enUzunSeri} />
            </PaylasimModal>
        </Modal>
    );
};
