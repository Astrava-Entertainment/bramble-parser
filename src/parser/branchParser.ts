import { ELexerTokens, ErrorCode } from "~/common";
import { HavenException } from "~/errors";

export class BranchParser {
  private tokensByLine: ILexerToken[][];
  private branch: HavenBranch | null;

  constructor(tokensByLine: ILexerToken[][]) {
    this.tokensByLine = tokensByLine;
    this.branch = null;
    this.parse();
  }

  private parse() {
    this.tokensByLine.forEach((tokens, row) => {
      if (tokens.length === 0) return;

      const firstToken = tokens[0];
      const secondToken = tokens[1];

      if (this.isBranchHeader(firstToken, secondToken)) {
        this.generateBranch(tokens, row)
      }
    })
  }

  private generateBranch(line: ILexerToken[], row: number) {
    const baseIndex = line.findIndex((t) => t.type === ELexerTokens.ATT_BASE);
    const parentIndex = line.findIndex((t) => t.type === ELexerTokens.ATT_PARENT);
    const headIndex = line.findIndex((t) => t.type === ELexerTokens.ATT_HEAD);

    if (baseIndex === -1 || parentIndex === -1 || headIndex === -1) {
      const position = { line: row, column: 0 };
      new HavenException('Missing branch fields', position, ErrorCode.MISSING_BRANCH_FIELDS);
      return;
    }

    const baseValue = line[baseIndex + 2];
    const parentValue = line[parentIndex + 2];
    const headValue = line[headIndex + 2];

    if (!baseValue) {
      const position = { line: row, column: baseIndex + 2 };
      new HavenException('Missing branch fields', position, ErrorCode.MISSING_BRANCH_FIELDS);
      return;
    }

    if (!parentValue) {
      const position = { line: row, column: parentIndex + 2 };
      new HavenException('Missing branch fields', position, ErrorCode.MISSING_BRANCH_FIELDS);
      return;
    }

    if (!headValue) {
      const position = { line: row, column: headIndex + 2 };
      new HavenException('Missing branch fields', position, ErrorCode.MISSING_BRANCH_FIELDS);
      return;
    }

    this.branch = {base: baseValue, parent: parentValue, head: headValue}
  }

  private isBranchHeader(token: ILexerToken, nextToken: ILexerToken): boolean {
    return (token.type === ELexerTokens.HASH && nextToken.type === ELexerTokens.KW_BRANCH);
  }

  getBranch(): HavenBranch | null {
    if (this.branch == null) {
      const position = { line: 0, column: 0 };
      // new HavenException('Branch does not exist', position, ErrorCode.MISSING_BRANCH);
      return null;
    }
    return this.branch;
  }
}
