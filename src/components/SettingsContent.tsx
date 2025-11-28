import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { useSettingsStore } from "../stores/settingsStore";

export function SettingsContent() {
	const {
		apiKey,
		selectedModel,
		userProfile,
		knowledgeBase,
		setApiKey,
		setSelectedModel,
		setUserProfile,
		setKnowledgeBase,
	} = useSettingsStore();

	const handleSave = () => {
		alert("设置已保存到本地存储！");
	};

	return (
		<div className="flex flex-col h-full">
			<div className="flex-1 overflow-y-auto p-4 space-y-6">
				{/* AI模型选择 */}
				<div className="space-y-2">
					<Label>AI模型</Label>
					<Select value={selectedModel} onValueChange={setSelectedModel}>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="选择AI模型" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="deepseek-chat">DeepSeek Chat</SelectItem>
							<SelectItem value="gpt-4">GPT-4</SelectItem>
							<SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
							<SelectItem value="claude-3">Claude 3</SelectItem>
							<SelectItem value="gemini-pro">Gemini Pro</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* API Key */}
				<div className="space-y-2">
					<Label>API Key</Label>
					<Input
						type="password"
						value={apiKey}
						onChange={(e) => setApiKey(e.target.value)}
						placeholder="输入你的API Key"
					/>
				</div>

				{/* 用户角色 */}
				<div className="space-y-2">
					<Label>用户角色</Label>
					<Select value={userProfile} onValueChange={setUserProfile}>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="选择你的角色" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="beginner">技术初学者</SelectItem>
							<SelectItem value="frontend">前端开发者</SelectItem>
							<SelectItem value="backend">后端开发者</SelectItem>
							<SelectItem value="fullstack">全栈开发者</SelectItem>
							<SelectItem value="pm">产品经理</SelectItem>
							<SelectItem value="senior">高级工程师</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* 知识储备描述 */}
				<div className="space-y-2">
					<Label>前置知识储备描述</Label>
					<Textarea
						value={knowledgeBase}
						onChange={(e) => setKnowledgeBase(e.target.value)}
						placeholder="描述你的技术背景和已掌握的知识..."
						rows={4}
					/>
				</div>
			</div>

			{/* 保存按钮 */}
			<div className="p-4 border-t border-gray-200">
				<Button
					variant={"outline"}
					onClick={handleSave}
					className="w-full"
					disabled={!apiKey || !selectedModel}
				>
					保存设置
				</Button>
			</div>
		</div>
	);
}
