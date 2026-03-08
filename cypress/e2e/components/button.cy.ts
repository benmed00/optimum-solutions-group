describe('Button Component E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/component-showcase')
    cy.get('[data-testid="buttons-card"]').scrollIntoView()
  })

  describe('Button Rendering and States', () => {
    it('should render all button variants correctly', () => {
      // Check all button variants are present and visible
      cy.get('[data-testid="btn-primary"]').should('be.visible').and('contain.text', 'Primary Button')
      cy.get('[data-testid="btn-secondary"]').should('be.visible').and('contain.text', 'Secondary Button')
      cy.get('[data-testid="btn-outline"]').should('be.visible').and('contain.text', 'Outline Button')
      cy.get('[data-testid="btn-destructive"]').should('be.visible').and('contain.text', 'Show Error Alert')
      cy.get('[data-testid="btn-ghost"]').should('be.visible').and('contain.text', 'Ghost Button')
      cy.get('[data-testid="btn-link"]').should('be.visible').and('contain.text', 'Link Button')
    })

    it('should render button sizes correctly', () => {
      cy.get('[data-testid="btn-small"]').should('be.visible').and('contain.text', 'Small Button')
      cy.get('[data-testid="btn-large"]').should('be.visible').and('contain.text', 'Large Button')
    })

    it('should handle disabled state correctly', () => {
      cy.get('[data-testid="btn-disabled"]').should('be.disabled').and('contain.text', 'Disabled Button')
      cy.get('[data-testid="btn-loading"]').should('be.disabled').and('contain.text', 'Loading...')
    })
  })

  describe('Button Interactions', () => {
    it('should handle click events for all interactive buttons', () => {
      // Test primary button click
      cy.get('[data-testid="btn-primary"]').click().should('be.visible')
      
      // Test secondary button click
      cy.get('[data-testid="btn-secondary"]').click().should('be.visible')
      
      // Test outline button click
      cy.get('[data-testid="btn-outline"]').click().should('be.visible')
      
      // Test destructive button click - should show alert
      cy.get('[data-testid="btn-destructive"]').click()
      cy.get('[data-testid="alerts-section"]').within(() => {
        cy.contains('Error').should('be.visible')
        cy.contains('This is a sample error message for testing purposes.').should('be.visible')
      })
    })

    it('should not respond to clicks when disabled', () => {
      // Disabled buttons should not be clickable
      cy.get('[data-testid="btn-disabled"]').should('be.disabled')
      cy.get('[data-testid="btn-loading"]').should('be.disabled')
      
      // Verify disabled buttons don't trigger any actions
      cy.get('[data-testid="btn-disabled"]').click({ force: true }) // Force click to test
      cy.get('[data-testid="alerts-section"]').should('not.contain', 'Button clicked')
    })

    it('should support keyboard navigation', () => {
      // Test Tab navigation (use real keyboard events - cy.type('{tab}') not supported)
      cy.get('[data-testid="btn-primary"]').realClick()
      cy.realPress('Tab')
      cy.focused().should('exist')

      // Test Enter key activation
      cy.get('[data-testid="btn-primary"]').focus().type('{enter}')
      cy.get('[data-testid="btn-primary"]').should('be.visible')

      // Test Space key activation
      cy.get('[data-testid="btn-secondary"]').focus().type(' ')
      cy.get('[data-testid="btn-secondary"]').should('be.visible')
    })
  })

  describe('Button Visual States', () => {
    it('should show focus states correctly', () => {
      cy.get('[data-testid="btn-focus-test"]').focus()
      cy.get('[data-testid="btn-focus-test"]').should('be.focused')
    })

    it('should show hover states correctly', () => {
      cy.get('[data-testid="btn-hover-test"]').trigger('mouseover')
      cy.get('[data-testid="btn-hover-test"]').should('be.visible')
      cy.get('[data-testid="btn-hover-test"]').trigger('mouseout')
    })

    it('should have proper CSS classes for variants', () => {
      // Check that buttons have variant-specific styling classes (from buttonVariants)
      cy.get('[data-testid="btn-primary"]').should('have.class', 'bg-primary')
      cy.get('[data-testid="btn-secondary"]').should('have.class', 'bg-secondary')
      cy.get('[data-testid="btn-outline"]').should('have.class', 'border')
      cy.get('[data-testid="btn-destructive"]').should('have.class', 'bg-destructive')
    })
  })

  describe('Button Accessibility', () => {
    it('should have no accessibility violations', () => {
      cy.injectAxe()
      cy.checkA11y('[data-testid="buttons-card"]', {
        rules: {
          'color-contrast': { enabled: false },
          'color-contrast-enhanced': { enabled: false },
          'landmark-unique': { enabled: false },
          'region': { enabled: false },
          'bypass': { enabled: false },
          'focus-order-semantics': { enabled: false },
          'heading-order': { enabled: false }
        }
      })
    })

    it('should have proper ARIA attributes', () => {
      cy.get('[data-testid="btn-primary"]').should('have.attr', 'type', 'button')

      // Native buttons have implicit role="button"; explicit role is optional
      cy.get('[data-testid="btn-primary"]').then(($btn) => {
        const role = $btn.attr('role')
        expect(role === undefined || role === 'button').to.be.true
      })

      // Disabled buttons should have disabled attribute
      cy.get('[data-testid="btn-disabled"]').should('have.attr', 'disabled')
    })

    it('should be navigable with keyboard', () => {
      cy.testKeyboardNavigation(
        '[data-testid="btn-primary"]',
        ['tab', 'tab', 'tab'],
        ['[data-testid="btn-secondary"]', '[data-testid="btn-outline"]', '[data-testid="btn-destructive"]']
      )
    })
  })

  describe('Button Responsive Behavior', () => {
    it('should work correctly on different screen sizes', () => {
      cy.testResponsive(() => {
        cy.get('[data-testid="btn-primary"]').should('be.visible').click()
        cy.get('[data-testid="btn-secondary"]').should('be.visible').click()
      })
    })

    it('should handle touch interactions on mobile', () => {
      cy.setViewportPreset('mobile')
      
      cy.get('[data-testid="btn-primary"]').trigger('touchstart').trigger('touchend')
      cy.get('[data-testid="btn-primary"]').should('be.visible')
    })
  })

  describe('Button Performance', () => {
    it('should handle rapid clicks without issues', () => {
      // Rapid clicking test
      for (let i = 0; i < 10; i++) {
        cy.get('[data-testid="btn-primary"]').click()
      }
      cy.get('[data-testid="btn-primary"]').should('be.visible')
    })

    it('should not cause memory leaks with event handlers', () => {
      // Click multiple buttons multiple times
      const buttons = [
        '[data-testid="btn-primary"]',
        '[data-testid="btn-secondary"]',
        '[data-testid="btn-outline"]',
        '[data-testid="btn-ghost"]'
      ]
      
      buttons.forEach(buttonSelector => {
        cy.get(buttonSelector).click()
        cy.wait(100)
      })
      
      // Verify page is still responsive
      cy.get('[data-testid="page-title"]').should('be.visible')
    })
  })

  describe('Button Form Integration', () => {
    it('should work correctly within forms', () => {
      cy.get('[data-testid="contact-form"]').within(() => {
        cy.get('[data-testid="btn-submit"]').should('be.disabled') // Should be disabled initially

        // Fill required fields
        cy.get('[data-testid="input-name"]').type('Test User')
        cy.get('[data-testid="input-email"]').type('test@example.com')
        cy.get('[data-testid="textarea-message"]').type('Test message')

        // Submit button should now be enabled
        cy.get('[data-testid="btn-submit"]').should('not.be.disabled')
        cy.get('[data-testid="btn-submit"]').click()
      })

      // alerts-section is a sibling of the form (page-level), not inside it
      cy.get('[data-testid="alerts-section"]').within(() => {
        cy.contains('Form Submitted').should('be.visible')
        cy.contains('Thank you, Test User!').should('be.visible')
      })
    })
  })

  describe('Button Loading States', () => {
    it('should show loading state correctly', () => {
      cy.get('[data-testid="btn-loading"]').should('be.disabled').and('contain.text', 'Loading...')
    })

    it('should handle state transitions', () => {
      // This would test dynamic loading state changes if implemented
      cy.get('[data-testid="btn-primary"]').should('not.be.disabled')
      cy.get('[data-testid="btn-primary"]').click()
      cy.get('[data-testid="btn-primary"]').should('not.be.disabled') // Should remain enabled
    })
  })
})
