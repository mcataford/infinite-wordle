import { promises as fs } from 'fs'

import * as sqlite3 from 'sqlite3'

async function getDictionarySource(
    url: string,
    databasePath: string,
): Promise<void> {
    const database = new sqlite3.Database(databasePath)
    const queries: string[] = []

    queries.push(
        'CREATE TABLE puzzles (id INTEGER PRIMARY KEY AUTOINCREMENT, solution TEXT NOT NULL);',
    )

    const src = await fs.readFile(url, 'utf-8')

    const lines = src.split('\n').map((word) => word.toLowerCase())

    console.group('Building database')
    const dbStart = Date.now()
    const queryParts: string[] = []
    for (const line of lines) {
        // Reject anything non-alpha
        if (!line.match(/^[a-z]{3,}$/)) continue

        queryParts.push(`(NULL, "${line}")`)
    }
    console.info(`Selected ${queryParts.length} words from file`)

    queries.push(`INSERT INTO puzzles VALUES ${queryParts.join(',')};`)

    database.serialize(() => {
        for (const query of queries) database.run(query)
    })
    const dbEnd = Date.now() - dbStart
    console.info(`Inserted ${queries.length} records (${dbEnd} ms)`)
    console.groupEnd()
}
const WORD_LIST = './dictionary_common.txt'
const DATABASE_PATH = './puzzles.sqlite'

getDictionarySource(WORD_LIST, DATABASE_PATH).catch((e) => {
    throw e
})
