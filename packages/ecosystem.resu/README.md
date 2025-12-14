# Resu 📦

**Lightweight result management system for TypeScript with maximum compatibility and zero overhead.**

Resu is a practical alternative to complex functional libraries for error handling, built for developers who value simplicity, performance, and production readiness. The library provides a type-safe `Result` system without the academic complexity of functional programming, focusing on what's actually needed in everyday development.

The library's philosophy is built on three principles: **practicality over theory**, **simplicity over abstraction**, and **compatibility over isolation**. Instead of forcing you to learn dozens of methods like `map`, `flatMap`, `chain`, the library provides a minimal yet powerful set of tools that solve real problems in real projects.

## 📦 Installation and Quick Start

### Installation

```bash
npm install @wambata/resu
```

### Quick Example

```ts
import { Result, Flow } from '@wambata/resu';

// Safe data processing without exceptions
function processUserData(input: string): Result.Ok<User> | Result.Error<string> {
  // Parsing with automatic exception catching
  const jsonResult = Flow.Try.Sync(() => JSON.parse(input));
  if (Result.IsError(jsonResult)) {
    return Result.Error({ data: "Invalid JSON format", tag: "ParseError" });
  }

  // Data validation
  const user = jsonResult.data;
  if (!user.email || !user.name) {
    return Result.Error({ data: "Missing required fields", tag: "ValidationError" });
  }

  return Result.Ok({ data: user, tag: "UserProcessed" });
}

// Usage with full type safety
const result = processUserData('{"name": "John", "email": "john@example.com"}');

if (Result.IsOk(result)) {
  console.log(`User: ${result.data.name}`); // ✅ Type-safe access
} else {
  console.error(`Error ${result.tag}: ${result.data}`); // ✅ Categorized error handling
}
```

---

# Settings ⚙️

`Settings` is the configuration system of the resu library, defining the behavior of typing and validation of return values across all modules. The system is built on the principle of **"flexibility by default, strictness by choice"** — the library initially allows returning any values for easy integration, but provides a mechanism to enable strict typing for maximum safety.

By default, every library function allows returning any values except `void` and `undefined`, ensuring simple integration without the need to explicitly create `Result` for every case. Any values other than `Result` are automatically wrapped in `Result.Ok`. However, this approach creates a risk that a value meant to be an error might accidentally be returned as a successful result.

```ts
// Flexible mode (default): any values allowed
const flexibleFunction = Flow.Function.Sync((input: string) => {
  if (input === 'error') return null; // Will become Result.Ok<null>
  if (input === 'result') return Result.Error({ data: 'Real error' }); // Remains as is
  return 'success'; // Will become Result.Ok<string>
});

// Strict mode: only Result allowed
declare module 'resu' {
  interface StrictSetting { enable: true }
}
```

### 🛠 Main Settings Interfaces

* 🔒 `StrictSetting` — global strictness setting for all library functions
* ⚙️ `FunctionStrictSetting` — separate strictness setting for `Flow.Function` methods
* 🎯 Module declaration via `declare module 'resu'` to activate settings

---

## 🔓 Flexible Mode (default)

In flexible mode, the library accepts any return values and automatically converts them to `Result`. This ensures easy integration with existing code and a low entry barrier for new users.

```ts
// By default all functions work in flexible mode
const anyValueFunction = Flow.Function.Sync((input: string) => {
  // ✅ All options are valid
  if (input === 'null') return null;
  if (input === 'string') return 'Hello World';
  if (input === 'object') return { data: 'test' };
  if (input === 'result') return Result.Ok({ data: 'explicit result' });

  return 42; // Any value will be wrapped in Result.Ok
});

// Flow.Match accepts any handlers
const matchResult = Flow.Match(someResult, {
  'ok': (r) => 'Success!', // String will be wrapped in Result.Ok
  'error': (r) => Result.Error({ data: 'Handled error', tag: null }) // Explicit Result
});
```

## 🔒 Strict Mode

Strict mode requires all functions to return only `Result` instances, ensuring maximum type safety and preventing accidental errors.

```ts
// Enable global strict mode
declare module 'resu' {
  interface StrictSetting { enable: true }
}

// Now all functions require Result
const strictFunction = Flow.Function.Sync((input: string) => {
  // ✅ Correct - returns Result
  if (input.length === 0) {
    return Result.Error({ data: 'Empty input', tag: 'ValidationError' });
  }
  return Result.Ok({ data: input.toUpperCase(), tag: 'Processed' });

  // ❌ TypeScript error - regular values not allowed
  // return input.toUpperCase();
  // return null;
});
```

### ⚙️ Selective Strictness for Flow.Function

`Flow.Function` strictness can be configured separately from global settings, allowing for gradual migration.

```ts
declare module 'resu' {
  interface StrictSetting { enable: true } // Globally strict mode
  interface FunctionStrictSetting { enable: false } // But Function remains flexible
}

// Flow.Try requires Result (global setting)
const strictTry = Flow.Try.Sync(() => {
  // ❌ Error - needs Result
  // return "string";
  return Result.Ok({ data: "wrapped string" }); // ✅ Correct
});

// Flow.Function remains flexible (local setting)
const flexibleFunc = Flow.Function.Sync((input: string) => {
  return input.toUpperCase(); // ✅ Allowed due to FunctionStrictSetting
});
```

> For new projects, it's recommended to enable strict mode for maximum type safety.

---

# Flow ⚡

`Flow` is a namespace for managing execution flow and composing operations with `Result`. The module provides tools for safely executing potentially dangerous operations, automatically catching exceptions and converting them to type-safe `Result`. Flow's philosophy is based on the principle **"exceptions should not interrupt execution flow"** — instead, all errors become explicit values that can be managed.

Flow solves the key problem of integrating with existing code: many libraries and APIs throw exceptions, but when working with Result-based architecture, you need guarantees of returning `Result`. The module provides safe wrappers that catch any exceptions and turn them into predictable `Result.Error`.

```ts
// ❌ Problem: API might throw an exception
function riskyJsonParse(json: string): ParsedData {
  return JSON.parse(json); // SyntaxError!
}

// ✅ Solution: Flow.Try guarantees Result
const safeResult = Flow.Try.Sync(() => JSON.parse(json));
// Result: Result.Ok<ParsedData> | Result.Error<unknown>
```

### 🛠 Frequently Used Methods

* 🛡️ `Flow.Try.Sync` — for safe execution of synchronous operations with automatic exception catching
* ⚡ `Flow.Try.Async` — for safe execution of asynchronous operations with cancellation support
* 🎯 `Flow.Match` — for elegant handling of different result types through pattern matching
* 🔄 `Flow.Function` — for wrapping functions with guaranteed `Result` return
* 🔗 `Flow.Pipe` — for creating processing chains with early exit on errors

---

## 🛡️ Flow.Try - Safe Execution

Allows executing any operations (synchronous and asynchronous) with a guarantee that the result will always be `Result`, even if the original operation throws an exception. This ensures predictability and operation composition without the need to handle exceptions manually.

```ts
// Demonstration of the basic working principle
const safeOperation = Flow.Try.Sync(() => {
  // Any code here cannot "break" the application with an exception
  return JSON.parse(userInput); // If it throws SyntaxError - becomes Result.Error
});
// Guaranteed result: Result.Ok<ParsedData> | Result.Error<unknown>
```

### 🔄 Flow.Try.Sync - Synchronous Operations

`Flow.Try.Sync` executes synchronous functions and automatically catches any exceptions, converting them to `Result.Error`. If the function executes successfully, the result is wrapped in `Result.Ok`.

```ts
// Simple execution with automatic error handling
const parseResult = Flow.Try.Sync(() => {
  return JSON.parse('{"valid": "json"}');
});
// => Result.Ok<{ valid: string }>

const errorResult = Flow.Try.Sync(() => {
  return JSON.parse('invalid json');
});
// => Result.Error<SyntaxError> with exception data

// Function already returns Result - passes through unchanged
const existingResult = Flow.Try.Sync(() => {
  return Result.Ok({ data: 'Already a Result', tag: 'Success' });
});
// => Result.Ok<string, 'Success'> (no double wrapping)
```

#### 🎛️ Custom Error Handling

```ts
// Extended configuration with custom error handling
const configuredResult = Flow.Try.Sync({
  try: () => {
    const data = parseUserInput(userInput);
    validateBusinessRules(data);
    return data;
  },
  catch: (error) => Result.Error({
    tag: 'ValidationError',
    data: `Validation error: ${error.message}`
  })
});

// Working with different error types
const smartErrorHandling = Flow.Try.Sync({
  try: () => performDatabaseOperation(),
  catch: (error) => {
    if (error.code === 'ECONNREFUSED') {
      return Result.Error({ tag: 'ConnectionError', data: 'Database unavailable' });
    }
    if (error.name === 'ValidationError') {
      return Result.Error({ tag: 'DataError', data: error.message });
    }
    return Result.Error({ tag: 'UnknownError', data: 'Unknown system error' });
  }
});
```

### ⚡ Flow.Try.Async - Asynchronous Operations

`Flow.Try.Async` works similarly to the synchronous version but supports Promise-based operations and provides additional capabilities, including operation cancellation via AbortSignal.

```ts
// Simple asynchronous operations
const fetchResult = Flow.Try.Async(async () => {
  const response = await fetch('/api/data');
  return response.json();
});
// => Result.Ok<Data> | Result.Error<unknown>

// Operations with custom error handling
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
    data: `API call failed: ${error.message}`
  })
});

// Operations with cancellation support
const controller = new AbortController();
const cancellableOperation = Flow.Try.Async({
  signal: controller.signal,
  try: async (signal) => {
    const response = await fetch('/api/long-operation', { signal });
    return response.json();
  },
  catch: (error) => Result.Error({ tag: 'OperationFailed', data: error.message })
});

// Can cancel the operation
setTimeout(() => controller.abort(), 5000);
```

#### 🧠 Smart Value Wrapping

```ts
// Regular value -> Result.Ok
const stringResult = Flow.Try.Async(async () => {
  await delay(100);
  return "Hello World";
});
// => Result.Ok<string>

// Already Result -> passes as is
const existingResult = Flow.Try.Async(async () => {
  const data = await loadData();
  return Result.Error({ tag: 'CustomError', data: 'My error' });
});
// => Result.Error<string, 'CustomError'> (unchanged)

// Promise with Result
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

## 🔄 Flow.Function - Function Wrapping

`Flow.Function` provides wrappers to turn regular functions into functions that guarantee `Result` return. This is especially useful for creating safe APIs and standardizing return types in the codebase.

### 🔄 Flow.Function.Sync - Synchronous Functions

`Flow.Function.Sync` wraps a synchronous function, guaranteeing that the result will always be `Result`. If the function returns a regular value, it's automatically wrapped in `Result.Ok`.

```ts
// Wrapping a simple function
const safeUppercase = Flow.Function.Sync((text: string) => {
  if (text.length === 0) {
    return Result.Error({ data: 'Empty string not allowed', tag: 'ValidationError' });
  }
  return Result.Ok({ data: text.toUpperCase(), tag: 'Processed' });
});

// Using the wrapped function
const result = safeUppercase("hello");
// => Result.Ok<string, 'Processed'> | Result.Error<string, 'ValidationError'>

// In strict mode, function must return Result
const strictFunction = Flow.Function.Sync((input: number) => {
  return input > 0
    ? Result.Ok({ data: input * 2, tag: 'Doubled' })
    : Result.Error({ data: 'Negative input', tag: 'InvalidInput' });
});
```

### ⚡ Flow.Function.Async - Asynchronous Functions

`Flow.Function.Async` works similarly but for asynchronous functions, ensuring type safety for Promise-based operations.

```ts
// Wrapping an asynchronous function
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

// Usage
const apiResult = await safeApiCall('/api/users');
// => Result.Ok<ApiData, 'ApiSuccess'> | Result.Error<string, 'ValidationError' | 'HttpError'>
```

---

## 🎯 Flow.Match - Result Pattern Matching

`Flow.Match` provides an elegant way to handle different result types through pattern matching. The function allows defining handlers for various combinations of `status` and `tag`, ensuring clean and readable code for complex branching logic.

```ts
// Basic pattern matching usage
const handleUserResult = (result: Result.Ok<User> | Result.Error<string>) =>
  Flow.Match(result, {
    'ok': (r) => {
      console.log(`User loaded: ${r.data.name}`);
      return Result.Ok({ data: 'User processed', tag: 'Success' });
    },

    'error': (r) => {
      console.error(`Error: ${r.data}`);
      return Result.Error({ data: 'Processing failed', tag: 'HandlingError' });
    }
  });
```

### 🏷️ Complex Matching with Tags

```ts
type ApiResult =
  | Result.Ok<Data, 'Success'>
  | Result.Error<string, 'ValidationError'>
  | Result.Error<string, 'NetworkError'>
  | Result.Error<string, 'AuthError'>;

const handleApiResult = (result: ApiResult) => Flow.Match(result, {
  // Exact status and tag match
  'ok:Success': (r) => {
    logSuccess(r.data);
    return Result.Ok({ data: 'Data processed', tag: 'Processed' });
  },

  // Specific error handlers by tags
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

### 🔄 Matching as Transformation

```ts
// Transforming results with different strategies
const transformResult = (input: Result.Any) => Flow.Match(input, {
  'ok': (r) => {
    // Any successful result is transformed to standard format
    return Result.Ok({
      data: { success: true, payload: r.data },
      tag: 'Normalized'
    });
  },

  'error': (r) => {
    // Any error is logged and normalized
    logError(r.tag, r.data);
    return Result.Error({
      data: { success: false, error: r.data },
      tag: 'NormalizedError'
    });
  }
});
```

---

## 🔗 Flow.Pipe - Processing Chains

`Flow.Pipe` creates processing chains (pipelines) with automatic early exit on errors. If any function in the chain returns `Result.Error`, execution stops and the error is returned immediately.

**Unique feature**: `Flow.Pipe` objects are **iterable**, which allows access to intermediate results of each step in the chain. This is a powerful tool for debugging, monitoring, and analyzing complex operations.

### 🔗 Flow.Pipe.Sync - Synchronous Chains

```ts
// Creating a data processing chain
const processUserData = Flow.Pipe.Sync(Result.Ok({ data: "john@example.com", tag: "Input" }))
  // Step 1: Email validation
  ((result) => {
    if (!result.data.includes('@')) {
      return Result.Error({ data: 'Invalid email format', tag: 'ValidationError' });
    }
    return Result.Ok({ data: result.data, tag: 'ValidEmail' });
  })
  // Step 2: Normalization (executes only if step 1 is successful)
  ((result) => {
    const normalized = result.data.toLowerCase().trim();
    return Result.Ok({ data: normalized, tag: 'Normalized' });
  })
  // Step 3: User creation
  ((result) => {
    const user = { id: Date.now(), email: result.data };
    return Result.Ok({ data: user, tag: 'UserCreated' });
  })
  (); // Chain execution

// Result: Result.Ok<User, 'UserCreated'> | Result.Error<string, 'ValidationError'>
```

### ⚡ Flow.Pipe.Async - Asynchronous Chains

```ts
// Asynchronous chain with network operations
const userWorkflow = await Flow.Pipe.Async(Result.Ok({ data: "123", tag: "UserId" }))
  // Step 1: Load user
  (async (result) => {
    const user = await loadUserFromDB(result.data);
    if (!user) {
      return Result.Error({ data: 'User not found', tag: 'NotFound' });
    }
    return Result.Ok({ data: user, tag: 'UserLoaded' });
  })
  // Step 2: Validation (can be synchronous in an async chain)
  ((result) => {
    if (!result.data.isActive) {
      return Result.Error({ data: 'User is inactive', tag: 'UserInactive' });
    }
    return Result.Ok({ data: result.data, tag: 'UserValidated' });
  })
  // Step 3: Update profile
  (async (result) => {
    const updated = await updateUserProfile(result.data);
    return Result.Ok({ data: updated, tag: 'ProfileUpdated' });
  })
  (); // Execute async chain

// Result: Promise<Result.Ok<User, 'ProfileUpdated'> | Result.Error<string, 'NotFound' | 'UserInactive'>>
```

### 🔄 Iterating Chains for Debugging

One of the unique features of `Flow.Pipe` is the ability to iterate through intermediate chain results. This allows tracking each execution step for debugging or auditing.

```ts
// Creating a chain without immediate execution
const pipeline = Flow.Pipe.Sync(Result.Ok({ data: 100, tag: "Initial" }))
  ((result) => Result.Ok({ data: result.data * 2, tag: 'Doubled' }))
  ((result) => Result.Ok({ data: result.data + 50, tag: 'Added' }))
  ((result) => Result.Ok({ data: result.data / 3, tag: 'Divided' }));

// Iterating through intermediate results
for (const stepResult of pipeline) {
  console.log(`Step: ${stepResult.tag}, Value: ${stepResult.data}`);
}
// Output:
// Step: Initial, Value: 100
// Step: Doubled, Value: 200
// Step: Added, Value: 250
// Step: Divided, Value: 83.33

// Getting the final result
const finalResult = pipeline();
console.log('Final result:', finalResult);
```

### 🐛 Debugging with Detailed Logging

```ts
// Creating a chain with step tracking
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

// Debug function for chain analysis
function debugPipelineExecution(pipeline: any, label: string) {
  console.log(`🔍 Analyzing chain: ${label}`);

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
    console.log(`  📍 Step ${stepInfo.step}: [${stepInfo.status.toUpperCase()}] ${stepInfo.tag} -> ${stepInfo.data}`);

    // If we encounter an error, stop
    if (Result.IsError(stepResult)) {
      console.log(`  ❌ Chain interrupted at step ${stepInfo.step}`);
      break;
    }
  }

  const finalResult = pipeline();
  console.log(`  🎯 Final result: [${finalResult.status.toUpperCase()}] ${finalResult.tag || 'untagged'}`);

  return { steps, finalResult };
}

// Using the debug function
const analysis = debugPipelineExecution(debugPipeline, "Email processing");
```

### ⚡ Asynchronous Iteration for Monitoring

```ts
// Asynchronous chain with performance monitoring
const monitoredAsyncPipeline = Flow.Pipe.Async(Result.Ok({ data: { userId: 123 }, tag: "Input" }))
  (async (result) => {
    await delay(100); // Simulate loading
    return Result.Ok({ data: { ...result.data, profile: 'loaded' }, tag: 'ProfileLoaded' });
  })
  (async (result) => {
    await delay(200); // Simulate validation
    return Result.Ok({ data: { ...result.data, validated: true }, tag: 'Validated' });
  })
  (async (result) => {
    await delay(150); // Simulate saving
    return Result.Ok({ data: { ...result.data, saved: true }, tag: 'Saved' });
  });

// Asynchronous monitoring function
async function monitorAsyncPipeline(pipeline: any, label: string) {
  console.log(`⚡ Monitoring async chain: ${label}`);

  const startTime = Date.now();
  let stepStartTime = startTime;
  let stepNumber = 1;

  for await (const stepResult of pipeline) {
    const stepEndTime = Date.now();
    const stepDuration = stepEndTime - stepStartTime;
    const totalDuration = stepEndTime - startTime;

    console.log(`  ⏱️  Step ${stepNumber++}: [${stepResult.status.toUpperCase()}] ${stepResult.tag}`);
    console.log(`     Step time: ${stepDuration}ms, Total time: ${totalDuration}ms`);
    console.log(`     Data: ${JSON.stringify(stepResult.data)}`);

    stepStartTime = stepEndTime;

    // If we encounter an error, stop
    if (Result.IsError(stepResult)) {
      console.log(`  ❌ Async chain interrupted at step ${stepNumber - 1}`);
      break;
    }
  }

  const finalResult = await pipeline();
  const totalTime = Date.now() - startTime;
  console.log(`  🏁 Total execution time: ${totalTime}ms`);

  return finalResult;
}

// Using async monitoring
const monitoredResult = await monitorAsyncPipeline(monitoredAsyncPipeline, "User processing");
```

### 📊 Chain Performance Analysis

```ts
// Utility for profiling chains
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

    // Iterate through chain steps
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

    // Execute chain to get final result
    const finalResult = (pipeline as any)();

    return { metrics, result: finalResult };
  }

  static printReport(analysis: ReturnType<typeof PipelineProfiler.profile>) {
    const { metrics, result } = analysis;

    console.log(`\n📊 Performance report: ${metrics.label}`);
    console.log(`🎯 Result: [${result.status.toUpperCase()}] ${result.tag || 'untagged'}`);
    console.log(`⏱️  Total time: ${metrics.totalDuration.toFixed(2)}ms`);
    console.log(`${metrics.successful ? '✅' : '❌'} Successful: ${metrics.successful}`);

    if (metrics.errorStep) {
      console.log(`🛑 Error at step: ${metrics.errorStep}`);
    }

    console.log('\n📈 Step details:');
    metrics.steps.forEach(step => {
      const icon = step.status === 'ok' ? '✅' : '❌';
      console.log(`  ${icon} Step ${step.step}: ${step.tag} (${step.duration.toFixed(2)}ms)`);
    });

    // Bottleneck analysis
    const slowestStep = metrics.steps.reduce((prev, current) =>
      prev.duration > current.duration ? prev : current
    );
    console.log(`\n🐌 Slowest step: ${slowestStep.tag} (${slowestStep.duration.toFixed(2)}ms)`);
  }
}

// Using the profiler
const complexPipeline = Flow.Pipe.Sync(Result.Ok({ data: largeDataset, tag: "Input" }))
  ((result) => Result.Ok({ data: processData(result.data), tag: 'Processed' }))
  ((result) => Result.Ok({ data: validateData(result.data), tag: 'Validated' }))
  ((result) => Result.Ok({ data: transformData(result.data), tag: 'Transformed' }));

const analysis = PipelineProfiler.profile(complexPipeline, "Large dataset processing");
PipelineProfiler.printReport(analysis);
```

#### 🛑 Early Exit on Errors

```ts
// Demonstrating early exit with iteration
const chainWithEarlyExit = Flow.Pipe.Sync(Result.Ok({ data: 5, tag: "Input" }))
  ((result) => {
    const doubled = result.data * 2;
    return Result.Ok({ data: doubled, tag: 'Doubled' }); // Success: 10
  })
  ((result) => {
    // This function will return an error
    return Result.Error({ data: 'Artificial failure', tag: 'TestError' });
  })
  ((result) => {
    // ❌ This function WON'T EXECUTE due to the error above
    return Result.Ok({ data: result.data + 100, tag: 'WontExecute' });
  });

// Tracking where exactly the error occurred
console.log('🔍 Tracking chain execution:');
for (const stepResult of chainWithEarlyExit) {
  console.log(`Step: ${stepResult.tag}, Status: ${stepResult.status}`);
  if (Result.IsError(stepResult)) {
    console.log(`❌ Execution stopped due to error: ${stepResult.data}`);
    break;
  }
}

// Result: Result.Error<string, 'TestError'>
const finalResult = chainWithEarlyExit();
```

---

## 📋 Complete Flow Method Reference

### 🛡️ Flow.Try:
| 🧩 Name | 📦 Type | ⚙️ Signature | 📖 Description |
|---------|---------|-------------|-------------|
| `Try.Sync` | method | `Flow.Try.Sync<Ok, Error>(callback)` <br> `Flow.Try.Sync<Ok, Error>(config)` | 🔄 Safely executes a synchronous function, automatically catching exceptions. |
| `Try.Async` | method | `Flow.Try.Async<Ok, Error>(callback)` <br> `Flow.Try.Async<Ok, Error>(config)` | ⚡ Safely executes an asynchronous function with optional cancellation support. |

### 🔄 Flow.Function:
| 🧩 Name | 📦 Type | ⚙️ Signature | 📖 Description |
|---------|---------|-------------|-------------|
| `Function.Sync` | method | `Flow.Function.Sync<Args, Return>(fn)` | 🔄 Wraps a synchronous function, guaranteeing Result return. |
| `Function.Async` | method | `Flow.Function.Async<Args, Return>(fn)` | ⚡ Wraps an asynchronous function, guaranteeing Result return. |

### 🎯 Flow.Match:
| 🧩 Name | 📦 Type | ⚙️ Signature | 📖 Description |
|---------|---------|-------------|-------------|
| `Match` | method | `Flow.Match<Result, Matcher>(result, matcher)` | 🎯 Performs pattern matching on results by status and tags. |

### 🔗 Flow.Pipe:
| 🧩 Name | 📦 Type | ⚙️ Signature | 📖 Description |
|---------|---------|-------------|-------------|
| `Pipe.Sync` | method | `Flow.Pipe.Sync<A>(init)` | 🔗 Creates a synchronous processing chain with early exit on errors. |
| `Pipe.Async` | method | `Flow.Pipe.Async<A>(init)` | ⚡ Creates an asynchronous processing chain with early exit on errors. |

---

# Logger 📝

`Logger` is a logging system for automatically recording created `Result` objects. The module provides flexible configuration for tracking successful and unsuccessful results with the ability to connect custom logging handlers. The system works on the principle of **"log as needed"** — you can enable automatic logging globally or manage it for each `Result` individually.

Logger is integrated with the `Result` module at the object creation level, which ensures automatic logging without additional code at usage points. This is especially useful for debugging, performance monitoring, and auditing in production environments.

```ts
// Automatic logging when creating Result
Logger.LogOkResult = true;
Logger.LogErrorResult = true;

const result = Result.Error({ data: 'Connection failed', tag: 'NetworkError' });
// Will automatically call Logger.Engine with error information
```

### 🛠 Main Components

* 🎛️ `Logger.LogOkResult` — global flag for automatic logging of successful results
* 🎛️ `Logger.LogErrorResult` — global flag for automatic logging of error results
* 🔧 `Logger.Engine` — custom handler function for actual logging

---

## 🎛️ Global Logging Flags

The system provides two global flags for managing automatic logging of different result types. These settings affect all created `Result` objects but can be overridden by the `log` parameter when creating a specific result.

### ✅ Logger.LogOkResult - Logging Successful Results

```ts
// Enable automatic logging of successful results
Logger.LogOkResult = true;

// Now all Result.Ok will be automatically logged
const userResult = Result.Ok({ data: { id: 123, name: 'John' }, tag: 'UserLoaded' });
// Will automatically call Logger.Engine with this result

const apiResult = Result.OkFrom(apiResponse, 'ApiSuccess');
// Will also be logged automatically

// Disable automatic logging of successful results
Logger.LogOkResult = false;

// Force logging of a specific result
const importantResult = Result.Ok({
  data: 'Critical operation completed',
  tag: 'SystemRecovery',
  log: true // Overrides global setting
});
```

### ❌ Logger.LogErrorResult - Logging Error Results

```ts
// Enable automatic error logging (usually enabled in production)
Logger.LogErrorResult = true;

// All Result.Error will be automatically logged
const networkError = Result.Error({
  data: 'Connection timeout',
  tag: 'NetworkError'
});
// Will automatically send error information to Logger.Engine

const validationError = Result.ErrorFrom('Invalid email format', 'ValidationError');
// Will also be logged

// Suppress logging for a specific error
const expectedError = Result.Error({
  data: 'User cancelled operation',
  tag: 'UserCancellation',
  log: false // Don't log even with LogErrorResult enabled
});
```

## 🔧 Logger.Engine - Custom Handler

`Logger.Engine` is a handler function that's called for actual logging of `Result` objects. By default, `Engine` is `null`, which means no logging. The developer must set their own function to activate the logging system.

```ts
// Simple console logging setup
Logger.Engine = async (result) => {
  console.log(`[${result.status.toUpperCase()}] ${result.tag || 'untagged'}:`, result.data);
};

// More complex setup with type separation
Logger.Engine = async (result) => {
  const timestamp = new Date().toISOString();
  const message = {
    timestamp,
    status: result.status,
    tag: result.tag,
    data: result.data
  };

  if (Result.IsOk(result)) {
    // Log successful operations
    console.info(`✅ [${timestamp}] Success:`, message);
    await sendToAnalytics('success', message);
  } else {
    // Log errors
    console.error(`❌ [${timestamp}] Error:`, message);
    await sendToErrorTracking('error', message);

    // Send critical errors to Slack
    if (result.tag === 'DatabaseError' || result.tag === 'SystemFailure') {
      await sendSlackAlert(message);
    }
  }
};
```

### 🔧 Integration with External Services

```ts
// Integration with popular logging services
Logger.Engine = async (result) => {
  const logData = {
    level: Result.IsOk(result) ? 'info' : 'error',
    message: `${result.status}: ${result.tag || 'untagged'}`,
    data: result.data,
    tag: result.tag,
    timestamp: Date.now()
  };

  try {
    // Sentry for errors
    if (Result.IsError(result)) {
      Sentry.captureException(new Error(logData.message), {
        tags: { resultTag: result.tag },
        extra: { resultData: result.data }
      });
    }

    // DataDog for metrics
    dogstatsd.increment('result.created', 1, [`status:${result.status}`, `tag:${result.tag}`]);

    // Custom logging system
    await customLogger.log(logData);

  } catch (engineError) {
    // Important: errors in Logger.Engine should not affect main logic
    console.error('Logger.Engine failed:', engineError);
  }
};
```

## 🎯 Usage Patterns

### 🏭 Production Configuration

```ts
// Typical production environment setup
Logger.LogOkResult = false;  // Usually disabled for performance
Logger.LogErrorResult = true; // Always enabled for problem tracking

Logger.Engine = async (result) => {
  // Only errors in production
  if (Result.IsError(result)) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      tag: result.tag,
      data: result.data,
      environment: process.env.NODE_ENV,
      service: 'user-service'
    };

    // Send to monitoring system
    await Promise.all([
      sendToErrorTracking(errorInfo),
      updateErrorMetrics(result.tag),
      checkForAlerts(result.tag, result.data)
    ]);
  }
};
```

### 🧪 Development Configuration

```ts
// Development setup
Logger.LogOkResult = true;   // Enabled for debugging
Logger.LogErrorResult = true; // Enabled for debugging

Logger.Engine = async (result) => {
  const colors = {
    ok: '\x1b[32m',     // Green
    error: '\x1b[31m',  // Red
    reset: '\x1b[0m'    // Reset
  };

  const color = colors[result.status] || colors.reset;
  const icon = Result.IsOk(result) ? '✅' : '❌';

  console.log(
    `${color}${icon} [${result.status.toUpperCase()}] ${result.tag || 'untagged'}${colors.reset}`,
    result.data
  );

  // In development, can also save to file for analysis
  if (process.env.DEBUG_TO_FILE) {
    await fs.appendFile('debug.log', JSON.stringify({
      timestamp: Date.now(),
      ...result
    }) + '\n');
  }
};
```

### 🔍 Selective Logging

```ts
// Log only critical operations
Logger.LogOkResult = false;
Logger.LogErrorResult = false; // Disabled globally

// But enable for important operations via log parameter
const criticalOperation = async () => {
  const result = await Flow.Try.Async({
    try: async () => {
      const data = await performCriticalDatabaseOperation();
      return Result.Ok({ data, tag: 'CriticalSuccess', log: true }); // Force logging
    },
    catch: (error) => Result.Error({
      tag: 'CriticalFailure',
      data: error.message,
      log: true // Force log critical errors
    })
  });

  return result;
};
```

---

## 📋 Complete Logger Reference

### 🎛️ Global Settings:
| 🧩 Name | 📦 Type | ⚙️ Signature | 📖 Description |
|---------|---------|-------------|-------------|
| `LogOkResult` | variable | `boolean` | 🎛️ Global flag for automatic logging of successful results. Default `false`. |
| `LogErrorResult` | variable | `boolean` | 🎛️ Global flag for automatic logging of error results. Default `false`. |

### 🔧 Logging Handler:
| 🧩 Name | 📦 Type | ⚙️ Signature | 📖 Description |
|---------|---------|-------------|-------------|
| `Engine` | variable | `null \| ((result: Result.Any) => Promise<any>)` | 🔧 Custom asynchronous function for actual Result object logging. Default `null`. |

### 🎯 Integration Principles:
- **Automaticity**: Logging happens automatically when creating `Result` without additional code
- **Flexibility**: Can override global settings for specific results via the `log` parameter
- **Safety**: Errors in `Logger.Engine` don't affect main application logic
- **Performance**: `Engine` is called asynchronously and doesn't block `Result` creation

---

## 🎨 Module Integration Patterns

### 🔗 Comprehensive User Operation Handling

```ts
// Configure logging for user operations
Logger.LogErrorResult = true;
Logger.Engine = async (result) => {
  if (Result.IsError(result) && result.tag?.includes('User')) {
    await trackUserError(result.tag, result.data);
  }
};

// Comprehensive function using all modules
async function processUserRegistration(userData: UserRegistrationData) {
  // Step 1: Validation with Flow.Try
  const validationResult = Flow.Try.Sync(() => {
    if (!userData.email) return Result.Error({ data: 'Email required', tag: 'UserValidationError' });
    if (!userData.password) return Result.Error({ data: 'Password required', tag: 'UserValidationError' });
    return Result.Ok({ data: userData, tag: 'UserDataValidated' });
  });

  // Step 2: Process validation result with Flow.Match
  const processedValidation = Flow.Match(validationResult, {
    'ok:UserDataValidated': (r) => {
      return Result.Ok({ data: normalizeUserData(r.data), tag: 'UserDataNormalized' });
    },
    'error:UserValidationError': (r) => {
      return Result.Error({ data: `Validation failed: ${r.data}`, tag: 'UserRegistrationFailed' });
    }
  });

  if (Result.IsError(processedValidation)) return processedValidation;

  // Step 3: User creation chain with Flow.Pipe
  const registrationResult = await Flow.Pipe.Async(processedValidation)
    // Check if user exists
    (async (result) => {
      const exists = await checkUserExists(result.data.email);
      if (exists) {
        return Result.Error({ data: 'User already exists', tag: 'UserAlreadyExists' });
      }
      return Result.Ok({ data: result.data, tag: 'UserCanBeCreated' });
    })
    // Create user in database
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
    // Send welcome email
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

## 🎯 Features and Comparisons with Alternatives

### 📊 General Characteristics

| Criteria | resu | Effect-TS | neverthrow | fp-ts | ts-results | purify-ts |
|----------|---------------|-----------|------------|-------|------------|-----------|
| **📦 Maximum bundle size** | ~5KB | ~20-25KB | ~8-10KB | ~25-30KB | ~10-12KB | ~15-20KB |
| **📈 Weekly Downloads** | New | 500K+ | 896K | 4.2M+ | 105K | 40K |
| **⚡ Support status** | ✅ Active | ✅ Active | ✅ Active | ⚠️ Maintenance | ❌ Abandoned | ✅ Active |
| **🎯 Entry barrier** | 🟢 Low | 🔴 High | 🟢 Low | 🔴 Very high | 🟡 Medium | 🟡 Medium |
| **🏗️ Enterprise readiness** | 🟡 Good | 🟢 Excellent | 🟡 Good | 🟢 Excellent | 🔴 Poor | 🟡 Average |

---

## 🎯 Specialized Features

| Feature | resu | Effect-TS | neverthrow | fp-ts | ts-results | purify-ts |
|-------------|---------------|-----------|------------|-------|------------|-----------|
| **🛡️ Exception handling** | ✅ Flow.Try | ✅ Built-in | ❌ Manual | ❌ Manual | ❌ Manual | ❌ Manual |
| **🔗 Pipeline processing** | ✅ Iterable Pipes | ✅ Generators | ⚡ Chains | ✅ Pipe | ❌ Basic | ⚡ Limited |
| **🎯 Pattern matching** | ✅ Flow.Match | ✅ Advanced | ⚡ match() | ✅ fold | ❌ None | ⚡ Basic |
| **📝 Built-in logging** | ✅ Logger system | ⚡ Observability | ❌ None | ❌ None | ❌ None | ❌ None |
| **⚙️ Migration support** | ✅ Strict Settings | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None |
| **🔄 Async support** | ✅ Native | ✅ TaskEither | ⚡ ResultAsync | ✅ TaskEither | ⚡ Basic | ✅ EitherAsync |
| **🧪 Testing utilities** | ⚡ Basic | ✅ Advanced | ⚡ Limited | ✅ Good | ❌ None | ⚡ Some |
| **📊 Developer experience** | ✅ Excellent | ⚡ Good* | ✅ Excellent | ❌ Poor | ❌ Outdated | ⚡ Good |

*Good for experienced FP developers

---

## 🎯 Selection Recommendations

### 🚀 New projects, practical approach
**resu** - for teams that value simplicity, want to quickly master the Result pattern, and need practical features for production (logging, debugging, migration).

### 🏢 Enterprise, complex logic
**Effect-TS** - for large projects with complex business logic where advanced capabilities are needed and the team is ready to invest in learning.

### ⚡ Quick start, proven solution
**neverthrow** - for projects that need a reliable and popular library with good ergonomics without excessive complexity.

### 🧠 Functional programming
**fp-ts** → **Effect-TS** - for teams with FP experience, but better to transition directly to Effect-TS as the official successor.

### ❌ Avoid
**ts-results, oxide.ts** - abandoned libraries with security and compatibility issues.

---