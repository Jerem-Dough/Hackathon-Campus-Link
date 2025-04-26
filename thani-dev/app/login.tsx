import { Link, Stack } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseconfig';
import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

export default function Login() {

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>

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
