import { Unit } from "./unit";

export interface Ingredient {
  id: number;
  ingredientName: string;
  ingredientDescription?: string;
  unit: Unit;
  quantity?: number; // Added quantity
}

export interface Recipe {
  id: number;
  name: string;
  description: string;
  ingredients: Ingredient[]; // Changed from recipeIngredients
}
