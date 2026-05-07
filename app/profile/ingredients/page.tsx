"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button, Card, Spin, Table, Typography } from "antd";
import type { TableColumnsType } from "antd";
import DashboardShell from "@/components/dashboard-shell";
import { useApi } from "@/hooks/useApi";
import type { IngredientGetDTO } from "@/types/ingredientCategory";
import PageHeader from "@/components/page-header";
import { sort } from "next/dist/build/webpack/loaders/css-loader/src/utils";

const { Title, Text } = Typography;

const ingredientColumns: TableColumnsType<IngredientGetDTO> = [
	{
		title: "Name",
		dataIndex: "ingredientName",
		key: "ingredientName",
		render: (value: string | undefined) => value ?? "-",
	},
	{
		title: "Description",
		dataIndex: "ingredientDescription",
		key: "ingredientDescription",
		render: (value: string | undefined) => value ?? "-",
	},
	{
		title: "Unit",
		dataIndex: "standardUnit",
		key: "unit",
		render: (value: IngredientGetDTO["standardUnit"]) => value ?? "-",
	},
	{
		title: "Category",
		dataIndex: "category",
		key: "category",
		render: (value: IngredientGetDTO["category"]) => value ?? "-",
	},
];

const UserIngredientsPage: React.FC = () => {
	const apiService = useApi();
	const params = useParams<{ id?: string | string[] }>();
	const [ingredients, setIngredients] = useState<IngredientGetDTO[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState("");

	const fetchIngredients = useCallback(async () => {
		setIsLoading(true);
		setErrorMessage("");
		try {
			const data = await apiService.get<IngredientGetDTO[]>('/ingredients');
			setIngredients(Array.isArray(data) ? data.sort((a, b) => a.ingredientName.localeCompare(b.ingredientName)) : []);
		} catch (error) {
			if (error instanceof Error) {
				setErrorMessage(error.message);
			} else {
				setErrorMessage("Could not load the ingredients.");
			}
		} finally {
			setIsLoading(false);
		}
	}, [apiService]);

	useEffect(() => {
		fetchIngredients();
	}, [fetchIngredients]);

	return (
		<div>
			<PageHeader title={"Your Ingredients"} />
			<Card className="rounded-3xl border border-primary-200 bg-white/90">
				<Title level={4} className="!mt-0">
					Ingredients
				</Title>
				{isLoading ? (
					<div className="flex items-center justify-center py-10">
						<Spin size="large" />
					</div>
				) : ingredients.length > 0 ? (
					<Table<IngredientGetDTO>
						columns={ingredientColumns}
						dataSource={ingredients}
						pagination={{ pageSize: 10 }}
						rowKey={(record, index) => `${record.id ?? record.ingredientName ?? "ingredient"}-${index}`}
					/>
				) : (
					<div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-slate-500">
						No ingredients found for this user.
					</div>
				)}
			</Card>
		</div>
			);
};

export default UserIngredientsPage;

