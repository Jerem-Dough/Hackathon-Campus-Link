import { Link, Redirect, Stack } from 'expo-router';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseconfig';
import { useRouter } from 'expo-router';
import { StyleSheet, TextInput, Button, Alert} from 'react-native';

import { Text, View } from '@/components/Themed';
import { useState } from 'react';


const interests = ['🤖AI', '🎮Gaming', '🍳Cooking', '🎨Art', '🎵Music', '	🏋️‍♂️Fitness'];

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPass] = useState('');
  const [name, setName] = useState('');
  const [major, setMajor] = useState('');
  const [school, setSchool] = useState('');
  const [interest, setInterests] = useState<string[]>([]);
  const router = useRouter();

  function pickInterests(interest:string) {

  }
  async function handleSignup() {
        try{
          const userCredentials =  await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredentials.user;
          if (user) {

            await fetch('https://your-backend-api.com/api/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                uid: user.uid,
                email: user.email,
                name: name,
                major: major,
                school: school,
                interests: interests,
                createdAt: new Date().toISOString(),
              }),
          });
          Alert.alert('Signing Up')
        }

        } catch(createError: unknown) {
          console.error(createError)
          Alert.alert('User Not found')

        }
  }

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Sign Up</Text>
        <TextInput 
          style={styles.input}
          onChangeText={setEmail}
          placeholder='example@du.edu'
          value={email}>
        </TextInput>
        <TextInput 
          style={styles.input}
          onChangeText={setPass}
          value={password}
          placeholder='password'>
        </TextInput>
        <TextInput 
          style={styles.input}
          onChangeText={setName}
          value={name}
          placeholder='John'>
        </TextInput>
        <TextInput 
          style={styles.input}
          onChangeText={setMajor}
          value={major}
          placeholder='Computer Science'>
        </TextInput>
        <TextInput 
          style={styles.input}
          onChangeText={setSchool}
          value={school}
          placeholder='University of Denver'>
        </TextInput>
        
        <Button title='Sign Up' onPress={handleSignup} />

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
