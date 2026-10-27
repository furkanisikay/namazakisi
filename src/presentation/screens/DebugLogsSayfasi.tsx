/**
 * Debug Logs Sayfasi
 * Debug loglarini goruntuleme ve yonetme
 */

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Anahtar } from '../components/common/Anahtar';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRenkler } from '../../core/theme';
import { Logger, LogLevel, LogEntry } from '../../core/utils/Logger';
import { loglariMaskele } from '../../domain/services/TaniRaporuServisi';
import { BildirimModali, BildirimTipi } from '../components/common/BildirimModali';
import { useMetin } from '../hooks/useMetin';
import { metin, sayili } from '../../core/dil/aktifDil';

/**
 * Bildirim/onay modalı durumu — Alert.alert yerine tema-uyumlu BildirimModali ile gösterilir.
 * Tek-butonlu hata/bilgi ve iki-butonlu (temizle) onay senaryolarını taşır.
 */
interface DebugBildirimi {
  gorunur: boolean;
  tip: BildirimTipi;
  baslik: string;
  mesaj: string;
  birincilEtiket?: string;
  birincilIkon?: string;
  onBirincil?: () => void;
  kapatEtiketi?: string;
  tehlikeli?: boolean;
}

/**
 * Log level renkleri
 */
const getLevelColor = (level: LogLevel, colors: { metinIkincil: string; bilgi: string; hata: string; metin: string }) => {
  switch (level) {
    case LogLevel.DEBUG:
      return colors.metinIkincil;
    case LogLevel.INFO:
      return colors.bilgi;
    case LogLevel.WARN:
      return '#F59E0B'; // Amber
    case LogLevel.ERROR:
      return colors.hata;
    default:
      return colors.metin;
  }
};

/**
 * Log level ikonu
 */
const getLevelIcon = (level: LogLevel) => {
  switch (level) {
    case LogLevel.DEBUG:
      return 'bug';
    case LogLevel.INFO:
      return 'info-circle';
    case LogLevel.WARN:
      return 'exclamation-triangle';
    case LogLevel.ERROR:
      return 'times-circle';
    default:
      return 'circle';
  }
};

/**
 * Tek bir log satiri
 */
interface LogItemProps {
  log: LogEntry;
}

const LogItem: React.FC<LogItemProps> = ({ log }) => {
  const renkler = useRenkler();
  const [expanded, setExpanded] = useState(false);

  // `toLocale*` Hermes'te ICU'ya bağlıdır (AGENTS.md) → sabit biçim: 14:05:09 • 24.10.2026.
  const date = new Date(log.timestamp);
  const iki = (n: number) => String(n).padStart(2, '0');
  const timeStr = `${iki(date.getHours())}:${iki(date.getMinutes())}:${iki(date.getSeconds())}`;
  const dateStr = `${iki(date.getDate())}.${iki(date.getMonth() + 1)}.${date.getFullYear()}`;

  const levelColor = getLevelColor(log.level, renkler);
  const iconName = getLevelIcon(log.level);

  return (
    <TouchableOpacity
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      className="mb-2 rounded-lg p-3"
      style={{ backgroundColor: renkler.kartArkaplan }}
    >
      <View className="flex-row items-start">
        <FontAwesome5
          name={iconName}
          size={14}
          color={levelColor}
          solid
          style={{ marginTop: 2, marginRight: 8 }}
        />
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text
              className="text-xs font-bold mr-2"
              style={{ color: levelColor }}
            >
              {log.level}
            </Text>
            <Text className="text-xs" style={{ color: renkler.metinIkincil }}>
              {timeStr} • {dateStr}
            </Text>
          </View>
          <Text className="text-xs font-semibold mb-1" style={{ color: renkler.metin }}>
            [{log.tag}]
          </Text>
          <Text className="text-xs" style={{ color: renkler.metin }}>
            {log.message}
          </Text>
          {expanded && !!log.data && (
            <View
              className="mt-2 p-2 rounded"
              style={{ backgroundColor: renkler.arkaplan }}
            >
              <Text className="text-xs font-mono" style={{ color: renkler.metinIkincil }}>
                {JSON.stringify(log.data, null, 2)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

/**
 * Debug Logs Sayfasi
 */
export const DebugLogsSayfasi: React.FC = () => {
  const renkler = useRenkler();
  const m = useMetin().genel.loglar;
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'ALL'>('ALL');

  // Alert.alert yerine tema-uyumlu bildirim/onay modalı
  const [bildirim, setBildirim] = useState<DebugBildirimi>({
    gorunur: false,
    tip: 'hata',
    baslik: '',
    mesaj: '',
  });
  const bildirimKapat = useCallback(
    () => setBildirim((onceki) => ({ ...onceki, gorunur: false })),
    []
  );
  // Tek-butonlu hata/bilgi bildirimi göster
  const basitBildirimGoster = useCallback(
    (tip: BildirimTipi, baslik: string, mesaj: string) =>
      setBildirim({ gorunur: true, tip, baslik, mesaj }),
    []
  );

  // Loglari yukle
  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const allLogs = Logger.getLogs();
      setLogs(allLogs);
      const enabled = Logger.isEnabled();
      setDebugEnabled(enabled);
    } catch (error) {
      Logger.error('DebugLogsSayfasi', 'Loglar yuklenirken hata', error);
      const t = metin().genel.loglar;
      basitBildirimGoster('hata', t.hataBaslik, t.yuklemeHatasi);
    } finally {
      setLoading(false);
    }
  }, [basitBildirimGoster]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Debug modunu degistir
  const handleToggleDebug = async (value: boolean) => {
    setDebugEnabled(value); // iyimser UI guncellemesi
    const saved = await Logger.setEnabled(value);
    if (!saved) {
      // Storage yazimi basarisiz: UI'yi eski haline getir ve kullaniciya bildir
      setDebugEnabled(!value);
      basitBildirimGoster('hata', m.ayarKaydedilemedi, m.ayarKaydedilemediMesaj);
      return;
    }
    if (value) {
      basitBildirimGoster('bilgi', m.aktifBaslik, m.aktifMesaj);
    }
  };

  // Loglari temizle
  const handleClearLogs = () => {
    setBildirim({
      gorunur: true,
      tip: 'hata',
      baslik: m.temizleBaslik,
      mesaj: m.temizleMesaj,
      birincilEtiket: m.temizle,
      birincilIkon: 'trash-alt',
      tehlikeli: true,
      kapatEtiketi: metin().genel.ortak.iptal,
      onBirincil: async () => {
        bildirimKapat();
        try {
          await Logger.clearLogs();
          await loadLogs();
        } catch (error) {
          Logger.error('DebugLogsSayfasi', 'Log temizleme hatasi', error);
          basitBildirimGoster('hata', m.hataBaslik, m.temizlemeHatasi);
        }
      },
    });
  };

  // Loglari paylas
  const handleShareLogs = async () => {
    if (logs.length === 0) {
      basitBildirimGoster('bilgi', m.paylasilacakYok, m.paylasilacakYokMesaj);
      return;
    }

    try {
      // Paylaşılan dosya cihazdan çıkar → tanı e-postasıyla AYNI maskeleyiciden geçer
      // (koordinat, şehir/ilçe alanları ve token benzeri gizli değerler gizlenir).
      const content = loglariMaskele(Logger.exportLogs(), { konumDahil: false });
      const fileName = `namazakisi_logs_${Date.now()}.txt`;
      const file = new File(Paths.cache, fileName);

      // write() sync API; await zararsiz, olasi async versiyonlara karsi guvenli
      await file.write(content, {
        encoding: 'utf8',
      });
      const fileUri = file.uri;

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: m.paylasDiyalog,
        });
      } else {
        basitBildirimGoster('bilgi', m.paylasimYok, m.paylasimYokMesaj);
      }
    } catch (error) {
      Logger.error('DebugLogsSayfasi', 'Log paylasim hatasi', error);
      basitBildirimGoster('hata', m.hataBaslik, m.paylasimHatasi);
    }
  };

  // Filtrelenmus loglar
  const filteredLogs =
    selectedLevel === 'ALL'
      ? logs
      : logs.filter((log) => log.level === selectedLevel);

  // Level filter butonu
  const LevelFilterButton: React.FC<{
    level: LogLevel | 'ALL';
    label: string;
  }> = ({ level, label }) => {
    const isSelected = selectedLevel === level;
    return (
      <TouchableOpacity
        onPress={() => setSelectedLevel(level)}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        className="px-3 py-1.5 rounded-full mr-2"
        style={{
          backgroundColor: isSelected ? renkler.birincil : renkler.arkaplan,
        }}
      >
        <Text
          className="text-xs font-semibold"
          style={{ color: isSelected ? '#FFFFFF' : renkler.metin }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: renkler.arkaplan }}>
      {/* Header */}
      <View
        className="p-4 border-b"
        style={{
          backgroundColor: renkler.kartArkaplan,
          borderBottomColor: renkler.sinir,
        }}
      >
        {/* Debug Mode Toggle */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1 mr-4">
            <Text className="text-base font-bold mb-1" style={{ color: renkler.metin }}>
              {m.debugModu}
            </Text>
            <Text className="text-xs" style={{ color: renkler.metinIkincil }}>
              {debugEnabled ? m.kaydediliyor : m.kaydedilmiyor}
            </Text>
          </View>
          <Anahtar
            value={debugEnabled}
            onValueChange={handleToggleDebug}
            trackColor={{ false: renkler.sinir, true: `${renkler.birincil}80` }}
            thumbColor={debugEnabled ? renkler.birincil : renkler.metinIkincil}
          />
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={loadLogs}
            className="flex-1 flex-row items-center justify-center py-2.5 rounded-lg"
            style={{ backgroundColor: renkler.birincil }}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <MaterialIcons name="refresh" size={18} color="#FFFFFF" />
            <Text className="text-sm font-semibold ml-2" style={{ color: '#FFFFFF' }}>
              {m.yenile}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShareLogs}
            disabled={logs.length === 0}
            className="flex-1 flex-row items-center justify-center py-2.5 rounded-lg"
            style={{
              backgroundColor: logs.length > 0 ? renkler.bilgi : renkler.sinir,
            }}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <MaterialIcons name="share" size={18} color="#FFFFFF" />
            <Text className="text-sm font-semibold ml-2" style={{ color: '#FFFFFF' }}>
              {m.paylas}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleClearLogs}
            disabled={logs.length === 0}
            className="flex-1 flex-row items-center justify-center py-2.5 rounded-lg"
            style={{
              backgroundColor: logs.length > 0 ? renkler.hata : renkler.sinir,
            }}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <MaterialIcons name="delete" size={18} color="#FFFFFF" />
            <Text className="text-sm font-semibold ml-2" style={{ color: '#FFFFFF' }}>
              {m.temizle}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Level Filters */}
      <View
        className="border-b"
        style={{ backgroundColor: renkler.kartArkaplan, borderBottomColor: renkler.sinir }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 py-3"
          contentContainerStyle={{ paddingRight: 16, alignItems: 'center' }}
        >
          <LevelFilterButton level="ALL" label={m.tumu} />
          <LevelFilterButton level={LogLevel.DEBUG} label="Debug" />
          <LevelFilterButton level={LogLevel.INFO} label="Info" />
          <LevelFilterButton level={LogLevel.WARN} label="Warn" />
          <LevelFilterButton level={LogLevel.ERROR} label="Error" />
        </ScrollView>
      </View>

      {/* Logs List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={renkler.birincil} />
        </View>
      ) : filteredLogs.length === 0 ? (
        <View className="flex-1 items-center justify-center p-8">
          <FontAwesome5
            name="inbox"
            size={48}
            color={renkler.metinIkincil}
            style={{ marginBottom: 16 }}
          />
          <Text className="text-base font-semibold mb-2" style={{ color: renkler.metin }}>
            {debugEnabled ? m.henuzYok : m.kapali}
          </Text>
          <Text
            className="text-sm text-center"
            style={{ color: renkler.metinIkincil }}
          >
            {debugEnabled ? m.henuzYokAciklama : m.kapaliAciklama}
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 p-4"
          showsVerticalScrollIndicator={true}
        >
          <Text className="text-xs mb-3" style={{ color: renkler.metinIkincil }}>
            {sayili(m.bulundu, filteredLogs.length)}
          </Text>
          {filteredLogs.map((log, index) => (
            <LogItem key={`${log.timestamp}-${index}`} log={log} />
          ))}
        </ScrollView>
      )}

      {/* Bildirim/onay modalı — Alert.alert yerine tema-uyumlu modal */}
      <BildirimModali
        gorunur={bildirim.gorunur}
        tip={bildirim.tip}
        baslik={bildirim.baslik}
        mesaj={bildirim.mesaj}
        birincilEtiket={bildirim.birincilEtiket}
        birincilIkon={bildirim.birincilIkon}
        onBirincil={bildirim.onBirincil}
        tehlikeli={bildirim.tehlikeli}
        kapatEtiketi={bildirim.kapatEtiketi}
        onKapat={bildirimKapat}
      />
    </View>
  );
};
