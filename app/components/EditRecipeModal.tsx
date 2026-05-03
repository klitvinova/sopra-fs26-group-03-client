"use client";

import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, Button, Space, Typography, Card } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Recipe, RecipePutDTO } from "@/types/recipe";
import { Unit } from "@/types/unit";
import { IngredientCategory } from "@/types/ingredientCategory";

const { Text } = Typography;

interface EditRecipeModalProps {
  open: boolean;
  recipe: Recipe | null;
  onCancel: () => void;
  onSave: (id: number, data: RecipePutDTO) => Promise<void>;
  confirmLoading: boolean;
}

const unitOptions = [
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

const categoryOptions = [
  "VEGETABLE", "FRUIT", "MEAT", "FISH", "DAIRY", "EGGS", "PLANT_PROTEIN",
  "GRAIN", "BAKERY", "BAKING", "HERB", "SPICE", "OIL", "CONDIMENT", "OTHER"
].map(cat => ({ label: cat, value: cat as IngredientCategory }));

const EditRecipeModal: React.FC<EditRecipeModalProps> = ({
  open,
  recipe,
  onCancel,
  onSave,
  confirmLoading,
}) => {
  const [form] = Form.useForm<RecipePutDTO>();

  useEffect(() => {
    if (open && recipe) {
      form.setFieldsValue({
        name: recipe.name,
        description: recipe.description,
        ingredients: recipe.ingredients.map(ing => ({
          ingredientName: ing.ingredientName,
          ingredientDescription: ing.ingredientDescription || "",
          quantity: ing.quantity || 1,
          unit: ing.unit,
          category: ing.category || "OTHER",
        })),
      });
    } else {
      form.resetFields();
    }
  }, [open, recipe, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (recipe) {
        onSave(recipe.id, values);
      }
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  return (
    <Modal
      title="Edit Recipe"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      okText="Save Recipe"
      width={800}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          label="Recipe Name"
          name="name"
          rules={[{ required: true, message: "Please input the recipe name!" }]}
        >
          <Input placeholder="e.g. Spaghetti Bolognese" />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Please input the description!" }]}
        >
          <Input.TextArea rows={4} placeholder="How to cook it..." />
        </Form.Item>

        <div className="mb-2">
          <Text strong>Ingredients</Text>
        </div>

        <Form.List name="ingredients">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Card size="small" key={key} className="mb-4 border-slate-200">
                  <div className="flex justify-end">
                    <MinusCircleOutlined onClick={() => remove(name)} className="text-red-500 hover:text-red-700 cursor-pointer" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    <Form.Item
                      {...restField}
                      name={[name, 'ingredientName']}
                      label="Ingredient Name"
                      rules={[{ required: true, message: 'Required' }]}
                    >
                      <Input placeholder="e.g. Tomato" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'ingredientDescription']}
                      label="Description"
                    >
                      <Input placeholder="e.g. Fresh, diced" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      label="Quantity"
                      rules={[{ required: true, message: 'Required' }]}
                    >
                      <InputNumber min={0.1} step={0.1} className="w-full" />
                    </Form.Item>
                    <div className="grid grid-cols-2 gap-2">
                      <Form.Item
                        {...restField}
                        name={[name, 'unit']}
                        label="Unit"
                        rules={[{ required: true, message: 'Required' }]}
                      >
                        <Select options={unitOptions} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'category']}
                        label="Category"
                        rules={[{ required: true, message: 'Required' }]}
                      >
                        <Select options={categoryOptions} />
                      </Form.Item>
                    </div>
                  </div>
                </Card>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add({ ingredientName: '', quantity: 1, unit: 'PIECE', category: 'OTHER', ingredientDescription: '' })} block icon={<PlusOutlined />}>
                  Add Ingredient
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default EditRecipeModal;
