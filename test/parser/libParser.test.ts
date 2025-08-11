import { describe, test, expect, beforeEach, vi } from 'bun:test';
import { LibrarieParser } from '~/parser/libParser';
import { BrambleLexer } from '~/lexer/brambleLexer';
import { errorManager } from '~/errors/errorManager';
import type { HavenFSNode, HavenLibrarie } from '~/model/types';

describe('LibrarieParser integrated with Lexer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    errorManager.clear();
  });

  test('Parses a complete LIB node using the real lexer', () => {
    const lexer = new BrambleLexer({document: './test/examples/test.example.havenfs'});
    lexer.run();

    const libChunk = lexer.getChunkMap().find(chunk => chunk.type === 'libraries');
    if (libChunk === undefined) {
      throw new Error("Libraries chunk not found");
    }

    const entries = libChunk.entries;

    const nodes: HavenFSNode[] = [];
    const libraries: Map<string, HavenLibrarie[]> = new Map<string, HavenLibrarie[]>();

    new LibrarieParser(libraries, nodes, entries);

    expect(libraries).toHaveLength(1);
    expect(Object.fromEntries(libraries)).toEqual({
      "a300": [
        { id: "a300", name: "info", tagId: "b400" },
        { id: "a300", name: "info", tagId: "b401" },
      ],
    });

  });

  test('Reports an error on reference with missing fields', () => {
    const lexer = new BrambleLexer({document: './test/examples/test.missing-fields-libs.havenfs'});
    lexer.run();

    const libChunk = lexer.getChunkMap().find(chunk => chunk.type === 'libraries');
    if (libChunk === undefined) {
      throw new Error("Libraries chunk not found");
    }

    const nodes: HavenFSNode[] = [];
    const libraries: Map<string, HavenLibrarie[]> = new Map<string, HavenLibrarie[]>();
    new LibrarieParser(libraries, nodes, libChunk.entries);
    console.log(libraries);

    const errors = errorManager.getAll();
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toMatch(/Missing mandatory fields in LIB/);
  });

  test('Reports an error on reference with missing tags id', () => {
    const lexer = new BrambleLexer({document: './test/examples/test.invalid-libs.havenfs'});
    lexer.run();

    const libChunk = lexer.getChunkMap().find(chunk => chunk.type === 'libraries');
    if (libChunk === undefined) {
      throw new Error("Libraries chunk not found");
    }

    const nodes: HavenFSNode[] = [];
    const libraries: Map<string, HavenLibrarie[]> = new Map<string, HavenLibrarie[]>();
    new LibrarieParser(libraries, nodes, libChunk.entries);

    const errors = errorManager.getAll();
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toMatch(/Missing tags in LIB/);
  });
});
