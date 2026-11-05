import React, { useState } from 'react';
import {
  BookOpenCheck,
  BookOpen,
  X,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Sparkles,
  Search,
} from 'lucide-react';
import {
  CitationMatchItem,
  crossCheckCitationsWithBibliography,
} from '../../utils/academicRules.ts';

export type CitationFilterTab = 'all' | 'missing' | 'matched';

export interface CitationScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  citationAuditReport: ReturnType<typeof crossCheckCitationsWithBibliography>;
  citationFilterTab: CitationFilterTab;
  setCitationFilterTab: (tab: CitationFilterTab) => void;
  selectedCitationItem?: CitationMatchItem | null;
  setSelectedCitationItem?: (item: CitationMatchItem | null) => void;
  handleAddSingleCitation: (item: CitationMatchItem) => void;
  handleAddAllMissingCitations: () => void;
}

export const CitationScannerModal: React.FC<CitationScannerModalProps> = ({
  isOpen,
  onClose,
  citationAuditReport,
  citationFilterTab,
  setCitationFilterTab,
  setSelectedCitationItem,
  handleAddSingleCitation,
  handleAddAllMissingCitations,
}) => {
  const [citationSearchQuery, setCitationSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92dvh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 shrink-0">
              <BookOpenCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Pemindai Sitasi & Keselarasan Daftar Pustaka
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/30 border border-sky-400/30 text-[10px] font-mono text-sky-200 uppercase">
                  APA 7th Edition
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Memastikan setiap kutipan dalam teks (<em>in-text citation</em>) memiliki rujukan lengkap pada Daftar Pustaka.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (setSelectedCitationItem) setSelectedCitationItem(null);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metrics Dashboard */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 block">Total Sitasi Teks</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-slate-900">{citationAuditReport.totalCitations}</span>
                <span className="text-xs text-slate-500 font-medium">Kutipan</span>
              </div>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 block">Peneliti / Ahli</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-slate-900">{citationAuditReport.uniqueAuthorsCount}</span>
                <span className="text-xs text-slate-500 font-medium">Orang</span>
              </div>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 block">Entri Daftar Pustaka</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-slate-900">{citationAuditReport.bibliographyEntriesCount}</span>
                <span className="text-xs text-slate-500 font-medium">Sumber</span>
              </div>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 block">Tingkat Keselarasan</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className={`text-xl font-black ${
                  citationAuditReport.matchRate === 100
                    ? 'text-emerald-600'
                    : citationAuditReport.matchRate >= 70
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}>
                  {citationAuditReport.matchRate}%
                </span>
                <span className="text-xs text-slate-500 font-medium">Cocok</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    citationAuditReport.matchRate === 100
                      ? 'bg-emerald-500'
                      : citationAuditReport.matchRate >= 70
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${citationAuditReport.matchRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Status Notice & Bulk Actions */}
          {!citationAuditReport.hasBibliographySection ? (
            <div className="mt-3 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Bagian Daftar Pustaka Belum Ada:</strong> Naskah saat ini belum memiliki bagian <code>## DAFTAR PUSTAKA</code>. Anda dapat membuatnya dan menambahkan seluruh rujukan sekaligus.
                </div>
              </div>
              {citationAuditReport.matches.length > 0 && (
                <button
                  type="button"
                  onClick={handleAddAllMissingCitations}
                  className="px-3 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer self-start sm:self-center"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Buat Daftar Pustaka Otomatis</span>
                </button>
              )}
            </div>
          ) : citationAuditReport.missingFromBibliography.length > 0 ? (
            <div className="mt-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-rose-900">
                    {citationAuditReport.missingFromBibliography.length} Sitasi Belum Terdaftar di Daftar Pustaka:
                  </strong>{' '}
                  Kutipan dalam teks di bawah ini belum memiliki entri bibliografi yang cocok. Klik tombol untuk melengkapi otomatis.
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddAllMissingCitations}
                className="px-3.5 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-all flex items-center gap-1.5 shrink-0 shadow-2xs hover:shadow-xs cursor-pointer self-start sm:self-center"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>Lengkapi Semua ({citationAuditReport.missingFromBibliography.length}) Sitasi</span>
              </button>
            </div>
          ) : (
            <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Sempurna!</strong> Seluruh {citationAuditReport.totalCitations} sitasi dalam teks telah selaras dan terdaftar dengan baik di bagian Daftar Pustaka.
              </span>
            </div>
          )}
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="p-3 sm:px-5 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setCitationFilterTab('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                citationFilterTab === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({citationAuditReport.matches.length})
            </button>
            <button
              type="button"
              onClick={() => setCitationFilterTab('missing')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                citationFilterTab === 'missing'
                  ? 'bg-white text-rose-700 shadow-2xs'
                  : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              <span>Belum Terdaftar</span>
              {citationAuditReport.missingFromBibliography.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-[10px] font-bold text-rose-800">
                  {citationAuditReport.missingFromBibliography.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setCitationFilterTab('matched')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                citationFilterTab === 'matched'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <span>Sudah Terdaftar</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
                {citationAuditReport.matches.filter((m) => m.isMatched).length}
              </span>
            </button>
          </div>

          {/* Search input */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={citationSearchQuery}
              onChange={(e) => setCitationSearchQuery(e.target.value)}
              placeholder="Cari nama penulis atau tahun..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:bg-white transition-all text-slate-800"
            />
            {citationSearchQuery && (
              <button
                type="button"
                onClick={() => setCitationSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Citations List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 bg-slate-50/50">
          {citationAuditReport.matches.length === 0 ? (
            <div className="text-center py-12 p-6 bg-white rounded-2xl border border-dashed border-slate-300">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Belum Ada Sitasi Terdeteksi</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Sistem memindai kutipan dengan format standar nama-tahun seperti <code>(Sugiyono, 2021)</code> atau <code>Menurut Arikunto (2019)</code>.
              </p>
            </div>
          ) : (
            (() => {
              let filtered = citationAuditReport.matches;
              if (citationFilterTab === 'missing') {
                filtered = filtered.filter((m) => !m.isMatched);
              } else if (citationFilterTab === 'matched') {
                filtered = filtered.filter((m) => m.isMatched);
              }
              if (citationSearchQuery.trim()) {
                const q = citationSearchQuery.toLowerCase();
                filtered = filtered.filter(
                  (m) =>
                    m.rawCitation.toLowerCase().includes(q) ||
                    m.authorOrRef.toLowerCase().includes(q) ||
                    (m.year && m.year.includes(q)) ||
                    (m.matchedBibEntry && m.matchedBibEntry.toLowerCase().includes(q)) ||
                    (m.suggestedBibEntry && m.suggestedBibEntry.toLowerCase().includes(q))
                );
              }

              if (filtered.length === 0) {
                return (
                  <div className="text-center py-8 p-4 bg-white rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-500">Tidak ada sitasi yang cocok dengan kriteria filter/pencarian Anda.</p>
                  </div>
                );
              }

              return filtered.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    !item.isMatched
                      ? 'bg-rose-50/60 border-rose-300 shadow-xs'
                      : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 space-y-1.5">
                      {/* Title & Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 font-serif text-sm tracking-tight">
                          {item.rawCitation}
                        </span>
                        <span className="text-[10px] font-sans font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {item.citationType === 'narrative' ? 'Sitasi Naratif' : 'Sitasi Parentetikal'}
                        </span>
                        <span
                          className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded-full ${
                            item.isMatched
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {item.isMatched ? '✓ Ada di Daftar Pustaka' : '⚠️ Belum Terdaftar'}
                        </span>
                      </div>

                      {/* Context Sentence Snippet */}
                      {item.contextSnippet && (
                        <div className="p-2 bg-white/70 rounded-lg border border-slate-200/80 text-[11px] text-slate-600 font-sans">
                          <span className="text-slate-400 font-medium block text-[9px] uppercase tracking-wider mb-0.5">
                            Konteks Kalimat dalam Naskah:
                          </span>
                          <span className="italic">"{item.contextSnippet}"</span>
                        </div>
                      )}

                      {/* Matched or Suggested Bibliography Entry */}
                      {item.isMatched && item.matchedBibEntry && (
                        <div className="p-2.5 bg-emerald-50/70 rounded-lg border border-emerald-200 text-[11px] text-emerald-950 font-serif">
                          <span className="text-emerald-700 font-sans font-bold block text-[9px] uppercase tracking-wider mb-0.5">
                            Entri Terdaftar di Daftar Pustaka:
                          </span>
                          <span>{item.matchedBibEntry}</span>
                        </div>
                      )}

                      {!item.isMatched && item.suggestedBibEntry && (
                        <div className="p-2.5 bg-white rounded-lg border border-rose-200 text-[11px] text-slate-800 font-serif shadow-2xs">
                          <span className="text-rose-700 font-sans font-bold block text-[9px] uppercase tracking-wider mb-0.5">
                            Rekomendasi Format APA 7th (Siap Ditambahkan):
                          </span>
                          <span>{item.suggestedBibEntry}</span>
                        </div>
                      )}
                    </div>

                    {/* Individual Action Button */}
                    {!item.isMatched && (
                      <button
                        type="button"
                        onClick={() => handleAddSingleCitation(item)}
                        className="px-3.5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-all flex items-center gap-1.5 shrink-0 shadow-2xs hover:shadow-xs cursor-pointer self-start sm:self-center"
                        title="Tambahkan entri ini ke bagian ## DAFTAR PUSTAKA"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambahkan ke Pustaka</span>
                      </button>
                    )}
                  </div>
                </div>
              ));
            })()
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Pemeriksaan sitasi otomatis mendeteksi kutipan nama-tahun (EYD V & APA 7th).
          </span>
          <div className="flex items-center gap-2">
            {citationAuditReport.missingFromBibliography.length > 0 && (
              <button
                type="button"
                onClick={handleAddAllMissingCitations}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Lengkapi Semua ({citationAuditReport.missingFromBibliography.length}) Sitasi</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (setSelectedCitationItem) setSelectedCitationItem(null);
              }}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
