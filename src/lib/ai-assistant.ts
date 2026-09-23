import { ClarifyingQuestion, TaskCategory } from './types';

export interface DraftAnalysisResult {
  estimatedScore: number;
  missingAreas: string[];
  questions: ClarifyingQuestion[];
}

export function analyzeDraftAndGenerateQuestions(
  draftText: string,
  category: TaskCategory = 'Engineering'
): DraftAnalysisResult {
  const text = (draftText || '').toLowerCase();
  const questions: ClarifyingQuestion[] = [];
  const missingAreas: string[] = [];

  // Check Data & Materials
  const hasData = /данн|материал|csv|файл|баз|апи|api|таблиц|схем|пример|логи|датасет|dataset/i.test(text);
  if (!hasData) {
    missingAreas.push('Исходные данные и материалы');
    questions.push({
      id: 'data_materials',
      targetField: 'data_materials',
      question: 'Какие исходные данные, файлы или примеры вы сможете предоставить студенческой команде?',
      whyNeeded: 'Студентам важно понимать, есть ли готовый датасет/API или данные нужно собирать с нуля (+20 баллов).',
      placeholder: 'Например: Выгрузка транзакций в CSV за 6 месяцев (анонимизировано), документация к REST API.'
    });
  }

  // Check Criteria & Metrics
  const hasCriteria = /критер|метрик|оценк|точност|roc|f1|приемк|тест|конверси|результат|скорост/i.test(text);
  if (!hasCriteria) {
    missingAreas.push('Критерии успеха и приемки');
    questions.push({
      id: 'success_criteria',
      targetField: 'success_criteria',
      question: 'По каким измеримым критериям вы будете оценивать успешность выполнения задачи?',
      whyNeeded: 'Измеримые критерии защищают бизнес от нецелевого результата и мотивируют команду (+15 баллов).',
      placeholder: 'Например: Точность модели ROC-AUC >= 0.82, отклик API < 100мс, либо успешное тестирование на 5 клиентах.'
    });
  }

  // Check Expected Result / Deliverable
  const hasResult = /ожида|артефакт|сделать|разработ|создать|бот|сервис|приложен|прототип|отчет/i.test(text);
  if (!hasResult || text.length < 50) {
    missingAreas.push('Ожидаемый результат');
    questions.push({
      id: 'expected_result',
      targetField: 'expected_result',
      question: 'Какой конкретный итоговый артефакт должна сдать команда по окончании проекта?',
      whyNeeded: 'Определяет границы сдачи работ: код в Git репозитории, рабочий прототип или отчет (+15 баллов).',
      placeholder: 'Например: Исходный код сервиса с Dockerfile, Swagger-документация и инструкция по развертыванию.'
    });
  }

  // Check Constraints & Tech Stack
  const hasConstraints = /ограничен|стек|срок|недел|месяц|технолог|язык|python|java|react|figma|дедлайн/i.test(text);
  if (!hasConstraints) {
    missingAreas.push('Ограничения и предпочтительный стек');
    questions.push({
      id: 'constraints',
      targetField: 'constraints',
      question: 'Есть ли ограничения по срокам, технологическому стеку или доступам?',
      whyNeeded: 'Помогает командам сразу оценить свои компетенции и тайминг (+10 баллов).',
      placeholder: 'Например: Срок реализации — 4-6 недель. Стек: Python/FastAPI или React. Доступы предоставим через VPN.'
    });
  }

  // Check Target Users
  const hasUsers = /пользовател|клиент|менеджер|сотрудник|аудитори|кто будет/i.test(text);
  if (!hasUsers) {
    missingAreas.push('Целевые пользователи');
    questions.push({
      id: 'target_users',
      targetField: 'target_users',
      question: 'Для кого создается решение и кто будет его конечным пользователем?',
      whyNeeded: 'Позволяет студентам спроектировать правильный UX и сценарии взаимодействия (+10 баллов).',
      placeholder: 'Например: Внутренние менеджеры по продажам или розничные покупатели мобильного приложения.'
    });
  }

  // Check Business Contact & Feedback
  const hasContact = /контакт|связ|созвон|встреч|telegram|почт|email|ментор|куратор/i.test(text);
  if (!hasContact) {
    missingAreas.push('Формат взаимодействия и обратной связи');
    questions.push({
      id: 'business_contact',
      targetField: 'business_contact',
      question: 'Как часто вы готовы давать обратную связь и консультировать команду?',
      whyNeeded: 'Студенты должны знать, что их проект будет курироваться экспертом со стороны бизнеса (+10 баллов).',
      placeholder: 'Например: Еженедельный созвон по пятницам (30 мин) и оперативная связь в Telegram-чате.'
    });
  }

  // Ensure at least 3 questions are always generated
  if (questions.length < 3) {
    questions.push({
      id: 'context_details',
      targetField: 'context_need',
      question: 'Что происходит в компании сейчас и почему эту задачу важно решить именно в ближайшие месяцы?',
      whyNeeded: 'Глубокий контекст задачи привлекает самых сильных и мотивированных студентов.',
      placeholder: 'Например: Ручная обработка занимает до 40 часов в неделю, из-за чего растет отток клиентов.'
    });
  }

  // Estimate initial score based on text richness
  let estimatedScore = 20;
  if (text.length > 50) estimatedScore += 10;
  if (text.length > 150) estimatedScore += 15;
  if (hasData) estimatedScore += 15;
  if (hasCriteria) estimatedScore += 15;
  if (hasResult) estimatedScore += 10;
  estimatedScore = Math.min(65, estimatedScore);

  return {
    estimatedScore,
    missingAreas,
    questions: questions.slice(0, 4) // Present top 3-4 most critical questions
  };
}

export function synthesizeTaskCard(
  title: string,
  category: TaskCategory,
  initialDraft: string,
  answers: Record<string, string>,
  ownerInfo: { name: string; organization?: string; contact?: string }
) {
  const contextNeed = answers['context_need'] || answers['context_details'] || initialDraft;
  const dataMaterials = answers['data_materials'] || 'Данные будут предоставлены куратором после согласования плана работы.';
  const expectedResult = answers['expected_result'] || 'Рабочий программный прототип с документацией и демонстрацией.';
  const successCriteria = answers['success_criteria'] || 'Выполнение согласованного технического задания и прохождение приемки.';
  const constraints = answers['constraints'] || 'Срок выполнения: 4-6 недель. Стек технологий согласовывается с командой.';
  const targetUsers = answers['target_users'] || 'Целевая аудитория и пользователи продукта компании.';
  const businessContact = answers['business_contact'] || `${ownerInfo.name} (${ownerInfo.organization || 'Бизнес-партнер'}), регулярные консультации.`;

  const fullNotes = `### 1. Контекст и проблема
${contextNeed}

### 2. Данные и материалы
${dataMaterials}

### 3. Ожидаемый результат
${expectedResult}

### 4. Критерии успеха
${successCriteria}

### 5. Ограничения и стек
${constraints}

### 6. Целевые пользователи
${targetUsers}

### 7. Формат связи с бизнесом
${businessContact}`;

  return {
    title: title.trim() || 'Разработка решения бизнес-задачи',
    category,
    context_need: contextNeed,
    data_materials: dataMaterials,
    expected_result: expectedResult,
    success_criteria: successCriteria,
    constraints,
    target_users: targetUsers,
    business_contact: businessContact,
    notes: fullNotes
  };
}

export function matchTaskForTeam(
  task: { category: string; tags: string; title: string; notes: string },
  teamSkills?: string | null,
  teamInterests?: string | null
): { matchPercentage: number; isRecommended: boolean; reason: string } {
  if (!teamSkills && !teamInterests) {
    return { matchPercentage: 0, isRecommended: false, reason: '' };
  }

  const taskText = `${task.category} ${task.tags} ${task.title} ${task.notes}`.toLowerCase();
  const skills = (teamSkills || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
  const interests = (teamInterests || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);

  let matchPoints = 0;
  const matchedTokens: string[] = [];

  for (const s of skills) {
    if (taskText.includes(s)) {
      matchPoints += 30;
      matchedTokens.push(s);
    }
  }

  for (const int of interests) {
    if (taskText.includes(int)) {
      matchPoints += 25;
      matchedTokens.push(int);
    }
  }

  const matchPercentage = Math.min(98, Math.max(20, matchPoints));
  const isRecommended = matchPercentage >= 65;

  let reason = '';
  if (isRecommended && matchedTokens.length > 0) {
    reason = `Рекомендовано вам: совпадение по навыкам (${matchedTokens.slice(0, 3).join(', ')})`;
  }

  return { matchPercentage, isRecommended, reason };
}
