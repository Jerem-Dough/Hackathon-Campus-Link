import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  View,
} from 'react-native';
import { Text } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';

const ACCENT = '#38b6ff'; // keep the same blue accent as Login

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [major, setMajor] = useState('');
  const [campus, setCampus] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const router = useRouter();

  const interestsArray = [
    'AI',
    'Machine Learning',
    'Gaming',
    'Art',
    'Music',
    'Fitness',
  ];

  const interestIcons: Record<string, keyof typeof FontAwesome.glyphMap> = {
    AI: 'microchip',
    'Machine Learning': 'cogs',
    Gaming: 'gamepad',
    Art: 'paint-brush',
    Music: 'music',
    Fitness: 'heartbeat',
  };

  function toggleInterest(item: string) {
    setSelectedInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  }

  async function handleSignup() {
    const payload = {
      name,
      email,
      password,
      major,
      campus,
      interest: selectedInterests,
      organization_title: organizationId,
    };

    console.log('→ Sending payload:', payload);
    try {
      const res = await fetch('http://10.5.176.13:5000/api/users/create_user/', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg =
          (data as any).detail || (data as any).message || JSON.stringify(data);
        return Alert.alert('Error Creating User', msg);
      }
      router.push('/home');
      Alert.alert('Success', 'User created successfully!');
      console.log('Success response:', data);
    } catch (e) {
      console.error('Network or parsing error:', e);
      Alert.alert(
        'Error',
        'Unable to reach server. Please check your network and try again.'
      );
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Major"
        value={major}
        onChangeText={setMajor}
      />
      <TextInput
        style={styles.input}
        placeholder="Campus"
        value={campus}
        onChangeText={setCampus}
      />
      <TextInput
        style={styles.input}
        placeholder="Organization ID (title)"
        value={organizationId}
        onChangeText={setOrganizationId}
      />

      {/* Interests dropdown */}
      <TouchableOpacity
        style={styles.dropdownHeader}
        onPress={() => setDropdownOpen((o) => !o)}
      >
        <Text style={styles.dropdownHeaderText}>Select Interests</Text>
        <FontAwesome
          name={dropdownOpen ? 'minus-circle' : 'plus-circle'}
          size={24}
          color={ACCENT}
        />
      </TouchableOpacity>
      {dropdownOpen && (
        <View style={styles.interestsContainer}>
          {interestsArray.map((item) => {
            const selected = selectedInterests.includes(item);
            return (
              <TouchableOpacity
                key={item}
                style={[styles.interestButton, selected && styles.interestButtonSelected]}
                onPress={() => toggleInterest(item)}
              >
                <FontAwesome
                  name={interestIcons[item]}
                  size={16}
                  color={selected ? '#fff' : ACCENT}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[styles.interestText, selected && styles.interestTextSelected]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Rounded Sign Up */}
      <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
        <Text style={styles.signupButtonText}>Sign Up</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  dropdownHeaderText: {
    fontSize: 16,
    fontWeight: '600',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  interestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ACCENT,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 4,
  },
  interestButtonSelected: {
    backgroundColor: ACCENT,
  },
  interestText: {
    fontSize: 14,
    color: ACCENT,
  },
  interestTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  signupButton: {
    backgroundColor: ACCENT,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
