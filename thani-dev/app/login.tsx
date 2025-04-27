import { Link, Redirect, Stack } from 'expo-router';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseconfig';
import { useRouter } from 'expo-router';
import { StyleSheet, TextInput, Button, Alert} from 'react-native';

import { Text, View } from '@/components/Themed';
import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPass] = useState('');
  const [name, setName] = useState('');
  const router = useRouter();

  async function handleLogin() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/home");
      Alert.alert('Success', 'Logged in!');
      console.log("logged in!");

    } catch (error: unknown){
       if (typeof error === 'object' && error !== null && 'code' in error) {
    const err = error as { code: string; message: string };

    if (err.code === 'auth/user-not-found') {
      Alert.alert('Account not found', 'Redirecting to signup...');
      router.replace('./signup');
    } else if (err.code === 'auth/wrong-password') {
      Alert.alert('Wrong Password', 'Please try again.');
    } else {
      Alert.alert('Login Error', err.message);
    }
  } else {
    console.error(error);
    Alert.alert('Login Error', 'An unknown error occurred.');
  }
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPass}
          placeholder='password'>
        </TextInput>
        <Button title='Login' onPress={handleLogin} />
        <Button title='Sign Up' onPress={() => router.push('./signup')} />

      </View>
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  input: {
    borderBottomWidth: 1.5,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  linkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
