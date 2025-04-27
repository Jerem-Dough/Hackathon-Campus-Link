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
  const router = useRouter();

  async function handleLogin() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/home")
      Alert.alert('Success', 'Logged in!');
      console.log("logged in!")

    } catch (error: unknown){
      if(error instanceof Error) {
        try{
          await createUserWithEmailAndPassword(auth, email, password);
          Alert.alert('Signing Up')

        } catch(createError: unknown) {
          console.error(createError)
          Alert.alert('User Not found')

        }
      }else{
        console.error(error);
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
          placeholder="Password"
          secureTextEntry
          style={styles.input}
        />
        <Button title="Login" onPress={handleLogin} />
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
