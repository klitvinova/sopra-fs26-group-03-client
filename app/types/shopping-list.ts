import type { Unit } from "@/types/unit";
import { IngredientCategory } from "@/types/ingredientCategory";

export interface ShoppingListItemGetDTO {
	id: number;
	quantity: number;
	isBought: boolean;
	ingredientId: number;
	ingredientName: string;
	ingredientCategory: IngredientCategory;
	unit: Unit;
}

export interface ShoppingListGetDTO {
	id?: number;
	items?: ShoppingListItemGetDTO[];
	shoppingListItems?: ShoppingListItemGetDTO[];
	ingredientCategory: IngredientCategory;
}

export interface ShoppingListItemPostDTO {
	ingredientId: number;
	ingredientCategory: IngredientCategory;
	quantity: number;
}

export interface ItemPutDTO {
	ingredientId: number;
	ingredientCategory: IngredientCategory;
	quantity: number;
}

export interface ItemPatchDTO {
	isBought: boolean;
}

export interface AutoDetectedIngredientGetDTO {
  id?: number;
  ingredientName?: string;
  ingredientDescription?: string;
  unit?: Unit;
  quantity?: number;
}
