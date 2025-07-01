import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { MealAPI } from "@/services/mealAPI";
import { homeStyles } from "@/assets/styles/homeStyles";
import { Image } from "expo-image";
import { COLORS } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import CategoryFilter from "@/components/CategoryFilter";
import RecipeCard from "@/components/RecipeCard";
import LoadingSpinner from "@/components/LoadingSpinner";

// Define interfaces for data structures
interface Category {
  id: number;
  name: string;
  image: string;
  description: string;
}

interface Recipe {
  id: string;
  title: string;
  image: string;
  cookTime: string;
  servings: string;
  area?: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredRecipe, setFeaturedRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);

      const [apiCategories, randomMeals, featuredMeal] = await Promise.all([
        MealAPI.getCategories(),
        MealAPI.getRandomMeals(12),
        MealAPI.getRandomMeal(),
      ]);

      const transformedCategories: Category[] = apiCategories.map((cat: any, index: number) => ({
        id: index + 1,
        name: cat.strCategory,
        image: cat.strCategoryThumb,
        description: cat.strCategoryDescription,
      }));

      setCategories(transformedCategories);

      if (!selectedCategory) setSelectedCategory(transformedCategories[0].name);

      const transformedMeals: Recipe[] = randomMeals
        .map((meal) => MealAPI.transformMealData(meal))
        .filter((meal) => meal !== null)
        .map((meal) => ({
          ...meal!,
          servings: meal!.servings.toString(),
        })) as Recipe[];

      setRecipes(transformedMeals);

      const transformedFeaturedRaw = MealAPI.transformMealData(featuredMeal);
      const transformedFeatured: Recipe | null = transformedFeaturedRaw
        ? { ...transformedFeaturedRaw, servings: transformedFeaturedRaw.servings.toString() }
        : null;
      setFeaturedRecipe(transformedFeatured);
    } catch (error) {
      console.log("Error loading the data", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryData = async (category: string) => {
    try {
      const meals = await MealAPI.filterByCategory(category);
      const transformedMeals: Recipe[] = meals
        .map((meal: any) => MealAPI.transformMealData(meal))
        .filter((meal): meal is NonNullable<typeof meal> => meal !== null)
        .map((meal) => ({
          ...meal,
          servings: meal.servings.toString(),
        }));
      setRecipes(transformedMeals);
    } catch (error) {
      console.error("Error loading category data:", error);
      setRecipes([]);
    }
  };

  const handleCategorySelect = async (category: string) => {
    setSelectedCategory(category);
    await loadCategoryData(category);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !refreshing) return <LoadingSpinner message="Loading delicious recipes..." />;

  return (
    <View style={homeStyles.container as ViewStyle}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={homeStyles.scrollContent as ViewStyle}
      >
        {/* ANIMAL ICONS */}
        <View style={homeStyles.welcomeSection as ViewStyle}>
          <Image
            source={require("../../assets/images/lamb.png")}
            style={{
              width: 100,
              height: 100,
            }}
          />
          <Image
            source={require("../../assets/images/chicken.png")}
            style={{
              width: 100,
              height: 100,
            }}
          />
          <Image
            source={require("../../assets/images/pork.png")}
            style={{
              width: 100,
              height: 100,
            }}
          />
        </View>

        {/* FEATURED SECTION */}
        {featuredRecipe && (
          <View style={homeStyles.featuredSection as ViewStyle}>
            <TouchableOpacity
              style={homeStyles.featuredCard as ViewStyle}
              activeOpacity={0.9}
              onPress={() => router.push(`/recipe/${featuredRecipe.id}`)}
            >
              <View style={homeStyles.featuredImageContainer as ViewStyle}>
                <Image
                  source={{ uri: featuredRecipe.image }}
                  style={homeStyles.featuredImage}
                  contentFit="cover"
                  transition={500}
                />
                <View style={homeStyles.featuredOverlay as ViewStyle}>
                  <View style={homeStyles.featuredBadge as ViewStyle}>
                    <Text style={homeStyles.featuredBadgeText as TextStyle}>Featured</Text>
                  </View>

                  <View style={homeStyles.featuredContent as ViewStyle}>
                    <Text style={homeStyles.featuredTitle as TextStyle} numberOfLines={2}>
                      {featuredRecipe.title}
                    </Text>

                    <View style={homeStyles.featuredMeta as ViewStyle}>
                      <View style={homeStyles.metaItem as ViewStyle}>
                        <Ionicons name="time-outline" size={16} color={COLORS.white} />
                        <Text style={homeStyles.metaText as TextStyle}>{featuredRecipe.cookTime}</Text>
                      </View>
                      <View style={homeStyles.metaItem as ViewStyle}>
                        <Ionicons name="people-outline" size={16} color={COLORS.white} />
                        <Text style={homeStyles.metaText as TextStyle}>{featuredRecipe.servings}</Text>
                      </View>
                      {featuredRecipe.area && (
                        <View style={homeStyles.metaItem as ViewStyle}>
                          <Ionicons name="location-outline" size={16} color={COLORS.white} />
                          <Text style={homeStyles.metaText as TextStyle}>{featuredRecipe.area}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {categories.length > 0 && (
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
        )}

        <View style={homeStyles.recipesSection as ViewStyle}>
          <View style={homeStyles.sectionHeader as ViewStyle}>
            <Text style={homeStyles.sectionTitle as TextStyle}>{selectedCategory}</Text>
          </View>

          {recipes.length > 0 ? (
            <FlatList
              data={recipes}
              renderItem={({ item }: { item: Recipe }) => <RecipeCard recipe={item} />}
              keyExtractor={(item: Recipe) => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={homeStyles.row as ViewStyle}
              contentContainerStyle={homeStyles.recipesGrid as ViewStyle}
              scrollEnabled={false}
            />
          ) : (
            <View style={homeStyles.emptyState as ViewStyle}>
              <Ionicons name="restaurant-outline" size={64} color={COLORS.textLight} />
              <Text style={homeStyles.emptyTitle as TextStyle}>No recipes found</Text>
              <Text style={homeStyles.emptyDescription as TextStyle}>Try a different category</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;