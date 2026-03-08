/**
 * Accessibility E2E tests for Index page (landing)
 * Runs axe-core against the main landing page
 */
/// <reference types="cypress" />
import 'cypress-axe'
import 'cypress-real-events'

describe('Index Page - Accessibility', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('main#main, [role="main"]', { timeout: 15000 }).should('exist');
    cy.wait(1000);
    cy.injectAxe();
  });

  describe('Document structure', () => {
    it('should have proper document structure', () => {
      cy.get('html').should('have.attr', 'lang');
      cy.get('title').should('exist');
      cy.get('h1').should('exist');
    });

    it('should have main landmark', () => {
      cy.get('main, [role="main"]').should('exist');
    });
  });

  describe('Axe accessibility', () => {
    it('should have no critical accessibility violations', () => {
      cy.checkA11y(undefined, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
        },
        rules: {
          'color-contrast': { enabled: false },
          'color-contrast-enhanced': { enabled: false },
          'landmark-unique': { enabled: false },
          'region': { enabled: false },
          'bypass': { enabled: false },
          'focus-order-semantics': { enabled: false },
          'heading-order': { enabled: false },
        },
      });
    });

    it('should have no serious violations on hero section', () => {
      cy.get('#hero').then(($hero) => {
        if ($hero.length > 0) {
          cy.checkA11y('#hero', {
            runOnly: {
              type: 'tag',
              values: ['wcag2a', 'wcag2aa'],
            },
          });
        }
      });
    });
  });

  describe('Keyboard navigation', () => {
    it('should allow tab navigation to main content', () => {
      // Skip-to-main link is the first focusable element; verify it can receive focus
      cy.get('a[href="#main"]').first().focus().should('be.focused');
    });
  });
});
