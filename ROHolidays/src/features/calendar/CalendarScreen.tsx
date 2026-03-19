import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Text, View, Button } from 'react-native';
import { useEvents } from '../../data/queries/events';
import { CalendarMonth } from '../../ui/components/CalendarMonth';
import { Screen } from '../../ui/components/Screen';
import { dayjs } from '../../services/date';
import { Event } from '../../domain/types';

export default function CalendarScreen() {
  const { data, isLoading, error } = useEvents();
  const [monthCursor, setMonthCursor] = useState(() =>
    dayjs().startOf('month'),
  );
  const todayISO = dayjs().format('YYYY-MM-DD');

  const monthEvents = useMemo(() => {
    if (!data) return [];
    return data.filter(ev => dayjs(ev.dateISO).isSame(monthCursor, 'month'));
  }, [data, monthCursor]);

  const openDetails = (dateISO: string) => {
    if (!data) return;
    const matches: Event[] = data.filter(ev => ev.dateISO === dateISO);
    if (!matches.length) {
      return;
    }
    const lines = matches
      .map(ev => {
        const isWeekend = ['Saturday', 'Sunday'].includes(
          dayjs(ev.dateISO).format('dddd'),
        );
        const off =
          ev.kind === 'LEGAL' ? 'Zi liberă de stat' : 'Nu e zi liberă de stat';
        const cross =
          ev.level === 'RED'
            ? 'Cruce roșie — nu se spală haine.'
            : ev.level === 'BLACK'
            ? 'Cruce neagră — nu se spală haine.'
            : null;
        const washing =
          ev.metadata?.noWashing || ev.level
            ? 'Nu se spală (post/duminică/sărbătoare).'
            : 'Se pot spăla haine.';
        const weekend = isWeekend ? ' (pică în weekend)' : '';
        const text = ev.metadata?.text ? `\n${ev.metadata.text}` : '';
        return `${ev.title} (${ev.kind}${
          ev.level ? `, ${ev.level}` : ''
        }) — ${off}${weekend}${
          cross ? ` | ${cross}` : ''
        } | ${washing} | sursa: ${ev.source}${text}`;
      })
      .join('\n');
    Alert.alert(`Evenimente ${dateISO}`, lines);
  };

  if (isLoading) {
    return (
      <Screen>
        <ActivityIndicator />
      </Screen>
    );
  }

  if (error || !data) {
    return (
      <Screen>
        <Text style={{ color: '#b91c1c' }}>
          Eroare la încărcarea calendarului.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ marginBottom: 12 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '800',
            textTransform: 'capitalize',
            textAlign: 'center',
          }}>
          {dayjs(todayISO).format('dddd, DD MMMM YYYY')}
        </Text>
        <Text
          style={{
            marginTop: 4,
            fontSize: 18,
            fontWeight: '700',
            textAlign: 'center',
            color: data.some(
              ev => ev.dateISO === todayISO && (ev.metadata as any)?.noWashing,
            )
              ? '#b91c1c'
              : '#16a34a',
          }}>
          {data.some(
            ev => ev.dateISO === todayISO && (ev.metadata as any)?.noWashing,
          )
            ? 'NU se spală haine azi'
            : 'Se pot spăla haine azi'}
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <Button
          title="◀"
          onPress={() => setMonthCursor(monthCursor.subtract(1, 'month'))}
        />
        <Text
          style={{
            fontSize: 16,
            fontWeight: '700',
            textTransform: 'capitalize',
          }}
        >
          {monthCursor.format('MMMM YYYY')}
        </Text>
        <Button
          title="▶"
          onPress={() => setMonthCursor(monthCursor.add(1, 'month'))}
        />
      </View>
      <CalendarMonth
        monthDate={monthCursor.toISOString()}
        events={monthEvents}
        onSelectDay={openDetails}
      />
    </Screen>
  );
}
