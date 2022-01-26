import {
    GameState,
    PuzzleAttemptFragmentFeedback,
    PuzzleAttemptResponse,
} from '@shared/types'

async function validateAttempt(
    attempt: string,
    puzzleId: number,
): Promise<PuzzleAttemptResponse> {
    const response = await fetch(
        `/.netlify/functions/api/puzzle/${puzzleId}/`,
        { method: 'POST', body: JSON.stringify({ attempt }) },
    )
    const body = await response.json()

    return body as PuzzleAttemptResponse
}

/*
 * Draws the game grid as the root element's sole child.
 */
function draw(state: GameState) {
    const rootElement = document.getElementById('app')

    const letters = [...state.pastAttempts, state.currentWord]

    const cellTable = document.createElement('div')
    cellTable.id = 'game-grid'
    for (let height = 0; height < state.puzzleSize; height++) {
        const row = document.createElement('div')
        row.className = 'row'
        const currentWord = letters.length > 0 ? letters.shift() : []

        for (let width = 0; width < state.puzzleSize; width++) {
            const cell = document.createElement('div')
            cell.className = 'cell'

            if (width < currentWord.length) {
                const cellData = currentWord[width]
                cell.appendChild(document.createTextNode(cellData.letter))

                cell.dataset.status = (
                    cellData as PuzzleAttemptFragmentFeedback
                ).feedback
            }
            row.appendChild(cell)
        }
        cellTable.appendChild(row)
    }

    const existingGrid = rootElement.children?.[0]

    if (existingGrid) rootElement.replaceChild(cellTable, existingGrid)
    else rootElement.appendChild(cellTable)
}

async function initialize() {
    const response = await fetch('/.netlify/functions/api/')
    const body = await response.json()

    const gridWidth = body.length

    const state: GameState = {
        currentWord: [],
        pastAttempts: [],
        puzzleSize: gridWidth,
        puzzleId: body.id,
    }

    draw(state)

    window.addEventListener('keydown', async (event) => {
        const { ctrlKey, shiftKey, key } = event
        let handled = false
        if (
            key.match(/^[a-zA-Z]$/) &&
            !shiftKey &&
            !ctrlKey &&
            state.currentWord.length < state.puzzleSize
        ) {
            state.currentWord.push({ letter: key.toLowerCase() })
            handled = true
        } else if (
            key === 'Enter' &&
            state.currentWord.length === state.puzzleSize
        ) {
            const currentWord = state.currentWord
                .map((fragment) => fragment.letter)
                .join('')
            const result = await validateAttempt(currentWord, state.puzzleId)

            if (result.accepted) {
                state.pastAttempts.push(result.feedback)
            }

            state.currentWord = []
            handled = true
        } else if (key === 'Backspace' && state.currentWord.length > 0) {
            state.currentWord = state.currentWord.slice(0, -1)
            handled = true
        }

        if (handled) {
            draw(state)
            event.preventDefault()
        }
    })
}

initialize()
