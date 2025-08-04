import { test, expect } from "bun:test";
import { BrambleLexer } from "~/lexer";
import { BrambleFSParser } from "~/parser/parser";
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const testFilePath = join(__dirname, 'examples', 'test.havenfs');

test("System Test - parses entire file correctly", () => {
  const input = `#CHUNK files 0-999 @0
FILE f1a7e parent=92e1f name=logo.png size=20320 tags=b400,b401
META f1a7e modified=20240812T1419 created=20240712T1419 mimetype=image/png

FILE f1b88 parent=92e1f name=screenshot1.png size=50320 tags=b402 libs=a300
META f1b88 modified=1723472381 created=1723472370 mimetype=image/png

#CHUNK libraries @3000
LIB a300 info=b400,b401

#CHUNK tagmap @4000
TAG b400 branding:#8E44AD FR=f1a7e
TAG b401 logo:#1ABC9C FR=f1a7e
TAG b402 favourite FR=f1b88

#CHUNK directories @25000
DIR 92e1f parent=root name=images

`;

  fs.writeFileSync(testFilePath, input);

  const lexer = new BrambleLexer({document: testFilePath});
  lexer.run();
  const chunkMap = lexer.getChunkMap();

  const parser = new BrambleFSParser(chunkMap);
  parser.run();

  const fsJSON = parser.getJSON();

  expect(fsJSON).toEqual([
    {
      id: "f1a7e",
      type: "file",
      parent: "92e1f",
      name: "logo.png",
      size: 20320,
      libs: [],
      tags: ["b400", "b401"],
      metadata: {
        modified: "20240812T1419",
        created: "20240712T1419",
        mimetype: "image/png",
      },
    },
    {
      id: "f1b88",
      type: "file",
      parent: "92e1f",
      name: "screenshot1.png",
      size: 50320,
      libs: ["a300"],
      tags: ["b402"],
      metadata: {
        modified: "1723472381",
        created: "1723472370",
        mimetype: "image/png",
      },
    },
    {
      id: "92e1f",
      type: "directory",
      parent: "root",
      name: "images",
    }
  ]);
});
