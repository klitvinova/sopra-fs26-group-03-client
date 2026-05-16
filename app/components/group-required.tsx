"use client";

import React, { useState } from "react";
import { Button, Card, Typography, Form, Input, App } from "antd";
import { TeamOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";

import { Group } from "@/types/group";

const { Title, Paragraph } = Typography;

interface GroupRequiredProps {
  featureName: string;
}

interface JoinGroupFormValues {
  inviteCode: string;
}

export default function GroupRequired({ featureName }: GroupRequiredProps) {
  const router = useRouter();
  const apiService = useApi();
  const { notification } = App.useApp();
  const [joinForm] = Form.useForm<JoinGroupFormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleJoinGroup = async (values: JoinGroupFormValues) => {
    setIsSubmitting(true);

    try {
      const joinedGroup = await apiService.post<Group>("/groups/join", {
        inviteCode: values.inviteCode,
      });

      joinForm.resetFields();
      const joinedName = joinedGroup.name?.trim() || "your group";
      notification.success({
        message: "Joined Group",
        description: `You successfully joined ${joinedName}.`,
        placement: "topRight",
      });

      // Redirect to the group management page which will show the new membership
      router.push(`/groups/me?action=joined&groupName=${encodeURIComponent(joinedName)}`);
    } catch (error) {
      notification.error({
        message: "Failed to Join Group",
        description: error instanceof Error ? error.message : "An unknown error occurred while joining the group.",
        placement: "topRight",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md rounded-[2.5rem] border border-primary-500/20 bg-white/95 p-8 text-center shadow-2xl backdrop-blur-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-2xl text-orange-500">
          <TeamOutlined />
        </div>
        <Title level={2} className="!mb-2 !text-primary-600 font-bold">
          Join a group
        </Title>
        <Paragraph className="mb-8 text-secondary-600 text-base">
          Enter your invite code to join an existing group and use {featureName}.
        </Paragraph>

        <Form
          form={joinForm}
          layout="vertical"
          name="join-group-required"
          onFinish={handleJoinGroup}
          className="text-left"
          requiredMark={true}
        >
          <Form.Item
            label={<span className="text-slate-700 font-semibold">Invite code</span>}
            name="inviteCode"
            rules={[
              { required: true, message: "Please enter an invite code." },
              {
                len: 8,
                message: "Invite code must be exactly 8 characters.",
              },
            ]}
          >
            <Input
              maxLength={8}
              placeholder="ABC1EFG2"
              className="!h-12 !rounded-xl !border-primary-200 focus:!border-primary-500 focus:!ring-primary-500 text-lg"
            />
          </Form.Item>

          <Form.Item className="mb-0 mt-8">
            <Button
              className="pm-button !h-14 w-full !text-lg !font-bold !rounded-2xl"
              htmlType="submit"
              loading={isSubmitting}
            >
              Join group
            </Button>
          </Form.Item>
        </Form>
        <div className="mt-8 border-t border-slate-100 pt-6">
          <p className="text-slate-500 text-sm mb-2">Don&apos;t have a code yet?</p>
          <Button
            type="link"
            className="text-primary-500 hover:text-primary-600 font-semibold p-0"
            onClick={() => router.push("/groups")}
          >
            Manage your groups or create one
          </Button>
        </div>
      </Card>
    </div>
  );
}

