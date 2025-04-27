import React, { useState, useEffect } from 'react';
import { View, Text, Button, Switch, StyleSheet, Platform, TextInput } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Configure how notifications are shown when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/**
 * Public function to trigger a local notification immediately.
 * @param text The title/body text of the notification.
 */
export async function callNotif(text: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: text,
      body: text,
      data: {},
    },
    // null trigger means fire immediately
    trigger: null,
  });
}

/**
 * Register for push notifications and obtain Expo push token.
 */
async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default Channel',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  if (!Device.isDevice) {
    alert('Must use a physical device for push notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Notification permissions not granted');
    return null;
  }

  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId: projectId! });
    token = tokenData.data;
  } catch (e) {
    console.error(e);
  }

  return token;
}

/**
 * Screen to manage notification settings and test notifications.
 */
export default function NotificationSettingsScreen() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [enabled, setEnabled] = useState<boolean>(true);
  const [inputText, setInputText] = useState<string>('Hello!');

  useEffect(() => {
    // On mount, register for push
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
  }, []);

  const toggleEnabled = async (value: boolean) => {
    setEnabled(value);
    if (value) {
      await Notifications.requestPermissionsAsync();
    } else {
      // Cannot programmatically disable once granted; instruct user
      alert('To disable notifications, adjust permissions in system settings');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Notification Settings</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Notifications Enabled</Text>
        <Switch value={enabled} onValueChange={toggleEnabled} />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Expo Push Token:</Text>
        <Text selectable style={styles.token}>{expoPushToken || 'Fetching...'}</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Test Notification Text:</Text>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Enter text to notify"
        />
      </View>

      <Button title="Send Test Notification" onPress={() => callNotif(inputText)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    flex: 1,
    fontSize: 16,
  },
  token: {
    flex: 2,
    fontSize: 12,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    marginTop: 5,
  },
});
