import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEvents } from '../../data/queries/events';
import { pickUpcoming } from '../../data/repositories/eventsRepository';
import { EventListItem } from '../../ui/components/EventListItem';
import { Screen } from '../../ui/components/Screen';
import { dayjs } from '../../services/date';
import { isNoWashingDay } from '../../domain/eventMetadata';

export default function HomeScreen() {
  const { data, isLoading, error } = useEvents();
  const todayISO = dayjs().format('YYYY-MM-DD');
  const [pageSize, setPageSize] = useState(30);
  const events = useMemo(() => data ?? [], [data]);

  const filtered = useMemo(
    () => events.filter(ev => ev.kind === 'LEGAL' || ev.level === 'RED' || ev.level === 'BLACK'),
    [events],
  );
  // [SENIOR_INSIGHT] Memoization is justified here because list slicing/filtering runs on every render
  // and can be expensive on large datasets; recomputation cost exceeds ref-compare overhead.
  const upcomingAll = useMemo(() => pickUpcoming(filtered, filtered.length), [filtered]);
  const visible = useMemo(() => upcomingAll.slice(0, pageSize), [pageSize, upcomingAll]);
  const todayNoWash = useMemo(
    () => events.some(ev => ev.dateISO === todayISO && isNoWashingDay(ev)),
    [events, todayISO],
  );

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
        <Text style={{ color: '#b91c1c' }}>Nu am putut încărca evenimentele. Verifică conexiunea.</Text>
      </Screen>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }} edges={['top', 'left', 'right', 'bottom']}>
      <View style={{ flex: 1 }}>
        <FlashList
          data={visible}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <EventListItem event={item} />}
          // [SENIOR_INSIGHT] FlashList v2 dropped `estimatedItemSize`; it measures rows automatically.
          // We tune drawDistance to smooth fast scroll while keeping memory usage predictable.
          drawDistance={400}
          style={{ flex: 1, backgroundColor: '#f8fafc' }}
          contentContainerStyle={{ paddingBottom: 24, paddingTop: 0, flexGrow: 1, backgroundColor: '#f8fafc' }}
          ListHeaderComponentStyle={{ backgroundColor: '#f8fafc' }}
          ListFooterComponentStyle={{ backgroundColor: '#f8fafc' }}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (pageSize < upcomingAll.length) {
              setPageSize(prev => Math.min(prev + 30, upcomingAll.length));
            }
          }}
          ListFooterComponent={
            pageSize < upcomingAll.length ? (
              <View style={{ paddingVertical: 12 }}>
                <ActivityIndicator />
                <Text style={{ textAlign: 'center', color: '#475569', marginTop: 4 }}>
                  Loading more events...
                </Text>
              </View>
            ) : null
          }
          bounces={false}
          contentInsetAdjustmentBehavior="never"
          ListHeaderComponent={
            <View style={{ padding: 16, backgroundColor: '#f8fafc' }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: '#0f172a', textAlign: 'center' }}>
                {dayjs(todayISO).format('dddd, DD MMMM YYYY')}
              </Text>
              <Text
                style={{
                  marginTop: 6,
                  fontSize: 18,
                  fontWeight: '700',
                  textAlign: 'center',
                  color: todayNoWash ? '#b91c1c' : '#16a34a',
                }}>
                {todayNoWash ? 'NU se spală haine azi' : 'Se pot spăla haine azi'}
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a', marginTop: 12, textAlign: 'center' }}>
                Următoarele evenimente ({visible.length}/{upcomingAll.length})
              </Text>
              <Text style={{ color: '#475569', marginTop: 4, textAlign: 'center' }}>
                Legal + Ortodox (cruce roșie/neagră). Numai cele cu impact (libere sau cu cruce).
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}
