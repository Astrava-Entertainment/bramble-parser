export { }

declare global {
  interface ILexerToken {
    type: import('../src/common').ELexerTokens;
    value: string;
    line: number;
    start: number; //* Allows for later integration with an editor or higlighting invalid references with an underline
    end: number; //* Allows for later integration with an editor or higlighting invalid references with an underline
  }

  export interface HavenBranch {
    base: ILexerToken;          // Branch name, e.g., main
    parent: ILexerToken;        // Parent hash, e.g., b0011
    head: ILexerToken;          // Head hash, e.g., b0012
  }


  interface IChunkBlock {
    type: string;
    headerTokens: ILexerToken[];    // the tokens from the chunk header line
    lines: ILexerToken[][];         // tokenized lines belonging to this chunk
  }

  interface ParsedHeaderInfo {
    type: string;
    range?: [number, number];
    offset?: number;
  }

}
