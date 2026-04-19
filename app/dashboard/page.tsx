"use client";

import React, { useEffect, useState } from "react";
import { Typography, Row, Col, Card, Statistic, Spin, Alert } from "antd";
import { ShoppingOutlined, FileTextOutlined, UserOutlined } from "@ant-design/icons";
import DashboardShell from "@/components/dashboard-shell";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { PantryGetDTO } from "@/types/pantry";
import { ShoppingListGetDTO } from "@/types/shopping-list";

const { Title, Text } = Typography;

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
					<Spin size="large" description="Preparing your kitchen dashboard..." />
				</div>
			</DashboardShell>
		);
	}

	return (
		<DashboardShell headerTitle="Dashboard" selectedMenuKey="1">
			<div style={{ marginBottom: "32px" }}>
				<Title level={2} style={{ margin: 0, color: "#0f172a" }}>
					Good morning, {user?.username ?? "Chef"}
				</Title>
				<Text className="text-secondary-600">Welcome to your kitchen. Here&apos;s your current status.</Text>
			</div>

			{error && (
				<Alert
					message="Connection Issue"
					description="There was a problem reaching the server. Please check your connection."
					type="warning"
					showIcon
					className="mb-8 rounded-2xl"
				/>
			)}

			<Row gutter={[24, 24]}>
				<Col xs={24} sm={12} lg={8}>
					<Card className="rounded-3xl border border-primary-200 bg-white/90 shadow-sm transition-all hover:shadow-md">
						<Statistic
							title={<span className="text-lg font-medium text-slate-600">Pantry Stock</span>}
							value={pantryItemCount}
							prefix={<ShoppingOutlined className="mr-2 text-primary-500" />}
							suffix="Items"
							styles={{ content: { color: "#f97316", fontWeight: "bold" } }}
						/>
						<div className="mt-4 border-t border-slate-100 pt-4">
							<Text className="text-xs text-slate-500">
								{!pantry ? "Join a group to start tracking your stock." : "View and manage your current ingredients."}
							</Text>
						</div>
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={8}>
					<Card className="rounded-3xl border border-primary-200 bg-white/90 shadow-sm transition-all hover:shadow-md">
						<Statistic
							title={<span className="text-lg font-medium text-slate-600">Shopping List</span>}
							value={shoppingListItemCount}
							prefix={<FileTextOutlined className="mr-2 text-primary-500" />}
							suffix="To Buy"
							styles={{ content: { color: "#f97316", fontWeight: "bold" } }}
						/>
						<div className="mt-4 border-t border-slate-100 pt-4">
							<Text className="text-xs text-slate-500">
								{!shoppingList ? "Your grocery list will appear here once you're in a group." : "Items remaining on your grocery list."}
							</Text>
						</div>
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={8}>
					<Card className="rounded-3xl border border-primary-200 bg-white/90 shadow-sm transition-all hover:shadow-md">
						<Statistic
							title={<span className="text-lg font-medium text-slate-600">Kitchen Profile</span>}
							value={user?.username ?? "Active"}
							prefix={<UserOutlined className="mr-2 text-primary-500" />}
							styles={{ content: { color: "#f97316", fontWeight: "bold", fontSize: "1.5rem" } }}
						/>
						<div className="mt-4 border-t border-slate-100 pt-4">
							<Text className="text-xs text-slate-500">Your individual profile is ready.</Text>
						</div>
					</Card>
				</Col>
			</Row>
		</DashboardShell>
	);
};

export default Dashboard;
