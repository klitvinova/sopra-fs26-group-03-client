"use client";

import React from "react";
import { Typography } from "antd";
import DashboardShell from "@/components/dashboard-shell";

const { Title } = Typography;

const PantryPage: React.FC = () => {
	return (
		<DashboardShell headerTitle="Pantry" selectedMenuKey="2">
			<div style={{ marginBottom: "32px" }}>
				<Title level={2} style={{ margin: 0, color: "#0f172a" }}>
					Pantry
				</Title>
			</div>

			<div className="dashboard-grid">{/* Pantry content goes here. */}</div>
		</DashboardShell>
	);
};

export default PantryPage;
