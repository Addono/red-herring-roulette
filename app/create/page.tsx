"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Copy } from "lucide-react"
import { encodePuzzle, DEFAULT_PUZZLE, type PuzzleData } from "@/lib/puzzle-utils"

// Fixed category colors by difficulty
const CATEGORY_COLORS = [
  "bg-yellow-100 border-yellow-500 text-yellow-800", // Yellow - Easy
  "bg-green-100 border-green-500 text-green-800", // Green - Medium
  "bg-blue-100 border-blue-500 text-blue-800", // Blue - Medium
  "bg-purple-100 border-purple-500 text-purple-800", // Purple - Hard
]

// Difficulty labels for each category
const DIFFICULTY_LABELS = ["Yellow (Easy)", "Green (Medium)", "Blue (Medium)", "Purple (Hard)"]

export default function CreatePuzzle() {
  const router = useRouter()
  const { toast } = useToast()
  const [puzzle, setPuzzle] = useState<PuzzleData>({
    ...DEFAULT_PUZZLE,
    categories: DEFAULT_PUZZLE.categories.map((cat, index) => ({
      ...cat,
      words: [...cat.words],
      color: CATEGORY_COLORS[index], // Ensure colors are fixed
    })),
    maxAttempts: 4, // Fixed at 4
  })
  const [generatedUrl, setGeneratedUrl] = useState<string>("")

  const updateCategory = (index: number, field: string, value: string) => {
    const updatedCategories = [...puzzle.categories]
    updatedCategories[index] = {
      ...updatedCategories[index],
      [field]: value,
    }
    setPuzzle({ ...puzzle, categories: updatedCategories })
  }

  const updateWord = (categoryIndex: number, wordIndex: number, value: string) => {
    const updatedCategories = [...puzzle.categories]
    const updatedWords = [...updatedCategories[categoryIndex].words]
    updatedWords[wordIndex] = value
    updatedCategories[categoryIndex] = {
      ...updatedCategories[categoryIndex],
      words: updatedWords,
    }
    setPuzzle({ ...puzzle, categories: updatedCategories })
  }

  const generatePuzzleUrl = () => {
    // Validate puzzle data
    const isValid = validatePuzzle()
    if (!isValid) return

    try {
      const encoded = encodePuzzle(puzzle)
      const url = `${window.location.origin}?puzzle=${encoded}`
      setGeneratedUrl(url)
      toast({
        title: "URL Generated",
        description: "Your puzzle link is ready to share.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate puzzle URL.",
        variant: "destructive",
      })
    }
  }

  const validatePuzzle = () => {
    // Check if all categories have names
    const hasEmptyNames = puzzle.categories.some((cat) => !cat.name.trim())
    if (hasEmptyNames) {
      toast({
        title: "Validation Error",
        description: "All categories must have names.",
        variant: "destructive",
      })
      return false
    }

    // Check if all categories have 4 words
    const hasInvalidWordCount = puzzle.categories.some(
      (cat) => cat.words.length !== 4 || cat.words.some((word) => !word.trim()),
    )
    if (hasInvalidWordCount) {
      toast({
        title: "Validation Error",
        description: "All categories must have exactly 4 non-empty words.",
        variant: "destructive",
      })
      return false
    }

    // Check for duplicate words
    const allWords = puzzle.categories.flatMap((cat) => cat.words)
    const uniqueWords = new Set(allWords)
    if (uniqueWords.size !== allWords.length) {
      toast({
        title: "Validation Error",
        description: "All words must be unique across all categories.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const copyToClipboard = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl)
      toast({
        title: "Copied",
        description: "URL copied to clipboard.",
      })
    }
  }

  const playPuzzle = () => {
    if (generatedUrl) {
      const url = new URL(generatedUrl)
      router.push(url.pathname + url.search)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Create Puzzle</h1>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {puzzle.categories.map((category, categoryIndex) => (
            <Card key={categoryIndex} className={`border-2 ${category.color} overflow-hidden`}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Label htmlFor={`category-${categoryIndex}-name`} className="font-medium">
                    {DIFFICULTY_LABELS[categoryIndex]} Category
                  </Label>
                </div>

                <Input
                  id={`category-${categoryIndex}-name`}
                  value={category.name}
                  onChange={(e) => updateCategory(categoryIndex, "name", e.target.value)}
                  className="mb-3"
                  placeholder="Category name"
                />

                <div className="grid grid-cols-2 gap-2">
                  {category.words.map((word, wordIndex) => (
                    <Input
                      key={wordIndex}
                      value={word}
                      onChange={(e) => updateWord(categoryIndex, wordIndex, e.target.value)}
                      placeholder={`Word ${wordIndex + 1}`}
                      className="transition-all duration-200 hover:border-slate-400"
                    />
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Button
          onClick={generatePuzzleUrl}
          className="w-full transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Generate Puzzle URL
        </Button>

        {generatedUrl && (
          <div className="mt-4 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Your Puzzle URL</h2>
              <Button variant="outline" size="icon" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-3 bg-slate-100 rounded-md break-all text-sm mb-3">{generatedUrl}</div>
            <Button onClick={playPuzzle} className="w-full transition-transform hover:scale-[1.02] active:scale-[0.98]">
              Play This Puzzle
            </Button>
          </div>
        )}
      </div>
      <Toaster />
    </div>
  )
}
