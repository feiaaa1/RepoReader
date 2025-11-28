import { RepoData } from "../types";

export interface ChatRequest {
	message: string;
	repoData?: RepoData;
	userProfile?: string;
	knowledgeBase?: string;
}

export interface ChatResponse {
	content: string;
	error?: string;
}

// DeepSeek API 配置
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

// 生成系统提示词
function generateSystemPrompt(
	repoData?: RepoData,
	userProfile?: string,
	knowledgeBase?: string
): string {
	let systemPrompt = `你是一个专业的代码分析助手，专门帮助用户理解和分析GitHub项目。

你的职责：
1. 分析项目结构和代码逻辑
2. 解释技术实现细节
3. 提供代码改进建议
4. 回答项目相关问题

回答要求：
- 使用中文回答
- 提供准确、详细的技术解释
- 使用Markdown格式，包含代码块、列表等
- 保持专业和友好的语调`;

	if (userProfile) {
		const profileMap: Record<string, string> = {
			beginner:
				"用户是技术初学者，请用简单易懂的语言解释，避免过于复杂的技术术语",
			frontend: "用户是前端开发者，可以深入讨论前端技术、框架和最佳实践",
			backend: "用户是后端开发者，可以详细讨论服务器端技术、数据库和架构设计",
			fullstack: "用户是全栈开发者，可以讨论前后端技术和系统架构",
			pm: "用户是产品经理，请从产品和业务角度解释技术实现",
			senior: "用户是高级工程师，可以进行深度技术讨论和架构分析",
		};
		systemPrompt += `\n\n用户角色：${profileMap[userProfile] || userProfile}`;
	}

	if (knowledgeBase) {
		systemPrompt += `\n\n用户技术背景：${knowledgeBase}`;
	}

	if (repoData) {
		const { repoInfo, readme, structure } = repoData;
		const fileCount = structure.filter((f: any) => f.type === "blob").length;

		systemPrompt += `\n\n当前分析的项目信息：
- 项目名称：${repoInfo.owner}/${repoInfo.repo}
- 分支：${repoInfo.branch}
- 文件数量：${fileCount}
- README内容：${readme.substring(0, 1000)}${readme.length > 1000 ? "..." : ""}

项目结构概览：
${structure
	.slice(0, 20)
	.map((file: any) => `- ${file.path}`)
	.join("\n")}
${structure.length > 20 ? `\n... 还有 ${structure.length - 20} 个文件` : ""}`;
	}

	return systemPrompt;
}

// 发送聊天请求到 DeepSeek API
export async function sendChatRequest(
	apiKey: string,
	request: ChatRequest
): Promise<ReadableStream<Uint8Array>> {
	const systemPrompt = generateSystemPrompt(
		request.repoData,
		request.userProfile,
		request.knowledgeBase
	);

	const response = await fetch(DEEPSEEK_API_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model: "deepseek-chat",
			messages: [
				{
					role: "system",
					content: systemPrompt,
				},
				{
					role: "user",
					content: request.message,
				},
			],
			stream: true,
			temperature: 0.7,
			max_tokens: 5000,
		}),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(
			errorData.error?.message || `API请求失败: ${response.status}`
		);
	}

	if (!response.body) {
		throw new Error("响应体为空");
	}

	return response.body;
}

// 解析流式响应
export async function* parseStreamResponse(
	stream: ReadableStream<Uint8Array>
): AsyncGenerator<string, void, unknown> {
	const reader = stream.getReader();
	const decoder = new TextDecoder();
	let buffer = "";

	try {
		while (true) {
			const { done, value } = await reader.read();

			if (done) break;

			buffer += decoder.decode(value, { stream: true });
			const lines = buffer.split("\n");

			// 保留最后一行（可能不完整）
			buffer = lines.pop() || "";

			for (const line of lines) {
				const trimmedLine = line.trim();

				if (trimmedLine === "") continue;
				if (trimmedLine === "data: [DONE]") break;
				if (!trimmedLine.startsWith("data: ")) continue;

				try {
					const jsonStr = trimmedLine.slice(6); // 移除 "data: " 前缀
					const data = JSON.parse(jsonStr);

					const content = data.choices?.[0]?.delta?.content;
					if (content) {
						yield content;
					}
				} catch (error) {
					console.warn("解析流数据失败:", error, trimmedLine);
				}
			}
		}
	} finally {
		reader.releaseLock();
	}
}
