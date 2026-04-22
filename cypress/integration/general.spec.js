describe('Full Flow Test', () => {
  it('should log in and view dashboard', () => {
    // Otwórz stronę główną
    cy.visit('http://localhost:3000');

    // Wypełnij formularz logowania
    cy.get('input[name="username"]').type('testuser');
    cy.get('input[name="password"]').type('password');
    cy.get('button[type="submit"]').click();

    // Sprawdź, czy użytkownik został przekierowany na dashboard
    cy.url().should('include', '/dashboard');

    // Sprawdź, czy dashboard zawiera kluczowe elementy
    cy.contains('Welcome, testuser');
    cy.get('.offer-list').should('exist');
  });
});