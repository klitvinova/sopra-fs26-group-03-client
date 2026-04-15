"use client";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const router = useRouter();

	const goTo = (path: string) => {
		router.push(path);
	};

	return (
		<main>
			<header className="relative bg-white border-b border-gray-200">
				<div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
					<div className="flex items-center gap-3">
						<div className="flex h-8 w-8 items-center justify-center rounded-full">
							<Image alt="PlateMate logo" height={20} src="/favicon.svg" width={20} />
						</div>
						<div className="text-1xl md:text-2xl font-semibold">PlateMate</div>
					</div>
					<nav className="flex items-center gap-3 text-sm font-medium sm:text-base">
						<Button className="pm-button flex items-center gap-2" onClick={() => goTo("/")}>
							<ArrowLeftOutlined className="text-xs sm:text-sm" />
							Back
						</Button>
					</nav>
				</div>
			</header>
			{children}
		</main>
	);
}
