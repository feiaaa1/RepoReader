// postcss-shadow-dom-vars.cjs
const plugin = () => {
	return {
		postcssPlugin: "postcss-shadow-dom-vars",

		OnceExit(root) {
			// 1. 扩展主题变量的作用域 (确保主题变量能渗透)
			root.walkRules(":root", (rule) => {
				rule.selector = ":root, :host";
			});

			// 2. 找到或创建一个 :host 规则来注入实用变量的起点
			let hostRule = null;
			// 查找包含 :host 的规则，以便在其中追加
			root.walkRules((rule) => {
				if (rule.selector && rule.selector.includes(":host")) {
					hostRule = rule;
				}
			});

			if (hostRule) {
				// 核心：注入所有非继承的实用变量默认值
				const twVarsToInject = [
					// TRANSFORM
					"--tw-translate-x: 0;",
					"--tw-translate-y: 0;",
					"--tw-scale-x: 1;",
					"--tw-scale-y: 1;",
					"--tw-rotate: 0;",
					// SHADOW & RING
					"--tw-shadow: 0 0 #0000;",
					"--tw-shadow-color: initial;", // 允许回退
					"--tw-shadow-alpha: 100%;", // 确保颜色混合计算正常
					"--tw-ring-shadow: 0 0 #0000;",
					"--tw-ring-offset-width: 0px;",
					// SPACING
					"--tw-space-x-reverse: 0;",
					"--tw-space-y-reverse: 0;",
					// OPACITY
					"--tw-border-opacity: 1;",
					"--tw-bg-opacity: 1;",
				];

				twVarsToInject.forEach((decl) => {
					// 避免重复注入，仅追加
					hostRule.append(decl);
				});
			}
		},
	};
};

module.exports = plugin;
module.exports.postcss = true;
