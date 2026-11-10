import React, { useState, useRef } from 'react';
import {
  FileCode,
  Folder,
  FolderPlus,
  FilePlus,
  Upload,
  Trash2,
  Edit2,
  Download,
  ChevronRight,
  ChevronDown,
  X,
  AlertTriangle,
} from 'lucide-react';
import { FileItem, EditorTheme } from '../types/editor';
import { detectLanguage } from '../utils/starterFiles';
import { downloadSingleFile } from '../utils/projectZip';

interface FileExplorerProps {
  files: FileItem[];
  activeFileId: string | null;
  theme: EditorTheme;
  isOpen: boolean;
  onClose: () => void;
  onSelectFile: (fileId: string) => void;
  onCreateFile: (name: string, isFolder: boolean, parentId?: string | null) => void;
  onRenameFile: (fileId: string, newName: string) => void;
  onDeleteFile: (fileId: string) => void;
  onImportFiles: (files: { name: string; content: string }[]) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFileId,
  theme,
  isOpen,
  onClose,
  onSelectFile,
  onCreateFile,
  onRenameFile,
  onDeleteFile,
  onImportFiles,
}) => {
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  const [isCreating, setIsCreating] = useState<'file' | 'folder' | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  
  // State untuk modal pengesahan padam (elak guna confirm() bawaan WebView)
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleFolder = (folderId: string) => {
    setCollapsedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    onCreateFile(newItemName.trim(), isCreating === 'folder', null);
    setNewItemName('');
    setIsCreating(null);
  };

  const handleRenameSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editingName.trim()) return;
    onRenameFile(id, editingName.trim());
    setEditingId(null);
    setEditingName('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    const filePromises = Array.from(uploadedFiles).map((file) => {
      return new Promise<{ name: string; content: string }>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            name: file.name,
            content: (reader.result as string) || '',
          });
        };
        reader.readAsText(file);
      });
    });

    Promise.all(filePromises).then((results) => {
      onImportFiles(results);
      if (fileInputRef.current) fileInputRef.current.value = '';
    });
  };

  const confirmDelete = () => {
    if (fileToDelete) {
      onDeleteFile(fileToDelete.id);
      setFileToDelete(null);
    }
  };

  const getFileIcon = (file: FileItem) => {
    if (file.isFolder) {
      const isCollapsed = collapsedFolders[file.id];
      return isCollapsed ? (
        <Folder size={16} className="text-amber-400 shrink-0" />
      ) : (
        <Folder size={16} className="text-amber-300 shrink-0" />
      );
    }

    const lang = file.language || detectLanguage(file.name);
    switch (lang) {
      case 'html':
        return <FileCode size={16} className="text-orange-400 shrink-0" />;
      case 'css':
        return <FileCode size={16} className="text-sky-400 shrink-0" />;
      case 'javascript':
      case 'typescript':
        return <FileCode size={16} className="text-yellow-400 shrink-0" />;
      case 'json':
        return <FileCode size={16} className="text-emerald-400 shrink-0" />;
      case 'python':
        return <FileCode size={16} className="text-blue-400 shrink-0" />;
      case 'markdown':
        return <FileCode size={16} className="text-purple-400 shrink-0" />;
      default:
        return <FileCode size={16} className="text-slate-400 shrink-0" />;
    }
  };

  return (
    <>
      {/* Lapisan Tirai Paparan Telefon */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Bekas Bar Sisi (Sidebar) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-68 md:w-64 border-r flex flex-col shrink-0 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:hidden'
        }`}
        style={{
          backgroundColor: theme.sidebarBg,
          borderColor: theme.borderColor,
        }}
      >
        {/* Header Penjelajah */}
        <div
          className="flex items-center justify-between px-3 h-11 border-b select-none shrink-0"
          style={{ borderColor: theme.borderColor }}
        >
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
            Penjelajah Fail
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setIsCreating('file');
                setNewItemName('');
              }}
              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Cipta Fail Baharu"
            >
              <FilePlus size={15} />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating('folder');
                setNewItemName('');
              }}
              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Cipta Folder Baharu"
            >
              <FolderPlus size={15} />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Muat Naik / Import Fail"
            >
              <Upload size={15} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white md:hidden"
              title="Tutup Panel"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          multiple
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Bar Input Cipta Item Baharu */}
        {isCreating && (
          <form
            onSubmit={handleCreateSubmit}
            className="p-2 border-b flex items-center gap-1.5"
            style={{ borderColor: theme.borderColor }}
          >
            {isCreating === 'folder' ? (
              <Folder size={15} className="text-amber-400 shrink-0" />
            ) : (
              <FileCode size={15} className="text-slate-400 shrink-0" />
            )}
            <input
              type="text"
              autoFocus
              placeholder={isCreating === 'folder' ? 'nama-folder' : 'nama-fail.ext'}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsCreating(null);
              }}
              className="w-full text-xs bg-black/20 border border-slate-600 rounded px-1.5 py-1 text-white focus:outline-hidden focus:border-sky-400"
            />
            <button
              type="submit"
              className="text-[10px] bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold px-2 py-1 rounded"
            >
              OK
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(null)}
              className="text-[10px] text-slate-400 hover:text-white px-1.5 py-1"
            >
              Batal
            </button>
          </form>
        )}

        {/* Senarai Hierarki Fail */}
        <div className="flex-1 overflow-y-auto py-1 text-xs select-none">
          {files.map((file) => {
            const isActive = file.id === activeFileId;
            const isEditing = editingId === file.id;

            return (
              <div
                key={file.id}
                className="group relative flex items-center justify-between px-3 py-1.5 cursor-pointer transition-colors"
                style={{
                  backgroundColor: isActive
                    ? 'rgba(56, 189, 248, 0.12)'
                    : 'transparent',
                  color: isActive ? theme.accentColor : theme.textColor,
                }}
                onClick={() => {
                  if (file.isFolder) {
                    toggleFolder(file.id);
                  } else {
                    onSelectFile(file.id);
                  }
                }}
              >
                <div className="flex items-center gap-2 truncate flex-1 mr-1">
                  {file.isFolder && (
                    <span className="text-slate-500">
                      {collapsedFolders[file.id] ? (
                        <ChevronRight size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </span>
                  )}
                  {getFileIcon(file)}

                  {isEditing ? (
                    <form
                      onSubmit={(e) => handleRenameSubmit(e, file.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 flex items-center gap-1"
                    >
                      <input
                        type="text"
                        autoFocus
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => setEditingId(null)}
                        className="w-full text-xs bg-black/40 border border-sky-400 rounded px-1 py-0.5 text-white"
                      />
                    </form>
                  ) : (
                    <span className="truncate font-mono">{file.name}</span>
                  )}

                  {file.isUnsaved && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  )}
                </div>

                {/* Butang tindakan - Nampak di mobile, hover di desktop */}
                <div
                  className="flex items-center gap-0.5 opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {!file.isFolder && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadSingleFile(file);
                      }}
                      className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white"
                      title="Muat Turun Fail Ini"
                    >
                      <Download size={13} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(file.id);
                      setEditingName(file.name);
                    }}
                    className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white"
                    title="Tukar Nama"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFileToDelete(file);
                    }}
                    className="p-1 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400"
                    title="Padam"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Maklumat Bawah Penjelajah */}
        <div
          className="p-2.5 border-t text-[11px] text-slate-500 flex items-center justify-between"
          style={{ borderColor: theme.borderColor }}
        >
          <span>{files.filter((f) => !f.isFolder).length} Fail</span>
          <span className="font-mono text-[10px] text-slate-600">NoteMy v2.0</span>
        </div>
      </aside>

      {/* Modal Pengesahan Padam (Khas untuk Android WebView & Browser) */}
      {fileToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-100"
          onClick={() => setFileToDelete(null)}
        >
          <div
            className="w-full max-w-xs p-4 rounded-2xl border shadow-2xl space-y-3"
            style={{
              backgroundColor: theme.appBarBg,
              borderColor: theme.borderColor,
              color: theme.textColor,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
              <AlertTriangle size={17} />
              <span>Padam {fileToDelete.isFolder ? 'Folder' : 'Fail'}?</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Kau pasti mau padam <span className="font-mono text-sky-400 font-bold">{fileToDelete.name}</span>? Tindakan ni inda boleh dibatalkan.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-red-500 hover:bg-red-600 text-white shadow-md active:scale-95 transition-all"
              >
                Padam
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
