import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  Alert,
  View,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Text } from '@/components/Themed';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import Logo from '../constants/transparent_logo.png';

export default function LoginScreen() {
  const colorScheme = useColorScheme() || 'light';
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
    // Basic client-side validation
    if (!email.trim()) {
      Alert.alert('Email is required');
      return;
    }
    if (!password) {
      Alert.alert('Password is required');
      return;
    }

    try {
      const response = await fetch('http://10.5.176.13:5000/api/users/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        console.log('Logged in!', data);
        Alert.alert('Success', 'Logged in!');
        router.push('/home');
      } else {
        router.replace('./signup');
        Alert.alert('Login Error', data.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Network error:', err);
      Alert.alert('Login Error', 'Unable to reach server');
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: Colors[colorScheme].background },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Image source={Logo} style={styles.logo} />
        <Text style={[styles.title, { color: Colors[colorScheme].text }]}>Welcome Back</Text>

        <TextInput
          style={[
            styles.input,
            {
              borderColor: Colors[colorScheme].border,
              color: Colors[colorScheme].text,
            },
          ]}
          placeholder="Email"
          placeholderTextColor={Colors[colorScheme].border}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          returnKeyType="next"
        />

        <TextInput
          style={[
            styles.input,
            {
              borderColor: Colors[colorScheme].border,
              color: Colors[colorScheme].text,
            },
          ]}
          placeholder="Password"
          placeholderTextColor={Colors[colorScheme].border}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          returnKeyType="done"
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingBottom: 60, // extra space at the very bottom
  },
  logo: {
    width: 350,
    height: 350,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  title: {
    fontFamily: 'Poppins',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  input: {
    fontFamily: 'Poppins',
    width: '100%',
    borderBottomWidth: 1,
    paddingVertical: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#38b6ff', // Primary blue accent
    paddingVertical: 15,
    width: '100%',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40, // pushes button up and adds space below
  },
  loginButtonText: {
    fontFamily: 'Poppins',
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});


