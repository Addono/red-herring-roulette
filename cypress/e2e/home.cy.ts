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

    it("should show a hint when user is one word off from a category", () => {
      // Setup: Get three words from the "Fruits" category and one different word
      const fruitWords = ["Apple", "Banana", "Orange"]
      const nonFruitWord = "Tiger" // from Animals category
      
      // Make a "one off" incorrect guess (3 fruits + 1 animal)
      const oneOffGuess = [...fruitWords, nonFruitWord]
      
      // Click on the words
      oneOffGuess.forEach((word) => {
        cy.get('[data-cy="word"]').contains(word).click()
      })
      
      // Submit the guess
      cy.get('[data-cy="submit-button"]').click()
      
      // Assert "one off" hint appears
      cy.get('[data-cy="toast"]').should("be.visible")
      cy.get('[data-cy="toast"]').contains("Almost There!").should("be.visible")
      cy.get('[data-cy="toast"]').contains("You're just one word off").should("be.visible")
      
      // Assert failed guess is displayed
      cy.get('[data-cy="failed-guess"]').should("be.visible")
      oneOffGuess.forEach((word) => {
        cy.get('[data-cy="failed-guess"]').contains(word).should("be.visible")
      })
    });
  })

  describe("Puzzle Editing", () => {
    it("should open edit dialog when clicking the new puzzle button", () => {
      cy.get('[data-cy="new-puzzle-button"]').click();
      cy.get('[data-cy="edit-dialog-content"]').should("be.visible");
      cy.get('[data-cy="edit-dialog-title"]').should("contain", "Puzzle Creator");
      cy.get('[data-cy="edit-dialog-description"]').should("contain", "Would you like to edit the current puzzle or create a new one from scratch?");
      cy.get('[data-cy="new-puzzle-option"]').should("be.visible");
      cy.get('[data-cy="edit-current-puzzle-option"]').should("be.visible");
    });

    it("should navigate to create page when clicking 'New Puzzle'", () => {
      cy.get('[data-cy="new-puzzle-button"]').click();
      cy.get('[data-cy="new-puzzle-option"]').click();
      cy.url().should("include", "/create");
      cy.url().should("not.include", "edit=");
    });

    it("should navigate to create page with edit parameter when clicking 'Edit Current Puzzle'", () => {
      cy.get('[data-cy="new-puzzle-button"]').click();
      cy.get('[data-cy="edit-current-puzzle-option"]').click();
      cy.url().should("include", "/create");
      cy.url().should("include", "edit=eyJjIjpbWyJGcnVpdHMiLCJBcHBsZSIsIkJhbmFuYSIsIk9yYW5nZSIsIlN0cmF3YmVycnkiXSxbIkFuaW1hbHMiLCJFbGVwaGFudCIsIlRpZ2VyIiwiR2lyYWZmZSIsIlBlbmd1aW4iXSxbIkNvdW50cmllcyIsIkNhbmFkYSIsIkJyYXppbCIsIkphcGFuIiwiRWd5cHQiXSxbIlNwb3J0cyIsIlNvY2NlciIsIlRlbm5pcyIsIkJhc2tldGJhbGwiLCJHb2xmIl1dfQ==");
    });
  });

  describe("Puzzle Title and Hidden Message", () => {
    it("should display puzzle title when provided in the encoded data", () => {
      // Visit with an encoded puzzle that includes a title
      const puzzleWithTitle = "eyJjIjpbWyJGcnVpdHMiLCJBcHBsZSIsIkJhbmFuYSIsIk9yYW5nZSIsIlN0cmF3YmVycnkiXSxbIkFuaW1hbHMiLCJFbGVwaGFudCIsIlRpZ2VyIiwiR2lyYWZmZSIsIlBlbmd1aW4iXSxbIkNvdW50cmllcyIsIkNhbmFkYSIsIkJyYXppbCIsIkphcGFuIiwiRWd5cHQiXSxbIlNwb3J0cyIsIlNvY2NlciIsIlRlbm5pcyIsIkJhc2tldGJhbGwiLCJHb2xmIl1dLCJ0IjoiQ2xhc3NpYyBDYXRlZ29yaWVzIFB1enpsZSJ9";
      cy.visit(`/?puzzle=${puzzleWithTitle}`);
      
      // Verify title is displayed
      cy.get('[data-cy="puzzle-title"]').should("be.visible");
      cy.get('[data-cy="puzzle-title"]').should("contain", "Classic Categories Puzzle");
    });

    it("should reveal hidden message after solving all categories", () => {
      // Visit with an encoded puzzle that includes a hidden message
      const puzzleWithHiddenMessage = "eyJjIjpbWyJGcnVpdHMiLCJBcHBsZSIsIkJhbmFuYSIsIk9yYW5nZSIsIlN0cmF3YmVycnkiXSxbIkFuaW1hbHMiLCJFbGVwaGFudCIsIlRpZ2VyIiwiR2lyYWZmZSIsIlBlbmd1aW4iXSxbIkNvdW50cmllcyIsIkNhbmFkYSIsIkJyYXppbCIsIkphcGFuIiwiRWd5cHQiXSxbIlNwb3J0cyIsIlNvY2NlciIsIlRlbm5pcyIsIkJhc2tldGJhbGwiLCJHb2xmIl1dLCJtIjoiWW91IGFyZSBhIGNsYXNzaWZpY2F0aW9uIG1hc3RlciEifQ==";
      cy.visit(`/?puzzle=${puzzleWithHiddenMessage}`);
      
      // Hidden message should not be visible initially
      cy.get('[data-cy="hidden-message"]').should("not.exist");
      
      // Solve all categories
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
      
      categories.forEach((category) => {
        // Click on the words in the category
        category.words.forEach((word) => {
          cy.get('[data-cy="word"]').contains(word).click();
        });
        // Submit the answer
        cy.get('[data-cy="submit-button"]').click();
      });
      
      // Verify hidden message appears
      cy.get('[data-cy="hidden-message"]').should("be.visible");
      cy.get('[data-cy="hidden-message"]').should("contain", "You are a classification master!");
    });

    it("should handle puzzles with both title and hidden message", () => {
      // Visit with an encoded puzzle that includes both title and hidden message
      const puzzleWithBoth = "eyJjIjpbWyJGcnVpdHMiLCJBcHBsZSIsIkJhbmFuYSIsIk9yYW5nZSIsIlN0cmF3YmVycnkiXSxbIkFuaW1hbHMiLCJFbGVwaGFudCIsIlRpZ2VyIiwiR2lyYWZmZSIsIlBlbmd1aW4iXSxbIkNvdW50cmllcyIsIkNhbmFkYSIsIkJyYXppbCIsIkphcGFuIiwiRWd5cHQiXSxbIlNwb3J0cyIsIlNvY2NlciIsIlRlbm5pcyIsIkJhc2tldGJhbGwiLCJHb2xmIl1dLCJ0IjoiTXkgQXdlc29tZSBQdXp6bGUiLCJtIjoiQ29uZ3JhdHVsYXRpb25zIG9uIHNvbHZpbmcgbXkgcHV6emxlISJ9";
      cy.visit(`/?puzzle=${puzzleWithBoth}`);
      
      // Title should be visible immediately
      cy.get('[data-cy="puzzle-title"]').should("be.visible");
      cy.get('[data-cy="puzzle-title"]').should("contain", "My Awesome Puzzle");
      
      // Hidden message should not be visible initially
      cy.get('[data-cy="hidden-message"]').should("not.exist");
      
      // Solve all categories
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
      
      categories.forEach((category) => {
        // Click on the words in the category
        category.words.forEach((word) => {
          cy.get('[data-cy="word"]').contains(word).click();
        });
        // Submit the answer
        cy.get('[data-cy="submit-button"]').click();
      });
      
      // Verify hidden message appears
      cy.get('[data-cy="hidden-message"]').should("be.visible");
      cy.get('[data-cy="hidden-message"]').should("contain", "Congratulations on solving my puzzle!");
    });
  });
});
