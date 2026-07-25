export type DepartmentType =
  | 'Разработка & DevOps'
  | 'Бизнес-Аналитика'
  | 'Отдел Продаж & CRM'
  | 'HR & Кадры'
  | 'Юридический Отдел & Комплаенс'
  | 'Маркетинг & PR'
  | 'Финансы & Бухгалтерия'
  | 'Клиентская Поддержка'
  | 'Закупки & Логистика'
  | 'Администрация';

export type RequestStatus = 'Success' | 'Error' | 'Warning';

export type CategoryType =
  | 'Поиск & База знаний'
  | 'Разработка & Кодинг'
  | 'Отчетность & Аналитика'
  | 'CRM & Продажи'
  | 'Документооборот & Договоры'
  | 'Коммуникации & Почта'
  | 'Тестирование & QA'
  | 'HR & Кадры'
  | 'Инфраструктура & Мониторинг'
  | 'Личный запрос (не по работе)';

export interface RequestLog {
  id: string;
  timestamp: string;
  promptText: string;
  userName: string;
  userRole: string;
  department: DepartmentType;
  category: CategoryType;
  scenarioTitle: string;
  status: RequestStatus;
  tokensUsed: number;
  executionTimeMs: number;
  toolsUsed: string[];
  aiSummary: string;
  errorMessage?: string;
  moneySavedRubles?: number;
  grossMoneySavedRubles?: number;
  classificationCostRubles?: number;
}

export interface ScenarioSummary {
  id: string;
  title: string;
  category: CategoryType;
  department: DepartmentType;
  description: string;
  totalExecutions: number;
  successCount: number;
  errorCount: number;
  warningCount: number;
  totalTokens: number;
  avgTimeMs: number;
  aiKeyTakeaway: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
