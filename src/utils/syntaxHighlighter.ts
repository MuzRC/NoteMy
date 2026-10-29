import { EditorTheme, LanguageType } from '../types/editor';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function highlightCode(
  code: string,
  language: LanguageType,
  theme: EditorTheme
): string {
  if (!code) {
    return ' ';
  }

  // Ensure trailing newline renders matching height in overlay
  const normalized = code.endsWith('\n') ? code + ' ' : code;

  switch (language) {
    case 'html':
      return highlightHtml(normalized, theme);
    case 'javascript':
    case 'typescript':
      return highlightJavaScript(normalized, theme);
    case 'css':
      return highlightCss(normalized, theme);
    case 'json':
      return highlightJson(normalized, theme);
    case 'python':
      return highlightPython(normalized, theme);
    case 'markdown':
      return highlightMarkdown(normalized, theme);
    default:
      return escapeHtml(normalized);
  }
}

function highlightHtml(code: string, theme: EditorTheme): string {
  // Comments: <!-- ... -->
  // Tags: <tag, </tag, >
  // Attributes: attr="val"
  const escaped = escapeHtml(code);

  return escaped
    // HTML Comments
    .replace(
      /(&lt;!--[\s\S]*?--&gt;)/g,
      `<span style="color: ${theme.comment}; font-style: italic;">$1</span>`
    )
    // DOCTYPE
    .replace(
      /(&lt;!DOCTYPE[\s\S]*?&gt;)/gi,
      `<span style="color: ${theme.keyword}; font-weight: 600;">$1</span>`
    )
    // Tags and attributes
    .replace(
      /(&lt;\/?)([a-zA-Z0-9\-]+)([\s\S]*?)(&gt;)/g,
      (_match, p1, tag, attrs, p4) => {
        const highlightedAttrs = attrs.replace(
          /([a-zA-Z0-9\-_:@.]+)(=)(["'][^"']*["'])/g,
          `<span style="color: ${theme.attribute};">$1</span><span style="color: ${theme.operator};">$2</span><span style="color: ${theme.string};">$3</span>`
        );
        return `<span style="color: ${theme.operator};">${p1}</span><span style="color: ${theme.tag}; font-weight: 500;">${tag}</span>${highlightedAttrs}<span style="color: ${theme.operator};">${p4}</span>`;
      }
    );
}

function highlightJavaScript(code: string, theme: EditorTheme): string {
  const keywords =
    /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|default|import|export|from|as|class|extends|new|this|super|try|catch|finally|throw|typeof|instanceof|async|await|yield|in|of|void|delete|null|undefined|true|false)\b/g;

  // Preserve strings and comments with tokens to avoid nested regex collisions
  const tokens: { placeholder: string; html: string }[] = [];
  let tokenCount = 0;

  function storeToken(html: string): string {
    const placeholder = `___TOKEN_${tokenCount++}___`;
    tokens.push({ placeholder, html });
    return placeholder;
  }

  // 1. Strings (single, double, backtick)
  let processed = code.replace(
    /(["'`])(?:\\.|(?!\1)[^\\\r\n])*\1|`[\s\S]*?`/g,
    (match) => {
      return storeToken(
        `<span style="color: ${theme.string};">${escapeHtml(match)}</span>`
      );
    }
  );

  // 2. Comments (single-line and multi-line)
  processed = processed.replace(/(\/\/[^\r\n]*|\/\*[\s\S]*?\*\/)/g, (match) => {
    return storeToken(
      `<span style="color: ${theme.comment}; font-style: italic;">${escapeHtml(
        match
      )}</span>`
    );
  });

  // 3. Numbers
  processed = escapeHtml(processed);
  processed = processed.replace(
    /\b(\d+(\.\d+)?([eE][+-]?\d+)?)\b/g,
    `<span style="color: ${theme.number};">$1</span>`
  );

  // 4. Function invocations: foo(...)
  processed = processed.replace(
    /\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/g,
    `<span style="color: ${theme.function}; font-weight: 500;">$1</span>`
  );

  // 5. Keywords
  processed = processed.replace(
    keywords,
    `<span style="color: ${theme.keyword}; font-weight: 600;">$1</span>`
  );

  // 6. Operators
  processed = processed.replace(
    /([=+\-*/%&|!<>?:^~]+)/g,
    `<span style="color: ${theme.operator};">$1</span>`
  );

  // Restore preserved tokens
  for (let i = tokens.length - 1; i >= 0; i--) {
    processed = processed.replace(tokens[i].placeholder, tokens[i].html);
  }

  return processed;
}

function highlightCss(code: string, theme: EditorTheme): string {
  const escaped = escapeHtml(code);

  return (
    escaped
      // Comments /* ... */
      .replace(
        /(\/\*[\s\S]*?\*\/)/g,
        `<span style="color: ${theme.comment}; font-style: italic;">$1</span>`
      )
      // Properties and values
      .replace(
        /([a-zA-Z\-]+)(\s*:)([^;{}]+)(;?)/g,
        `<span style="color: ${theme.attribute};">$1</span><span style="color: ${theme.operator};">$2</span><span style="color: ${theme.string};">$3</span><span style="color: ${theme.operator};">$4</span>`
      )
      // Selectors before {
      .replace(
        /([^{}]+)(?=\{)/g,
        `<span style="color: ${theme.function}; font-weight: 600;">$1</span>`
      )
  );
}

function highlightJson(code: string, theme: EditorTheme): string {
  const escaped = escapeHtml(code);

  return (
    escaped
      // Keys: "key":
      .replace(
        /(&quot;[\w\-_]+&quot;)(\s*:)/g,
        `<span style="color: ${theme.keyword}; font-weight: 500;">$1</span><span style="color: ${theme.operator};">$2</span>`
      )
      // String values
      .replace(
        /:\s*(&quot;[^&]*&quot;)/g,
        `: <span style="color: ${theme.string};">$1</span>`
      )
      // Numbers, booleans, null
      .replace(
        /\b(true|false|null|\d+(\.\d+)?)\b/g,
        `<span style="color: ${theme.number};">$1</span>`
      )
  );
}

function highlightPython(code: string, theme: EditorTheme): string {
  const keywords =
    /\b(def|class|if|elif|else|for|while|try|except|finally|with|as|import|from|return|yield|pass|break|continue|lambda|and|or|not|is|in|None|True|False|self)\b/g;

  let processed = escapeHtml(code);

  // Comments # ...
  processed = processed.replace(
    /(#[^\r\n]*)/g,
    `<span style="color: ${theme.comment}; font-style: italic;">$1</span>`
  );

  // Strings
  processed = processed.replace(
    /(&quot;.*?&quot;|'.*?')/g,
    `<span style="color: ${theme.string};">$1</span>`
  );

  // Numbers
  processed = processed.replace(
    /\b(\d+(\.\d+)?)\b/g,
    `<span style="color: ${theme.number};">$1</span>`
  );

  // Keywords
  processed = processed.replace(
    keywords,
    `<span style="color: ${theme.keyword}; font-weight: 600;">$1</span>`
  );

  // Functions: def func_name
  processed = processed.replace(
    /\b([a-zA-Z_][a-zA-Z0-9_]*)(?=\s*\()/g,
    `<span style="color: ${theme.function}; font-weight: 500;">$1</span>`
  );

  return processed;
}

function highlightMarkdown(code: string, theme: EditorTheme): string {
  let escaped = escapeHtml(code);

  // Headers #
  escaped = escaped.replace(
    /^(#{1,6}\s+.*$)/gm,
    `<span style="color: ${theme.keyword}; font-weight: 700;">$1</span>`
  );

  // Bold & Italic
  escaped = escaped.replace(
    /(\*\*.*?\*\*|__.*?__)/g,
    `<span style="color: ${theme.function}; font-weight: 600;">$1</span>`
  );

  // Inline code `code`
  escaped = escaped.replace(
    /(`[^`]+`)/g,
    `<span style="color: ${theme.string}; background: rgba(255,255,255,0.06); border-radius: 3px; padding: 0 3px;">$1</span>`
  );

  // Links [text](url)
  escaped = escaped.replace(
    /(\[[^\]]+\])(\([^)]+\))/g,
    `<span style="color: ${theme.attribute};">$1</span><span style="color: ${theme.operator};">$2</span>`
  );

  return escaped;
}
