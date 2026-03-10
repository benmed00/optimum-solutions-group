/**
 * E2E tests for Index page (landing page)
 * Covers critical user journey: hero visibility, navigation, contact section
 */

describe('Index Page - Landing', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Hero section', () => {
    it('should display hero section with heading', () => {
      cy.get('#hero', { timeout: 15000 }).should('be.visible');
      cy.get('#hero-heading').should('be.visible').and('contain.text', 'Optimum');
    });

    it('should have main content landmark', () => {
      cy.get('main#main, [role="main"]').should('exist').and('be.visible');
    });
  });

  describe('Navigation', () => {
    it('should display navigation with links', () => {
      cy.get('nav, [role="navigation"]').should('be.visible');
      // Nav uses buttons with onClick, not anchor tags; check for Contact nav item
      cy.get('nav').contains('Contact').should('exist');
    });

    it('should have skip link for accessibility', () => {
      cy.get('a[href="#main"]').should('exist');
    });
  });

  describe('Contact section', () => {
    it('should have contact section in DOM', () => {
      cy.get('#contact').should('exist');
    });

    it('should scroll to contact and display form', () => {
      cy.get('#contact').scrollIntoView();
      cy.get('#contact', { timeout: 10000 }).should('be.visible');
      cy.get('#contact-name').should('exist');
      cy.get('#contact-email').should('exist');
    });
  });

  describe('Responsive behavior', () => {
    it('should render on mobile viewport', () => {
      cy.viewport(375, 667);
      cy.get('#hero').should('be.visible');
      cy.get('main#main, [role="main"]').should('exist');
    });

    it('should render on tablet viewport', () => {
      cy.viewport(768, 1024);
      cy.get('#hero').should('be.visible');
      cy.get('#contact').should('exist');
    });
  });
});
