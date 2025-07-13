# Resu 📦

**Легковесная система управления результатами для TypeScript с максимальной совместимостью и нулевыми накладными расходами.**

Resu — это практичная альтернатива сложным функциональным библиотекам для обработки ошибок, созданная для разработчиков, которые ценят простоту, производительность и готовность к production. Библиотека предоставляет типобезопасную систему `Result` без академической сложности функционального программирования, сосредотачиваясь на том, что действительно нужно в повседневной разработке.

Философия библиотеки строится на трех принципах: **практичность над теорией**, **простота над абстракцией** и **совместимость над изоляцией**. Вместо заставления вас изучать десятки методов типа `map`, `flatMap`, `chain`, библиотека предоставляет минимальный, но мощный набор инструментов, которые решают реальные проблемы реальных проектов.

## 📦 Установка и быстрый старт

### Установка

```bash
npm install Resu
```

### Быстрый пример

```ts
import { Result, Flow } from 'Rambata/resu';

// Безопасная обработка данных без исключений
function processUserData(input: string): Result.Ok<User> | Result.Error<string> {
  // Парсинг с автоматическим перехватом исключений
  const jsonResult = Flow.Try.Sync(() => JSON.parse(input));
  if (Result.IsError(jsonResult)) {
    return Result.Error({ data: "Invalid JSON format", tag: "ParseError" });
  }

  // Валидация данных
  const user = jsonResult.data;
  if (!user.email || !user.name) {
    return Result.Error({ data: "Missing required fields", tag: "ValidationError" });
  }

  return Result.Ok({ data: user, tag: "UserProcessed" });
}

// Использование с полной типобезопасностью
const result = processUserData('{"name": "John", "email": "john@example.com"}');

if (Result.IsOk(result)) {
  console.log(`Пользователь: ${result.data.name}`); // ✅ Типобезопасный доступ
} else {
  console.error(`Ошибка ${result.tag}: ${result.data}`); // ✅ Категоризированная обработка
}
```

---

# Settings ⚙️

`Settings` — это система конфигурации библиотеки resu, определяющая поведение типизации и валидации возвращаемых значений во всех модулях. Система построена на принципе **"гибкость по умолчанию, строгость по выбору"** — библиотека изначально разрешает возвращать любые значения для простой интеграции, но предоставляет механизм включения строгой типизации для максимальной безопасности.

По умолчанию каждая функция библиотеки разрешает возвращать любые значения кроме `void` и `undefined`, обеспечивая простую интеграцию без необходимости явно создавать `Result` для каждого случая. Любые значения, отличные от `Result`, автоматически оборачиваются в `Result.Ok`. Однако такой подход создает риск, что значение, которое должно быть ошибкой, случайно будет возвращено как успешный результат.

```ts
// Гибкий режим (по умолчанию): любые значения разрешены
const flexibleFunction = Flow.Function.Sync((input: string) => {
  if (input === 'error') return null; // Станет Result.Ok<null>
  if (input === 'result') return Result.Error({ data: 'Real error' }); // Остается как есть
  return 'success'; // Станет Result.Ok<string>
});

// Строгий режим: только Result разрешены
declare module 'resu' {
  interface StrictSetting { enable: true }
}
```

### 🛠 Основные интерфейсы настроек

* 🔒 `StrictSetting` — глобальная настройка строгости для всех функций библиотеки
* ⚙️ `FunctionStrictSetting` — отдельная настройка строгости для `Flow.Function` методов
* 🎯 Module declaration через `declare module 'resu'` для активации настроек

---

## 🔓 Гибкий режим (по умолчанию)

В гибком режиме библиотека принимает любые возвращаемые значения и автоматически преобразует их в `Result`. Это обеспечивает простую интеграцию с существующим кодом и низкий порог входа для новых пользователей.

```ts
// По умолчанию все функции работают в гибком режиме
const anyValueFunction = Flow.Function.Sync((input: string) => {
  // ✅ Все варианты допустимы
  if (input === 'null') return null;
  if (input === 'string') return 'Hello World';
  if (input === 'object') return { data: 'test' };
  if (input === 'result') return Result.Ok({ data: 'explicit result' });

  return 42; // Любое значение будет обернуто в Result.Ok
});

// Flow.Match принимает любые обработчики
const matchResult = Flow.Match(someResult, {
  'ok': (r) => 'Success!', // Строка будет обернута в Result.Ok
  'error': (r) => Result.Error({ data: 'Handled error' }) // Явный Result
});
```

## 🔒 Строгий режим

Строгий режим требует, чтобы все функции возвращали только экземпляры `Result`, обеспечивая максимальную типобезопасность и предотвращая случайные ошибки.

```ts
// Включение глобального строгого режима
declare module 'resu' {
  interface StrictSetting { enable: true }
}

// Теперь все функции требуют Result
const strictFunction = Flow.Function.Sync((input: string) => {
  // ✅ Корректно - возвращает Result
  if (input.length === 0) {
    return Result.Error({ data: 'Empty input', tag: 'ValidationError' });
  }
  return Result.Ok({ data: input.toUpperCase(), tag: 'Processed' });

  // ❌ TypeScript ошибка - обычные значения не разрешены
  // return input.toUpperCase();
  // return null;
});
```

### ⚙️ Селективная строгость для Flow.Function

Строгость `Flow.Function` может настраиваться отдельно от глобальных настроек, что позволяет проводить постепенную миграцию.

```ts
declare module 'resu' {
  interface StrictSetting { enable: true } // Глобально строгий режим
  interface FunctionStrictSetting { enable: false } // Но Function остается гибким
}

// Flow.Try требует Result (глобальная настройка)
const strictTry = Flow.Try.Sync(() => {
  // ❌ Ошибка - нужен Result
  // return "string";
  return Result.Ok({ data: "wrapped string" }); // ✅ Корректно
});

// Flow.Function остается гибким (локальная настройка)
const flexibleFunc = Flow.Function.Sync((input: string) => {
  return input.toUpperCase(); // ✅ Разрешено благодаря FunctionStrictSetting
});
```

> Для новых проектов рекомендуется включать строгий режим для максимальной типовой безопасности.

---

# Flow ⚡

`Flow` — это пространство имён для управления потоком выполнения и композиции операций с `Result`. Модуль предоставляет инструменты для безопасного выполнения потенциально опасных операций, автоматически перехватывая исключения и преобразуя их в типобезопасные `Result`. Философия Flow основана на принципе **"исключения не должны прерывать поток выполнения"** — вместо этого все ошибки становятся явными значениями, которыми можно управлять.

Flow решает ключевую проблему интеграции с существующим кодом: множество библиотек и API выбрасывают исключения, но при работе с Result-based архитектурой нужны гарантии возврата `Result`. Модуль предоставляет безопасные обёртки, которые ловят любые исключения и превращают их в предсказуемые `Result.Error`.

```ts
// ❌ Проблема: API может выбросить исключение
function riskyJsonParse(json: string): ParsedData {
  return JSON.parse(json); // SyntaxError!
}

// ✅ Решение: Flow.Try гарантирует Result
const safeResult = Flow.Try.Sync(() => JSON.parse(json));
// Результат: Result.Ok<ParsedData> | Result.Error<unknown>
```

### 🛠 Часто используемые методы

* 🛡️ `Flow.Try.Sync` — для безопасного выполнения синхронных операций с автоматическим перехватом исключений
* ⚡ `Flow.Try.Async` — для безопасного выполнения асинхронных операций с поддержкой отмены
* 🎯 `Flow.Match` — для элегантной обработки различных типов результатов через паттерн-матчинг
* 🔄 `Flow.Function` — для обертывания функций с гарантированным возвратом `Result`
* 🔗 `Flow.Pipe` — для создания цепочек обработки результатов с ранним выходом при ошибках

---

## 🛡️ Flow.Try - Безопасное выполнение

Позволяет выполнять любые операции (синхронные и асинхронные) с гарантией, что результат всегда будет `Result`, даже если исходная операция выбрасывает исключение. Это обеспечивает предсказуемость и композицию операций без необходимости обрабатывать исключения вручную.

```ts
// Демонстрация базового принципа работы
const safeOperation = Flow.Try.Sync(() => {
  // Любой код здесь не может "сломать" приложение исключением
  return JSON.parse(userInput); // Если выбросит SyntaxError - станет Result.Error
});
// Гарантированный результат: Result.Ok<ParsedData> | Result.Error<unknown>
```

### 🔄 Flow.Try.Sync - Синхронные операции

`Flow.Try.Sync` выполняет синхронные функции и автоматически ловит любые исключения, преобразуя их в `Result.Error`. Если функция выполняется успешно, результат оборачивается в `Result.Ok`.

```ts
// Простое выполнение с автоматической обработкой ошибок
const parseResult = Flow.Try.Sync(() => {
  return JSON.parse('{"valid": "json"}');
});
// => Result.Ok<{ valid: string }>

const errorResult = Flow.Try.Sync(() => {
  return JSON.parse('invalid json');
});
// => Result.Error<SyntaxError> с данными исключения

// Функция уже возвращает Result - проходит без изменений
const existingResult = Flow.Try.Sync(() => {
  return Result.Ok({ data: 'Already a Result', tag: 'Success' });
});
// => Result.Ok<string, 'Success'> (без двойного оборачивания)
```

#### 🎛️ Кастомная обработка ошибок

```ts
// Расширенная конфигурация с пользовательской обработкой ошибок
const configuredResult = Flow.Try.Sync({
  try: () => {
    const data = parseUserInput(userInput);
    validateBusinessRules(data);
    return data;
  },
  catch: (error) => Result.Error({
    tag: 'ValidationError',
    data: `Ошибка валидации: ${error.message}`
  })
});

// Работа с разными типами ошибок
const smartErrorHandling = Flow.Try.Sync({
  try: () => performDatabaseOperation(),
  catch: (error) => {
    if (error.code === 'ECONNREFUSED') {
      return Result.Error({ tag: 'ConnectionError', data: 'База данных недоступна' });
    }
    if (error.name === 'ValidationError') {
      return Result.Error({ tag: 'DataError', data: error.message });
    }
    return Result.Error({ tag: 'UnknownError', data: 'Неизвестная ошибка системы' });
  }
});
```

### ⚡ Flow.Try.Async - Асинхронные операции

`Flow.Try.Async` работает аналогично синхронной версии, но поддерживает Promise-based операции и предоставляет дополнительные возможности, включая отмену операций через AbortSignal.

```ts
// Простые асинхронные операции
const fetchResult = Flow.Try.Async(async () => {
  const response = await fetch('/api/data');
  return response.json();
});
// => Result.Ok<Data> | Result.Error<unknown>

// Операции с кастомной обработкой ошибок
const apiCall = Flow.Try.Async({
  try: async () => {
    const response = await fetch('/api/users');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },
  catch: (error) => Result.Error({
    tag: 'ApiError',
    data: `API вызов неудачен: ${error.message}`
  })
});

// Операции с поддержкой отмены
const controller = new AbortController();
const cancellableOperation = Flow.Try.Async({
  signal: controller.signal,
  try: async (signal) => {
    const response = await fetch('/api/long-operation', { signal });
    return response.json();
  },
  catch: (error) => Result.Error({ tag: 'OperationFailed', data: error.message })
});

// Можно отменить операцию
setTimeout(() => controller.abort(), 5000);
```

#### 🧠 Умное оборачивание значений

```ts
// Обычное значение -> Result.Ok
const stringResult = Flow.Try.Async(async () => {
  await delay(100);
  return "Hello World";
});
// => Result.Ok<string>

// Уже Result -> проходит как есть
const existingResult = Flow.Try.Async(async () => {
  const data = await loadData();
  return Result.Error({ tag: 'CustomError', data: 'My error' });
});
// => Result.Error<string, 'CustomError'> (без изменений)

// Promise с Result
const asyncResult = Flow.Try.Async(async () => {
  const data = await loadUserData();
  if (!data) {
    return Result.Error({ tag: 'NotFound', data: 'User not found' });
  }
  return Result.Ok({ tag: 'UserLoaded', data });
});
// => Result.Ok<UserData, 'UserLoaded'> | Result.Error<string, 'NotFound'>
```

---

## 🔄 Flow.Function - Обертывание функций

`Flow.Function` предоставляет обёртки для превращения обычных функций в функции, гарантированно возвращающие `Result`. Это особенно полезно для создания безопасных API и стандартизации возвращаемых типов в кодовой базе.

### 🔄 Flow.Function.Sync - Синхронные функции

`Flow.Function.Sync` оборачивает синхронную функцию, гарантируя что результат всегда будет `Result`. Если функция возвращает обычное значение, оно автоматически оборачивается в `Result.Ok`.

```ts
// Обертывание простой функции
const safeUppercase = Flow.Function.Sync((text: string) => {
  if (text.length === 0) {
    return Result.Error({ data: 'Empty string not allowed', tag: 'ValidationError' });
  }
  return Result.Ok({ data: text.toUpperCase(), tag: 'Processed' });
});

// Использование обернутой функции
const result = safeUppercase("hello");
// => Result.Ok<string, 'Processed'> | Result.Error<string, 'ValidationError'>

// В строгом режиме функция должна возвращать Result
const strictFunction = Flow.Function.Sync((input: number) => {
  return input > 0
    ? Result.Ok({ data: input * 2, tag: 'Doubled' })
    : Result.Error({ data: 'Negative input', tag: 'InvalidInput' });
});
```

### ⚡ Flow.Function.Async - Асинхронные функции

`Flow.Function.Async` работает аналогично, но для асинхронных функций, обеспечивая типобезопасность для Promise-based операций.

```ts
// Обертывание асинхронной функции
const safeApiCall = Flow.Function.Async(async (endpoint: string) => {
  if (!endpoint.startsWith('/api/')) {
    return Result.Error({ data: 'Invalid endpoint format', tag: 'ValidationError' });
  }

  const response = await fetch(endpoint);
  if (!response.ok) {
    return Result.Error({ data: `HTTP ${response.status}`, tag: 'HttpError' });
  }

  const data = await response.json();
  return Result.Ok({ data, tag: 'ApiSuccess' });
});

// Использование
const apiResult = await safeApiCall('/api/users');
// => Result.Ok<ApiData, 'ApiSuccess'> | Result.Error<string, 'ValidationError' | 'HttpError'>
```

---

## 🎯 Flow.Match - Паттерн-матчинг результатов

`Flow.Match` предоставляет элегантный способ обработки различных типов результатов через паттерн-матчинг. Функция позволяет определить обработчики для различных комбинаций `status` и `tag`, обеспечивая чистый и читаемый код для сложной логики ветвления.

```ts
// Базовое использование паттерн-матчинга
const handleUserResult = (result: Result.Ok<User> | Result.Error<string>) =>
  Flow.Match(result, {
    'ok': (r) => {
      console.log(`Пользователь загружен: ${r.data.name}`);
      return Result.Ok({ data: 'User processed', tag: 'Success' });
    },

    'error': (r) => {
      console.error(`Ошибка: ${r.data}`);
      return Result.Error({ data: 'Processing failed', tag: 'HandlingError' });
    }
  });
```

### 🏷️ Сложный матчинг с тегами

```ts
type ApiResult =
  | Result.Ok<Data, 'Success'>
  | Result.Error<string, 'ValidationError'>
  | Result.Error<string, 'NetworkError'>
  | Result.Error<string, 'AuthError'>;

const handleApiResult = (result: ApiResult) => Flow.Match(result, {
  // Точное соответствие статуса и тега
  'ok:Success': (r) => {
    logSuccess(r.data);
    return Result.Ok({ data: 'Data processed', tag: 'Processed' });
  },

  // Специфичные обработчики ошибок по тегам
  'error:ValidationError': (r) => {
    showUserError(r.data);
    return Result.Error({ data: 'Validation failed', tag: 'UserError' });
  },

  'error:NetworkError': (r) => {
    retryOperation();
    return Result.Error({ data: 'Network issue', tag: 'RetryableError' });
  },

  'error:AuthError': (r) => {
    redirectToLogin();
    return Result.Error({ data: 'Authentication required', tag: 'AuthRequired' });
  }
});
```

### 🔄 Матчинг как трансформация

```ts
// Преобразование результатов с разными стратегиями
const transformResult = (input: Result.Any) => Flow.Match(input, {
  'ok': (r) => {
    // Любой успешный результат преобразуется в стандартный формат
    return Result.Ok({
      data: { success: true, payload: r.data },
      tag: 'Normalized'
    });
  },

  'error': (r) => {
    // Любая ошибка логируется и нормализуется
    logError(r.tag, r.data);
    return Result.Error({
      data: { success: false, error: r.data },
      tag: 'NormalizedError'
    });
  }
});
```

---

## 🔗 Flow.Pipe - Цепочки обработки

`Flow.Pipe` создаёт цепочки (пайплайны) обработки результатов с автоматическим ранним выходом при ошибках. Если любая функция в цепочке возвращает `Result.Error`, выполнение останавливается и ошибка возвращается немедленно.

**Уникальная особенность**: `Flow.Pipe` объекты являются **итерируемыми**, что позволяет получать доступ к промежуточным результатам каждого шага цепочки. Это мощный инструмент для отладки, мониторинга и анализа сложных операций.

### 🔗 Flow.Pipe.Sync - Синхронные цепочки

```ts
// Создание цепочки обработки данных
const processUserData = Flow.Pipe.Sync(Result.Ok({ data: "john@example.com", tag: "Input" }))
  // Этап 1: Валидация email
  ((result) => {
    if (!result.data.includes('@')) {
      return Result.Error({ data: 'Invalid email format', tag: 'ValidationError' });
    }
    return Result.Ok({ data: result.data, tag: 'ValidEmail' });
  })
  // Этап 2: Нормализация (выполнится только если этап 1 успешен)
  ((result) => {
    const normalized = result.data.toLowerCase().trim();
    return Result.Ok({ data: normalized, tag: 'Normalized' });
  })
  // Этап 3: Создание пользователя
  ((result) => {
    const user = { id: Date.now(), email: result.data };
    return Result.Ok({ data: user, tag: 'UserCreated' });
  })
  (); // Выполнение цепочки

// Результат: Result.Ok<User, 'UserCreated'> | Result.Error<string, 'ValidationError'>
```

### ⚡ Flow.Pipe.Async - Асинхронные цепочки

```ts
// Асинхронная цепочка с сетевыми операциями
const userWorkflow = await Flow.Pipe.Async(Result.Ok({ data: "123", tag: "UserId" }))
  // Этап 1: Загрузка пользователя
  (async (result) => {
    const user = await loadUserFromDB(result.data);
    if (!user) {
      return Result.Error({ data: 'User not found', tag: 'NotFound' });
    }
    return Result.Ok({ data: user, tag: 'UserLoaded' });
  })
  // Этап 2: Валидация (может быть синхронной в асинхронной цепочке)
  ((result) => {
    if (!result.data.isActive) {
      return Result.Error({ data: 'User is inactive', tag: 'UserInactive' });
    }
    return Result.Ok({ data: result.data, tag: 'UserValidated' });
  })
  // Этап 3: Обновление профиля
  (async (result) => {
    const updated = await updateUserProfile(result.data);
    return Result.Ok({ data: updated, tag: 'ProfileUpdated' });
  })
  (); // Выполнение асинхронной цепочки

// Результат: Promise<Result.Ok<User, 'ProfileUpdated'> | Result.Error<string, 'NotFound' | 'UserInactive'>>
```

### 🔄 Итерирование цепочек для отладки

Одна из уникальных особенностей `Flow.Pipe` — возможность итерироваться по промежуточным результатам цепочки. Это позволяет отследить каждый шаг выполнения для отладки или аудита.

```ts
// Создание цепочки без немедленного выполнения
const pipeline = Flow.Pipe.Sync(Result.Ok({ data: 100, tag: "Initial" }))
  ((result) => Result.Ok({ data: result.data * 2, tag: 'Doubled' }))
  ((result) => Result.Ok({ data: result.data + 50, tag: 'Added' }))
  ((result) => Result.Ok({ data: result.data / 3, tag: 'Divided' }));

// Итерирование через промежуточные результаты
for (const stepResult of pipeline) {
  console.log(`Шаг: ${stepResult.tag}, Значение: ${stepResult.data}`);
}
// Вывод:
// Шаг: Initial, Значение: 100
// Шаг: Doubled, Значение: 200
// Шаг: Added, Значение: 250
// Шаг: Divided, Значение: 83.33

// Получение финального результата
const finalResult = pipeline();
console.log('Финальный результат:', finalResult);
```

### 🐛 Отладка с детальным логированием

```ts
// Создание цепочки с отслеживанием каждого шага
const debugPipeline = Flow.Pipe.Sync(Result.Ok({ data: "user@EXAMPLE.COM", tag: "RawInput" }))
  ((result) => {
    const trimmed = result.data.trim();
    return Result.Ok({ data: trimmed, tag: 'Trimmed' });
  })
  ((result) => {
    const lowercased = result.data.toLowerCase();
    return Result.Ok({ data: lowercased, tag: 'Lowercased' });
  })
  ((result) => {
    if (!result.data.includes('@')) {
      return Result.Error({ data: 'Invalid email', tag: 'ValidationError' });
    }
    return Result.Ok({ data: result.data, tag: 'Validated' });
  });

// Отладочная функция для анализа цепочки
function debugPipelineExecution(pipeline: any, label: string) {
  console.log(`🔍 Анализ цепочки: ${label}`);

  const steps: any[] = [];
  let stepNumber = 1;

  for (const stepResult of pipeline) {
    const stepInfo = {
      step: stepNumber++,
      status: stepResult.status,
      tag: stepResult.tag,
      data: stepResult.data
    };

    steps.push(stepInfo);
    console.log(`  📍 Шаг ${stepInfo.step}: [${stepInfo.status.toUpperCase()}] ${stepInfo.tag} -> ${stepInfo.data}`);

    // Если встретили ошибку, останавливаемся
    if (Result.IsError(stepResult)) {
      console.log(`  ❌ Цепочка прервана на шаге ${stepInfo.step}`);
      break;
    }
  }

  const finalResult = pipeline();
  console.log(`  🎯 Финальный результат: [${finalResult.status.toUpperCase()}] ${finalResult.tag || 'untagged'}`);

  return { steps, finalResult };
}

// Использование отладочной функции
const analysis = debugPipelineExecution(debugPipeline, "Обработка email");
```

### ⚡ Асинхронная итерация для мониторинга

```ts
// Асинхронная цепочка с мониторингом производительности
const monitoredAsyncPipeline = Flow.Pipe.Async(Result.Ok({ data: { userId: 123 }, tag: "Input" }))
  (async (result) => {
    await delay(100); // Симуляция загрузки
    return Result.Ok({ data: { ...result.data, profile: 'loaded' }, tag: 'ProfileLoaded' });
  })
  (async (result) => {
    await delay(200); // Симуляция валидации
    return Result.Ok({ data: { ...result.data, validated: true }, tag: 'Validated' });
  })
  (async (result) => {
    await delay(150); // Симуляция сохранения
    return Result.Ok({ data: { ...result.data, saved: true }, tag: 'Saved' });
  });

// Асинхронная функция мониторинга
async function monitorAsyncPipeline(pipeline: any, label: string) {
  console.log(`⚡ Мониторинг асинхронной цепочки: ${label}`);

  const startTime = Date.now();
  let stepStartTime = startTime;
  let stepNumber = 1;

  for await (const stepResult of pipeline) {
    const stepEndTime = Date.now();
    const stepDuration = stepEndTime - stepStartTime;
    const totalDuration = stepEndTime - startTime;

    console.log(`  ⏱️  Шаг ${stepNumber++}: [${stepResult.status.toUpperCase()}] ${stepResult.tag}`);
    console.log(`     Время шага: ${stepDuration}ms, Общее время: ${totalDuration}ms`);
    console.log(`     Данные: ${JSON.stringify(stepResult.data)}`);

    stepStartTime = stepEndTime;

    // Если встретили ошибку, останавливаемся
    if (Result.IsError(stepResult)) {
      console.log(`  ❌ Асинхронная цепочка прервана на шаге ${stepNumber - 1}`);
      break;
    }
  }

  const finalResult = await pipeline();
  const totalTime = Date.now() - startTime;
  console.log(`  🏁 Общее время выполнения: ${totalTime}ms`);

  return finalResult;
}

// Использование асинхронного мониторинга
const monitoredResult = await monitorAsyncPipeline(monitoredAsyncPipeline, "Обработка пользователя");
```

### 📊 Анализ производительности цепочек

```ts
// Утилита для профилирования цепочек
class PipelineProfiler {
  static profile<T>(pipeline: T, label: string = 'Pipeline') {
    const metrics = {
      label,
      steps: [] as Array<{step: number, tag: string, duration: number, status: string}>,
      totalDuration: 0,
      successful: true,
      errorStep: null as number | null
    };

    const startTime = performance.now();
    let stepStartTime = startTime;
    let stepNumber = 1;

    // Итерируемся по шагам цепочки
    for (const stepResult of pipeline as any) {
      const stepEndTime = performance.now();
      const stepDuration = stepEndTime - stepStartTime;

      const stepMetric = {
        step: stepNumber++,
        tag: stepResult.tag || 'untagged',
        duration: stepDuration,
        status: stepResult.status
      };

      metrics.steps.push(stepMetric);
      stepStartTime = stepEndTime;

      if (Result.IsError(stepResult)) {
        metrics.successful = false;
        metrics.errorStep = stepMetric.step;
        break;
      }
    }

    metrics.totalDuration = performance.now() - startTime;

    // Выполняем цепочку для получения финального результата
    const finalResult = (pipeline as any)();

    return { metrics, result: finalResult };
  }

  static printReport(analysis: ReturnType<typeof PipelineProfiler.profile>) {
    const { metrics, result } = analysis;

    console.log(`\n📊 Отчет производительности: ${metrics.label}`);
    console.log(`🎯 Результат: [${result.status.toUpperCase()}] ${result.tag || 'untagged'}`);
    console.log(`⏱️  Общее время: ${metrics.totalDuration.toFixed(2)}ms`);
    console.log(`${metrics.successful ? '✅' : '❌'} Успешно: ${metrics.successful}`);

    if (metrics.errorStep) {
      console.log(`🛑 Ошибка на шаге: ${metrics.errorStep}`);
    }

    console.log('\n📈 Детали по шагам:');
    metrics.steps.forEach(step => {
      const icon = step.status === 'ok' ? '✅' : '❌';
      console.log(`  ${icon} Шаг ${step.step}: ${step.tag} (${step.duration.toFixed(2)}ms)`);
    });

    // Анализ узких мест
    const slowestStep = metrics.steps.reduce((prev, current) =>
      prev.duration > current.duration ? prev : current
    );
    console.log(`\n🐌 Самый медленный шаг: ${slowestStep.tag} (${slowestStep.duration.toFixed(2)}ms)`);
  }
}

// Использование профайлера
const complexPipeline = Flow.Pipe.Sync(Result.Ok({ data: largeDataset, tag: "Input" }))
  ((result) => Result.Ok({ data: processData(result.data), tag: 'Processed' }))
  ((result) => Result.Ok({ data: validateData(result.data), tag: 'Validated' }))
  ((result) => Result.Ok({ data: transformData(result.data), tag: 'Transformed' }));

const analysis = PipelineProfiler.profile(complexPipeline, "Обработка большого датасета");
PipelineProfiler.printReport(analysis);
```

#### 🛑 Ранний выход при ошибках

```ts
// Демонстрация раннего выхода с итерированием
const chainWithEarlyExit = Flow.Pipe.Sync(Result.Ok({ data: 5, tag: "Input" }))
  ((result) => {
    const doubled = result.data * 2;
    return Result.Ok({ data: doubled, tag: 'Doubled' }); // Успешно: 10
  })
  ((result) => {
    // Эта функция вернет ошибку
    return Result.Error({ data: 'Artificial failure', tag: 'TestError' });
  })
  ((result) => {
    // ❌ Эта функция НЕ ВЫПОЛНИТСЯ из-за ошибки выше
    return Result.Ok({ data: result.data + 100, tag: 'WontExecute' });
  });

// Отслеживание того, где именно произошла ошибка
console.log('🔍 Отслеживание выполнения цепочки:');
for (const stepResult of chainWithEarlyExit) {
  console.log(`Шаг: ${stepResult.tag}, Статус: ${stepResult.status}`);
  if (Result.IsError(stepResult)) {
    console.log(`❌ Выполнение остановлено из-за ошибки: ${stepResult.data}`);
    break;
  }
}

// Результат: Result.Error<string, 'TestError'>
const finalResult = chainWithEarlyExit();
```

---

## 📋 Полная справка методов Flow

### 🛡️ Flow.Try:
| 🧩 Имя | 📦 Тип | ⚙️ Сигнатура | 📖 Описание |
|---------|---------|-------------|-------------|
| `Try.Sync` | метод | `Flow.Try.Sync<Ok, Error>(callback)` <br> `Flow.Try.Sync<Ok, Error>(config)` | 🔄 Безопасно выполняет синхронную функцию, автоматически ловя исключения. |
| `Try.Async` | метод | `Flow.Try.Async<Ok, Error>(callback)` <br> `Flow.Try.Async<Ok, Error>(config)` | ⚡ Безопасно выполняет асинхронную функцию с опциональной поддержкой отмены. |

### 🔄 Flow.Function:
| 🧩 Имя | 📦 Тип | ⚙️ Сигнатура | 📖 Описание |
|---------|---------|-------------|-------------|
| `Function.Sync` | метод | `Flow.Function.Sync<Args, Return>(fn)` | 🔄 Оборачивает синхронную функцию, гарантируя возврат Result. |
| `Function.Async` | метод | `Flow.Function.Async<Args, Return>(fn)` | ⚡ Оборачивает асинхронную функцию, гарантируя возврат Result. |

### 🎯 Flow.Match:
| 🧩 Имя | 📦 Тип | ⚙️ Сигнатура | 📖 Описание |
|---------|---------|-------------|-------------|
| `Match` | метод | `Flow.Match<Result, Matcher>(result, matcher)` | 🎯 Выполняет паттерн-матчинг результатов по статусу и тегам. |

### 🔗 Flow.Pipe:
| 🧩 Имя | 📦 Тип | ⚙️ Сигнатура | 📖 Описание |
|---------|---------|-------------|-------------|
| `Pipe.Sync` | метод | `Flow.Pipe.Sync<A>(init)` | 🔗 Создает синхронную цепочку обработки с ранним выходом при ошибках. |
| `Pipe.Async` | метод | `Flow.Pipe.Async<A>(init)` | ⚡ Создает асинхронную цепочку обработки с ранним выходом при ошибках. |

---

# Logger 📝

`Logger` — это система логирования для автоматической записи создаваемых `Result` объектов. Модуль предоставляет гибкую конфигурацию для отслеживания успешных и неуспешных результатов с возможностью подключения пользовательских обработчиков логирования. Система работает на принципе **"логируй по необходимости"** — можно включить автоматическое логирование глобально или управлять им для каждого `Result` индивидуально.

Logger интегрирован с модулем `Result` на уровне создания объектов, что обеспечивает автоматическое логирование без дополнительного кода в местах использования. Это особенно полезно для отладки, мониторинга производительности и аудита в production среде.

```ts
// Автоматическое логирование при создании Result
Logger.LogOkResult = true;
Logger.LogErrorResult = true;

const result = Result.Error({ data: 'Connection failed', tag: 'NetworkError' });
// Автоматически вызовет Logger.Engine с информацией об ошибке
```

### 🛠 Основные компоненты

* 🎛️ `Logger.LogOkResult` — глобальный флаг для автоматического логирования успешных результатов
* 🎛️ `Logger.LogErrorResult` — глобальный флаг для автоматического логирования результатов с ошибками
* 🔧 `Logger.Engine` — пользовательская функция-обработчик для фактического логирования

---

## 🎛️ Глобальные флаги логирования

Система предоставляет два глобальных флага для управления автоматическим логированием различных типов результатов. Эти настройки влияют на все создаваемые `Result` объекты, но могут быть переопределены параметром `log` при создании конкретного результата.

### ✅ Logger.LogOkResult - Логирование успешных результатов

```ts
// Включение автоматического логирования успешных результатов
Logger.LogOkResult = true;

// Теперь все Result.Ok будут автоматически логироваться
const userResult = Result.Ok({ data: { id: 123, name: 'John' }, tag: 'UserLoaded' });
// Автоматически вызовет Logger.Engine с этим результатом

const apiResult = Result.OkFrom(apiResponse, 'ApiSuccess');
// Также будет залогирован автоматически

// Отключение автоматического логирования успешных результатов
Logger.LogOkResult = false;

// Принудительное логирование конкретного результата
const importantResult = Result.Ok({
  data: 'Critical operation completed',
  tag: 'SystemRecovery',
  log: true // Переопределяет глобальную настройку
});
```

### ❌ Logger.LogErrorResult - Логирование результатов с ошибками

```ts
// Включение автоматического логирования ошибок (обычно включено в production)
Logger.LogErrorResult = true;

// Все Result.Error будут автоматически логироваться
const networkError = Result.Error({
  data: 'Connection timeout',
  tag: 'NetworkError'
});
// Автоматически отправит информацию об ошибке в Logger.Engine

const validationError = Result.ErrorFrom('Invalid email format', 'ValidationError');
// Также будет залогирован

// Подавление логирования для конкретной ошибки
const expectedError = Result.Error({
  data: 'User cancelled operation',
  tag: 'UserCancellation',
  log: false // Не логировать даже при включенном LogErrorResult
});
```

## 🔧 Logger.Engine - Пользовательский обработчик

`Logger.Engine` — это функция-обработчик, которая вызывается для фактического логирования `Result` объектов. По умолчанию `Engine` равен `null`, что означает отсутствие логирования. Разработчик должен установить свою функцию для активации системы логирования.

```ts
// Простая настройка логирования в консоль
Logger.Engine = async (result) => {
  console.log(`[${result.status.toUpperCase()}] ${result.tag || 'untagged'}:`, result.data);
};

// Более сложная настройка с разделением по типам
Logger.Engine = async (result) => {
  const timestamp = new Date().toISOString();
  const message = {
    timestamp,
    status: result.status,
    tag: result.tag,
    data: result.data
  };

  if (Result.IsOk(result)) {
    // Логирование успешных операций
    console.info(`✅ [${timestamp}] Success:`, message);
    await sendToAnalytics('success', message);
  } else {
    // Логирование ошибок
    console.error(`❌ [${timestamp}] Error:`, message);
    await sendToErrorTracking('error', message);

    // Критические ошибки отправляем в Slack
    if (result.tag === 'DatabaseError' || result.tag === 'SystemFailure') {
      await sendSlackAlert(message);
    }
  }
};
```

### 🔧 Интеграция с внешними сервисами

```ts
// Интеграция с популярными сервисами логирования
Logger.Engine = async (result) => {
  const logData = {
    level: Result.IsOk(result) ? 'info' : 'error',
    message: `${result.status}: ${result.tag || 'untagged'}`,
    data: result.data,
    tag: result.tag,
    timestamp: Date.now()
  };

  try {
    // Sentry для ошибок
    if (Result.IsError(result)) {
      Sentry.captureException(new Error(logData.message), {
        tags: { resultTag: result.tag },
        extra: { resultData: result.data }
      });
    }

    // DataDog для метрик
    dogstatsd.increment('result.created', 1, [`status:${result.status}`, `tag:${result.tag}`]);

    // Собственная система логирования
    await customLogger.log(logData);

  } catch (engineError) {
    // Важно: ошибки в Logger.Engine не должны влиять на основную логику
    console.error('Logger.Engine failed:', engineError);
  }
};
```

## 🎯 Паттерны использования

### 🏭 Production конфигурация

```ts
// Типичная настройка для production среды
Logger.LogOkResult = false;  // Обычно отключено для performance
Logger.LogErrorResult = true; // Всегда включено для отслеживания проблем

Logger.Engine = async (result) => {
  // Только ошибки в production
  if (Result.IsError(result)) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      tag: result.tag,
      data: result.data,
      environment: process.env.NODE_ENV,
      service: 'user-service'
    };

    // Отправка в систему мониторинга
    await Promise.all([
      sendToErrorTracking(errorInfo),
      updateErrorMetrics(result.tag),
      checkForAlerts(result.tag, result.data)
    ]);
  }
};
```

### 🧪 Development конфигурация

```ts
// Настройка для разработки
Logger.LogOkResult = true;   // Включено для отладки
Logger.LogErrorResult = true; // Включено для отладки

Logger.Engine = async (result) => {
  const colors = {
    ok: '\x1b[32m',     // Зеленый
    error: '\x1b[31m',  // Красный
    reset: '\x1b[0m'    // Сброс
  };

  const color = colors[result.status] || colors.reset;
  const icon = Result.IsOk(result) ? '✅' : '❌';

  console.log(
    `${color}${icon} [${result.status.toUpperCase()}] ${result.tag || 'untagged'}${colors.reset}`,
    result.data
  );

  // В development можно также сохранять в файл для анализа
  if (process.env.DEBUG_TO_FILE) {
    await fs.appendFile('debug.log', JSON.stringify({
      timestamp: Date.now(),
      ...result
    }) + '\n');
  }
};
```

### 🔍 Селективное логирование

```ts
// Логирование только критических операций
Logger.LogOkResult = false;
Logger.LogErrorResult = false; // Отключено глобально

// Но включаем для важных операций через параметр log
const criticalOperation = async () => {
  const result = await Flow.Try.Async({
    try: async () => {
      const data = await performCriticalDatabaseOperation();
      return Result.Ok({ data, tag: 'CriticalSuccess', log: true }); // Принудительно логируем
    },
    catch: (error) => Result.Error({
      tag: 'CriticalFailure',
      data: error.message,
      log: true // Принудительно логируем критические ошибки
    })
  });

  return result;
};
```

---

## 📋 Полная справка Logger

### 🎛️ Глобальные настройки:
| 🧩 Имя | 📦 Тип | ⚙️ Сигнатура | 📖 Описание |
|---------|---------|-------------|-------------|
| `LogOkResult` | переменная | `boolean` | 🎛️ Глобальный флаг для автоматического логирования успешных результатов. По умолчанию `false`. |
| `LogErrorResult` | переменная | `boolean` | 🎛️ Глобальный флаг для автоматического логирования результатов с ошибками. По умолчанию `false`. |

### 🔧 Обработчик логирования:
| 🧩 Имя | 📦 Тип | ⚙️ Сигнатура | 📖 Описание |
|---------|---------|-------------|-------------|
| `Engine` | переменная | `null \| ((result: Result.Any) => Promise<any>)` | 🔧 Пользовательская асинхронная функция для фактического логирования Result объектов. По умолчанию `null`. |

### 🎯 Принципы интеграции:
- **Автоматичность**: Логирование происходит автоматически при создании `Result` без дополнительного кода
- **Гибкость**: Можно переопределить глобальные настройки для конкретных результатов через параметр `log`
- **Безопасность**: Ошибки в `Logger.Engine` не влияют на основную логику приложения
- **Производительность**: `Engine` вызывается асинхронно и не блокирует создание `Result`

---

## 🎨 Паттерны интеграции модулей

### 🔗 Комплексная обработка пользовательских операций

```ts
// Настройка логирования для пользовательских операций
Logger.LogErrorResult = true;
Logger.Engine = async (result) => {
  if (Result.IsError(result) && result.tag?.includes('User')) {
    await trackUserError(result.tag, result.data);
  }
};

// Комплексная функция с использованием всех модулей
async function processUserRegistration(userData: UserRegistrationData) {
  // Этап 1: Валидация с Flow.Try
  const validationResult = Flow.Try.Sync(() => {
    if (!userData.email) return Result.Error({ data: 'Email required', tag: 'UserValidationError' });
    if (!userData.password) return Result.Error({ data: 'Password required', tag: 'UserValidationError' });
    return Result.Ok({ data: userData, tag: 'UserDataValidated' });
  });

  // Этап 2: Обработка результата валидации с Flow.Match
  const processedValidation = Flow.Match(validationResult, {
    'ok:UserDataValidated': (r) => {
      return Result.Ok({ data: normalizeUserData(r.data), tag: 'UserDataNormalized' });
    },
    'error:UserValidationError': (r) => {
      return Result.Error({ data: `Validation failed: ${r.data}`, tag: 'UserRegistrationFailed' });
    }
  });

  if (Result.IsError(processedValidation)) return processedValidation;

  // Этап 3: Цепочка создания пользователя с Flow.Pipe
  const registrationResult = await Flow.Pipe.Async(processedValidation)
    // Проверка существования пользователя
    (async (result) => {
      const exists = await checkUserExists(result.data.email);
      if (exists) {
        return Result.Error({ data: 'User already exists', tag: 'UserAlreadyExists' });
      }
      return Result.Ok({ data: result.data, tag: 'UserCanBeCreated' });
    })
    // Создание пользователя в базе данных
    (async (result) => {
      const user = await Flow.Try.Async({
        try: async () => createUserInDatabase(result.data),
        catch: (error) => Result.Error({
          data: `Database error: ${error.message}`,
          tag: 'UserDatabaseError'
        })
      });
      return user;
    })
    // Отправка приветственного email
    (async (result) => {
      if (Result.IsOk(result)) {
        await Flow.Try.Async(() => sendWelcomeEmail(result.data.email));
      }
      return result;
    })
    ();

  return registrationResult;
}
```

## 🎯 Особенности и сравнения с аналогами

### 📊 Общие характеристики

| Критерий | resu | Effect-TS | neverthrow | fp-ts | ts-results | purify-ts |
|----------|---------------|-----------|------------|-------|------------|-----------|
| **📦 Максимальный размер бандла** | ~5KB | ~20-25KB | ~8-10KB | ~25-30KB | ~10-12KB | ~15-20KB |
| **📈 Weekly Downloads** | New | 500K+ | 896K | 4.2M+ | 105K | 40K |
| **⚡ Статус поддержки** | ✅ Активная | ✅ Активная | ✅ Активная | ⚠️ Maintenance | ❌ Заброшена | ✅ Активная |
| **🎯 Порог входа** | 🟢 Низкий | 🔴 Высокий | 🟢 Низкий | 🔴 Очень высокий | 🟡 Средний | 🟡 Средний |
| **🏗️ Enterprise готовность** | 🟡 Хорошая | 🟢 Отличная | 🟡 Хорошая | 🟢 Отличная | 🔴 Плохая | 🟡 Средняя |

---

## 🎯 Специализированные возможности

| Возможность | resu | Effect-TS | neverthrow | fp-ts | ts-results | purify-ts |
|-------------|---------------|-----------|------------|-------|------------|-----------|
| **🛡️ Exception handling** | ✅ Flow.Try | ✅ Built-in | ❌ Manual | ❌ Manual | ❌ Manual | ❌ Manual |
| **🔗 Pipeline processing** | ✅ Iterable Pipes | ✅ Generators | ⚡ Chains | ✅ Pipe | ❌ Basic | ⚡ Limited |
| **🎯 Pattern matching** | ✅ Flow.Match | ✅ Advanced | ⚡ match() | ✅ fold | ❌ None | ⚡ Basic |
| **📝 Built-in logging** | ✅ Logger system | ⚡ Observability | ❌ None | ❌ None | ❌ None | ❌ None |
| **⚙️ Migration support** | ✅ Strict Settings | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None |
| **🔄 Async support** | ✅ Native | ✅ TaskEither | ⚡ ResultAsync | ✅ TaskEither | ⚡ Basic | ✅ EitherAsync |
| **🧪 Testing utilities** | ⚡ Basic | ✅ Advanced | ⚡ Limited | ✅ Good | ❌ None | ⚡ Some |
| **📊 Developer experience** | ✅ Excellent | ⚡ Good* | ✅ Excellent | ❌ Poor | ❌ Outdated | ⚡ Good |

*Хорошо для опытных FP разработчиков

---

## 🎯 Рекомендации по выбору

### 🚀 Новые проекты, практичный подход
**resu** - для команд, которые ценят простоту, хотят быстро освоить Result паттерн и нуждаются в практичных фичах для production (логирование, отладка, миграция).

### 🏢 Enterprise, сложная логика
**Effect-TS** - для больших проектов с комплексной бизнес-логикой, где нужны продвинутые возможности и команда готова инвестировать в изучение.

### ⚡ Быстрый старт, проверенное решение
**neverthrow** - для проектов, где нужна надежная и популярная библиотека с хорошей эргономикой без излишней сложности.

### 🧠 Функциональное программирование
**fp-ts** → **Effect-TS** - для команд с опытом FP, но лучше сразу переходить на Effect-TS как официального наследника.

### ❌ Избегать
**ts-results, oxide.ts** - заброшенные библиотеки с проблемами безопасности и совместимости.

---


