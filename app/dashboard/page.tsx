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
  CoffeeOutlined,
  FireOutlined,
  StarOutlined,
} from "@ant-design/icons";
import DashboardShell from "@/components/dashboard-shell";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { PantryGetDTO } from "@/types/pantry";
import { ShoppingListGetDTO } from "@/types/shopping-list";

const { Title, Text, Paragraph } = Typography;

const Dashboard: React.FC = () => {
	const apiService = useApi();
	const [user, setUser] = useState<User | null>(null);
	const [pantry, setPantry] = useState<PantryGetDTO | null>(null);
	const [shoppingList, setShoppingList] = useState<ShoppingListGetDTO | null>(null);
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
        <Text className="text-slate-400 font-medium uppercase tracking-wider text-xs">
          Overview
        </Text>
        <Title level={2} className="!mt-1 !text-slate-900">
          Welcome back, {userName}! 👋
        </Title>
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
            {loading ? (
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
            <Card className="shadow-sm rounded-2xl border-none bg-slate-900 text-white overflow-hidden relative">
              <div className="relative z-10">
                <Title level={4} className="!text-white !m-0">
                  Smart Pantry
                </Title>
                <Paragraph className="text-slate-400 mt-2 mb-6">
                  You have 4 items expiring soon.
                </Paragraph>
                <Button
                  ghost
                  className="rounded-lg border-slate-700 hover:!border-white hover:!text-white"
                  onClick={() => router.push("/pantry")}
                >
                  Manage Pantry
                </Button>
              </div>
              <div className="absolute -right-8 -bottom-8 opacity-10 text-[120px]">
                <CalendarOutlined />
              </div>
            </Card>

            <Card className="shadow-sm rounded-2xl border-slate-200 flex-1">
              <Title level={4} className="!m-0 !text-slate-800">
                Quick Tips
              </Title>
              <Divider className="my-4 border-slate-50" />
              <List
                split={false}
                dataSource={[
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
