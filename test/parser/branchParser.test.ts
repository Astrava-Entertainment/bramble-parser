import { describe, test, expect, vi, beforeEach } from 'bun:test';
import { BrambleLexer } from '../../src/lexer/brambleLexer';
import { BranchParser } from '../../src/parser/branchParser';
import {errorManager} from '../../src/errors/errorManager'

describe("Branch parser with Lexer", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    errorManager.clear();
  })

  test('Parses a complete BRANCH using the real lexer', () => {
    const lexer = new BrambleLexer({document: './test/examples/test.example.havenfs'});
    lexer.run();

    const branch = lexer.getBranch();
    const {base, parent, head} = branch;

    expect(branch).not.toBe(null)
    expect(base.value).toBe('main')
    expect(parent.value).toBe('b0011')
    expect(head.value).toBe('b0012')
  })

  test('Reports an error on Branch with missing fields', () => {
    const lexer = new BrambleLexer({document: './test/examples/test.missing-fields-branch.havenfs'});
    lexer.run();

    const branch = lexer.getBranch();
    expect(branch).toBe(null)
    const errors = errorManager.getAll();
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toMatch(/Missing branch fields/);
  })

});
