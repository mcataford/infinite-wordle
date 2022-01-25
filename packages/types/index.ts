export enum FragmentFeedbackType {
    Correct = 'correct',
    Misplaced = 'misplaced',
    Incorrect = 'incorrect',
}

export interface PuzzleRecord {
    id: number
    solution: string
}

export interface ParsedPath {
    label: string
    parameters: {
        [key: string]: string
    }
}

export interface PuzzleDetails {
    length: number
    id: number
}

export interface PuzzleAttemptFragment {
    letter: string
}

export interface PuzzleAttemptFragmentFeedback extends PuzzleAttemptFragment {
    feedback: FragmentFeedbackType
}

export interface PuzzleAttemptResponse {
    feedback: PuzzleAttemptFragmentFeedback[]
    attempt: string
    accepted: boolean
}

export interface GameState {
    currentWord: PuzzleAttemptFragment[]
    pastAttempts: PuzzleAttemptFragmentFeedback[][]
    puzzleSize: number
    puzzleId: number
}
