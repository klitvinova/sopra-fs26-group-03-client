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
    <header className="border-b border-orange-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6">
        <div
          className="flex cursor-pointer items-center gap-3 transition-all hover:opacity-80"
          onClick={() => router.push("/dashboard")}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-100">
            <Image
              alt="PlateMate logo"
              height={22}
              src="/favicon.svg"
              width={22}
              className="brightness-0 invert"
            />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              PlateMate<span className="text-orange-500">.</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500/60 leading-none mt-1">
              {title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            className="pm-button !h-11 px-6 !rounded-xl"
            onClick={() => router.push(hasGroup ? "/groups/me" : "/groups")}
          >
            <span className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              {yourGroup}
            </span>
          </Button>
          <div className="h-8 w-px bg-slate-100 mx-2" />
          <Button
            type="text"
            className="!h-11 px-4 font-bold text-slate-400 hover:text-red-500 transition-colors"
            onClick={handleLogout}
          >
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}
