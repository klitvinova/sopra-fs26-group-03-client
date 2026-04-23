import type { Unit } from "@/types/unit";

export type IngredientCategory =
	| "VEGETABLE"
	| "FRUIT"
	| "MEAT"
	| "FISH"
	| "DAIRY"
	| "EGGS"
	| "PLANT_PROTEIN"
	| "GRAIN"
	| "BAKERY"
	| "BAKING"
	| "HERB"
	| "SPICE"
	| "OIL"
	| "CONDIMENT";

export interface IngredientGetDTO {
	id?: number;
	ingredientName?: string;
	ingredientDescription?: string;
	unit?: Unit;
	category?: IngredientCategory;
}

export interface IngredientPostDTO {
	ingredientName: string;
	ingredientDescription: string;
	unit: Unit;
	category?: IngredientCategory;
}

export interface AddItemFormValues {
	ingredientName: string;
	ingredientDescription: string;
	quantity: number;
	unit: Unit;
}
