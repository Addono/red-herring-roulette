/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to login with email and password
     * @example cy.login('email@example.com', 'password123')
     */
    login(email: string, password: string): Chainable<void>;
    
    // Add more custom commands as you create them
  }
}
