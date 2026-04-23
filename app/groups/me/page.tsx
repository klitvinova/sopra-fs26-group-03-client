"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Card, Divider, Input, Modal, Space, Spin, Tag, Tooltip, Typography, message } from "antd";
import {
	CopyOutlined,
	DeleteOutlined,
	EditOutlined,
	ExclamationCircleOutlined,
	InfoCircleOutlined,
	LogoutOutlined,
	ReloadOutlined,
	UserOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import PageHeader from "@/components/page-header";
import { Group, GroupRole } from "@/types/group";
import { User } from "@/types/user";

const { Text, Title } = Typography;

export default function GroupMePage() {
	const apiService = useApi();
	const router = useRouter();
	const [group, setGroup] = useState<Group | null>(null);
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [joinedMessage, setJoinedMessage] = useState("");

	const [isEditingName, setIsEditingName] = useState(false);
	const [newGroupName, setNewGroupName] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const isAdmin = group?.members?.find((m) => m.userID === currentUser?.id)?.role === GroupRole.ADMIN;

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}
		const params = new URLSearchParams(window.location.search);
		if (params.get("joined") === "1") {
			setJoinedMessage(`You successfully joined ${params.get("groupName") ?? "the group"}.`);
		}
	}, []);

	const fetchData = useCallback(async () => {
		setIsLoading(true);
		setErrorMessage("");
		try {
			const [groupData, userData] = await Promise.all([
				apiService.get<Group>("/groups/me"),
				apiService.get<User>("/users/me"),
			]);
			setGroup(groupData);
			setCurrentUser(userData);
			setNewGroupName(groupData.name || "");
		} catch (error) {
			if (error instanceof Error) {
				setErrorMessage(error.message);
			} else {
				setErrorMessage("Could not load your group data.");
			}
		} finally {
			setIsLoading(false);
		}
	}, [apiService]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleCopyInviteCode = () => {
		if (group?.inviteCode) {
			navigator.clipboard.writeText(group.inviteCode);
			message.success("Invite code copied to clipboard!");
		}
	};

	const handleRenameGroup = async () => {
		if (!newGroupName.trim() || newGroupName === group?.name) {
			setIsEditingName(false);
			return;
		}

		setIsSubmitting(true);
		try {
			const updated = await apiService.put<Group>("/groups/me", { name: newGroupName });
			setGroup(updated);
			setIsEditingName(false);
			message.success("Group renamed successfully!");
		} catch {
			message.error("Failed to rename group.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleRegenerateCode = () => {
		Modal.confirm({
			title: "Regenerate Invite Code?",
			icon: <ExclamationCircleOutlined />,
			content: "The old invite code will stop working immediately.",
			okText: "Regenerate",
			okType: "danger",
			cancelText: "Cancel",
			onOk: async () => {
				try {
					const updated = await apiService.post<Group>("/groups/me/invite-code", {});
					setGroup(updated);
					message.success("Invite code regenerated!");
				} catch {
					message.error("Failed to regenerate code.");
				}
			},
		});
	};

	const handleLeaveGroup = () => {
		Modal.confirm({
			title: "Leave group?",
			icon: <LogoutOutlined className="text-red-500" />,
			content: "You will lose access to the shared pantry and shopping list.",
			okText: "Leave",
			okType: "danger",
			cancelText: "Cancel",
			onOk: async () => {
				try {
					await apiService.delete("/groups/me/members/me");
					message.success("You left the group.");
					router.push("/groups");
				} catch (error) {
					message.error(error instanceof Error ? error.message : "Failed to leave group.");
				}
			},
		});
	};

	const handleDeleteGroup = () => {
		Modal.confirm({
			title: "Delete group?",
			icon: <DeleteOutlined className="text-red-500" />,
			content: "This action is permanent. All group data will be erased.",
			okText: "Delete",
			okType: "danger",
			cancelText: "Cancel",
			onOk: async () => {
				try {
					await apiService.delete("/groups/me");
					message.success("Group deleted.");
					router.push("/groups");
				} catch {
					message.error("Failed to delete group.");
				}
			},
		});
	};

	return (
		<div className="flex min-h-screen flex-col bg-gradient-to-b from-orange-50 to-white">
			<PageHeader title="Group Management" />
			<div className="flex flex-1 flex-col items-center px-4 py-8">
				<Card className="w-full max-w-2xl rounded-[2rem] border border-primary-500/20 bg-white/90 shadow-xl backdrop-blur">
					{joinedMessage ? <Alert className="mb-6" message={joinedMessage} showIcon type="success" /> : null}

					{isLoading ? (
						<div className="flex items-center justify-center py-20">
							<Spin size="large" tip="Loading group settings..." />
						</div>
					) : errorMessage ? (
						<div className="py-10 text-center">
							<Alert message={errorMessage} showIcon type="error" />
							<Button className="mt-4" onClick={() => router.push("/groups")}>
								Return to Groups
							</Button>
						</div>
					) : !group ? (
						<div className="py-10 text-center">
							<Title level={4}>No group found</Title>
							<Button className="mt-4 pm-button" onClick={() => router.push("/groups")}>
								Join or Create a Group
							</Button>
						</div>
					) : (
						<div className="space-y-6">
							<div className="flex items-center justify-between">
								<div className="flex-1">
									{isEditingName ? (
										<Space.Compact className="w-full max-w-md">
											<Input
												value={newGroupName}
												onChange={(e) => setNewGroupName(e.target.value)}
												onPressEnter={handleRenameGroup}
												autoFocus
											/>
											<Button loading={isSubmitting} onClick={handleRenameGroup} type="primary">
												Save
											</Button>
											<Button onClick={() => setIsEditingName(false)}>Cancel</Button>
										</Space.Compact>
									) : (
										<div className="flex items-center gap-3">
											<Title className="!mb-0 !text-primary-600" level={2}>
												{group.name}
											</Title>
											{isAdmin && (
												<Tooltip title="Rename Group">
													<Button
														icon={<EditOutlined />}
														onClick={() => setIsEditingName(true)}
														type="text"
													/>
												</Tooltip>
											)}
										</div>
									)}
									<Text className="text-secondary-600" type="secondary">
										Created on {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : "-"}
									</Text>
								</div>
								{isAdmin ? (
									<Tag className="rounded-full px-3 py-1 font-semibold" color="gold">
										Admin Access
									</Tag>
								) : (
									<Tag className="rounded-full px-3 py-1 font-semibold" color="blue">
										Member
									</Tag>
								)}
							</div>

							<Divider className="my-2" />

							<div className="rounded-2xl bg-slate-50 p-6">
								<div className="mb-4 flex items-center justify-between">
									<div>
										<Text className="block font-semibold text-slate-900">Invite Code</Text>
										<Text className="text-xs text-slate-500">Share this code with your teammates.</Text>
									</div>
									<div className="flex items-center gap-2">
										<div className="flex h-10 items-center justify-center rounded-lg border border-primary-200 bg-white px-4 font-mono text-lg font-bold tracking-widest text-primary-600">
											{group.inviteCode}
										</div>
										<Tooltip title="Copy Code">
											<Button icon={<CopyOutlined />} onClick={handleCopyInviteCode} />
										</Tooltip>
										{isAdmin && (
											<Tooltip title="Regenerate Code">
												<Button icon={<ReloadOutlined />} onClick={handleRegenerateCode} />
											</Tooltip>
										)}
									</div>
								</div>
							</div>

							<div>
								<div className="mb-3 flex items-center gap-2">
									<UserOutlined className="text-primary-600" />
									<Text className="text-lg font-semibold">Members ({group.members?.length ?? 0})</Text>
								</div>
								<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
									{group.members?.map((member) => (
										<div
											key={member.userID}
											className={`flex items-center justify-between rounded-xl border p-3 ${member.userID === currentUser?.id
												? "border-primary-300 bg-primary-50"
												: "border-slate-100 bg-white"
												}`}
										>
											<div className="flex items-center gap-2">
												<div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200">
													<UserOutlined className="text-slate-500" />
												</div>
												<div>
													<Text className="block font-medium">
														{member.username} {member.userID === currentUser?.id && "(You)"}
													</Text>
													{member.joinedAt && (
														<Text className="text-[10px]" type="secondary">
															Joined {new Date(member.joinedAt).toLocaleDateString()}
														</Text>
													)}
												</div>
											</div>
											{member.role === GroupRole.ADMIN && (
												<Tag className="m-0 text-[10px]" color="orange">
													Admin
												</Tag>
											)}
										</div>
									))}
								</div>
							</div>

							<Divider />

							<div className="flex flex-wrap items-center justify-between gap-4">
								<div className="flex items-center gap-2">
									<InfoCircleOutlined className="text-slate-400" />
									<Text className="text-xs text-slate-500">
										You are viewing the management dashboard for {group.name}.
									</Text>
								</div>
								<div className="flex gap-2">
									<Button
										className="border-red-200 text-red-500 hover:border-red-500 hover:bg-red-50"
										icon={<LogoutOutlined />}
										onClick={handleLeaveGroup}
									>
										Leave Group
									</Button>
									{isAdmin && (
										<Button danger icon={<DeleteOutlined />} onClick={handleDeleteGroup} type="primary">
											Delete Group
										</Button>
									)}
								</div>
							</div>
						</div>
					)}
				</Card>
			</div>
		</div>
	);
}

