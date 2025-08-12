import { ELexerTokens, ErrorCode } from "../common";
import { BaseParser } from "./baseParser";
import { HavenException } from "../errors";

export class LibrarieParser extends BaseParser {
  libraries: Map<HavenLibrarie, string[]>;
  nodes: HavenFSNode[];

  constructor(libraries: Map<HavenLibrarie, string[]>, nodes: HavenFSNode[], entries: ILexerToken[][]) {
    super(entries);
    this.nodes = nodes;
    this.libraries = libraries;
    this.parse();
  }

  parse(): void {
    for (const line of this.entries) {
      const first = line[0];
      const position = this.getPosition(first);

      const idToken = this.getToken(line, ELexerTokens.ID);
      const idTokenIndex = this.getTokenIndex(line, ELexerTokens.ID);
      const opIndex = this.getTokenIndex(line, ELexerTokens.OPERATOR);

      const libNameToken = line[opIndex - 1];
      const tagsId = line.slice(opIndex + 1).filter(token => token.type !== ELexerTokens.COMMA);

      if (!idToken || !libNameToken) {
        new HavenException('Missing mandatory fields in LIB', position, ErrorCode.MISSING_TOKEN);
        continue;
      }

      if (!tagsId.length) {
        new HavenException('Missing tags in LIB', position, ErrorCode.MISSING_TOKEN);
        continue;
      }

      const isInvalidToken = line[idTokenIndex - 1].type;
      if (isInvalidToken == ELexerTokens.OPERATOR) {
        new HavenException('Missing mandatory fields in LIB', position, ErrorCode.MISSING_TOKEN);
        continue;
      }

      const libId = idToken.value;
      const libName = libNameToken.value;

      const lib: HavenLibrarie = {
        id: libId,
        name: libName,
      };

      const tagIds = tagsId.map(tag => tag.value);

      this.libraries.set(lib, tagIds)
    }
  }

  private getToken(line: ILexerToken[], token: ELexerTokens): ILexerToken | undefined {
    return line.find(t => t.type === token);
  }

  private getTokenIndex(line: ILexerToken[], token: ELexerTokens): number {
    return line.findIndex(t => t.type === token);
  }

  private getPosition(first: ILexerToken | undefined): { line: number; column: number } {
    return {
      line: first?.line ?? 0,
      column: first?.start ?? 0,
    };
  }
}
