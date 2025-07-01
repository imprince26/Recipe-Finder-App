import {
  View,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import { API_URL } from "../../constants/api";
import { favoritesStyles } from "../../assets/styles/favouritesStyles";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import RecipeCard from "../../components/RecipeCard";
import NoFavoritesFound from "@/components/NotFavoritesFound";
import LoadingSpinner from "../../components/LoadingSpinner";

// Define interface for Favorite Recipe data
interface FavoriteRecipe {
  id: string;
  recipeId: number;
  title: string;
  image: string;
  cookTime: string;
  servings: string;
}

const FavoritesScreen: React.FC = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const [favoriteRecipes, setFavoriteRecipes] = useState<FavoriteRecipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const response = await fetch(`${API_URL}/favorites/${user?.id}`);
        if (!response.ok) throw new Error("Failed to fetch favorites");

        const favorites: FavoriteRecipe[] = await response.json();

        // Transform the data to match the RecipeCard component's expected format
        const transformedFavorites: FavoriteRecipe[] = favorites.map((favorite) => ({
          ...favorite,
          id: favorite.recipeId.toString(),
        }));

        setFavoriteRecipes(transformedFavorites);
      } catch (error) {
        console.log("Error loading favorites", error);
        Alert.alert("Error", "Failed to load favorites");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadFavorites();
    }
  }, [user?.id]);

  const handleSignOut = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => signOut() },
    ]);
  };

  if (loading) return <LoadingSpinner message="Loading your favorites..." />;

  return (
    <View style={favoritesStyles.container as ViewStyle}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={favoritesStyles.header as ViewStyle}>
          <Text style={favoritesStyles.title as TextStyle}>Favorites</Text>
          <TouchableOpacity style={favoritesStyles.logoutButton as ViewStyle} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={favoritesStyles.recipesSection as ViewStyle}>
          <FlatList
            data={favoriteRecipes}
            renderItem={({ item }: { item: FavoriteRecipe }) => <RecipeCard recipe={item} />}
            keyExtractor={(item: FavoriteRecipe) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={favoritesStyles.row as ViewStyle}
            contentContainerStyle={favoritesStyles.recipesGrid as ViewStyle}
            scrollEnabled={false}
            ListEmptyComponent={<NoFavoritesFound />}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default FavoritesScreen;