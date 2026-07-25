import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { RequestLog, ChatMessage } from '../types';
import {
  Send,
  Bot,
  User,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface CopilotChatViewProps {
  logs: RequestLog[];
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export const CopilotChatView: React.FC<CopilotChatViewProps> = ({
  logs,
  messages,
  setMessages,
}) => {
  const totalCount = logs.length;
  const successCount = logs.filter((l) => l.status === 'Success').length;
  const errorCount = logs.filter((l) => l.status === 'Error').length;
  const totalTokensM = (logs.reduce((acc, l) => acc + l.tokensUsed, 0) / 1000000).toFixed(2);

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message if messages array is empty
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMsg: ChatMessage = {
        id: 'welcome',
        sender: 'assistant',
        text: `Здравствуйте! Я ваш **ИИ-Копилот**. Чем могу помочь вам сегодня?`,
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([welcomeMsg]);
    }
  }, [messages, totalCount, setMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setLoading(true);

    try {
      // 1. Employee stats calculation
      const empMap = new Map<string, { name: string; department: string; count: number; tokens: number; errors: number }>();
      logs.forEach((l) => {
        const key = `${l.userName} (${l.department})`;
        const current = empMap.get(key) || { name: l.userName, department: l.department, count: 0, tokens: 0, errors: 0 };
        empMap.set(key, {
          name: l.userName,
          department: l.department,
          count: current.count + 1,
          tokens: current.tokens + l.tokensUsed,
          errors: current.errors + (l.status === 'Error' ? 1 : 0),
        });
      });
      const employeeStats = Array.from(empMap.values()).sort((a, b) => b.count - a.count);

      // 2. Category stats calculation
      const catMap = new Map<string, { count: number; tokens: number; errors: number }>();
      logs.forEach((l) => {
        const current = catMap.get(l.category) || { count: 0, tokens: 0, errors: 0 };
        catMap.set(l.category, {
          count: current.count + 1,
          tokens: current.tokens + l.tokensUsed,
          errors: current.errors + (l.status === 'Error' ? 1 : 0),
        });
      });
      const categoryStats = Array.from(catMap.entries()).map(([categoryName, data]) => ({
        categoryName,
        ...data,
      })).sort((a, b) => b.count - a.count);

      // 3. Department stats calculation
      const deptMap = new Map<string, { count: number; tokens: number }>();
      logs.forEach((l) => {
        const current = deptMap.get(l.department) || { count: 0, tokens: 0 };
        deptMap.set(l.department, {
          count: current.count + 1,
          tokens: current.tokens + l.tokensUsed,
        });
      });
      const departmentStats = Array.from(deptMap.entries()).map(([departmentName, data]) => ({
        departmentName,
        ...data,
      })).sort((a, b) => b.count - a.count);

      // 4. Date stats calculation (enabling exact date queries e.g. July 24th)
      const dateMap = new Map<string, { count: number; tokens: number; employees: Map<string, { count: number; dept: string; cat: string }>; categories: Map<string, number> }>();
      logs.forEach((l) => {
        const dateStr = l.timestamp.substring(0, 10); // e.g. "2026-07-24"
        if (!dateMap.has(dateStr)) {
          dateMap.set(dateStr, { count: 0, tokens: 0, employees: new Map(), categories: new Map() });
        }
        const entry = dateMap.get(dateStr)!;
        entry.count += 1;
        entry.tokens += l.tokensUsed;

        const empKey = l.userName;
        const currentEmp = entry.employees.get(empKey) || { count: 0, dept: l.department, cat: l.category };
        entry.employees.set(empKey, { count: currentEmp.count + 1, dept: l.department, cat: l.category });

        entry.categories.set(l.category, (entry.categories.get(l.category) || 0) + 1);
      });

      const dateStats = Array.from(dateMap.entries()).map(([date, data]) => {
        const sortedEmps = Array.from(data.employees.entries()).sort((a, b) => b[1].count - a[1].count);
        const sortedCats = Array.from(data.categories.entries()).sort((a, b) => b[1] - a[1]);
        const topEmp = sortedEmps[0];
        const topCat = sortedCats[0];

        return {
          date,
          count: data.count,
          tokens: data.tokens,
          topEmployee: topEmp ? { name: topEmp[0], department: topEmp[1].dept, category: topEmp[1].cat, count: topEmp[1].count } : null,
          topCategory: topCat ? { categoryName: topCat[0], count: topCat[1] } : null,
          allEmployeesOnDate: sortedEmps.map(([name, info]) => ({ name, department: info.dept, category: info.cat, count: info.count })),
          allCategoriesOnDate: sortedCats.map(([categoryName, count]) => ({ categoryName, count })),
        };
      }).sort((a, b) => b.date.localeCompare(a.date));

      const logsSummary = {
        totalLogs: logs.length,
        successCount,
        errorCount,
        successRate: ((successCount / logs.length) * 100).toFixed(1),
        totalTokensM,
        employeeStats,
        categoryStats,
        departmentStats,
        dateStats,
        recentPromptsSample: logs.slice(0, 40).map((l) => ({
          timestamp: l.timestamp,
          userName: l.userName,
          department: l.department,
          category: l.category,
          promptText: l.promptText,
          status: l.status,
          tokensUsed: l.tokensUsed,
        })),
      };

      const res = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, logsSummary }),
      });

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.reply || 'Не удалось сформировать ответ. Попробуйте еще раз.',
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: 'Ошибка связи с сервером копилота. Попробуйте еще раз.',
          timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    'Кто из сотрудников сделал больше всего запросов?',
    'Сколько запросов по каждой категории?',
    'Какой отдел потратил больше всего токенов?',
    'Какие частые ошибки возникают?',
  ];

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Clean Header */}
      <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">ИИ-Копилот</h1>
            <p className="text-xs text-slate-400">Аналитика вызовов и активности сотрудников в реальном времени</p>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col h-[560px] overflow-hidden">
        {/* Chat Messages Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-xl rounded-xl p-3 text-xs leading-relaxed shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none'
                }`}
              >
                <div
                  className={`flex items-center justify-between text-[10px] mb-1.5 pb-1 border-b ${
                    msg.sender === 'user'
                      ? 'border-slate-800 text-slate-300 font-medium'
                      : 'border-slate-100 text-slate-500 font-semibold'
                  }`}
                >
                  <span>{msg.sender === 'user' ? 'Вы' : 'Копилот'}</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`markdown-content text-xs leading-relaxed space-y-1.5 [&>p]:mb-1.5 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4 [&>ul>li]:mb-1 [&>strong]:font-bold ${
                    msg.sender === 'user' ? 'text-white font-medium' : 'text-slate-900'
                  }`}
                >
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-3 text-slate-500 text-xs">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-2 text-indigo-600 font-semibold text-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Анализ данных логов...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-2.5 bg-white border-t border-slate-200 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Задайте вопрос про сотрудников, категории или ошибки..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || loading}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-all flex items-center space-x-1 shadow-2xs cursor-pointer"
          >
            <span>Отправить</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

