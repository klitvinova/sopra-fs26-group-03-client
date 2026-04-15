"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering
import { LoginOutlined } from "@ant-design/icons";
import { Button } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
	const router = useRouter();

	const goTo = (path: string) => {
		router.push(path);
	};

	return (
		<div>
			<header className="relative bg-white border-b border-gray-200">
				<div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
					<div className="flex items-center gap-3">
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
							<Image alt="PlateMate logo" height={20} src="/favicon.svg" width={20} />
						</div>
						<div className="text-1xl md:text-2xl font-semibold">PlateMate</div>
					</div>
					<nav className="flex items-center text-sm font-medium sm:text-base">
						<Button className="pm-button flex items-center gap-2" onClick={() => goTo("/auth/login")}>
							<LoginOutlined className="text-xs sm:text-sm" />
							Login
						</Button>
					</nav>
				</div>
			</header>
			<div className="flex min-h-screen items-center justify-center px-4 py-10">
				<div className="text-center">
					<h1 className="text-4xl font-bold text-primary-600">Welcome to PlateMate!</h1>
					<p className="mt-4 text-lg text-accent-500">Your ultimate recipe companion.</p>
				</div>
			</div>
		</div>
	);
}
