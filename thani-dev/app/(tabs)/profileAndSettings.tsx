import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

// Import your internal components from components/profile
import Account from '../../components/profile/account';
import NotificationsdT from '../../components/profile/NotificationsdT';
import Appearence from '../../components/profile/Appearence';
import PrivacySecurity from '../../components/profile/PrivacySecurity';
import HelpSupport from '../../components/profile/HelpSupport';

// Define the shape of each settings option
interface Option {
  key: string;
  title: string;
  icon: string;
}

export default function ProfileAndSettings() {
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  // Static options list
  const options: Option[] = [
    { key: 'account', title: 'Account', icon: 'person-outline' },
    { key: 'notifications', title: 'Notifications', icon: 'notifications-outline' },
    { key: 'appearance', title: 'Appearance', icon: 'eye-outline' },
    { key: 'privacy', title: 'Privacy & Security', icon: 'lock-closed-outline' },
    { key: 'help', title: 'Help & Support', icon: 'help-circle-outline' },
  ];

  return (
    <View style={styles.container}>
      {selectedOption === null ? (
        // Main settings screen (list)
        <ScrollView contentContainerStyle={styles.optionsContainer}>
          {options.map(option => (
            <TouchableOpacity
              key={option.key}
              style={styles.option}
              onPress={() => setSelectedOption(option)}
            >
              <Text style={styles.optionText}>{option.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        // Detail screen (component)
        <View style={styles.detailContainer}>
          <TouchableOpacity onPress={() => setSelectedOption(null)}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>

          {/* Dynamically render selected screen */}
          {selectedOption.key === 'account' && <Account />}
          {selectedOption.key === 'notifications' && <NotificationsdT />}
          {selectedOption.key === 'appearance' && <Appearence />}
          {selectedOption.key === 'privacy' && <PrivacySecurity />}
          {selectedOption.key === 'help' && <HelpSupport />}
        </View>
      )}
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  optionsContainer: {
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  option: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  optionText: {
    fontSize: 18,
    fontFamily: 'Roboto',
  },
  detailContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  backButton: {
    color: 'blue',
    fontSize: 16,
    marginBottom: 10,
  },
});
