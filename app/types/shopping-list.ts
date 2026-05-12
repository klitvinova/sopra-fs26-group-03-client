import type { Unit } from "@/types/unit";
import { IngredientCategory } from "@/types/ingredientCategory";

export interface ShoppingListItemGetDTO {
	id: number;
	quantity: number;
	isBought: boolean;
	ingredientId: number;
	ingredientName: string;
	category: IngredientCategory;
	unit: Unit;
}

export interface ShoppingListGetDTO {
	id?: number;
	items?: ShoppingListItemGetDTO[];
	shoppingListItems?: ShoppingListItemGetDTO[];
	category: IngredientCategory;
}

export interface ShoppingListItemPostDTO {
	ingredientName: string;
	ingredientDescription: string;
	ingredientId: number;
	category: IngredientCategory;
	quantity: number;
	unit: Unit;
}

export interface ItemPutDTO {
	ingredientId: number;
	category?: IngredientCategory;
	quantity: number;
}

export interface ItemPatchDTO {
	isBought: boolean;
}
