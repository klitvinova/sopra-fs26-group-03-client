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
	Space,
	Spin,
	Table,
	type TableColumnsType,
	Typography,
	Select,
	App,
	Checkbox,
} from "antd";
import { CloseCircleOutlined, EditOutlined, PlusCircleOutlined } from "@ant-design/icons";
import DashboardShell from "@/components/dashboard-shell";
import GroupRequired from "@/components/group-required";
import { useApi } from "@/hooks/useApi";
import { useGroupMembership } from "@/hooks/useGroupMembership";
import type {
	PantryItemGetDTO,
	PantryItemPostDTO,
	PantryItemPutDTO,
	PantryGetDTO,
} from "@/types/pantry";
import type { Unit } from "@/types/unit";
import {
	AddItemFormValues,
	IngredientCategory,
	IngredientGetDTO,
	IngredientPostDTO,
} from "@/types/ingredientCategory";
import { getCategoryEmoji, formatCategoryName } from "@/utils/categoryEmojis";

const { Title } = Typography;

interface AutoDetectedIngredientGetDTO {
	id?: number;
	ingredientName?: string;
	ingredientDescription?: string;
	category?: IngredientCategory;
	unit?: Unit;
	quantity?: number;
}

interface DetectedIngredientFormValues {
	ingredients?: Array<AutoDetectedIngredientGetDTO>;
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
	{ label: "❓ Other", value: "OTHER" },
];

const getItemsFromList = (list: PantryGetDTO | null): PantryItemGetDTO[] => {
	if (!list) {
		return [];
	}
	return list.items ?? [];
};

const findIngredientByName = (
	ingredients: IngredientGetDTO[],
	value: string,
): IngredientGetDTO | undefined =>
	ingredients.find(
		(ingredient) =>
			(ingredient.ingredientName?.trim().toLowerCase() ?? "") === value.trim().toLowerCase(),
	);

interface IngredientAutocompleteInputProps {
	ingredients: IngredientGetDTO[];
	value?: string;
	isLoadingIngredients: boolean;
	placeholder: string;
	onChange?: (value: string) => void;
	onIngredientSelect?: (ingredient: IngredientGetDTO, value: string) => void;
}

const IngredientAutocompleteInput: React.FC<IngredientAutocompleteInputProps> = ({
	ingredients,
	value,
	isLoadingIngredients,
	placeholder,
	onChange,
	onIngredientSelect,
}) => {
	const [search, setSearch] = useState(value ?? "");

	useEffect(() => {
		setSearch(value ?? "");
	}, [value]);

	const options = useMemo(
		() =>
			ingredients
				.map((ingredient) => ({
					value: ingredient.ingredientName ?? "",
					label: ingredient.ingredientName ?? "",
				}))
				.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase())),
		[ingredients, search],
	);

	const handleChange = (nextValue: string) => {
		setSearch(nextValue);
		onChange?.(nextValue);
	};

	const handleSelect = (selectedName: string) => {
		const selectedIngredient = findIngredientByName(ingredients, selectedName);
		const resolvedValue = selectedIngredient?.ingredientName ?? selectedName;
		setSearch(resolvedValue);
		onChange?.(resolvedValue);
		if (selectedIngredient) {
			onIngredientSelect?.(selectedIngredient, resolvedValue);
		}
	};

	return (
		<AutoComplete
			options={options}
			onChange={handleChange}
			onSelect={handleSelect}
			placeholder={isLoadingIngredients ? "Loading ingredients..." : placeholder}
			value={value}
		/>
	);
};

interface DetectedIngredientRowProps {
	field: { key: number; name: number };
	ingredients: IngredientGetDTO[];
	isLoadingIngredients: boolean;
}

const DetectedIngredientRow: React.FC<DetectedIngredientRowProps> = ({
	field,
	ingredients,
	isLoadingIngredients,
}) => {
	const form = Form.useFormInstance();
	const ingredientName = Form.useWatch(["ingredients", field.name, "ingredientName"], form) as
		| string
		| undefined;

	const handleIngredientSelect = (ingredient: IngredientGetDTO, value: string) => {
		if (!ingredient.id) {
			return;
		}
		form.setFieldValue(["ingredients", field.name, "id"], ingredient.id);
		form.setFieldValue(
			["ingredients", field.name, "ingredientName"],
			ingredient.ingredientName ?? value,
		);
		if (ingredient.standardUnit?.trim()) {
			form.setFieldValue(["ingredients", field.name, "unit"], ingredient.standardUnit);
		}
		if (ingredient.category) {
			form.setFieldValue(["ingredients", field.name, "category"], ingredient.category);
		}
	};

	const handleIngredientChange = (value: string) => {
		form.setFieldValue(["ingredients", field.name, "ingredientName"], value);
		const selectedIngredient = findIngredientByName(ingredients, value);
		form.setFieldValue(["ingredients", field.name, "id"], selectedIngredient?.id);
		form.setFieldValue(["ingredients", field.name, "unit"], selectedIngredient?.standardUnit);
		form.setFieldValue(["ingredients", field.name, "category"], selectedIngredient?.category);
	};

	return (
		<Card key={field.key} size="small" className="rounded-2xl">
			<Form.Item name={[field.name, "id"]} hidden>
				<Input />
			</Form.Item>
			<Form.Item
				label="Ingredient"
				name={[field.name, "ingredientName"]}
				rules={[{ required: true, message: "Required" }]}
			>
				<IngredientAutocompleteInput
					ingredients={ingredients}
					value={ingredientName}
					isLoadingIngredients={isLoadingIngredients}
					placeholder="e.g. Tomatoes"
					onChange={handleIngredientChange}
					onIngredientSelect={handleIngredientSelect}
				/>
			</Form.Item>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
				<Form.Item
					label="Quantity"
					name={[field.name, "quantity"]}
					rules={[
						{ required: true, message: "Required" },
						{ type: "number", min: 1, message: "Quantity must be at least 1" },
					]}
				>
					<InputNumber min={0.1} className="w-full" />
				</Form.Item>

				<Form.Item
					label="Unit"
					name={[field.name, "unit"]}
					rules={[{ required: true, message: "Required" }]}
				>
					<Select className="min-w-28" options={unitOptions} placeholder="Choose" />
				</Form.Item>

				<Form.Item
					label="Category"
					name={[field.name, "category"]}
					rules={[{ required: true, message: "Required" }]}
				>
					<Select className="min-w-36" options={categoryOptions} placeholder="Choose" />
				</Form.Item>
			</div>
		</Card>
	);
};

const PantryPage: React.FC = () => {
	const apiService = useApi();
	const { notification } = App.useApp();
	const { hasGroup, isLoading: isGroupLoading } = useGroupMembership();
	const [addForm] = Form.useForm<AddItemFormValues>();
	const [editForm] = Form.useForm<PantryItemPutDTO>();
	const [pantry, setPantry] = useState<PantryGetDTO | null>(null);
	const [ingredients, setIngredients] = useState<IngredientGetDTO[]>([]);
	const [isLoadingList, setIsLoadingList] = useState(true);
	const [isLoadingIngredients, setIsLoadingIngredients] = useState(true);
	const [isAdding, setIsAdding] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [selectedItem, setSelectedItem] = useState<PantryItemGetDTO | null>(null);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [isDetectOpen, setIsDetectOpen] = useState(false);
	const [selectedImage, setSelectedImage] = useState<File | null>(null);
	const [detectedIngredients, setDetectedIngredients] = useState<AutoDetectedIngredientGetDTO[]>(
		[],
	);
	const [isDetecting, setIsDetecting] = useState(false);
	const [isAddingDetected, setIsAddingDetected] = useState(false);
	const [pantryCheckedIds, setPantryCheckedIds] = useState<number[]>([]);
	const [busyItemIds, setBusyItemIds] = useState<number[]>([]);

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

	const removePantryItemImmediate = async (itemId: number) => {
		// immediate remove without delay
		markItemBusy(itemId, true);
		setPantryCheckedIds((prev) => (prev.includes(itemId) ? prev : [...prev, itemId]));
		try {
			await apiService.delete<void>(`/groups/me/pantry/items/${itemId}`);
			notification.success({
				message: "Item Removed",
				description: "Item removed from pantry.",
				placement: "topRight",
			});
			// remove from local state
			setPantry((prev) => {
				if (!prev) return prev;
				const filteredItems = getItemsFromList(prev).filter((entry) => entry.id !== itemId);
				return { ...prev, items: filteredItems };
			});
		} catch (error) {
			// on failure, revert checked state and notify
			setPantryCheckedIds((prev) => prev.filter((id) => id !== itemId));
			if (error instanceof Error) {
				notification.error({
					message: "Failed to Remove Item",
					description: error.message,
					placement: "topRight",
				});
			} else {
				notification.error({
					message: "Failed to Remove Item",
					description: "Could not remove the item.",
					placement: "topRight",
				});
			}
		} finally {
			markItemBusy(itemId, false);
		}
	};

	const items = useMemo(() => getItemsFromList(pantry), [pantry]);

	const fetchPantry = useCallback(
		async (showLoader = true) => {
			if (showLoader) {
				setIsLoadingList(true);
			}
			try {
				const data = await apiService.get<PantryGetDTO>("/groups/me/pantry");
				setPantry(data);
			} catch (error) {
				// If status is 404, it likely means no group, which is an expected "Individual" state now.
				if (error && typeof error === "object" && "status" in error && error.status === 404) {
					console.debug("No pantry found - user likely not in a group.");
					setPantry(null);
				} else if (error instanceof Error) {
					notification.error({
						message: "Failed to Load Pantry",
						description: error.message,
						placement: "topRight",
					});
				} else {
					notification.error({
						message: "Failed to Load Pantry",
						description: "Could not load the pantry.",
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
		fetchPantry(true);
	}, [fetchPantry, hasGroup]);

	useEffect(() => {
		if (!hasGroup) {
			setIsLoadingIngredients(false);
			return;
		}
		fetchIngredients();
	}, [fetchIngredients, hasGroup]);

	const handleAddItem = async (values: AddItemFormValues) => {
		const cleanName = (values.ingredientName ?? "").trim();
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

			const resolvedIngredientName =
				cleanName.trim() !== "" ? cleanName : (ingredient.ingredientName ?? cleanName);
			const resolvedIngredientDescription =
				cleanDescription.trim() !== ""
					? cleanDescription
					: (ingredient.ingredientDescription ?? cleanDescription);

			const shoppingPayload: PantryItemPostDTO = {
				ingredientId: ingredient.id,
				ingredientName: resolvedIngredientName,
				ingredientDescription: resolvedIngredientDescription,
				quantity: values.quantity,
				category: cleanCategory ?? ingredient.category,
				unit: selectedUnit,
				standardUnit: selectedUnit,
			};

			await apiService.post<PantryItemGetDTO>("/groups/me/pantry/items", shoppingPayload);
			notification.success({
				message: "Item Added",
				description: "Item added to pantry.",
				placement: "topRight",
			});
			addForm.resetFields();
			await fetchIngredients();
			await fetchPantry(false);
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

	const loadItemById = async (itemId: number): Promise<PantryItemGetDTO | null> => {
		try {
			return await apiService.get<PantryItemGetDTO>(`/groups/me/pantry/items/${itemId}`);
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
			const payload: PantryItemPutDTO = {
				ingredientId: selectedItem.ingredientId,
				quantity: selectedItem.quantity,
				category: selectedItem.category,
			};
			await apiService.put<void>(`/groups/me/pantry/items/${selectedItem.id}`, payload);
			notification.success({
				message: "Item Updated",
				description: "Item updated.",
				placement: "topRight",
			});
			setIsEditOpen(false);
			await fetchPantry();
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

	// delete handler removed for pantry (delete button removed from UI)

	const resetDetectModal = () => {
		setIsDetectOpen(false);
		setSelectedImage(null);
		setDetectedIngredients([]);
	};

	const handleDetectIngredients = async () => {
		if (!selectedImage) {
			notification.error({
				message: "No Image",
				description: "Please choose an image first.",
				placement: "topRight",
			});
			return;
		}
		setIsDetecting(true);
		try {
			const formData = new FormData();
			formData.append("file", selectedImage);
			const detected = await apiService.postFormData<AutoDetectedIngredientGetDTO[]>(
				"/shoppings-list/auto-detect",
				formData,
			);
			setDetectedIngredients(detected ?? []);
			if (!detected?.length) {
				notification.info({
					message: "No Ingredients Detected",
					description: "No ingredients were detected in the image.",
					placement: "topRight",
				});
			}
		} catch (error) {
			if (error instanceof Error) {
				notification.error({
					message: "Detection Failed",
					description: error.message,
					placement: "topRight",
				});
			} else {
				notification.error({
					message: "Detection Failed",
					description: "Could not detect ingredients from the image.",
					placement: "topRight",
				});
			}
		} finally {
			setIsDetecting(false);
		}
	};

	const handleAddDetectedIngredients = async (values: DetectedIngredientFormValues) => {
		const ingredientsToAdd = values.ingredients ?? [];
		if (!ingredientsToAdd.length) {
			notification.error({
				message: "No Ingredients",
				description: "No detected ingredients to add.",
				placement: "topRight",
			});
			return;
		}
		if (ingredientsToAdd.some((ingredient) => !ingredient.id)) {
			notification.error({
				message: "Invalid Ingredients",
				description: "Please choose an ingredient from autocomplete for each detected item.",
				placement: "topRight",
			});
			return;
		}
		setIsAddingDetected(true);
		try {
			await Promise.all(
				ingredientsToAdd.map((ingredient) => {
					const ingredientId = ingredient.id;
					const selectedIngredient = ingredients.find((entry) => entry.id === ingredient.id);
					const category = ingredient.category ?? selectedIngredient?.category;
					const unit = ingredient.unit ?? selectedIngredient?.standardUnit;
					if (!ingredientId || !category || !unit) {
						throw new Error(
							"Detected ingredients need a category and unit before they can be added.",
						);
					}
					const payload: PantryItemPostDTO = {
						ingredientId,
						ingredientName: ingredient.ingredientName ?? selectedIngredient?.ingredientName ?? "",
						ingredientDescription:
							ingredient.ingredientDescription ?? selectedIngredient?.ingredientDescription ?? "",
						quantity: ingredient.quantity && ingredient.quantity > 0 ? ingredient.quantity : 1,
						category,
						unit,
						standardUnit: unit,
					};
					return apiService.post<PantryItemGetDTO>("/groups/me/pantry/items", payload);
				}),
			);
			notification.success({
				message: "Ingredients Added",
				description: `Added ${ingredientsToAdd.length} detected ingredient${ingredientsToAdd.length === 1 ? "" : "s"} to pantry.`,
				placement: "topRight",
			});
			resetDetectModal();
			await fetchIngredients();
			await fetchPantry(false);
		} catch (error) {
			if (error instanceof Error) {
				notification.error({
					message: "Failed to Add Ingredients",
					description: error.message,
					placement: "topRight",
				});
			} else {
				notification.error({
					message: "Failed to Add Ingredients",
					description: "Could not add detected ingredients to pantry.",
					placement: "topRight",
				});
			}
		} finally {
			setIsAddingDetected(false);
		}
	};

	const columns: TableColumnsType<PantryItemGetDTO> = [
		{
			title: "Used",
			key: "has",
			width: 80,
			render: (_, record) => (
				<Space>
					<Checkbox
						checked={pantryCheckedIds.includes(record.id)}
						disabled={!record.id || busyItemIds.includes(record.id)}
						onChange={async (e) => {
							const isChecked = e.target.checked;
							if (!record.id) return;
							if (isChecked) {
								// immediate remove when checked
								await removePantryItemImmediate(record.id);
							} else {
								// clear checked state if user manually unchecks before removal
								setPantryCheckedIds((prev) => prev.filter((id) => id !== record.id));
							}
						}}
					/>
				</Space>
			),
		},
		{
			title: "Ingredient",
			key: "ingredient",
			render: (_, record) => (
				<span className={pantryCheckedIds.includes(record.id) ? "line-through text-slate-400" : ""}>
					{record.ingredientName ?? `Ingredient #${record.ingredientId ?? "-"}`}
				</span>
			),
		},
		{
			title: "Quantity",
			dataIndex: "quantity",
			key: "quantity",
			render: (value: number | undefined, record) => (
				<span className={pantryCheckedIds.includes(record.id) ? "line-through text-slate-400" : ""}>
					{value ?? "-"} {unitOptions.find((option) => option.value === record.unit)?.label}
				</span>
			),
		},
	{
		title: "Category",
		key: "category",
		render: (_, record) => (
			<span className={pantryCheckedIds.includes(record.id) ? "line-through text-slate-400" : ""}>
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
						disabled={pantryCheckedIds.includes(record.id)}
					/>
					{/* delete button removed per request */}
				</Space>
			),
		},
	];

	const [addFormVisible, setAddFormVisible] = useState(false);

	const handleAddFormVisibleChange = () => {
		setAddFormVisible(!addFormVisible);
	};

	const [detectedIngredientsForm] = Form.useForm();

	useEffect(() => {
		if (detectedIngredients.length > 0) {
			detectedIngredientsForm.setFieldsValue({ ingredients: detectedIngredients });
		}
	}, [detectedIngredients, detectedIngredientsForm]);

	if (isGroupLoading) {
		return (
			<DashboardShell headerTitle="Pantry" selectedMenuKey="2">
				<div className="flex items-center justify-center py-20">
					<Spin size="large" />
				</div>
			</DashboardShell>
		);
	}

	if (!hasGroup) {
		return (
			<DashboardShell headerTitle="Pantry" selectedMenuKey="2">
				<GroupRequired featureName="Pantry" />
			</DashboardShell>
		);
	}

	return (
		<DashboardShell headerTitle="Pantry" selectedMenuKey="2">
			<div className="mb-8 flex items-center justify-between gap-4">
				<div className="flex items-center gap-3 bg-primary-100 border border-primary-200 rounded-lg px-3 py-2 shadow-sm">
					<span className="text-4xl leading-none">🏠</span>
					<Title level={2} className="!m-0 !text-slate-900">
						Pantry
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
					<Button className="pm-button" onClick={() => setIsDetectOpen(true)}>
						Detect from image
					</Button>
				</div>
			</div>

			{addFormVisible && (
				<Card className="mb-6 rounded-3xl border border-primary-300 bg-primary-100/60 shadow-sm">
					<Title level={4} className="!mt-0">
						Add item to pantry
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
								<IngredientAutocompleteInput
									ingredients={ingredients}
									isLoadingIngredients={isLoadingIngredients}
									placeholder="e.g. Tomatoes"
									onChange={(value: string) => addForm.setFieldValue("ingredientName", value)}
									onIngredientSelect={(ingredient) => {
										if (ingredient.ingredientDescription?.trim()) {
											addForm.setFieldValue(
												"ingredientDescription",
												ingredient.ingredientDescription.trim(),
											);
										}
										if (ingredient.standardUnit?.trim()) {
											addForm.setFieldValue("standardUnit", ingredient.standardUnit);
										}
										if (ingredient.category) {
											addForm.setFieldValue("category", ingredient.category);
										}
									}}
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

			<Card className="rounded-3xl border-l-4 border-primary-300 bg-primary-50/40 shadow-sm">
				<Title level={4} className="!mt-0 text-primary-800">
					Your pantry — Items you own
				</Title>
				{isLoadingList ? (
					<div className="flex items-center justify-center py-10">
						<Spin size="large" />
					</div>
				) : (
					<div className="p-4 bg-primary-50/30 rounded-lg">
						<Table<PantryItemGetDTO>
							className="pantry-table bg-transparent"
							columns={columns}
							dataSource={items}
							pagination={{ pageSize: 8 }}
							rowKey={(record) => record.id ?? `temp-${record.ingredientId}`}
							rowClassName={(record) =>
								pantryCheckedIds.includes(record.id) ? "line-through text-slate-400" : ""
							}
						/>
					</div>
				)}
			</Card>

			<Modal
				title="Detect ingredients from image"
				open={isDetectOpen}
				onCancel={resetDetectModal}
				footer={
					detectedIngredients.length > 0
						? [
								<Button key="cancel" onClick={resetDetectModal}>
									Cancel
								</Button>,
								<Button key="detect" onClick={handleDetectIngredients} loading={isDetecting}>
									Detect again
								</Button>,
								<Button
									key="add"
									type="primary"
									className="pm-button"
									onClick={() => detectedIngredientsForm.submit()}
									loading={isAddingDetected}
								>
									Add detected ingredients
								</Button>,
							]
						: [
								<Button key="cancel" onClick={resetDetectModal}>
									Cancel
								</Button>,
								<Button
									key="detect"
									type="primary"
									className="pm-button"
									onClick={handleDetectIngredients}
									loading={isDetecting}
									disabled={!selectedImage}
								>
									Detect ingredients
								</Button>,
							]
				}
			>
				<div className="space-y-4">
					<Input
						type="file"
						accept="image/*"
						onChange={(event) => {
							const file = event.target.files?.[0] ?? null;
							setSelectedImage(file);
							setDetectedIngredients([]);
						}}
					/>
					{detectedIngredients.length > 0 ? (
						<Form
							form={detectedIngredientsForm}
							layout="vertical"
							initialValues={{ ingredients: detectedIngredients }}
							onFinish={handleAddDetectedIngredients}
						>
							<Form.List name="ingredients">
								{(fields) => (
									<div className="space-y-3">
										{fields.map((field) => (
											<DetectedIngredientRow
												key={field.key}
												field={field}
												ingredients={ingredients}
												isLoadingIngredients={isLoadingIngredients}
											/>
										))}
									</div>
								)}
							</Form.List>
						</Form>
					) : null}
				</div>
			</Modal>

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
		</DashboardShell>
	);
};

export default PantryPage;
