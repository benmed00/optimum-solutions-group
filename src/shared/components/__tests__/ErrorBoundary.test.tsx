/**
 * @fileoverview Unit tests for ErrorBoundary component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import '@testing-library/jest-dom';

import ErrorBoundary from '../ErrorBoundary';

/** Assert element is in the document (avoids jest-dom type conflicts with @jest/globals) */
const expectInDocument = (el: Element | null): void => {
  expect(el).toBeTruthy();
  if (el) expect(document.body.contains(el)).toBe(true);
};

/** Assert element is not in the document */
const expectNotInDocument = (el: Element | null): void => {
  expect(el).toBeNull();
};

const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  const originalError = console.error;
  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  describe('Normal rendering', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child">Child content</div>
        </ErrorBoundary>
      );

      expectInDocument(screen.getByTestId('child'));
      expectInDocument(screen.getByText('Child content'));
    });

    it('should not show error UI when children render successfully', () => {
      render(
        <ErrorBoundary>
          <div>Success</div>
        </ErrorBoundary>
      );

      expectNotInDocument(screen.queryByText('Component Error'));
      expectNotInDocument(screen.queryByText('Try Again'));
    });
  });

  describe('Error state', () => {
    it('should render error UI when child throws', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expectInDocument(screen.getByText('Component Error'));
      expectInDocument(screen.getByText('Try Again'));
    });

    it('should show error title based on level prop', () => {
      render(
        <ErrorBoundary level="app">
          <ThrowError />
        </ErrorBoundary>
      );

      expectInDocument(screen.getByText('Application Error'));
    });

    it('should show page error title for level="page"', () => {
      render(
        <ErrorBoundary level="page">
          <ThrowError />
        </ErrorBoundary>
      );

      expectInDocument(screen.getByText('Page Error'));
    });

    it('should show section error title for level="section"', () => {
      render(
        <ErrorBoundary level="section">
          <ThrowError />
        </ErrorBoundary>
      );

      expectInDocument(screen.getByText('Section Error'));
    });
  });

  describe('Retry functionality', () => {
    it('should show Try Again button when in error state', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /try again/i });
      expectInDocument(retryButton);
      expect((retryButton as HTMLButtonElement).disabled).toBe(false);
    });

    it('should call setState when Try Again is clicked', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByText('Try Again'));

      // ErrorBoundary resets hasError; child throws again so error UI reappears
      expectInDocument(screen.getByText('Component Error'));
    });

    it('should render children when remounted with non-throwing child', () => {
      const { rerender } = render(
        <ErrorBoundary key="error">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expectInDocument(screen.getByText('Component Error'));

      rerender(
        <ErrorBoundary key="recovered">
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expectInDocument(screen.getByText('No error'));
    });
  });

  describe('Custom fallback', () => {
    it('should render custom fallback when provided', () => {
      render(
        <ErrorBoundary fallback={<div data-testid="custom-fallback">Custom error message</div>}>
          <ThrowError />
        </ErrorBoundary>
      );

      expectInDocument(screen.getByTestId('custom-fallback'));
      expectInDocument(screen.getByText('Custom error message'));
      expectNotInDocument(screen.queryByText('Try Again'));
    });
  });

  describe('onError callback', () => {
    it('should call onError when error is caught', () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ componentStack: expect.any(String) })
      );
      const firstArg = onError.mock.calls[0]?.[0];
      expect(firstArg).toBeInstanceOf(Error);
      expect((firstArg as Error).message).toBe('Test error message');
    });
  });

  describe('Isolate mode', () => {
    it('should apply min-h-32 when isolate is true', () => {
      render(
        <ErrorBoundary isolate>
          <ThrowError />
        </ErrorBoundary>
      );

      const container = document.querySelector('.min-h-32');
      expectInDocument(container);
    });

    it('should apply min-h-screen when isolate is false', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const container = document.querySelector('.min-h-screen');
      expectInDocument(container);
    });
  });
});
