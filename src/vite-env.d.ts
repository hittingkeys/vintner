/// <reference types="vite/client" />

declare module "*.mdx" {
  import type { ComponentType, ReactNode } from "react";

  export const frontmatter: Record<string, unknown>;

  const MDXComponent: ComponentType<{
    children?: ReactNode;
    components?: Record<string, ComponentType>;
  }>;
  export default MDXComponent;
}
