export { }

declare global {
  export interface HavenFSNode {
    id: string;
    type: 'file' | 'directory';
    name: string;
    parent: string;
    size?: number;
    tags?: string[];
    libs?: string[];
    metadata?: Record<string, string>;
    references?: HavenReference[];
    history?: HavenHistoryTree[];
  }

  export interface HavenLibrary {
    id?: string;          // Lib id, e.g., "a300"
    name: string;        // Lib name, e.g., "info"
    tagsId: string[];       // Tag id, e.g., "t4000"
  }

  export interface HavenTagmap {
    id?: string;          // Lib id, e.g., "b400"
    tag: HavenTag;       // HavenTag
    fileRefs: string[];     // FILE id, e.g., "f3005"
  }

  export interface HavenTag {
    name: string;         // Tag name, e.g., "references"
    color: string;        // Hex color code, e.g., "#3498DB"
  }

  export interface HavenReference {
    from: string;           // ID origen
    to: string;             // ID destination
    type: string;           // Example: 'used-by', 'linked-to'
    context?: string;
  }

  export interface HavenHistoryTree {
    id: string;             // ID of the affected node
    timestamp: string;      // ISO 8601
    user: string;           // Author of the change
    action: string;         // Action (e.g. created, edited)
    hash: string;           // Hash of the snapshot or commit
  }

}
