## Pattern
Augmented trie with subtree totals

## Key idea
A file's size counts toward exactly the folders on its path, so a write only needs to change those totals, by the difference between the new and old length.

## Steps
1. Give every node a `size`: a file's is its length, a folder's the total of all files beneath it; a new folder starts at 0.
2. In `write`, keep every node from the root down to the parent folder while walking to it.
3. Add `len(content)` minus the file's old size (0 if new) to each of those folders, then store the content and its size.
4. In `size`, walk to the node and return its stored `size`, or -1 if the path doesn't exist.

## Cost
`O(L)` time per `write` and `size`, `L` the path length · `O(1)` extra space per node

## Approach

Pattern: an **augmented tree**. Each node stores a summary of its subtree, here the total size, and every update repairs the summaries it affects.

The trie from step 1 has everything except the numbers. Give every node a `size`, with one invariant: a file's size is its length, and a folder's size is the sum of its children's sizes, which unrolls to the total of every file beneath it.

Which totals does a `write` affect? Exactly those of the folders that contain the file: its parent, the parent's parent, and so on up to the root. No other folder's total includes it. And all of them change by the same amount, `delta = len(content) - old size`, where the old size is `0` for a new file. Overwriting `"hello"` with `"hi"` is a `delta` of `-3` for every folder above.

`write` already walks from the root to the parent to find where the file goes. Keep the nodes it passes in a list, the *chain*. Once every check has passed, add `delta` to each node of the chain and store the new content. A `write` that returns `false` must leave before touching any size.

`mkdir` changes nothing: a new folder is empty, so its size is `0` and no total moves. `size(path)` is a walk to the node and a read of its field, with no special case for the root or for files.

Parent pointers work too: walk up from the file to the root adding `delta`. The chain needs no extra field, and nothing to keep in sync when the next step starts moving folders around.

## Complexity

`write`: one walk down to the parent and one pass over the same nodes, `O(L)` for a path of `L` characters. `size`: one walk, `O(L)`. The other calls are unchanged. Space: one integer per node.

Walking the subtree on each `size` call costs `O(n)` for `n` entries below the path. The large test calls `size("/")` right after each of 5,000 writes, in a tree of about 9,900 folders and 2,500 files: tens of millions of node visits that way.

## Pitfalls

- On an overwrite, adding the new length without taking out the old one. Folder totals then only ever grow.
- Changing totals before every check has passed. A `write` that returns `false` changes nothing, sizes included.
- Updating only the parent folder instead of every folder up to the root.
- Mixing up an empty file or folder (size `0`) with a path that doesn't exist (size `-1`).
