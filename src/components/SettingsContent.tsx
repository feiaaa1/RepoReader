import React, { useState } from "react";

export function SettingsContent() {
    const [apiKey, setApiKey] = useState("");
    const [selectedModel, setSelectedModel] = useState("");
    const [userProfile, setUserProfile] = useState("");
    const [knowledgeBase, setKnowledgeBase] = useState("");

    const handleSave = () => {
        console.log("保存设置:", { apiKey, selectedModel, userProfile, knowledgeBase });
        alert("设置已保存！");
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* AI模型选择 */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">AI模型</label>
                    <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">选择AI模型</option>
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        <option value="claude-3">Claude 3</option>
                        <option value="gemini-pro">Gemini Pro</option>
                    </select>
                </div>

                {/* API Key */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">API Key</label>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="输入你的API Key"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* 用户角色 */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">用户角色</label>
                    <select
                        value={userProfile}
                        onChange={(e) => setUserProfile(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">选择你的角色</option>
                        <option value="beginner">技术初学者</option>
                        <option value="frontend">前端开发者</option>
                        <option value="backend">后端开发者</option>
                        <option value="fullstack">全栈开发者</option>
                        <option value="pm">产品经理</option>
                        <option value="senior">高级工程师</option>
                    </select>
                </div>

                {/* 知识储备描述 */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">前置知识储备描述</label>
                    <textarea
                        value={knowledgeBase}
                        onChange={(e) => setKnowledgeBase(e.target.value)}
                        placeholder="描述你的技术背景和已掌握的知识..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-20"
                        rows={4}
                    />
                </div>
            </div>

            {/* 保存按钮 */}
            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={handleSave}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={!apiKey || !selectedModel}
                >
                    保存设置
                </button>
            </div>
        </div>
    );
}