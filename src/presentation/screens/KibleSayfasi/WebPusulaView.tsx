import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRenkler } from '../../../core/theme';

export const WebPusulaView = () => {
  const renkler = useRenkler();

  return (
    <View style={[styles.container, { backgroundColor: renkler.arkaplan }]}>
      <WebView
        source={{ uri: 'https://qiblafinder.withgoogle.com/intl/tr/' }}
        style={styles.webview}
        geolocationEnabled={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={[styles.loadingContainer, { backgroundColor: renkler.arkaplan }]}>
            <ActivityIndicator size="large" color={renkler.birincil} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  }
});
