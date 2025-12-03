import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, Settings, ChevronDown, History } from "lucide-react";
import { cn } from "../utils/cn";
import { RepoData } from "../types";
import { initializeRepoData } from "../services/github";
import { ChatContent } from "./ChatContent";
import { SettingsContent } from "./SettingsContent";
import { HistoryContent } from "./HistoryContent";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";

export function RepoReaderWidget() {
	const [isOpen, setIsOpen] = useState(false);
	const [activeTab, setActiveTab] = useState("chat");
	const [repoData, setRepoData] = useState<RepoData | null>(null);
	const [isInitializing, setIsInitializing] = useState(false);

	// 拖拽相关状态
	const [position, setPosition] = useState({
		x: window.innerWidth - 64,
		y: 16,
	}); // 初始位置：右上角
	const [isDragging, setIsDragging] = useState(false);
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
	const [hasMoved, setHasMoved] = useState(false); // 记录是否发生了拖拽移动
	const buttonRef = useRef<HTMLDivElement>(null);

	// 判断悬浮球是否在屏幕右半边
	const isOnRightSide = position.x > window.innerWidth / 2;

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

	// 拖拽事件处理
	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (!isDragging) return;

			const newX = e.clientX - dragOffset.x;
			const newY = e.clientY - dragOffset.y;

			// 限制在屏幕范围内
			const maxX = window.innerWidth - 48; // 48px是按钮宽度
			const maxY = window.innerHeight - 48; // 48px是按钮高度

			const newPosition = {
				x: Math.max(0, Math.min(newX, maxX)),
				y: Math.max(0, Math.min(newY, maxY)),
			};

			// 检查是否发生了实际移动
			if (newPosition.x !== position.x || newPosition.y !== position.y) {
				setHasMoved(true);
			}

			setPosition(newPosition);
		};

		const handleMouseUp = () => {
			setIsDragging(false);
			// 延迟重置 hasMoved 状态，确保 onClick 事件能正确判断
			setTimeout(() => {
				setHasMoved(false);
			}, 10);
		};

		if (isDragging) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
		}

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isDragging, dragOffset, position]);

	// 处理拖拽开始
	const handleMouseDown = (e: React.MouseEvent) => {
		if (buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect();
			setDragOffset({
				x: e.clientX - rect.left,
				y: e.clientY - rect.top,
			});
			setIsDragging(true);
			setHasMoved(false); // 重置移动状态
		}
	};

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
			<div
				ref={buttonRef}
				className="fixed z-50 cursor-move"
				style={{
					left: `${position.x}px`,
					top: `${position.y}px`,
					cursor: isDragging ? "grabbing" : "grab",
				}}
				onMouseDown={handleMouseDown}
			>
				<Button
					onClick={(e) => {
						// 防止拖拽时触发点击 - 只有在没有发生移动时才触发点击
						if (!hasMoved && !isDragging) {
							handleToggle(!isOpen);
						}
					}}
					variant="outline"
					size="icon"
					className={cn(
						"group relative shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out",
						"rounded-full w-12 h-12 shadow-xl",
						"transform hover:scale-105 active:scale-95",
						"bg-white hover:bg-gray-50",
						"cursor-move",
						isOpen && "shadow-xl scale-105",
						isInitializing && "animate-pulse",
						isDragging && "scale-110 shadow-2xl"
					)}
					aria-label="打开RepoReader助手"
				>
					<ChevronDown
						className={cn(
							"w-4 h-4 transition-transform duration-300",
							isOpen && "rotate-180"
						)}
					/>

					{/* 悬浮提示 - 根据位置调整方向 */}
					<div
						className={cn(
							"absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none",
							isOnRightSide ? "right-full mr-2" : "left-full ml-2"
						)}
					>
						<div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
							{isInitializing ? "正在分析项目..." : "RepoReader助手"}
						</div>
						<div
							className={cn(
								"absolute top-1/2 -translate-y-1/2 border-4 border-transparent",
								isOnRightSide
									? "left-full border-l-gray-900"
									: "right-full border-r-gray-900"
							)}
						></div>
					</div>
				</Button>
			</div>

			{/* 主对话框 - 根据悬浮球位置调整展开方向 */}
			<div
				className={cn(
					"fixed z-40 transition-all duration-300 ease-out",
					isOnRightSide ? "origin-top-right" : "origin-top-left",
					isOpen
						? "opacity-100 scale-100 translate-x-0 translate-y-0"
						: "opacity-0 scale-0 pointer-events-none",
					!isOpen &&
						(isOnRightSide
							? "translate-x-4 -translate-y-4"
							: "-translate-x-4 -translate-y-4")
				)}
				style={{
					left: isOnRightSide
						? `${position.x - 500 + 48}px`
						: `${position.x}px`, // 500px是对话框宽度，48px是按钮宽度
					top: `${position.y + 60}px`, // 60px是按钮高度加间距
				}}
			>
				<div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-[500px] h-[700px] flex flex-col">
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
									<TabsTrigger value="history">
										<History className="w-4 h-4" />
										历史
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
										activeTab === "history" ? "block" : "hidden"
									)}
								>
									<HistoryContent />
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
