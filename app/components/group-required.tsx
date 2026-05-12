"use client";

import { Button, Card, Typography } from "antd";
import { TeamOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

const { Title, Paragraph } = Typography;

interface GroupRequiredProps {
  featureName: string;
}

export default function GroupRequired({ featureName }: GroupRequiredProps) {
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-2xl rounded-3xl border border-primary-200 bg-white/90 text-center shadow-xl">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-xl text-orange-500">
          <TeamOutlined />
        </div>
        <Title level={3} className="!mb-3">
          Join a group to use {featureName}
        </Title>
        <Paragraph className="text-slate-500">
          This feature is only available for users who are part of a group.
          Join or create a group to unlock shared planning and collaboration.
        </Paragraph>
        <Button className="pm-button mt-2" onClick={() => router.push("/groups")}>
          Manage groups
        </Button>
      </Card>
    </div>
  );
}

