import type { Unit } from "@/types/unit";

export interface PantryItemGetDTO {
  id: number;
  quantity: number;
  ingredientId: number;
  ingredientName: string;
  unit: Unit;
}

export interface PantryGetDTO {
  id: number;
  groupId: number;
  items: PantryItemGetDTO[];
}

export interface PantryItemPostDTO {
  ingredientId: number;
  quantity: number;
}

export interface PantryItemPutDTO {
  ingredientId: number;
  quantity: number;
}
