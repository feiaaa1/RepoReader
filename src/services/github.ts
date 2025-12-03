import { Octokit } from "@octokit/rest";
import { GitHubRepoInfo, RepoData } from "../types";

// 初始化Octokit实例
const octokit = new Octokit({
	auth: import.meta.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN,
});

// 解析GitHub URL获取仓库信息
export const parseGitHubUrl = (url: string): GitHubRepoInfo | null => {
	try {
		const urlObj = new URL(url);
		if (urlObj.hostname !== "github.com") {
			return null;
		}

		const pathParts = urlObj.pathname.split("/").filter(Boolean);
		if (pathParts.length < 2) {
			return null;
		}

		const owner = pathParts[0];
		const repo = pathParts[1];

		// 处理分支信息
		let branch = "main";
		if (pathParts.length >= 4 && pathParts[2] === "tree") {
			branch = pathParts[3];
		}

		return { owner, repo, branch };
	} catch (error) {
		console.error("解析GitHub URL失败:", error);
		return null;
	}
};

// 获取当前页面的GitHub仓库信息
export const getCurrentRepoInfo = (): GitHubRepoInfo | null => {
	const url = window.location.href;
	return parseGitHubUrl(url);
};

// 获取仓库README内容
export const getRepoReadme = async (
	owner: string,
	repo: string,
	branch: string = "main"
): Promise<string> => {
	const branches = ["main", "master"];

	try {
		for (const branchName of branches) {
			try {
				const { data } = await octokit.rest.repos.getReadme({
					owner,
					repo,
					ref: branchName,
				});

				// 解码base64内容，正确处理UTF-8编码
				const base64Content = data.content.replace(/\s/g, ""); // 移除空白字符
				const binaryString = atob(base64Content);

				// 将二进制字符串转换为Uint8Array
				const bytes = new Uint8Array(binaryString.length);
				for (let i = 0; i < binaryString.length; i++) {
					bytes[i] = binaryString.charCodeAt(i);
				}

				// 使用TextDecoder正确解码UTF-8
				const decoder = new TextDecoder("utf-8");
				const content = decoder.decode(bytes);
				return content;
			} catch (branchError) {
				// 如果当前分支失败，继续尝试下一个分支
				console.warn(`尝试分支 ${branchName} 失败:`, branchError);
				continue;
			}
		}

		// 如果所有分支都失败了
		throw new Error("所有分支都无法获取README");
	} catch (error) {
		console.error("获取README失败:", error);
		return "无法获取README文件";
	}
};

// 获取仓库文件结构
export const getRepoStructure = async (
	owner: string,
	repo: string,
	branch: string = "main"
): Promise<any[]> => {
	const branches = ["main", "master"];

	try {
		for (const branchName of branches) {
			try {
				const { data } = await octokit.rest.git.getTree({
					owner,
					repo,
					tree_sha: branchName,
					recursive: "true",
				});

				return data.tree || [];
			} catch (branchError) {
				// 如果当前分支失败，继续尝试下一个分支
				console.warn(`尝试分支 ${branchName} 失败:`, branchError);
				continue;
			}
		}

		// 如果所有分支都失败了
		throw new Error("所有分支都无法获取仓库结构");
	} catch (error) {
		console.error("获取仓库结构失败:", error);
		return [];
	}
};

// 初始化仓库数据
export const initializeRepoData = async (): Promise<RepoData | null> => {
	const repoInfo = getCurrentRepoInfo();
	if (!repoInfo) {
		return null;
	}

	try {
		const [readme, structure] = await Promise.all([
			getRepoReadme(repoInfo.owner, repoInfo.repo, repoInfo.branch),
			getRepoStructure(repoInfo.owner, repoInfo.repo, repoInfo.branch),
		]);

		console.log("Repository Data:", {
			repoInfo,
			readme: readme,
			structure: structure,
		});

		return {
			repoInfo,
			readme,
			structure,
		};
	} catch (error) {
		console.error("初始化仓库数据失败:", error);
		return null;
	}
};

// 生成仓库分析报告
export const generateRepoAnalysis = (repoData: RepoData): string => {
	const { repoInfo, readme, structure } = repoData;

	console.log("Generating analysis for:", repoData);

	// 统计文件类型
	const fileTypes: Record<string, number> = {};
	const files = structure.filter((item: any) => item.type === "blob");

	files.forEach((file: any) => {
		const ext = file.path.split(".").pop()?.toLowerCase() || "unknown";
		fileTypes[ext] = (fileTypes[ext] || 0) + 1;
	});

	// 识别主要技术栈
	const techStack: string[] = [];
	if (fileTypes.js || fileTypes.jsx) techStack.push("JavaScript");
	if (fileTypes.ts || fileTypes.tsx) techStack.push("TypeScript");
	if (fileTypes.py) techStack.push("Python");
	if (fileTypes.java) techStack.push("Java");
	if (fileTypes.cpp || fileTypes.c) techStack.push("C/C++");
	if (fileTypes.go) techStack.push("Go");
	if (fileTypes.rs) techStack.push("Rust");
	if (fileTypes.php) techStack.push("PHP");
	if (fileTypes.rb) techStack.push("Ruby");
	if (fileTypes.swift) techStack.push("Swift");
	if (fileTypes.kt) techStack.push("Kotlin");

	// 识别框架和工具
	const frameworks: string[] = [];
	const hasPackageJson = files.some((f: any) => f.path === "package.json");
	const hasRequirementsTxt = files.some(
		(f: any) => f.path === "requirements.txt"
	);
	const hasPomXml = files.some((f: any) => f.path === "pom.xml");
	const hasCargoToml = files.some((f: any) => f.path === "Cargo.toml");

	if (hasPackageJson) frameworks.push("Node.js");
	if (hasRequirementsTxt) frameworks.push("Python项目");
	if (hasPomXml) frameworks.push("Maven");
	if (hasCargoToml) frameworks.push("Cargo");

	const totalFiles = files.length;
	const totalDirs = structure.filter(
		(item: any) => item.type === "tree"
	).length;

	return `## 📊 项目分析报告

### 🏷️ 基本信息
- **仓库**: ${repoInfo.owner}/${repoInfo.repo}
- **分支**: ${repoInfo.branch}
- **文件数量**: ${totalFiles}
- **目录数量**: ${totalDirs}

### 💻 技术栈
${
	techStack.length > 0
		? techStack.map((tech) => `- ${tech}`).join("\n")
		: "- 未识别到主要编程语言"
}

### 🛠️ 项目工具
${
	frameworks.length > 0
		? frameworks.map((fw) => `- ${fw}`).join("\n")
		: "- 未识别到特定框架"
}

### 📁 文件类型分布
${Object.entries(fileTypes)
	.sort(([, a], [, b]) => b - a)
	.slice(0, 8)
	.map(([ext, count]) => `- **.${ext}**: ${count} 个文件`)
	.join("\n")}

### 📖 README概览
${readme}

---
💡 **提示**: 你可以询问我关于这个项目的任何问题，比如：
- 项目的主要功能是什么？
- 如何运行这个项目？
- 代码结构是怎样的？
- 有什么技术亮点？`;
};
