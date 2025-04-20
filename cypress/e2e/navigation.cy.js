describe('Navigation', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should navigate to the about page', () => {
    cy.get('[data-cy="about-link"]').click();
    cy.url().should('include', '/about');
    cy.contains('About Red Herring Roulette').should('be.visible');
  });

  it('should navigate back to home page', () => {
    cy.get('[data-cy="about-link"]').click();
    cy.get('[data-cy="home-link"]').click();
    cy.url().should('not.include', '/about');
  });
});
