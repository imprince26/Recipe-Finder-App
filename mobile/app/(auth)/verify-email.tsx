import { useSignUp } from "@clerk/clerk-expo";
import { useState } from "react";
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";
import { authStyles } from "../../assets/styles/authStyles";
import { Image } from "expo-image";
import { COLORS } from "../../constants/colors";

// Define interface for component props
interface VerifyEmailProps {
  email: string;
  onBack: () => void;
}

// Define interface for Clerk error handling
interface ClerkError {
  errors?: { message: string }[];
}

const VerifyEmail: React.FC<VerifyEmailProps> = ({ email, onBack }) => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleVerification = async () => {
    if (!isLoaded) return;

    setLoading(true);
    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({ code });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
      } else {
        Alert.alert("Error", "Verification failed. Please try again.");
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err: unknown) {
      const error = err as ClerkError;
      Alert.alert("Error", error.errors?.[0]?.message || "Verification failed");
      console.error(JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={authStyles.container as ViewStyle}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={authStyles.keyboardView as ViewStyle}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={authStyles.scrollContent as ViewStyle}
          showsVerticalScrollIndicator={false}
        >
          {/* Image Container */}
          <View style={authStyles.imageContainer as ViewStyle}>
            <Image
              source={require("../../assets/images/i3.png")}
              style={authStyles.image}
              contentFit="contain"
            />
          </View>

          {/* Title */}
          <Text style={authStyles.title as TextStyle}>Verify Your Email</Text>
          <Text style={authStyles.subtitle as TextStyle}>We've sent a verification code to {email}</Text>

          <View style={authStyles.formContainer as ViewStyle}>
            {/* Verification Code Input */}
            <View style={authStyles.inputContainer as ViewStyle}>
              <TextInput
                style={authStyles.textInput as ViewStyle}
                placeholder="Enter verification code"
                placeholderTextColor={COLORS.textLight}
                value={code}
                onChangeText={(text: string) => setCode(text)}
                keyboardType="number-pad"
                autoCapitalize="none"
              />
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={[authStyles.authButton as ViewStyle, loading && (authStyles.buttonDisabled as ViewStyle)]}
              onPress={handleVerification}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={authStyles.buttonText as TextStyle}>{loading ? "Verifying..." : "Verify Email"}</Text>
            </TouchableOpacity>

            {/* Back to Sign Up */}
            <TouchableOpacity style={authStyles.linkContainer as ViewStyle} onPress={onBack}>
              <Text style={authStyles.linkText as TextStyle}>
                <Text style={authStyles.link as TextStyle}>Back to Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default VerifyEmail;