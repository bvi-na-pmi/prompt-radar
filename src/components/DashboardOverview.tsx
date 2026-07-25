import React from 'react';
import { RequestLog } from '../types';

interface DashboardOverviewProps {
  logs: RequestLog[];
  onNavigateToRequests: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  logs,
  onNavigateToRequests,
}) => {
  const totalCount = logs.length;
  const successCount = logs.filter((l) => l.status === 'Success').length;
  const errorCount = logs.filter((l) => l.status === 'Error').length;
  const successRate = totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(1) : '0';
  const totalTokensM = (logs.reduce((acc, l) => acc + l.tokensUsed, 0) / 1000000).toFixed(2);
  const totalRublesSaved = logs.reduce((acc, l) => acc + (l.moneySavedRubles || 0), 0);
  const totalSavedMinutes = logs.reduce((acc, l) => acc + Math.round((l.moneySavedRubles || 0) / 30), 0);
  const totalSavedHours = Number((totalSavedMinutes / 60).toFixed(1));

  const getLogStatus = (log: RequestLog): string => log.status;

  const userMap = new Map<string, { department: string; requests: number; tokens: number; success: number }>();
  logs.forEach((l) => {
    const u = userMap.get(l.userName) || { department: l.department, requests: 0, tokens: 0, success: 0 };
    u.requests += 1;
    u.tokens += l.tokensUsed;
    if (l.status === 'Success') u.success += 1;
    userMap.set(l.userName, u);
  });
  const topUsers = Array.from(userMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.requests - a.requests)
    .slice(0, 10);

  const deptMap = new Map<string, { users: Set<string>; requests: number; tokens: number }>();
  logs.forEach((l) => {
    const d = deptMap.get(l.department) || { users: new Set(), requests: 0, tokens: 0 };
    d.users.add(l.userName);
    d.requests += 1;
    d.tokens += l.tokensUsed;
    deptMap.set(l.department, d);
  });
  const deptData = Array.from(deptMap.entries())
    .map(([dept, data]) => ({ department: dept, usersCount: data.users.size, requests: data.requests, tokens: data.tokens }))
    .sort((a, b) => b.requests - a.requests);

  const recentLogs = logs.slice(0, 10);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-slate-500 text-sm font-semibold uppercase tracking-wider">
            Запросов в базе
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900">{totalCount}</span>
            <span className="text-xs text-slate-400">вызовов</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">100% авто-классифицировано</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-slate-500 text-sm font-semibold uppercase tracking-wider">
            Успешность
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-emerald-600">{successRate}%</span>
            <span className="text-xs text-emerald-700 font-bold">({successCount})</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Без сбоев</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-slate-500 text-sm font-semibold uppercase tracking-wider">
            Ошибки & Сбои
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-red-600">{errorCount}</span>
            <span className="text-xs text-slate-400">запросов</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{logs.filter(l => l.status === 'Warning').length} с предостережением</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-slate-500 text-sm font-semibold uppercase tracking-wider">
            Токены
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900">{totalTokensM}M</span>
            <span className="text-xs text-slate-400">токенов</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">По всем отделам</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs bg-emerald-50/20 border-emerald-100">
          <div className="text-slate-500 text-sm font-semibold uppercase tracking-wider">
            Сэкономлено (ФОТ)
          </div>
          <div className="mt-1.5">
            <span className="text-2xl font-extrabold text-emerald-700">{totalRublesSaved.toLocaleString('ru-RU')} ₽</span>
          </div>
          <p className="text-xs text-emerald-600 font-semibold mt-1">~{totalSavedHours} ч. рабочего времени</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Топ-10 Пользователей
            </h2>
          </div>
          <div className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-xs tracking-wider">
                  <th className="py-2 px-3 text-left">Пользователь</th>
                  <th className="py-2 px-3 text-left">Отдел</th>
                  <th className="py-2 px-3 text-center">Запросов</th>
                  <th className="py-2 px-3 text-right">Токены</th>
                  <th className="py-2 px-3 text-center">Успешн.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topUsers.map((user) => (
                  <tr key={user.name} className="hover:bg-slate-50/80">
                    <td className="py-2 px-3 font-semibold text-slate-900">{user.name}</td>
                    <td className="py-2 px-3 text-slate-600">{user.department}</td>
                    <td className="py-2 px-3 text-center font-mono text-slate-800">{user.requests}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-700">{(user.tokens / 1000).toFixed(0)}K</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-emerald-700">
                      {user.requests > 0 ? Math.round(user.success / user.requests * 100) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Активность по Отделам
            </h2>
          </div>
          <div className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-xs tracking-wider">
                  <th className="py-2 px-3 text-left">Отдел</th>
                  <th className="py-2 px-3 text-center">Пользователей</th>
                  <th className="py-2 px-3 text-center">Запросов</th>
                  <th className="py-2 px-3 text-right">Токенов</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deptData.map((dept) => (
                  <tr key={dept.department} className="hover:bg-slate-50/80">
                    <td className="py-2 px-3 font-semibold text-slate-900">{dept.department}</td>
                    <td className="py-2 px-3 text-center font-mono text-slate-700">{dept.usersCount}</td>
                    <td className="py-2 px-3 text-center font-mono text-slate-800">{dept.requests}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-700">{(dept.tokens / 1000000).toFixed(2)}M</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-right pt-1">
            <button
              onClick={onNavigateToRequests}
              className="text-xs text-indigo-600 font-bold hover:underline"
            >
              Реестр ({logs.length}) &rarr;
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Последние запросы
          </h2>
          <button
            onClick={onNavigateToRequests}
            className="text-xs text-indigo-600 font-bold hover:underline"
          >
            Все запросы &rarr;
          </button>
        </div>
        <div className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-xs tracking-wider">
                <th className="py-2 px-3">Пользователь</th>
                <th className="py-2 px-3">Промпт</th>
                <th className="py-2 px-3 text-center">Статус</th>
                <th className="py-2 px-3 text-right">Токены</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80">
                  <td className="py-2 px-3 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{log.userName}</div>
                    <div className="text-xs text-slate-500">{log.department}</div>
                  </td>
                  <td className="py-2 px-3 max-w-xs">
                    <p className="text-slate-800 line-clamp-1" title={log.promptText}>
                      "{log.promptText}"
                    </p>
                  </td>
                  <td className="py-2 px-3 text-center whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      getLogStatus(log) === 'Success'
                        ? 'bg-emerald-100 text-emerald-800'
                        : getLogStatus(log) === 'Error'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {getLogStatus(log)}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                    {log.tokensUsed.toLocaleString('ru-RU')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
