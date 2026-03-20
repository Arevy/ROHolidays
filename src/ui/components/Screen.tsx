import React, { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';

type Props = PropsWithChildren<{ padded?: boolean; scroll?: boolean }>;

export function Screen({ children, padded = true, scroll = true }: Props) {
  const content = scroll ? (
    <FlashList
      data={[0]}
      keyExtractor={() => 'screen-content'}
      renderItem={() => <View style={[styles.content, padded && styles.padded]}>{children}</View>}
      contentInsetAdjustmentBehavior="never"
      bounces={false}
      contentContainerStyle={styles.listContent}
      drawDistance={200}
    />
  ) : (
    <View style={[styles.content, padded && styles.padded]}>{children}</View>
  );

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { flexGrow: 1 },
  listContent: { flexGrow: 1, backgroundColor: '#f8fafc' },
  // Keep horizontal/bottom spacing, but avoid extra top gap under headers.
  padded: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 0 },
});
