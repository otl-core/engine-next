/**
 * Code Block
 * Code syntax highlighting
 */

import type { BlockComponentProps } from "@otl-core/cms-types";

interface CodeConfig {
  code?: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  highlightLines?: string;
}

export function CodeBlock({ config }: BlockComponentProps<CodeConfig>) {
  const { code = "", language = "javascript", filename = "" } = config;

  if (!code) {
    return null;
  }

  return (
    <div className="rounded-lg bg-[#1e1e1e] overflow-hidden">
      {filename && (
        <div className="bg-[#2d2d2d] px-4 py-2 text-sm text-[#cccccc] font-mono border-b border-[#404040]">
          {filename}
        </div>
      )}
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm text-[#d4d4d4]">
          <code className={`language-${language}`}>{code}</code>
        </pre>
      </div>
    </div>
  );
}
