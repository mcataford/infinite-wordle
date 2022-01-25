import {
    FragmentFeedbackType,
    ParsedPath,
    PuzzleAttemptFragmentFeedback,
} from '@shared/types'

import { pathsMap } from './constants'
import { getPuzzleBySolution } from './orm'

export async function isWordValid(word: string): Promise<boolean> {
    const puzzle = await getPuzzleBySolution(word)

    return !!puzzle
}

export function analyzeAttempt(
    attempt: string,
    solution: string,
): PuzzleAttemptFragmentFeedback[] {
    const feedback = []

    for (const idx in [...attempt]) {
        if (attempt[idx] === solution[idx])
            feedback.push({
                letter: attempt[idx],
                feedback: FragmentFeedbackType.Correct,
            })
        else if (solution.includes(attempt[idx]))
            feedback.push({
                letter: attempt[idx],
                feedback: FragmentFeedbackType.Misplaced,
            })
        else
            feedback.push({
                letter: attempt[idx],
                feedback: FragmentFeedbackType.Incorrect,
            })
    }

    return feedback
}

export function parsePath(path: string): ParsedPath | undefined {
    const unprefixedPath = path.replace(/^\/\.netlify\/functions\/api\/?/, '')
    for (const pathPattern of [...Object.keys(pathsMap)]) {
        const match = unprefixedPath.match(new RegExp(pathPattern))
        if (!match) {
            continue
        }

        const matchedFragments = Object.entries(match.groups ?? {}).reduce(
            (acc, [key, value]) => {
                return { ...acc, [key]: value }
            },
            {},
        )

        return { label: pathsMap[pathPattern], parameters: matchedFragments }
    }
}
