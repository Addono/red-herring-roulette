describe("Create Page", () => {
  describe("Creating a new puzzle", () => {
    beforeEach(() => {
      cy.visit("/create");
    });

    it("should display the create puzzle title", () => {
      cy.contains("Create Puzzle").should("be.visible");
    });

    it("should allow filling out the form and generating a puzzle URL", () => {
      // Fill out puzzle title and hidden message
      cy.get('[data-cy="puzzle-title"]').type("Movie Night Challenge");
      cy.get('[data-cy="hidden-message"]').type("You're a true film buff!");
      
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

    it("should allow playing a created puzzle with title and hidden message", () => {
      // Fill out puzzle title and hidden message
      const puzzleTitle = "Movie Night Challenge";
      const hiddenMessage = "You're a true film buff!";
      
      cy.get('[data-cy="puzzle-title"]').type(puzzleTitle);
      cy.get('[data-cy="hidden-message"]').type(hiddenMessage);
      
      // Fill out category names and words (minimal setup for test)
      cy.get('input[id="category-0-name"]').clear().type("Colors");
      cy.get('input[id="category-1-name"]').clear().type("Planets");
      cy.get('input[id="category-2-name"]').clear().type("Movies");
      cy.get('input[id="category-3-name"]').clear().type("Books");

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

      // Generate URL and play
      cy.contains("Generate Puzzle URL").click();
      cy.contains("Play This Puzzle").click();

      // Verify title is displayed on the game page
      cy.get('[data-cy="puzzle-title"]').should("be.visible");
      cy.get('[data-cy="puzzle-title"]').should("contain", puzzleTitle);
      
      // The hidden message should not be visible yet
      cy.get('[data-cy="hidden-message"]').should("not.exist");
    });

    it("should support unicode characters and emojis in titles and words", () => {
      // Fill out puzzle title and hidden message with emojis
      const puzzleTitle = "🎮 Gaming Puzzle 🎲";
      const hiddenMessage = "You solved it! 🎉👏";
      
      cy.get('[data-cy="puzzle-title"]').type(puzzleTitle);
      cy.get('[data-cy="hidden-message"]').type(hiddenMessage);
      
      // Fill out category names with unicode characters
      cy.get('input[id="category-0-name"]').clear().type("🍕 Food");
      cy.get('input[id="category-1-name"]').clear().type("🎬 Movies");
      cy.get('input[id="category-2-name"]').clear().type("🎵 Music");
      cy.get('input[id="category-3-name"]').clear().type("📚 Books");

      // Fill out category words with emoji combinations
      const categories = [
        ["🍔 Burger", "🍦 Ice Cream", "🍫 Chocolate", "🥤 Soda"],
        ["Star Wars ⭐", "Jurassic Park 🦖", "Avengers 🦸‍♂️", "Titanic 🚢"],
        ["Rock 🎸", "Jazz 🎷", "Pop 🎤", "Classical 🎻"],
        ["Harry Potter ⚡", "Lord of Rings 💍", "Dune 🏜️", "1984 👁️"]
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
      
      // Play the puzzle
      cy.contains("Play This Puzzle").click();
      
      // Verify title is displayed with emojis intact
      cy.get('[data-cy="puzzle-title"]').should("be.visible");
      cy.get('[data-cy="puzzle-title"]').should("contain", puzzleTitle);
      
      // Verify words with emojis are displayed correctly
      cy.get('[data-cy="word"]').contains("🍔 Burger").should("be.visible");
      cy.get('[data-cy="word"]').contains("Star Wars ⭐").should("be.visible");
      cy.get('[data-cy="word"]').contains("Rock 🎸").should("be.visible");
      cy.get('[data-cy="word"]').contains("Harry Potter ⚡").should("be.visible");
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