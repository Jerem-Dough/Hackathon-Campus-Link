import React, { useState } from "react";
import { StyleSheet, TextInput, Button, Alert, View } from "react-native";
import { Text } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const colorScheme = useColorScheme() || "light";
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    // Client-side validation
    if (!email.trim()) {
      Alert.alert("Email is required");
      return;
    }
    if (!password) {
      Alert.alert("Password is required");
      return;
    }

    try {
      const response = await fetch("http://10.5.176.13:5000/api/users/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        // Login succeeded
        console.log("Logged in!", data);
        Alert.alert("Success", "Logged in!");
        router.push("/home");
      } else {
        // Backend returned error
        router.replace("./signup");
        Alert.alert("Login Error", data.error || "Invalid credentials");
      }
    } catch (err) {
      console.error("Network error:", err);
      Alert.alert("Login Error", "Unable to reach server");
    }
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <Text style={[styles.title, { color: Colors[colorScheme].text }]}>
        Welcome Back
      </Text>
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
      />
      <View style={styles.buttonWrapper}>
        <Button title="Log In" onPress={handleLogin} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  buttonWrapper: {
    marginTop: 10,
  },
});
