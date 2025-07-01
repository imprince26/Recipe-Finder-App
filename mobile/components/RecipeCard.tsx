import { View, Text, TouchableOpacity, ViewStyle, TextStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { COLORS } from "../constants/colors";
import { recipeCardStyles } from "../assets/styles/homeStyles";

interface RecipeCardProps {
  recipe: {
    id: string;
    title: string;
    image: string;
    description?: string;
    cookTime?: string;
    servings?: number;
  };
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={recipeCardStyles.container}
      onPress={() => router.push(`/recipe/${recipe.id}`)}
      activeOpacity={0.8}
    >
      <View style={recipeCardStyles.imageContainer as ViewStyle}>
        <Image
          source={{ uri: recipe.image }}
          style={recipeCardStyles.image}
          contentFit="cover"
          transition={300}
        />
      </View>

      <View style={recipeCardStyles.content as ViewStyle}>
        <Text style={recipeCardStyles.title as TextStyle} numberOfLines={2}>
          {recipe.title}
        </Text>
        {recipe.description && (
          <Text style={recipeCardStyles.description as TextStyle} numberOfLines={2}>
            {recipe.description}
          </Text>
        )}

        <View style={recipeCardStyles.footer as ViewStyle}>
          {recipe.cookTime && (
            <View style={recipeCardStyles.timeContainer as ViewStyle}>
              <Ionicons name="time-outline" size={14} color={COLORS.textLight} />
              <Text style={recipeCardStyles.timeText as TextStyle}>{recipe.cookTime}</Text>
            </View>
          )}
          {recipe.servings && (
            <View style={recipeCardStyles.servingsContainer as ViewStyle}>
              <Ionicons name="people-outline" size={14} color={COLORS.textLight} />
              <Text style={recipeCardStyles.servingsText as TextStyle}>{recipe.servings}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}