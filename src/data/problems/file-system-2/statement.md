# File System: Sizes

An object-oriented design drill in four steps, written for this app. There is no LeetCode page for it.

## In short
A file system of folders and text files → add `size(path)`: a file's length, or a folder's total over every file beneath it.

## The task

**Step 2 of 4.** `FileSystem` keeps an in-memory tree of folders and text files under the root folder `"/"`. Any other path is `/` followed by one or more names joined with `/`, like `"/docs/plan.txt"`, and the tests only use valid paths (see Constraints). So far it has:

- `FileSystem()`: a file system holding only the empty root folder.
- `mkdir(path)`: makes the folder and every missing folder above it. Returns `true` if a folder exists at `path` afterwards (also when it already did, and for `"/"`); returns `false` and changes nothing if `path` or any name on the way to it is a file.
- `write(path, content)`: creates the file or replaces its content, and returns `true`. It never creates folders: it returns `false` and changes nothing if the parent folder is missing or is a file, if `path` is a folder, or if `path` is `"/"`.
- `read(path)`: the file's content (possibly `""`), or `null` if `path` is a folder or doesn't exist.
- `ls(path)`: a folder's child names, sorted as plain strings by character code (Python's `sorted`); `[name]` for a file; `[]` for a path that doesn't exist.

**New in this step**

- `size(path)`: the size of what `path` points at. A file's size is the length of its content. A folder's size is the total size of every file beneath it, at any depth. An empty folder has size `0`, and so does an empty file. If `path` doesn't exist, return `-1`.

Sizes are read far more often than files change. `size` must not walk the folder's contents: keep each folder's total up to date as files are written, so that a call costs about the length of its path. One large test calls `size("/")` after every one of thousands of writes in a deep tree.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation: `null` for the constructor, `true` or `false` for `mkdir` and `write`, a string or `null` for `read`, a list of names for `ls`, a number for `size`.

Every test from the earlier steps still runs.

## Examples

**Example 1**

```
ops  = ["FileSystem","mkdir","write","write","size","size","size","size"]
args = [[],["/music/live"],["/music/a.mp3","12345"],["/music/live/b.mp3","123"],["/music"],["/music/live"],["/music/a.mp3"],["/"]]
                                                    -> [null,true,true,true,8,3,5,8]
```

`/music` counts both files, including the one inside `/music/live`. The root counts everything.

**Example 2**

```
ops  = ["FileSystem","mkdir","write","size","write","size","size","size"]
args = [[],["/a"],["/a/f","hello"],["/a"],["/a/f","hi"],["/a"],["/a/f"],["/"]]
                                                    -> [null,true,true,5,true,2,2,2]
```

Replacing `"hello"` with `"hi"` shrinks the file from 5 to 2, and every folder above it shrinks by 3.

**Example 3**

```
ops  = ["FileSystem","mkdir","write","size","size","size","write","size"]
args = [[],["/e"],["/e/blank",""],["/e/blank"],["/e"],["/e/nothing"],["/e","oops"],["/"]]
                                                    -> [null,true,true,0,0,-1,false,0]
```

An empty file exists, so its size is `0`; a missing path gives `-1`. The `write` onto the folder `/e` fails and changes no size.

## Constraints

- Every path in the tests is valid: `"/"`, or `/` followed by 1 to 100 names joined with `/`, with no trailing `/`.
- A name is 1 to 20 characters, each a lowercase letter, a digit, `.`, `_` or `-`. A name is never `.` or `..`.
- `content` is 0 to 100 characters, each a lowercase letter, a digit or a space.
- At most `2 * 10^4` calls in total.

## Aim for

Store a `size` on every node and keep it current. A file counts toward exactly the folders on its path, from its parent up to the root, so a `write` changes only their totals, all by the same amount: `len(content)` minus the file's old size (`0` for a new file). `write` already walks down to the parent; keep the nodes it passes and add the difference to each. Then `size` is a walk and a lookup, `O(L)` for a path of `L` characters. Summing the subtree on every call costs `O(n)` for `n` entries below the path, and the large test makes that far too slow.

## Follow-ups

- Each folder should also report how many files it holds. What changes in `write`?
- Now `write` is constant and `size` is rare, in a tree 1,000 folders deep. Would you still keep totals current, or compute them lazily?
- Two threads write files in the same folder at once. What can go wrong with the totals, and how would you prevent it?
- Next step: `rm` and `mv`, which delete or move a whole folder without walking what's inside it.
