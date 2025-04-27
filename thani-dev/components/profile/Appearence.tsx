import React, { useState } from 'react';
import { Text, StyleSheet, View, Switch } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function Appearance() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleSwitch = () => setIsDarkMode((previousState) => !previousState);

    const themeTextStyle = isDarkMode ? styles.darkThemeText : styles.lightThemeText;
    const themeContainerStyle = isDarkMode ? styles.darkContainer : styles.lightContainer;

    return (
        <View style={[styles.container, themeContainerStyle]}>
            <Text style={[styles.text, themeTextStyle]}>
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </Text>
            <Switch
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
                onValueChange={toggleSwitch}
                value={isDarkMode}
            />
            <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 20,
        marginBottom: 20,
    },
    lightContainer: {
        backgroundColor: '#d0d0c0',
        flex: 1,
    },
    darkContainer: {
        backgroundColor: '#242c40',
        flex: 1,
    },
    lightThemeText: {
        fontFamily: 'Poppins',
        color: '#242c40',
    },
    darkThemeText: {
        fontFamily: 'Poppins',
        color: '#d0d0c0',
    },
});