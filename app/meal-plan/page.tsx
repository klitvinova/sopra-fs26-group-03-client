"use client";

import React from "react";
import { Typography } from "antd";
import DashboardShell from "@/components/dashboard-shell";

const { Title } = Typography;

const Dashboard: React.FC = () => {
	return (
		<DashboardShell headerTitle="Meal Plan" selectedMenuKey="5">
			<div className="mb-8">
				<Title level={2} className="!m-0 !text-slate-900">
					Meal Plan
				</Title>
			</div>

			<div className="dashboard-grid">{/* Meal planning content goes here. */}</div>
		</DashboardShell>
	);
};

export default Dashboard;
