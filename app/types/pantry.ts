import type { Unit } from "@/types/unit";
import { IngredientCategory } from "@/types/ingredientCategory";

export interface PantryItemGetDTO {
	id: number;
	quantity: number;
	ingredientId: number;
	ingredientName: string;
	ingredientCategory: IngredientCategory;
	unit: Unit;
}

export interface PantryGetDTO {
	id: number;
	groupId: number;
	items: PantryItemGetDTO[];
}

export interface PantryItemPostDTO {
	ingredientId: number;
	ingredientCategory: IngredientCategory;
	quantity: number;
}

export interface PantryItemPutDTO {
	ingredientId: number;
	quantity: number;
}
