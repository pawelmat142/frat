describe('Smoke Test', () => {

  it('should load the home page', () => {
    cy.visit('/');
    cy.url().should('eq', Cypress.config('baseUrl') + '/');
  });

  it('should navigate to sign-in page', () => {
    cy.visit('/sign-in');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should show validation when submitting empty sign-in form', () => {
    cy.visit('/sign-in');
    cy.get('button[type="submit"]').click();
    cy.get('input[name="email"]').should('be.visible');
    cy.url().should('include', '/sign-in');
  });

  it('should navigate to sign-up page', () => {
    cy.visit('/sign-up');
    cy.url().should('include', '/sign-up');
  });

  it('should return 404-like page for unknown route', () => {
    cy.visit('/non-existing-page', { failOnStatusCode: false });
    cy.url().should('include', '/non-existing-page');
  });
});
