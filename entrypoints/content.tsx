import React from "react";
import ReactDOM from "react-dom/client";
import { RepoReaderWidget } from "../src/components/RepoReaderWidget";
import globalStyles from "../src/styles/globals.css?inline";
import "../src/styles/globals.css";

export default defineContentScript({
	matches: ["*://*.github.com/*"],
	main: () => {
		// 检查是否在GitHub仓库页面
		const isRepoPage =
			window.location.pathname.includes("/") &&
			!window.location.pathname.includes("/settings") &&
			!window.location.pathname.includes("/notifications");

		if (isRepoPage) {
			const host = document.createElement("div");
			host.id = "repo-reader-host";
			host.style.position = "fixed";
			host.style.top = "0";
			host.style.right = "0";
			host.style.zIndex = "10000";

			const shadowRoot = host.attachShadow({ mode: "open" });

			const shadowContainer = document.createElement("div");
			shadowContainer.id = "repo-reader-container";
			shadowContainer.style.position = "fixed";
			shadowContainer.style.top = "0";
			shadowContainer.style.right = "0";
			shadowContainer.style.zIndex = "10000";
			shadowContainer.style.fontFamily =
				"Inter, system-ui, Avenir, Helvetica, Arial, sans-serif";

			// 创建样式元素
			const styleElement = document.createElement("style");
			styleElement.textContent = globalStyles;

			// 将样式和容器添加到 Shadow DOM
			shadowRoot.appendChild(styleElement);
			shadowRoot.appendChild(shadowContainer);

			// 将宿主元素添加到页面
			document.body.appendChild(host);

			// 在 Shadow DOM 内渲染 React 应用
			ReactDOM.createRoot(shadowContainer).render(<RepoReaderWidget />);
		}
	},
});
