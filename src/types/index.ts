// GitHub API 相关接口和类型
export interface RepoInfo {
    owner: string;
    repo: string;
    readme?: string;
    structure?: any[];
}

export interface GitHubFile {
    name: string;
    path: string;
    type: "file" | "dir";
    size?: number;
}

// GitHub API 相关接口
export interface GitHubRepoInfo {
    owner: string;
    repo: string;
    branch: string;
}

export interface RepoData {
    readme: string;
    structure: any;
    repoInfo: GitHubRepoInfo;
}

// 消息类型定义
export interface Message {
    id: string;
    content: string;
    role: "user" | "assistant";
    timestamp: Date;
}