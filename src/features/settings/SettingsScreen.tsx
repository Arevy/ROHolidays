import React, { useEffect } from 'react';
import { Button, Switch, Text, TextInput, View, StyleSheet, Alert, Pressable, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useSettings } from '../../app/state/SettingsContext';
import { useEvents } from '../../data/queries/events';
import { scheduleNotifications } from '../../services/notifications';

export default function SettingsScreen() {
  const { settings, setSettings } = useSettings();
  const { data: events } = useEvents();

  useEffect(() => {
    if (!events) return;
    void scheduleNotifications({ events, settings: settings.notification }).catch(err =>
      console.warn('scheduleNotifications', err),
    );
  }, [settings, events]);

  const update = (path: keyof typeof settings.notification, value: unknown) => {
    setSettings({
      ...settings,
      notification: {
        ...settings.notification,
        [path]: value,
      },
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
      <Text style={styles.title}>Notificări locale</Text>
      <Text style={styles.subtitle}>
        Trimitem alerte locale (Notifee) pentru zile libere legale și sărbători ortodoxe, conform preferințelor de mai jos.
      </Text>

      <Row
        label="Notificări ON / OFF"
        control={<Switch value={settings.notification.notificationsEnabled} onValueChange={v => update('notificationsEnabled', v)} />}
      />
      <Row
        label="Alerte zile libere legale"
        control={<Switch value={settings.notification.notifyLegal} onValueChange={v => update('notifyLegal', v)} />}
      />
      <Row
        label="Alerte sărbători ortodoxe"
        control={<Switch value={settings.notification.notifyOrthodox} onValueChange={v => update('notifyOrthodox', v)} />}
      />

      <Row
        label="Nivel ortodox"
        control={
          <View style={styles.rowButtons}>
            <LevelButton
              title="Doar roșu"
              active={settings.notification.orthodoxLevel === 'RED'}
              onPress={() => update('orthodoxLevel', 'RED')}
              color="#c1121f"
            />
            <LevelButton
              title="Roșu + negru"
              active={settings.notification.orthodoxLevel === 'RED_BLACK'}
              onPress={() => update('orthodoxLevel', 'RED_BLACK')}
              color="#1d1d1f"
            />
          </View>
        }
      />

      <Row
        label="Ora notificare cu 1 zi înainte"
        control={
          <TextInput
            keyboardType="number-pad"
            value={String(settings.notification.dayBeforeHour)}
            onChangeText={text => {
              const n = Number(text);
              const clamped = Math.min(23, Math.max(0, Number.isFinite(n) ? n : 0));
              update('dayBeforeHour', clamped);
            }}
            style={styles.input}
          />
        }
      />
      <Row
        label="Ora notificare în ziua evenimentului"
        control={
          <TextInput
            keyboardType="number-pad"
            value={String(settings.notification.sameDayHour)}
            onChangeText={text => {
              const n = Number(text);
              const clamped = Math.min(23, Math.max(0, Number.isFinite(n) ? n : 0));
              update('sameDayHour', clamped);
            }}
            style={styles.input}
          />
        }
      />
      <Row
        label="Număr de zile programate în avans"
        control={
          <TextInput
            keyboardType="number-pad"
            value={String(settings.notification.lookAheadDays)}
            onChangeText={text => {
              const n = Number(text);
              const clamped = Math.min(365, Math.max(1, Number.isFinite(n) ? n : 1));
              update('lookAheadDays', clamped);
            }}
            style={styles.input}
          />
        }
      />

      <View style={{ marginTop: 12 }}>
        <Button
          title="Resetează la implicit"
          color="#ef4444"
          onPress={() => {
            Alert.alert('Reset', 'Resetezi setările?', [
              { text: 'Anulează', style: 'cancel' },
              {
                text: 'OK',
                onPress: () =>
                  setSettings({
                    ...settings,
                    notification: {
                      notificationsEnabled: true,
                      notifyLegal: true,
                      notifyOrthodox: true,
                      orthodoxLevel: 'RED',
                      dayBeforeHour: 18,
                      sameDayHour: 8,
                      lookAheadDays: 90,
                    },
                  }),
              },
            ]);
          }}
        />
      </View>
      <Text style={styles.hint}>
        Notă: notificările sunt programate local; schimbările se reaplică când modifici oricare dintre setări.
      </Text>
      </View>
    </TouchableWithoutFeedback>
  );
}

function Row({ label, control }: { label: string; control: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.control}>{control}</View>
    </View>
  );
}

function LevelButton({
  title,
  active,
  onPress,
  color,
}: {
  title: string;
  active: boolean;
  onPress: () => void;
  color: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.levelButton,
        {
          borderColor: color,
          backgroundColor: active ? `${color}20` : '#fff',
        },
      ]}>
      <Text style={{ color, fontWeight: '700' }}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  subtitle: { color: '#475569', marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { flex: 1, fontSize: 14, color: '#334155', marginRight: 8 },
  control: { flexShrink: 0 },
  rowButtons: { flexDirection: 'row', gap: 8 },
  levelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  input: {
    width: 64,
    padding: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    textAlign: 'center',
  },
  hint: { color: '#475569', fontSize: 12, marginTop: 8 },
});
