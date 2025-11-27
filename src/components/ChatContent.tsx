import React, { useState, useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react";
import Markdown from "react-markdown";
import { cn } from "../utils/cn";
import { Message, RepoData } from "../types";
import { generateRepoAnalysis } from "../services/github";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useSettingsStore } from "../stores/settingsStore";
import { sendChatRequest, parseStreamResponse } from "../services/chat";

interface ChatContentProps {
	repoData: RepoData | null;
	isInitializing: boolean;
}

export function ChatContent({ repoData, isInitializing }: ChatContentProps) {
	const [messages, setMessages] = useState<Message[]>([
		{
			id: "1",
			content: `你好！我是**RepoReader助手**，正在分析当前GitHub项目...

🔍 **正在获取项目信息**
- 📄 README文档
- 📁 项目结构  
- 🏷️ 技术栈识别

请稍候...`,
			role: "assistant",
			timestamp: new Date(),
		},
	]);
	const [inputValue, setInputValue] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	
	const { apiKey, selectedModel, userProfile, knowledgeBase } = useSettingsStore();

	// 当仓库数据加载完成时，发送初始分析消息
	useEffect(() => {
		if (repoData && !isInitializing) {
			const analysisMessage: Message = {
				id: "analysis-" + Date.now(),
				content: generateRepoAnalysis(repoData),
				role: "assistant",
				timestamp: new Date(),
			};

			setMessages([
				{
					id: "1",
					content: `你好！我是**RepoReader助手**，我已经分析了当前的GitHub项目。

✅ **分析完成！** 你可以向我询问关于这个项目的任何问题。`,
					role: "assistant",
					timestamp: new Date(),
				},
				analysisMessage,
			]);
		}
	}, [repoData, isInitializing]);

	const handleSend = async () => {
		if (!inputValue.trim() || isLoading) return;

		// 检查API配置
		if (!apiKey || !selectedModel) {
			alert("请先在设置中配置API Key和模型！");
			return;
		}

		const userMessage: Message = {
			id: Date.now().toString(),
			content: inputValue,
			role: "user",
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInputValue("");
		setIsLoading(true);

		// 创建助手消息用于流式输出
		const assistantMessageId = (Date.now() + 1).toString();
		const assistantMessage: Message = {
			id: assistantMessageId,
			content: "",
			role: "assistant",
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, assistantMessage]);
		setStreamingMessageId(assistantMessageId);

		try {
			// 发送请求到AI API
			const stream = await sendChatRequest(apiKey, {
				message: userMessage.content,
				repoData,
				userProfile,
				knowledgeBase,
			});

			// 处理流式响应
			let fullContent = "";
			for await (const chunk of parseStreamResponse(stream)) {
				fullContent += chunk;
				
				// 更新消息内容
				setMessages((prev) =>
					prev.map((msg) =>
						msg.id === assistantMessageId
							? { ...msg, content: fullContent }
							: msg
					)
				);
			}
		} catch (error) {
			console.error("发送消息失败:", error);
			
			// 显示错误消息
			const errorMessage = error instanceof Error ? error.message : "发送消息失败，请检查网络连接和API配置";
			setMessages((prev) =>
				prev.map((msg) =>
					msg.id === assistantMessageId
						? { ...msg, content: `❌ **错误**: ${errorMessage}` }
						: msg
				)
			);
		} finally {
			setIsLoading(false);
			setStreamingMessageId(null);
		}
	};

	// 自动滚动到底部
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	return (
		<div className="flex flex-col h-full">
			{/* 消息列表 */}
			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{messages.map((message) => (
					<div
						key={message.id}
						className={cn(
							"flex gap-3",
							message.role === "user" ? "justify-end" : "justify-start"
						)}
					>
						{message.role === "assistant" && (
							<div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
								<MessageCircle className="w-4 h-4 text-blue-600" />
							</div>
						)}

						<div
							className={cn(
								"max-w-[240px] rounded-lg px-3 py-2 text-sm",
								message.role === "user"
									? "bg-blue-600 text-white"
									: "bg-gray-100 text-gray-900",
								streamingMessageId === message.id && "animate-pulse"
							)}
						>
							{message.role === "assistant" ? (
								<div
									className={cn(
										"prose prose-sm max-w-none",
										"prose-headings:text-gray-900 prose-headings:font-semibold",
										"prose-p:text-gray-900 prose-p:leading-relaxed",
										"prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:rounded",
										"prose-pre:bg-gray-800 prose-pre:text-gray-100",
										"prose-blockquote:border-l-blue-500 prose-blockquote:text-gray-700",
										"prose-strong:text-gray-900 prose-strong:font-semibold",
										"prose-ul:text-gray-900 prose-ol:text-gray-900",
										"prose-li:text-gray-900"
									)}
								>
									<Markdown>{message.content}</Markdown>
								</div>
							) : (
								<p className="text-white">{message.content}</p>
							)}
						</div>

						{message.role === "user" && (
							<div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
								<div className="w-4 h-4 text-gray-600">👤</div>
							</div>
						)}
					</div>
				))}

				{isLoading && !streamingMessageId && (
					<div className="flex gap-3 justify-start">
						<div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
							<MessageCircle className="w-4 h-4 text-blue-600" />
						</div>
						<div className="bg-gray-100 rounded-lg px-3 py-2 text-sm">
							<div className="flex gap-1">
								<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
								<div
									className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
									style={{ animationDelay: "0.1s" }}
								></div>
								<div
									className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
									style={{ animationDelay: "0.2s" }}
								></div>
							</div>
						</div>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* 输入区域 */}
			<div className="p-4 border-t border-gray-200">
				<div className="flex gap-2">
					<Input
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyPress={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								handleSend();
							}
						}}
						placeholder="输入你的问题..."
						className="flex-1"
						disabled={isLoading}
					/>
					<Button
						variant={"outline"}
						onClick={handleSend}
						disabled={!inputValue.trim() || isLoading}
					>
						发送
					</Button>
				</div>
			</div>
		</div>
	);
}
