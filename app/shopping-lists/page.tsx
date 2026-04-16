"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
	AutoComplete,
	Button,
	Card,
	Form,
	Input,
	InputNumber,
	Modal,
	Popconfirm,
	Space,
	Spin,
	Checkbox,
	Table,
	type TableColumnsType,
	Typography,
	Select,
} from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import DashboardShell from "@/components/dashboard-shell";
import { useApi } from "@/hooks/useApi";
import type {
	ItemPatchDTO,
	ItemPutDTO,
	ShoppingListGetDTO,
	ShoppingListItemGetDTO,
	ShoppingListItemPostDTO,
} from "@/types/shopping-list";
import type { Unit } from "@/types/unit";

const { Title } = Typography;

interface IngredientGetDTO {
	id?: number;
	ingredientName?: string;
	ingredientDescription?: string;
	unit?: Unit;
}

interface IngredientPostDTO {
	ingredientName: string;
	ingredientDescription: string;
	unit: Unit;
}

interface AddItemFormValues {
	ingredientName: string;
	ingredientDescription: string;
	quantity: number;
	unit: Unit;
}

const unitOptions: Array<{ label: string; value: Unit }> = [
	{ label: "g", value: "GRAM" },
	{ label: "kg", value: "KILOGRAM" },
	{ label: "ml", value: "MILLILITER" },
	{ label: "cl", value: "CENTILITER" },
	{ label: "l", value: "LITER" },
	{ label: "piece", value: "PIECE" },
	{ label: "tbsp", value: "TABLESPOON" },
	{ label: "tsp", value: "TEASPOON" },
	{ label: "cup", value: "CUP" },
];

const getItemsFromList = (list: ShoppingListGetDTO | null): ShoppingListItemGetDTO[] => {
	if (!list) {
		return [];
	}
	return list.items ?? list.shoppingListItems ?? [];
};

const ShoppingListsPage: React.FC = () => {
	const apiService = useApi();
	const [addForm] = Form.useForm<AddItemFormValues>();
	const [editForm] = Form.useForm<ItemPutDTO>();
	const [shoppingList, setShoppingList] = useState<ShoppingListGetDTO | null>(null);
	const [ingredients, setIngredients] = useState<IngredientGetDTO[]>([]);
	const [isLoadingList, setIsLoadingList] = useState(true);
	const [isLoadingIngredients, setIsLoadingIngredients] = useState(true);
	const [isAdding, setIsAdding] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [busyItemIds, setBusyItemIds] = useState<number[]>([]);
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [selectedItem, setSelectedItem] = useState<ShoppingListItemGetDTO | null>(null);
	const [isEditOpen, setIsEditOpen] = useState(false);

	const items = useMemo(() => getItemsFromList(shoppingList), [shoppingList]);

	const fetchShoppingList = useCallback(
		async (showLoader = true) => {
			if (showLoader) {
				setIsLoadingList(true);
			}
			setErrorMessage("");
			try {
				const data = await apiService.get<ShoppingListGetDTO>("/groups/me/shopping-list");
				setShoppingList(data);
			} catch (error) {
				if (error instanceof Error) {
					setErrorMessage(error.message);
				} else {
					setErrorMessage("Could not load the shopping list.");
				}
			} finally {
				if (showLoader) {
					setIsLoadingList(false);
				}
			}
		},
		[apiService],
	);

	const fetchIngredients = useCallback(async () => {
		setIsLoadingIngredients(true);
		try {
			const data = await apiService.get<IngredientGetDTO[]>("/ingredients");
			setIngredients(data);
		} catch (error) {
			if (error instanceof Error) {
				setErrorMessage(error.message);
			} else {
				setErrorMessage("Could not load ingredients.");
			}
		} finally {
			setIsLoadingIngredients(false);
		}
	}, [apiService]);

	useEffect(() => {
		fetchShoppingList(true);
	}, [fetchShoppingList]);

	useEffect(() => {
		fetchIngredients();
	}, [fetchIngredients]);

	const markItemBusy = (itemId: number, isBusy: boolean) => {
		setBusyItemIds((prev) => {
			if (isBusy && !prev.includes(itemId)) {
				return [...prev, itemId];
			}
			if (!isBusy) {
				return prev.filter((id) => id !== itemId);
			}
			return prev;
		});
	};

	const handleAddItem = async (values: AddItemFormValues) => {
		const cleanName = values.ingredientName.trim();
		if (!cleanName) {
			setErrorMessage("Ingredient name must be provided.");
			return;
		}
		const cleanDescription = values.ingredientDescription.trim();
		if (!cleanDescription) {
			setErrorMessage("Ingredient description must be provided.");
			return;
		}

		setErrorMessage("");
		setSuccessMessage("");
		setIsAdding(true);
		try {
			const cleanUnit = values.unit;
			const normalizedName = cleanName.toLowerCase();
			let ingredient = ingredients.find(
				(item) => (item.ingredientName?.trim().toLowerCase() ?? "") === normalizedName,
			);

			if (!ingredient?.id) {
				const createPayload: IngredientPostDTO = {
					ingredientName: cleanName,
					ingredientDescription: cleanDescription,
					unit: cleanUnit,
				};

				const createdIngredient = await apiService.post<IngredientGetDTO>(
					"/ingredients",
					createPayload,
				);

				ingredient = createdIngredient;
				setIngredients((prev) => [...prev, createdIngredient]);
			}

			if (!ingredient.id) {
				setErrorMessage("Ingredient was created but no id was returned.");
				return;
			}

			const shoppingPayload: ShoppingListItemPostDTO = {
				ingredientId: ingredient.id,
				quantity: values.quantity,
			};

			await apiService.post<ShoppingListItemGetDTO>(
				"/groups/me/shopping-list/items",
				shoppingPayload,
			);
			setSuccessMessage("Item added to shopping list.");
			addForm.resetFields();
			await fetchIngredients();
			await fetchShoppingList(false);
		} catch (error) {
			if (error instanceof Error) {
				setErrorMessage(error.message);
			} else {
				setErrorMessage("Could not add the item.");
			}
		} finally {
			setIsAdding(false);
		}
	};

	const loadItemById = async (itemId: number): Promise<ShoppingListItemGetDTO | null> => {
		setErrorMessage("");
		try {
			return await apiService.get<ShoppingListItemGetDTO>(
				`/groups/me/shopping-list/items/${itemId}`,
			);
		} catch (error) {
			if (error instanceof Error) {
				setErrorMessage(error.message);
			} else {
				setErrorMessage("Could not load item details.");
			}
			return null;
		}
	};

	const handleOpenEdit = async (itemId?: number) => {
		if (!itemId) {
			setErrorMessage("Item has no id and cannot be edited.");
			return;
		}
		const item = await loadItemById(itemId);
		if (!item) {
			return;
		}
		setSelectedItem(item);
		editForm.setFieldsValue({
			ingredientId: item.ingredientId,
			quantity: item.quantity,
		});
		setIsEditOpen(true);
	};

	const handleUpdateItem = async (values: ItemPutDTO) => {
		if (!selectedItem?.id) {
			setErrorMessage("No item selected for update.");
			return;
		}
		setErrorMessage("");
		setSuccessMessage("");
		setIsUpdating(true);
		try {
			await apiService.put<void>(`/groups/me/shopping-list/items/${selectedItem.id}`, values);
			setSuccessMessage("Item updated.");
			setIsEditOpen(false);
			await fetchShoppingList();
		} catch (error) {
			if (error instanceof Error) {
				setErrorMessage(error.message);
			} else {
				setErrorMessage("Could not update the item.");
			}
		} finally {
			setIsUpdating(false);
		}
	};

	const handleToggleBought = async (item: ShoppingListItemGetDTO, isBought: boolean) => {
		if (!item.id) {
			setErrorMessage("Item has no id and cannot be updated.");
			return;
		}
		setErrorMessage("");
		markItemBusy(item.id, true);
		try {
			const payload: ItemPatchDTO = { isBought };
			await apiService.patch<ShoppingListItemGetDTO>(
				`/groups/me/shopping-list/items/${item.id}`,
				payload,
			);
			setShoppingList((prev) => {
				if (!prev) {
					return prev;
				}
				const updatedItems = getItemsFromList(prev).map((entry) =>
					entry.id === item.id ? { ...entry, isBought } : entry,
				);
				if (prev.items) {
					return { ...prev, items: updatedItems };
				}
				return { ...prev, shoppingListItems: updatedItems };
			});
		} catch (error) {
			if (error instanceof Error) {
				setErrorMessage(error.message);
			} else {
				setErrorMessage("Could not update bought status.");
			}
		} finally {
			markItemBusy(item.id, false);
		}
	};

	const handleDeleteItem = async (itemId?: number) => {
		if (!itemId) {
			setErrorMessage("Item has no id and cannot be deleted.");
			return;
		}
		setErrorMessage("");
		setSuccessMessage("");
		markItemBusy(itemId, true);
		try {
			await apiService.delete<void>(`/groups/me/shopping-list/items/${itemId}`);
			setSuccessMessage("Item deleted.");
			setShoppingList((prev) => {
				if (!prev) {
					return prev;
				}
				const filteredItems = getItemsFromList(prev).filter((entry) => entry.id !== itemId);
				if (prev.items) {
					return { ...prev, items: filteredItems };
				}
				return { ...prev, shoppingListItems: filteredItems };
			});
		} catch (error) {
			if (error instanceof Error) {
				setErrorMessage(error.message);
			} else {
				setErrorMessage("Could not delete the item.");
			}
		} finally {
			markItemBusy(itemId, false);
		}
	};

	const columns: TableColumnsType<ShoppingListItemGetDTO> = [
		{
			title: "Bought",
			key: "isBought",
			render: (_, record) => (
				<Space>
					<Checkbox
						checked={Boolean(record.isBought)}
						disabled={!record.id || busyItemIds.includes(record.id)}
						onChange={(event) => handleToggleBought(record, event.target.checked)}
					/>
				</Space>
			),
		},
		{
			title: "Ingredient",
			key: "ingredient",
			render: (_, record) => (
				<span className={record.isBought ? "line-through text-slate-400" : ""}>
					{record.ingredientName ?? `Ingredient #${record.ingredientId ?? "-"}`}
				</span>
			),
		},
		{
			title: "Quantity",
			dataIndex: "quantity",
			key: "quantity",
			render: (value: number | undefined, record) => (
				<span className={record.isBought ? "line-through text-slate-400" : ""}>
					{value ?? "-"} {unitOptions.find((option) => option.value === record.unit)?.label}
				</span>
			),
		},
		{
			title: "Actions",
			key: "actions",
			render: (_, record) => (
				<Space wrap>
					<Button
						aria-label="Edit item"
						className="pm-button !h-9 !w-9 !min-w-9 !p-0"
						icon={<EditOutlined />}
						onClick={() => handleOpenEdit(record.id)}
						size="small"
					/>
					<Popconfirm
						title="Delete this item?"
						onConfirm={() => handleDeleteItem(record.id)}
						okText="Delete"
						cancelText="Cancel"
					>
						<Button
							aria-label="Delete item"
							className="pm-button !h-9 !w-9 !min-w-9 !p-0"
							danger
							icon={<DeleteOutlined />}
							disabled={!record.id || (record.id ? busyItemIds.includes(record.id) : false)}
							size="small"
						/>
					</Popconfirm>
				</Space>
			),
		},
	];

	const ingredientOptions = ingredients.map((ingredient) => ({
		value: ingredient.ingredientName ?? "",
		label: ingredient.ingredientName ?? "",
	}));

	const handleIngredientSelect = (value: string) => {
		const selectedIngredient = ingredients.find(
			(ingredient) => ingredient.ingredientName === value,
		);
		if (!selectedIngredient) {
			return;
		}
		if (selectedIngredient.ingredientDescription?.trim()) {
			addForm.setFieldValue(
				"ingredientDescription",
				selectedIngredient.ingredientDescription.trim(),
			);
		}
		if (selectedIngredient.unit?.trim()) {
			addForm.setFieldValue("unit", selectedIngredient.unit);
		}
	};

	return (
		<DashboardShell headerTitle="Shopping Lists" selectedMenuKey="3">
			<div className="mb-8 flex items-center justify-between gap-4">
				<Title level={2} style={{ margin: 0, color: "#0f172a" }}>
					Shopping Lists
				</Title>
				<Button className="pm-button" onClick={() => fetchShoppingList(true)}>
					Refresh
				</Button>
			</div>

			{successMessage ? (
				<div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
					{successMessage}
				</div>
			) : null}
			{errorMessage ? (
				<div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
					{errorMessage}
				</div>
			) : null}

			<Card className="mb-6 rounded-3xl border border-primary-200 bg-white/90">
				<Title level={4} style={{ marginTop: 0 }}>
					Add item to database and shopping list
				</Title>
				<Form form={addForm} layout="vertical" onFinish={handleAddItem}>
					<Form.Item
						label="Name"
						name="ingredientName"
						rules={[
							{ required: true, message: "Required" },
							{ whitespace: true, message: "Required" },
						]}
					>
						<AutoComplete
							options={ingredientOptions}
							onSelect={handleIngredientSelect}
							placeholder={isLoadingIngredients ? "Loading ingredients..." : "e.g. Tomatoes"}
						/>
					</Form.Item>
					<Form.Item label="Description" name="ingredientDescription">
						<Input placeholder="Short ingredient description" />
					</Form.Item>
					<Form.Item
						label="Quantity"
						name="quantity"
						rules={[{ required: true, message: "Required" }]}
					>
						<InputNumber min={0.1} step={0.1} placeholder="e.g. 2" />
					</Form.Item>
					<Form.Item label="Unit" name="unit" rules={[{ required: true, message: "Required" }]}>
						<Select className="min-w-28" options={unitOptions} placeholder="Choose" />
					</Form.Item>
					<Form.Item>
						<Button className="pm-button" htmlType="submit" loading={isAdding}>
							Save entry
						</Button>
					</Form.Item>
				</Form>
			</Card>

			<Card className="rounded-3xl border border-primary-200 bg-white/90">
				<Title level={4} style={{ marginTop: 0 }}>
					Current items
				</Title>
				{isLoadingList ? (
					<div className="flex items-center justify-center py-10">
						<Spin size="large" />
					</div>
				) : (
					<Table<ShoppingListItemGetDTO>
						columns={columns}
						dataSource={items}
						pagination={{ pageSize: 8 }}
						rowKey={(record, index) => `${record.id ?? "temp"}-${index}`}
					/>
				)}
			</Card>

			<Modal
				title="Edit item"
				open={isEditOpen}
				onCancel={() => setIsEditOpen(false)}
				onOk={() => editForm.submit()}
				confirmLoading={isUpdating}
				okText="Save"
			>
				<Form form={editForm} layout="vertical" onFinish={handleUpdateItem}>
					<Form.Item
						label="Ingredient ID"
						name="ingredientId"
						rules={[{ required: true, message: "Required" }]}
					>
						<InputNumber className="w-full" min={1} />
					</Form.Item>
					<Form.Item
						label="Quantity"
						name="quantity"
						rules={[{ required: true, message: "Required" }]}
					>
						<InputNumber className="w-full" min={0.1} step={0.1} />
					</Form.Item>
				</Form>
			</Modal>
		</DashboardShell>
	);
};

export default ShoppingListsPage;
