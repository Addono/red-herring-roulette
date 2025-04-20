describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the app title', () => {
    cy.get('h1').contains('Red Herring Roulette').should('be.visible');
  });

});
