import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity,ViewStyle,TextStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";
import { favoritesStyles } from "@/assets/styles/favouritesStyles";

function NoFavoritesFound() {
  const router = useRouter();

  return (
    <View style={favoritesStyles.emptyState as ViewStyle}>
      <View style={favoritesStyles.emptyIconContainer as ViewStyle}>
        <Ionicons name="heart-outline" size={80} color={COLORS.textLight} />
      </View>
      <Text style={favoritesStyles.emptyTitle as TextStyle}>No favorites yet</Text>
      <TouchableOpacity style={favoritesStyles.exploreButton as ViewStyle} onPress={() => router.push("/")}>
        <Ionicons name="search" size={18} color={COLORS.white} />
        <Text style={favoritesStyles.exploreButtonText as TextStyle}>Explore Recipes</Text>
      </TouchableOpacity>
    </View>
  );
}

export default NoFavoritesFound;