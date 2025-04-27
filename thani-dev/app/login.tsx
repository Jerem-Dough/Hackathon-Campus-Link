import { Stack } from 'expo-router';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseconfig';
import { useRouter } from 'expo-router';
import { StyleSheet, TextInput, Button, Alert, Image, TouchableOpacity} from 'react-native';

import { Text, View } from '@/components/Themed';
import { useState } from 'react';
import Logo from '../constants/transparent_logo.png'; // adjust path if needed

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
        <Image source={Logo} style={styles.logo} />
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
    paddingHorizontal: 30,
  },
  title: {
    fontFamily: 'Poppins',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 90,
  },
  input: {
    fontFamily: 'Poppins',
    width: '100%',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  logo: {
    width: 350,
    height: 350,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: '#38b6ff', // Your blue theme
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    fontFamily: 'Poppins',
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
