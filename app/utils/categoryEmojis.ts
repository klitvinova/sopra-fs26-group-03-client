import type { IngredientCategory } from "@/types/ingredientCategory";

export const categoryEmojiMap: Record<IngredientCategory, string> = {
	VEGETABLE: "🥦",
	FRUIT: "🍎",
	MEAT: "🥩",
	FISH: "🐟",
	DAIRY: "🧀",
	EGGS: "🥚",
	PLANT_PROTEIN: "🌱",
	GRAIN: "🌾",
	BAKERY: "🍞",
	BAKING: "🥐",
	HERB: "🌿",
	SPICE: "🌶️",
	OIL: "🫗",
	CONDIMENT: "🍯",
	OTHER: "🛒",
};

export function getCategoryEmoji(category?: IngredientCategory): string {
	if (!category) return "❓";
	return categoryEmojiMap[category] || "❓";
}

export function formatCategoryName(category: IngredientCategory): string {
	if (category === "PLANT_PROTEIN") return "Plant protein";
	return category
		.toLowerCase()
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}


