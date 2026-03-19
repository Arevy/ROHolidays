import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Event } from '../../domain/types';
import { dayjs } from '../../services/date';
import { isNoWashingDay } from '../../domain/eventMetadata';

type Props = {
  event: Event;
};

const LEVEL_COLORS = {
  RED: '#c1121f',
  BLACK: '#1d1d1f',
  NEUTRAL: '#3a86ff',
  NOWASH: '#8b5cf6',
} as const;

export function EventListItem({ event }: Props) {
  const noWashing = isNoWashingDay(event);
  const levelColor =
    event.level === 'RED'
      ? LEVEL_COLORS.RED
      : event.level === 'BLACK'
        ? LEVEL_COLORS.BLACK
        : noWashing
          ? LEVEL_COLORS.NOWASH
          : LEVEL_COLORS.NEUTRAL;

  const weekday = dayjs(event.dateISO).format('dddd');
  const isWeekend = ['sâmbătă', 'duminică', 'saturday', 'sunday'].some(w =>
    weekday.toLowerCase().includes(w.slice(0, 3)),
  );
  const isDayOff = event.kind === 'LEGAL';
  const canWash = !noWashing && event.level === null && !isWeekend;

  const crossLabel = useMemo(() => {
    if (event.level === 'RED') return 'Cruce roșie — nu se spală haine.';
    if (event.level === 'BLACK') return 'Cruce neagră';
    return null;
  }, [event.level]);

  const noWashOnly = !event.level && noWashing;
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

  const translateX = useSharedValue(0);
  const pressed = useSharedValue(0);

  // [SENIOR_INSIGHT] Gesture updates run on the UI thread through Reanimated worklets.
  // This keeps interactions fluid even if the JS thread is busy with data updates.
  const pan = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .onUpdate(eventPan => {
      const clamped = Math.max(-28, Math.min(28, eventPan.translationX));
      translateX.value = clamped;
    })
    .onEnd(() => {
      translateX.value = withSpring(0, { damping: 18, stiffness: 220 });
    });

  const tap = Gesture.Tap()
    .onBegin(() => {
      pressed.value = withTiming(1, { duration: 80 });
    })
    .onFinalize(() => {
      pressed.value = withTiming(0, { duration: 120 });
    });

  const gesture = Gesture.Simultaneous(pan, tap);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pressed.value, [0, 1], [1, 0.98]);
    return {
      transform: [{ translateX: translateX.value }, { scale }],
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.row, animatedStyle]}>
        <View style={styles.statusWrapper}>
          <View
            style={[
              styles.statusPill,
              { borderColor: levelColor, backgroundColor: `${levelColor}15` },
            ]}>
            <Text style={[styles.status, { color: levelColor }]}>{statusLabel}</Text>
          </View>
        </View>
        <View style={styles.meta}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.date}>{event.dateISO}</Text>
          <Text style={styles.source}>
            {dayOffNote} {weekendNote} {crossLabel ? crossLabel : ''}{' '}
            {noWashOnly ? 'Nu se spală (duminică).' : ''}
          </Text>
          <Text style={styles.source}>Sursă: {event.source}</Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    gap: 8,
    backgroundColor: '#f8fafc',
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
