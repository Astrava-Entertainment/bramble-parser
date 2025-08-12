import { describe, test, expect, beforeEach, vi } from 'bun:test';
import { TagmapParser } from '../../src/parser/tagmapParser';
import { BrambleLexer } from '../../src/lexer/brambleLexer';
import { errorManager } from '../../src/errors/errorManager';
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
    const tagmap: Map<string, HavenTagmap> = new Map<string, HavenTagmap>()

    new TagmapParser(tagmap, nodes, entries);

    expect(tagmap).toHaveLength(3);
    expect(tagmap).toEqual(new Map([
      ["b400", {
        fileRefs: ["f1a7e"],
        tag: { name: "branding", color: "#8E44AD" }
      }],
      ["b401", {
        fileRefs: ["f1a7e"],
        tag: { name: "logo", color: "#ffffff" }
      }],
      ["b402", {
        fileRefs: [" ", "b402", " ", "favourite"],
        tag: { name: "favourite", color: "#ffffff" }
      }],
    ]));


  });

  test('Reports an error on reference with missing fields', () => {
    const lexer = new BrambleLexer({document: './test/examples/test.missing-fields-tagmap.havenfs'});
    lexer.run();

    const tagmapChunk = lexer.getChunkMap().find(chunk => chunk.type === 'tagmap');
    if (tagmapChunk === undefined) {
      throw new Error("Tagmap chunk not found");
    }

    const nodes: HavenFSNode[] = [];
    const tagmap: Map<string, HavenTagmap> = new Map<string, HavenTagmap>()
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
    const tagmap: Map<string, HavenTagmap> = new Map<string, HavenTagmap>()
    new TagmapParser(tagmap, nodes, tagmapChunk.entries);

    const errors = errorManager.getAll();
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toMatch(/Missing file reference in TAG/);
  });
});
