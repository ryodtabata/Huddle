import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from "../../firebase/authFunctions";

// Create a form component that will render as <form> on web
const FormView =
  Platform.OS === "web"
    ? ({ children, onSubmit, style, ...props }: any) => {
        // Filter out React Native specific props that don't belong on HTML form elements
        const { pointerEvents, ...webProps } = props;
        const webStyle = {
          ...style,
          ...(pointerEvents && { pointerEvents }),
        };

        return React.createElement(
          "form",
          {
            onSubmit: (e: any) => {
              e.preventDefault();
              onSubmit?.();
            },
            style: webStyle,
            ...webProps,
          },
          children
        );
      }
    : ({ children, style, ...props }: any) =>
        React.createElement(View, { style, ...props }, children);

interface AuthScreenProps {
  onAuthSuccess: (isNewUser?: boolean) => void;
}

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const insets = useSafeAreaInsets();

  const handleAuth = async () => {
    setErrorMessage(""); // Clear previous errors

    if (!email || !password) {
      setErrorMessage("Please fill in all required fields");
      return;
    }

    if (isSignUp) {
      if (!name) {
        setErrorMessage("Please enter your name");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match");
        return;
      }
      if (password.length < 6) {
        setErrorMessage("Password must be at least 6 characters");
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }

      if (isSignUp) {
        Alert.alert("Success", "Account created successfully!", [
          { text: "OK", onPress: () => onAuthSuccess() },
        ]);
      } else {
        onAuthSuccess();
      }
    } catch (error) {
      console.error("Authentication error:", error);

      // Handle specific Firebase errors
      let errorMsg = "Authentication failed. Please try again.";

      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as any).message === "string"
      ) {
        const message = (error as any).message as string;
        if (message.includes("auth/invalid-credential")) {
          errorMsg =
            "Invalid email or password. Please check your credentials.";
        } else if (message.includes("auth/user-not-found")) {
          errorMsg = "No account found with this email address.";
        } else if (message.includes("auth/wrong-password")) {
          errorMsg = "Incorrect password. Please try again.";
        } else if (message.includes("auth/invalid-email")) {
          errorMsg = "Please enter a valid email address.";
        } else if (message.includes("auth/user-disabled")) {
          errorMsg = "This account has been disabled.";
        } else if (message.includes("auth/email-already-in-use")) {
          errorMsg = "An account with this email already exists.";
        } else if (message.includes("auth/weak-password")) {
          errorMsg = "Password is too weak. Please choose a stronger password.";
        } else if (message.includes("auth/network-request-failed")) {
          errorMsg = "Network error. Please check your internet connection.";
        } else if (message.includes("auth/too-many-requests")) {
          errorMsg = "Too many failed attempts. Please try again later.";
        }
      }

      setErrorMessage(errorMsg); // Set error message instead of Alert
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(""); // Clear previous errors
    setIsLoading(true);
    try {
      await signInWithGoogle();
      Alert.alert("Success", "Signed in with Google!", [
        { text: "OK", onPress: () => onAuthSuccess() },
      ]);
    } catch (error) {
      setErrorMessage("Google sign in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>Huddle</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? "Create your account" : "Welcome back"}
          </Text>
        </View>

        {/* Form */}
        <FormView style={styles.form} onSubmit={handleAuth}>
          {isSignUp && (
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#4fc3f7"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#888"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#4fc3f7"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#4fc3f7"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              textContentType={isSignUp ? "newPassword" : "password"}
            />
          </View>

          {isSignUp && (
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#4fc3f7"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#888"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
              />
            </View>
          )}

          {/* Error Message - Add this below the password fields */}
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Main Auth Button */}
          <Pressable
            style={[styles.authButton, isLoading && styles.disabledButton]}
            onPress={handleAuth}
            disabled={isLoading}
          >
            <Text style={styles.authButtonText}>
              {isLoading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
            </Text>
          </Pressable>
        </FormView>

        {/* Buttons outside of form */}
        <View style={styles.additionalActions}>
          {/* Google Sign In */}
          <Pressable
            style={[styles.googleButton, isLoading && styles.disabledButton]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            <Ionicons
              name="logo-google"
              size={20}
              color="#fff"
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </Pressable>

          {/* Forgot Password (Sign In only) */}
          {!isSignUp && (
            <Pressable
              style={styles.forgotPasswordButton}
              onPress={() =>
                Alert.alert(
                  "Info",
                  "Forgot password functionality coming soon!"
                )
              }
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </Pressable>
          )}
        </View>

        {/* Toggle Sign In/Up */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
          </Text>
          <Pressable onPress={() => setIsSignUp(!isSignUp)}>
            <Text style={styles.toggleLink}>
              {isSignUp ? "Sign In" : "Sign Up"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  container: {
    flex: 1,
    backgroundColor: "#181c24",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#4fc3f7",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#b0b0b0",
    textAlign: "center",
  },
  form: {
    marginBottom: 30,
  },
  additionalActions: {
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#232a36",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    paddingVertical: 16,
  },
  authButton: {
    backgroundColor: "#4fc3f7",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  authButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  googleButton: {
    backgroundColor: "#db4437",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  googleIcon: {
    marginRight: 8,
  },
  googleButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
  forgotPasswordButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  forgotPasswordText: {
    color: "#4fc3f7",
    fontSize: 16,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  toggleText: {
    color: "#b0b0b0",
    fontSize: 16,
    marginRight: 4,
  },
  toggleLink: {
    color: "#4fc3f7",
    fontSize: 16,
    fontWeight: "bold",
  },
});
