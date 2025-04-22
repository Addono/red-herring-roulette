# Red Herring Roulette

A word categorization puzzle game inspired by NYT Connections.

<img width="1136" alt="image" src="https://github.com/user-attachments/assets/246731f2-5524-40c5-aa84-6bf654541f65" />

## Overview

Red Herring Roulette challenges players to group words into their correct categories. The game presents players with a set of words that need to be sorted into logical categories. Each category contains four related words, and it's your job to figure out the connections!

## How to Play

1. **Select Words**: Click on four words that you think belong to the same category.
2. **Submit**: Click the submit button to check if your grouping is correct.
3. **Solve Categories**: Successfully identify all categories to win the game.
4. **Avoid Duplicates**: The game will warn you if you try to submit the same incorrect guess twice.

## Features

- **Word Shuffling**: Rearrange words with the shuffle button for a fresh perspective.
- **Failed Guesses Tracking**: Keep track of your previous incorrect attempts.
- **Visual Feedback**: Words that belong to solved categories are struck through in the failed guesses list.
- **Deselect Option**: Clear your current selection with the deselect button.

## Development

This project is built with:
- React for the UI components
- Cypress for end-to-end testing

## Testing

Run the Cypress test suite to verify functionality:

```bash
npm run cypress:open
```

The test suite includes:
- Verification of game mechanics
- Testing of the UI components
- Validation of game logic like solving categories and handling failed guesses
