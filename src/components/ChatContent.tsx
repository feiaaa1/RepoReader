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
	const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
		null
	);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const { apiKey, selectedModel, userProfile, knowledgeBase } =
		useSettingsStore();

	// 当仓库数据加载完成时，自动发送项目分析请求
	useEffect(() => {
		console.log("repoData changed:", repoData);
		if (repoData && !isInitializing && apiKey && selectedModel) {
			// 生成项目分析报告
			const analysisReport = generateRepoAnalysis(repoData);

			// 构建前置知识讲解的提示词
			const knowledgePrompt = `# Role & Goal
你是一名资深的软件架构师和技术导师，擅长根据学员的技术背景，为其量身定制学习路径。你的任务是基于一份项目分析报告和学员的个人情况，精准识别出学员在理解该项目时可能遇到的所有知识盲区和概念障碍，并提供一个清晰、结构化的"前置知识讲解"清单。

---

# Context

1. **项目分析报告**: 我将提供一个关于特定代码仓库的结构化分析报告，包含了项目的基本信息、技术栈、项目工具、文件类型分布以及 README 概览。

\`\`\`text
${analysisReport}
\`\`\`

2. **学员背景 (信息 A)**: 这是学员对自己技术背景的描述。

\`\`\`text
${knowledgeBase || "未提供具体技术背景信息"}
\`\`\`

---

# Task & Workflow

根据上述的 **项目分析报告** 和 **学员背景 (信息 A)**，请遵循以下工作流执行任务：

1. **差异分析 (Analysis)**:
   - 仔细阅读项目分析报告中的每一项信息（技术栈、项目工具、文件类型、README 中的术语等）。
   - 对比这些技术点与学员背景 (信息 A) 的交集和差异。
   - 你的核心目标是**预测**学员在后续深入学习此项目时，可能会因为不理解哪些术语、工具、概念或技术而感到困惑。

2. **内容生成 (Generation)**:
   - 你的输出包含两个主要部分：**前置知识讲解** 和 **项目宏观解读**。
   - **第一部分：💡 前置知识讲解**
       - 基于差异分析的结果，生成一份名为"💡 前置知识讲解"的报告。
       - 这份报告需要根据学员的水平进行个性化调整：
           - **如果学员是小白或来自完全不相关的领域**:
               - 详细解释所有出现的核心术语和基础概念。例如，如果项目是前端项目，而学员是后端，你需要解释什么是 \`Node.js\`, \`npm\`, \`.yml\` 文件是做什么的，什么是 Markdown，什么是 React 组件等。列表应尽可能全面。
               - 解释的语言要通俗易懂，多用类比，避免使用更深奥的黑话。
           - **如果学员是相关领域的开发者 (例如，都是前端开发者)**:
               - 跳过对方很可能已经熟知的基础概念（例如，不需要向一个资深前端解释什么是 \`.js\` 或 \`Node.js\`）。
               - 将重点放在项目中**不常见、有特色或更深层次**的技术点上。例如，可以解释 \`react-markdown\` 这个库本身的核心价值、\`commonmark\` 规范是什么、为什么安全性（XSS攻击）在这个场景下很重要，或者解释 \`.npmrc\` 这种不常用的配置文件。
               - 解释可以更专业，但仍需保持清晰。
   - **第二部分：🚀 项目宏观解读**
       - 在知识讲解之后，新增一个名为"🚀 项目宏观解读"的章节。
       - 这一部分的目标是让用户在前置知识完备后，能快速理解项目的核心价值和技术内涵。
       - 此部分应包含以下三个小节：
           - **项目的实际意义 (What it solves?)**:
               - 简洁地说明这个项目解决了什么具体问题？它在现实世界的应用场景是什么？例如，\`react-markdown\` 解决了在 React 应用中安全、高效地展示 Markdown 内容的需求，常用于博客、文档、评论区等场景。
           - **大致实现原理 (How it works?)**:
               - 用非常高阶和抽象的语言描述它的工作流程，不需要深入代码细节。例如，"它接收 Markdown 格式的文本，通过一个解析器（Parser）将其转换成一种抽象语法树（AST），然后再将这个树结构渲染成对应的 React 组件"。
           - **技术亮点与挑战 (Highlights & Challenges)**:
               - 从分析报告和 README 中提炼项目的亮点和可能存在的难点。例如，亮点可以是"默认安全，有效防止 XSS 攻击"、"插件化架构，扩展性强"；挑战可以是"处理复杂的 Markdown 嵌套和自定义组件的性能问题"、"确保对 CommonMark 规范的完全兼容"等。

3. **输出格式 (Formatting)**:
   - 使用清晰的 Markdown 格式。
   - **第一部分**的顶级标题为 \`💡 前置知识讲解\`。
   - **第二部分**的顶级标题为 \`🚀 项目宏观解读\`。
   - 每个知识点使用二级标题（\`##\`）或三级标题（\`###\`）进行组织。
   - 对每个知识点的解释应该简洁明了，控制在 2-4 句话内，目的是"扫盲"，而不是"教学"。
   - 如果一个术语有多种含义，请结合项目背景进行解释。
   - 项目宏观解读部分的三个小节应使用三级标题（\`###\`）进行组织。

---

请现在开始分析我提供的信息，并生成"💡 前置知识讲解"报告。`;

			// 自动发送前置知识讲解请求
			handleAutoAnalysis(knowledgePrompt);
		}
	}, [repoData, isInitializing, apiKey, selectedModel, knowledgeBase]);

	// 自动分析函数
	const handleAutoAnalysis = async (prompt: string) => {
		console.log("prompt", prompt);

		const analysisMessageId = "analysis-" + Date.now();
		const analysisMessage: Message = {
			id: analysisMessageId,
			content: "",
			role: "assistant",
			timestamp: new Date(),
		};

		setMessages([
			{
				id: "1",
				content: `你好！我是**RepoReader助手**，我已经分析了当前的GitHub项目。

🔍 **正在为你生成个性化的前置知识讲解...**`,
				role: "assistant",
				timestamp: new Date(),
			},
			analysisMessage,
		]);

		setStreamingMessageId(analysisMessageId);
		setIsLoading(true);

		try {
			// 发送请求到AI API
			const stream = await sendChatRequest(apiKey, {
				message: prompt,
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
						msg.id === analysisMessageId
							? { ...msg, content: fullContent }
							: msg
					)
				);
			}
		} catch (error) {
			console.error("生成前置知识讲解失败:", error);

			// 显示错误消息
			const errorMessage =
				error instanceof Error
					? error.message
					: "生成前置知识讲解失败，请检查网络连接和API配置";
			setMessages((prev) =>
				prev.map((msg) =>
					msg.id === analysisMessageId
						? {
								...msg,
								content: `❌ **错误**: ${errorMessage}\n\n你可以手动询问关于这个项目的任何问题。`,
						  }
						: msg
				)
			);
		} finally {
			setIsLoading(false);
			setStreamingMessageId(null);
		}
	};

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
			const errorMessage =
				error instanceof Error
					? error.message
					: "发送消息失败，请检查网络连接和API配置";
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
			<div className="flex-1 overflow-y-auto p-3 space-y-4">
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
								"max-w-[280px] rounded-lg px-3 py-2 text-sm",
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
