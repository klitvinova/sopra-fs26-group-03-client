"use client";

import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
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
	const [, setPantry] = useState<PantryGetDTO | null>(null);
	const [shoppingList, setShoppingList] = useState<ShoppingListGetDTO | null>(null);
	const [todayMeals, setTodayMeals] = useState<MealPlan[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchDashboardData = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const userData = await apiService.get<User>("/users/me");
				setUser(userData);

				try {
					const pantryData = await apiService.get<PantryGetDTO>("/groups/me/pantry");
					setPantry(pantryData);
				} catch {
					setPantry(null);
				}

				try {
					const shoppingListData = await apiService.get<ShoppingListGetDTO>("/groups/me/shopping-list");
					setShoppingList(shoppingListData);
				} catch {
					setShoppingList(null);
				}

				try {
					const today = dayjs().format("YYYY-MM-DD");
					const meals = await apiService.get<MealPlan[]>(`/meal-plans?startDate=${today}&endDate=${today}`);
					setTodayMeals(meals);
				} catch {
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
      <div className="mb-10 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <Text className="text-orange-500 font-bold uppercase tracking-[0.2em] text-[10px]">
              Daily Kitchen Overview
            </Text>
            <Title level={1} className="!mt-2 !text-slate-900 !font-bold">
              Welcome back, {user?.username || "Guest"}! 👋
            </Title>
          </div>
          {error && <Tag color="error" className="rounded-full px-4">{error}</Tag>}
        </div>
        <Paragraph className="text-slate-500 max-w-2xl text-lg mt-2">
          Here&apos;s what&apos;s happening today in your kitchen. Track your
          meals and manage your pantry with ease.
        </Paragraph>
      </div>

      <Row gutter={[24, 24]} className="animate-fade-in-up delay-100">
        <Col xs={24} lg={16}>
          <Card
            title={
              <div className="flex items-center gap-3 py-1">
                <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                  <CalendarOutlined />
                </div>
                <span className="font-bold text-slate-800 text-lg">Today&apos;s Menu</span>
              </div>
            }
            extra={
              <Button
                type="link"
                onClick={() => router.push("/meal-plan")}
                className="text-orange-500 hover:text-orange-700 font-bold flex items-center"
              >
                Open Planner <RightOutlined size={12} className="ml-1" />
              </Button>
            }
            className="shadow-xl shadow-slate-200/50 rounded-[2rem] border-none h-full"
          >
            {todayMeals.length > 0 ? (
              <List
                dataSource={["BREAKFAST", "LUNCH", "DINNER", "SNACK"]}
                renderItem={(type) => {
                  const meal = todayMeals.find((m) => m.mealType === type);
                  return (
                    <div
                      key={type}
                      className={`flex items-center justify-between p-5 rounded-2xl mb-4 transition-all ${meal ? "bg-orange-50/30 border border-orange-100" : "bg-slate-50/50 border border-slate-100 opacity-60"}`}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm ${meal ? "bg-white" : "bg-slate-100"}`}>
                          {getMealIcon(type)}
                        </div>
                        <div>
                          <Text className={`block font-bold text-xs uppercase tracking-widest ${meal ? "text-orange-500" : "text-slate-400"}`}>
                            {type}
                          </Text>
                          <Text className={`text-lg font-bold ${meal ? "text-slate-800" : "text-slate-400"}`}>
                            {meal ? meal.recipe.name : "Nothing planned"}
                          </Text>
                        </div>
                      </div>
                      {meal && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-orange-50">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <Text className="text-xs font-bold text-slate-600 uppercase tracking-tight">Scheduled</Text>
                        </div>
                      )}
                    </div>
                  );
                }}
              />
            ) : (
              <div className="py-20 text-center">
                <div className="text-5xl mb-6 opacity-20">🥣</div>
                <Paragraph className="text-slate-400 font-medium text-lg mb-8">
                  Your menu is currently empty for today.
                </Paragraph>
                <Button
                  type="primary"
                  className="pm-button-primary !px-12 !h-12 !text-lg"
                  onClick={() => router.push("/meal-plan")}
                >
                  Start Planning
                </Button>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <div className="flex flex-col gap-6 h-full">
            <Card
              className="shadow-xl shadow-slate-200/50 rounded-[2rem] border-none"
              title={
                <div className="flex items-center gap-3 py-1">
                  <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                    <ShoppingCartOutlined />
                  </div>
                  <span className="font-bold text-slate-800 text-lg">Shopping List</span>
                </div>
              }
              extra={
                <Button
                  type="link"
                  onClick={() => router.push("/shopping-lists")}
                  className="text-orange-500 hover:text-orange-700 font-bold flex items-center"
                >
                  View All <RightOutlined size={12} className="ml-1" />
                </Button>
              }
            >
              <List
                dataSource={(shoppingList?.items ?? shoppingList?.shoppingListItems ?? []).filter(item => !item.isBought).slice(0, 5)}
                renderItem={(item) => (
                  <List.Item key={item.id} className="px-1 py-4 border-slate-50">
                    <div className="flex justify-between w-full items-center">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-orange-300" />
                        <Text className="text-slate-800 font-bold">
                          {item.ingredientName}
                        </Text>
                      </div>
                      <Tag className="rounded-lg border-none bg-orange-50 text-orange-600 font-bold px-3">
                        {item.quantity} {item.unit?.toLowerCase()}
                      </Tag>
                    </div>
                  </List.Item>
                )}
                locale={{
                  emptyText: (
                    <div className="py-12 text-center">
                      <div className="text-4xl mb-4 opacity-10">🛍️</div>
                      <Text className="text-slate-400 font-medium">All items bought!</Text>
                    </div>
                  ),
                }}
              />
            </Card>
          </div>
        </Col>
      </Row>
    </DashboardShell>
  );
};

export default Dashboard;
