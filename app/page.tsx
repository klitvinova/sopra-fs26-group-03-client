"use client";
import {
  LoginOutlined,
  UserAddOutlined,
  CheckCircleFilled
} from "@ant-design/icons";
import { Button, Typography } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";

const { Title, Paragraph } = Typography;

export default function Home() {
  const router = useRouter();

  const features = [
    "Manage your pantry stock in real-time",
    "Generate shared shopping lists automatically",
    "Coordinate meal plans with your group",
    "Reduce food waste and save money"
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <div className="max-w-5xl w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

        {/* Left Side: Text & Actions */}
        <div className="flex-1 text-center lg:text-left">
          {/* Logo */}
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-200">
              <Image alt="PlateMate logo" height={24} src="/favicon.svg" width={24} className="brightness-0 invert" />
            </div>
            <div className="text-3xl font-bold tracking-tight text-slate-800">
              PlateMate<span className="text-orange-500">.</span>
            </div>
          </div>

          <Title className="!text-4xl md:!text-5xl !font-bold !text-slate-900 !mb-6">
            Your kitchen, <br />
            <span className="text-orange-500">perfectly organized.</span>
          </Title>

          <Paragraph className="!text-lg !text-slate-500 !mb-8 max-w-lg mx-auto lg:mx-0">
            The ultimate companion for modern home cooks and shared households.
          </Paragraph>

          {/* Bullet Points */}
          <div className="space-y-4 mb-10 text-left inline-block lg:block">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-600 font-medium">
                <CheckCircleFilled className="text-orange-500 text-lg" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Button
              type="primary"
              size="large"
              className="!h-14 !px-10 !rounded-2xl !bg-orange-500 !text-lg !font-bold hover:!bg-orange-600 shadow-xl shadow-orange-100 flex items-center gap-2"
              onClick={() => router.push("/auth/login")}
            >
              <LoginOutlined /> Login
            </Button>
            <Button
              size="large"
              className="!h-14 !px-10 !rounded-2xl !text-lg !font-bold !border-orange-200 !text-orange-600 hover:!border-orange-400 hover:!bg-orange-50 flex items-center gap-2"
              onClick={() => router.push("/auth/register")}
            >
              <UserAddOutlined /> Register
            </Button>
          </div>
        </div>

        {/* Right Side: Vector Image */}
        <div className="flex-1 w-full max-w-lg lg:max-w-none animate-fade-in-up">
          <div className="relative aspect-square w-full rounded-[2.5rem] overflow-hidden bg-orange-50/50 p-8 border border-orange-100 shadow-inner">
            <Image
              src="/vector-hero.png"
              alt="Kitchen Illustration"
              fill
              className="object-contain p-4"
              priority
            />
          </div>
        </div>

      </div>

      <div className="mt-20 text-slate-400 text-sm">
        © 2026 PlateMate. All rights reserved.
      </div>
    </div>
  );
}
