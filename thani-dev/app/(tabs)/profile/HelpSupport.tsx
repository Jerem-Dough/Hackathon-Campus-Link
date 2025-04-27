import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

export default function HelpSupportScreen() {
  // Log the reason for the not-found screen
  console.log('NotFoundScreen rendered: The requested route does not exist.');

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Privacy and Security.</Text>
        {/* <Link href="/home" style={styles.link}> */}
        <Text style={styles.linkText}>
          At our company, we prioritize your privacy and security by implementing state-of-the-art encryption protocols, adhering to global compliance standards, and ensuring robust data protection measures to safeguard your personal information.
        </Text>
        {/* </Link> */}
      </View>
    </>
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
