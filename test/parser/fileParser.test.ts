import { describe, test, expect, beforeEach, vi } from 'bun:test';
import { FileParser } from '../../src/parser/fileParser';
import { BrambleLexer } from '../../src/lexer/brambleLexer';
import { errorManager } from '../../src/errors/errorManager';
import type { HavenFSNode } from '~/model/types';

describe('FileParser integrated with Lexer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    errorManager.clear();
  });

  test('Parses a complete FILE node using the real lexer without libs', () => {
    const lexer = new BrambleLexer({document: './test/examples/test.example.havenfs'});
    lexer.run();

    const fileChunk = lexer.getChunkMap().find(chunk => chunk.type === 'files');
    if (fileChunk === undefined) {
      throw new Error("Files chunk not found");
    }

    const entries = fileChunk.entries;

    const nodes: HavenFSNode[] = [];
    new FileParser(nodes, entries);

    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toEqual({
      id: 'f1a7e',
      type: 'file',
      parent: '92e1f',
      name: 'logo.png',
      size: 20320,
      tags: ['b400', 'b401'],
      libs: [],
      metadata: {
        modified: "1723472381",
        created: "1723472370",
        mimetype: 'image/png'
      }
    });
  });

  test('Parses a complete FILE node using the real lexer with libs', () => {
    const lexer = new BrambleLexer({document: './test/examples/test.example.havenfs'});
    lexer.run();

    let count = 0;
    const fileChunk = lexer.getChunkMap().find(chunk => {
      if (chunk.type === 'files') {
        count++;
        return count === 2;
      }
    });

    if (!fileChunk) {
      throw new Error("Second files chunk not found");
    }

    const entries = fileChunk.entries;
    const nodes: HavenFSNode[] = [];
    new FileParser(nodes, entries);

    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toEqual({
      id: 'f1b88',
      type: 'file',
      parent: '92e1f',
      name: 'screenshot1.png',
      size: 50320,
      tags: ["b402"],
      libs: ['a300'],
      metadata: {
        modified: "1723472381",
        created: "1723472370",
        mimetype: 'image/png'
      }
    });
  });

  test('Supports multiple FILE nodes within a single chunk', () => {
    const lexer = new BrambleLexer({document: './test/examples/test.multiple.example.havenfs'});
    lexer.run();

    const fileChunk = lexer.getChunkMap().find(chunk => chunk.type === 'files');
    if (fileChunk === undefined) {
      throw new Error("Files chunk not found");
    }


    const entries = fileChunk.entries;

    const nodes: HavenFSNode[] = [];
    new FileParser(nodes, entries);

    expect(nodes).toHaveLength(3);

    expect(nodes[0].id).toBe('f1a7e');
    expect(nodes[1].id).toBe('f1b88');
    expect(nodes[1].name).toBe('screenshot1.png');
  });

  test('Does not create nodes if the files chunk is empty', () => {
    const lexer = new BrambleLexer({document: './test/examples/test.empty.example.havenfs'});
    lexer.run();

    const fileChunk = lexer.getChunkMap().find(chunk => chunk.type === 'files');
    if (fileChunk === undefined) {
      throw new Error("Files chunk not found");
    }


    const entries = fileChunk.entries;

    const nodes: HavenFSNode[] = [];
    new FileParser(nodes, entries);

    expect(nodes).toHaveLength(0);
  });

});
