import { Handler } from '@netlify/functions'
import type { PuzzleAttemptResponse, PuzzleDetails } from '@shared/types'

import { DEFAULT_PUZZLE_LENGTH } from './constants'
import { analyzeAttempt, isWordValid, parsePath } from './utils'
import { getPuzzleById, getRandomPuzzle } from './orm'

async function handleListRequest(event) {
    if (!['GET'].includes(event.httpMethod)) return { statusCode: 405 }

    const length = parseInt(
        event.queryStringParameters.puzzleLength ?? DEFAULT_PUZZLE_LENGTH,
    )
    const puzzle = await getRandomPuzzle(length)
    const response: PuzzleDetails = {
        id: puzzle.id,
        length: puzzle.solution.length,
    }

    return { statusCode: 200, body: JSON.stringify(response) }
}

async function handleDetailRequest(event, context, parsedPath) {
    if (!['POST', 'GET'].includes(event.httpMethod)) return { statusCode: 405 }

    const puzzleId = parsedPath.parameters.puzzleId

    const puzzleSolution = await getPuzzleById(parseInt(puzzleId))

    if (!puzzleSolution) return { statusCode: 400 }

    if (event.httpMethod === 'GET')
        return {
            statusCode: 200,
            body: JSON.stringify({ length: puzzleSolution.solution.length }),
        }

    if (event.httpMethod === 'POST') {
        const body = JSON.parse(event.body)

        const isValid = await isWordValid(body.attempt)
        const response: PuzzleAttemptResponse = {
            feedback: isValid
                ? analyzeAttempt(body.attempt, puzzleSolution.solution)
                : [],
            attempt: body.attempt,
            accepted: isValid,
        }

        return { statusCode: 200, body: JSON.stringify(response) }
    }
}

const handler: Handler = async (event, context) => {
    const parsedPath = parsePath(event.path)

    if (!parsedPath) return { statusCode: 404 }

    if (parsedPath.label === 'puzzle-list') return handleListRequest(event)
    else if (parsedPath.label === 'puzzle-detail')
        return handleDetailRequest(event, context, parsedPath)
}

export { handler }
