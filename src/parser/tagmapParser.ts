import { ELexerTokens, ErrorCode } from "../common";
import { BaseParser } from "./baseParser";
import { HavenException } from "../errors";

export class TagmapParser extends BaseParser {
  tagmap: HavenTagmap[];
  nodes: HavenFSNode[];

  constructor(tagmap: HavenTagmap[], nodes: HavenFSNode[], entries: ILexerToken[][]) {
    super(entries);
    this.nodes = nodes;
    this.tagmap = tagmap;
    this.parse();
  }

  parse(): void {
    for (const line of this.entries) {
      const first = line[0];
      const position = this.getPosition(first);

      const idToken = this.getToken(line, ELexerTokens.ID);
      const idTokenIndex = this.getTokenIndex(line, ELexerTokens.ID);
      const tagToken = this.getToken(line, ELexerTokens.STRING);
      const colorToken = this.getToken(line, ELexerTokens.ATT_COLOR);
      const refTokenIndex = this.getTokenIndex(line, ELexerTokens.KW_FR);

      if (!idToken || !tagToken || !refTokenIndex) {
        new HavenException('Missing mandatory fields in TAG', position, ErrorCode.MISSING_TOKEN);
        continue;
      }

      const isInvalidToken = line[idTokenIndex - 1].type;
      if (isInvalidToken == ELexerTokens.OPERATOR) {
        new HavenException('Missing mandatory fields in TAG', position, ErrorCode.MISSING_TOKEN);
        continue;
      }

      const idValue = idToken.value;
      const tagName = tagToken.value;
      const hexColor = colorToken?.value ?? "#ffffff";
      const fileRef = line[refTokenIndex + 2];

      if (!fileRef) {
        new HavenException('Missing file reference in TAG', position, ErrorCode.MISSING_TOKEN);
        continue;
      }

      const fileRefValue = fileRef.value;

      const tag = {
        id: idValue,
        tag: {
          name: tagName,
          color: hexColor,
        },
        fileRef: fileRefValue
      }

      this.tagmap.push(tag)
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
