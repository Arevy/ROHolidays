import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { dayjs } from '../../services/date';
import { Event } from '../../domain/types';

type Props = {
  monthDate: string; // any date within the month
  events: Event[];
  onSelectDay?: (dateISO: string) => void;
};

export function CalendarMonth({ monthDate, events, onSelectDay }: Props) {
  const start = dayjs(monthDate).startOf('month');
  const daysInMonth = start.daysInMonth();
  // Shift so that Monday is column 0 (UI expectation for RO locale).
  const offsets = (start.day() + 6) % 7;

  const items = Array.from({ length: offsets + daysInMonth }).map((_, index) => {
    if (index < offsets) {
      return null;
    }
    const day = index - offsets + 1;
    const dateISO = start.date(day).format('YYYY-MM-DD');
    const dayEvents = events.filter(e => dayjs(e.dateISO).isSame(dateISO, 'day'));
    const hasRed = dayEvents.some(e => e.level === 'RED');
    const hasBlack = dayEvents.some(e => e.level === 'BLACK');
    const isLegal = dayEvents.some(e => e.kind === 'LEGAL');
    const hasNoWashOnly = dayEvents.some(e => !e.level && (e.metadata as any)?.noWashing);
    const isSunday = dayjs(dateISO).day() === 0;
    const canWash =
      !isSunday &&
      dayEvents.length > 0 &&
      dayEvents.every(e => !(e.metadata as any)?.noWashing);
    const isToday = dayjs().isSame(dateISO, 'day');

    return { day, dateISO, hasRed, hasBlack, isLegal, hasNoWashOnly, canWash, isToday };
  });

  return (
    <View>
      <Text style={styles.monthTitle}>{start.format('MMMM YYYY')}</Text>
      <View style={styles.grid}>
        {['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ', 'Du'].map(label => (
          <Text key={label} style={styles.weekday}>
            {label}
          </Text>
        ))}
        {items.map((item, idx) =>
          item ? (
            <Pressable
              key={idx}
              style={[
                styles.day,
                item.isLegal && styles.legal,
                item.hasRed && styles.red,
                !item.hasRed && item.hasBlack && styles.black,
                item.hasNoWashOnly && styles.noWashOnly,
                item.canWash && styles.canWash,
                item.isToday && styles.today,
              ]}
              onPress={() => onSelectDay?.(item.dateISO)}>
              <Text style={styles.dayNumber}>{item.day}</Text>
              <View style={styles.dayIcons}>
                {item.isLegal && <Text style={styles.icon}>🏛️</Text>}
                {item.hasRed && <Text style={styles.icon}>✝️</Text>}
                {!item.hasRed && item.hasBlack && <Text style={styles.icon}>✝︎</Text>}
                {item.hasNoWashOnly && <Text style={styles.icon}>🧺🚫</Text>}
                {item.canWash && <Text style={styles.icon}>🧺</Text>}
              </View>
            </Pressable>
          ) : (
            <View key={idx} style={styles.dayPlaceholder} />
          ),
        )}
      </View>
      <View style={styles.legend}>
        <Legend color="#3a86ff" label="🏛️ Zi liberă legală (bordură albastră)" />
        <Legend color="#c1121f" label="✝️ Cruce roșie — nu se spală" />
        <Legend color="#1d1d1f" label="✝︎ Cruce neagră — nu se spală" />
        <Legend color="#8b5cf6" label="🧺🚫 Duminică / nu se spală (fără cruce)" />
        <Legend color="#e8f5a9" label="🧺 Se pot spăla (fără restricții)" />
      </View>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  monthTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, textTransform: 'capitalize' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  weekday: {
    width: '14.2857%',
    textAlign: 'center',
    fontWeight: '600',
    color: '#475569',
  },
  day: {
    width: '14.2857%',
    aspectRatio: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
  dayPlaceholder: { width: '14.2857%', aspectRatio: 1, marginVertical: 4 },
  dayNumber: { fontWeight: '700', color: '#0f172a' },
  dayIcons: { flexDirection: 'row', gap: 2, marginTop: 2 },
  icon: { fontSize: 12 },
  legal: { borderWidth: 2, borderColor: '#3a86ff' },
  red: { backgroundColor: '#fbd5d5' }, // red cross (legend #c1121f)
  black: { backgroundColor: '#e5e5e5' }, // black cross (legend #1d1d1f)
  noWashOnly: { backgroundColor: '#ede9fe' }, // Sunday / no-wash purple
  canWash: { backgroundColor: '#e8f5a9' }, // yellow-green for "washing allowed"
  today: { borderWidth: 2, borderColor: '#22c55e' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 8, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4, width: '48%' },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
});
