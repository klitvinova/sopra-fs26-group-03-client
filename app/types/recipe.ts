import { Unit } from "./unit";
import { IngredientCategory } from "./ingredientCategory";

export interface Ingredient {
  id: number;
  ingredientName: string;
  ingredientDescription?: string;
  unit: Unit;
  quantity?: number; // Added quantity
  category?: IngredientCategory;
}

export interface Recipe {
  id: number;
  name: string;
  description: string;
  ingredients: Ingredient[]; // Changed from recipeIngredients
}

export interface IngredientPutDTO {
  ingredientName: string;
  ingredientDescription: string;
  unit: Unit;
  category: IngredientCategory;
  quantity: number;
}

export interface RecipePutDTO {
  name: string;
  description: string;
  ingredients: IngredientPutDTO[];
}
