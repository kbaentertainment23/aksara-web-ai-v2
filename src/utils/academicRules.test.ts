import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateAcademicForm,
  calculateAcademicStats,
  recommendMethodologyHeuristics,
  parseAcademicMarkdown,
  detectAcademicCliches,
  evaluateAcademicQuality,
  auditResearchConsistency,
  performInternalEditorialPolish,
  splitPreliminaryPagesAndBody,
  insertOrReplacePreliminaryPage,
  removePreliminarySheet,
  generatePreliminaryPagesText,
  cleanAcademicMarkdownSymbols,
} from './academicRules.ts';

test('validateAcademicForm rejects empty form with clear errors', () => {
  const result = validateAcademicForm({});
  assert.equal(result.isValid, false);
  assert.ok(result.errors.jobType);
  assert.ok(result.errors.degreeLevel);
  assert.ok(result.errors.studyProgramCategory);
  assert.ok(result.errors.topic);
});

test('validateAcademicForm requires custom degree and prodi when Lainnya selected', () => {
  const result = validateAcademicForm({
    jobType: 'bab_1',
    degreeLevel: 'Lainnya',
    customDegree: '',
    studyProgramCategory: 'Lainnya',
    studyProgramName: '',
    topic: 'Studi Literasi Digital',
  });
  assert.equal(result.isValid, false);
  assert.ok(result.errors.customDegree);
  assert.ok(result.errors.studyProgramName);
});

test('validateAcademicForm requires supervisor comments for supervisor_revision job', () => {
  const result = validateAcademicForm({
    jobType: 'supervisor_revision',
    degreeLevel: 'S1',
    studyProgramCategory: 'Informatika dan ilmu komputer',
    studyProgramName: 'Teknik Informatika',
    topic: 'Optimasi Model NLP',
  });
  assert.equal(result.isValid, false);
  assert.ok(result.errors.supervisorComments);
});

test('validateAcademicForm approves valid submission and adds S2/S3 advisory warnings', () => {
  const result = validateAcademicForm({
    jobType: 'bab_1',
    degreeLevel: 'S2',
    studyProgramCategory: 'Ekonomi dan bisnis',
    studyProgramName: 'Magister Manajemen',
    topic: 'Pengaruh Kepemimpinan Transformasional Terhadap Kinerja Karyawan',
  });
  assert.equal(result.isValid, true);
  assert.ok(result.warnings.length > 0);
});

test('calculateAcademicStats accurately counts words, estimated pages, and reference markers', () => {
  const sampleAcademicText = `
    BAB I PENDAHULUAN
    
    Latar belakang penelitian ini menyoroti pergeseran tren kerja fleksibel terhadap komitmen afektif organisasi.
    Penelitian ini sejalan dengan temuan terdahulu [REFERENSI DIPERLUKAN: Studi komitmen organisasi 2023].
    
    Tujuan penelitian adalah menganalisis variabel laten secara empiris.
  `;
  const stats = calculateAcademicStats(sampleAcademicText);
  assert.ok(stats.wordCount > 15);
  assert.equal(stats.hasReferenceMarkers, true);
  assert.equal(stats.referenceMarkersCount, 1);
  assert.ok(stats.estimatedPages >= 1);
});

test('recommendMethodologyHeuristics recommends quantitative for influence/relationship topics', () => {
  const result = recommendMethodologyHeuristics({
    topic: 'Analisis Pengaruh Literasi Keuangan Terhadap Perilaku Investasi',
    identifiedProblem: 'Terdapat korelasi yang belum konsisten dalam pengujian empiris',
  });
  assert.ok(result.recommendedMethod.includes('Kuantitatif'));
});

test('parseAcademicMarkdown parses headings and bullet items correctly', () => {
  const markdown = `# BAB I PENDAHULUAN\n## 1.1 Latar Belakang Masalah\nPenelitian ini berfokus pada fenomena modern.\n- Poin pertama\n- Poin kedua`;
  const sections = parseAcademicMarkdown(markdown);
  assert.equal(sections.length, 5);
  assert.equal(sections[0].type, 'h1');
  assert.equal(sections[1].type, 'h2');
  assert.equal(sections[2].type, 'paragraph');
  assert.equal(sections[3].type, 'bullet');
  assert.equal(sections[4].type, 'bullet');
});

test('parseAcademicMarkdown correctly identifies 4-pillar headings including Research Gap', () => {
  const academicPillarsMarkdown = `
# BAB I PENDAHULUAN
## 1.1 Latar Belakang Masalah
### 1.1.1 Kondisi Ideal dan Landasan Normatif (Ideal Condition / Das Sollen)
Pemaparan teori dan standar keilmuan.
### 1.1.2 Kesenjangan Empiris dan Fakta Lapangan (Empirical Gap / Das Sein)
Fakta observasi lapangan.
### 1.1.3 Kesenjangan Penelitian (Research Gap & State of the Art)
Telaah kritis studi terdahulu dan gap literatur.
### 1.1.4 Urgensi Penelitian dan Solusi yang Diusulkan (Urgency & Proposed Solution)
Justifikasi kebaruan dan model solusi.
  `;
  const sections = parseAcademicMarkdown(academicPillarsMarkdown);
  const headings = sections.filter(s => s.type === 'h3');
  assert.equal(headings.length, 4);
  assert.ok(headings.some(h => h.content.includes('Research Gap')));
  assert.ok(headings.some(h => h.content.includes('Ideal Condition')));
  assert.ok(headings.some(h => h.content.includes('Empirical Gap')));
  assert.ok(headings.some(h => h.content.includes('Urgency & Proposed Solution')));
});

test('detectAcademicCliches finds robotic and cliché phrases with suggestions', () => {
  const sampleWithCliche = `
    Dalam era globalisasi saat ini, perkembangan zaman yang semakin pesat menuntut adaptasi.
    Tidak dapat dipungkiri bahwa hal ini sangat penting sekali untuk diperhatikan.
  `;
  const cliches = detectAcademicCliches(sampleWithCliche);
  assert.ok(cliches.length >= 3);
  assert.ok(cliches.some(c => c.phrase.includes('era globalisasi')));
  assert.ok(cliches.some(c => c.phrase.includes('perkembangan zaman')));
  assert.ok(cliches.some(c => c.phrase.includes('sangat penting sekali')));
});

test('performInternalEditorialPolish replaces tautologies and cliches cleanly', () => {
  const rawText = 'Dalam era globalisasi saat ini, masalah ini disebabkan karena kurangnya kesiapan. Agar supaya tujuan daripada kajian ini tercapai, hal ini sangat penting sekali ditelaah.';
  const { polishedText, report } = performInternalEditorialPolish(rawText, {
    studyProgramName: 'Teknik Informatika',
  });

  assert.equal(polishedText.includes('era globalisasi saat ini'), false);
  assert.equal(polishedText.includes('disebabkan karena'), false);
  assert.equal(polishedText.includes('agar supaya'), false);
  assert.equal(polishedText.includes('tujuan daripada'), false);
  assert.equal(polishedText.includes('sangat penting sekali'), false);
  assert.ok(report.changesCount >= 4);
  assert.ok(report.tautologiesFixedCount >= 3);
});

test('evaluateAcademicQuality rates clean 4-pillar text high and calculates sentence variation', () => {
  const cleanAcademicText = `
    ### Kondisi Ideal dan Landasan Normatif (Das Sollen)
    Secara normatif, teori efisiensi institusi menuntut tata kelola yang transparan dan akuntabel. Hal ini menjadi fondasi utama.
    
    ### Kesenjangan Empiris dan Fakta Lapangan (Das Sein)
    Observasi lapangan menunjukkan adanya disparitas produktivitas sebesar [DATA SPESIFIK DIPERLUKAN: Persentase penurunan]. Realitas ini menuntut evaluasi menyeluruh.
    
    ### Kesenjangan Penelitian (Research Gap & State of the Art)
    Kajian literatur 5 tahun terakhir memperlihatkan conflicting empirical findings antarpeneliti.
    
    ### Urgensi Penelitian dan Solusi yang Diusulkan (Novelty)
    Penelitian ini menyajikan kebaruan melalui model intervensi struktural terintegrasi. Pendekatan ini dapat direplikasi.
  `;
  const report = evaluateAcademicQuality(cleanAcademicText);
  assert.ok(report.overallScore >= 75);
  assert.ok(report.sentenceVariationScore >= 60);
  assert.equal(report.fourPillarsDetected.idealCondition, true);
  assert.equal(report.fourPillarsDetected.empiricalGap, true);
  assert.equal(report.fourPillarsDetected.researchGap, true);
  assert.equal(report.fourPillarsDetected.proposedSolution, true);
  assert.equal(report.dataPlaceholders.count, 1);
});

test('auditResearchConsistency correctly validates alignment between title, variables, and methodology', () => {
  const report = auditResearchConsistency(
    {
      degreeLevel: 'S1',
      tentativeTitle: 'Pengaruh Kepemimpinan dan Komitmen Terhadap Kinerja',
      variables: 'Kepemimpinan, Komitmen, Kinerja',
      methodologyApproach: 'kuantitatif',
    },
    `
      Naskah ini menguji signifikansi variabel kepemimpinan dan komitmen terhadap kinerja.
      Penelitian menggunakan teknik analisis sampel kuantitatif dengan uji reliabilitas.
      Kesenjangan penelitian (research gap) ini ditutup dengan solusi model evaluasi baru.
    `
  );
  assert.ok(report.alignmentScore >= 80);
  assert.equal(report.isThreadConsistent, true);
  assert.ok(report.checks.some(c => c.element.includes('Variabel Operasional') && c.status === 'sesuai'));
});

test('classifyGeminiError correctly identifies 503 as transient and retryable', async () => {
  const { classifyGeminiError } = await import('../../server.ts');
  
  const err503 = new Error('[GoogleGenAIError: 503 UNAVAILABLE] The model is overloaded. Please try again later.');
  const res = classifyGeminiError(err503);
  assert.equal(res.category, 'transient');
  assert.equal(res.subCategory, 'model_overloaded');
  assert.equal(res.isRetryable, true);
  assert.ok(res.message.includes('503 UNAVAILABLE'));
});

test('classifyGeminiError correctly flags 503 high demand spike for fast failover', async () => {
  const { classifyGeminiError } = await import('../../server.ts');

  const userReportedError = {
    status: 503,
    message: '{"error":{"code":503,"message":"This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.","status":"UNAVAILABLE"}}',
  };
  const res = classifyGeminiError(userReportedError);
  assert.equal(res.category, 'transient');
  assert.equal(res.subCategory, 'model_overloaded');
  assert.equal(res.isRetryable, true);
  assert.equal(res.isDailyQuota, false);
});

test('classifyGeminiError correctly identifies 429 as rate limit and not blindly retryable', async () => {
  const { classifyGeminiError } = await import('../../server.ts');
  
  const err429 = { status: 429, message: 'RESOURCE_EXHAUSTED: quota exceeded' };
  const res = classifyGeminiError(err429);
  assert.equal(res.category, 'rate_limit');
  assert.equal(res.isRetryable, false);
});

test('classifyGeminiError correctly identifies 400 as permanent configuration error', async () => {
  const { classifyGeminiError } = await import('../../server.ts');
  
  const err400 = { status: 400, message: 'INVALID_ARGUMENT: Invalid parameter value' };
  const res = classifyGeminiError(err400);
  assert.equal(res.category, 'permanent');
  assert.equal(res.isRetryable, false);
});

test('evaluateAcademicQuality rates organic flowing essay without subheadings with 4-pillars detected', () => {
  const organicEssay = `
    Dinamika keilmuan dan perkembangan tata kelola operasional dalam bidang Teknik Informatika saat ini menghadapi tuntutan adaptasi yang kian kompleks. Dalam konteks tersebut, penerapan sistem cerdas memegang peranan krusial sebagai fondasi dalam menjaga mutu layanan. Secara normatif, kerangka teoretis menghendaki adanya standar ideal keilmuan yang teruji.

    Namun demikian, realitas operasional di lapangan kerap memperlihatkan kendala empiris yang nyata pada RSUD Kota. Di tengah tingginya beban aktivitas harian, proses kerja masih diwarnai oleh anomali dan disparitas hasil kerja yang memicu inefisiensi [DATA SPESIFIK DIPERLUKAN: Data observasi].

    Ditinjau dari perspektif keilmuan, sintesis kritis terhadap literatur terdahulu memperlihatkan adanya kesenjangan penelitian (research gap) dan inkonsistensi temuan antarpeneliti. Sebagian studi berfokus pada hardware, sementara faktor kesiapan kognitif terabaikan.

    Menjawab kesenjangan tersebut, penelitian ini memiliki urgensi akademis yang nyata untuk menghadirkan kebaruan (novelty) dan solusi yang diusulkan melalui pendekatan metodologis terstruktur.
  `;
  const report = evaluateAcademicQuality(organicEssay);
  assert.ok(report.overallScore >= 75);
  assert.equal(report.fourPillarsDetected.idealCondition, true);
  assert.equal(report.fourPillarsDetected.empiricalGap, true);
  assert.equal(report.fourPillarsDetected.researchGap, true);
  assert.equal(report.fourPillarsDetected.proposedSolution, true);
});

test('performInternalEditorialPolish auto-strips mechanical 1.1.1 subheadings into flowing essay', () => {
  const mechanicalText = `
## 1.1 Latar Belakang Masalah

### 1.1.1 Kondisi Ideal dan Landasan Normatif (Ideal Condition / Das Sollen)
Pemaparan kondisi ideal.

### 1.1.2 Kesenjangan Empiris dan Fakta Lapangan (Empirical Gap / Das Sein)
Pemaparan fakta lapangan.
  `;
  const { polishedText, report } = performInternalEditorialPolish(mechanicalText, {});
  assert.equal(polishedText.includes('### 1.1.1'), false);
  assert.equal(polishedText.includes('### 1.1.2'), false);
  assert.ok(report.changesCount >= 1);
});

test('classifyGeminiError correctly distinguishes daily quota exhaustion from burst rate limit', async () => {
  const { classifyGeminiError } = await import('../../server.ts');

  // Daily quota error
  const dailyErr = {
    status: 429,
    message: "RESOURCE_EXHAUSTED: Quota exceeded for quota metric 'Queries' and limit 'Queries per day' of service 'generativelanguage.googleapis.com'",
  };
  const dailyRes = classifyGeminiError(dailyErr);
  assert.equal(dailyRes.category, 'rate_limit');
  assert.equal(dailyRes.isDailyQuota, true);
  assert.equal(dailyRes.isRetryable, false);
  assert.equal(dailyRes.subCategory, 'quota_exhausted_daily');
  assert.ok(dailyRes.message.includes('kuota harian gratis'));

  // Burst rate limit error (e.g. RPM spike without daily quota)
  const burstErr = {
    status: 429,
    message: 'Too Many Requests: Rate limit exceeded (15 RPM)',
  };
  const burstRes = classifyGeminiError(burstErr);
  assert.equal(burstRes.category, 'rate_limit');
  assert.equal(burstRes.isDailyQuota, false);
  assert.equal(burstRes.isRetryable, true);
  assert.equal(burstRes.subCategory, 'rate_limit_burst');
});

test('computeCacheKey produces deterministic signatures for prompt deduplication', async () => {
  const { computeCacheKey, CHAPTER_SPECS } = await import('../../server.ts');

  const key1 = computeCacheKey({
    degreeLevel: 'S1',
    topic: 'Machine Learning untuk Deteksi Penyakit',
    jobType: 'bab_1',
  });
  const key2 = computeCacheKey({
    degreeLevel: 'S1',
    topic: 'Machine Learning untuk Deteksi Penyakit',
    jobType: 'bab_1',
  });
  assert.equal(key1, key2);
  assert.equal(CHAPTER_SPECS.length, 5);
  assert.equal(CHAPTER_SPECS[0].id, 'bab_1');
  assert.equal(CHAPTER_SPECS[4].id, 'bab_5');
});

test('parseCsvData correctly parses raw CSV with headers and quoted cells', async () => {
  const { parseCsvData } = await import('./academicRules.ts');

  const rawCsv = `No,Variabel_X,Variabel_Y,Kategori
1,4.5,4.8,"Kategori A"
2,3.5,3.8,"Kategori B"
3,4.0,4.2,"Kategori A"`;

  const parsed = parseCsvData(rawCsv);
  assert.equal(parsed.totalRows, 3);
  assert.equal(parsed.headers.length, 4);
  assert.ok(parsed.numericColumns.includes('Variabel_X'));
  assert.ok(parsed.numericColumns.includes('Variabel_Y'));
  assert.equal(parsed.rows[0].Variabel_X, 4.5);
  assert.equal(parsed.rows[1].Variabel_Y, 3.8);
});

test('computeDescriptiveStatistics accurately computes mean, median, min, max, and stdDev', async () => {
  const { computeDescriptiveStatistics } = await import('./academicRules.ts');

  const rows = [
    { Score: 10 },
    { Score: 20 },
    { Score: 30 },
    { Score: 40 },
    { Score: 50 },
  ];
  const stats = computeDescriptiveStatistics(rows, ['Score']);
  assert.ok(stats.Score);
  assert.equal(stats.Score.mean, 30);
  assert.equal(stats.Score.median, 30);
  assert.equal(stats.Score.min, 10);
  assert.equal(stats.Score.max, 50);
  assert.equal(stats.Score.stdDev, 15.81);
});

test('computePearsonCorrelation correctly calculates correlation r and strength', async () => {
  const { computePearsonCorrelation } = await import('./academicRules.ts');

  const x = [1, 2, 3, 4, 5];
  const y = [2, 4, 6, 8, 10]; // Perfect positive correlation r = 1.0
  const corr = computePearsonCorrelation(x, y);

  assert.ok(corr);
  assert.equal(corr.r, 1);
  assert.equal(corr.rSquared, 1);
  assert.equal(corr.strength, 'Sangat Kuat');
});

test('verifyDoiFormat identifies valid DOI and rejects invalid strings', async () => {
  const { verifyDoiFormat } = await import('./academicRules.ts');

  const valid1 = verifyDoiFormat('10.1016/j.procs.2023.01.001');
  assert.equal(valid1.isValid, true);
  assert.equal(valid1.normalizedDoi, '10.1016/j.procs.2023.01.001');

  const validUrl = verifyDoiFormat('https://doi.org/10.1109/ACCESS.2022.3180000');
  assert.equal(validUrl.isValid, true);
  assert.equal(validUrl.normalizedDoi, '10.1109/ACCESS.2022.3180000');

  const invalid = verifyDoiFormat('not-a-valid-doi');
  assert.equal(invalid.isValid, false);
});

test('generateLiteratureGapSynthesis synthesizes 4-pillar gaps cleanly', async () => {
  const { generateLiteratureGapSynthesis } = await import('./academicRules.ts');

  const synthesis = generateLiteratureGapSynthesis(
    [
      {
        type: 'empirical',
        description: 'Terdapat divergensi temuan akurasi model pada dataset lokal.',
        howThisStudyAddresses: 'melakukan pengujian multi-lokus dengan standardisasi citra.',
      },
      {
        type: 'methodological',
        description: 'Penelitian terdahulu mengabaikan metrik konsumsi memori komputasi.',
        howThisStudyAddresses: 'mengintegrasikan metrik latensi dan floating-point operations.',
      },
    ],
    'Machine Learning Medis'
  );

  assert.ok(synthesis.includes('Kesenjangan Empiris'));
  assert.ok(synthesis.includes('Kesenjangan Metodologis'));
  assert.ok(synthesis.includes('divergensi temuan'));
});

test('auditChapterCompleteness accurately evaluates Bab I sections against standard checklist', async () => {
  const { auditChapterCompleteness } = await import('./academicRules.ts');

  const bab1Content = `
# BAB I PENDAHULUAN

## 1.1 Latar Belakang Masalah
Kondisi ideal menghendaki tersedianya sistem yang akurat. Namun kesenjangan empiris menunjukkan kendala di lapangan. Urgensi riset ini mengisi gap penelitian terdahulu.

## 1.2 Batasan Masalah
Ruang lingkup penelitian dibatasi pada data 3 tahun terakhir di RSUD.

## 1.3 Rumusan Masalah
1. Apakah terdapat pengaruh signifikan?
2. Bagaimana model klasifikasi bekerja?

## 1.4 Tujuan Penelitian
1. Untuk menguji pengaruh signifikan.
2. Untuk menganalisis kinerja model klasifikasi.

## 1.5 Manfaat Penelitian
Manfaat teoretis bagi ilmu pengetahuan dan manfaat praktis bagi praktisi rumah sakit.
  `;

  const report = auditChapterCompleteness('bab_1', bab1Content);
  assert.equal(report.chapterKey, 'bab_1');
  assert.ok(report.completenessScore >= 80);
  assert.equal(report.isAllWajibFulfilled, true);

  const latarBelakang = report.items.find((i) => i.id === 'latar_belakang');
  assert.ok(latarBelakang?.isDetected);

  const rumusan = report.items.find((i) => i.id === 'rumusan_masalah');
  assert.ok(rumusan?.isDetected);
});

test('crossCheckCitationsWithBibliography identifies matching and missing citations', async () => {
  const { crossCheckCitationsWithBibliography } = await import('./academicRules.ts');

  const draftText = `
Berdasarkan temuan terdahulu (Sugiyono, 2021), metodologi kuantitatif memerlukan instrumen yang teruji. Hal ini diperkuat oleh penelitian lain (Arikunto, 2020) yang menyatakan pentingnya uji validitas. Di samping itu, pendekatan baru (Wibowo, 2024) menawarkan efisiensi komputasi.

## DAFTAR PUSTAKA
Arikunto, S. (2020). Prosedur Penelitian Suatu Pendekatan Praktik. Jakarta: Rineka Cipta.
Sugiyono. (2021). Metode Penelitian Kuantitatif, Kualitatif, dan R&D. Bandung: Alfabeta.
  `;

  const report = crossCheckCitationsWithBibliography(draftText);
  assert.equal(report.hasBibliographySection, true);
  assert.equal(report.totalCitations, 3);
  assert.equal(report.bibliographyEntriesCount, 2);

  // Sugiyono and Arikunto should match
  const sugiyonoMatch = report.matches.find((m) => m.rawCitation.includes('Sugiyono'));
  assert.equal(sugiyonoMatch?.isMatched, true);

  const arikuntoMatch = report.matches.find((m) => m.rawCitation.includes('Arikunto'));
  assert.equal(arikuntoMatch?.isMatched, true);

  // Wibowo is missing from bibliography
  const wibowoMatch = report.matches.find((m) => m.rawCitation.includes('Wibowo'));
  assert.equal(wibowoMatch?.isMatched, false);
  assert.ok(report.missingFromBibliography.includes('(Wibowo, 2024)'));
});

test('generatePreliminaryPagesText creates formatted official cover and approval pages', async () => {
  const { generatePreliminaryPagesText } = await import('./academicRules.ts');

  const mockForm = {
    jobType: 'bab_1',
    degreeLevel: 'S1',
    studyProgramCategory: 'Informatika',
    studyProgramName: 'Teknik Informatika',
    facultyName: 'Fakultas Teknik',
    institutionName: 'Universitas Indonesia',
    studentName: 'Budi Santoso',
    studentId: '202401001',
    advisor1: 'Dr. Ahmad Fauzi, M.Kom.',
    advisor2: 'Siti Rahma, M.T.',
    topic: 'Machine Learning',
    tentativeTitle: 'Implementasi Algoritma Random Forest Untuk Klasifikasi Data',
    methodologyApproach: 'kuantitatif',
    outputFormat: 'docx' as const,
    writingStyle: 'Akademik formal',
  };

  const cover = generatePreliminaryPagesText(mockForm, 'cover_outer');
  assert.ok(cover.includes('IMPLEMENTASI ALGORITMA RANDOM FOREST'));
  assert.ok(cover.includes('BUDI SANTOSO'));
  assert.ok(cover.includes('202401001'));
  assert.ok(cover.includes('UNIVERSITAS INDONESIA'));
  // Ensure NO raw HTML tags or strange markdown code symbols
  assert.equal(cover.includes('<div'), false);
  assert.equal(cover.includes('<br'), false);
  assert.equal(cover.includes('---'), false);

  const approval = generatePreliminaryPagesText(mockForm, 'approval_advisor');
  assert.ok(approval.includes('LEMBAR PERSETUJUAN PEMBIMBING'));
  assert.ok(approval.includes('Dr. Ahmad Fauzi, M.Kom.'));
  assert.ok(approval.includes('Siti Rahma, M.T.'));
  assert.equal(approval.includes('<div'), false);
  assert.equal(approval.includes('| :--- |'), false);

  const examiners = generatePreliminaryPagesText(mockForm, 'approval_examiners');
  assert.ok(examiners.includes('LEMBAR PENGESAHAN PENGUJI'));
  assert.ok(examiners.includes('DEWAN PENGUJI'));

  const statement = generatePreliminaryPagesText(mockForm, 'statement');
  assert.ok(statement.includes('SURAT PERNYATAAN KEASLIAN KARYA ILMIAH'));
  assert.ok(statement.includes('plagiarisme'));
  assert.ok(statement.includes('Materai Tempel Rp 10.000'));
  assert.equal(statement.includes('<div'), false);
  assert.equal(statement.includes('<br'), false);

  // Check degree mappings (S2 -> TESIS & Magister, D3 -> TUGAS AKHIR & Ahli Madya)
  const s2Cover = generatePreliminaryPagesText({ ...mockForm, degreeLevel: 'S2' }, 'cover_outer');
  assert.ok(s2Cover.includes('TESIS'));
  assert.ok(s2Cover.includes('Magister'));

  const d3Cover = generatePreliminaryPagesText({ ...mockForm, degreeLevel: 'D3' }, 'cover_outer');
  assert.ok(d3Cover.includes('TUGAS AKHIR'));
  assert.ok(d3Cover.includes('Ahli Madya'));
});

test('STRUCTURED_STUDY_PROGRAMS_BY_FIELD correctly categorizes fields and supports D3, D4, S1, S2', async () => {
  const { STRUCTURED_STUDY_PROGRAMS_BY_FIELD, ALL_STRUCTURED_STUDY_PROGRAMS } = await import(
    '../data/academicConstants.ts'
  );

  assert.ok(STRUCTURED_STUDY_PROGRAMS_BY_FIELD.length >= 8);
  assert.ok(ALL_STRUCTURED_STUDY_PROGRAMS.length >= 40);

  // Check Engineering field exists
  const engineering = STRUCTURED_STUDY_PROGRAMS_BY_FIELD.find((f) => f.fieldId === 'engineering');
  assert.ok(engineering);
  assert.equal(engineering.fieldName, 'Teknik & Rekayasa');
  assert.ok(engineering.programs.some((p) => p.name === 'Teknik Sipil'));

  // Check health and economics fields
  const health = STRUCTURED_STUDY_PROGRAMS_BY_FIELD.find((f) => f.fieldId === 'health_medicine');
  assert.ok(health);
  assert.ok(health.programs.some((p) => p.name.includes('Keperawatan')));

  // Check degree levels present across programs
  const hasD3 = ALL_STRUCTURED_STUDY_PROGRAMS.some((p) => p.degreeLevels.includes('D3'));
  const hasD4 = ALL_STRUCTURED_STUDY_PROGRAMS.some((p) => p.degreeLevels.includes('D4'));
  const hasS1 = ALL_STRUCTURED_STUDY_PROGRAMS.some((p) => p.degreeLevels.includes('S1'));
  const hasS2 = ALL_STRUCTURED_STUDY_PROGRAMS.some((p) => p.degreeLevels.includes('S2'));

  assert.ok(hasD3, 'Must contain D3 programs');
  assert.ok(hasD4, 'Must contain D4 programs');
  assert.ok(hasS1, 'Must contain S1 programs');
  assert.ok(hasS2, 'Must contain S2 programs');
});

test('searchStudyPrograms accurately filters by query, degree level, and field', async () => {
  const { searchStudyPrograms } = await import('../data/academicConstants.ts');

  // Query search
  const informaticsResults = searchStudyPrograms('informatika');
  assert.ok(informaticsResults.length > 0);
  assert.ok(informaticsResults.some((p) => p.name.toLowerCase().includes('informatika')));

  // Degree filter search
  const d3OnlyResults = searchStudyPrograms('', 'D3');
  assert.ok(d3OnlyResults.length > 0);
  assert.ok(d3OnlyResults.every((p) => p.degreeLevels.includes('D3')));

  // Field filter search
  const lawOnlyResults = searchStudyPrograms('', undefined, 'law');
  assert.ok(lawOnlyResults.length > 0);
  assert.ok(lawOnlyResults.every((p) => p.fieldId === 'law'));

  // Combined search
  const combined = searchStudyPrograms('keperawatan', 'D3', 'health_medicine');
  assert.ok(combined.length > 0);
  assert.ok(combined[0].name.includes('Keperawatan'));
  assert.ok(combined[0].degreeLevels.includes('D3'));
});

test('splitPreliminaryPagesAndBody cleanly extracts preliminary sheets and preserves body content', () => {
  const dummyFormData = {
    jobType: 'bab_1',
    degreeLevel: 'S1',
    studyProgramCategory: 'Informatika',
    studyProgramName: 'Teknik Informatika',
    tentativeTitle: 'Rancang Bangun Sistem Informasi Berbasis Web',
    studentName: 'Budi Santoso',
    studentId: '12345678',
    institutionName: 'Universitas Indonesia',
  } as any;

  const coverText = generatePreliminaryPagesText(dummyFormData, 'cover');
  const bodyText = '# BAB I\nPENDAHULUAN\n\nLatar belakang penelitian ini dimulai dengan...';
  const combinedDoc = `${coverText}\n\n${bodyText}`;

  const { sheets, bodyContent } = splitPreliminaryPagesAndBody(combinedDoc, dummyFormData);

  assert.equal(sheets.length, 1);
  assert.equal(sheets[0].type, 'cover');
  assert.equal(sheets[0].data.studentName, 'Budi Santoso');
  assert.equal(sheets[0].data.studentId, '12345678');
  assert.equal(bodyContent.trim(), bodyText.trim());
  assert.ok(!bodyContent.includes('<!-- LEMBAR_AKADEMIK_START'));
});

test('insertOrReplacePreliminaryPage maintains canonical order and prevents duplicate sheets', () => {
  const dummyFormData = {
    jobType: 'bab_1',
    degreeLevel: 'S1',
    studyProgramCategory: 'Informatika',
    studyProgramName: 'Teknik Informatika',
    tentativeTitle: 'Rancang Bangun Sistem Informasi Berbasis Web',
    studentName: 'Budi Santoso',
    studentId: '12345678',
    institutionName: 'Universitas Indonesia',
  } as any;

  let doc = '# BAB I\nPENDAHULUAN\n\nTeks awal skripsi.';

  // 1. Insert statement first
  const statementText = generatePreliminaryPagesText(dummyFormData, 'statement');
  doc = insertOrReplacePreliminaryPage(doc, 'statement', statementText, dummyFormData);

  // 2. Insert cover (should go before statement in canonical order)
  const coverText = generatePreliminaryPagesText(dummyFormData, 'cover');
  doc = insertOrReplacePreliminaryPage(doc, 'cover', coverText, dummyFormData);

  // 3. Insert approval_advisor
  const advisorText = generatePreliminaryPagesText(dummyFormData, 'approval_advisor');
  doc = insertOrReplacePreliminaryPage(doc, 'approval_advisor', advisorText, dummyFormData);

  const { sheets, bodyContent } = splitPreliminaryPagesAndBody(doc, dummyFormData);

  assert.equal(sheets.length, 3);
  assert.equal(sheets[0].type, 'cover');
  assert.equal(sheets[1].type, 'approval_advisor');
  assert.equal(sheets[2].type, 'statement');
  assert.equal(bodyContent.trim(), '# BAB I\nPENDAHULUAN\n\nTeks awal skripsi.');

  // 4. Update cover with modified title (must replace without duplicate)
  const updatedCover = generatePreliminaryPagesText(
    { ...dummyFormData, tentativeTitle: 'Judul Baru Yang Diperbarui' },
    'cover'
  );
  doc = insertOrReplacePreliminaryPage(doc, 'cover', updatedCover, dummyFormData);

  const { sheets: updatedSheets } = splitPreliminaryPagesAndBody(doc, dummyFormData);
  assert.equal(updatedSheets.length, 3, 'Must maintain exactly 3 sheets without duplication');
  assert.equal(updatedSheets[0].type, 'cover');
  assert.equal(updatedSheets[0].data.title, 'JUDUL BARU YANG DIPERBARUI');
});

test('removePreliminarySheet selectively removes target sheet and preserves others', () => {
  const dummyFormData = {
    jobType: 'bab_1',
    degreeLevel: 'S1',
    studyProgramCategory: 'Informatika',
    studyProgramName: 'Teknik Informatika',
    tentativeTitle: 'Sistem Informasi Kampus',
    studentName: 'Budi Santoso',
  } as any;

  // Generate all 4 sheets
  const allSheetsText = generatePreliminaryPagesText(dummyFormData, 'all');
  const bodyText = '# BAB I\nPENDAHULUAN\n\nNaskah bab 1.';
  let doc = `${allSheetsText}\n\n${bodyText}`;

  const initial = splitPreliminaryPagesAndBody(doc, dummyFormData);
  assert.equal(initial.sheets.length, 4);

  // Remove cover only
  doc = removePreliminarySheet(doc, 'cover');
  const afterRemoveCover = splitPreliminaryPagesAndBody(doc, dummyFormData);
  assert.equal(afterRemoveCover.sheets.length, 3);
  assert.ok(!afterRemoveCover.sheets.some((s) => s.type === 'cover'));
  assert.ok(afterRemoveCover.sheets.some((s) => s.type === 'approval_advisor'));
  assert.equal(afterRemoveCover.bodyContent.trim(), bodyText.trim());

  // Remove statement only
  doc = removePreliminarySheet(doc, 'statement');
  const afterRemoveStatement = splitPreliminaryPagesAndBody(doc, dummyFormData);
  assert.equal(afterRemoveStatement.sheets.length, 2);
  assert.ok(!afterRemoveStatement.sheets.some((s) => s.type === 'statement'));
  assert.equal(afterRemoveStatement.bodyContent.trim(), bodyText.trim());
});

test('cleanAcademicMarkdownSymbols removes double asterisks from words and labels', () => {
  const dirty = `Dinamika keilmuan dalam bidang **Teknik Informatika** sangat pesat.
- **Identifikasi Variabel:**
  - **Variabel Bebas (X):** Implementasi **Sistem Informasi**
  - **Variabel Terikat (Y):** **Kinerja Karyawan**`;
  const cleaned = cleanAcademicMarkdownSymbols(dirty);

  assert.ok(!cleaned.includes('**'), 'Should not contain any double asterisks');
  assert.ok(cleaned.includes('Dinamika keilmuan dalam bidang Teknik Informatika sangat pesat.'));
  assert.ok(cleaned.includes('- Identifikasi Variabel:'));
  assert.ok(cleaned.includes('- Variabel Bebas (X): Implementasi Sistem Informasi'));
  assert.ok(cleaned.includes('- Variabel Terikat (Y): Kinerja Karyawan'));
});

test('cleanAcademicMarkdownSymbols eliminates floating stray asterisks and converts asterisk bullets', () => {
  const dirty = `Latar belakang * * masalah penelitian ini.
* Poin pertama penelitian
* Poin kedua penelitian * * *
Terdapat celah riset * * di antara dua teori.`;
  const cleaned = cleanAcademicMarkdownSymbols(dirty);

  assert.ok(!cleaned.includes('* *'), 'Should not contain floating * *');
  assert.ok(!cleaned.includes('* * *'), 'Should not contain floating * * *');
  assert.ok(cleaned.includes('- Poin pertama penelitian'));
  assert.ok(cleaned.includes('- Poin kedua penelitian'));
  assert.ok(!cleaned.includes('* Poin'));
});

test('cleanAcademicMarkdownSymbols preserves preliminary sheet comments intact', () => {
  const rawWithPreliminary = `<!-- LEMBAR_AKADEMIK_START:cover -->
## HALAMAN JUDUL
<!-- LEMBAR_AKADEMIK_END:cover -->

# BAB I
# PENDAHULUAN

## 1.1 Latar Belakang Masalah
Kajian **manajemen** menunjukkan kendala **operasional** * * yang nyata.`;

  const cleaned = cleanAcademicMarkdownSymbols(rawWithPreliminary);
  assert.ok(cleaned.includes('<!-- LEMBAR_AKADEMIK_START:cover -->'));
  assert.ok(cleaned.includes('<!-- LEMBAR_AKADEMIK_END:cover -->'));
  assert.ok(!cleaned.includes('**manajemen**'));
  assert.ok(!cleaned.includes('**operasional**'));
  assert.ok(!cleaned.includes('* *'));
  assert.ok(cleaned.includes('Kajian manajemen menunjukkan kendala operasional yang nyata.'));
});

test('performInternalEditorialPolish automatically removes all asterisks from generated content', () => {
  const rawText = `Dalam konteks tersebut, pengkajian **Transformasi Digital** memegang peranan krusial.
Observasi awal pada **PT ABC** mengindikasikan kendala * * operasional.`;

  const polished = performInternalEditorialPolish(rawText, {
    topic: 'Transformasi Digital',
    researchLocation: 'PT ABC',
    jobType: 'bab_1',
  } as any);

  assert.ok(!polished.polishedText.includes('**'), 'Polished text must not have **');
  assert.ok(!polished.polishedText.includes('* *'), 'Polished text must not have * *');
  assert.ok(polished.polishedText.includes('pengkajian Transformasi Digital memegang peranan krusial'));
  assert.ok(polished.polishedText.includes('Observasi awal pada PT ABC mengindikasikan kendala'));
});

test('parseMarkdownTableLines correctly extracts table title, headers, rows, source, and student guidance', async () => {
  const { parseMarkdownTableLines } = await import('./academicRules.ts');

  const rawTableLines = [
    'Tabel 4.1 Distribusi Responden Berdasarkan Karakteristik Demografis',
    '| No | Karakteristik Responden | Kategori | Frekuensi (Orang) | Persentase (%) |',
    '| :--- | :--- | :--- | :--- | :--- |',
    '| 1 | Jenis Kelamin | Laki-laki | 58 | 58.0% |',
    '| 2 | Jenis Kelamin | Perempuan | 42 | 42.0% |',
    '| 3 | Tingkat Pendidikan | Sarjana (S1) | 65 | 65.0% |',
    'Sumber: Data primer kuesioner penelitian (diolah oleh penulis, 2026)',
    'Catatan Panduan Mahasiswa:',
    '- Mahasiswa wajib menyebarkan kuesioner kepada minimal 100 responden sesuai teknik sampling.',
    '- Data frekuensi diolah melalui SPSS menu Analyze -> Descriptive Statistics -> Frequencies.',
  ];

  const parsed = parseMarkdownTableLines(rawTableLines);
  assert.ok(parsed, 'Table data should not be null');
  assert.equal(parsed.title, 'Tabel 4.1 Distribusi Responden Berdasarkan Karakteristik Demografis');
  assert.equal(parsed.tableNumber, 'Tabel 4.1');
  assert.equal(parsed.headers.length, 5);
  assert.equal(parsed.headers[1], 'Karakteristik Responden');
  assert.equal(parsed.rows.length, 3);
  assert.equal(parsed.rows[0][2], 'Laki-laki');
  assert.equal(parsed.rows[0][3], '58');
  assert.ok(parsed.source?.includes('Data primer kuesioner'));
  assert.ok(parsed.studentNotes && parsed.studentNotes.length === 2);
  assert.ok(parsed.studentNotes[0].includes('minimal 100 responden'));
  assert.ok(parsed.studentNotes[1].includes('SPSS menu Analyze'));
});

test('parseAcademicMarkdown converts markdown tables into structured table sections with guidance', async () => {
  const { parseAcademicMarkdown } = await import('./academicRules.ts');

  const textWithTable = `
# BAB IV HASIL DAN PEMBAHASAN

## 4.1 Deskripsi Data Penelitian

Berikut disajikan tabel karakteristik responden penelitian.

Tabel 4.1 Distribusi Responden Berdasarkan Karakteristik Demografis
| No | Karakteristik Responden | Kategori | Frekuensi (Orang) | Persentase (%) |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Jenis Kelamin | Laki-laki | 58 | 58.0% |
| 2 | Jenis Kelamin | Perempuan | 42 | 42.0% |
Sumber: Data primer penelitian (diolah penulis, 2026)
Catatan Panduan Mahasiswa:
- Gantilah angka contoh simulasi di atas dengan rekapitulasi riil hasil kuesioner Anda.

Pembahasan lebih lanjut menunjukkan sebaran responden yang merata.
  `;

  const sections = parseAcademicMarkdown(textWithTable);
  const tableSection = sections.find((s) => s.type === 'table');
  assert.ok(tableSection, 'Must find a table section');
  assert.ok(tableSection.tableData);
  assert.equal(tableSection.tableData.tableNumber, 'Tabel 4.1');
  assert.equal(tableSection.tableData.rows.length, 2);
  assert.ok(tableSection.tableData.studentNotes && tableSection.tableData.studentNotes.length > 0);
  assert.ok(tableSection.tableData.studentNotes[0].includes('Gantilah angka contoh simulasi'));
});

test('generateSuggestedBibliographyEntry formats APA 7th citations accurately', async () => {
  const { generateSuggestedBibliographyEntry } = await import('./academicRules.ts');

  // Known methodological author
  const sugiyonoBib = generateSuggestedBibliographyEntry('Sugiyono', '2021');
  assert.ok(sugiyonoBib.includes('Sugiyono. (2021). Metode Penelitian Kuantitatif, Kualitatif, dan R&D'));
  assert.ok(sugiyonoBib.includes('Bandung: Alfabeta'));

  // Generic author formatted in APA 7th surname, initials
  const genericBib = generateSuggestedBibliographyEntry('Budi Santoso', '2023', 'Sistem Informasi');
  assert.ok(genericBib.includes('Santoso, B. (2023).'));
  assert.ok(genericBib.includes('Sistem Informasi'));
});

test('addEntryToBibliography correctly appends entries to ## DAFTAR PUSTAKA maintaining alphabetical order', async () => {
  const { addEntryToBibliography } = await import('./academicRules.ts');

  const initialDoc = `# BAB I PENDAHULUAN\n\nIsi bab pendahuluan.\n\n## DAFTAR PUSTAKA\n\nSugiyono. (2021). Metode Penelitian. Bandung: Alfabeta.`;
  const newEntry = `Arikunto, S. (2019). Prosedur Penelitian. Jakarta: Rineka Cipta.`;

  const updatedDoc = addEntryToBibliography(initialDoc, newEntry);
  assert.ok(updatedDoc.includes('## DAFTAR PUSTAKA'));
  assert.ok(updatedDoc.includes('Arikunto, S. (2019)'));
  assert.ok(updatedDoc.includes('Sugiyono. (2021)'));

  // Arikunto should come before Sugiyono alphabetically
  const arikuntoIdx = updatedDoc.indexOf('Arikunto');
  const sugiyonoIdx = updatedDoc.indexOf('Sugiyono');
  assert.ok(arikuntoIdx < sugiyonoIdx, 'Entries should be alphabetically sorted');
});

test('addAllMissingEntriesToBibliography seamlessly resolves missing citations in bulk', async () => {
  const { addAllMissingEntriesToBibliography, crossCheckCitationsWithBibliography } = await import('./academicRules.ts');

  const draftText = `
    BAB I PENDAHULUAN
    Metode kuantitatif sering digunakan dalam riset (Sugiyono, 2021).
    Pengukuran instrumen mengacu pada teori validitas (Arikunto, 2019).
    Namun, temuan empiris terkini (Wibowo, 2024) menunjukkan hal berbeda.
  `;

  const initialReport = crossCheckCitationsWithBibliography(draftText);
  assert.equal(initialReport.missingFromBibliography.length, 3);

  const missingMatches = initialReport.matches.filter((m) => !m.isMatched);
  const updatedDoc = addAllMissingEntriesToBibliography(draftText, missingMatches, 'Manajemen Bisnis');

  const finalReport = crossCheckCitationsWithBibliography(updatedDoc);
  assert.equal(finalReport.hasBibliographySection, true);
  assert.equal(finalReport.missingFromBibliography.length, 0);
  assert.equal(finalReport.matchRate, 100);
});

test('createAutoSavePayload generates complete auto-save structure with timestamps', async () => {
  const { createAutoSavePayload, isValidAutoSavePayload } = await import('./academicRules.ts');

  const mockFormData: any = {
    jobType: 'chapter_1',
    degreeLevel: 'S1',
    topic: 'Pengaruh Kepemimpinan Terhadap Kinerja',
  };
  const mockContent = 'BAB I PENDAHULUAN\nLatar belakang riset...';

  const payload = createAutoSavePayload(mockContent, mockFormData);
  assert.equal(payload.content, mockContent);
  assert.equal(payload.formData.topic, 'Pengaruh Kepemimpinan Terhadap Kinerja');
  assert.ok(payload.lastSavedAt > 0);
  assert.ok(typeof payload.timestamp === 'string');
  assert.equal(isValidAutoSavePayload(payload), true);
});

test('isValidAutoSavePayload rejects empty or malformed draft objects', async () => {
  const { isValidAutoSavePayload } = await import('./academicRules.ts');

  assert.equal(isValidAutoSavePayload(null), false);
  assert.equal(isValidAutoSavePayload(undefined), false);
  assert.equal(isValidAutoSavePayload({}), false);
  assert.equal(isValidAutoSavePayload({ content: '   ', formData: {} }), false);
  assert.equal(isValidAutoSavePayload({ content: 'Bab 1', formData: null }), false);
  assert.equal(isValidAutoSavePayload({ content: 'Bab 1', formData: { topic: 'AI' } }), true);
});

test('crossCheckCitationsWithBibliography recognizes institutional citations and matches them accurately', async () => {
  const { crossCheckCitationsWithBibliography } = await import('./academicRules.ts');

  const draftText = `
    BAB I PENDAHULUAN
    Pertumbuhan ekonomi digital di Indonesia mencatatkan peningkatan signifikan (BPS, 2023).
    Selain itu, protokol kesehatan global menuntut standardisasi layanan (WHO, 2021).
    Pedoman gizi nasional telah diperbarui secara berkala (Kemenkes RI, 2022).

    DAFTAR PUSTAKA
    Badan Pusat Statistik (BPS). (2023). Statistik Ekonomi Digital Indonesia 2023. Jakarta: BPS.
    Kementerian Kesehatan Republik Indonesia (Kemenkes RI). (2022). Profil Kesehatan Indonesia. Jakarta: Kemenkes.
    World Health Organization (WHO). (2021). Global health guidelines and standards. Geneva: WHO Press.
  `;

  const report = crossCheckCitationsWithBibliography(draftText);
  assert.equal(report.hasBibliographySection, true);
  assert.equal(report.totalCitations, 3);
  assert.equal(report.matches.filter((m) => m.isMatched).length, 3);
  assert.equal(report.missingFromBibliography.length, 0);
  assert.equal(report.matchRate, 100);
});

test('crossCheckCitationsWithBibliography recognizes names with apostrophes and particles', async () => {
  const { crossCheckCitationsWithBibliography } = await import('./academicRules.ts');

  const draftText = `
    BAB II TINJAUAN PUSTAKA
    Filsafat logika dan epistemologi klasik dikaji secara mendalam oleh (Al-Farabi, 2020).
    Dalam teori interaksi manusia-komputer modern, usability heuristics dikembangkan lebih lanjut (O'Connor, 2019).

    DAFTAR PUSTAKA
    Al-Farabi, A. (2020). Telaah Epistemologi Keilmuan Klasik. Yogyakarta: Pustaka Pelajar.
    O'Connor, P. (2019). Usability and Human Interaction Systems. London: Academic Press.
  `;

  const report = crossCheckCitationsWithBibliography(draftText);
  assert.equal(report.hasBibliographySection, true);
  assert.equal(report.totalCitations, 2);
  assert.equal(report.matches.filter((m) => m.isMatched).length, 2);
  assert.equal(report.missingFromBibliography.length, 0);
  assert.equal(report.matchRate, 100);
});

test('crossCheckCitationsWithBibliography parses multiple citations within one parenthesis correctly', async () => {
  const { crossCheckCitationsWithBibliography } = await import('./academicRules.ts');

  const draftText = `
    BAB I PENDAHULUAN
    Berbagai penelitian sebelumnya membuktikan korelasi kuat antara motivasi dan kinerja (Smith, 2019; Jones, 2021).
    Namun, pendekatan metodologis campuran lebih direkomendasikan (Sugiyono, 2020).

    DAFTAR PUSTAKA
    Jones, M. (2021). Organizational Behavior and Performance Analysis. New York: Routledge.
    Smith, J. (2019). Foundations of Human Motivation. Boston: Harvard University Press.
    Sugiyono. (2020). Metode Penelitian Kualitatif, Kuantitatif, dan R&D. Bandung: Alfabeta.
  `;

  const report = crossCheckCitationsWithBibliography(draftText);
  assert.equal(report.hasBibliographySection, true);
  // Smith, 2019 and Jones, 2021 and Sugiyono, 2020 = 3 citations
  assert.equal(report.totalCitations, 3);
  assert.equal(report.matches.filter((m) => m.isMatched).length, 3);
  assert.equal(report.missingFromBibliography.length, 0);
  assert.equal(report.matchRate, 100);
});

test('cleanAcademicMarkdownSymbols with forClipboard strips raw headings, table pipes, and comments', async () => {
  const { cleanAcademicMarkdownSymbols } = await import('./academicRules.ts');

  const rawMarkdown = `
<!-- AI Generated Document -->
# BAB I PENDAHULUAN

## 1.1 Latar Belakang Masalah
Kondisi ideal menuntut penerapan tata kelola **akuntabel dan transparan**.

| No | Parameter | Target |
| :--- | :--- | :--- |
| 1 | Akurasi | 95% |
| 2 | Presisi | 92% |

Penelitian ini mengacu pada metodologi teruji.
  `;

  const cleaned = cleanAcademicMarkdownSymbols(rawMarkdown, { forClipboard: true });

  // No HTML comments
  assert.equal(cleaned.includes('<!-- AI Generated Document -->'), false);
  // No raw hash headings
  assert.equal(cleaned.includes('# BAB I'), false);
  assert.equal(cleaned.includes('## 1.1'), false);
  assert.ok(cleaned.includes('BAB I PENDAHULUAN'));
  assert.ok(cleaned.includes('1.1 Latar Belakang Masalah'));
  // No markdown bold asterisks
  assert.equal(cleaned.includes('**akuntabel'), false);
  assert.ok(cleaned.includes('akuntabel dan transparan'));
  // No table pipes or divider lines
  assert.equal(cleaned.includes('| :--- |'), false);
  assert.equal(cleaned.includes('|'), false);
  assert.ok(cleaned.includes('Akurasi'));
  assert.ok(cleaned.includes('95%'));
});

test('extractChapterInfo correctly extracts chapter number and inline title', async () => {
  const { extractChapterInfo } = await import('./academicRules.ts');

  const res1 = extractChapterInfo('# BAB I PENDAHULUAN');
  assert.equal(res1.isChapter, true);
  assert.equal(res1.babNumber, 'BAB I');
  assert.equal(res1.babTitle, 'PENDAHULUAN');

  const res2 = extractChapterInfo('BAB II: TINJAUAN PUSTAKA');
  assert.equal(res2.isChapter, true);
  assert.equal(res2.babNumber, 'BAB II');
  assert.equal(res2.babTitle, 'TINJAUAN PUSTAKA');

  const res3 = extractChapterInfo('### BAB III - METODE PENELITIAN');
  assert.equal(res3.isChapter, true);
  assert.equal(res3.babNumber, 'BAB III');
  assert.equal(res3.babTitle, 'METODE PENELITIAN');

  const res4 = extractChapterInfo('# BAB I');
  assert.equal(res4.isChapter, true);
  assert.equal(res4.babNumber, 'BAB I');
  assert.equal(res4.babTitle, undefined);

  const res5 = extractChapterInfo('1.1 Latar Belakang Masalah');
  assert.equal(res5.isChapter, false);
});

test('isMajorCenteredAcademicTitle accurately identifies thesis major front and back matter sections', async () => {
  const { isMajorCenteredAcademicTitle } = await import('./academicRules.ts');

  assert.equal(isMajorCenteredAcademicTitle('## DAFTAR PUSTAKA'), true);
  assert.equal(isMajorCenteredAcademicTitle('DAFTAR PUSTAKA'), true);
  assert.equal(isMajorCenteredAcademicTitle('# ABSTRAK'), true);
  assert.equal(isMajorCenteredAcademicTitle('ABSTRACT'), true);
  assert.equal(isMajorCenteredAcademicTitle('KATA PENGANTAR'), true);
  assert.equal(isMajorCenteredAcademicTitle('LAMPIRAN'), true);

  assert.equal(isMajorCenteredAcademicTitle('1.1 Latar Belakang Masalah'), false);
  assert.equal(isMajorCenteredAcademicTitle('Sebuah paragraf biasa'), false);
});

test('parseAcademicMarkdown correctly pairs BAB I with PENDAHULUAN when placed on subsequent line', async () => {
  const { parseAcademicMarkdown } = await import('./academicRules.ts');

  // Case A: # BAB I followed by plain PENDAHULUAN
  const mdSeparate = `# BAB I\nPENDAHULUAN\n\n## 1.1 Latar Belakang Masalah\nUraian latar belakang...`;
  const secA = parseAcademicMarkdown(mdSeparate);
  assert.equal(secA[0].type, 'h1');
  assert.equal(secA[0].content, 'BAB I PENDAHULUAN');
  assert.equal(secA[0].subContent, 'PENDAHULUAN');
  assert.equal(secA[1].type, 'h2');
  assert.equal(secA[1].content, '1.1 Latar Belakang Masalah');

  // Case B: # BAB I followed by ## PENDAHULUAN
  const mdWithH2 = `# BAB I\n## PENDAHULUAN\n\n## 1.1 Latar Belakang Masalah\nUraian latar belakang...`;
  const secB = parseAcademicMarkdown(mdWithH2);
  assert.equal(secB[0].type, 'h1');
  assert.equal(secB[0].content, 'BAB I PENDAHULUAN');
  assert.equal(secB[0].subContent, 'PENDAHULUAN');
  assert.equal(secB[1].type, 'h2');

  // Case C: Plain text BAB I followed by PENDAHULUAN without hashes
  const mdPlain = `BAB I\nPENDAHULUAN\n\n1.1 Latar Belakang Masalah\nUraian latar belakang...`;
  const secC = parseAcademicMarkdown(mdPlain);
  assert.equal(secC[0].type, 'h1');
  assert.equal(secC[0].content, 'BAB I PENDAHULUAN');
  assert.equal(secC[0].subContent, 'PENDAHULUAN');

  // Case D: BAB I without a title (directly followed by 1.1 Latar Belakang) should NOT consume 1.1 as title
  const mdNoTitle = `# BAB I\n## 1.1 Latar Belakang Masalah\nUraian latar belakang...`;
  const secD = parseAcademicMarkdown(mdNoTitle);
  assert.equal(secD[0].type, 'h1');
  assert.equal(secD[0].content, 'BAB I');
  assert.equal(secD[0].subContent, undefined);
  assert.equal(secD[1].type, 'h2');
  assert.equal(secD[1].content, '1.1 Latar Belakang Masalah');
});


