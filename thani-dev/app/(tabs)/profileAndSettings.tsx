import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function ProfileAndSettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile & Settings</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <Text>Manage your preferences and account here!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '80%',
  },
});
