export interface Category {
  name: string
  words: string[]
  color: string
}

export interface PuzzleData {
  categories: Category[]
  maxAttempts: number
  title?: string
  hiddenMessage?: string
}

// Fixed category colors by difficulty
const CATEGORY_COLORS = [
  "bg-yellow-100 border-yellow-500 text-yellow-800", // Yellow - Easy
  "bg-green-100 border-green-500 text-green-800", // Green - Medium
  "bg-blue-100 border-blue-500 text-blue-800", // Blue - Medium
  "bg-purple-100 border-purple-500 text-purple-800", // Purple - Hard
]

// Check if selected words are "one off" from a category (3 out of 4 words from the same category)
export function checkOneOff(selectedWords: string[], categories: Category[]): { isOneOff: boolean; categoryName: string } | null {
  for (const category of categories) {
    // Count how many selected words are in this category
    const wordsInCategory = selectedWords.filter(word => category.words.includes(word))
    
    // If exactly 3 out of 4 words are from the same category
    if (wordsInCategory.length === 3) {
      return {
        isOneOff: true,
        categoryName: category.name
      }
    }
  }
  
  return null
}

export const DEFAULT_PUZZLE: PuzzleData = {
  categories: [
    {
      name: "Animals",
      words: ["Elephant", "Tiger", "Koala", "Kiwi"],
      color: CATEGORY_COLORS[0],
    },
    {
      name: "Fruits which can be yellow",
      words: ["Pineapple", "Banana", "Lemon", "Mango"],
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
  t?: string // title
  m?: string // hidden message
}

// Encode puzzle data to base64 using compact format
export function encodePuzzle(puzzle: PuzzleData): string {
  try {
    // Convert to compact format
    const compactPuzzle: CompactPuzzle = {
      c: puzzle.categories.map((category) => 
        [category.name, category.words[0], category.words[1], category.words[2], category.words[3]] as [string, string, string, string, string]
      ),
      t: puzzle.title,
      m: puzzle.hiddenMessage,
    }

    const jsonString = JSON.stringify(compactPuzzle)
    // Use encodeURIComponent to handle unicode characters before base64 encoding
    return btoa(encodeURIComponent(jsonString))
  } catch (error) {
    console.error("Error encoding puzzle:", error)
    throw new Error("Failed to encode puzzle data")
  }
}

// Decode puzzle data from base64
export function decodePuzzle(encoded: string): PuzzleData {
  try {
    // Use decodeURIComponent after base64 decoding to handle unicode characters
    const jsonString = decodeURIComponent(atob(encoded))
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
      title: compactPuzzle.t,
      hiddenMessage: compactPuzzle.m,
    }
  } catch (error) {
    console.error("Error decoding puzzle:", error)
    throw new Error("Failed to decode puzzle data")
  }
}
