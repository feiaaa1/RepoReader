import { useState } from "react";
import { RepoReaderWidget } from "../../src/components/RepoReaderWidget";

function App() {
	const [url, setUrl] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleAnalyze = async () => {
		if (!url) return;

		setIsLoading(true);
		try {
			// 这里将来会添加分析仓库的逻辑
			console.log("分析仓库:", url);
			// 模拟异步操作
			await new Promise((resolve) => setTimeout(resolve, 1000));
			alert("仓库分析完成！");
		} catch (error) {
			console.error("分析失败:", error);
			alert("分析失败，请检查URL是否正确");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="relative min-h-screen bg-gray-50">
			<div className="w-80 p-6 bg-white shadow-lg rounded-lg">
				<h1 className="text-2xl font-bold text-gray-800 mb-2">RepoReader</h1>
				<p className="text-gray-600 mb-6">智能代码仓库分析助手</p>

				<div className="space-y-4">
					<input
						type="text"
						placeholder="输入GitHub仓库URL..."
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
					<button
						onClick={handleAnalyze}
						disabled={!url || isLoading}
						className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
					>
						{isLoading ? "分析中..." : "分析仓库"}
					</button>
				</div>

				<div className="mt-6">
					<h3 className="text-lg font-semibold text-gray-800 mb-3">功能特性：</h3>
					<ul className="space-y-2 text-sm text-gray-600">
						<li className="flex items-center">
							<span className="mr-2">🤖</span>
							AI智能分析
						</li>
						<li className="flex items-center">
							<span className="mr-2">💬</span>
							对话式交互
						</li>
						<li className="flex items-center">
							<span className="mr-2">⚙️</span>
							个性化设置
						</li>
						<li className="flex items-center">
							<span className="mr-2">📚</span>
							前置知识解读
						</li>
					</ul>
				</div>

				<div className="mt-6 p-4 bg-blue-50 rounded-lg">
					<p className="text-sm text-blue-700">
						💡 点击右上角的悬浮按钮开始与AI助手对话！
					</p>
				</div>
			</div>

			{/* RepoReader悬浮组件 */}
			<RepoReaderWidget />
		</div>
	);
}

export default App;
