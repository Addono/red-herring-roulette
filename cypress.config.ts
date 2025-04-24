import { defineConfig } from "cypress";

export default defineConfig({
  // Default viewport for testing on mobile
  viewportWidth: 375,
  viewportHeight: 667,
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
  },
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
    specPattern: 'cypress/component/**/*.cy.ts',
    supportFile: 'cypress/support/component.ts',
  },
});
