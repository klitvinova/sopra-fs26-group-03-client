"use client";

import React from "react";
import { Typography } from "antd";
import DashboardShell from "@/components/dashboard-shell";

const { Title } = Typography;

const Dashboard: React.FC = () => {
	const userName = "Name";

	return (
		<DashboardShell headerTitle="Dashboard" selectedMenuKey="1">
			<div className="mb-8">
				<Title level={2} className="!m-0 !text-slate-900">
					Good morning, {userName}
				</Title>
			</div>

			<div className="dashboard-grid">{/* Quick Actions, Upcoming, etc. */}</div>
		</DashboardShell>
	);
};

export default Dashboard;
