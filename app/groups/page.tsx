"use client";

import React, { useState } from "react";
import { Alert, Button, Card, Form, Input, Spin } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import PageHeader from "@/components/page-header";

interface CreateGroupFormValues {
	name: string;
}

interface JoinGroupFormValues {
	inviteCode: string;
}

interface GroupGetDTO {
	id?: number;
	name?: string;
	inviteCode?: string;
}

const GroupsPage: React.FC = () => {
	const apiService = useApi();
	const router = useRouter();
	const [form] = Form.useForm<CreateGroupFormValues>();
	const [joinForm] = Form.useForm<JoinGroupFormValues>();
	const [successMessage, setSuccessMessage] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [existingGroup, setExistingGroup] = useState<GroupGetDTO | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	React.useEffect(() => {
		const checkMembership = async () => {
			setIsLoading(true);
			try {
				const group = await apiService.get<GroupGetDTO>("/groups/me");
				setExistingGroup(group);
			} catch {
				setExistingGroup(null);
			} finally {
				setIsLoading(false);
			}
		};
		checkMembership();
	}, [apiService]);

	const handleCreateGroup = async (values: CreateGroupFormValues) => {
		setErrorMessage("");
		setSuccessMessage("");
		setIsSubmitting(true);

		try {
			const createdGroup = await apiService.post<GroupGetDTO>("/groups", {
				name: values.name,
			});

			setSuccessMessage(`Group \"${createdGroup.name ?? values.name}\" was created.`);
			form.resetFields();
			router.push("/groups/me");
		} catch (error) {
			if (error instanceof Error) {
				setErrorMessage(error.message);
			} else {
				setErrorMessage("An unknown error occurred while creating the group.");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleJoinGroup = async (values: JoinGroupFormValues) => {
		setErrorMessage("");
		setSuccessMessage("");
		setIsSubmitting(true);

		try {
			const joinedGroup = await apiService.post<GroupGetDTO>("/groups/join", {
				inviteCode: values.inviteCode,
			});

			joinForm.resetFields();
			const joinedName = joinedGroup.name?.trim() || "your group";
			router.push(`/groups/me?joined=1&groupName=${encodeURIComponent(joinedName)}`);
		} catch (error) {
			if (error instanceof Error) {
				setErrorMessage(error.message);
			} else {
				setErrorMessage("An unknown error occurred while joining the group.");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex min-h-screen flex-col bg-gradient-to-b from-orange-50 to-white">
				<PageHeader title="Groups" />
				<div className="flex flex-1 items-center justify-center">
					<Spin size="large" />
				</div>
			</div>
		);
	}

	if (existingGroup) {
		return (
			<div className="flex min-h-screen flex-col bg-gradient-to-b from-orange-50 to-white">
				<PageHeader title="Groups" />
				<div className="flex flex-1 items-center justify-center px-4 py-8">
					<Card className="w-full max-w-md rounded-[2rem] border border-primary-500/20 bg-white/90 p-8 text-center shadow-xl backdrop-blur">
						<div className="mb-6 flex justify-center">
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
								<InfoCircleOutlined className="text-3xl text-primary-600" />
							</div>
						</div>
						<h1 className="mb-2 text-2xl font-semibold text-primary-600">Already in a group</h1>
						<p className="mb-8 text-secondary-600">
							You are currently a member of <span className="font-bold text-slate-900">{existingGroup.name}</span>.
							Leave your current group if you want to join or create a new one.
						</p>
						<Button
							className="pm-button !h-12 w-full !text-lg !font-semibold"
							onClick={() => router.push("/groups/me")}
						>
							Manage Your Group
						</Button>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col bg-gradient-to-b from-orange-50 to-white">
			<PageHeader title="Groups" />
			<div className="flex flex-1 items-center justify-center px-4 py-8">
				<div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
					<Card className="w-full max-w-md rounded-[2rem] border border-primary-500/20 bg-white/90 shadow-xl backdrop-blur">
						<h1 className="mb-1 text-2xl font-semibold text-primary-600">Create a group</h1>
						<p className="mb-6 text-sm text-secondary-700">Enter a name and create your group.</p>

						{successMessage ? (
							<Alert className="mb-4" message={successMessage} showIcon type="success" />
						) : null}
						{errorMessage ? (
							<Alert className="mb-4" message={errorMessage} showIcon type="error" />
						) : null}

						<Form form={form} layout="vertical" name="create-group" onFinish={handleCreateGroup}>
							<Form.Item
								label="Group name"
								name="name"
								rules={[
									{ required: true, message: "Please enter a group name." },
									{ min: 2, message: "Group name must be at least 2 characters." },
								]}
							>
								<Input placeholder="My awesome group" />
							</Form.Item>

							<Form.Item className="mb-0">
								<Button
									className="login-button !h-11 !font-semibold"
									htmlType="submit"
									loading={isSubmitting}
								>
									Create group
								</Button>
							</Form.Item>
						</Form>
					</Card>

					<Card className="w-full max-w-md rounded-[2rem] border border-primary-500/20 bg-white/90 shadow-xl backdrop-blur">
						<h1 className="mb-1 text-2xl font-semibold text-primary-600">Join a group</h1>
						<p className="mb-6 text-sm text-secondary-700">
							Enter your invite code to join an existing group.
						</p>

						{successMessage ? (
							<Alert className="mb-4" message={successMessage} showIcon type="success" />
						) : null}
						{errorMessage ? (
							<Alert className="mb-4" message={errorMessage} showIcon type="error" />
						) : null}

						<Form form={joinForm} layout="vertical" name="join-group" onFinish={handleJoinGroup}>
							<Form.Item
								label="Invite code"
								name="inviteCode"
								rules={[
									{ required: true, message: "Please enter an invite code." },
									{ len: 8, message: "Invite code must be exactly 8 characters." },
								]}
							>
								<Input maxLength={8} placeholder="ABC1EFG2" />
							</Form.Item>

							<Form.Item className="mb-0">
								<Button
									className="login-button !h-11 !font-semibold"
									htmlType="submit"
									loading={isSubmitting}
								>
									Join group
								</Button>
							</Form.Item>
						</Form>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default GroupsPage;
