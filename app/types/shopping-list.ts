import type { Unit } from "@/types/unit";

export interface ShoppingListItemGetDTO {
  id: number;
  quantity: number;
  isBought: boolean;
  ingredientId: number;
  ingredientName: string;
  unit: Unit;
}

export interface ShoppingListGetDTO {
  id?: number;
  items?: ShoppingListItemGetDTO[];
  shoppingListItems?: ShoppingListItemGetDTO[];
}

export interface ShoppingListItemPostDTO {
  ingredientId: number;
  quantity: number;
}

export interface ItemPutDTO {
  ingredientId: number;
  quantity: number;
}

export interface ItemPatchDTO {
  isBought: boolean;
}
