import { defineConfig } from "wxt";
import path from "path";
import react from "@vitejs/plugin-react";

// 增加 EventEmitter 最大监听器数量限制
process.setMaxListeners(20);

// See https://wxt.dev/api/config.html
export default defineConfig({
	modules: ["@wxt-dev/module-react"],
	vite: () => ({
		plugins: [react()],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
		define: {
			"import.meta.env.GITHUB_TOKEN": JSON.stringify(process.env.GITHUB_TOKEN),
		},
	}),
});
