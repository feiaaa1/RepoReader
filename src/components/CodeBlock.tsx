// CodeBlock.tsx - 专注于块级代码渲染
import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import { cn } from "../utils/cn";
// 导入所有可能的 HTML 属性，以便 CodeBlock 可以接受它们
import { HTMLAttributes } from "react";

// 接口调整：移除 inline，并继承 HTMLAttributes，接受 react-markdown 传递的 className
interface CodeBlockProps extends HTMLAttributes<HTMLDivElement> {
	// children 是 SyntaxHighlighter 的内容，通常是字符串
	children: string;
	// className 用于提取 language
	className?: string;
	// node 是 AST 节点，必须被接收但不能传给 DOM
	node?: any;
}

// 重点：CodeBlock 现在只处理块级代码的渲染逻辑
export function CodeBlock({
	children,
	className = "",
	node,
	...props
}: CodeBlockProps) {
	const [copied, setCopied] = useState(false);

	// 从 className 中提取语言信息
	const match = /language-(\w+)/.exec(className);
	const language = match ? match[1] : "";

	// 复制代码到剪贴板
	const handleCopy = async () => {
		try {
			// 块级代码内容通常带有一个末尾的换行符，需要去除
			const contentToCopy = children.replace(/\n$/, "");
			await navigator.clipboard.writeText(contentToCopy);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			console.error("复制失败:", error);
		}
	};

	return (
		// 使用 className 和 props，但不包括 node
		<div
			className={cn("relative group my-4 w-full overflow-hidden", className)}
			{...props}
		>
			{/* 语言标签和复制按钮 (保留不变) */}
			<div className="flex items-center justify-between bg-gray-800 text-gray-300 px-4 py-2 text-sm rounded-t-lg">
				<span className="font-mono text-xs">{language || "code"}</span>
				<button
					onClick={handleCopy}
					className={cn(
						"flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors",
						"hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500",
						copied ? "text-green-400" : "text-gray-300"
					)}
					title="复制代码"
				>
					{copied ? (
						<>
							<Check className="w-3 h-3" />
							<span>已复制</span>
						</>
					) : (
						<>
							<Copy className="w-3 h-3" />
							<span>复制</span>
						</>
					)}
				</button>
			</div>

			{/* 代码内容 (保留不变) */}
			<div className="relative overflow-hidden rounded-b-lg scrollbar-thin">
				<SyntaxHighlighter
					language={language}
					style={oneDark}
					customStyle={{
						margin: 0,
						borderRadius: "0 0 0.5rem 0.5rem",
						fontSize: "0.875rem",
						lineHeight: "1.5",
						maxHeight: "400px",
						overflow: "auto",
						maxWidth: "100%",
					}}
					showLineNumbers={true}
					lineNumberStyle={{
						minWidth: "3em",
						paddingRight: "1em",
						color: "#6b7280",
						borderRight: "1px solid #374151",
						marginRight: "1em",
					}}
					wrapLines={true}
					wrapLongLines={true}
				>
					{children.replace(/\n$/, "")}
				</SyntaxHighlighter>
			</div>
		</div>
	);
}
