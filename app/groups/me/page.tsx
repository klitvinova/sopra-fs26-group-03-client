"use client";

import { useEffect, useState } from "react";
import { Alert, Card, Spin } from "antd";
import { useApi } from "@/hooks/useApi";
import PageHeader from "@/components/page-header";

interface GroupMember {
  id?: number;
  userId?: string;
  username?: string;
  name?: string;
}

interface GroupMeResponse {
  id?: number;
  name?: string;
  inviteCode?: string;
  createdAt?: string;
  members?: GroupMember[];
}

export default function GroupMePage() {
  const apiService = useApi();
  const [group, setGroup] = useState<GroupMeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [joinedMessage, setJoinedMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get("joined") === "1") {
      setJoinedMessage(
        `You successfully joined ${params.get("groupName") ?? "the group"}.`,
      );
    }
  }, []);

  useEffect(() => {
    const fetchGroup = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const data = await apiService.get<GroupMeResponse>("/groups/me");
        setGroup(data);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Could not load your group data.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroup();
  }, [apiService]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-orange-50 to-white">
      <PageHeader title="My Group" />
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <Card className="w-full max-w-2xl rounded-[2rem] border border-primary-500/20 bg-white/90 shadow-xl backdrop-blur">
          <h1 className="mb-1 text-2xl font-semibold text-primary-600">
            Group information
          </h1>
          <p className="mb-6 text-sm text-slate-500">
            Overview of the group you are currently part of.
          </p>

          {joinedMessage ? (
            <Alert
              className="mb-4"
              message={joinedMessage}
              showIcon
              type="success"
            />
          ) : null}

          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Spin size="large" />
            </div>
          ) : null}

          {!isLoading && errorMessage ? (
            <Alert message={errorMessage} showIcon type="error" />
          ) : null}

          {!isLoading && !errorMessage && group ? (
            <div className="space-y-3 text-sm text-slate-700">
              <div>
                <span className="font-semibold text-slate-900">Name:</span>{" "}
                {group.name ?? "-"}
              </div>
              <div>
                <span className="font-semibold text-slate-900">ID:</span>{" "}
                {group.id ?? "-"}
              </div>
              <div>
                <span className="font-semibold text-slate-900">
                  Invite code:
                </span>{" "}
                {group.inviteCode ?? "-"}
              </div>
              <div>
                <span className="font-semibold text-slate-900">
                  Created at:
                </span>{" "}
                {group.createdAt
                  ? new Date(group.createdAt).toLocaleString()
                  : "-"}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Members:</span>{" "}
                {group.members?.length ?? 0}
              </div>
              {group.members && group.members.length > 0 ? (
                <div className="mt-2 rounded-xl border border-primary-200 bg-primary-100 p-3">
                  <ul className="space-y-1">
                    {group.members.map((member, index) => (
                      <li key={`${member.id ?? member.userId ?? index}`}>
                        {member.username ??
                          member.name ??
                          member.userId ??
                          `Member ${index + 1}`}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
