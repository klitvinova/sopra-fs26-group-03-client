"use client";

import React from "react";
import {
	AppstoreOutlined,
	CalendarOutlined,
	FileTextOutlined,
	LeftOutlined,
	RightOutlined,
	ShoppingOutlined,
} from "@ant-design/icons";
import { Button, Calendar, Card, Select } from "antd";
import type { CalendarProps } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/page-header";

interface DashboardShellProps {
	headerTitle: string;
	selectedMenuKey: string;
	children: React.ReactNode;
}

interface MenuItem {
	key: string;
	label: string;
	icon: React.ReactNode;
}

const menuRoutes: Record<string, string> = {
	"1": "/dashboard",
	"2": "/pantry",
	"3": "/shopping-lists",
	"5": "/meal-plan",
};

	{ key: "1", icon: <AppstoreOutlined />, label: "Dashboard" },
	{ key: "2", icon: <ShoppingOutlined />, label: "Pantry" },
	{ key: "3", icon: <FileTextOutlined />, label: "Shopping List" },
	{ key: "5", icon: <CalendarOutlined />, label: "Meal Plan" },
];

export default function DashboardShell({
	headerTitle,
	selectedMenuKey,
	children,
}: DashboardShellProps) {
	const router = useRouter();

	const renderCalendarHeader: CalendarProps<Dayjs>["headerRender"] = ({ value, onChange }) => {
		const currentYear = value.year();
		const yearOptions = Array.from({ length: 11 }, (_, index) => {
			const year = currentYear - 5 + index;
			return { label: `${year}`, value: year };
		});

		const monthOptions = Array.from({ length: 12 }, (_, index) => ({
			label: dayjs().month(index).format("MMMM"),
			value: index,
		}));

		return (
			<div className="mb-3 rounded-xl border border-primary-200 bg-primary-100 p-2">
				<div className="flex items-center justify-between gap-2">
					<Button
						type="text"
						icon={<LeftOutlined />}
						onClick={() => onChange(value.clone().subtract(1, "month"))}
						className="!h-8 !w-8 !rounded-full !text-primary-600 hover:!bg-primary-200"
					/>
					<div className="flex flex-1 items-center gap-2">
						<Select
							className="flex-1"
							options={monthOptions}
							value={value.month()}
							onChange={(month) => onChange(value.clone().month(month))}
						/>
						<Select
							className="w-24"
							options={yearOptions}
							value={currentYear}
							onChange={(year) => onChange(value.clone().year(year))}
						/>
					</div>
					<Button
						type="text"
						icon={<RightOutlined />}
						onClick={() => onChange(value.clone().add(1, "month"))}
						className="!h-8 !w-8 !rounded-full !text-primary-600 hover:!bg-primary-200"
					/>
				</div>
			</div>
		);
	};

	const handleMenuClick = (key: string) => {
		const route = menuRoutes[key];
		if (route) {
			router.push(route);
		}
	};

	return (
		<div className="flex min-h-screen flex-col bg-gradient-to-b from-orange-50 to-white">
			<PageHeader title={headerTitle} />
			<div className="flex flex-1">
				<aside className="w-[300px] border-r border-primary-200 bg-orange-50 px-2.5 py-5">
					<div className="mb-5 text-center">
						<h2 className="text-2xl font-semibold text-primary-600">PlateMate</h2>
					</div>

					<nav className="space-y-3">
						{menuItems.map((item) => {
							const isActive = item.key === selectedMenuKey;
							return (
								<button
									key={item.key}
									type="button"
									onClick={() => handleMenuClick(item.key)}
									className={`flex h-11 w-full items-center gap-3 rounded-full border px-4 text-left transition-colors ${
										isActive
											? "border-primary-300 bg-primary-200 font-semibold text-secondary-700"
											: "border-primary-200 bg-primary-100 text-primary-600 hover:bg-primary-200"
									}`}
								>
									<span className="text-base">{item.icon}</span>
									<span>{item.label}</span>
								</button>
							);
						})}
					</nav>

					<div className="mt-10 px-2.5">
						<Card size="small" className="dashboard-mini-calendar">
							<Calendar fullscreen={false} headerRender={renderCalendarHeader} />
						</Card>
					</div>
				</aside>

				<main className="flex-1 p-10">{children}</main>
			</div>
		</div>
	);
}
