import { forwardRef, useMemo } from 'react';
import { EditorTheme, EditorSettings } from '../types/editor';

interface EditorGutterProps {
  totalLines: number;
  theme: EditorTheme;
  settings: EditorSettings;
}

export const EditorGutter = forwardRef<HTMLDivElement, EditorGutterProps>(
  ({ totalLines, theme, settings }, ref) => {
    // Gabung nombor jadi satu teks rentetan tunggal, elak beban DOM
    const lineNumbersText = useMemo(() => {
      const nums: string[] = [];
      for (let i = 1; i <= totalLines; i++) {
        nums.push(String(i));
      }
      return nums.join('\n');
    }, [totalLines]);

    if (!settings.showLineNumbers) return null;

    return (
      <div
        ref={ref}
        className="py-3 px-2 text-right select-none font-mono overflow-hidden shrink-0 border-r"
        style={{
          backgroundColor: theme.gutterBg,
          color: theme.gutterColor,
          borderColor: theme.borderColor,
          fontSize: `${settings.fontSize}px`,
          lineHeight: '1.6',
          minWidth: totalLines > 999 ? '52px' : totalLines > 99 ? '44px' : '36px',
        }}
      >
        <pre className="m-0 p-0 font-mono leading-[1.6]">
          {lineNumbersText}
        </pre>
      </div>
    );
  }
);

EditorGutter.displayName = 'EditorGutter';
