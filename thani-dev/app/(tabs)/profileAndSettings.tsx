import React, { useState, useMemo } from 'react';
import { StyleSheet, TextInput, FlatList, Pressable, View, Text, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

/**
 * File-based routes assumed:
 * app/profile/index.tsx      -> this screen
 * app/profile/account.tsx    -> Account screen
 * app/profile/notifications.tsx
 * app/profile/appearance.tsx
 * app/profile/privacy-security.tsx
 * app/profile/help-support.tsx
 */

type Option = {
  key: string;
  title: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  route: string;
};

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState<string>('');

  const options: Option[] = useMemo(
    () => [
      { key: 'account', title: 'Account', icon: 'person-outline' as const, route: './profile/account' },
      { key: 'notifications', title: 'Notifications', icon: 'notifications-outline' as const, route: './profile/Notifications' },
      { key: 'appearance', title: 'Appearance', icon: 'eye-outline' as const, route: './profile/appearance' },
      { key: 'privacy', title: 'Privacy & Security', icon: 'lock-closed-outline' as const, route: './profile/PrivacySecurity' },
      { key: 'help', title: 'Help & Support', icon: 'help-circle-outline' as const, route: './profile/HelpSupport' },
    ],
    []
  );

  const filtered = useMemo(
    () =>
      options.filter(o =>
        o.title.toLowerCase().includes(search.trim().toLowerCase())
      ),
    [search]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile & Settings</Text>

      <TextInput
        style={styles.search}
        placeholder="Search for a setting…"
        placeholderTextColor="gray"
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filtered}
        keyExtractor={item => item.key}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => router.push(item.route as any)}
            // onPress={() => router.push(item.route)}
>
            <Ionicons name={item.icon} size={24} style={styles.rowIcon} />
            <Text style={styles.rowText}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={20} style={styles.rowChevron} />
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'black',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: "white",
    marginBottom: 12,
  },
  search: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
    borderColor: '#ccc',
    color: "white"
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginLeft: 52,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  rowPressed: {
    opacity: 0.5,
  },
  rowIcon: {
    width: 32,
    textAlign: 'center',
    color: "white"
  },
  rowText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    color: "white"
  },
  rowChevron: {
    color: "white"
  },
});
