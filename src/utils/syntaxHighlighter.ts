import { EditorTheme } from '../types/editor';

/**
 * Escapes HTML characters to prevent XSS and rendering issues.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Lightweight, high-performance syntax highlighter optimized for mobile WebView.
 * Handles TypeScript (.ts, .tsx), JavaScript (.js, .jsx), HTML, CSS, JSON, and Markdown.
 */
export function highlightCode(code: string, language: string, theme?: EditorTheme): string {
  if (!code) return '';
  const lang = (language || 'text').toLowerCase();

  if (lang === 'text') {
    return escapeHtml(code);
  }

  // Fallback palette inspired by modern dark themes (Acode/VS Code Dark)
  const colors = {
    keyword: '#f43f5e',     // rose-500 (import, const, return, interface)
    tag: '#38bdf8',         // sky-400 (<div>, <SettingsModal>)
    attribute: '#fbbf24',   // amber-400 (className, isOpen, onClick)
    string: '#4ade80',      // emerald-400 ('hello', "title", `text`)
    comment: '#64748b',     // slate-500 (// comment, /* block */)
    function: '#60a5fa',    // blue-400 (useState, console.log)
    number: '#fb923c',      // orange-400 (123, 0.5)
    type: '#2dd4bf',        // teal-400 (string, boolean, React.FC)
    operator: '#e2e8f0',    // slate-200 (=, +, =>)
    property: '#a78bfa',    // violet-400 (color:, margin:)
    variable: '#f1f5f9',    // slate-100
  };

  // Helper to wrap tokens
  const wrap = (text: string, color: string, italic = false, bold = false) => {
    const style = `color:${color};${italic ? 'font-style:italic;' : ''}${bold ? 'font-weight:600;' : ''}`;
    return `<span style="${style}">${escapeHtml(text)}</span>`;
  };

  try {
    // 1. JSON Highlighter
    if (lang === 'json') {
      const escaped = escapeHtml(code);
      return escaped.replace(
        /(&quot;(\u[a-zA-Z0-9]{4}|\[^u]|[^\"])*&quot;(\s*:)?|(true|false|null)|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        (match) => {
          if (/^&quot;/.test(match)) {
            if (/:$/.test(match)) {
              return `<span style="color:${colors.property};font-weight:600;">${match}</span>`;
            }
            return `<span style="color:${colors.string}">${match}</span>`;
          }
          if (/true|false/.test(match)) {
            return `<span style="color:${colors.keyword}">${match}</span>`;
          }
          if (/null/.test(match)) {
            return `<span style="color:${colors.comment}">${match}</span>`;
          }
          return `<span style="color:${colors.number}">${match}</span>`;
        }
      );
    }

    // 2. CSS / SCSS Highlighter
    if (lang === 'css' || lang === 'scss' || lang === 'less') {
      const escaped = escapeHtml(code);
      return escaped
        .replace(/(\/\*[\s\S]*?\*\/)/g, `<span style="color:${colors.comment};font-style:italic;">$1</span>`)
        .replace(/([.#][a-zA-Z0-9_-]+)/g, `<span style="color:${colors.tag};font-weight:600;">$1</span>`)
        .replace(/([a-zA-Z-]+)(\s*:)/g, `<span style="color:${colors.property};">$1</span>$2`)
        .replace(/(:)(\s*)([^;{}]+)(;)?/g, (_, colon, space, val, semi) => {
          const valColored = val.replace(
            /(#[a-fA-F0-9]{3,8}|\d+(\.\d+)?(px|rem|em|%|vh|vw|ms|s)?|&quot;.*?&quot;|&#39;.*?&#39;)/g,
            `<span style="color:${colors.number}">$1</span>`
          );
          return `${colon}${space}${valColored}${semi || ''}`;
        });
    }

    // 3. HTML Highlighter
    if (lang === 'html' || lang === 'xml' || lang === 'svg') {
      const escaped = escapeHtml(code);
      return escaped
        .replace(/(&lt;!--[\s\S]*?--&gt;)/g, `<span style="color:${colors.comment};font-style:italic;">$1</span>`)
        .replace(/(&lt;\/?)([a-zA-Z0-9:-]+)/g, `$1<span style="color:${colors.tag};font-weight:600;">$2</span>`)
        .replace(/([a-zA-Z0-9:-]+)(=)(&quot;.*?&quot;|&#39;.*?&#39;)/g, `<span style="color:${colors.attribute}">$1</span>$2<span style="color:${colors.string}">$3</span>`)
        .replace(/(&gt;|&lt;\/|&lt;|\/&gt;)/g, `<span style="color:${colors.tag}">$1</span>`);
    }

    // 4. JavaScript, TypeScript, JSX, TSX Highlighter (Complete Engine)
    // We parse tokens using a single sequential scanner to avoid broken HTML tags
    const tokenRegex = new RegExp(
      [
        // Comments (single & multi)
        '(\/\/[^\n]*|\/\*[\s\S]*?\*\/)',
        // Strings (double, single, template literals)
        '("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`[\s\S]*?`)',
        // TSX / JSX Tags: <ComponentName, </ComponentName>, <div, </div
        '(<\/?[A-Z][a-zA-Z0-9_.]*|<\/?[a-z][a-zA-Z0-9-]*|\/?>)',
        // JSX Prop names (e.g. className=, isOpen=)
        '(\b[a-zA-Z_][a-zA-Z0-9_-]*(?=\s*=\s*["\'{]))',
        // TypeScript / JS Keywords
        '\b(import|export|from|as|default|const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|new|typeof|instanceof|async|await|yield|class|extends|super|this|interface|type|enum|implements|declare|readonly|private|public|protected|static|void|any|unknown|never|true|false|null|undefined)\b',
        // TypeScript Types / Classes
        '\b(string|number|boolean|symbol|bigint|object|Array|Record|Partial|Promise|React|FC|FileItem|EditorSettings|EditorTheme|CursorPosition)\b',
        // Numbers
        '\b(\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b',
        // Function calls: name(...)
        '\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()',
      ].join('|'),
      'g'
    );

    let lastIndex = 0;
    let result = '';
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(code)) !== null) {
      // Append un-tokenized plain text
      if (match.index > lastIndex) {
        result += escapeHtml(code.slice(lastIndex, match.index));
      }

      const [
        raw,
        comment,
        str,
        jsxTag,
        jsxProp,
        keyword,
        typeToken,
        num,
        funcName,
      ] = match;

      if (comment) {
        result += wrap(comment, colors.comment, true);
      } else if (str) {
        result += wrap(str, colors.string);
      } else if (jsxTag) {
        // Distinguish React Components (Capitalized) vs HTML tags
        const isComponent = /<\/?[A-Z]/.test(jsxTag);
        result += wrap(jsxTag, isComponent ? colors.type : colors.tag, false, isComponent);
      } else if (jsxProp) {
        result += wrap(jsxProp, colors.attribute);
      } else if (keyword) {
        result += wrap(keyword, colors.keyword, false, true);
      } else if (typeToken) {
        result += wrap(typeToken, colors.type);
      } else if (num) {
        result += wrap(num, colors.number);
      } else if (funcName) {
        result += wrap(funcName, colors.function);
      } else {
        result += escapeHtml(raw);
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < code.length) {
      result += escapeHtml(code.slice(lastIndex));
    }

    return result;
  } catch (e) {
    console.error('Error during syntax highlighting', e);
    return escapeHtml(code);
  }
}
