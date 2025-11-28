export default {
	// 确保这里的路径覆盖了你所有的 .html, .js, .ts, .jsx, .tsx, .vue 等文件
	content: [
		"./src/**/*.{js,ts,jsx,tsx,vue}",
		"./entrypoints/**/*.{html,js,ts}",
	],
	theme: {
		extend: {},
	},
	plugins: [],
};
