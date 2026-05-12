"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Typography, Card, Tag, Spin, message, List } from "antd";
import DashboardShell from "@/components/dashboard-shell";
import GroupRequired from "@/components/group-required";
import { useApi } from "@/hooks/useApi";
import { useGroupMembership } from "@/hooks/useGroupMembership";
import { Recipe } from "@/types/recipe";

const { Title, Paragraph, Text } = Typography;

const RecipesPage: React.FC = () => {
  const api = useApi();
  const { hasGroup, isLoading: isGroupLoading } = useGroupMembership();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

	/*
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isSaving, setIsSaving] = useState(false);
	*/

  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<Recipe[]>("/recipes");
      setRecipes(data);
    } catch (error) {
      message.error("Failed to fetch recipes");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (!hasGroup) {
      setLoading(false);
      return;
    }
    fetchRecipes();
  }, [fetchRecipes, hasGroup]);

	/*
  const handleEditClick = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setIsEditModalOpen(true);
  };

  const handleSaveRecipe = async (id: number, data: RecipePutDTO) => {
    setIsSaving(true);
    try {
      await api.put(`/recipes/${id}`, data);
      message.success("Recipe updated successfully");
      setIsEditModalOpen(false);
      setEditingRecipe(null);
      await fetchRecipes();
    } catch (error) {
      message.error("Failed to update recipe");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };
  */

  if (isGroupLoading) {
    return (
      <DashboardShell headerTitle="Recipes" selectedMenuKey="4">
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </DashboardShell>
    );
  }

  if (!hasGroup) {
    return (
      <DashboardShell headerTitle="Recipes" selectedMenuKey="4">
        <GroupRequired featureName="Recipes" />
      </DashboardShell>
    );
  }

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
        <List
          grid={{ gutter: 24, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
          dataSource={recipes}
          renderItem={(recipe) => (
            <List.Item key={recipe.id}>
              <Card
                title={recipe.name}
                hoverable
                className="h-full shadow-sm rounded-xl border-slate-200"
                      styles={{
                        body: {
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                        },
                      }}
              >
                <Paragraph
                  ellipsis={{ rows: 2 }}
                  className="text-slate-500 mb-4"
                >
                  {recipe.description}
                </Paragraph>
                <div className="mt-auto">
                  <Text strong className="block mb-2 text-slate-700">
                    Ingredients:
                  </Text>
                  <div className="flex flex-wrap gap-2">
                    {recipe.ingredients.map((ing) => (
                      <Tag
                        key={ing.id}
                        color="blue"
                        className="rounded-full px-3 border-none bg-blue-50 text-blue-600"
                      >
                        {ing.ingredientName}: {ing.quantity}{" "}
                        {ing.unit?.toLowerCase() ?? "-"}
                      </Tag>
                    ))}
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}
    </DashboardShell>
  );
};

export default RecipesPage;
