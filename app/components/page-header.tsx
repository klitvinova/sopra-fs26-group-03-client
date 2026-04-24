"use client";

import { Button } from "antd";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";

interface PageHeaderProps {
  title: string;
}

interface GroupMeResponse {
  id?: number;
  name?: string;
  inviteCode?: string;
  createdAt?: string;
  members?: unknown[];
}

export default function PageHeader({ title }: PageHeaderProps) {
  const apiService = useApi();
  const router = useRouter();
  const [yourGroup, setYourGroup] = useState<string>("Loading...");
  const [hasGroup, setHasGroup] = useState(false);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      globalThis.localStorage.removeItem("token");
    }
    router.push("/auth/login");
  };

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const group = await apiService.get<GroupMeResponse>("/groups/me");
        const groupName = group.name?.trim();
        if (groupName) {
          setYourGroup("Group: " + groupName);
          setHasGroup(true);
        } else {
          setYourGroup("Join Group");
          setHasGroup(false);
        }
      } catch (error) {
        console.error("Could not fetch current group", error);
        setYourGroup("Join Group");
        setHasGroup(false);
      }
    };

    fetchGroup();
  }, [apiService]);

  return (
    <header className="border-b border-primary-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        <div
          className="flex cursor-pointer items-center gap-3 transition-all hover:opacity-80"
          onClick={() => router.push("/dashboard")}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100 shadow-sm">
            <Image
              alt="PlateMate logo"
              height={22}
              src="/favicon.svg"
              width={22}
            />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-slate-900">
              PlateMate
            </div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
              {title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            className="pm-button !h-10 border-primary-200 bg-primary-50 px-5 font-semibold text-primary-700 hover:!border-primary-400"
            onClick={() => router.push(hasGroup ? "/groups/me" : "/groups")}
          >
            {yourGroup}
          </Button>
          <div className="h-6 w-px bg-slate-200 mx-1" />
          <Button
            className="pm-button !h-10 !border-slate-200 !bg-white px-5 font-medium text-slate-600 hover:!border-slate-400 hover:!text-slate-900"
            onClick={handleLogout}
          >
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}
