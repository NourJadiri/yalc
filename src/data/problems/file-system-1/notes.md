## Pattern
Trie of path components

## Key idea
A path is a list of names, so store the tree as a trie: each folder maps a name to its child, and every call walks down from the root.

## Steps
1. Keep a trie: the root is a folder node, and each folder holds a dictionary from child name to node.
2. In `mkdir`, walk the names from the root, creating each missing folder; meeting a file returns `false`.
3. In `write`, walk to the parent without creating anything; refuse a missing or file parent, or a folder at `path`.
4. For `read` and `ls`, walk to the node: a file gives its content or its name, a folder its sorted child names.

## Cost
`O(L)` time per call, `L` the path length, plus `O(k log k)` in `ls` · `O(stored text)` space

## Approach

Pattern: a **trie**, keyed by names instead of letters.

A path like `/docs/drafts/a.md` is the list of names `docs`, `drafts`, `a.md`. Paths that start the same way share the folders they name, which is exactly the shape of a trie. Each node is a folder or a file:

- A folder has `children`: a dictionary from a name to the node with that name.
- A file has `content`.

The root is a folder that always exists. To find a path, split it on `/` and do one dictionary lookup per name. If a name is missing, or the walk reaches a file while names remain, the path doesn't exist.

Each method is that walk plus a few rules:

- `mkdir` walks the names and creates every missing folder as it goes. If it meets a file, it returns `false`. That can't leave half-made folders behind: every folder above a file already exists, so the walk hasn't created anything by the time it reaches one.
- `write` walks to the parent and creates nothing. The parent must be a folder. Then the last name is either missing (create the file), a file (replace its content) or a folder (refuse).
- `read` and `ls` walk to the node and check what kind it is. `ls` sorts the child names on every call, which costs only `O(k log k)` for `k` names.

Why not a flat dictionary from full path to content? `mkdir`, `write` and `read` work fine with one. But `ls` then has to look at every stored path to find the ones directly inside a folder. Later steps get worse: a folder's total size, or moving a folder, would touch every path below it. The trie keeps a folder's contents in one place, and every later step builds on that.

## Complexity

Every call walks the path once: `O(L)` for a path of `L` characters, counting the split and the hashing of each name. `ls` on a folder with `k` children adds `O(k log k)` for the sort. Space is one node per folder and file, plus the stored names and contents.

## Pitfalls

- `mkdir` that walks through a file as if it were a folder, or replaces it. `mkdir("/notes")` on a file returns `false`, and so does `mkdir("/notes/old")`.
- `write` that creates missing folders. Only `mkdir` does that; `write` returns `false` instead.
- Treating an empty file as missing. `read` returns `""` for it, and a check like `if node.content:` gets that wrong.
- `ls` on a file returns its name only: not its full path, and not `[]`.
