import React, { useState, useEffect, useMemo } from 'react';
import { RequestLog, ChatMessage } from './types';
import { generateSyntheticLogs, deriveScenarioSummaries } from './data/mockRequests';
import { Sidebar, TabType } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { RequestFeedView } from './components/RequestFeedView';
import { AnalyticsChartsView } from './components/AnalyticsChartsView';
import { CopilotChatView } from './components/CopilotChatView';
import { InitializationOverlay } from './components/InitializationOverlay';

export default function App() {
  const [logs, setLogs] = useState<RequestLog[]>(() => {
    const saved = localStorage.getItem('logs');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTab, setActiveTab] = useState<TabType>('copilot');
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [copilotMessages, setCopilotMessages] = useState<ChatMessage[]>([]);

  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  useEffect(() => {
    const lsVersion = localStorage.getItem('app_version');
    const currentVersion = '2.0';
    if (lsVersion !== currentVersion) {
      localStorage.clear();
      localStorage.setItem('app_version', currentVersion);
    }

    fetch('/api/logs')
      .then((res) => res.json())
      .then((data) => {
          setLogs(data);
          setIsInitializing(false);
      })
      .catch((err) => {
          console.error('Failed to fetch logs:', err);
          setIsInitializing(false);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem('logs', JSON.stringify(logs));
  }, [logs]);

  const scenarios = useMemo(() => deriveScenarioSummaries(logs), [logs]);

  const handleBatchGenerate = () => {
    const freshBatch = generateSyntheticLogs(10);
    setLogs((prev) => [...freshBatch, ...prev]);
  };

  const handleAddCustomLog = (newLog: RequestLog) => {
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleDeleteLog = (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased selection:bg-indigo-600 selection:text-white flex text-sm">
      {isInitializing && <InitializationOverlay />}

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div
        className={`flex-1 transition-all duration-300 min-h-screen flex flex-col ${
          collapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center sticky top-0 z-30 shadow-2xs">
          <h2 className="text-base font-bold text-slate-800">
            {activeTab === 'copilot' && 'ИИ-Копилот'}
            {activeTab === 'overview' && 'Сводка'}
            {activeTab === 'requests' && 'Реестр'}
            {activeTab === 'analytics' && 'Аналитика'}
          </h2>
        </header>

        <main className="p-6 flex-1 w-full">
          {activeTab === 'copilot' && (
            <CopilotChatView
              logs={logs}
              messages={copilotMessages}
              setMessages={setCopilotMessages}
            />
          )}

          {activeTab === 'overview' && (
            <DashboardOverview
              logs={logs}
              onNavigateToRequests={() => setActiveTab('requests')}
            />
          )}

          {activeTab === 'requests' && (
            <RequestFeedView
              logs={logs}
              onAddSyntheticPrompt={handleBatchGenerate}
              onAddCustomLog={handleAddCustomLog}
              onDeleteLog={handleDeleteLog}
              onNavigateToTester={() => setActiveTab('copilot')}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsChartsView logs={logs} />
          )}
        </main>
      </div>
    </div>
  );
}
