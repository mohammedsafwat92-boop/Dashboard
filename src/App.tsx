import React, { useState } from 'react';
import {
  INITIAL_COHORTS_DATA
} from './data/mockCohortsData';
import { CohortSummary, ViewTab } from './types';
import { Header } from './components/Header';
import { CohortOverviewCards } from './components/CohortOverviewCards';
import { CohortComparisonMatrix } from './components/CohortComparisonMatrix';
import { CrossCohortCharts } from './components/CrossCohortCharts';
import { CohortHeadToHead } from './components/CohortHeadToHead';
import { TraineeDirectory } from './components/TraineeDirectory';
import { CohortInsights } from './components/CohortInsights';
import { SheetsDataManagerModal } from './components/SheetsDataManagerModal';
import {
  downloadSixSheetExcelTemplate,
  exportCurrentCohortsToExcel
} from './utils/sheetParser';
import {
  FileSpreadsheet,
  Layers,
  ArrowRightLeft,
  Users,
  Sparkles,
  BarChart3,
  CheckCircle2,
  Download,
  FileDown,
  RefreshCw,
  Info
} from 'lucide-react';

export default function App() {
  const [cohorts, setCohorts] = useState<CohortSummary[]>(INITIAL_COHORTS_DATA);
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [isDataManagerOpen, setIsDataManagerOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [sheetSourceType, setSheetSourceType] = useState<string>('sample_data');
  const [selectedCohortForTrainees, setSelectedCohortForTrainees] = useState<string | null>(null);
  const [headToHeadCohortA, setHeadToHeadCohortA] = useState<string>('cohort-1');
  const [headToHeadCohortB, setHeadToHeadCohortB] = useState<string>('cohort-6');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleUpdateCohorts = (newCohorts: CohortSummary[], sourceType: string) => {
    setCohorts(newCohorts);
    setSheetSourceType(sourceType);
    showToast(`Successfully synchronized all ${newCohorts.length} training cohort sheets!`);
  };

  const handleExportExcel = () => {
    try {
      exportCurrentCohortsToExcel(cohorts);
      showToast('Downloaded multi-sheet Excel workbook with all 6 cohort tabs!');
    } catch (err: any) {
      showToast(`Export error: ${err.message}`);
    }
  };

  const handleDownloadTemplate = () => {
    try {
      downloadSixSheetExcelTemplate();
      showToast('Downloaded 6-sheet training data template (.xlsx)!');
    } catch (err: any) {
      showToast(`Template download error: ${err.message}`);
    }
  };

  const handleSelectCohortFromMatrix = (cohortId: string) => {
    setSelectedCohortForTrainees(cohortId);
    setCurrentTab('trainees');
  };

  const handleCompareHeadToHead = (cohortAId: string, cohortBId: string) => {
    setHeadToHeadCohortA(cohortAId);
    setHeadToHeadCohortB(cohortBId);
    setCurrentTab('comparison');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-indigo-600 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-indigo-400/40 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        cohorts={cohorts}
        onOpenDataManager={() => setIsDataManagerOpen(true)}
        onExportExcel={handleExportExcel}
        onDownloadTemplate={handleDownloadTemplate}
        isSyncing={isSyncing}
        sheetSourceType={sheetSourceType}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Active Multi-Sheet Context Bar */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold text-slate-200">Active Multi-Sheet Setup:</span>
            <span>All 6 Cohort Sheets Loaded</span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-indigo-400">
              {cohorts.map((c) => `Sheet ${c.sheetIndex}: ${c.tabName}`).join(' | ')}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsDataManagerOpen(true)}
              className="text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer"
            >
              Configure 6 Sheets
            </button>
            <span className="text-slate-600">•</span>
            <button
              onClick={handleExportExcel}
              className="text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3 text-cyan-400" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* TAB 1: EXECUTIVE DASHBOARD */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6">
            <CohortOverviewCards cohorts={cohorts} />
            <CohortComparisonMatrix
              cohorts={cohorts}
              onSelectCohort={handleSelectCohortFromMatrix}
              onCompareHeadToHead={handleCompareHeadToHead}
            />
            <CrossCohortCharts cohorts={cohorts} />
            <TraineeDirectory
              cohorts={cohorts}
              selectedCohortId={selectedCohortForTrainees}
            />
          </div>
        )}

        {/* TAB 2: COMPARISON MATRIX */}
        {currentTab === 'matrix' && (
          <div className="space-y-6">
            <CohortOverviewCards cohorts={cohorts} />
            <CohortComparisonMatrix
              cohorts={cohorts}
              onSelectCohort={handleSelectCohortFromMatrix}
              onCompareHeadToHead={handleCompareHeadToHead}
            />
            <CrossCohortCharts cohorts={cohorts} />
          </div>
        )}

        {/* TAB 3: HEAD-TO-HEAD COMPARATOR */}
        {currentTab === 'comparison' && (
          <CohortHeadToHead
            cohorts={cohorts}
            initialCohortAId={headToHeadCohortA}
            initialCohortBId={headToHeadCohortB}
          />
        )}

        {/* TAB 4: TRAINEE DIRECTORY & SCORECARDS */}
        {currentTab === 'trainees' && (
          <TraineeDirectory
            cohorts={cohorts}
            selectedCohortId={selectedCohortForTrainees}
          />
        )}

        {/* TAB 5: CURRICULUM INSIGHTS */}
        {currentTab === 'insights' && (
          <CohortInsights cohorts={cohorts} />
        )}

        {/* TAB 6: 6-SHEET DATA CONNECTOR */}
        {currentTab === 'sheet_sync' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                    6 Sheets Data Connector & Ingestion Overview
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live connection status and column mappings for all 6 cohort data sheets
                  </p>
                </div>
                <button
                  onClick={() => setIsDataManagerOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Open 6-Sheet Sync Wizard</span>
                </button>
              </div>

              {/* 6 Sheets Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
                {cohorts.map((c) => (
                  <div
                    key={c.id}
                    className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        Sheet {c.sheetIndex}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        Synchronized
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-white text-sm">{c.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Tab Name: <strong className="text-slate-300 font-mono">"{c.tabName}"</strong>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Trainees</span>
                        <span className="font-bold text-white">{c.traineeCount}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Trainer</span>
                        <span className="font-bold text-slate-200 truncate block">{c.trainer}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">RP Avg</span>
                        <span className="font-bold text-indigo-400">{c.avgRoleplayScore}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Test Avg</span>
                        <span className="font-bold text-cyan-400">{c.avgTestScore}%</span>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between items-center text-xs">
                      <span className="text-slate-400">Certification Ready:</span>
                      <span className="font-bold text-emerald-400">{c.certificationRate}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Template download & export section */}
              <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-slate-400">
                  Need to distribute or format sheets for training facilitators?
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDownloadTemplate}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <FileDown className="w-4 h-4 text-cyan-400" />
                    <span>Download 6-Sheet Template (.xlsx)</span>
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Current 6 Sheets (.xlsx)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 6 Sheets Data Manager Modal */}
      <SheetsDataManagerModal
        isOpen={isDataManagerOpen}
        onClose={() => setIsDataManagerOpen(false)}
        cohorts={cohorts}
        onUpdateCohorts={handleUpdateCohorts}
      />
    </div>
  );
}
