import {
  View,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import { API_URL } from "../../constants/api";
import { MealAPI } from "../../services/mealAPI";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Image } from "expo-image";
import { recipeDetailStyles } from "../../assets/styles/recipeDetailStyles";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";

// Define interface for Recipe data
interface Recipe {
  id: string;
  title: string;
  image: string;
  cookTime: string;
  servings: string;
  category: string;
  area?: string;
  ingredients: string[];
  instructions: string[];
  youtubeUrl: string | null;
}

const RecipeDetailScreen: React.FC = () => {
  const { id: recipeId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const { user } = useUser();
  const userId = user?.id;

  useEffect(() => {
    const checkIfSaved = async () => {
      try {
        const response = await fetch(`${API_URL}/favorites/${userId}`);
        const favorites: { recipeId: number }[] = await response.json();
        const isRecipeSaved = favorites.some((fav) => fav.recipeId === parseInt(recipeId));
        setIsSaved(isRecipeSaved);
      } catch (error) {
        console.error("Error checking if recipe is saved:", error);
      }
    };

    const loadRecipeDetail = async () => {
      setLoading(true);
      try {
        const mealData = await MealAPI.getMealById(recipeId);
        if (mealData) {
          const transformedRecipe = MealAPI.transformMealData(mealData);

          // Ensure all required fields are present and have correct types
          const recipeWithVideo: Recipe = {
            id: transformedRecipe?.id ?? "",
            title: transformedRecipe?.title ?? "",
            image: transformedRecipe?.image ?? "",
            cookTime: transformedRecipe?.cookTime ?? "",
            servings: String(transformedRecipe?.servings ?? ""),
            category: transformedRecipe?.category ?? "",
            area: transformedRecipe?.area ?? "",
            ingredients: transformedRecipe?.ingredients ?? [],
            instructions: transformedRecipe?.instructions ?? [],
            youtubeUrl: mealData.strYoutube || null,
          };

          setRecipe(recipeWithVideo);
        }
      } catch (error) {
        console.error("Error loading recipe detail:", error);
      } finally {
        setLoading(false);
      }
    };

    checkIfSaved();
    loadRecipeDetail();
  }, [recipeId, userId]);

  const getYouTubeEmbedUrl = (url: string): string => {
    const videoId = url.split("v=")[1];
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const handleToggleSave = async () => {
    setIsSaving(true);

    try {
      if (isSaved) {
        // Remove from favorites
        const response = await fetch(`${API_URL}/favorites/${userId}/${recipeId}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to remove recipe");

        setIsSaved(false);
      } else {
        // Add to favorites
        const response = await fetch(`${API_URL}/favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            recipeId: parseInt(recipeId),
            title: recipe!.title,
            image: recipe!.image,
            cookTime: recipe!.cookTime,
            servings: recipe!.servings,
          }),
        });

        if (!response.ok) throw new Error("Failed to save recipe");
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error toggling recipe save:", error);
      Alert.alert("Error", `Something went wrong. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading recipe details..." />;

  return (
    <View style={recipeDetailStyles.container as ViewStyle}>
      <ScrollView>
        {/* HEADER */}
        <View style={recipeDetailStyles.headerContainer as ViewStyle}>
          <View style={recipeDetailStyles.imageContainer as ViewStyle}>
            <Image
              source={{ uri: recipe!.image }}
              style={recipeDetailStyles.headerImage}
              contentFit="cover"
            />
          </View>

          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.9)"]}
            style={recipeDetailStyles.gradientOverlay}
          />

          <View style={recipeDetailStyles.floatingButtons as ViewStyle}>
            <TouchableOpacity
              style={recipeDetailStyles.floatingButton as ViewStyle}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                recipeDetailStyles.floatingButton as ViewStyle,
                { backgroundColor: isSaving ? COLORS.gray : COLORS.primary },
              ]}
              onPress={handleToggleSave}
              disabled={isSaving}
            >
              <Ionicons
                name={isSaving ? "hourglass" : isSaved ? "bookmark" : "bookmark-outline"}
                size={24}
                color={COLORS.white}
              />
            </TouchableOpacity>
          </View>

          {/* Title Section */}
          <View style={recipeDetailStyles.titleSection as ViewStyle}>
            <View style={recipeDetailStyles.categoryBadge as ViewStyle}>
              <Text style={recipeDetailStyles.categoryText as TextStyle}>{recipe!.category}</Text>
            </View>
            <Text style={recipeDetailStyles.recipeTitle as TextStyle}>{recipe!.title}</Text>
            {recipe!.area && (
              <View style={recipeDetailStyles.locationRow as ViewStyle}>
                <Ionicons name="location" size={16} color={COLORS.white} />
                <Text style={recipeDetailStyles.locationText as TextStyle}>{recipe!.area} Cuisine</Text>
              </View>
            )}
          </View>
        </View>

        <View style={recipeDetailStyles.contentSection as ViewStyle}>
          {/* QUICK STATS */}
          <View style={recipeDetailStyles.statsContainer as ViewStyle}>
            <View style={recipeDetailStyles.statCard as ViewStyle}>
              <LinearGradient
                colors={["#FF6B6B", "#FF8E53"]}
                style={recipeDetailStyles.statIconContainer}
              >
                <Ionicons name="time" size={20} color={COLORS.white} />
              </LinearGradient>
              <Text style={recipeDetailStyles.statValue as TextStyle}>{recipe!.cookTime}</Text>
              <Text style={recipeDetailStyles.statLabel as TextStyle}>Prep Time</Text>
            </View>

            <View style={recipeDetailStyles.statCard as ViewStyle}>
              <LinearGradient
                colors={["#4ECDC4", "#44A08D"]}
                style={recipeDetailStyles.statIconContainer}
              >
                <Ionicons name="people" size={20} color={COLORS.white} />
              </LinearGradient>
              <Text style={recipeDetailStyles.statValue as TextStyle}>{recipe!.servings}</Text>
              <Text style={recipeDetailStyles.statLabel as TextStyle}>Servings</Text>
            </View>
          </View>

          {recipe!.youtubeUrl && (
            <View style={recipeDetailStyles.sectionContainer as ViewStyle}>
              <View style={recipeDetailStyles.sectionTitleRow as ViewStyle}>
                <LinearGradient
                  colors={["#FF0000", "#CC0000"]}
                  style={recipeDetailStyles.sectionIcon}
                >
                  <Ionicons name="play" size={16} color={COLORS.white} />
                </LinearGradient>

                <Text style={recipeDetailStyles.sectionTitle as TextStyle}>Video Tutorial</Text>
              </View>

              <View style={recipeDetailStyles.videoCard as ViewStyle}>
                <WebView
                  style={recipeDetailStyles.webview}
                  source={{ uri: getYouTubeEmbedUrl(recipe!.youtubeUrl) }}
                  allowsFullscreenVideo
                  mediaPlaybackRequiresUserAction={false}
                />
              </View>
            </View>
          )}

          {/* INGREDIENTS SECTION */}
          <View style={recipeDetailStyles.sectionContainer as ViewStyle}>
            <View style={recipeDetailStyles.sectionTitleRow as ViewStyle}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primary + "80"]}
                style={recipeDetailStyles.sectionIcon}
              >
                <Ionicons name="list" size={16} color={COLORS.white} />
              </LinearGradient>
              <Text style={recipeDetailStyles.sectionTitle as TextStyle}>Ingredients</Text>
              <View style={recipeDetailStyles.countBadge as ViewStyle}>
                <Text style={recipeDetailStyles.countText as TextStyle}>{recipe!.ingredients.length}</Text>
              </View>
            </View>

            <View style={recipeDetailStyles.ingredientsGrid as ViewStyle}>
              {recipe!.ingredients.map((ingredient, index) => (
                <View key={index} style={recipeDetailStyles.ingredientCard as ViewStyle}>
                  <View style={recipeDetailStyles.ingredientNumber as ViewStyle}>
                    <Text style={recipeDetailStyles.ingredientNumberText as TextStyle}>{index + 1}</Text>
                  </View>
                  <Text style={recipeDetailStyles.ingredientText as TextStyle}>{ingredient}</Text>
                  <View style={recipeDetailStyles.ingredientCheck as ViewStyle}>
                    <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.textLight} />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* INSTRUCTIONS SECTION */}
          <View style={recipeDetailStyles.sectionContainer as ViewStyle}>
            <View style={recipeDetailStyles.sectionTitleRow as ViewStyle}>
              <LinearGradient
                colors={["#9C27B0", "#673AB7"]}
                style={recipeDetailStyles.sectionIcon}
              >
                <Ionicons name="book" size={16} color={COLORS.white} />
              </LinearGradient>
              <Text style={recipeDetailStyles.sectionTitle as TextStyle}>Instructions</Text>
              <View style={recipeDetailStyles.countBadge as ViewStyle}>
                <Text style={recipeDetailStyles.countText as TextStyle}>{recipe!.instructions.length}</Text>
              </View>
            </View>

            <View style={recipeDetailStyles.instructionsContainer as ViewStyle}>
              {recipe!.instructions.map((instruction, index) => (
                <View key={index} style={recipeDetailStyles.instructionCard as ViewStyle}>
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primary + "CC"]}
                    style={recipeDetailStyles.stepIndicator}
                  >
                    <Text style={recipeDetailStyles.stepNumber as TextStyle}>{index + 1}</Text>
                  </LinearGradient>
                  <View style={recipeDetailStyles.instructionContent as ViewStyle}>
                    <Text style={recipeDetailStyles.instructionText as TextStyle}>{instruction}</Text>
                    <View style={recipeDetailStyles.instructionFooter as ViewStyle}>
                      <Text style={recipeDetailStyles.stepLabel as TextStyle}>Step {index + 1}</Text>
                      <TouchableOpacity style={recipeDetailStyles.completeButton as ViewStyle}>
                        <Ionicons name="checkmark" size={16} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={recipeDetailStyles.primaryButton as ViewStyle}
            onPress={handleToggleSave}
            disabled={isSaving}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primary + "CC"]}
              style={recipeDetailStyles.buttonGradient}
            >
              <Ionicons name="heart" size={20} color={COLORS.white} />
              <Text style={recipeDetailStyles.buttonText as TextStyle}>
                {isSaved ? "Remove from Favorites" : "Add to Favorites"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default RecipeDetailScreen;