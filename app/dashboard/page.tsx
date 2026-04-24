"use client";

import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  Badge,
  List,
  Button,
  Spin,
  Tag,
  Row,
  Col,
} from "antd";
import {
  CalendarOutlined,
  RightOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import DashboardShell from "@/components/dashboard-shell";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { PantryGetDTO } from "@/types/pantry";
import { ShoppingListGetDTO } from "@/types/shopping-list";
import { MealPlan } from "@/types/meal-plan";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

const Dashboard: React.FC = () => {
	const apiService = useApi();
	const router = useRouter();
	const [user, setUser] = useState<User | null>(null);
	const [pantry, setPantry] = useState<PantryGetDTO | null>(null);
	const [shoppingList, setShoppingList] = useState<ShoppingListGetDTO | null>(null);
	const [todayMeals, setTodayMeals] = useState<MealPlan[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchDashboardData = async () => {
			setIsLoading(true);
			setError(null);
			try {
				// Fetch user separately as it's core to the identity
				const userData = await apiService.get<User>("/users/me");
				setUser(userData);

				// Fetch group-dependent data, but handle "not in group" (404) gracefully
				try {
					const pantryData = await apiService.get<PantryGetDTO>("/groups/me/pantry");
					setPantry(pantryData);
				} catch {
					console.debug("No pantry found, likely not in a group yet.");
					setPantry(null);
				}

				try {
					const shoppingListData = await apiService.get<ShoppingListGetDTO>("/groups/me/shopping-list");
					setShoppingList(shoppingListData);
				} catch {
					console.debug("No shopping list found, likely not in a group yet.");
					setShoppingList(null);
				}

				try {
					const today = dayjs().format("YYYY-MM-DD");
					const meals = await apiService.get<MealPlan[]>(`/meal-plans?startDate=${today}&endDate=${today}`);
					setTodayMeals(meals);
				} catch {
					console.debug("Failed to fetch today's meals");
					setTodayMeals([]);
				}

			} catch {
				setError("Failed to load profile data");
			} finally {
				setIsLoading(false);
			}
		};

		fetchDashboardData();
	}, [apiService]);

	const pantryItemCount = pantry?.items?.length ?? 0;
	const shoppingListItemCount = (shoppingList?.items ?? shoppingList?.shoppingListItems ?? []).filter(item => !item.isBought).length;

	const getMealIcon = (type: string) => {
		switch (type) {
			case "BREAKFAST": return "☕";
			case "LUNCH": return "🍱";
			case "DINNER": return "🍽️";
			case "SNACK": return "🍎";
			default: return "🥣";
		}
	};

	if (isLoading) {
		return (
			<DashboardShell headerTitle="Dashboard" selectedMenuKey="1">
				<div className="flex items-center justify-center py-20">
					<Spin size="large" tip="Preparing your kitchen dashboard..." />
				</div>
			</DashboardShell>
		);
	}

  return (
    <DashboardShell headerTitle="Dashboard" selectedMenuKey="1">
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <div>
            <Text className="text-slate-400 font-medium uppercase tracking-wider text-xs">
              Overview
            </Text>
            <Title level={2} className="!mt-1 !text-slate-900">
              Welcome back, {user?.username || "Guest"}! 👋
            </Title>
          </div>
          {error && <Tag color="error" className="rounded-full px-4">{error}</Tag>}
        </div>
        <Paragraph className="text-slate-500 max-w-2xl">
          Here&apos;s what&apos;s happening today in your kitchen. Track your
          meals and manage your pantry with ease.
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <CalendarOutlined className="text-slate-600" /> Today&apos;s
                Menu
              </div>
            }
            extra={
              <Button
                type="link"
                onClick={() => router.push("/meal-plan")}
                className="text-slate-500 hover:text-slate-900 flex items-center"
              >
                Detailed Plan <RightOutlined size={12} className="ml-1" />
              </Button>
            }
            className="shadow-sm rounded-2xl border-slate-200 h-full"
            headStyle={{ borderBottom: "1px solid #f1f5f9" }}
          >
            {isLoading ? (
              <div className="py-20 text-center">
                <Spin />
              </div>
            ) : todayMeals.length > 0 ? (
              <List
                dataSource={["BREAKFAST", "LUNCH", "DINNER", "SNACK"]}
                renderItem={(type) => {
                  const meal = todayMeals.find((m) => m.mealType === type);
                  return (
                    <div
                      className={`flex items-center justify-between p-4 rounded-xl mb-3 ${meal ? "bg-slate-50 border border-slate-100" : "opacity-40 border border-dashed border-slate-200"}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-lg">
                          {getMealIcon(type)}
                        </div>
                        <div>
                          <Text strong className="block text-slate-800">
                            {type}
                          </Text>
                          <Text className="text-slate-500">
                            {meal ? meal.recipe.name : "Nothing planned"}
                          </Text>
                        </div>
                      </div>
                      {meal && (
                        <Tag
                          color="green"
                          className="rounded-full border-none px-3 bg-green-50 text-green-600 font-medium"
                        >
                          Scheduled
                        </Tag>
                      )}
                    </div>
                  );
                }}
              />
            ) : (
              <div className="py-12 text-center">
                <Paragraph className="text-slate-400 italic mb-4">
                  No meals planned for today.
                </Paragraph>
                <Button
                  className="rounded-lg h-10 border-slate-200 text-slate-600 hover:text-slate-900"
                  onClick={() => router.push("/meal-plan")}
                >
                  Open Planner
                </Button>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <div className="flex flex-col gap-6 h-full">
            <Card 
              className="shadow-sm rounded-2xl border-slate-200"
              title={
                <div className="flex items-center gap-2">
                  <ShoppingCartOutlined className="text-orange-500" /> Shopping List
                </div>
              }
              extra={
                <Button
                  type="link"
                  onClick={() => router.push("/shopping-lists")}
                  className="text-slate-500 hover:text-slate-900 flex items-center"
                >
                  View All <RightOutlined size={12} className="ml-1" />
                </Button>
              }
              headStyle={{ borderBottom: "1px solid #f1f5f9" }}
            >
              <List
                dataSource={(shoppingList?.items ?? shoppingList?.shoppingListItems ?? []).filter(item => !item.isBought).slice(0, 5)}
                renderItem={(item) => (
                  <List.Item className="px-0 py-2 border-slate-50">
                    <div className="flex justify-between w-full">
                      <Text className="text-slate-700 font-medium">
                        {item.ingredientName}
                      </Text>
                      <Text className="text-slate-400">
                        {item.quantity} {item.unit?.toLowerCase()}
                      </Text>
                    </div>
                  </List.Item>
                )}
                locale={{
                  emptyText: (
                    <div className="py-4 text-center text-slate-400 italic">
                      Nothing to buy!
                    </div>
                  ),
                }}
              />
            </Card>

            <Card className="shadow-sm rounded-2xl border-slate-200 flex-1">
              <Title level={4} className="!m-0 !text-slate-800">
                Quick Tips
              </Title>
              <Divider className="my-4 border-slate-50" />
              <List
                split={false}
                dataSource={[
                  `You have ${pantryItemCount} item${pantryItemCount === 1 ? "" : "s"} in your pantry.`,
                  "Schedule your week on Sundays to save time.",
                  "Add missing items to shopping list with one click.",
                  "Check your pantry before going out.",
                ]}
                renderItem={(item) => (
                  <List.Item className="px-0 py-2 items-start">
                    <Badge status="processing" className="mt-2.5 mr-3" />
                    <Text className="text-slate-500 text-sm">{item}</Text>
                  </List.Item>
                )}
              />
            </Card>
          </div>
        </Col>
      </Row>
    </DashboardShell>
  );
};

const Divider = ({ className }: { className?: string }) => (
  <div className={`h-[1px] w-full ${className}`} />
);

export default Dashboard;
