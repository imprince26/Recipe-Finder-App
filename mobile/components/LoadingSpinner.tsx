import { View, ActivityIndicator, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { COLORS } from "../constants/colors";

// Define interface for component props
interface LoadingSpinnerProps {
  message?: string;
  size?: "small" | "large";
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "Loading...", size = "large" }) => {
  return (
    <View style={styles.container as ViewStyle}>
      <View style={styles.content as ViewStyle}>
        <ActivityIndicator size={size} color={COLORS.primary} />
        <Text style={styles.message as TextStyle}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: COLORS.background,
  },
  content: {
    alignItems: "center",
    gap: 16,
  },
  message: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: "center",
  },
});

export default LoadingSpinner;