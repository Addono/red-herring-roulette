"use client"

import { HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface GameHelpProps {
  maxAttempts?: number
}

export function GameHelp({ maxAttempts = 4 }: GameHelpProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" data-cy="help-button">
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
          You have {maxAttempts} incorrect attempts before the game ends.
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
  )
}