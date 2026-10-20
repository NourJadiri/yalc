## Pattern
Subtree re-linking

## Key idea
A folder's contents hang off its node, so moving or deleting it is one unlink and relink; only the folders above it, old and new, need their totals fixed.

## Steps
1. In `rm`, refuse `"/"` and paths that don't exist, keeping the chain of nodes from the root down to the target.
2. Unlink the node from its parent's children, then subtract its size from every folder above it.
3. In `mv`, refuse first: `src` missing or `"/"`, `dst` existing, `dst`'s parent missing or a file, or `dst` starting with `src + "/"`.
4. Unlink the node and subtract its size along the old chain; link it under the new parent and name, and add its size along the new chain.

## Cost
`O(L)` time per `rm` and `mv`, `L` the paths' length, whatever the folder holds · `O(L)` space

## Approach

Pattern: **re-linking** a subtree, the way you'd move a node between linked lists, plus the size bookkeeping from step 2.

In the trie, everything inside a folder hangs off that folder's node, and nothing inside it records where it lives. A node doesn't know its own path, or even its own name: its parent's dictionary holds the name. So a move never has to touch anything inside. Take the node out of the old parent's dictionary and put it into the new parent's under the new name. Every path below it changes at once.

The sizes need the same care as in step 2. The node's `size` is already the total of everything inside it. It used to count toward every folder on the old path, and now it counts toward every folder on the new one. So subtract it along the old chain (the root down to the old parent) and add it along the new chain (the root down to the new parent). Folders on both chains, like the root, lose it and get it back.

`rm` is the first half of `mv`: unlink, then subtract along the chain. The deleted nodes are simply dropped.

Check every refusal before changing anything, so that a refused `mv` leaves the tree exactly as it was:

- `src` must exist and must not be the root, which has no parent to be unlinked from.
- `dst` must not exist: `mv` never overwrites. This also refuses `mv(p, p)` and a `dst` of `"/"`.
- `dst`'s parent must exist and be a folder.
- `dst` must not be inside `src`. Otherwise the node would be linked under one of its own descendants, cut off from the root with everything in it. The test works on the strings: `dst.startswith(src + "/")`. The slash matters: `"/ab".startswith("/a")` is true, yet `/ab` is a sibling of `/a`, not inside it.

## Complexity

`rm`: one walk down, one unlink and one pass back over the chain, `O(L)` for a path of `L` characters. `mv`: walks to `src`, to `dst` and to `dst`'s parent, the string check, and two passes over chains: `O(L)` for the two paths together. None of it depends on how much the folder holds.

Copying the subtree on every `mv`, or walking it to recount sizes, costs `O(n)` for the `n` entries inside. The first large test moves a folder of about 10,500 entries 7,000 times: tens of millions of node visits that way.

Deleting can't be timed apart like that. Each node can be deleted only once, after the call that created it, so walking a folder to delete it costs no more in total than building it did. The second large test builds, moves and deletes big folders anyway, to check the sizes at scale; copying on `mv` still fails it.

## Pitfalls

- Checking "inside itself" with `dst.startswith(src)`. That refuses the legal rename of `/a` to `/ab`, and moving `/a` into `/ab`.
- Changing anything before every check has passed. A refused `mv` leaves links and sizes untouched.
- Doing only half of the size update: the old folders keep counting the moved folder, or the new ones never count it.
- Moving a folder into its own subfolder without the check. The folder vanishes from the tree with everything in it.
