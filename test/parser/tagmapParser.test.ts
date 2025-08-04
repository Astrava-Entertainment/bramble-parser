import { describe, test, expect, beforeEach, vi } from 'bun:test';
import { TagmapParser } from '~/parser/tagmapParser';
import { BrambleLexer } from '~/lexer/brambleLexer';
import { errorManager } from '~/errors/errorManager';
import type { HavenFSNode, HavenTagmap } from '~/model/types';

describe('TagmapParser integrated with Lexer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    errorManager.clear();
  });

  test('Parses a complete TAG node using the real lexer', () => {
    const lexer = new BrambleLexer({document: './test/examples/test.example.havenfs'});
    lexer.run();

    const tagmapChunk = lexer.getChunkMap().find(chunk => chunk.type === 'tagmap');
    if (tagmapChunk === undefined) {
      throw new Error("Tagmap chunk not found");
    }

    const entries = tagmapChunk.entries;

    const nodes: HavenFSNode[] = [];
    const tagmap: HavenTagmap[] = [];

    new TagmapParser(tagmap, nodes, entries);

    expect(tagmap).toHaveLength(3);
    expect(tagmap).toEqual([
      {
        id: "b400",
        tag: {
          name: "branding",
          color: "#8E44AD",
        },
        fileRef: "f1a7e"
      },
      {
        id: "b401",
        tag: {
          name: "logo",
          color: "#ffffff",
        },
        fileRef: "f1a7e"
      },
      {
        id: "b402",
        tag: {
          name: "favourite",
          color: "#ffffff",
        },
        fileRef: "f1b88"
      },
    ]);

  });

  test('Reports an error on reference with missing fields', () => {
    const lexer = new BrambleLexer({document: './test/examples/test.missing-fields-tagmap.havenfs'});
    lexer.run();

    const tagmapChunk = lexer.getChunkMap().find(chunk => chunk.type === 'tagmap');
    if (tagmapChunk === undefined) {
      throw new Error("Tagmap chunk not found");
    }

    const nodes: HavenFSNode[] = [];
    const tagmap: HavenTagmap[] = [];
    new TagmapParser(tagmap, nodes, tagmapChunk.entries);

    const errors = errorManager.getAll();
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toMatch(/Missing mandatory fields in TAG/);
  });

  test('Reports an error on reference with missing tags id', () => {
    const lexer = new BrambleLexer({document: './test/examples/test.invalid-tagmap.havenfs'});
    lexer.run();

    const tagmapChunk = lexer.getChunkMap().find(chunk => chunk.type === 'tagmap');
    if (tagmapChunk === undefined) {
      throw new Error("Tagmap chunk not found");
    }

    const nodes: HavenFSNode[] = [];
    const tagmap: HavenTagmap[] = [];
    new TagmapParser(tagmap, nodes, tagmapChunk.entries);

    const errors = errorManager.getAll();
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toMatch(/Missing file reference in TAG/);
  });
});
