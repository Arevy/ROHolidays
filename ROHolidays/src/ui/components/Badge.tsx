import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

type Props = {
  label: string;
  color?: string;
};

export function Badge({ label, color = '#c1121f' }: Props) {
  return (
    <View style={[styles.container, { backgroundColor: `${color}22`, borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
