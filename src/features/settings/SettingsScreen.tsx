import React from 'react';
import {
  Alert,
  Button,
  Keyboard,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { NotificationSettings } from '../../domain/types';
import { useSettingsStore } from '../../app/state/useSettingsStore';

function useNotificationSettings() {
  const notification = useSettingsStore(state => state.settings.notification);
  const patchNotification = useSettingsStore(state => state.patchNotification);
  const resetNotification = useSettingsStore(state => state.resetNotification);
  return { notification, patchNotification, resetNotification };
}

export default function SettingsScreen() {
  const { notification, patchNotification, resetNotification } = useNotificationSettings();

  const update = <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K],
  ) => {
    patchNotification({ [key]: value } as Pick<NotificationSettings, K>);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Local Notifications</Text>
        <Text style={styles.subtitle}>
          Notification rules are persisted instantly and applied globally.
        </Text>

        <Row
          label="Notifications ON / OFF"
          control={
            <Switch
              accessibilityLabel="Toggle notifications"
              accessibilityRole="switch"
              value={notification.notificationsEnabled}
              onValueChange={v => update('notificationsEnabled', v)}
            />
          }
        />
        <Row
          label="Legal holidays"
          control={
            <Switch
              accessibilityLabel="Toggle legal holiday notifications"
              accessibilityRole="switch"
              value={notification.notifyLegal}
              onValueChange={v => update('notifyLegal', v)}
            />
          }
        />
        <Row
          label="Orthodox holidays"
          control={
            <Switch
              accessibilityLabel="Toggle orthodox holiday notifications"
              accessibilityRole="switch"
              value={notification.notifyOrthodox}
              onValueChange={v => update('notifyOrthodox', v)}
            />
          }
        />

        <Row
          label="Orthodox level"
          control={
            <View style={styles.rowButtons}>
              <LevelButton
                title="Red only"
                active={notification.orthodoxLevel === 'RED'}
                onPress={() => update('orthodoxLevel', 'RED')}
                color="#c1121f"
              />
              <LevelButton
                title="Red + black"
                active={notification.orthodoxLevel === 'RED_BLACK'}
                onPress={() => update('orthodoxLevel', 'RED_BLACK')}
                color="#1d1d1f"
              />
            </View>
          }
        />

        <Row
          label="Hour (1 day before)"
          control={
            <TextInput
              accessibilityLabel="Hour one day before"
              keyboardType="number-pad"
              value={String(notification.dayBeforeHour)}
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
          label="Hour (same day)"
          control={
            <TextInput
              accessibilityLabel="Hour on event day"
              keyboardType="number-pad"
              value={String(notification.sameDayHour)}
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
          label="Look-ahead days"
          control={
            <TextInput
              accessibilityLabel="Look ahead days"
              keyboardType="number-pad"
              value={String(notification.lookAheadDays)}
              onChangeText={text => {
                const n = Number(text);
                const clamped = Math.min(365, Math.max(1, Number.isFinite(n) ? n : 1));
                update('lookAheadDays', clamped);
              }}
              style={styles.input}
            />
          }
        />

        <View style={styles.resetWrap}>
          <Button
            title="Reset defaults"
            color="#ef4444"
            onPress={() => {
              Alert.alert('Reset', 'Reset notification settings to defaults?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'OK', onPress: resetNotification },
              ]);
            }}
          />
        </View>

        <Text style={styles.hint}>
          Changes are persisted in MMKV and applied without reopening the app.
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
      accessibilityLabel={`Set orthodox level ${title}`}
      accessibilityRole="button"
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
    width: 72,
    padding: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    textAlign: 'center',
  },
  resetWrap: { marginTop: 12 },
  hint: { color: '#475569', fontSize: 12, marginTop: 8 },
});
