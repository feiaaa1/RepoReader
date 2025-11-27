import React, { useState, useEffect } from "react";
import { MessageCircle, Settings, ChevronDown } from "lucide-react";
import { cn } from "../utils/cn";
import { RepoData } from "../types";
import { initializeRepoData } from "../services/github";
import { ChatContent } from "./ChatContent";
import { SettingsContent } from "./SettingsContent";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";

export function RepoReaderWidget() {
	const [isOpen, setIsOpen] = useState(false);
	const [activeTab, setActiveTab] = useState("chat");
	const [repoData, setRepoData] = useState<RepoData | null>(null);
	const [isInitializing, setIsInitializing] = useState(false);

	// 组件初始化 - 检测GitHub仓库页面并自动获取项目信息
	useEffect(() => {
		// 检查是否在GitHub仓库页面
		if (window.location.hostname === "github.com") {
			const pathParts = window.location.pathname
				.split("/")
				.filter((part) => part);
			// 确保是仓库页面格式 /owner/repo
			if (
				pathParts.length >= 2 &&
				!["settings", "notifications", "pulls", "issues"].includes(pathParts[0])
			) {
				handleInitializeRepo();
			}
		}
	}, []);

	const handleInitializeRepo = async () => {
		setIsInitializing(true);
		try {
			const data = await initializeRepoData();
			if (data) {
				setRepoData(data);
			}
		} catch (error) {
			console.error("初始化仓库数据失败:", error);
		} finally {
			setIsInitializing(false);
		}
	};

	const handleToggle = (open: boolean) => {
		setIsOpen(open);
		if (open) {
			setActiveTab("chat"); // 默认打开聊天页面
		}
	};

	const handleClose = () => {
		setIsOpen(false);
	};

	return (
		<>
			{/* 悬浮按钮 */}
			<div className="fixed top-4 right-4 z-50">
				<Button
					onClick={() => handleToggle(!isOpen)}
					variant="outline"
					size="icon"
					className={cn(
						"group relative shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out",
						"rounded-full w-12 h-6",
						"transform hover:scale-105 active:scale-95",
						"bg-white hover:bg-gray-50",
						isOpen && "shadow-xl scale-105",
						isInitializing && "animate-pulse"
					)}
					aria-label="打开RepoReader助手"
				>
					<ChevronDown
						className={cn(
							"w-4 h-4 transition-transform duration-300",
							isOpen && "rotate-180"
						)}
					/>

					{/* 悬浮提示 */}
					<div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
						<div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
							{isInitializing ? "正在分析项目..." : "RepoReader助手"}
						</div>
						<div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
					</div>
				</Button>
			</div>

			{/* 主对话框 - 添加缩放动画 */}
			<div
				className={cn(
					"fixed top-16 right-4 z-40 transition-all duration-300 ease-out",
					"origin-top-right", // 设置变换原点为右上角
					isOpen
						? "opacity-100 scale-100 translate-x-0 translate-y-0"
						: "opacity-0 scale-0 translate-x-4 -translate-y-4 pointer-events-none"
				)}
			>
				<div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-96 h-[700px] flex flex-col">
					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
						className="flex flex-col h-full"
					>
						{/* Tab导航 */}
						<div className="flex items-center justify-between p-4 border-b border-gray-200">
							<TabsList>
								<TabsTrigger value="chat">
									<MessageCircle className="w-4 h-4" />
									对话
								</TabsTrigger>
								<TabsTrigger value="settings">
									<Settings className="w-4 h-4" />
									设置
								</TabsTrigger>
							</TabsList>
							<Button
								onClick={handleClose}
								variant="ghost"
								size="icon-sm"
								className="ml-2 text-gray-400 hover:text-gray-600"
								aria-label="关闭"
							>
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</Button>
						</div>

						{/* Tab内容 */}
						<div className="flex-1 min-h-0 relative">
							<div
								className={cn(
									"absolute inset-0 flex flex-col",
									activeTab === "chat" ? "block" : "hidden"
								)}
							>
								<ChatContent
									repoData={repoData}
									isInitializing={isInitializing}
								/>
							</div>
							<div
								className={cn(
									"absolute inset-0 flex flex-col",
									activeTab === "settings" ? "block" : "hidden"
								)}
							>
								<SettingsContent />
							</div>
						</div>
					</Tabs>
				</div>
			</div>
		</>
	);
}
