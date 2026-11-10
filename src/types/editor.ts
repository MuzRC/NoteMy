export type LanguageType =
  | 'html'
  | 'css'
  | 'javascript'
  | 'typescript'
  | 'jsx'
  | 'tsx'
  | 'json'
  | 'python'
  | 'markdown'
  | 'text'
  | string;

export interface FileItem {
  id: string;
  name: string;
  path: string;
  content: string;
  language: LanguageType;
  isFolder: boolean;
  parentId: string | null;
  isOpen?: boolean;
  isUnsaved?: boolean;
}

export type ThemeId =
  | 'acode-dark'
  | 'amoled-black'
  | 'one-dark'
  | 'dracula'
  | 'monokai'
  | 'github-light';

export interface EditorTheme {
  id: ThemeId;
  name: string;
  bg: string;
  appBarBg: string;
  editorBg: string;
  sidebarBg: string;
  tabBg: string;
  activeTabBg: string;
  tabText: string;
  activeTabText: string;
  textColor: string;
  gutterBg: string;
  gutterColor: string;
  activeLineGutter: string;
  activeLineBg: string;
  quickKeyBg: string;
  quickKeyText: string;
  quickKeyBorder: string;
  selectionBg: string;
  borderColor: string;
  accentColor: string;
  isDark: boolean;
  // Syntax tokens
  keyword: string;
  string: string;
  number: string;
  comment: string;
  function: string;
  tag: string;
  attribute: string;
  operator: string;
  bracket: string;
}

export type ConsoleLevel = 'log' | 'info' | 'warn' | 'error';

export interface ConsoleMessage {
  id: string;
  level: ConsoleLevel;
  text: string;
  timestamp: string;
  count?: number;
}

export interface EditorSettings {
  theme: ThemeId;
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  showLineNumbers: boolean;
  autoCloseBrackets: boolean;
  quickKeysVisible: boolean;
}

export interface CursorPosition {
  line: number;
  column: number;
  selectionLength: number;
}
