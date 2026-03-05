# TypeScript Standards Guide

This guide documents the TypeScript typing standards used in this project to avoid inference issues, double assertions, and maintain strict type safety.

## Overview

We enforce explicit types, avoid `any`, and prefer typed helpers over type assertions. These standards apply to both application code and tests.

## 1. Explicit Types — No Inference

**Every `const`, `let`, assertion, or declaration must have an explicit type.** Do not rely on TypeScript inference for variables that flow into assertions or mocks.

| Context | Bad | Good |
| ------- | --- | ---- |
| Variables | `const items = getItems();` | `const items: Item[] = getItems();` |
| renderHook | `const { result } = renderHook(...)` | `const { result }: RenderHookResult<MyHookReturn, void> = renderHook(...)` |
| Handlers | `const handler = (e: Event) => ...` | `const handler: (e: Event) => void = (e: Event): void => ...` |

Use type aliases for complex or repeated types (e.g. `RenderHookResult`, summary shapes).

## 2. No Double Assertion

**Never use `as unknown as T`** (double assertion) at call sites. Encapsulate in typed helpers when needed.

```typescript
// BAD — double assertion at call site
const mock: MockType = value as unknown as MockType;
Object.defineProperty(obj, 'prop', { value: mock as unknown as DomType });

// GOOD — typed helper (single assertion)
function toDomType(mock: MockType): DomType {
  return mock as DomType;
}
Object.defineProperty(obj, 'prop', { value: toDomType(mock) });
```

## 3. No `any` — Use Specific Types

Avoid `any`. Use `unknown` when the type is truly unknown, or define a proper interface.

| Use Case | Instead of `any` | Use |
| -------- | ---------------- | --- |
| Global delete | `delete (global as any).prop` | `delete (global as Record<string, unknown>).prop` |
| Thenable check | `(obj as any).then` | `(obj as PromiseLike<unknown>).then` |
| Generic return | `return undefined as any` | `return undefined as ReturnType<T>` |
| Empty args | `func(...([] as any))` | `func(...([] as Parameters<T>))` |

## 4. Test-Specific Typing

See [.cursor/rules/typescript-tests.mdc](../../.cursor/rules/typescript-tests.mdc) for test-specific rules. Summary:

- Define interfaces for mocks (e.g. `MockPerformance`, `MockNavigator`)
- Type `renderHook` results explicitly
- Use `Record<string, unknown>` for `delete` on globals
- Use extended `globalThis` for global assignments
- Type Jest mocks and spies

## 5. ESLint Configuration

The project uses strict typing rules in `eslint.config.js`:

| Rule | Level | Purpose |
| ---- | ----- | ------- |
| `@typescript-eslint/no-explicit-any` | error | Disallow `any` |
| `@typescript-eslint/consistent-type-assertions` | error | Prefer `as` style, consistent object literal handling |
| `@typescript-eslint/prefer-as-const` | error | Use `as const` for literal types |

## 6. Avoiding TypeScript Issues in Future Projects

1. **Enable strict mode** in `tsconfig.json`: `strict: true`, `noImplicitAny: true`
2. **Add ESLint rules** for `no-explicit-any: "error"` and `consistent-type-assertions` from the start
3. **Use Cursor rules** (`.cursor/rules/*.mdc`) to enforce standards during development
4. **Prefer typed helpers** over inline assertions when mocking or converting types
5. **Type test files** as strictly as production code — mocks and `renderHook` results benefit from explicit types

## Related Files

- [.cursor/rules/typescript-no-inference.mdc](../../.cursor/rules/typescript-no-inference.mdc) — general typing standards
- [.cursor/rules/typescript-tests.mdc](../../.cursor/rules/typescript-tests.mdc) — test typing standards
- [docs/guides/test-fixes-summary.md](./test-fixes-summary.md) — test fixes and rationale
