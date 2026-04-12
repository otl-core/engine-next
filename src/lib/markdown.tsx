import type { Components } from "react-markdown";

/**
 * Converts single newlines to markdown hard breaks (two trailing spaces + newline)
 * while preserving double newlines as paragraph breaks.
 *
 * Standard markdown ignores single \n (soft break). CMS content authored in
 * textareas expects Enter → visible line break, so we normalise here.
 */
export function normalizeNewlines(content: string): string {
  return content
    .replace(/\n\n/g, "\0PARA\0")
    .replace(/\n/g, "  \n")
    .replace(/\0PARA\0/g, "\n\n");
}

/**
 * ReactMarkdown component overrides that assign matching CSS classes
 * to each rendered element. This gives every element a class hook
 * (e.g. `<ul class="ul">`) that the typography system styles via
 * CSS variables, and that users can target in their globals.css.
 */
export const markdownComponents: Components = {
  h1: ({ children, ...props }) => (
    <h1 className="h1" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="h2" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="h3" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="h4" {...props}>
      {children}
    </h4>
  ),
  h5: ({ children, ...props }) => (
    <h5 className="h5" {...props}>
      {children}
    </h5>
  ),
  h6: ({ children, ...props }) => (
    <h6 className="h6" {...props}>
      {children}
    </h6>
  ),
  p: ({ children, ...props }) => (
    <p className="paragraph" {...props}>
      {children}
    </p>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote className="blockquote" {...props}>
      {children}
    </blockquote>
  ),
  a: ({ children, ...props }) => (
    <a className="a" {...props}>
      {children}
    </a>
  ),
  ul: ({ children, ...props }) => (
    <ul className="ul" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="ol" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="li" {...props}>
      {children}
    </li>
  ),
  hr: ({ ...props }) => <hr className="hr" {...props} />,
  table: ({ children, ...props }) => (
    <table className="table" {...props}>
      {children}
    </table>
  ),
  th: ({ children, ...props }) => (
    <th className="th" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="td" {...props}>
      {children}
    </td>
  ),
  pre: ({ children, ...props }) => (
    <pre className="code" {...props}>
      {children}
    </pre>
  ),
  code: ({ children, ...props }) => (
    <code className="code" {...props}>
      {children}
    </code>
  ),
  small: ({ children, ...props }) => (
    <small className="small" {...props}>
      {children}
    </small>
  ),
};
