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
	List,
	Popconfirm,
	Space,
	Spin,
	Table,
	type TableColumnsType,
	Typography,
	Select,
} from "antd";
import {
	CloseCircleOutlined,
	DeleteOutlined,
	EditOutlined,
	PlusCircleOutlined,
} from "@ant-design/icons";
import DashboardShell from "@/components/dashboard-shell";
import { useApi } from "@/hooks/useApi";
import type {
  PantryItemGetDTO,
  PantryItemPostDTO,
  PantryItemPutDTO,
  PantryGetDTO,
} from "@/types/pantry";
import type { Unit } from "@/types/unit";
import { AddItemFormValues, IngredientGetDTO, IngredientPostDTO } from "@/types/ingredientCategory";

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
	const [isDetectOpen, setIsDetectOpen] = useState(false);
	const [selectedImage, setSelectedImage] = useState<File | null>(null);
	const [detectedIngredients, setDetectedIngredients] = useState<AutoDetectedIngredientGetDTO[]>(
		[],
	);
	const [isDetecting, setIsDetecting] = useState(false);
	const [isAddingDetected, setIsAddingDetected] = useState(false);

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
        (item) =>
          (item.ingredientName?.trim().toLowerCase() ?? "") === normalizedName,
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

      await apiService.post<PantryItemGetDTO>(
        "/groups/me/pantry/items",
        shoppingPayload,
      );
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

  const loadItemById = async (
    itemId: number,
  ): Promise<PantryItemGetDTO | null> => {
    setErrorMessage("");
    try {
      return await apiService.get<PantryItemGetDTO>(
        `/groups/me/pantry/items/${itemId}`,
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

  const handleUpdateItem = async (values: PantryItemPutDTO) => {
    if (!selectedItem?.id) {
      setErrorMessage("No item selected for update.");
      return;
    }
    setErrorMessage("");
    setSuccessMessage("");
    setIsUpdating(true);
    try {
      await apiService.put<void>(
        `/groups/me/pantry/items/${selectedItem.id}`,
        values,
      );
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
				ingredientCategory: values.ingredientCategory,
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
				setErrorMessage("Could not delete the item.");
			}
		} finally {
			markItemBusy(itemId, false);
		}
	};

	const resetDetectModal = () => {
		setIsDetectOpen(false);
		setSelectedImage(null);
		setDetectedIngredients([]);
	};

	const handleDetectIngredients = async () => {
		if (!selectedImage) {
			setErrorMessage("Please choose an image first.");
			return;
		}
		setErrorMessage("");
		setSuccessMessage("");
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
				setSuccessMessage("No ingredients were detected in the image.");
			}
		} catch (error) {
			if (error instanceof Error) {
				setErrorMessage(error.message);
			} else {
				setErrorMessage("Could not detect ingredients from the image.");
			}
		} finally {
			setIsDetecting(false);
		}
	};

	const handleAddDetectedIngredients = async () => {
		const ingredientsWithId = detectedIngredients.filter((ingredient) => ingredient.id);
		if (!ingredientsWithId.length) {
			setErrorMessage("Detected ingredients are missing ids and cannot be added.");
			return;
		}
		setErrorMessage("");
		setSuccessMessage("");
		setIsAddingDetected(true);
		try {
			await Promise.all(
				ingredientsWithId.map((ingredient) =>
					apiService.post<PantryItemGetDTO>("/groups/me/pantry/items", {
						ingredientId: ingredient.id,
						quantity: ingredient.quantity && ingredient.quantity > 0 ? ingredient.quantity : 1,
					}),
				),
			);
			setSuccessMessage(
				`Added ${ingredientsWithId.length} detected ingredient${ingredientsWithId.length === 1 ? "" : "s"} to pantry.`,
			);
			resetDetectModal();
			await fetchIngredients();
			await fetchPantry(false);
		} catch (error) {
			if (error instanceof Error) {
				setErrorMessage(error.message);
			} else {
				setErrorMessage("Could not add detected ingredients to pantry.");
			}
		} finally {
			setIsAddingDetected(false);
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
			title: "Category",
			key: "category",
			render: (_, record) => (
				<span>{record.ingredientCategory ?? `${record.ingredientCategory ?? "-"}`}</span>
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

	const [search, setSearch] = useState("");

	const filteredOptions = ingredientOptions.filter((opt) =>
		opt.label.toLowerCase().includes(search.toLowerCase()),
	);

	const [addFormVisible, setAddFormVisible] = useState(false);

	const handleAddFormVisibleChange = () => {
		setAddFormVisible(!addFormVisible);
	};

	return (
		<DashboardShell headerTitle="Pantry" selectedMenuKey="2">
			<div className="mb-8 flex items-center justify-between gap-4">
				<Title level={2} className="!m-0 !text-slate-900">
					Pantry
				</Title>
				<div className={"flex gap-2"}>
					<Button className="pm-button" onClick={handleAddFormVisibleChange}>
						{addFormVisible ? (
							<div className={"flex items-center gap-2"}>
								<PlusCircleOutlined />
								Close Form
							</div>
						) : (
							<div className={"flex items-center gap-2"}>
								<CloseCircleOutlined />
								Add Item
							</div>
						)}
					</Button>
					<Button className="pm-button" onClick={() => fetchPantry(true)}>
						Refresh
					</Button>
				</div>
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

			{addFormVisible && (
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
								options={filteredOptions}
								onSelect={(value: string) => handleIngredientSelect(value)}
								onChange={(value: string) => setSearch(value)}
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
						<Form.Item label="Category" name="ingredientCategory">
							<Input placeholder="e.g. Vegetables" />
						</Form.Item>
						<Form.Item>
							<Button className="pm-button" htmlType="submit" loading={isAdding}>
								Save entry
							</Button>
						</Form.Item>
					</Form>
				</Card>
			)}

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
									onClick={handleAddDetectedIngredients}
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
						<List
							size="small"
							header={<span>Detected ingredients</span>}
							dataSource={detectedIngredients}
							renderItem={(ingredient) => (
								<List.Item>
									<div className="w-full">
										<div className="font-medium">
											{ingredient.ingredientName ?? `Ingredient #${ingredient.id ?? "-"}`}
										</div>
										<div className="text-sm text-slate-600">
											Quantity: {ingredient.quantity ?? 1} | Unit: {ingredient.unit ?? "-"}
										</div>
										{ingredient.ingredientDescription ? (
											<div className="text-sm text-slate-500">
												{ingredient.ingredientDescription}
											</div>
										) : null}
									</div>
								</List.Item>
							)}
						/>
					) : null}
				</div>
			</Modal>

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
