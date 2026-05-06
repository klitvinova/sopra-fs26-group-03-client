"use client";

import React, { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { Button, Card } from "antd";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/page-header";

const ProfilePage: React.FC = () => {
	const apiService = useApi();
	const [user, setUser] = useState<User | null>(null);
	const router = useRouter();
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

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

return (
	<div>
	<PageHeader title="Profile" />,
<div className="fixed inset-0 flex items-center justify-center min-h-screen">
  <div className="w-full max-w-md mx-auto border border-primary-300 rounded-lg p-6 shadow-2xl">
    <h2 className="text-lg font-bold mb-4">Your Profile</h2>
    {loading && <p>Loading...</p>}
    {error && <p>Error: {error}</p>}
    {user && (
      <div className="space-y-4">
				<div><b>Username:</b> {user.username}</div>
        <div><b>E-Mail:</b> {user.email}</div>
				<Button className={"pm-button-primary"} onClick={() => router.push("/profile/ingredients")}>
					Edit Ingredients
				</Button>
      </div>
    )}
  </div>
</div>
	</div>);
}

export default ProfilePage;
