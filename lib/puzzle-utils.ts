export interface Category {
  name: string
  words: string[]
  color: string
}

export interface PuzzleData {
  categories: Category[]
  maxAttempts: number
}

// Fixed category colors by difficulty
const CATEGORY_COLORS = [
  "bg-yellow-100 border-yellow-500 text-yellow-800", // Yellow - Easy
  "bg-green-100 border-green-500 text-green-800", // Green - Medium
  "bg-blue-100 border-blue-500 text-blue-800", // Blue - Medium
  "bg-purple-100 border-purple-500 text-purple-800", // Purple - Hard
]

export const DEFAULT_PUZZLE: PuzzleData = {
  categories: [
    {
      name: "Fruits",
      words: ["Apple", "Banana", "Orange", "Strawberry"],
      color: CATEGORY_COLORS[0],
    },
    {
      name: "Animals",
      words: ["Elephant", "Tiger", "Giraffe", "Penguin"],
      color: CATEGORY_COLORS[1],
    },
    {
      name: "Countries",
      words: ["Canada", "Brazil", "Japan", "Egypt"],
      color: CATEGORY_COLORS[2],
    },
    {
      name: "Sports",
      words: ["Soccer", "Tennis", "Basketball", "Golf"],
      color: CATEGORY_COLORS[3],
    },
  ],
  maxAttempts: 4,
}

// Compact format for encoding
interface CompactPuzzle {
  c: [string, string, string, string, string][] // [categoryName, word1, word2, word3, word4][]
}

// Encode puzzle data to base64 using compact format
export function encodePuzzle(puzzle: PuzzleData): string {
  try {
    // Convert to compact format
    const compactPuzzle: CompactPuzzle = {
      c: puzzle.categories.map((category) => [category.name, ...category.words]),
    }

    const jsonString = JSON.stringify(compactPuzzle)
    return btoa(jsonString) // Direct base64 encoding without URI encoding
  } catch (error) {
    console.error("Error encoding puzzle:", error)
    throw new Error("Failed to encode puzzle data")
  }
}

// Decode puzzle data from base64
export function decodePuzzle(encoded: string): PuzzleData {
  try {
    const jsonString = atob(encoded) // Direct base64 decoding without URI decoding
    const compactPuzzle = JSON.parse(jsonString) as CompactPuzzle

    // Convert from compact format back to full format
    const categories: Category[] = compactPuzzle.c.map((categoryData, index) => {
      const [name, ...words] = categoryData
      return {
        name,
        words,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length], // Ensure we have a valid color
      }
    })

    return {
      categories,
      maxAttempts: 4, // Always fixed at 4
    }
  } catch (error) {
    console.error("Error decoding puzzle:", error)
    throw new Error("Failed to decode puzzle data")
  }
}
