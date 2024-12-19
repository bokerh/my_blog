import type { DocsThemeConfig } from "nextra-theme-docs";
import { Code, InlineCode } from "./src/components/code-blocks/code";
import type { FC } from "react";

const themeConfig: DocsThemeConfig = {
  logo: <span>My Nextra Documentation</span>,
  project: {
    link: "https://github.com/shuding/nextra",
  },
  components: {
    Code: Code as FC,
    InlineCode: InlineCode as FC,
  },
  // ... other theme options
};

export default themeConfig;
