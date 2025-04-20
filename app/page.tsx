"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { HelpCircle, Plus, Shuffle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { decodePuzzle, DEFAULT_PUZZLE } from "@/lib/puzzle-utils"

// Shuffle array helper function
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

interface WordItem {
  id: string
  word: string
  categoryIndex: number
  isVisible: boolean
}

export default function ConnectionsGame() {
  const searchParams = useSearchParams()
  const puzzleParam = searchParams.get("puzzle")

  const { toast } = useToast()
  const [puzzle, setPuzzle] = useState(DEFAULT_PUZZLE)
  const [wordItems, setWordItems] = useState<WordItem[]>([])
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [solvedCategories, setSolvedCategories] = useState<number[]>([])
  const [attempts, setAttempts] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showCorrectAnimation, setShowCorrectAnimation] = useState(false)
  const [showIncorrectAnimation, setShowIncorrectAnimation] = useState(false)

  // Load puzzle from URL or use default
  useEffect(() => {
    if (puzzleParam) {
      try {
        const decodedPuzzle = decodePuzzle(puzzleParam)
        setPuzzle(decodedPuzzle)
      } catch (error) {
        console.error("Failed to decode puzzle:", error)
        toast({
          title: "Invalid Puzzle",
          description: "The puzzle data in the URL is invalid. Using default puzzle instead.",
          variant: "destructive",
        })
      }
    }
  }, [puzzleParam, toast])

  // Initialize game
  useEffect(() => {
    initializeGame()
  }, [puzzle])

  const initializeGame = () => {
    const allWords: WordItem[] = []
    puzzle.categories.forEach((category, categoryIndex) => {
      category.words.forEach((word) => {
        allWords.push({
          id: `${word}-${categoryIndex}`,
          word,
          categoryIndex,
          isVisible: true,
        })
      })
    })
    setWordItems(shuffleArray(allWords))
  }

  // Handle word selection
  const toggleWordSelection = (word: string) => {
    if (gameOver || isAnimating) return

    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter((w) => w !== word))
    } else {
      if (selectedWords.length < 4) {
        setSelectedWords([...selectedWords, word])
      }
    }
  }

  // Check if selected words form a valid category
  const checkSelection = async () => {
    if (selectedWords.length !== 4 || isAnimating) return

    setIsAnimating(true)

    // Find the selected word items
    const selectedItems = wordItems.filter((item) => selectedWords.includes(item.word))

    // Check if all selected items belong to the same category
    const categoryIndices = selectedItems.map((item) => item.categoryIndex)
    const allSameCategory = categoryIndices.every((index) => index === categoryIndices[0])
    const categoryIndex = categoryIndices[0]

    if (allSameCategory && !solvedCategories.includes(categoryIndex)) {
      // Show correct animation
      setShowCorrectAnimation(true)

      // Wait for animation to complete
      setTimeout(() => {
        // Update solved categories
        setSolvedCategories([...solvedCategories, categoryIndex])

        // Update word items visibility
        setWordItems(
          wordItems.map((item) => (selectedWords.includes(item.word) ? { ...item, isVisible: false } : item)),
        )

        // Reset selection
        setSelectedWords([])

        // Show toast
        toast({
          title: "Correct!",
          description: `You found the ${puzzle.categories[categoryIndex].name} category.`,
        })

        // Reset animation state
        setShowCorrectAnimation(false)
        setIsAnimating(false)

        // Check if all categories are solved
        if (solvedCategories.length + 1 === puzzle.categories.length) {
          setGameOver(true)
          setGameWon(true)
          toast({
            title: "Congratulations!",
            description: "You've solved all categories!",
          })
        }
      }, 600)
    } else {
      // Show incorrect animation
      setShowIncorrectAnimation(true)

      // Wait for animation to complete
      setTimeout(() => {
        // Increment attempts
        setAttempts(attempts + 1)

        // Show toast
        toast({
          title: "Incorrect",
          description: "These words don't form a category.",
          variant: "destructive",
        })

        // Reset animation state
        setShowIncorrectAnimation(false)
        setIsAnimating(false)

        // Check if max attempts reached
        if (attempts + 1 >= puzzle.maxAttempts) {
          setGameOver(true)
          toast({
            title: "Game Over",
            description: "You've used all your attempts.",
            variant: "destructive",
          })
        }
      }, 600)
    }
  }

  // Reset game
  const resetGame = () => {
    setSelectedWords([])
    setSolvedCategories([])
    setAttempts(0)
    setGameOver(false)
    setGameWon(false)
    setIsAnimating(false)
    setShowCorrectAnimation(false)
    setShowIncorrectAnimation(false)
    initializeGame()
  }

  // Get word status (selected, solved, or normal)
  const getWordStatus = (word: string) => {
    // Check if word is in a solved category
    const wordItem = wordItems.find((item) => item.word === word)
    if (wordItem && solvedCategories.includes(wordItem.categoryIndex)) {
      return {
        solved: true,
        className: puzzle.categories[wordItem.categoryIndex].color,
        categoryName: puzzle.categories[wordItem.categoryIndex].name,
      }
    }

    // Check if word is selected
    if (selectedWords.includes(word)) {
      return {
        solved: false,
        className: showCorrectAnimation
          ? "bg-green-200 border-green-500"
          : showIncorrectAnimation
            ? "bg-red-200 border-red-500"
            : "bg-slate-200 border-slate-400",
        categoryName: null,
      }
    }

    // Normal word
    return {
      solved: false,
      className: "bg-white hover:bg-slate-100",
      categoryName: null,
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Red Herring Roulette</h1>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>How to Play</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Find groups of four words that share a common theme.
                  <br />
                  Select four words and submit your guess.
                  <br />
                  You have {puzzle.maxAttempts} incorrect attempts before the game ends.
                  <br />
                  Categories range from easy to hard:
                  <ul className="list-disc pl-5 mt-2">
                    <li className="text-yellow-600">Yellow - Easiest</li>
                    <li className="text-green-600">Green - Easy</li>
                    <li className="text-blue-600">Blue - Medium</li>
                    <li className="text-purple-600">Purple - Hard</li>
                  </ul>
                </DialogDescription>
              </DialogContent>
            </Dialog>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={resetGame} data-cy="shuffle-button">
                    <Shuffle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset and shuffle the game</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Link href="/create">
              <Button variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Game status */}
        <div className="flex justify-between mb-4">
          <div>
            Attempts: {attempts}/{puzzle.maxAttempts}
          </div>
        </div>

        {/* Solved categories */}
        <div className="space-y-2 mb-4">
          {solvedCategories.map((categoryIndex) => (
            <div key={`solved-${categoryIndex}`} className="transform transition-all duration-500 animate-fade-in-down" data-cy="solved-category">
              <Card className={`p-3 ${puzzle.categories[categoryIndex].color}`}>
                <div className="font-bold">{puzzle.categories[categoryIndex].name}</div>
                <div className="text-sm">{puzzle.categories[categoryIndex].words.join(", ")}</div>
              </Card>
            </div>
          ))}
        </div>

        {/* Word grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {wordItems
            .filter((item) => item.isVisible)
            .map((item) => {
              const status = getWordStatus(item.word)
              return (
                <div
                  key={item.id}
                  className={`
                    transition-all duration-300 transform
                    ${selectedWords.includes(item.word) && showCorrectAnimation ? "animate-pulse-once" : ""}
                    ${selectedWords.includes(item.word) && showIncorrectAnimation ? "animate-shake" : ""}
                    hover:scale-105 active:scale-95
                  `}
                >
                  <Button
                    variant="outline"
                    className={`h-16 w-full font-medium border-2 transition-colors duration-300 ${status.className} ${
                      status.solved ? "cursor-default" : "cursor-pointer"
                    }`}
                    data-cy="word"
                    onClick={() => !status.solved && toggleWordSelection(item.word)}
                    disabled={status.solved || isAnimating}
                  >
                    {item.word}
                  </Button>
                </div>
              )
            })}
        </div>

        {/* Controls */}
        <div className="flex gap-2 mb-4">
          <Button
            className="flex-1 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => setSelectedWords([])}
            disabled={selectedWords.length === 0 || gameOver || isAnimating}
            data-cy="deselect-button"
          >
            Deselect All
          </Button>
          <Button
            className="flex-1 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            onClick={checkSelection}
            disabled={selectedWords.length !== 4 || gameOver || isAnimating}
            data-cy="submit-button"
          >
            Submit
          </Button>
        </div>

        {/* Game over message */}
        {gameOver && (
          <div className="animate-fade-in-up" data-cy="solution">
            <Card className={`p-4 mt-4 ${gameWon ? "bg-green-100" : "bg-red-100"}`}>
              <h2 className="text-lg font-bold mb-2">{gameWon ? "Congratulations!" : "Game Over"}</h2>
              <p>{gameWon ? "You've successfully found all categories!" : "You've used all your attempts."}</p>
              <Button
                className="w-full mt-3 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                onClick={resetGame}
              >
                Play Again
              </Button>
            </Card>
          </div>
        )}
      </div>
      <Toaster toastOptions={{ className: "data-cy-toast" }} />
    </div>
  )
}
