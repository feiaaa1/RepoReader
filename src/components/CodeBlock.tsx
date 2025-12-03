import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import { cn } from "../utils/cn";

interface CodeBlockProps {
	children: string;
	className?: string;
	inline?: boolean;
}

export function CodeBlock({ children, className, inline }: CodeBlockProps) {
	const [copied, setCopied] = useState(false);

	// 从className中提取语言信息
	const match = /language-(\w+)/.exec(className || "");
	const language = match ? match[1] : "";

	// 如果是内联代码，使用简单的样式
	if (inline) {
		return (
			<code className="bg-blue-50 text-blue-600 px-1 py-0.5 rounded text-sm font-mono">
				{children}
			</code>
		);
	}

	// 复制代码到剪贴板
	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(children);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			console.error("复制失败:", error);
		}
	};

	return (
		<div className="relative group my-4 w-full overflow-hidden">
			{/* 语言标签和复制按钮 */}
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

			{/* 代码内容 */}
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
					{children}
				</SyntaxHighlighter>
			</div>
		</div>
	);
}
