"use client";

import React from "react";
import { Typography } from "antd";
import DashboardShell from "@/components/dashboard-shell";

const { Title } = Typography;

const Dashboard: React.FC = () => {
	return (
		<DashboardShell headerTitle="Recipes" selectedMenuKey="4">
			<div className="mb-8">
				<Title level={2} className="!m-0 !text-slate-900">
					Recipes
				</Title>
			</div>

			<div className="dashboard-grid">{/* Recipe content goes here. */}</div>
		</DashboardShell>
	);
};

export default Dashboard;
