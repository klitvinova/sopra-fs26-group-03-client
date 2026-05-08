"use client";

import React, { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { Button, Card, Input } from "antd";
import { useRouter } from "next/navigation";
import { EditOutlined, SaveOutlined, CloseCircleOutlined } from "@ant-design/icons";
import PageHeader from "@/components/page-header";

const ProfilePage: React.FC = () => {
	const apiService = useApi();
	const [user, setUser] = useState<User | null>(null);
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [editedUser, setEditedUser] = useState<User | null>(null);

	React.useEffect(() => {
		const loadUser = async () => {
			try {
				setLoading(true);
				setError(null);
				const userData = await apiService.get<User>("/users/me");
				setUser(userData);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load user");
				setUser(null);
			} finally {
				setLoading(false);
			}
		};
		loadUser();
	}, [apiService]);

	const handleOpenEdit = () => {
		setEditedUser({ ...user } as User);
		setIsEditOpen(true);
	};

	const handleSave = async () => {
		try {
			await apiService.patch<User>("/users/me", editedUser);
			setUser(editedUser);
			setIsEditOpen(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to save user");
		}
	};

	const handleCancel = () => {
		setIsEditOpen(false);
		setEditedUser(null);
	};

	return (
		<div>
			<PageHeader title="Profile" />
			<div className="fixed inset-0 flex items-center justify-center min-h-screen">
				<div className="w-full max-w-md mx-auto border border-primary-300 rounded-lg p-6 shadow-2xl">
					<h2 className="text-lg font-bold mb-4">Your Profile</h2>
					{loading && <p>Loading...</p>}
					{error && <p>Error: {error}</p>}
					{user && (
						<div className="space-y-4">
							{isEditOpen ? (
								<>
									<div>
										<b>Username:</b>
										<Input
											value={editedUser?.username || ""}
											onChange={(e) => setEditedUser({ ...editedUser, username: e.target.value } as User)}
										/>
									</div>
									<div>
										<b>E-Mail:</b>
										<Input
											value={editedUser?.email || ""}
											onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value } as User)}
										/>
									</div>
								</>
							) : (
								<>
									<div><b>Username:</b> {user.username}</div>
									<div><b>E-Mail:</b> {user.email}</div>
								</>
							)}
							<div className={"flex items-center gap-8"}>
								{isEditOpen ? (
									<div className={"flex gap-2 w-full"}>
										<Button className={"flex-1 pm-button-primary"} onClick={handleSave}>
											<SaveOutlined />
											Save
										</Button>
										<Button className={"flex-1 pm-button-primary"} onClick={handleCancel}>
											<CloseCircleOutlined />
											Cancel
										</Button>
									</div>
								) : (
									<>
										<Button className={"flex-1 pm-button-primary"} onClick={handleOpenEdit}>
											<EditOutlined />
											Edit Profile
										</Button>
										<Button className={"flex-1 pm-button-primary"} onClick={() => router.push("/profile/ingredients")}>
											<EditOutlined />
											Edit Ingredients
										</Button>
									</>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default ProfilePage;
