import * as fs from 'fs';
import { LexerRules } from './brambleLexerRule';
import { HavenException } from 'src/errors';
import { ELexerTokens, ErrorCode } from 'src/common';
import { ChunkParser } from 'src/parser/chunkParser';
import { BranchParser } from '../parser/branchParser';


export class BrambleLexer {
  documentContent: string;
  tokens: ILexerToken[];
  tokensByLine: ILexerToken[][];
  chunks: IChunkBlock[];
  chunkMap: ChunkMap[];
  branch: HavenBranch | null;

  constructor({document = '', environment = 'node'}) {
    this.tokens = [];
    this.tokensByLine = [];
    this.chunks = [];
    this.chunkMap = [];
    this.branch = null;
    if (environment === 'node') {
      this.documentContent = fs.readFileSync(document, 'utf8');
    } else {
      if (document === '') {
        throw new Error('No document found for bramble Lexer.');
      }
      this.documentContent = document;
    }
  }


  tokenize() {
    let currentLine = 0;
    let currentStart = 0;
    let currentEnd = 0;
    let cursor = 0;
    let remaining = this.documentContent;

    while (remaining.length > 0) {
      let matched = false;
      for (const rule of LexerRules) {
        const match = rule.pattern.exec(remaining);
        if (!match) continue;

        const value = match[0];
        const newlines = value.split('\n').length - 1;

        if (newlines) cursor = 0;
        cursor += value.length;
        currentStart = cursor - value.length;
        currentEnd = currentStart + value.length;

        this.tokens.push({
          type: rule.tokenToMatch,
          value,
          line: currentLine,
          start: currentStart,
          end: currentEnd
        });
        currentLine += newlines;
        remaining = remaining.slice(value.length);
        matched = true;
        break;
      }
      if (!matched) {
        const position = { line: currentLine, column: currentStart };
        new HavenException('Unrecognized token', position, ErrorCode.UNRECOGNIZED_TOKEN);
        remaining = remaining.slice(1);
      }
    }
  }

  tokenizeContent(content: string) {
    this.documentContent = content;
    this.tokenize();
  }

  groupTokensByLine() {
    let currentLine: ILexerToken[] = [];
    let currentLineIndex = 0;

    for (const token of this.tokens) {
      if (token.type === ELexerTokens.NEWLINE) {
        if (currentLine.length > 0) {
          for (const current of currentLine) {
            current.line = currentLineIndex;
          }
          this.tokensByLine.push(currentLine);
          currentLine = [];
        }
        currentLineIndex++;
      }
      else {
        currentLine.push(token);
      }
    }

    if (currentLine.length > 0) {
      for (const current of currentLine) {
        current.line = currentLineIndex;
      }
      this.tokensByLine.push(currentLine);
    }
  }

  groupByChunkContext() {
    const chunkParser = new ChunkParser(this.tokensByLine);
    this.chunks = chunkParser.parse();
  }

  checkHashReferencesBetweenFiles() {
    ChunkParser.validateChunks(this.chunks);
  }

  mapChunks() {
    for (const chunk of this.chunks) {
      const { type, range, offset } = ChunkParser.parseChunkHeaderTokens(chunk.headerTokens);

      this.chunkMap.push({
        type,
        range,
        offset,
        entries: chunk.lines
      });
    }
  }

  debugReadTokensByLine() {
    this.tokensByLine.forEach((line, index) => {
      console.log('='.repeat(40));
      console.log(`Line ${index + 1}:`);
      for (const token of line) {
        const tokenName = ELexerTokens[token.type];
        console.log(`  [${tokenName}] ${token.value}`);
      }
      if (line.length === 0) {
        console.log('  (empty line)');
      }
    });
    console.log('='.repeat(40));
  }

  debugChunks() {
    console.log('='.repeat(50));
    console.log(`Found ${this.chunks.length} chunks`);
    console.log('='.repeat(50));
    for (const chunk of this.chunks) {
      console.log(`Chunk type: ${chunk.type}`);
      console.log('Header:', chunk.headerTokens.map((t) => `[${ELexerTokens[t.type]}]`).join(' '));
      console.log(`Contains ${chunk.lines.length} lines`);
      for (const line of chunk.lines) {
        console.log(
          '  - ' + line.map((t) => `[${ELexerTokens[t.type]}]`).join(' ')
        );
      }
      console.log('-'.repeat(50));
    }
  }

  debugBranch() {
    if (!this.branch) {
      // console.log("No branch found.");
      return;
    }

    console.log("====== BRANCH INFO ======");
    console.log(`Base  : ${this.branch.base.value} (line: ${this.branch.base.line}, col: ${this.branch.base.start})`);
    console.log(`Parent: ${this.branch.parent.value} (line: ${this.branch.parent.line}, col: ${this.branch.parent.start})`);
    console.log(`Head  : ${this.branch.head.value} (line: ${this.branch.head.line}, col: ${this.branch.head.start})`);
    console.log("==========================");
  }

  getChunks() {
    if (this.chunks == null) {
      const position = { line: 0, column: 0 };
      new HavenException('Chunks are not initialized', position, ErrorCode.EMPTY_CHUNKS);
      return [];
    }
    return this.chunks;
  }

  getChunkMap() {
    if (this.chunkMap == null) {
      const position = { line: 0, column: 0 };
      new HavenException('Chunk maps are empty', position, ErrorCode.EMPTY_CHUNKS);
      return [];
    }
    return this.chunkMap;
  }

  generateBranch() {
    const branchParser = new BranchParser(this.tokensByLine);
    this.branch = branchParser.getBranch();
  }

  getBranch(): HavenBranch | null {
    if (this.branch == null) {
      const position = { line: 0, column: 0 };
      new HavenException('Branch does not exist', position, ErrorCode.MISSING_BRANCH);
      return null;
    }
    return this.branch;
  }

  run() {
    this.tokenize();
    this.groupTokensByLine();
    this.groupByChunkContext();
    this.checkHashReferencesBetweenFiles();
    this.mapChunks();

    this.generateBranch();
  }
}
