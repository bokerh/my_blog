import type { DocsThemeConfig } from "nextra-theme-docs";
import { Code, InlineCode } from "./src/components/code-blocks/code";
import type { FC } from "react";

const themeConfig: DocsThemeConfig = {
  logo: <span>Bokerh&apos;s useMemo</span>,
  project: {
    link: undefined,
  },
  components: {
    Code: Code as FC,
    InlineCode: InlineCode as FC,
  },
  feedback: {
    content: null, // 这会禁用 feedback 按钮
  },
  darkMode: false,
  nextThemes: {
    defaultTheme: "dark",
  },
  editLink: {
    component: null, // 这会禁用 edit 链接
  },
  sidebar: {
    autoCollapse: false,
  },

  // ... other theme options
};

export default themeConfig;
