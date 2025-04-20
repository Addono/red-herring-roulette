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

  describe("Failed Guesses", () => {
    it("should display failed guesses and warn on duplicate incorrect guesses", () => {
      const incorrectGuess = ["Apple", "Tiger", "Canada", "Soccer"]

      // Make an incorrect guess
      incorrectGuess.forEach((word) => {
        cy.get('[data-cy="word"]').contains(word).click()
      })
      cy.get('[data-cy="submit-button"]').click()

      // Assert failed guess is displayed
      cy.get('[data-cy="failed-guess"]').should("be.visible")
      incorrectGuess.forEach((word) => {
        cy.get('[data-cy="failed-guess"]').contains(word).should("be.visible")
      })

      // Clear selections
      cy.get('[data-cy="deselect-button"]').click()

      // Attempt the same incorrect guess again
      incorrectGuess.reverse().forEach((word) => {
        cy.get('[data-cy="word"]').contains(word).click()
      })
      cy.get('[data-cy="submit-button"]').click()

      // Assert duplicate guess warning toast
      cy.get('[data-cy="toast"]').should("be.visible")
      cy.get('[data-cy="toast"]').contains("Duplicate Guess").should("be.visible")
    })

    it("should strike through words in failed guesses that are part of solved categories", () => {
      const incorrectGuess = ["Apple", "Tiger", "Canada", "Soccer"]
      const correctCategory = {
        name: "Fruits",
        words: ["Apple", "Banana", "Orange", "Strawberry"],
      }

      // Make an incorrect guess
      incorrectGuess.forEach((word) => {
        cy.get('[data-cy="word"]').contains(word).click()
      })
      cy.get('[data-cy="submit-button"]').click()

      // Clear selections
      cy.get('[data-cy="deselect-button"]').click()

      // Solve a category that includes a word from the failed guess
      correctCategory.words.forEach((word) => {
        cy.get('[data-cy="word"]').contains(word).click()
      })
      cy.get('[data-cy="submit-button"]').click()

      // Assert strikethrough for solved word in failed guesses
      cy.get('[data-cy="failed-guess"]').contains("Apple").should("have.css", "text-decoration-line", "line-through")
    })
  })
});
