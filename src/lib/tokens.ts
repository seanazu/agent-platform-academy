export type Token = { text: string; style?: Record<string, string> };
export type TokenLine = Token[];

export const plainLines = (code: string): TokenLine[] => code.split('\n').map((text) => [{ text }]);
