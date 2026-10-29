import JSZip from 'jszip';
import { FileItem } from '../types/editor';

export async function exportProjectZip(files: FileItem[], projectName: string = 'notemy-project'): Promise<void> {
  const zip = new JSZip();

  files.forEach((file) => {
    if (!file.isFolder) {
      // Remove leading slash if present
      const cleanPath = file.path.startsWith('/') ? file.path.slice(1) : file.path;
      zip.file(cleanPath, file.content);
    }
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${projectName}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadSingleFile(file: FileItem): void {
  const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
