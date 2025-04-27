import { Stack } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseconfig";
import { useRouter } from "expo-router";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  View,
  ScrollView,
} from "react-native";
import { Text } from "@/components/Themed";
import { useState } from "react";
import Logo from "../constants/transparent_logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const router = useRouter();

  async function handleLogin() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/home");
      Alert.alert("Success", "Logged in!");
      console.log("logged in!");
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "code" in error) {
        const err = error as { code: string; message: string };
        if (err.code === "auth/user-not-found") {
          Alert.alert("Account not found", "Redirecting to signup...");
          router.replace("./signup");
        } else if (err.code === "auth/wrong-password") {
          Alert.alert("Wrong Password", "Please try again.");
        } else {
          Alert.alert("Login Error", err.message);
        }
      } else {
        console.error(error);
        Alert.alert("Login Error", "An unknown error occurred.");
      }
    }
  }

  return (
    <View style={styles.outer}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Image source={Logo} style={styles.logo} />

          <Text style={styles.title}>Login</Text>

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
            onChangeText={setPass}
          />

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, styles.signUpButton]}
            onPress={() => router.push("./signup")}
          >
            <Text style={[styles.loginButtonText, styles.signUpButtonText]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  formContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 60, // leave space at bottom
    // optional card shadow:
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logo: {
    width: 180,
    height: 180,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 24,
  },
  title: {
    fontFamily: "Poppins",
    fontSize: 24,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 24,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    fontSize: 16,
    fontFamily: "Poppins",
    backgroundColor: "#fafafa",
  },
  loginButton: {
    width: "100%",
    backgroundColor: "#2e78b7",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
  },
  loginButtonText: {
    fontFamily: "Poppins",
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  signUpButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#2e78b7",
  },
  signUpButtonText: {
    color: "#2e78b7",
  },
});
