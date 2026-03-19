import React, { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

type Props = PropsWithChildren<{ padded?: boolean; scroll?: boolean }>;

export function Screen({ children, padded = true, scroll = true }: Props) {
  const content = scroll ? (
    <ScrollView contentContainerStyle={[styles.content, padded && styles.padded]}>{children}</ScrollView>
  ) : (
    <View style={[styles.content, padded && styles.padded]}>{children}</View>
  );

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { flexGrow: 1 },
  padded: { padding: 16 },
});
