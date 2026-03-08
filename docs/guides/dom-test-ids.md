# DOM Element Indexing (Test IDs) Guide

## Overview

This project uses a standardized DOM tagging strategy for debugging, unit testing, E2E testing, and observability. All relevant interactive DOM nodes are tagged with deterministic, human-readable identifiers.

## Naming Convention

| Attribute | Purpose | Example |
| --------- | ------- | ------- |
| `data-testid` | Primary selector for tests (Playwright, Cypress, RTL) | `contact-section-submit-button` |
| `data-component` | Component name for DevTools inspection | `ContactSection` |
| `data-element` | Element role within component | `submit-button` |

### Format

```
<component-name>-<element-name>-<optional-context>
```

Examples:

- `navigation-cta-button`
- `contact-section-input-email`
- `job-card-apply-button-1234`

## Utilities

### buildTestId

Location: `src/shared/utils/testId.ts`

```ts
buildTestId(component, element, context?)
```

```ts
import { buildTestId } from '@/shared/utils/testId';

buildTestId('UserCard', 'avatar');
// => "user-card-avatar"

buildTestId('job-card', 'apply-button', '1234');
// => "job-card-apply-button-1234"
```

### useTestId Hook

Location: `src/shared/hooks/useTestId.ts`

```ts
const tid = useTestId('UserCard');
<img {...tid('avatar')} />
// => data-component="UserCard" data-element="avatar" data-testid="user-card-avatar"
```

## Usage in Components

### With useTestId (Recommended)

```tsx
const ContactForm = () => {
  const tid = useTestId('ContactForm');

  return (
    <form {...tid('form')} onSubmit={handleSubmit}>
      <Input {...tid('input-email')} type="email" />
      <Button {...tid('submit-button')} type="submit">
        Submit
      </Button>
    </form>
  );
};
```

### With buildTestId (Imperative)

```tsx
import { buildTestIdProps } from '@/shared/utils/testId';

<button {...buildTestIdProps('JobCard', 'apply-button', job.id)}>
  Apply
</button>
```

## Testing Examples

### React Testing Library (Unit)

```ts
import { render, screen } from '@testing-library/react';
import ContactSection from '@/features/contact/ContactSection';

test('submits contact form', async () => {
  render(<ContactSection />);

  await userEvent.type(
    screen.getByTestId('contact-section-input-email'),
    'test@example.com'
  );
  await userEvent.click(screen.getByTestId('contact-section-submit-button'));

  expect(screen.getByText(/sent/i)).toBeInTheDocument();
});
```

### Playwright (E2E)

```ts
test('contact form submission', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('contact-section-input-email').fill('test@example.com');
  await page.getByTestId('contact-section-submit-button').click();
  await expect(page.getByText(/sent/i)).toBeVisible();
});
```

### Cypress (E2E)

```ts
cy.get('[data-testid="contact-section-submit-button"]').click();
// or with Cypress best practices:
cy.findByTestId('contact-section-submit-button').click();
```

## Instrumented Components

| Component | Key Elements |
| --------- | ------------ |
| Navigation | root, desktop-menu, nav-link, cta-button, mobile-menu-toggle, mobile-menu |
| HeroSection | root, cta-transformation, cta-explore |
| ContactSection | root, form, input-name, input-email, submit-button |
| Footer | root, cta-card, schedule-button |
| ServicesSection | root |
| HighContrastModeToggle | toggle |

## Production Safety

- Test IDs are rendered by default for E2E compatibility.
- Runtime overhead is negligible (string concatenation only).
- To strip in production, add a Vite plugin that removes `data-testid`, `data-component`, `data-element` attributes during build.

## Lint Rule Suggestion

Use `eslint-plugin-testing-library` with `prefer-data-testid` or a custom rule to enforce `data-testid` on interactive elements. Example ESLint config:

```json
{
  "rules": {
    "testing-library/prefer-data-testid": "warn"
  }
}
```

## Do Not Tag

- Purely decorative nodes (icons, dividers, backgrounds)
- Elements that never need to be queried in tests
