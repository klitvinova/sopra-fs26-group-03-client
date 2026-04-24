"use client";

import React, { useEffect, useState } from "react";
import { Typography, Card, List, Tag, Spin, message } from "antd";
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
        <List
          grid={{ gutter: 24, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
          dataSource={recipes}
          renderItem={(recipe) => (
            <List.Item>
              <Card
                title={recipe.name}
                hoverable
                className="h-full shadow-sm rounded-xl border-slate-200"
                bodyStyle={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
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
                        {ing.unit.toLowerCase()}
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
