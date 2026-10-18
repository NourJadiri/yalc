## Pattern
Trie

## Key idea
Each node is the prefix spelled by the path to it, so words that start alike share nodes; an `is_word` flag tells a word from a mere prefix.

## Steps
1. Give each node a `children` dict (letter to child) and an `is_word` flag; the trie keeps one empty root.
2. `insert`: follow the word's letters from the root, creating each missing child, then set `is_word` on the last node.
3. `search`: find the node for the word, and also require its `is_word` flag.
4. `startsWith`: find the node for the prefix; reaching it is enough.
5. In `_find`, follow the letters with `children.get` and never create nodes, so a failed lookup leaves nothing behind.

## Cost
`O(L)` time per call for a string of length `L` · `O(total letters inserted)` space

## Approach

A trie stores strings letter by letter along paths from the root: the node you reach by spelling `s` *is* the prefix `s`. Words that share a beginning share those nodes, so `car`, `cart` and `carpet` all hang off the same `c → a → r` path.

Each node needs two things: `children`, a dictionary from letter to child node, and `is_word`, which says whether an inserted word ends exactly at this node. The flag matters because the path alone can't tell a word from a prefix: after inserting `carpet`, the node for `car` exists, but `car` was never inserted.

- `insert(word)`: start at the root, follow each letter, creating the child when it's missing, then set `is_word` on the last node.
- `search(word)` and `startsWith(prefix)`: follow the letters with `children.get`; if a letter has no child, the string isn't in the trie. At the end, `search` also needs `is_word` to be set; `startsWith` only needs the walk to have finished.

Both lookups use one shared helper, `_find`, which never changes anything. That's what makes it correct. Two facts stay true all the time: the trie has a node for exactly the prefixes of the inserted words, and `is_word` is set on exactly the inserted words. `insert` keeps both facts true, and lookups change nothing, so they can't break them. Given those two facts, `startsWith(p)` is the same question as "does the node for `p` exist?", and `search(w)` is the same as "does the node for `w` exist with its flag set?".

## Complexity

Every call is `O(L)` time for a string of length `L`: one dictionary step per letter, however many words are stored. Space is `O(total letters inserted)` in the worst case (one node per letter when nothing is shared). Shared prefixes bring it down.

## Pitfalls

- Treating "the path exists" as "the word exists". Without `is_word`, `search("car")` answers `True` after `insert("carpet")`.
- Lookups that create nodes. A `defaultdict` trie stepped with `node[ch]`, or `setdefault` inside `search`, leaves the path of every failed lookup behind, so after `search("dog")` returns `False`, `startsWith("do")` wrongly returns `True`. Use `.get` (or `in`) on the read path.
- Forgetting that a word is its own prefix: `startsWith("moon")` must be `True` once `moon` is inserted.
