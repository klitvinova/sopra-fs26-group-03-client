"use client";

import React, { useEffect, useState } from "react";
import {
  Typography,
  Calendar,
  Badge,
  Modal,
  Form,
  Select,
  Button,
  List,
  message,
  Spin,
  Divider,
  Tag,
  Popconfirm,
  Card,
} from "antd";
import {
  PlusOutlined,
  ShoppingCartOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import DashboardShell from "@/components/dashboard-shell";
import { useApi } from "@/hooks/useApi";
import {
  MealPlan,
  MealPlanPostDTO,
  MealType,
  MissingIngredient,
} from "@/types/meal-plan";
import { Recipe } from "@/types/recipe";
import dayjs, { Dayjs } from "dayjs";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const MealPlanPage: React.FC = () => {
  const api = useApi();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [missingIngredients, setMissingIngredients] = useState<
    MissingIngredient[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [syncLoading, setSyncLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchAllData = React.useCallback(async () => {
    setLoading(true);
    try {
      // Fetch a wide range to cover the current view
      const start = dayjs()
        .startOf("month")
        .subtract(7, "days")
        .format("YYYY-MM-DD");
      const end = dayjs().endOf("month").add(7, "days").format("YYYY-MM-DD");

      const [plans, recipeList, missing] = await Promise.all([
        api.get<MealPlan[]>(`/meal-plans?startDate=${start}&endDate=${end}`),
        api.get<Recipe[]>("/recipes"),
        api.get<MissingIngredient[]>(
          `/meal-plans/missing-ingredients?startDate=${start}&endDate=${end}`,
        ),
      ]);

      setMealPlans(plans);
      setRecipes(recipeList);
      setMissingIngredients(missing);
    } catch (error) {
      message.error("Failed to load meal planning data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleAddMeal = async (values: {
    mealType: MealType;
    recipeId: number;
  }) => {
    try {
      const dto: MealPlanPostDTO = {
        date: selectedDate.format("YYYY-MM-DD"),
        mealType: values.mealType,
        recipeId: values.recipeId,
      };
      await api.post("/meal-plans", dto);
      message.success("Meal added to plan");
      setModalVisible(false);
      form.resetFields();
      fetchAllData();
    } catch {
      message.error("Failed to add meal");
    }
  };

  const handleDeleteMeal = async (id: number) => {
    try {
      await api.delete(`/meal-plans/${id}`);
      message.success("Meal removed");
      fetchAllData();
    } catch {
      message.error("Failed to remove meal");
    }
  };

  const handleSync = async () => {
    setSyncLoading(true);
    try {
      const start = dayjs().startOf("month").format("YYYY-MM-DD");
      const end = dayjs().endOf("month").format("YYYY-MM-DD");
      await api.post(
        `/meal-plans/sync-shopping-list?startDate=${start}&endDate=${end}`,
        {},
      );
      message.success("Missing ingredients added to shopping list!");
    } catch {
      message.error("Failed to sync with shopping list");
    } finally {
      setSyncLoading(false);
    }
  };

  const dateCellRender = (value: Dayjs) => {
    const dateStr = value.format("YYYY-MM-DD");
    const listData = mealPlans.filter((p) => p.date === dateStr);
    return (
      <ul className="list-none p-0 m-0">
        {listData.map((item) => (
          <li
            key={item.id}
            className="mb-1 group flex items-center justify-between bg-slate-50/50 rounded p-1"
          >
            <Badge
              status={item.mealType === "DINNER" ? "processing" : "success"}
              text={
                <Text className="text-[10px] sm:text-xs truncate max-w-[80px]">
                  {item.recipe.name}
                </Text>
              }
            />
            <Popconfirm
              title="Delete meal?"
              onConfirm={(e) => {
                e?.stopPropagation();
                handleDeleteMeal(item.id);
              }}
            >
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined className="text-red-400" />}
                className="opacity-0 group-hover:opacity-100 p-0 h-auto leading-none"
                onClick={(e) => e.stopPropagation()}
              />
            </Popconfirm>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <DashboardShell headerTitle="Meal Plan" selectedMenuKey="5">
      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <Title level={2} className="!m-0 !text-slate-900">
                Meal Planning
              </Title>
              <Paragraph className="text-slate-500 m-0">
                Schedule your group meals and track missing ingredients.
              </Paragraph>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedDate(dayjs());
                setModalVisible(true);
              }}
              className="rounded-lg h-10 px-6 bg-slate-900 hover:!bg-slate-800 border-none shadow-md"
            >
              Schedule Meal
            </Button>
          </div>

          <Card
            className="shadow-sm rounded-2xl border-slate-200 overflow-hidden"
            bodyStyle={{ padding: 0 }}
          >
            {loading && !mealPlans.length ? (
              <div className="flex justify-center py-40">
                <Spin size="large" />
              </div>
            ) : (
              <Calendar
                fullscreen={true}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setModalVisible(true);
                }}
                cellRender={dateCellRender}
                className="p-4"
              />
            )}
          </Card>
        </div>

        <div className="w-full xl:w-96 flex flex-col gap-6">
          <Card
            title={
              <div className="flex items-center gap-2">
                <ShoppingCartOutlined className="text-orange-500" /> Outstanding
                Ingredients
              </div>
            }
            className="shadow-sm rounded-2xl border-slate-200 sticky top-10"
            headStyle={{
              borderBottom: "1px solid #f1f5f9",
              paddingTop: 16,
              paddingBottom: 16,
            }}
          >
            <Paragraph className="text-slate-400 text-sm mb-4">
              These items are missing from your pantry for the current
              month&apos;s plan.
            </Paragraph>

            <List
              loading={loading}
              dataSource={missingIngredients}
              renderItem={(item) => (
                <List.Item className="px-0 py-3 border-slate-50">
                  <div className="flex justify-between w-full items-center">
                    <Text className="text-slate-700 font-medium">
                      {item.ingredient.ingredientName}
                    </Text>
                    <Tag
                      color="orange"
                      className="m-0 rounded-full border-none bg-orange-50 text-orange-600 font-bold"
                    >
                      {item.missingQuantity}{" "}
                      {item.ingredient.unit.toLowerCase()}
                    </Tag>
                  </div>
                </List.Item>
              )}
              locale={{
                emptyText: (
                  <div className="py-8 text-center text-slate-400 italic">
                    Pantry is fully stocked for your plan!
                  </div>
                ),
              }}
            />

            {missingIngredients.length > 0 && (
              <div className="mt-6">
                <Divider className="my-0 border-slate-100 mb-6" />
                <Button
                  type="primary"
                  block
                  icon={<ShoppingCartOutlined />}
                  loading={syncLoading}
                  onClick={handleSync}
                  className="h-12 rounded-xl bg-orange-500 hover:!bg-orange-600 border-none font-bold text-lg shadow-lg shadow-orange-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Add to Shopping List
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Modal
        title={
          <div className="pb-2 border-b border-slate-100">
            <div className="text-slate-900 font-bold text-lg">
              Schedule Meal
            </div>
            <div className="text-slate-400 text-sm font-normal">
              {selectedDate.format("dddd, MMMM D, YYYY")}
            </div>
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText="Schedule Now"
        okButtonProps={{
          className:
            "bg-slate-900 border-none h-10 rounded-lg px-6 font-semibold",
        }}
        cancelButtonProps={{ className: "h-10 rounded-lg" }}
        width={400}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddMeal}
          initialValues={{ mealType: "DINNER" }}
          className="pt-6"
        >
          <Form.Item
            name="mealType"
            label={
              <Text strong className="text-slate-600">
                Meal Time
              </Text>
            }
            rules={[{ required: true }]}
          >
            <Select placeholder="Select meal type" className="h-10">
              <Option value="BREAKFAST">Breakfast</Option>
              <Option value="LUNCH">Lunch</Option>
              <Option value="DINNER">Dinner</Option>
              <Option value="SNACK">Snack</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="recipeId"
            label={
              <Text strong className="text-slate-600">
                Choose Recipe
              </Text>
            }
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Select a recipe"
              showSearch
              optionFilterProp="children"
              className="h-10"
            >
              {recipes.map((r) => (
                <Option key={r.id} value={r.id}>
                  {r.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </DashboardShell>
  );
};

export default MealPlanPage;
