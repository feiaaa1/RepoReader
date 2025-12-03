import React, { useState, useEffect } from "react";
import { Clock, Trash2, MessageCircle, Search } from "lucide-react";
import { cn } from "../utils/cn";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface HistoryItem {
	id: string;
	title: string;
	timestamp: Date;
	repoUrl: string;
	messageCount: number;
	lastMessage: string;
}

export function HistoryContent() {
	const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [filteredItems, setFilteredItems] = useState<HistoryItem[]>([]);

	// 模拟历史数据
	useEffect(() => {
		const mockHistory: HistoryItem[] = [
			{
				id: "1",
				title: "RepoReader项目分析",
				timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30分钟前
				repoUrl: "https://github.com/feiaaa1/RepoReader",
				messageCount: 15,
				lastMessage: "这个项目的技术栈分析很详细，谢谢！"
			},
			{
				id: "2", 
				title: "React组件库学习",
				timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2小时前
				repoUrl: "https://github.com/facebook/react",
				messageCount: 8,
				lastMessage: "能否详细解释一下React的虚拟DOM机制？"
			},
			{
				id: "3",
				title: "Vue.js源码分析",
				timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1天前
				repoUrl: "https://github.com/vuejs/vue",
				messageCount: 23,
				lastMessage: "响应式系统的实现原理确实很巧妙"
			}
		];
		setHistoryItems(mockHistory);
		setFilteredItems(mockHistory);
	}, []);

	// 搜索过滤
	useEffect(() => {
		if (!searchQuery.trim()) {
			setFilteredItems(historyItems);
		} else {
			const filtered = historyItems.filter(item =>
				item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.repoUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
			);
			setFilteredItems(filtered);
		}
	}, [searchQuery, historyItems]);

	const formatTime = (timestamp: Date) => {
		const now = new Date();
		const diff = now.getTime() - timestamp.getTime();
		const minutes = Math.floor(diff / (1000 * 60));
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));

		if (minutes < 60) {
			return `${minutes}分钟前`;
		} else if (hours < 24) {
			return `${hours}小时前`;
		} else {
			return `${days}天前`;
		}
	};

	const handleDeleteItem = (id: string) => {
		setHistoryItems(prev => prev.filter(item => item.id !== id));
	};

	const handleClearAll = () => {
		if (confirm("确定要清空所有历史记录吗？")) {
			setHistoryItems([]);
		}
	};

	return (
		<div className="flex flex-col h-full">
			{/* 头部搜索和操作 */}
			<div className="p-4 border-b border-gray-200">
				<div className="flex gap-2 mb-3">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
						<Input
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="搜索历史记录..."
							className="pl-10"
						/>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={handleClearAll}
						disabled={historyItems.length === 0}
						className="text-red-600 hover:text-red-700 hover:bg-red-50"
					>
						<Trash2 className="w-4 h-4 mr-1" />
						清空
					</Button>
				</div>
				<div className="text-sm text-gray-500">
					共 {filteredItems.length} 条记录
				</div>
			</div>

			{/* 历史记录列表 */}
			<div className="flex-1 overflow-y-auto">
				{filteredItems.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full text-gray-500">
						<MessageCircle className="w-12 h-12 mb-3 text-gray-300" />
						<p className="text-lg font-medium mb-1">
							{searchQuery ? "未找到匹配的记录" : "暂无历史记录"}
						</p>
						<p className="text-sm">
							{searchQuery ? "尝试使用其他关键词搜索" : "开始与项目对话后，历史记录将显示在这里"}
						</p>
					</div>
				) : (
					<div className="p-4 space-y-3">
						{filteredItems.map((item) => (
							<div
								key={item.id}
								className="group bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
							>
								<div className="flex items-start justify-between mb-2">
									<h3 className="font-medium text-gray-900 truncate flex-1 mr-2">
										{item.title}
									</h3>
									<Button
										variant="ghost"
										size="sm"
										onClick={(e) => {
											e.stopPropagation();
											handleDeleteItem(item.id);
										}}
										className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600 p-1 h-auto"
									>
										<Trash2 className="w-3 h-3" />
									</Button>
								</div>
								
								<div className="text-sm text-blue-600 mb-2 truncate">
									{item.repoUrl}
								</div>
								
								<div className="text-sm text-gray-600 mb-3 line-clamp-2">
									{item.lastMessage}
								</div>
								
								<div className="flex items-center justify-between text-xs text-gray-500">
									<div className="flex items-center gap-4">
										<span className="flex items-center gap-1">
											<MessageCircle className="w-3 h-3" />
											{item.messageCount} 条对话
										</span>
										<span className="flex items-center gap-1">
											<Clock className="w-3 h-3" />
											{formatTime(item.timestamp)}
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}