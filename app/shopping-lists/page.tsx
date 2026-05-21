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
	App,
} from "antd";
import { PlusCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { EditOutlined } from "@ant-design/icons";
import DashboardShell from "@/components/dashboard-shell";
import GroupRequired from "@/components/group-required";
import { useApi } from "@/hooks/useApi";
import { useGroupMembership } from "@/hooks/useGroupMembership";
import type {
	ItemPatchDTO,
	ItemPutDTO,
	ShoppingListGetDTO,
	ShoppingListItemGetDTO,
	ShoppingListItemPostDTO,
} from "@/types/shopping-list";
import type { Unit } from "@/types/unit";
import {
	AddItemFormValues,
	IngredientCategory,
	IngredientGetDTO,
	IngredientPostDTO,
} from "@/types/ingredientCategory";
import { getCategoryEmoji, formatCategoryName } from "@/utils/categoryEmojis";

const { Title } = Typography;

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

const categoryOptions: Array<{ label: string; value: IngredientCategory }> = [
	{ label: "🥦 Vegetable", value: "VEGETABLE" },
	{ label: "🍎 Fruit", value: "FRUIT" },
	{ label: "🥩 Meat", value: "MEAT" },
	{ label: "🐟 Fish", value: "FISH" },
	{ label: "🧀 Dairy", value: "DAIRY" },
	{ label: "🥚 Eggs", value: "EGGS" },
	{ label: "🌱 Plant protein", value: "PLANT_PROTEIN" },
	{ label: "🌾 Grain", value: "GRAIN" },
	{ label: "🍞 Bakery", value: "BAKERY" },
	{ label: "🥐 Baking", value: "BAKING" },
	{ label: "🌿 Herb", value: "HERB" },
	{ label: "🌶️ Spice", value: "SPICE" },
	{ label: "🫗 Oil", value: "OIL" },
	{ label: "🍯 Condiment", value: "CONDIMENT" },
];

const getItemsFromList = (list: ShoppingListGetDTO | null): ShoppingListItemGetDTO[] => {
	if (!list) {
		return [];
	}
	return list.items ?? list.shoppingListItems ?? [];
};

const ShoppingListsPage: React.FC = () => {
	const apiService = useApi();
	const { notification } = App.useApp();
	const { hasGroup, isLoading: isGroupLoading } = useGroupMembership();
	const [addForm] = Form.useForm<AddItemFormValues>();
	const [editForm] = Form.useForm<ItemPutDTO>();
	const [shoppingList, setShoppingList] = useState<ShoppingListGetDTO | null>(null);
	const [ingredients, setIngredients] = useState<IngredientGetDTO[]>([]);
	const [isLoadingList, setIsLoadingList] = useState(true);
	const [isLoadingIngredients, setIsLoadingIngredients] = useState(true);
	const [isAdding, setIsAdding] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [busyItemIds, setBusyItemIds] = useState<number[]>([]);
	const [selectedItem, setSelectedItem] = useState<ShoppingListItemGetDTO | null>(null);
	const [isEditOpen, setIsEditOpen] = useState(false);

	const items = useMemo(() => getItemsFromList(shoppingList), [shoppingList]);

	const fetchShoppingList = useCallback(
		async (showLoader = true) => {
			if (showLoader) {
				setIsLoadingList(true);
			}
			try {
				const data = await apiService.get<ShoppingListGetDTO>("/groups/me/shopping-list");
				setShoppingList(data);
			} catch (error) {
				// If status is 404, it likely means no group, which is an expected "Individual" state now.
				if (error && typeof error === "object" && "status" in error && error.status === 404) {
					console.debug("No shopping list found - user likely not in a group.");
					setShoppingList(null);
				} else if (error instanceof Error) {
					notification.error({
						message: "Failed to Load Shopping List",
						description: error.message,
						placement: "topRight",
					});
				} else {
					notification.error({
						message: "Failed to Load Shopping List",
						description: "Could not load the shopping list.",
						placement: "topRight",
					});
				}
			} finally {
				if (showLoader) {
					setIsLoadingList(false);
				}
			}
		},
		[apiService, notification],
	);

	const fetchIngredients = useCallback(async () => {
		setIsLoadingIngredients(true);
		try {
			const data = await apiService.get<IngredientGetDTO[]>("/ingredients");
			setIngredients(data);
		} catch (error) {
			if (error instanceof Error) {
				notification.error({
					message: "Failed to Load Ingredients",
					description: error.message,
					placement: "topRight",
				});
			} else {
				notification.error({
					message: "Failed to Load Ingredients",
					description: "Could not load ingredients.",
					placement: "topRight",
				});
			}
		} finally {
			setIsLoadingIngredients(false);
		}
	}, [apiService, notification]);

	useEffect(() => {
		if (!hasGroup) {
			setIsLoadingList(false);
			return;
		}
		fetchShoppingList(true);

		// Polling for real-time updates
		const interval = setInterval(() => {
			fetchShoppingList(false);
		}, 5000);

		return () => clearInterval(interval);
	}, [fetchShoppingList, hasGroup]);

	useEffect(() => {
		if (!hasGroup) {
			setIsLoadingIngredients(false);
			return;
		}
		fetchIngredients();
	}, [fetchIngredients, hasGroup]);

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
			notification.error({
				message: "Invalid Input",
				description: "Ingredient name must be provided.",
				placement: "topRight",
			});
			return;
		}
		const cleanDescription = (values.ingredientDescription ?? "").trim();
		setIsAdding(true);
		try {
			const cleanUnit = values.standardUnit;
			const cleanCategory = values.category;
			const normalizedName = cleanName.toLowerCase();
			let ingredient = ingredients.find(
				(item) => (item.ingredientName?.trim().toLowerCase() ?? "") === normalizedName,
			);
			const selectedUnit = cleanUnit ?? ingredient?.standardUnit;
			if (!selectedUnit) {
				notification.error({
					message: "Invalid Input",
					description: "Unit must be selected.",
					placement: "topRight",
				});
				return;
			}

			if (!ingredient?.id) {
				const createPayload: IngredientPostDTO = {
					ingredientName: cleanName,
					ingredientDescription: cleanDescription,
					standardUnit: selectedUnit,
					category: cleanCategory,
				};

				const createdIngredient = await apiService.post<IngredientGetDTO>(
					"/ingredients",
					createPayload,
				);

				ingredient = createdIngredient;
				setIngredients((prev) => [...prev, createdIngredient]);
			}

			if (!ingredient.id) {
				notification.error({
					message: "Failed to Add Item",
					description: "Ingredient was created but no id was returned.",
					placement: "topRight",
				});
				return;
			}

			const shoppingPayload: ShoppingListItemPostDTO = {
				ingredientId: ingredient.id,
				ingredientName: cleanName ?? ingredient.ingredientName,
				ingredientDescription: cleanDescription ?? ingredient.ingredientDescription,
				quantity: values.quantity,
				category: cleanCategory ?? ingredient.category,
				unit: selectedUnit,
				standardUnit: selectedUnit,
			};

			await apiService.post<ShoppingListItemGetDTO>(
				"/groups/me/shopping-list/items",
				shoppingPayload,
			);
			notification.success({
				message: "Item Added",
				description: "Item added to shopping list.",
				placement: "topRight",
			});
			addForm.resetFields();
			await fetchIngredients();
			await fetchShoppingList(false);
		} catch (error) {
			if (error instanceof Error) {
				notification.error({
					message: "Failed to Add Item",
					description: error.message,
					placement: "topRight",
				});
			} else {
				notification.error({
					message: "Failed to Add Item",
					description: "Could not add the item.",
					placement: "topRight",
				});
			}
		} finally {
			setIsAdding(false);
		}
	};

	const loadItemById = async (itemId: number): Promise<ShoppingListItemGetDTO | null> => {
		try {
			return await apiService.get<ShoppingListItemGetDTO>(
				`/groups/me/shopping-list/items/${itemId}`,
			);
		} catch (error) {
			if (error instanceof Error) {
				notification.error({
					message: "Failed to Load Item",
					description: error.message,
					placement: "topRight",
				});
			} else {
				notification.error({
					message: "Failed to Load Item",
					description: "Could not load item details.",
					placement: "topRight",
				});
			}
			return null;
		}
	};

	const handleOpenEdit = async (itemId?: number) => {
		if (!itemId) {
			notification.error({
				message: "Invalid Item",
				description: "Item has no id and cannot be edited.",
				placement: "topRight",
			});
			return;
		}
		const item = await loadItemById(itemId);
		if (!item) {
			return;
		}
		setSelectedItem(item);
		setIsEditOpen(true);
	};

	const handleQuantityChange = (newQuantity: number) => {
		if (selectedItem && newQuantity > 0) {
			setSelectedItem({ ...selectedItem, quantity: newQuantity });
		}
	};

	const handleUpdateItem = async () => {
		if (!selectedItem?.id) {
			notification.error({
				message: "Failed to Update Item",
				description: "No item selected for update.",
				placement: "topRight",
			});
			return;
		}
		setIsUpdating(true);
		try {
			const payload: ItemPutDTO = {
				ingredientId: selectedItem.ingredientId,
				quantity: selectedItem.quantity,
			};
			await apiService.put<void>(`/groups/me/shopping-list/items/${selectedItem.id}`, payload);
			notification.success({
				message: "Item Updated",
				description: "Item updated.",
				placement: "topRight",
			});
			setIsEditOpen(false);
			await fetchShoppingList();
		} catch (error) {
			if (error instanceof Error) {
				notification.error({
					message: "Failed to Update Item",
					description: error.message,
					placement: "topRight",
				});
			} else {
				notification.error({
					message: "Failed to Update Item",
					description: "Could not update the item.",
					placement: "topRight",
				});
			}
		} finally {
			setIsUpdating(false);
		}
	};

	const handleToggleBought = async (item: ShoppingListItemGetDTO, isBought: boolean) => {
		if (!item.id) {
			notification.error({
				message: "Invalid Item",
				description: "Item has no id and cannot be updated.",
				placement: "topRight",
			});
			return;
		}
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
				notification.error({
					message: "Failed to Update Item",
					description: error.message,
					placement: "topRight",
				});
			} else {
				notification.error({
					message: "Failed to Update Item",
					description: "Could not update bought status.",
					placement: "topRight",
				});
			}
		} finally {
			markItemBusy(item.id, false);
		}
	};

	const handleDeleteItem = async (itemId?: number) => {
		if (!itemId) {
			notification.error({
				message: "Invalid Item",
				description: "Item has no id and cannot be deleted.",
				placement: "topRight",
			});
			return;
		}
		markItemBusy(itemId, true);
		try {
			await apiService.delete<void>(`/groups/me/shopping-list/items/${itemId}`);
			notification.success({
				message: "Item Deleted",
				description: "Item deleted.",
				placement: "topRight",
			});
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
				notification.error({
					message: "Failed to Delete Item",
					description: error.message,
					placement: "topRight",
				});
			} else {
				notification.error({
					message: "Failed to Delete Item",
					description: "Could not delete the item.",
					placement: "topRight",
				});
			}
		} finally {
			markItemBusy(itemId, false);
		}
	};

	const columns: TableColumnsType<ShoppingListItemGetDTO> = [
		{
			title: "Bought",
			key: "isBought",
			width: 80,
			render: (_, record) => (
				<Space>
					<Checkbox
						checked={Boolean(record.isBought)}
						disabled={!record.id || busyItemIds.includes(record.id) || record.isBought}
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
			title: "Category",
			key: "category",
			render: (_, record) => (
				<span className={record.isBought ? "line-through text-slate-400" : ""}>
					{record.category ? `${getCategoryEmoji(record.category)} ${formatCategoryName(record.category)}` : "-"}
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
						disabled={record.isBought}
					/>
					{/* delete button removed per request */}
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
		if (selectedIngredient.standardUnit?.trim()) {
			addForm.setFieldValue("standardUnit", selectedIngredient.standardUnit);
		}
		if (selectedIngredient.category) {
			addForm.setFieldValue("category", selectedIngredient.category);
		}
	};

	const [search, setSearch] = useState("");

	const filteredOptions = ingredientOptions.filter((opt) =>
		opt.label.toLowerCase().includes(search.toLowerCase()),
	);

	const [addFormVisible, setAddFormVisible] = useState(false);

	const handleAddFormVisibleChange = () => {
		setAddFormVisible(!addFormVisible);
	};

	if (isGroupLoading) {
		return (
			<DashboardShell headerTitle="Shopping Lists" selectedMenuKey="3">
				<div className="shopping-page">
					<div className="flex items-center justify-center py-20">
						<Spin size="large" />
					</div>
				</div>
			</DashboardShell>
		);
	}

	if (!hasGroup) {
		return (
			<DashboardShell headerTitle="Shopping Lists" selectedMenuKey="3">
				<GroupRequired featureName="Shopping Lists" />
			</DashboardShell>
		);
	}

	return (
		<DashboardShell headerTitle="Shopping Lists" selectedMenuKey="3">
			<div className="shopping-page">
				<div className="mb-8 flex items-center justify-between gap-4">
					<div className="flex items-center gap-3 bg-indigo-100 border border-indigo-200 rounded-lg px-3 py-2 shadow-sm">
						<span className="text-4xl leading-none">🛒</span>
						<Title level={2} className="!m-0 !text-slate-900">
							Shopping List
						</Title>
					</div>
					<div className={"flex gap-2"}>
						<Button className="pm-button" onClick={handleAddFormVisibleChange}>
							{addFormVisible ? (
								<div className={"flex items-center gap-2"}>
									<CloseCircleOutlined />
									Close Form
								</div>
							) : (
								<div className={"flex items-center gap-2"}>
									<PlusCircleOutlined />
									Add Item
								</div>
							)}
						</Button>
					</div>
				</div>

				{addFormVisible && (
					<Card className="rounded-3xl border border-blue-300 bg-blue-100/60 shadow-sm">
						<Title level={4} className="!mt-0">
							Add item to database and shopping list
						</Title>
						<Form form={addForm} layout="vertical" onFinish={handleAddItem}>
							{/* Row 1: Name & Quantity side-by-side */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<Form.Item
									label="Name"
									name="ingredientName"
									rules={[
										{ required: true, message: "Required" },
										{ whitespace: true, message: "Required" },
									]}
								>
									<AutoComplete
										options={filteredOptions}
										onSelect={(value: string) => handleIngredientSelect(value)}
										onChange={(value: string) => setSearch(value)}
										placeholder={isLoadingIngredients ? "Loading ingredients..." : "e.g. Tomatoes"}
									/>
								</Form.Item>

								<Form.Item
									label="Quantity"
									name="quantity"
									rules={[{ required: true, message: "Required" }]}
								>
									<InputNumber min={0.1} step={0.1} className="w-full" placeholder="e.g. 2" />
								</Form.Item>
							</div>

							{/* Row 2: Unit & Category side-by-side */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<Form.Item
									label="Unit"
									name="standardUnit"
									rules={[{ required: true, message: "Required" }]}
								>
									<Select className="min-w-28 w-full" options={unitOptions} placeholder="Choose" />
								</Form.Item>

								<Form.Item
									label="Category"
									name="category"
									rules={[{ required: true, message: "Required" }]}
								>
									<Select
										className="min-w-40 w-full"
										options={categoryOptions}
										placeholder="Choose"
									/>
								</Form.Item>
							</div>

							{/* Row 3: Description full width */}
							<Form.Item label="Description" name="ingredientDescription">
								<Input placeholder="Short ingredient description" />
							</Form.Item>

							<Form.Item>
								<Button className="pm-button" htmlType="submit" loading={isAdding}>
									Save entry
								</Button>
							</Form.Item>
						</Form>
					</Card>
				)}

				<Card className="rounded-3xl border-l-4 border-blue-300 bg-blue-100/40 shadow-sm">
					<Title level={4} className="!mt-0 text-blue-800">
						Shopping — Items you want to buy
					</Title>
					{isLoadingList ? (
						<div className="flex items-center justify-center py-10">
							<Spin size="large" />
						</div>
					) : (
						<div className="p-4 bg-blue-50/30 rounded-lg">
							<Table<ShoppingListItemGetDTO>
								className="shopping-table bg-transparent"
								columns={columns}
								dataSource={items}
								pagination={{ pageSize: 8 }}
								rowKey={(record) =>
									`${record.id ?? record.ingredientId ?? record.ingredientName ?? "temp"}`
								}
								rowClassName={(record) => (record.isBought ? "line-through text-slate-400" : "")}
							/>
						</div>
					)}
				</Card>

			<Modal
				title={selectedItem?.ingredientName ? `Edit Quantity - ${selectedItem.ingredientName}` : "Edit Quantity"}
				open={isEditOpen}
				onCancel={() => setIsEditOpen(false)}
				footer={[
					<Button key="cancel" onClick={() => setIsEditOpen(false)}>
						Cancel
					</Button>,
					<Button
						key="submit"
						type="primary"
						className="pm-button"
						loading={isUpdating}
						onClick={handleUpdateItem}
					>
						Save
					</Button>,
				]}
			>
				{selectedItem && (
					<div className="flex flex-col items-center justify-center gap-6 py-8">
						<div className="text-center">
							<div className="text-sm text-slate-500 mb-2">Current Quantity</div>
							<div className="text-3xl font-bold text-primary-600">
								{selectedItem.quantity} {unitOptions.find((opt) => opt.value === selectedItem.unit)?.label}
							</div>
						</div>
					<div className="flex items-center gap-4">
						<Button
							size="middle"
							className="pm-button !h-10 !w-10 !min-w-10 !p-0"
							onClick={() => handleQuantityChange(selectedItem.quantity - 1)}
							disabled={selectedItem.quantity <= 0.1}
						>
							−
						</Button>
						<div className="w-24 text-center">
							<InputNumber
								className="w-full text-center"
								size="large"
								value={selectedItem.quantity}
								onChange={(value) => handleQuantityChange(value ?? 0.1)}
								min={0.1}
								step={0.1}
								precision={1}
								controls={false}
							/>
						</div>
						<Button
							size="middle"
							className="pm-button !h-10 !w-10 !min-w-10 !p-0"
							onClick={() => handleQuantityChange(selectedItem.quantity + 1)}
						>
							+
						</Button>
					</div>
					</div>
				)}
			</Modal>
			</div>
		</DashboardShell>
	);
};

export default ShoppingListsPage;
