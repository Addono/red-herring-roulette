describe("Home Page", () => {
  beforeEach(() => {
    // Test with specific puzzle data encoded in the url
    cy.visit("/?puzzle=eyJjIjpbWyJGcnVpdHMiLCJBcHBsZSIsIkJhbmFuYSIsIk9yYW5nZSIsIlN0cmF3YmVycnkiXSxbIkFuaW1hbHMiLCJFbGVwaGFudCIsIlRpZ2VyIiwiR2lyYWZmZSIsIlBlbmd1aW4iXSxbIkNvdW50cmllcyIsIkNhbmFkYSIsIkJyYXppbCIsIkphcGFuIiwiRWd5cHQiXSxbIlNwb3J0cyIsIlNvY2NlciIsIlRlbm5pcyIsIkJhc2tldGJhbGwiLCJHb2xmIl1dfQ==");
  });

  it("should display the app title", () => {
    cy.get("h1").contains("Red Herring Roulette").should("be.visible");
  });

  it('should allow reshuffling the words in the puzzle', () => {
    // Capture the initial order of words
    cy.get('[data-cy="word"]').then((wordsBefore) => {
      const initialWords = Array.from(wordsBefore).map((word) => word.textContent);

      // Click the shuffle button
      cy.get('[data-cy="shuffle-button"]').click();

      // Capture the new order of words
      cy.get('[data-cy="word"]').then((wordsAfter) => {
        const shuffledWords = Array.from(wordsAfter).map((word) => word.textContent);

        // Assert that the order of words has changed
        expect(shuffledWords).to.not.deep.equal(initialWords);
      });
    });
  });

  describe("Playing the game", () => {
    const categories = [
      {
        name: "Fruits",
        words: ["Apple", "Banana", "Orange", "Strawberry"],
      },
      {
        name: "Animals",
        words: ["Elephant", "Tiger", "Giraffe", "Penguin"],
      },
      {
        name: "Countries",
        words: ["Canada", "Brazil", "Japan", "Egypt"],
      },
      {
        name: "Sports",
        words: ["Soccer", "Tennis", "Basketball", "Golf"],
      },
    ];

    const solveCategory = (category: typeof categories[number]) => {
      // Click on the words in the category
      category.words.forEach((word: string) => {
        cy.get('[data-cy="word"]').contains(word).click();
      });

      // Click on the Submit button
      cy.get('[data-cy="submit-button"]').click();

      // Assert toast message
      cy.get('[data-cy="toast"]').should("be.visible");
      cy.get('[data-cy="toast"]')
        .contains("Correct!")
        .should("be.visible");

      // Assert solved category
      cy.get('[data-cy="solved-category"]').should("be.visible");
      cy.get('[data-cy="solved-category"]').contains(category.name).should("be.visible");
    };

    categories.forEach((category) => {
      it(`should allow solving the "${category.name}" category`, () => {
        solveCategory(category);
      });
    });

    it("should allow solving all categories and display the success message", () => {
      categories.forEach((category) => {
        solveCategory(category);
      });

      // Assert final success message
      cy.get('[data-cy="toast"]').should("be.visible");
      cy.get('[data-cy="toast"]')
        .contains("Congratulations!")
        .should("be.visible");
    });
  });
});
