export enum ELexerTokens {
  HASH,             // #
  AT,               // @
  LINE,             // -
  OPERATOR,         // =
  DOTS,             // :
  COMMA,            // ,

  KW_BRANCH,        // BRANCH
  KW_CHUNK,         // CHUNK
  KW_FILE,          // FILE
  KW_META,          // META
  KW_LIB,           // LIB
  KW_TAG,           // TAG
  KW_FR,            // FR
  KW_DIR,           // DIR
  KW_REF,           // REF
  KW_HIST,          // HIST

  ATT_BASE,         // base
  ATT_HEAD,         // head
  ATT_PARENT,       // parent
  ATT_NAME,         // name
  ATT_SIZE,         // size
  ATT_TAGS,         // tags
  ATT_LIBS,         // libs
  ATT_MODIFIED,     // modified         // ACTION
  ATT_CREATED,      // created          // ACTION
  ATT_UPDATE,       // update           // ACTION
  ATT_DELETED,      // deleted          // ACTION
  ATT_RESTORED,     // restored         // ACTION
  ATT_MIMETYPE,     // mimetype
  ATT_TO,           // to
  ATT_TYPE,         // type
  ATT_CONTEXT,      // context
  ATT_USER,         // user
  ATT_ACTION,       // action
  ATT_HASH,         // hash
  ATT_COLOR,        // hexColor

  ID,               // f1a7e, 92e1f
  ROOT,             // root
  STRING,           // text, file name, dir name
  NUMBER,           // 20320
  RANGE,            // 0-999
  TIMESTAMP,        // 2025-07-01T10:21 => 20250701T1021
  MIME_TYPE,        // image/png
  LIST,             // branding,logo

  NEWLINE,          // '\n'
  WHITESPACE,       // ' '
}
