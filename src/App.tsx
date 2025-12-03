import "./styles/globals.css";
import { RepoReaderWidget } from "@/components/RepoReaderWidget";

export default function App() {
	return (
		<div className="min-h-screen bg-gray-50">
			{/* 主要内容区域 */}
			<div className="p-4">
				<h1 className="text-2xl font-bold mb-4 text-gray-900">RepoReader Chrome Extension</h1>
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<p className="text-gray-600 mb-4">
						欢迎使用RepoReader！这是一个智能的GitHub项目分析助手。
					</p>
					<div className="space-y-2 text-sm text-gray-500">
						<p>• 点击右上角的悬浮按钮开始使用</p>
						<p>• 在对话页面与AI助手交流</p>
						<p>• 在设置页面配置你的API Key和偏好</p>
					</div>
				</div>
			</div>

			{/* RepoReader悬浮组件 */}
			<RepoReaderWidget />
		</div>
	);
}
