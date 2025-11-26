import React from "react";
import ReactDOM from "react-dom/client";
import { RepoReaderWidget } from "../src/components/RepoReaderWidget";
import "../assets/tailwind.css";

export default defineContentScript({
	matches: ["*://*.github.com/*"],
	main: () => {
		// 检查是否在GitHub仓库页面
		const isRepoPage =
			window.location.pathname.includes("/") &&
			!window.location.pathname.includes("/settings") &&
			!window.location.pathname.includes("/notifications");

		if (isRepoPage) {
			const root = document.createElement("div");
			root.id = "repo-reader-root";
			root.style.position = "fixed";
			root.style.top = "0";
			root.style.right = "0";
			root.style.zIndex = "10000";

			document.body.appendChild(root);
			ReactDOM.createRoot(root).render(<RepoReaderWidget />);
		}
	},
});
