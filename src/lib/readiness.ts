import { ReadinessScoreResult, ReadinessTier, Task } from './types';

export function calculateReadinessScore(task: Partial<Task> | {
  title?: string;
  context_need?: string;
  data_materials?: string;
  expected_result?: string;
  success_criteria?: string;
  constraints?: string;
  target_users?: string;
  business_contact?: string;
  notes?: string;
}): ReadinessScoreResult {
  const breakdown: ReadinessScoreResult['breakdown'] = [];
  const missingFields: string[] = [];
  const suggestions: string[] = [];

  // Helper to score text depth
  const evalField = (
    fieldKey: string,
    label: string,
    val: string | undefined,
    maxPoints: number,
    minChars: number,
    detailedChars: number,
    tipIfMissing: string
  ) => {
    const text = (val || '').trim();
    let points = 0;
    let passed = false;

    if (text.length >= detailedChars) {
      points = maxPoints;
      passed = true;
    } else if (text.length >= minChars) {
      points = Math.round(maxPoints * 0.6);
      passed = true;
    } else if (text.length > 0) {
      points = Math.round(maxPoints * 0.3);
    }

    if (points < maxPoints) {
      missingFields.push(label);
      suggestions.push(tipIfMissing);
    }

    breakdown.push({
      field: fieldKey,
      label,
      points,
      maxPoints,
      passed,
      suggestion: points >= maxPoints ? 'Полностью заполнено' : tipIfMissing
    });

    return points;
  };

  // If new structured fields are present, use them.
  // If only legacy `notes` is provided (e.g. from an initial informal draft), we inspect keywords.
  let contextNeed = task.context_need;
  let dataMaterials = task.data_materials;
  let expectedResult = task.expected_result;
  let successCriteria = task.success_criteria;
  let constraints = task.constraints;
  let targetUsers = task.target_users;
  let businessContact = task.business_contact;

  // Fallback for informal single-field drafts
  if (!contextNeed && task.notes) {
    contextNeed = task.notes;
  }

  // 1. Контекст и потребность (20 баллов): Понятно, что происходит сейчас и что необходимо изменить
  const p1 = evalField(
    'context_need',
    'Контекст и потребность',
    contextNeed,
    20,
    30,
    80,
    'Опишите подробнее, что происходит сейчас в бизнесе и какую конкретно проблему требуется решить.'
  );

  // 2. Данные и материалы (20 баллов): Указаны доступные данные, примеры или источники
  const p2 = evalField(
    'data_materials',
    'Данные и материалы',
    dataMaterials,
    20,
    25,
    60,
    'Укажите, какие данные, файлы, API или примеры материалов вы предоставите студентам.'
  );

  // 3. Ожидаемый результат (15 баллов): Описан конкретный результат работы команды
  const p3 = evalField(
    'expected_result',
    'Ожидаемый результат',
    expectedResult,
    15,
    20,
    50,
    'Сформулируйте конкретный артефакт (код, прототип в Figma, обученная модель, аналитический отчет).'
  );

  // 4. Критерии успеха (15 баллов): Есть измеримые признаки принятия решения
  const p4 = evalField(
    'success_criteria',
    'Критерии успеха',
    successCriteria,
    15,
    20,
    50,
    'Добавьте измеримые критерии приемки (например, точность метрики, время отклика, проверка на 5 пользователях).'
  );

  // 5. Ограничения (10 баллов): Указаны сроки, технологии, доступы или иные границы
  const p5 = evalField(
    'constraints',
    'Ограничения и стек',
    constraints,
    10,
    15,
    40,
    'Укажите сроки реализации, предпочтительный технологический стек или ограничения доступа.'
  );

  // 6. Пользователи (10 баллов): Понятно, для кого создаётся решение
  const p6 = evalField(
    'target_users',
    'Целевые пользователи',
    targetUsers,
    10,
    10,
    30,
    'Опишите, кто будет непосредственным пользователем создаваемого решения.'
  );

  // 7. Связь с бизнесом (10 баллов): Есть контакт, формат консультаций и порядок обратной связи
  const p7 = evalField(
    'business_contact',
    'Связь с бизнесом',
    businessContact,
    10,
    10,
    30,
    'Укажите контактное лицо (email/telegram) и регулярность встреч (например, еженедельные созвоны).'
  );

  const totalScore = Math.max(0, Math.min(100, p1 + p2 + p3 + p4 + p5 + p6 + p7));

  // Determine readiness tier according to hackathon specifications:
  // 0–39: черновик
  // 40–69: рабочая
  // 70–89: готовая
  // 90–100: приоритетная
  let tier: ReadinessTier = 'draft';
  let tierLabel = 'Черновик (требует уточнения)';
  let tierBadgeColor = 'bg-rose-50 text-rose-700 border-rose-200';

  if (totalScore >= 90) {
    tier = 'priority';
    tierLabel = 'Приоритетная (готова к работе)';
    tierBadgeColor = 'bg-purple-50 text-purple-700 border-purple-300 ring-2 ring-purple-200';
  } else if (totalScore >= 70) {
    tier = 'ready';
    tierLabel = 'Готовая задача';
    tierBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (totalScore >= 40) {
    tier = 'working';
    tierLabel = 'Рабочая задача';
    tierBadgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return {
    score: totalScore,
    tier,
    tierLabel,
    tierBadgeColor,
    breakdown,
    missingFields,
    suggestions: suggestions.length > 0 ? suggestions : ['Карточка заполнена безупречно и готова к публикации!']
  };
}
