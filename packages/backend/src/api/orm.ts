import * as sqlite from 'sqlite3'

import type { PuzzleRecord } from './types'

const database = new sqlite.Database('./puzzles.sqlite')

export async function getRandomPuzzle(length): Promise<PuzzleRecord> {
    return new Promise((resolve, reject) => {
        database.all(
            `select * from puzzles WHERE length(solution) = ${length} ORDER BY RANDOM() limit 1;`,
            (err, rows) => {
                if (!rows || rows.length !== 1) reject()
                else resolve(rows[0])
            },
        )
    })
}

export async function getPuzzleById(
    puzzleId: number,
): Promise<PuzzleRecord | null> {
    return new Promise((resolve) => {
        database.all(
            `select * from puzzles WHERE id = ${puzzleId};`,
            (err, rows) => {
                if (!rows || rows.length !== 1) resolve(null)
                else resolve(rows[0])
            },
        )
    })
}

export async function getPuzzleBySolution(
    word: string,
): Promise<PuzzleRecord | null> {
    return new Promise((resolve) => {
        database.all(
            `select * from puzzles WHERE solution = "${word}";`,
            (err, rows) => {
                if (!rows || rows.length !== 1) resolve(null)
                else resolve(rows[0])
            },
        )
    })
}
