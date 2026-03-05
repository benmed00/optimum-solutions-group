/**
 * Accessibility E2E tests for Index page (landing)
 * Runs axe-core against the main landing page
 */
/// <reference types="cypress" />
import 'cypress-axe'

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
      cy.get('body').tab();
      cy.focused().then(($el) => {
        expect($el.length).to.be.greaterThan(0);
      });
    });
  });
});
