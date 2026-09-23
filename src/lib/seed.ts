import bcrypt from 'bcryptjs';
import { calculateReadinessScore } from './readiness';

export const DEMO_USERS = [
  {
    email: 'tech-lead@fintechworks.com',
    password: 'password123',
    name: 'Алексей Смирнов',
    role: 'business',
    organization: 'FintechWorks Accounting',
    team_name: null,
    skills: null,
    interests: null,
    xp_points: 0
  },
  {
    email: 'team-alphas@cs.edu',
    password: 'password123',
    name: 'Дана Исаева (Капитан)',
    role: 'student',
    organization: null,
    team_name: 'CyberAlphas Team',
    skills: 'Python, Machine Learning, FastAPI, PyTorch, SQL, React',
    interests: 'Data, FinTech, Recommendation Systems, CleanTech',
    xp_points: 350
  },
  {
    email: 'maya.design@uni.edu',
    password: 'password123',
    name: 'Майя Чен',
    role: 'student',
    organization: null,
    team_name: 'PixelCrafters UX',
    skills: 'Figma, UI/UX, User Research, Prototyping, Mobile Design',
    interests: 'Design, Community, Mobile',
    xp_points: 220
  },
  {
    email: 'admin@hackai.org',
    password: 'password123',
    name: 'Главный Модератор Платформы',
    role: 'admin',
    organization: 'AI Sana Hackathon Org',
    team_name: null,
    skills: null,
    interests: null,
    xp_points: 0
  },
  {
    email: 'retail@retailtech.io',
    password: 'password123',
    name: 'RetailTech Solutions',
    role: 'business',
    organization: 'RetailTech Global',
    team_name: null,
    skills: null,
    interests: null,
    xp_points: 0
  }
];

export const HACKATHON_TASKS = [
  {
    title: 'Разработка рекомендательного движка для онлайн-ритейла',
    category: 'Data',
    owner: 'RetailTech Solutions (contact@retailtech.io)',
    status: 'Published',
    priority: 'High',
    tags: 'Python, Machine Learning, FastAPI, RecSys, PyTorch',
    last_updated: '2026-09-23',
    context_need: 'В настоящее время на платформе отображаются только общие популярные товары. Требуется персонализированный рекомендательный движок, который повысит конверсию в корзину минимум на 15%.',
    data_materials: 'Выгрузка логов кликов и 500k покупок за 12 месяцев (CSV/Parquet анонимизированные), API-схема товарного каталога.',
    expected_result: 'Двухуровневая модель рекомендаций (ALS + LightFM), упакованная в легковесный микросервис на FastAPI в Docker-контейнере.',
    success_criteria: 'Метрика NDCG@10 >= 0.28 на тестовом наборе, задержка ответа сервиса < 70мс при 100 RPS.',
    constraints: 'Срок реализации: 6 недель. Стек: Python 3.11+, PyTorch/Scikit-learn, FastAPI, Docker.',
    target_users: 'Покупатели интернет-магазина (веб и мобильная версии), формирующие персональную выдачу.',
    business_contact: 'Еженедельный созвон по средам 15:00 с ML-лидом компании, канал в Telegram @retailtech_mentors.',
    attachment_key: 'brief-ecommerce-recsys.pdf',
    attachment_name: 'Project_Brief_RecSys_v1.pdf'
  },
  {
    title: 'Редизайн мобильного приложения студенческого кампуса',
    category: 'Design',
    owner: 'CampusVibe Media (product@campusvibe.org)',
    status: 'Published',
    priority: 'Medium',
    tags: 'Figma, UI/UX, Mobile Design, User Testing, Prototyping',
    last_updated: '2026-09-22',
    context_need: 'Существующее студенческое приложение имеет сложный интерфейс с перегруженной навигацией, студенты теряют информацию об академических событиях и хакатонах.',
    data_materials: 'Текущие экраны в Figma, результаты опроса 200 студентов университета, брендбук и гайдлайны.',
    expected_result: 'Полный дизайн-кит компонентов в Figma с auto-layout и интерактивный кликабельный прототип 5 ключевых сценариев.',
    success_criteria: 'Успешное прохождение коридорного юзабилити-тестирования не менее чем на 8 студентах с оценкой SUS >= 80.',
    constraints: 'Срок: 4 недели. Соблюдение стандартов доступности WCAG AA (контрастность, размеры тач-таргетов).',
    target_users: 'Студенты бакалавриата и магистратуры, старосты и организаторы студенческих мероприятий.',
    business_contact: 'Арт-директор CampusVibe, еженедельные дизайн-ревью по пятницам в Discord.',
    attachment_key: 'wireframes-campusvibe.pdf',
    attachment_name: 'CampusVibe_Early_Sketches.pdf'
  },
  {
    title: 'Автоматический генератор счетов и налоговых отчетов',
    category: 'Engineering',
    owner: 'FintechWorks Accounting (tech-lead@fintechworks.com)',
    status: 'Published',
    priority: 'High',
    tags: 'Java, Spring Boot, PostgreSQL, PDFBox, REST API',
    last_updated: '2026-09-23',
    context_need: 'Бухгалтеры малого бизнеса тратят десятки часов в месяц на ручную подготовку счетов и подсчет регионального НДС при трансграничных цифровых услугах.',
    data_materials: 'Примеры входных JSON-транзакций, таблица ставок налогообложения стран ЕС и СНГ, утвержденные шаблоны PDF счетов.',
    expected_result: 'REST-микросервис на Java/Spring Boot с базой PostgreSQL, генерирующий брендированные PDF и выгрузку сводных XLSX отчетов.',
    success_criteria: '100% точность расчета ставок по тестовым сценариям, покрытие юнит-тестами >= 85%, генерация PDF < 300мс.',
    constraints: 'Срок: 5 недель. Стек: Java 21, Spring Boot 3, PostgreSQL, Apache PDFBox.',
    target_users: 'Владельцы малого бизнеса, бухгалтеры и финансовые менеджеры IT-компаний.',
    business_contact: 'Главный архитектор FintechWorks, еженедельный спринт-митинг и код-ревью в GitHub.',
    attachment_key: 'tax-rules-spec.pdf',
    attachment_name: 'Tax_Compliance_Requirements_2026.pdf'
  },
  {
    title: 'B2B анализ рынка накопителей «зеленой» энергии',
    category: 'Business',
    owner: 'EcoPower Global (research@ecopower.eu)',
    status: 'Published',
    priority: 'Medium',
    tags: 'Market Research, CleanTech, Strategy, Financial Modeling',
    last_updated: '2026-09-20',
    context_need: 'Компания планирует запуск коммерческих систем накопления энергии (BESS) и нуждается в комплексном анализе регуляторных стимулов и игроков.',
    data_materials: 'Открытые отчеты системных операторов энергосетей, данные Eurostat и отраслевые бенчмарки.',
    expected_result: 'Финансовая модель в Excel с прогнозом емкости рынка (TAM/SAM/SOM) на 5 лет и презентация на 15 слайдов.',
    success_criteria: 'Верифицированные расчеты LCOS (нормированная стоимость хранения) и анализ топ-5 конкурентов в 3 странах.',
    constraints: 'Срок: 4 недели. Фокусные страны: Польша, Испания, Германия.',
    target_users: 'Инвестиционный комитет и директор по развитию EcoPower Global.',
    business_contact: 'Инвестиционный директор, регулярные консультации два раза в месяц.',
    attachment_key: null,
    attachment_name: null
  },
  {
    title: 'Telegram-бот базы знаний компании с поиском по документам',
    category: 'Engineering',
    owner: 'DevSquad Internal Tools (ops@devsquad.team)',
    status: 'In Progress',
    priority: 'Medium',
    tags: 'TypeScript, Node.js, Telegram Bot, Vector DB, RAG',
    last_updated: '2026-09-21',
    context_need: 'Инженеры тратят слишком много времени на поиск внутренних инструкций по онбордингу и регламентов дежурств.',
    data_materials: 'Экспорт внутренних статей в формате Markdown, документация по инфраструктуре компании.',
    expected_result: 'Telegram-бот с семантическим поиском по документам и цитированием первоисточников.',
    success_criteria: 'Корректный ответ на 9 из 10 тестовых типовых вопросов сотрудников.',
    constraints: 'Срок: 3 недели. Node.js/TypeScript, библиотека Telegraf, встраиваемая векторная БД.',
    target_users: 'Инженеры и разработчики компании.',
    business_contact: 'DevOps лид, ежедневные стендапы.',
    attachment_key: 'slack-bot-architecture.png',
    attachment_name: 'Architecture_Diagram_Bot.png'
  },
  {
    title: 'хотим сайт для обуви',
    category: 'Design',
    owner: 'SoloFounder (shop@shoes.kz)',
    status: 'Draft',
    priority: 'Low',
    tags: 'web, магазин',
    last_updated: '2026-09-15',
    context_need: 'Нужен простой сайт чтобы продавать кроссовки. Быстро и дешево.',
    data_materials: '',
    expected_result: '',
    success_criteria: '',
    constraints: '',
    target_users: '',
    business_contact: 'Пишите на почту.',
    attachment_key: null,
    attachment_name: null
  },
  {
    title: 'Модель прогнозирования оттока корпоративных клиентов',
    category: 'Data',
    owner: 'Telecom Data Science (ds-team@telecomglobal.com)',
    status: 'Published',
    priority: 'High',
    tags: 'Python, Scikit-Learn, XGBoost, SQL, Churn',
    last_updated: '2026-09-22',
    context_need: 'Отток ключевых B2B клиентов обходится оператору слишком дорого. Необходимо заранее выявлять абонентов в зоне риска.',
    data_materials: 'Обезличенный массив истории обращений в поддержку, объемов трафика и платежей за 2 года.',
    expected_result: 'Обученный классификатор XGBoost с пайплайном ежедневного скоринга и SHAP-интерпретацией факторов.',
    success_criteria: 'Метрика ROC-AUC >= 0.84 при Recall >= 0.70 на отложенной выборке.',
    constraints: 'Срок: 5 недель. Python, Git, воспроизводимый Jupyter ноутбук.',
    target_users: 'Служба удержания корпоративных клиентов.',
    business_contact: 'Главный дата-сайентист телекома, еженедельные созвоны по понедельникам.',
    attachment_key: 'churn-dataset-schema.pdf',
    attachment_name: 'Telecom_Churn_Schema_v2.pdf'
  },
  {
    title: 'Разработка бренд-платформы для телемедицинского стартапа',
    category: 'Design',
    owner: 'MedStart Co',
    status: 'Needs Info',
    priority: 'Low',
    tags: 'Branding, Logo, MedTech',
    last_updated: '2026-09-18',
    context_need: 'Медицинскому стартапу нужен логотип и фирменный стиль, позиционирование еще в процессе утверждения.',
    data_materials: 'Краткое описание целевой аудитории (пациенты клиник).',
    expected_result: 'Логотип и цветовая палитра.',
    success_criteria: 'Одобрение основателями стартапа.',
    constraints: 'Срок: 2-3 недели.',
    target_users: 'Пациенты онлайн-клиники.',
    business_contact: 'CEO стартапа.',
    attachment_key: null,
    attachment_name: null
  }
];

export const HACKATHON_PROPOSALS = [
  {
    task_index: 0, // RecSys
    user_email: 'team-alphas@cs.edu',
    team_name: 'CyberAlphas Team',
    student_name: 'Дана Исаева',
    student_contact: 'dana@cs.edu (TG: @dana_ml)',
    solution_idea: 'Предлагаем гибридный подход: быстрый отбор кандидатов через факторизацию матриц (implicit ALS) + нейросетевое ранжирование с учетом времени суток и категории последнего просмотра. Развертывание в Docker с кэшированием в Redis для задержки < 50мс.',
    plan: '1 неделя: разведочный анализ данных и baseline. 2-3 неделя: обучение гибридной модели и валидация по NDCG@10. 4 неделя: упаковка в FastAPI и Docker. 5-6 неделя: нагрузочное тестирование и передача документации.',
    timeline: '6 недель (первый прототип через 14 дней)',
    prototype_url: 'https://github.com/cyber-alphas/recsys-starter-poc',
    status: 'Shortlisted',
    stage_points_awarded: 50,
    created_at: '2026-09-22T10:30:00Z',
    attachment_key: 'resume-alex-rivera.pdf',
    attachment_name: 'CyberAlphas_Portfolio_2026.pdf'
  },
  {
    task_index: 1, // Mobile UX/UI
    user_email: 'maya.design@uni.edu',
    team_name: 'PixelCrafters UX',
    student_name: 'Майя Чен',
    student_contact: 'maya.design@uni.edu (TG: @maya_ux)',
    solution_idea: 'Создадим модульную дизайн-систему в Figma с едиными токенами и атомарными компонентами. Разработаем интерфейс с акцентом на быструю фильтрацию мероприятий кампуса в 1 тап и проведем очное тестирование на студентах нашего факультета.',
    plan: '1 этап: CustDev и CJM ключевых сценариев. 2 этап: Wireframes и кликабельный низкодетализированный прототип. 3 этап: UI-кит и дизайн высокой точности. 4 этап: тестирование прототипа и сдача дизайн-системы.',
    timeline: '4 недели',
    prototype_url: 'https://www.figma.com/community/file/student-campus-design',
    status: 'Selected',
    stage_points_awarded: 100, // Awarded 100 XP for stage completion!
    created_at: '2026-09-22T14:15:00Z',
    attachment_key: 'portfolio-maya-chen.pdf',
    attachment_name: 'Maya_Chen_Design_Portfolio.pdf'
  },
  {
    task_index: 2, // Invoicing Java
    user_email: 'team-alphas@cs.edu',
    team_name: 'CyberAlphas Team',
    student_name: 'Дана Исаева',
    student_contact: 'dana@cs.edu',
    solution_idea: 'Реализуем Spring Boot сервис со строгой изоляцией расчета налогов (стратегия паттерна Strategy). Для PDF используем предкомпилированные шаблоны Apache PDFBox, что гарантирует время генерации менее 150мс.',
    plan: 'Неделя 1: проектирование схемы БД и Liquibase/Flyway миграции. Неделя 2: калькулятор ставок налогов и 100% тест-кейсов. Неделя 3: генерация PDF и выгрузка отчетов. Неделя 4: Swagger и нагрузочные тесты.',
    timeline: '4-5 недель',
    prototype_url: 'https://github.com/cyber-alphas/spring-invoice-tax-poc',
    status: 'Submitted',
    stage_points_awarded: 0,
    created_at: '2026-09-23T08:10:00Z',
    attachment_key: null,
    attachment_name: null
  }
];

export async function seedDatabase(db: any) {
  // Clear existing
  db.prepare('DELETE FROM feedback').run();
  db.prepare('DELETE FROM proposals').run();
  db.prepare('DELETE FROM tasks').run();
  db.prepare('DELETE FROM users').run();

  const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash, name, role, organization, team_name, skills, interests, xp_points, created_at)
    VALUES (@email, @password_hash, @name, @role, @organization, @team_name, @skills, @interests, @xp_points, @created_at)
  `);

  const userIds: Record<string, number> = {};

  const now = new Date().toISOString();

  for (const u of DEMO_USERS) {
    const password_hash = await bcrypt.hash(u.password, 10);
    const res = insertUser.run({
      email: u.email,
      password_hash,
      name: u.name,
      role: u.role,
      organization: u.organization,
      team_name: u.team_name,
      skills: u.skills,
      interests: u.interests,
      xp_points: u.xp_points,
      created_at: now
    });
    userIds[u.email] = Number(res.lastInsertRowid);
  }

  const insertTask = db.prepare(`
    INSERT INTO tasks (
      title, category, owner_id, owner, status, priority, tags,
      context_need, data_materials, expected_result, success_criteria, constraints, target_users, business_contact,
      notes, readiness_score, readiness_tier, last_updated, attachment_key, attachment_name
    ) VALUES (
      @title, @category, @owner_id, @owner, @status, @priority, @tags,
      @context_need, @data_materials, @expected_result, @success_criteria, @constraints, @target_users, @business_contact,
      @notes, @readiness_score, @readiness_tier, @last_updated, @attachment_key, @attachment_name
    )
  `);

  const taskIds: number[] = [];

  for (const t of HACKATHON_TASKS) {
    const scoreResult = calculateReadinessScore(t);
    const combinedNotes = `### 1. Контекст и проблема\n${t.context_need}\n\n### 2. Данные и материалы\n${t.data_materials}\n\n### 3. Ожидаемый результат\n${t.expected_result}\n\n### 4. Критерии успеха\n${t.success_criteria}\n\n### 5. Ограничения и стек\n${t.constraints}\n\n### 6. Целевые пользователи\n${t.target_users}\n\n### 7. Формат связи с бизнесом\n${t.business_contact}`;

    const res = insertTask.run({
      title: t.title,
      category: t.category,
      owner_id: userIds['tech-lead@fintechworks.com'] || null,
      owner: t.owner,
      status: t.status,
      priority: t.priority,
      tags: t.tags,
      context_need: t.context_need,
      data_materials: t.data_materials,
      expected_result: t.expected_result,
      success_criteria: t.success_criteria,
      constraints: t.constraints,
      target_users: t.target_users,
      business_contact: t.business_contact,
      notes: combinedNotes,
      readiness_score: scoreResult.score,
      readiness_tier: scoreResult.tier,
      last_updated: t.last_updated,
      attachment_key: t.attachment_key,
      attachment_name: t.attachment_name
    });
    taskIds.push(Number(res.lastInsertRowid));
  }

  const insertProposal = db.prepare(`
    INSERT INTO proposals (
      task_id, student_id, team_name, student_name, student_contact,
      solution_idea, plan, timeline, prototype_url, pitch,
      status, stage_points_awarded, created_at, attachment_key, attachment_name
    ) VALUES (
      @task_id, @student_id, @team_name, @student_name, @student_contact,
      @solution_idea, @plan, @timeline, @prototype_url, @pitch,
      @status, @stage_points_awarded, @created_at, @attachment_key, @attachment_name
    )
  `);

  for (const p of HACKATHON_PROPOSALS) {
    const taskId = taskIds[p.task_index];
    const studentId = userIds[p.user_email] || null;
    if (taskId) {
      insertProposal.run({
        task_id: taskId,
        student_id: studentId,
        team_name: p.team_name,
        student_name: p.student_name,
        student_contact: p.student_contact,
        solution_idea: p.solution_idea,
        plan: p.plan,
        timeline: p.timeline,
        prototype_url: p.prototype_url,
        pitch: `${p.solution_idea}\n\nПлан:\n${p.plan}\n\nСроки: ${p.timeline}\nСсылка: ${p.prototype_url}`,
        status: p.status,
        stage_points_awarded: p.stage_points_awarded,
        created_at: p.created_at,
        attachment_key: p.attachment_key,
        attachment_name: p.attachment_name
      });
    }
  }

  const insertFeedback = db.prepare(`
    INSERT INTO feedback (task_id, user_name, feedback_type, content, created_at)
    VALUES (@task_id, @user_name, @feedback_type, @content, @created_at)
  `);

  insertFeedback.run({
    task_id: taskIds[0],
    user_name: 'Алексей Смирнов (Бизнес)',
    feedback_type: 'platform',
    content: 'AI-уточнение задачи сэкономило массу времени. Отклики студентов пришли структурированные и по делу!',
    created_at: now
  });

  insertFeedback.run({
    task_id: taskIds[1],
    user_name: 'Дана Исаева (Студентка)',
    feedback_type: 'task',
    content: 'Очень удобно, что задачи в каталоге ранжируются по готовности. Сразу понятно, где проект проработан бизнесом.',
    created_at: now
  });
}
