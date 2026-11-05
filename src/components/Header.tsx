import React from 'react';
import {
  GraduationCap,
  BookOpen,
  FileText,
  History,
  ShieldCheck,
  Sparkles,
  Upload,
  Download,
} from 'lucide-react';

interface HeaderProps {
  onOpenHistory: () => void;
  onOpenEthics: () => void;
  onOpenAuditLog: () => void;
  onExportProjectBackup: () => void;
  onImportProjectBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
  savedCount: number;
  auditCount: number;
  sticky?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHistory,
  onOpenEthics,
  onOpenAuditLog,
  onExportProjectBackup,
  onImportProjectBackup,
  savedCount,
  auditCount,
  sticky = true,
}) => {
  return (
    <header className={`${sticky ? 'sticky top-0' : 'relative'} z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#1E3A5F] via-[#0284C7] to-[#38BDF8] flex items-center justify-center text-white shadow-md shadow-sky-100 shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-base sm:text-xl text-[#1E3A5F] tracking-tight truncate">
                  A K S A R A
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0F9FF] text-[#0284C7] border border-sky-200 shrink-0">
                  <Sparkles className="w-3 h-3 text-[#38BDF8]" /> D3 – S3 Terpadu
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block truncate">
                Aplikasi Kendali Skripsi, Tugas Akhir, & Riset Akademik
              </p>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Backup JSON import/export */}
            <label
              className="cursor-pointer inline-flex items-center gap-1 p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all"
              title="Impor cadangan proyek (.json)"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Impor</span>
              <input
                type="file"
                accept=".json"
                onChange={onImportProjectBackup}
                className="hidden"
              />
            </label>

            <button
              onClick={onExportProjectBackup}
              type="button"
              className="inline-flex items-center gap-1 p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
              title="Unduh cadangan proyek permanen (.json)"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Ekspor</span>
            </button>

            <button
              onClick={onOpenAuditLog}
              type="button"
              className="inline-flex items-center gap-1 sm:gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-sky-800 bg-sky-50/80 hover:bg-sky-100 border border-sky-200 transition-all cursor-pointer"
              title="Catatan integritas dan transparansi pemanggilan AI"
            >
              <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
              <span className="hidden md:inline">Log AI</span>
              {auditCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-sky-200/80 text-sky-900">
                  {auditCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenEthics}
              type="button"
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-[#1E3A5F] hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
              title="Panduan etika penelitian dan standar Dikti"
            >
              <span>Etika Riset</span>
            </button>

            <button
              onClick={onOpenHistory}
              type="button"
              className="relative inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#1E3A5F] bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer"
            >
              <History className="w-4 h-4 text-sky-600 shrink-0" />
              <span className="hidden xs:inline">Proyek</span>
              {savedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#1E3A5F] text-white">
                  {savedCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
