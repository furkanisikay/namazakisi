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
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRenkler } from '../../core/theme';
import { Logger, LogLevel, LogEntry } from '../../core/utils/Logger';

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

  const date = new Date(log.timestamp);
  const timeStr = date.toLocaleTimeString('tr-TR');
  const dateStr = date.toLocaleDateString('tr-TR');

  const levelColor = getLevelColor(log.level, renkler);
  const iconName = getLevelIcon(log.level);

  return (
    <TouchableOpacity
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
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
          {expanded && log.data && (
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
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'ALL'>('ALL');

  // Loglari yukle
  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const allLogs = Logger.getLogs();
      setLogs(allLogs);
      const enabled = Logger.isEnabled();
      setDebugEnabled(enabled);
    } catch {
      Alert.alert('Hata', 'Loglar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Debug modunu degistir
  const handleToggleDebug = async (value: boolean) => {
    setDebugEnabled(value);
    await Logger.setEnabled(value);
    
    if (value) {
      Alert.alert(
        'Debug Modu Aktif',
        'Debug logları artık kaydediliyor. Uygulama kullanımınız sırasında oluşan olaylar loglanacak.',
        [{ text: 'Tamam' }]
      );
    }
  };

  // Loglari temizle
  const handleClearLogs = () => {
    Alert.alert(
      'Logları Temizle',
      'Tüm loglar silinecek. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Temizle',
          style: 'destructive',
          onPress: async () => {
            await Logger.clearLogs();
            await loadLogs();
          },
        },
      ]
    );
  };

  // Loglari paylas
  const handleShareLogs = async () => {
    if (logs.length === 0) {
      Alert.alert('Uyarı', 'Paylaşılacak log bulunamadı');
      return;
    }

    try {
      const content = Logger.exportLogs();
      const fileName = `namazakisi_logs_${Date.now()}.txt`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: 'Debug Loglarını Paylaş',
        });
      } else {
        Alert.alert('Hata', 'Paylaşım bu cihazda desteklenmiyor');
      }
    } catch (error) {
      console.error('Log paylasim hatasi:', error);
      Alert.alert('Hata', 'Loglar paylaşılırken hata oluştu');
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
              Debug Modu
            </Text>
            <Text className="text-xs" style={{ color: renkler.metinIkincil }}>
              {debugEnabled
                ? 'Loglar kaydediliyor'
                : 'Loglar kaydedilmiyor'}
            </Text>
          </View>
          <Switch
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
          >
            <MaterialIcons name="refresh" size={18} color="#FFFFFF" />
            <Text className="text-sm font-semibold ml-2" style={{ color: '#FFFFFF' }}>
              Yenile
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
          >
            <MaterialIcons name="share" size={18} color="#FFFFFF" />
            <Text className="text-sm font-semibold ml-2" style={{ color: '#FFFFFF' }}>
              Paylaş
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
          >
            <MaterialIcons name="delete" size={18} color="#FFFFFF" />
            <Text className="text-sm font-semibold ml-2" style={{ color: '#FFFFFF' }}>
              Temizle
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Level Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 py-3 border-b"
        style={{ backgroundColor: renkler.kartArkaplan, borderBottomColor: renkler.sinir }}
        contentContainerStyle={{ paddingRight: 16 }}
      >
        <LevelFilterButton level="ALL" label="Tümü" />
        <LevelFilterButton level={LogLevel.DEBUG} label="Debug" />
        <LevelFilterButton level={LogLevel.INFO} label="Info" />
        <LevelFilterButton level={LogLevel.WARN} label="Warn" />
        <LevelFilterButton level={LogLevel.ERROR} label="Error" />
      </ScrollView>

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
            {debugEnabled ? 'Henüz log yok' : 'Debug modu kapalı'}
          </Text>
          <Text
            className="text-sm text-center"
            style={{ color: renkler.metinIkincil }}
          >
            {debugEnabled
              ? 'Uygulama kullanımınız sırasında oluşan olaylar burada görünecek'
              : 'Logları görmek için debug modunu açın'}
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 p-4"
          showsVerticalScrollIndicator={true}
        >
          <Text className="text-xs mb-3" style={{ color: renkler.metinIkincil }}>
            {filteredLogs.length} log bulundu
          </Text>
          {filteredLogs.map((log, index) => (
            <LogItem key={`${log.timestamp}-${index}`} log={log} />
          ))}
        </ScrollView>
      )}
    </View>
  );
};
