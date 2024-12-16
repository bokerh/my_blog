import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: "Bokerh's Blog",
  },
  links: [
    {
      text: "Docs",
      url: "/docs",
      active: "nested-url",
    },
  ],
};
