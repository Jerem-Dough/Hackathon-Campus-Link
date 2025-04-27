import React, { useState, useMemo } from 'react';
import {
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Text } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

export default function ProfileFormScreen() {
    const { colors } = useTheme();

    const [firstName, setFirstName] = useState('Velda');
    const [lastName, setLastName] = useState('Kiara');
    const [email, setEmail] = useState('velda@gmail.com');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const initials = useMemo(() => {
        return (
            (firstName[0] || '').toUpperCase() +
            (lastName[0] || '').toUpperCase()
        );
    }, [firstName, lastName]);

    const onSave = () => {
        console.log({ firstName, lastName, email, password, confirm });
    };

    const allFilled = useMemo(
        () =>
            firstName.trim() &&
            lastName.trim() &&
            email.trim() &&
            password &&
            password === confirm,
        [firstName, lastName, email, password, confirm]
    );

    return (
        <ScrollView
            contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
            keyboardShouldPersistTaps="handled"
        >
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={[styles.avatarText, { color: colors.card }]}>{initials}</Text>
            </View>
            <Text style={[styles.name, { color: colors.text }]}>{`${firstName} ${lastName}`}</Text>
            <Text style={[styles.plan, { color: colors.text }]}>Pro Plan</Text>

            <Text style={[styles.label, { color: colors.text }]}>First Name</Text>
            <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First Name"
                placeholderTextColor={colors.text}
            />

            <Text style={[styles.label, { color: colors.text }]}>Last Name</Text>
            <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last Name"
                placeholderTextColor={colors.text}
            />

            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder="you@example.com"
                placeholderTextColor={colors.text}
                autoCapitalize="none"
            />

            <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
            <View style={styles.passwordWrapper}>
                <TextInput
                    style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPass}
                    placeholder="••••••••"
                    placeholderTextColor={colors.text}
                />
                <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPass((v) => !v)}
                >
                    <Ionicons
                        name={showPass ? 'eye' : 'eye-off'}
                        size={20}
                        color={colors.text}
                    />
                </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
            <View style={styles.passwordWrapper}>
                <TextInput
                    style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                    value={confirm}
                    onChangeText={setConfirm}
                    secureTextEntry={!showConfirm}
                    placeholder="••••••••"
                    placeholderTextColor={colors.text}
                />
                <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirm((v) => !v)}
                >
                    <Ionicons
                        name={showConfirm ? 'eye' : 'eye-off'}
                        size={20}
                        color={colors.text}
                    />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[
                    styles.saveButton,
                    { backgroundColor: allFilled ? colors.primary : colors.border },
                ]}
                onPress={onSave}
                disabled={!allFilled}
            >
                <Text style={[styles.saveText, { color: colors.card }]}>Save</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: 'bold',
        fontFamily: 'Poppins',
    },
    name: {
        fontSize: 20,
        fontWeight: '600',
        fontFamily: 'Poppins',
    },
    plan: {
        fontSize: 14,
        marginBottom: 24,
        fontFamily: 'Poppins',
    },
    label: {
        alignSelf: 'flex-start',
        fontFamily: 'Poppins',
        marginBottom: 6,
        fontSize: 14,
        fontWeight: '500',
    },
    input: {
        width: '100%',
        fontFamily: 'Poppins',
        padding: 12,
        borderWidth: 1,
        borderRadius: 6,
        marginBottom: 16,
    },
    passwordWrapper: {
        fontFamily: 'Poppins',
        width: '100%',
        position: 'relative',
    },
    eyeButton: {
        position: 'absolute',
        right: 12,
        top: 12,
    },
    saveButton: {
        marginTop: 10,
        width: '100%',
        paddingVertical: 14,
        borderRadius: 6,
        alignItems: 'center',
    },
    saveText: {
        fontFamily: 'Poppins',
        fontSize: 16,
        fontWeight: '600',
    },
});
