"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Copy } from "lucide-react"
import { GameHelp } from "@/components/molecule/game-help"
import { encodePuzzle, decodePuzzle, DEFAULT_PUZZLE, type PuzzleData } from "@/lib/puzzle-utils"

// Fixed category colors by difficulty
const CATEGORY_COLORS = [
  "bg-yellow-100 border-yellow-500 text-yellow-800", // Yellow - Easy
  "bg-green-100 border-green-500 text-green-800", // Green - Medium
  "bg-blue-100 border-blue-500 text-blue-800", // Blue - Medium
  "bg-purple-100 border-purple-500 text-purple-800", // Purple - Hard
]

// Difficulty labels for each category
const DIFFICULTY_LABELS = ["Yellow (Easy)", "Green (Medium)", "Blue (Medium)", "Purple (Hard)"]

function CreatePuzzleContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editParam = searchParams.get("edit")
  const { toast } = useToast()
  const [puzzle, setPuzzle] = useState<PuzzleData>({
    ...DEFAULT_PUZZLE,
    categories: DEFAULT_PUZZLE.categories.map((cat, index) => ({
      ...cat,
      words: [...cat.words],
      color: CATEGORY_COLORS[index], // Ensure colors are fixed
    })),
    maxAttempts: 4, // Fixed at 4
    title: undefined,
    hiddenMessage: undefined,
  })
  const [generatedUrl, setGeneratedUrl] = useState<string>("")
  const [isEditing, setIsEditing] = useState<boolean>(false)

  // Load puzzle from URL parameter when editing
  useEffect(() => {
    if (editParam) {
      try {
        const decodedPuzzle = decodePuzzle(editParam)
        setPuzzle({
          ...decodedPuzzle,
          categories: decodedPuzzle.categories.map((cat, index) => ({
            ...cat,
            color: CATEGORY_COLORS[index], // Ensure colors are fixed
          })),
        })
        setIsEditing(true)
        toast({
          title: "Puzzle Loaded",
          description: "You're now editing an existing puzzle. After you make changes, your updated puzzle will have a new URL.",
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {
        toast({
          title: "Error",
          description: "Failed to load puzzle for editing. Starting with default puzzle.",
          variant: "destructive",
        })
      }
    }
  }, [editParam, toast])

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
      // Scroll to the bottom of the page
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
      }, 0)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
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
            <h1 className="text-2xl font-bold">{isEditing ? "Edit Puzzle" : "Create Puzzle"}</h1>
          </div>
          <div>
            <GameHelp maxAttempts={puzzle.maxAttempts} />
          </div>
        </div>

        {/* Puzzle Title and Hidden Message fields */}
        <Card className="border-2 mb-4 p-4">
          <div className="mb-3">
            <Label htmlFor="puzzle-title" className="font-medium mb-1 block">
              Puzzle Title (Optional)
            </Label>
            <Input
              id="puzzle-title"
              data-cy="puzzle-title"
              value={puzzle.title || ""}
              onChange={(e) => setPuzzle({ ...puzzle, title: e.target.value })}
              className="mb-3"
              placeholder="Give your puzzle a name"
            />
          </div>
          
          <div>
            <Label htmlFor="hidden-message" className="font-medium mb-1 block">
              Hidden Message (Optional)
            </Label>
            <Input
              id="hidden-message"
              data-cy="hidden-message"
              value={puzzle.hiddenMessage || ""}
              onChange={(e) => setPuzzle({ ...puzzle, hiddenMessage: e.target.value })}
              placeholder="Message shown when puzzle is completed"
            />
            <p className="text-xs text-slate-500 mt-1">
              This message will only be revealed when all categories are solved.
            </p>
          </div>
        </Card>

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
          {isEditing ? "Update Puzzle URL" : "Generate Puzzle URL"}
        </Button>

        {generatedUrl && (
          <div className="mt-4 animate-fade-in">
            <div className="mb-2">
              <h2 className="text-lg font-semibold">Your Puzzle URL</h2>
            </div>
            <div className="flex items-center bg-slate-100 rounded-md mb-3 overflow-hidden">
              <div className="p-3 text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
                {generatedUrl}
              </div>
              <div className="flex-shrink-0 pr-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard} className="h-7 w-7 p-0">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
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

export default function CreatePuzzle() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <CreatePuzzleContent />
    </Suspense>
  )
}
