describe("Create Page", () => {
  describe("Creating a new puzzle", () => {
    beforeEach(() => {
      cy.visit("/create");
    });

    it("should display the create puzzle title", () => {
      cy.contains("Create Puzzle").should("be.visible");
    });

    it("should allow filling out the form and generating a puzzle URL", () => {
      // Fill out category names
      cy.get('input[id="category-0-name"]').clear().type("Colors");
      cy.get('input[id="category-1-name"]').clear().type("Planets");
      cy.get('input[id="category-2-name"]').clear().type("Movies");
      cy.get('input[id="category-3-name"]').clear().type("Books");

      // Fill out category words
      const categories = [
        ["Red", "Blue", "Green", "Yellow"],
        ["Mars", "Venus", "Jupiter", "Mercury"],
        ["Titanic", "Avatar", "Inception", "Jaws"],
        ["1984", "Dune", "It", "Hobbit"]
      ];

      categories.forEach((words, catIndex) => {
        words.forEach((word, wordIndex) => {
          cy.get(`input[placeholder="Word ${wordIndex + 1}"]`).eq(catIndex).clear().type(word);
        });
      });

      // Generate URL
      cy.contains("Generate Puzzle URL").click();

      // Assert URL is generated
      cy.contains("Your Puzzle URL").should("be.visible");
      cy.get("div.bg-slate-100").should("be.visible");
    });
  });

  describe("Editing an existing puzzle", () => {
    const encodedPuzzle = "eyJjIjpbWyJGcnVpdHMiLCJBcHBsZSIsIkJhbmFuYSIsIk9yYW5nZSIsIlN0cmF3YmVycnkiXSxbIkFuaW1hbHMiLCJFbGVwaGFudCIsIlRpZ2VyIiwiR2lyYWZmZSIsIlBlbmd1aW4iXSxbIkNvdW50cmllcyIsIkNhbmFkYSIsIkJyYXppbCIsIkphcGFuIiwiRWd5cHQiXSxbIlNwb3J0cyIsIlNvY2NlciIsIlRlbm5pcyIsIkJhc2tldGJhbGwiLCJHb2xmIl1dfQ==";

    beforeEach(() => {
      cy.visit(`/create?edit=${encodedPuzzle}`);
    });

    it("should display the edit puzzle title", () => {
      cy.contains("Edit Puzzle").should("be.visible");
    });

    it("should load existing puzzle data", () => {
      // Verify category names are loaded
      cy.get('input[id="category-0-name"]').should("have.value", "Fruits");
      cy.get('input[id="category-1-name"]').should("have.value", "Animals");
      cy.get('input[id="category-2-name"]').should("have.value", "Countries");
      cy.get('input[id="category-3-name"]').should("have.value", "Sports");

      // Verify words for first category
      cy.get('input[placeholder="Word 1"]').eq(0).should("have.value", "Apple");
      cy.get('input[placeholder="Word 2"]').eq(0).should("have.value", "Banana");
      cy.get('input[placeholder="Word 3"]').eq(0).should("have.value", "Orange");
      cy.get('input[placeholder="Word 4"]').eq(0).should("have.value", "Strawberry");
    });

    it("should allow updating puzzle data and generating new URL", () => {
      // Update a category name
      cy.get('input[id="category-0-name"]').clear().type("Desserts");

      // Update some words
      cy.get('input[placeholder="Word 1"]').eq(0).clear().type("Cake");
      cy.get('input[placeholder="Word 2"]').eq(0).clear().type("Donut");

      // Generate updated URL
      cy.contains("Update Puzzle URL").click();

      // Assert URL is generated
      cy.contains("Your Puzzle URL").should("be.visible");
      cy.get("div.bg-slate-100").should("be.visible");

      // The URL should be different from the original
      cy.get("div.bg-slate-100").should("not.contain", encodedPuzzle);
    });

    it("should show a notification when puzzle is loaded for editing", () => {
      // Notification toast should appear when page loads with edit parameter
      cy.get('[data-cy="toast"]').should("be.visible");
      cy.get('[data-cy="toast"]').contains("Puzzle Loaded").should("be.visible");
      cy.get('[data-cy="toast"]').contains("You're now editing an existing puzzle.").should("be.visible");
    });
  });
});