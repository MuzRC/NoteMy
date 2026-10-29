import { EditorTheme } from '../types/editor';

/**
 * Elak ralat HTML escaping dan isu paparan teks
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
 * Enjin pewarna pantas direka khas untuk WebView telefon.
 */
export function highlightCode(code: string, language: string, theme?: EditorTheme): string {
  if (!code) return '';
  const lang = (language || 'text').toLowerCase();

  if (lang === 'text') {
    return escapeHtml(code);
  }

  // Palet warna moden (VS Code Dark / Acode style)
  const colors = {
    keyword: '#f43f5e',     // Merah jambu (import, const, return, interface)
    tag: '#38bdf8',         // Biru langit (<div>, <SettingsModal>)
    attribute: '#fbbf24',   // Kuning keemasan (className, isOpen, onClick)
    string: '#4ade80',      // Hijau terang ('teks', "nilai", `string`)
    comment: '#64748b',     // Kelabu (// komen, /* blok */)
    function: '#60a5fa',    // Biru lembut (useState, setFiles)
    number: '#fb923c',      // Jingga (123, 0.5)
    type: '#2dd4bf',        // Teal (string, boolean, React.FC)
    operator: '#e2e8f0',    // Putih kelabu (=, +, =>)
    property: '#a78bfa',    // Ungu cair (color:, fontSize:)
  };

  const wrap = (text: string, color: string, italic = false, bold = false) => {
    const style = `color:${color};${italic ? 'font-style:italic;' : ''}${bold ? 'font-weight:600;' : ''}`;
    return `<span style="${style}">${escapeHtml(text)}</span>`;
  };

  try {
    // 1. Format JSON
    if (lang === 'json') {
      const escaped = escapeHtml(code);
      return escaped.replace(
        /(&quot;(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*&quot;(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
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

    // 2. Format CSS / SCSS
    if (lang === 'css' || lang === 'scss' || lang === 'less') {
      const escaped = escapeHtml(code);
      return escaped
        .replace(/(\/\*[\s\S]*?\*\/)/g, `<span style="color:${colors.comment};font-style:italic;">$1</span>`)
        .replace(/([.#][a-zA-Z0-9_-]+)/g, `<span style="color:${colors.tag};font-weight:600;">$1</span>`)
        .replace(/([a-zA-Z-]+)(\s*:)/g, `<span style="color:${colors.property};">$1</span>$2`)
        .replace(/(:)(\s*)([^;{}]+)(;)?/g, (_, colon, space, val, semi) => {
          const valColored = val.replace(
            /(#[a-fA-F0-9]{3,8}|\b\d+(\.\d+)?(px|rem|em|%|vh|vw|ms|s)?\b|&quot;.*?&quot;|&#39;.*?&#39;)/g,
            `<span style="color:${colors.number}">$1</span>`
          );
          return `${colon}${space}${valColored}${semi || ''}`;
        });
    }

    // 3. Format HTML / SVG
    if (lang === 'html' || lang === 'xml' || lang === 'svg') {
      const escaped = escapeHtml(code);
      return escaped
        .replace(/(&lt;!--[\s\S]*?--&gt;)/g, `<span style="color:${colors.comment};font-style:italic;">$1</span>`)
        .replace(/(&lt;\/?)([a-zA-Z0-9:-]+)/g, `$1<span style="color:${colors.tag};font-weight:600;">$2</span>`)
        .replace(/([a-zA-Z0-9:-]+)(=)(&quot;.*?&quot;|&#39;.*?&#39;)/g, `<span style="color:${colors.attribute}">$1</span>$2<span style="color:${colors.string}">$3</span>`)
        .replace(/(&gt;|&lt;\/|&lt;|\/&gt;)/g, `<span style="color:${colors.tag}">$1</span>`);
    }

    // 4. Format JavaScript, TypeScript, JSX, TSX
    const tokenRegex = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\n])*"|'(?:\\.|[^'\n])*'|`[\s\S]*?`)|(<\/?\s*[A-Z][a-zA-Z0-9_.]*|<\/?\s*[a-z][a-zA-Z0-9-]*|\/?>)|(\b[a-zA-Z_][a-zA-Z0-9_-]*(?=\s*=\s*["'{]))|\b(import|export|from|as|default|const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|new|typeof|instanceof|async|await|yield|class|extends|super|this|interface|type|enum|implements|declare|readonly|private|public|protected|static|void|any|unknown|never|true|false|null|undefined)\b|\b(string|number|boolean|symbol|bigint|object|Array|Record|Partial|Promise|React|FC|FileItem|EditorSettings|EditorTheme|CursorPosition)\b|\b(\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b|\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/g;

    let lastIndex = 0;
    let result = '';
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(code)) !== null) {
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
        const isComponent = /<\/?\s*[A-Z]/.test(jsxTag);
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
