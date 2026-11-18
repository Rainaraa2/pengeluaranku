import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './database/db';
import { Transaction, NavigationTab } from './types';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { DashboardPage } from './pages/DashboardPage';
import { AddExpensePage } from './pages/AddExpensePage';
import { HistoryPage } from './pages/HistoryPage';
import { ReportPage } from './pages/ReportPage';
import { SettingsPage } from './pages/SettingsPage';
import { ToastProvider } from './components/ui/Toast';
import { usePwaInstall } from './hooks/usePwaInstall';
import { PwaInstallModal } from './components/ui/PwaInstallModal';
import { NetlifyBadge } from './components/ui/NetlifyBadge';

export const AppContent: React.FC = () => {
  // Navigation state
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');

  // Currently editing transaction
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Default to current month and year
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());

  // PWA Desktop install hook
  const {
    isInstallable,
    isInstalled,
    triggerInstall,
    showInstallGuide,
    setShowInstallGuide,
  } = usePwaInstall();

  // Dexie live query for real-time transactions
  const transactions = useLiveQuery(
    () => db.transactions.orderBy('tanggal').reverse().toArray(),
    []
  );

  // Compute available years based on data + current year
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    yearsSet.add(currentDate.getFullYear());

    if (transactions) {
      for (const tx of transactions) {
        const parts = tx.tanggal.split('-');
        if (parts.length >= 1) {
          const y = parseInt(parts[0], 10);
          if (!isNaN(y)) {
            yearsSet.add(y);
          }
        }
      }
    }

    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [transactions, currentDate]);

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setCurrentTab('tambah');
  };

  const handleAddSuccess = () => {
    setEditingTransaction(null);
    setCurrentTab('riwayat');
  };

  const handleAddCancel = () => {
    setEditingTransaction(null);
    if (editingTransaction) {
      setCurrentTab('riwayat');
    } else {
      setCurrentTab('dashboard');
    }
  };

  const allTransactions = transactions || [];

  return (
    <div className="min-h-screen bg-[#FAF9FF] flex flex-col selection:bg-[#DDD6FE] selection:text-[#7C3AED]">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onOpenInstallModal={() => setShowInstallGuide(true)}
        isInstalled={isInstalled}
      />

      {/* Main Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={(tab) => {
            if (tab !== 'tambah') {
              setEditingTransaction(null);
            }
            setCurrentTab(tab);
          }}
          totalTransactionsCount={allTransactions.length}
          onOpenInstallModal={() => setShowInstallGuide(true)}
          isInstalled={isInstalled}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-10 overflow-y-auto w-full max-w-full">
          {currentTab === 'dashboard' && (
            <DashboardPage
              transactions={allTransactions}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              availableYears={availableYears}
              onNavigate={(tab) => {
                if (tab !== 'tambah') setEditingTransaction(null);
                setCurrentTab(tab);
              }}
              onEditTransaction={handleEditTransaction}
            />
          )}

          {currentTab === 'tambah' && (
            <AddExpensePage
              editingTransaction={editingTransaction}
              onSuccess={handleAddSuccess}
              onCancel={handleAddCancel}
            />
          )}

          {currentTab === 'riwayat' && (
            <HistoryPage
              transactions={allTransactions}
              availableYears={availableYears}
              onNavigate={(tab) => {
                if (tab !== 'tambah') setEditingTransaction(null);
                setCurrentTab(tab);
              }}
              onEdit={handleEditTransaction}
            />
          )}

          {currentTab === 'laporan' && (
            <ReportPage
              transactions={allTransactions}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              availableYears={availableYears}
            />
          )}

          {currentTab === 'pengaturan' && (
            <SettingsPage
              transactions={allTransactions}
              onDataChanged={() => {}}
              onOpenInstallModal={() => setShowInstallGuide(true)}
              isInstalled={isInstalled}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={(tab) => {
          if (tab !== 'tambah') {
            setEditingTransaction(null);
          }
          setCurrentTab(tab);
        }}
      />

      {/* Floating Clean Netlify Badge */}
      <NetlifyBadge />

      {/* PWA Desktop Install Modal */}
      <PwaInstallModal
        isOpen={showInstallGuide}
        onClose={() => setShowInstallGuide(false)}
        onTriggerInstall={triggerInstall}
        isInstallable={isInstallable}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
