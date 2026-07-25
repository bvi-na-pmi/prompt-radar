import { RequestLog, ScenarioSummary, CategoryType, DepartmentType } from '../types';

// Pre-defined realistic prompt templates to generate 160+ requests
const RAW_PROMPT_TEMPLATES = [
  {
    promptText: 'Найди в Confluence регламент информационной безопасности V3.2 и сгенерируй памятку для новых сотрудников',
    userName: 'Елена Смирнова',
    userRole: 'HR Lead',
    department: 'HR & Кадры' as DepartmentType,
    category: 'Поиск & База знаний' as CategoryType,
    scenarioTitle: 'Поиск регламентов в Confluence',
    toolsUsed: ['Confluence Search API', 'Markdown Formatter'],
    aiSummary: 'Найдена страница Confluence #3892, извлечено 5 правил ИБ, сформирован список для онбординга.',
  },
  {
    promptText: 'Собери из Jira все закрытые задачи в спринте 24.3, сгруппируй по модулям и оформи Release Notes в Slack',
    userName: 'Алексей Иванов',
    userRole: 'Senior DevOps',
    department: 'Разработка & DevOps' as DepartmentType,
    category: 'Разработка & Кодинг' as CategoryType,
    scenarioTitle: 'Сборка Release Notes из Jira',
    toolsUsed: ['Jira REST API', 'Slack Webhook'],
    aiSummary: 'Обработано 18 тикетов Jira, сгенерирован разделенный маркдаун релиз-ноутс и отправлен в канал #releases.',
  },
  {
    promptText: 'Напиши PostgreSQL запрос с окнами ROW_NUMBER для вычисления LTV пользователей по месячным когортам',
    userName: 'Михаил Петров',
    userRole: 'Data Analyst',
    department: 'Бизнес-Аналитика' as DepartmentType,
    category: 'Отчетность & Аналитика' as CategoryType,
    scenarioTitle: 'Генерация сложных SQL запросов',
    toolsUsed: ['PostgreSQL Schema Inspector', 'SQL Validator'],
    aiSummary: 'Сгенерирован оптимизированный SQL-скрипт с использованием CTE и window functions. Время выполнения 1.2s.',
  },
  {
    promptText: 'Запроси в DaData реквизиты ООО "Технопром-Сибирь", проверь на банкротство и обнови карту сделки в Bitrix24',
    userName: 'Ольга Кузнецова',
    userRole: 'Account Executive',
    department: 'Отдел Продаж & CRM' as DepartmentType,
    category: 'CRM & Продажи' as CategoryType,
    scenarioTitle: 'Скоринг контрагентов в CRM',
    toolsUsed: ['DaData API', 'Bitrix24 CRM API'],
    aiSummary: 'ИНН 5406781290 найден, статусов банкротства нет, карточка сделки #1042 обогащена данными из ФНС.',
  },
  {
    promptText: 'Прочитай стектрейс из Sentry по ошибке NullPointerException в PaymentGateway и покажи проблемную строчку в Git',
    userName: 'Дмитрий Соколов',
    userRole: 'Backend Developer',
    department: 'Разработка & DevOps' as DepartmentType,
    category: 'Разработка & Кодинг' as CategoryType,
    scenarioTitle: 'Разбор логов ошибок Sentry',
    toolsUsed: ['Sentry Logs API', 'GitLab Search'],
    aiSummary: 'Ошибка локализована в src/services/PaymentService.ts на строке 142. Предложен патч с проверяемым опционалом.',
  },
  {
    promptText: 'Создай E2E автотест на Playwright для проверки оплаты картой МИР на этапе чекаута в интернет-магазине',
    userName: 'Ирина Попова',
    userRole: 'QA Lead',
    department: 'Разработка & DevOps' as DepartmentType,
    category: 'Тестирование & QA' as CategoryType,
    scenarioTitle: 'Генерация E2E тестов Playwright',
    toolsUsed: ['Playwright Generator', 'Figma API'],
    aiSummary: 'Сгенерирован TypeScript код Playwright для формы чекаута с учетом селекторов из макета.',
  },
  {
    promptText: 'Сделай краткую выжимку переписки из 40 писем с клиентом "Альфа-Инвест" за последнюю неделю и подготовь статус',
    userName: 'Сергей Морозов',
    userRole: 'Key Account Manager',
    department: 'Отдел Продаж & CRM' as DepartmentType,
    category: 'Коммуникации & Почта' as CategoryType,
    scenarioTitle: 'Суммаризация почтовых тредов',
    toolsUsed: ['Outlook Mail Fetcher', 'Text Summarizer'],
    aiSummary: 'Проанализирована цепочка из 42 сообщений, выделено 3 ключевых соглашения и 2 открытых риска по поставкам.',
  },
  {
    promptText: 'Проверь форму договора поставки на юридические риски, проверь неустойку за задержку и выдели нетиповые пункты',
    userName: 'Анастасия Воронова',
    userRole: 'Ведущий Юрист',
    department: 'Юридический Отдел & Комплаенс' as DepartmentType,
    category: 'Документооборот & Договоры' as CategoryType,
    scenarioTitle: 'Автоматический аудит договоров',
    toolsUsed: ['Docx Reader', 'Legal Risk Analyzer'],
    aiSummary: 'Проверено 14 страниц договора. Выявлено несоответствие в п. 6.4 (пеня 0.5% в день вместо 0.1%).',
  },
  {
    promptText: 'Сформируй сводный Excel отчет по выручке филиалов за Q2 с группировкой по категориям товаров и диаграммой',
    userName: 'Артём Васильев',
    userRole: 'Главный Бухгалтер',
    department: 'Финансы & Бухгалтерия' as DepartmentType,
    category: 'Отчетность & Аналитика' as CategoryType,
    scenarioTitle: 'Генерация отчетов Excel',
    toolsUsed: ['Excel Export Tool', 'Chart Render Tool'],
    aiSummary: 'Создана книга Excel с кастомной разметкой, формулами SUMIFS и гистограммой динамики продаж.',
  },
  {
    promptText: 'Проверь метрики Prometheus по кластеру Kubernetes K8s-PROD и сгенерируй отчет о пиках CPU за сутки',
    userName: 'Никита Фёдоров',
    userRole: 'SRE Engineer',
    department: 'Разработка & DevOps' as DepartmentType,
    category: 'Инфраструктура & Мониторинг' as CategoryType,
    scenarioTitle: 'Мониторинг K8s и Prometheus',
    toolsUsed: ['Prometheus API', 'K8s Cluster Health'],
    aiSummary: 'Зафиксировано 2 пика нагрузки в 14:30 и 18:15 до 92% vCPU на нодах worker-04. Даны рекомендации по HPA.',
  },
  {
    promptText: 'Сгенерируй вакансию Senior Python Developer на основе внутренних требований команды и стандарта оценки HR',
    userName: 'Оксана Николаева',
    userRole: 'HRBP',
    department: 'HR & Кадры' as DepartmentType,
    category: 'HR & Кадры' as CategoryType,
    scenarioTitle: 'Генерация HR материалов и вакансий',
    toolsUsed: ['HR Knowledge Base'],
    aiSummary: 'Сформировано описание вакансии с техническим стеком, градиентом вилки и релевантными тестовыми вопросами.',
  },
  {
    promptText: 'Подготовь текст рекламного анонса нового тарифа для рассылки в Telegram и выдели 3 главных преимущества',
    userName: 'Екатерина Белова',
    userRole: 'PR Маркетолог',
    department: 'Маркетинг & PR' as DepartmentType,
    category: 'Коммуникации & Почта' as CategoryType,
    scenarioTitle: 'Маркетинговые анонсы и тексты',
    toolsUsed: ['Tone of Voice Analyzer'],
    aiSummary: 'Сформирован текст анонса для Telegram с соблюдением корпоративного Tone of Voice.',
  },
  {
    promptText: 'Проанализируй входящее обращение клиента №4029 о задержке поставки и сформируй вежливый проект ответа',
    userName: 'Владимир Чернов',
    userRole: 'Старший Оператор',
    department: 'Клиентская Поддержка' as DepartmentType,
    category: 'Коммуникации & Почта' as CategoryType,
    scenarioTitle: 'Разбор жалоб и обращений клиентов',
    toolsUsed: ['Zendesk API', 'Sentiment Analyzer'],
    aiSummary: 'Проанализирован тикет Zendesk #4029, сформирован персонализированный проект ответа с компенсацией.',
  },
  {
    promptText: 'Сравни цены 5 поставщиков серверов по спецификации и выдели оптимальное предложение по срокам и стоимости',
    userName: 'Роман Ткачев',
    userRole: 'Менеджер Закупок',
    department: 'Закупки & Логистика' as DepartmentType,
    category: 'Документооборот & Договоры' as CategoryType,
    scenarioTitle: 'Сравнение КП поставщиков',
    toolsUsed: ['PDF Commercial Proposal Reader'],
    aiSummary: 'Обработано 5 КП в PDF, составлена сравнительная матрица параметров.',
  },
  {
    promptText: 'Проведи экспресс-аудит безопасности прав доступа администраторов в Active Directory за прошлый месяц',
    userName: 'Игорь Медведев',
    userRole: 'Системный Администратор',
    department: 'Администрация' as DepartmentType,
    category: 'Инфраструктура & Мониторинг' as CategoryType,
    scenarioTitle: 'Аудит прав и учетных записей',
    toolsUsed: ['Active Directory Audit Tool'],
    aiSummary: 'Проверено 140 аккаунтов, выявлено 2 неактивные учетные записи с привилегированными правами.',
  },
  {
    promptText: 'Напиши рецепт вкусного борща с пампушками',
    userName: 'Елена Смирнова',
    userRole: 'HR Lead',
    department: 'HR & Кадры' as DepartmentType,
    category: 'Личный запрос (не по работе)' as CategoryType,
    scenarioTitle: 'Личный запрос сотрудника',
    toolsUsed: [],
    aiSummary: 'Личный запрос, не связанный с работой. Игнорируется в расчетах ФОТ.',
  },
  {
    promptText: 'Какая погода будет на выходных в Москве? Планирую поездку',
    userName: 'Алексей Иванов',
    userRole: 'Senior DevOps',
    department: 'Разработка & DevOps' as DepartmentType,
    category: 'Личный запрос (не по работе)' as CategoryType,
    scenarioTitle: 'Личный запрос сотрудника',
    toolsUsed: [],
    aiSummary: 'Личный запрос, не связанный с работой. Игнорируется в расчетах ФОТ.',
  },
];

// Error messages generator for realistic error scenarios
const MOCK_ERROR_REASONS = [
  'Timeout API (120s): Превышен лимит ожидания внешнего сервиса Jira API',
  'API Error 403: Недостаточно прав сервисной учетной записи для обращения к БД',
  'Token Limit Exceeded: Контекст превысил допустимый лимит (184,000 токенов)',
  'Tool Failure: Сервис DaData вернул 503 Service Unavailable',
  'Validation Error: Некорректный синтаксис входного JSON файла',
  'Confluence Auth Exception: Истёк срок действия API токена авторизации',
];

function getMockSavedMinutes(category: string, status: string): number {
  if (status !== 'Success') return 0;
  if (category === 'Личный запрос (не по работе)') return 0;
  switch (category) {
    case 'Разработка & Кодинг': return 11;
    case 'Тестирование & QA':
    case 'Отчетность & Аналитика':
    case 'Документооборот & Договоры': return 9;
    case 'CRM & Продажи':
    case 'Коммуникации & Почта':
    case 'HR & Кадры': return 6;
    case 'Инфраструктура & Мониторинг': return 7;
    case 'Поиск & База знаний':
    default: return 5;
  }
}

// Function to deterministically generate ~280 realistic logs spanning 30 days
export function generateSyntheticLogs(count: number = 280): RequestLog[] {
  const logs: RequestLog[] = [];
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const baseTime = now.getTime();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < count; i++) {
    const template = RAW_PROMPT_TEMPLATES[i % RAW_PROMPT_TEMPLATES.length];
    
    // Status distribution: ~84% Success, ~10% Error, ~6% Warning
    let status: 'Success' | 'Error' | 'Warning' = 'Success';
    let errorMessage: string | undefined = undefined;

    const randStatus = (i * 17 + 5) % 100;
    if (randStatus < 10) {
      status = 'Error';
      errorMessage = MOCK_ERROR_REASONS[i % MOCK_ERROR_REASONS.length];
    } else if (randStatus < 16) {
      status = 'Warning';
      errorMessage = 'Запрос обработан с высокой задержкой, требуется уточнение формата.';
    }

    // Average user request is ~100,000 tokens as required
    const baseTokens = 75000 + ((i * 3823) % 52000);
    const tokensUsed = status === 'Error' && errorMessage?.includes('Token Limit') ? 184200 : baseTokens;
    const executionTimeMs = Math.floor(400 + ((i * 311) % 4800) + (status === 'Error' ? 8000 : 0));

    // For the first 9 requests, explicitly assign them to Today
    let timestamp = '';
    if (i < 9) {
      const todayHours = [9, 9, 10, 11, 12, 14, 15, 16, 17];
      const todayMinutes = [13, 15, 24, 5, 30, 12, 45, 10, 22];
      const hh = String(todayHours[i]).padStart(2, '0');
      const mm = String(todayMinutes[i % todayMinutes.length]).padStart(2, '0');
      timestamp = `${todayStr} ${hh}:${mm}`;
    } else {
      // Calculate timestamp distributed across the remaining 29 days
      const dayProgress = (i - 9) / (count - 9); // 0 to 1
      const offsetMs = dayProgress * thirtyDaysMs;
      const targetDate = new Date(baseTime - offsetMs);

      // Adjust hour to 8:30..19:30 for realism
      const hour = 8 + (i % 12);
      const minute = (i * 13) % 60;
      targetDate.setHours(hour, minute, 0, 0);

      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const day = String(targetDate.getDate()).padStart(2, '0');
      const hh = String(targetDate.getHours()).padStart(2, '0');
      const mm = String(targetDate.getMinutes()).padStart(2, '0');
      timestamp = `${year}-${month}-${day} ${hh}:${mm}`;
    }

    const savedMin = getMockSavedMinutes(template.category, status);
    const mockGross = savedMin * 30;
    const mockAiCost = Math.round(tokensUsed * 0.000792);
    const mockNet = Math.max(0, mockGross - mockAiCost);

    logs.push({
      id: `req-log-${1000 + i}`,
      timestamp,
      promptText: `${template.promptText} #${i + 1}`,
      userName: template.userName,
      userRole: template.userRole,
      department: template.department,
      category: template.category,
      scenarioTitle: template.scenarioTitle,
      status,
      tokensUsed,
      executionTimeMs,
      toolsUsed: template.toolsUsed,
      aiSummary: status === 'Error' 
        ? `Ошибка исполнения процесса: ${errorMessage}`
        : template.aiSummary,
      errorMessage,
      moneySavedRubles: mockNet,
      grossMoneySavedRubles: mockGross,
      classificationCostRubles: mockAiCost,
    });
  }

  return logs;
}

// Extract scenario summaries from raw request logs
export function deriveScenarioSummaries(logs: RequestLog[]): ScenarioSummary[] {
  const map = new Map<string, {
    title: string;
    category: CategoryType;
    department: DepartmentType;
    logs: RequestLog[];
  }>();

  logs.forEach((log) => {
    const key = `${log.category}__${log.scenarioTitle}`;
    if (!map.has(key)) {
      map.set(key, {
        title: log.scenarioTitle,
        category: log.category,
        department: log.department,
        logs: [],
      });
    }
    map.get(key)!.logs.push(log);
  });

  const summaries: ScenarioSummary[] = [];

  map.forEach((item, key) => {
    const totalExecutions = item.logs.length;
    const successCount = item.logs.filter((l) => l.status === 'Success').length;
    const errorCount = item.logs.filter((l) => l.status === 'Error').length;
    const warningCount = item.logs.filter((l) => l.status === 'Warning').length;

    const totalTokens = item.logs.reduce((acc, l) => acc + l.tokensUsed, 0);
    const totalTimeMs = item.logs.reduce((acc, l) => acc + l.executionTimeMs, 0);
    const avgTimeMs = totalExecutions > 0 ? Math.round(totalTimeMs / totalExecutions) : 0;

    let takeaway = `Стабильный сценарий. Процент успешных запусков: ${Math.round((successCount / totalExecutions) * 100)}%.`;
    if (errorCount > 2) {
      takeaway = `Внимание: Выявлено ${errorCount} ошибок исполнения. Рекомендуется проверить API-ключи и лимиты контекста.`;
    } else if (totalTokens > 5000000) {
      takeaway = `Высокое потребление токенов. Полезно оптимизировать системный промпт или добавить кэширование.`;
    }

    summaries.push({
      id: `scenario-${key.replace(/[^a-zA-Z0-9]/g, '-')}`,
      title: item.title,
      category: item.category,
      department: item.department,
      description: `Автоматически сгруппированные запросы по тематике "${item.title}". Подразделение: ${item.department}.`,
      totalExecutions,
      successCount,
      errorCount,
      warningCount,
      totalTokens,
      avgTimeMs,
      aiKeyTakeaway: takeaway,
    });
  });

  return summaries.sort((a, b) => b.totalExecutions - a.totalExecutions);
}
