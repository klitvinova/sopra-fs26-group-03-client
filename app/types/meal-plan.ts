import { Recipe } from "./recipe";

export enum MealType {
  BREAKFAST = "BREAKFAST",
  LUNCH = "LUNCH",
  DINNER = "DINNER",
  SNACK = "SNACK",
}

export interface MealPlan {
  id: number;
  date: string;
  mealType: MealType;
  userID: string;
  groupId?: number;
  recipe: Recipe;
}

export interface MealPlanPostDTO {
  date: string;
  mealType: MealType;
  recipeId: number;
  groupId?: number;
}

export interface MissingIngredient {
  ingredient: {
    id: number;
    ingredientName: string;
    unit: string;
  };
  missingQuantity: number;
}
