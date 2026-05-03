"use client";

import React, { useEffect, useState } from "react";
import { Typography, Card, Tag, Spin, message } from "antd";
import DashboardShell from "@/components/dashboard-shell";
import { useApi } from "@/hooks/useApi";
import { Recipe } from "@/types/recipe";

const { Title, Paragraph, Text } = Typography;

const RecipesPage: React.FC = () => {
	const api = useApi();
	const [recipes, setRecipes] = useState<Recipe[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchRecipes = async () => {
			try {
				const data = await api.get<Recipe[]>("/recipes");
				setRecipes(data);
			} catch (error) {
				message.error("Failed to fetch recipes");
				console.error(error);
			} finally {
				setLoading(false);
			}
		};
		fetchRecipes();
	}, [api]);

	return (
		<DashboardShell headerTitle="Recipes" selectedMenuKey="4">
			<div className="mb-8">
				<Title level={2} className="!m-0 !text-slate-900">
					Simple Recipes
				</Title>
				<Paragraph className="text-slate-500 mt-2">
					Browse our selection of simple recipes to add to your meal plan.
				</Paragraph>
			</div>

			{loading ? (
				<div className="flex justify-center items-center h-64">
					<Spin size="large" />
				</div>
			) : (
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
					{recipes.map((recipe) => (
						<Card
							key={recipe.id}
							title={recipe.name}
							hoverable
							className="h-full overflow-hidden shadow-sm rounded-xl border-slate-200"
							styles={{
								body: {
									display: "flex",
									flexDirection: "column",
									height: "100%",
									minWidth: 0,
								},
							}}
						>
							<Paragraph ellipsis={{ rows: 2 }} className="text-slate-500 mb-4">
								{recipe.description}
							</Paragraph>
							<div className="mt-auto min-w-0">
								<Text strong className="block mb-2 text-slate-700">
									Ingredients:
								</Text>
								<div className="flex min-w-0 flex-wrap gap-2">
									{recipe.ingredients.map((ing) => (
										<Tag
											key={ing.id}
											color="blue"
											className="m-0 max-w-full whitespace-normal break-words rounded-full px-3 py-1 leading-5 border-none bg-blue-50 text-blue-600"
										>
											{ing.ingredientName}: {ing.quantity} {ing.unit?.toLowerCase() ?? "-"}
										</Tag>
									))}
								</div>
							</div>
						</Card>
					))}
				</div>
			)}
		</DashboardShell>
	);
};

export default RecipesPage;
