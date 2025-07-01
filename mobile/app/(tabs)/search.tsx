import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ViewStyle,
  TextStyle,
} from "react-native";
import { MealAPI } from "../../services/mealAPI";
import { useDebounce } from "../../hooks/useDebounce";
import { searchStyles } from "../../assets/styles/searchStyles";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import RecipeCard from "../../components/RecipeCard";
import LoadingSpinner from "../../components/LoadingSpinner";

// Define interface for Recipe data
interface Recipe {
  id: string;
  title: string;
  image: string;
  cookTime: string;
  servings: string;
  area?: string;
}

const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  const debouncedSearchQuery = useDebounce<string>(searchQuery, 300);

  const performSearch = async (query: string): Promise<Recipe[]> => {
    // If no search query
    if (!query.trim()) {
      const randomMeals = await MealAPI.getRandomMeals(12);
      return randomMeals
        .map((meal) => MealAPI.transformMealData(meal))
        .filter((meal): meal is Recipe => meal !== null);
    }

    // Search by name first, then by ingredient if no results
    const nameResults = await MealAPI.searchMealsByName(query);
    let results = nameResults;

    if (results.length === 0) {
      const ingredientResults = await MealAPI.filterByIngredient(query);
      results = ingredientResults;
    }

    return results
      .slice(0, 12)
      .map((meal) => MealAPI.transformMealData(meal))
      .filter((meal): meal is Recipe => meal !== null);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const results = await performSearch("");
        setRecipes(results);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (initialLoading) return;

    const handleSearch = async () => {
      setLoading(true);

      try {
        const results = await performSearch(debouncedSearchQuery);
        setRecipes(results);
      } catch (error) {
        console.error("Error searching:", error);
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    handleSearch();
  }, [debouncedSearchQuery, initialLoading]);

  if (initialLoading) return <LoadingSpinner message="Loading recipes..." />;

  return (
    <View style={searchStyles.container as ViewStyle}>
      <View style={searchStyles.searchSection as ViewStyle}>
        <View style={searchStyles.searchContainer as ViewStyle}>
          <Ionicons
            name="search"
            size={20}
            color={COLORS.textLight}
            style={searchStyles.searchIcon}
          />
          <TextInput
            style={searchStyles.searchInput as ViewStyle}
            placeholder="Search recipes, ingredients..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={(text: string) => setSearchQuery(text)}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={searchStyles.clearButton as ViewStyle}
            >
              <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={searchStyles.resultsSection as ViewStyle}>
        <View style={searchStyles.resultsHeader as ViewStyle}>
          <Text style={searchStyles.resultsTitle as TextStyle}>
            {searchQuery ? `Results for "${searchQuery}"` : "Popular Recipes"}
          </Text>
          <Text style={searchStyles.resultsCount as TextStyle}>{recipes.length} found</Text>
        </View>

        {loading ? (
          <View style={searchStyles.loadingContainer as ViewStyle}>
            <LoadingSpinner message="Searching recipes..." size="small" />
          </View>
        ) : (
          <FlatList
            data={recipes}
            renderItem={({ item }: { item: Recipe }) => <RecipeCard recipe={item} />}
            keyExtractor={(item: Recipe) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={searchStyles.row as ViewStyle}
            contentContainerStyle={searchStyles.recipesGrid as ViewStyle}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<NoResultsFound />}
          />
        )}
      </View>
    </View>
  );
};

const NoResultsFound: React.FC = () => {
  return (
    <View style={searchStyles.emptyState as ViewStyle}>
      <Ionicons name="search-outline" size={64} color={COLORS.textLight} />
      <Text style={searchStyles.emptyTitle as TextStyle}>No recipes found</Text>
      <Text style={searchStyles.emptyDescription as TextStyle}>
        Try adjusting your search or try different keywords
      </Text>
    </View>
  );
};

export default SearchScreen;