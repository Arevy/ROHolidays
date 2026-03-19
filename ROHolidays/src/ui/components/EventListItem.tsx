import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Event } from '../../domain/types';
import { dayjs } from '../../services/date';

type Props = {
  event: Event;
};

const LEVEL_COLORS = {
  RED: '#c1121f',
  BLACK: '#1d1d1f',
  NEUTRAL: '#3a86ff',
} as const;

export function EventListItem({ event }: Props) {
  const levelColor =
    event.level === 'RED'
      ? LEVEL_COLORS.RED
      : event.level === 'BLACK'
        ? LEVEL_COLORS.BLACK
        : (event.metadata as any)?.noWashing
          ? '#8b5cf6'
          : LEVEL_COLORS.NEUTRAL;
  const weekday = dayjs(event.dateISO).format('dddd');
  const isWeekend = ['sâmbătă', 'duminică', 'saturday', 'sunday'].some(w =>
    weekday.toLowerCase().includes(w.slice(0, 3)),
  );
  const isDayOff = event.kind === 'LEGAL';
  const canWash = !(event.metadata as any)?.noWashing && event.level === null && !isWeekend;
  const crossLabel =
    event.level === 'RED' ? 'Cruce roșie — nu se spală haine.' : event.level === 'BLACK' ? 'Cruce neagră' : null;
  const noWashOnly = !event.level && (event.metadata as any)?.noWashing;
  const statusLabel = isDayOff
    ? 'Zi liberă de stat'
    : crossLabel
      ? crossLabel
      : noWashOnly
        ? 'Duminică / nu se spală'
        : canWash
          ? 'Se pot spăla haine'
          : 'Eveniment';
  const dayOffNote = isDayOff ? 'Zi liberă de stat.' : 'Nu este zi liberă de stat.';
  const weekendNote = isWeekend ? 'Pică în weekend.' : 'Pică în timpul săptămânii.';

  return (
    <View style={styles.row}>
      <View style={styles.statusWrapper}>
        <View style={[styles.statusPill, { borderColor: levelColor, backgroundColor: `${levelColor}15` }]}>
          <Text style={[styles.status, { color: levelColor }]}>{statusLabel}</Text>
        </View>
      </View>
      <View style={styles.meta}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.date}>{event.dateISO}</Text>
        <Text style={styles.source}>
          {dayOffNote} {weekendNote} {crossLabel ? crossLabel : ''} {noWashOnly ? 'Nu se spală (duminică).' : ''}
        </Text>
        <Text style={styles.source}>Sursă: {event.source}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    gap: 8,
  },
  statusWrapper: { alignItems: 'center' },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  status: { fontWeight: '700' },
  meta: { flex: 1 },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  date: {
    fontSize: 14,
    color: '#475569',
  },
  source: {
    fontSize: 12,
    color: '#94a3b8',
  },
});
