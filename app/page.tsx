"use client"

import { Suspense } from "react"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Shuffle, X } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { decodePuzzle, DEFAULT_PUZZLE, checkOneOff } from "@/lib/puzzle-utils"
import { GameHelp } from "@/components/molecule/game-help"

// EditPuzzleDialog component
function EditPuzzleDialog({ puzzleParam, isLoading }: { puzzleParam: string | null, isLoading: boolean }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleEditCurrent = () => {
    // If no puzzle parameter is provided, encode the default puzzle
    const paramToUse = puzzleParam || encodeURIComponent(btoa(JSON.stringify({ c: DEFAULT_PUZZLE.categories.map(c => [c.name, ...c.words]) })))
    router.push(`/create?edit=${paramToUse}`)
    setIsOpen(false)
  }

  const handleNewPuzzle = () => {
    router.push("/create")
    setIsOpen(false)
  }

  const handleButtonClick = () => {
    setIsOpen(true)
  }

  return (
    <div>
      <Button 
        variant="outline" 
        size="icon" 
        data-cy="new-puzzle-button"
        onClick={handleButtonClick}
        disabled={isLoading}
      >
        <Plus className="h-4 w-4" />
      </Button>
      
      {/* Use a simpler dialog implementation for better test detection */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" data-cy="edit-dialog-container">
          <div className="fixed inset-0 bg-black/80" onClick={() => setIsOpen(false)}></div>
          <div className="z-50 w-full max-w-lg bg-background p-6 shadow-lg sm:rounded-lg" data-cy="edit-dialog-content">
            <div className="flex flex-col space-y-1.5 text-center sm:text-left">
              <h2 className="text-lg font-semibold leading-none tracking-tight" data-cy="edit-dialog-title">
                Puzzle Creator
              </h2>
            </div>
            <div className="text-sm text-muted-foreground mt-4" data-cy="edit-dialog-description">
              Would you like to edit the current puzzle or create a new one from scratch?
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={handleNewPuzzle} data-cy="new-puzzle-option">
                New Puzzle
              </Button>
              <Button onClick={handleEditCurrent} data-cy="edit-current-puzzle-option">
                Edit Current Puzzle
              </Button>
            </div>
            <button 
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100" 
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

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

function ConnectionsGame() {
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
  const [failedGuesses, setFailedGuesses] = useState<string[][]>([])
  const [isLoading, setIsLoading] = useState(true)

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
    setIsLoading(false)
  }, [puzzleParam, toast])

  // Initialize game with shuffled words
  const initializeGame = useCallback(() => {
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
  }, [puzzle])

  // Initialize game
  useEffect(() => {
    initializeGame()
  }, [initializeGame])

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
          description: `You found the "${puzzle.categories[categoryIndex].name}" category.`,
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
      // Prevent duplicate incorrect guesses
      const isDuplicateGuess = failedGuesses.some(
        (guess) => guess.sort().join(",") === selectedWords.sort().join(",")
      )
      if (isDuplicateGuess) {
        toast({
          title: "Duplicate Guess",
          description: "You've already made this incorrect guess.",
          variant: "default",
        })
        setIsAnimating(false)
        return
      }

      // Check if three words belong to the same category (one off)
      const oneOffResult = checkOneOff(selectedWords, puzzle.categories)

      // Show incorrect animation
      setShowIncorrectAnimation(true)

      // Wait for animation to complete
      setTimeout(() => {
        // Increment attempts
        setAttempts(attempts + 1)

        // Add to failed guesses
        setFailedGuesses([...failedGuesses, selectedWords])

        // Show toast with one-off message if applicable
        if (oneOffResult && oneOffResult.isOneOff) {
          toast({
            title: "Almost There!",
            description: `You're just one word off.`,
            variant: "default",
          })
        } else {
          toast({
            title: "Incorrect",
            description: "These words don't form a category.",
            variant: "destructive",
          })
        }

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

  // Shuffle remaining words without resetting the game state
  const shuffleRemainingWords = () => {
    if (isAnimating) return;
    
    // Get only the visible words (not solved)
    const visibleWordItems = wordItems.filter(item => item.isVisible);
    const shuffledVisibleItems = shuffleArray(visibleWordItems);
    
    // Create the new wordItems array by keeping solved items in place
    // and replacing visible items with the shuffled ones
    let shuffledIndex = 0;
    const newWordItems = wordItems.map(item => {
      if (!item.isVisible) {
        // Keep solved items as is
        return item;
      } else {
        // Replace with shuffled item
        return shuffledVisibleItems[shuffledIndex++];
      }
    });
    
    // Reset selection when shuffling
    setSelectedWords([]);
    setWordItems(newWordItems);
  };

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
    setFailedGuesses([])
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
      // Check if this word was part of a previous incorrect guess
      const wasIncorrectlyGuessed = failedGuesses.some(guess => guess.includes(word))
      
      return {
        solved: false,
        className: showCorrectAnimation
          ? "bg-green-200 border-green-500"
          : showIncorrectAnimation
            ? "bg-red-200 border-red-500"
            : wasIncorrectlyGuessed
              ? "bg-orange-100 border-orange-400" // Highlight previously incorrect words
              : "bg-slate-200 border-slate-400",
        categoryName: null,
        wasIncorrectlyGuessed,
      }
    }

    // Check if word was part of a previous incorrect guess (but not currently selected)
    const wasIncorrectlyGuessed = failedGuesses.some(guess => guess.includes(word))
    
    // Normal word
    return {
      solved: false,
      className: `bg-white hover:bg-slate-100 ${wasIncorrectlyGuessed ? "border-orange-200" : ""}`,
      categoryName: null,
      wasIncorrectlyGuessed,
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Red Herring Roulette</h1>
          <div className="flex gap-2">
            <GameHelp maxAttempts={puzzle.maxAttempts} />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={shuffleRemainingWords}
                    data-cy="shuffle-button"
                    disabled={isAnimating}
                  >
                    <Shuffle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Shuffle remaining words</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <EditPuzzleDialog puzzleParam={puzzleParam} isLoading={isLoading} />
          </div>
        </div>

        {/* Display puzzle title if available */}

        {/* Game status */}
        <div className="flex justify-between mb-4">
          {puzzle.title && (
            <div className="mb-4 text-center">
              <h2 className="text-xl font-semibold" data-cy="puzzle-title">
                {puzzle.title}
              </h2>
            </div>
          )}
          <div>
            Attempts: {attempts}/{puzzle.maxAttempts}
          </div>
        </div>

        {/* Solved categories */}
        <div className="space-y-2 mb-4">
          {solvedCategories.map((categoryIndex) => (
            <div
              key={`solved-${categoryIndex}`}
              className="transform transition-all duration-500 animate-fade-in-down"
              data-cy="solved-category"
            >
              <Card className={`p-3 ${puzzle.categories[categoryIndex].color}`}>
                <div className="font-bold">
                  {puzzle.categories[categoryIndex].name}
                </div>
                <div className="text-sm">
                  {puzzle.categories[categoryIndex].words.join(", ")}
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Word grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {wordItems
            .filter((item) => item.isVisible)
            .map((item) => {
              const status = getWordStatus(item.word);
              return (
                <div
                  key={item.id}
                  className={`
                    word-container
                    transition-all duration-300 transform
                    ${
                      selectedWords.includes(item.word) && showCorrectAnimation
                        ? "animate-pulse-once"
                        : ""
                    }
                    ${
                      selectedWords.includes(item.word) &&
                      showIncorrectAnimation
                        ? "animate-shake"
                        : ""
                    }
                    hover:scale-105 active:scale-95
                  `}
                >
                  <Button
                    variant="outline"
                    className={`h-16 w-full font-medium border-2 transition-colors duration-300 ${
                      status.className
                    } ${status.solved ? "cursor-default" : "cursor-pointer"}`}
                    data-cy="word"
                    onClick={() =>
                      !status.solved && toggleWordSelection(item.word)
                    }
                    disabled={status.solved || isAnimating}
                  >
                    <span className="word-text">{item.word}</span>
                  </Button>
                </div>
              );
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
            <Card
              className={`p-4 mt-4 ${gameWon ? "bg-green-100" : "bg-red-100"}`}
            >
              <h2 className="text-lg font-bold mb-2">
                {gameWon ? "Congratulations!" : "Game Over"}
              </h2>
              <p>
                {gameWon
                  ? "You've successfully found all categories!"
                  : "You've used all your attempts."}
              </p>

              {/* Show hidden message if available and game was won */}
              {gameWon && puzzle.hiddenMessage && (
                <div
                  className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md"
                  data-cy="hidden-message"
                >
                  <p className="text-sm font-medium text-yellow-800">
                    Hidden Message:
                  </p>
                  <p className="mt-1 text-yellow-900">{puzzle.hiddenMessage}</p>
                </div>
              )}

              <Button
                className="w-full mt-3 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                onClick={resetGame}
              >
                Play Again
              </Button>
            </Card>
          </div>
        )}

        {/* Failed guesses */}
        {failedGuesses.length > 0 && (
          <div className="space-y-2 mt-4">
            <h2 className="text-lg font-bold">Incorrect Guesses</h2>
            {failedGuesses.map((guess, index) => (
              <div
                key={`failed-guess-${index}`}
                className="flex gap-2"
                data-cy="failed-guess"
              >
                {guess.map((word) => {
                  const wordItem = wordItems.find((item) => item.word === word);
                  const isSolved =
                    wordItem &&
                    solvedCategories.includes(wordItem.categoryIndex);
                  return (
                    <span
                      key={word}
                      className={`px-2 py-1 border rounded ${
                        isSolved ? "line-through text-gray-400" : "text-black"
                      }`}
                    >
                      {word}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConnectionsGame />
    </Suspense>
  )
}
