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
          placeholder="Password"
          secureTextEntry
          style={styles.input}
        />
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
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
