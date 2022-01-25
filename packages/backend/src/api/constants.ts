export const DEFAULT_PUZZLE_LENGTH = 5

export const pathsMap = {
    '^puzzle/(?<puzzleId>[0-9]+)/?$': 'puzzle-detail',
    '^$': 'puzzle-list',
}
