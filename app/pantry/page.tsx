"use client";

/* Backend Code
@GetMapping("/groups/me/pantry")
@ResponseStatus(HttpStatus.OK)
@ResponseBody
public PantryGetDTO getPantry(Authentication auth) {
	Group group = groupService.getGroupOfUser(auth.getName());
	Pantry pantry = pantryService.getPantryByGroupId(group.getId());
	return DTOMapper.INSTANCE.convertEntityToPantryGetDTO(pantry);
}

@PostMapping("/groups/me/pantry/items")
@ResponseStatus(HttpStatus.CREATED)
@ResponseBody
public PantryItemGetDTO addItem(Authentication auth, @RequestBody PantryItemPostDTO dto) {
	Group group = groupService.getGroupOfUser(auth.getName());
	Pantry pantry = pantryService.getPantryByGroupId(group.getId());
	PantryItem item = pantryService.addItemToPantry(
		pantry.getId(), dto.getIngredientId(), dto.getQuantity());
	return DTOMapper.INSTANCE.convertEntityToPantryItemGetDTO(item);
}
*/

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
	Table,
	type TableColumnsType,
	Typography,
	Select,
} from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import DashboardShell from "@/components/dashboard-shell";
import { useApi } from "@/hooks/useApi";
import type {
	PantryItemGetDTO,
	PantryItemPostDTO,
	PantryItemPutDTO,
	PantryGetDTO,
} from "@/types/pantry";
import type { Unit } from "@/types/unit";

const { Title } = Typography;

interface IngredientGetDTO {
	id?: number;
	ingredientName?: string;
	unit?: Unit;
	ingredientDescription?: string;
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

const getItemsFromList = (list: PantryGetDTO | null): PantryItemGetDTO[] => {
	if (!list) {
		return [];
	}
	return list.items ?? [];
};

const PantryPage: React.FC = () => {
	const apiService = useApi();
	const [addForm] = Form.useForm<AddItemFormValues>();
	const [editForm] = Form.useForm<PantryItemPutDTO>();
	const [pantry, setPantry] = useState<PantryGetDTO | null>(null);
	const [ingredients, setIngredients] = useState<IngredientGetDTO[]>([]);
	const [isLoadingList, setIsLoadingList] = useState(true);
	const [isLoadingIngredients, setIsLoadingIngredients] = useState(true);
	const [isAdding, setIsAdding] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [busyItemIds, setBusyItemIds] = useState<number[]>([]);
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [selectedItem, setSelectedItem] = useState<PantryItemGetDTO | null>(null);
	const [isEditOpen, setIsEditOpen] = useState(false);

	const items = useMemo(() => getItemsFromList(pantry), [pantry]);

	const fetchPantry = useCallback(
		async (showLoader = true) => {
			if (showLoader) {
				setIsLoadingList(true);
			}
			setErrorMessage("");
			try {
				const data = await apiService.get<PantryGetDTO>("/groups/me/pantry");
				setPantry(data);
			} catch (error) {
				// If status is 404, it likely means no group, which is an expected "Individual" state now.
				if (error && typeof error === "object" && "status" in error && error.status === 404) {
					console.debug("No pantry found - user likely not in a group.");
					setPantry(null);
				} else if (error instanceof Error) {
					setErrorMessage(error.message);
				} else {
					setErrorMessage("Could not load the pantry.");
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
		fetchPantry(true);
	}, [fetchPantry]);

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
		const cleanName = (values.ingredientName ?? "").trim();
		if (!cleanName) {
			setErrorMessage("Ingredient name must be provided.");
			return;
		}
		const cleanDescription = (values.ingredientDescription ?? "").trim();
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

			const shoppingPayload: PantryItemPostDTO = {
				ingredientId: ingredient.id,
				quantity: values.quantity,
			};

			await apiService.post<PantryItemGetDTO>("/groups/me/pantry/items", shoppingPayload);
			setSuccessMessage("Item added to pantry.");
			addForm.resetFields();
			await fetchIngredients();
			await fetchPantry(false);
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

	const loadItemById = async (itemId: number): Promise<PantryItemGetDTO | null> => {
		setErrorMessage("");
		try {
			return await apiService.get<PantryItemGetDTO>(`/groups/me/pantry/items/${itemId}`);
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

	const handleUpdateItem = async (values: PantryItemPutDTO) => {
		if (!selectedItem?.id) {
			setErrorMessage("No item selected for update.");
			return;
		}
		setErrorMessage("");
		setSuccessMessage("");
		setIsUpdating(true);
		try {
			await apiService.put<void>(`/groups/me/pantry/items/${selectedItem.id}`, values);
			setSuccessMessage("Item updated.");
			setIsEditOpen(false);
			await fetchPantry();
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

	const handleDeleteItem = async (itemId?: number) => {
		if (!itemId) {
			setErrorMessage("Item has no id and cannot be deleted.");
			return;
		}
		setErrorMessage("");
		setSuccessMessage("");
		markItemBusy(itemId, true);
		try {
			await apiService.delete<void>(`/groups/me/pantry/items/${itemId}`);
			setSuccessMessage("Item deleted.");
			setPantry((prev) => {
				if (!prev) {
					return prev;
				}
				const filteredItems = getItemsFromList(prev).filter((entry) => entry.id !== itemId);
				return { ...prev, items: filteredItems };
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

	const columns: TableColumnsType<PantryItemGetDTO> = [
		{
			title: "Ingredient",
			key: "ingredient",
			render: (_, record) => (
				<span>{record.ingredientName ?? `Ingredient #${record.ingredientId ?? "-"}`}</span>
			),
		},
		{
			title: "Quantity",
			dataIndex: "quantity",
			key: "quantity",
			render: (value: number | undefined, record) => (
				<span>
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
		<DashboardShell headerTitle="Pantry" selectedMenuKey="2">
			<div className="mb-8 flex items-center justify-between gap-4">
				<Title level={2} className="!m-0 !text-slate-900">
					Pantry
				</Title>
				<Button className="pm-button" onClick={() => fetchPantry(true)}>
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
				<Title level={4} className="!mt-0">
					Add item to pantry
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
					<Form.Item
						label="Description"
						name="ingredientDescription"
						rules={[
							{ required: true, message: "Required" },
							{ whitespace: true, message: "Required" },
						]}
					>
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
				<Title level={4} className="!mt-0">
					Current items
				</Title>
				{isLoadingList ? (
					<div className="flex items-center justify-center py-10">
						<Spin size="large" />
					</div>
				) : (
					<Table<PantryItemGetDTO>
						columns={columns}
						dataSource={items}
						pagination={{ pageSize: 8 }}
						rowKey={(record) => record.id ?? `temp-${record.ingredientId}`}
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

export default PantryPage;
