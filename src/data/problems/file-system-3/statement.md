# File System: Move and Delete

An object-oriented design drill in four steps, written for this app. There is no LeetCode page for it.

## In short
A file system with folder sizes → add `rm`, which deletes a file or a whole folder, and `mv`, which moves or renames one.

## The task

**Step 3 of 4.** `FileSystem` keeps an in-memory tree of folders and text files, and knows the size of everything in it. The root folder's path is `"/"`; any other path is `/` followed by one or more names joined with `/`, like `"/docs/plan.txt"`, and the tests only use valid paths (see Constraints). So far it has:

- `FileSystem()`: a file system holding only the empty root folder.
- `mkdir(path)`: makes the folder and every missing folder above it. Returns `true` if a folder exists at `path` afterwards (also when it already did, and for `"/"`); returns `false` and changes nothing if `path` or any name on the way to it is a file.
- `write(path, content)`: creates the file or replaces its content, and returns `true`. It never creates folders: it returns `false` and changes nothing if the parent folder is missing or is a file, if `path` is a folder, or if `path` is `"/"`.
- `read(path)`: the file's content (possibly `""`), or `null` if `path` is a folder or doesn't exist.
- `ls(path)`: a folder's child names, sorted as plain strings by character code (Python's `sorted`); `[name]` for a file; `[]` for a path that doesn't exist.
- `size(path)`: a file's length, or the total length of every file anywhere beneath a folder (`0` if there are none); `-1` if `path` doesn't exist.

**New in this step**

- `rm(path)`: deletes the file at `path`, or the folder at `path` with everything inside it, and returns `true`. Returns `false` if `path` doesn't exist or is `"/"`.
- `mv(src, dst)`: moves the file or folder at `src`, with everything inside it, so that it lives at `dst`, and returns `true`. The last name in `dst` becomes its name, so `mv` also renames.

`mv` returns `false` and changes nothing when:

- `src` doesn't exist, or is `"/"`;
- `dst` already exists, because `mv` never overwrites;
- the parent folder of `dst` doesn't exist, or is a file;
- `dst` is inside `src`, because a folder can't move into itself. Inside means below it in the tree: `"/a/b"` is inside `"/a"`, but `"/ab"` is not.

After an `rm` or `mv`, `size` reports the new totals for every folder. Neither call may copy or walk what it moves or deletes: each should cost about the length of its paths, however much the folder holds. One large test moves a folder of over 10,000 entries back and forth 7,000 times.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation: `null` for the constructor, `true` or `false` for `mkdir`, `write`, `rm` and `mv`, a string or `null` for `read`, a list of names for `ls`, a number for `size`.

Every test from the earlier steps still runs.

## Examples

**Example 1**

```
ops  = ["FileSystem","mkdir","write","write","mkdir","mv","ls","size","size","read"]
args = [[],["/inbox/q3"],["/inbox/q3/r.txt","abcd"],["/inbox/note","xy"],["/archive"],["/inbox/q3","/archive/q3-old"],["/archive"],["/inbox"],["/archive"],["/archive/q3-old/r.txt"]]
                                                    -> [null,true,true,true,true,true,["q3-old"],2,4,"abcd"]
```

The folder moves with its file and gets a new name on the way. `/inbox` drops by the 4 characters that left, and `/archive` gains them.

**Example 2**

```
ops  = ["FileSystem","mkdir","write","mv","mv","mv","ls","ls"]
args = [[],["/a/b"],["/c","x"],["/a","/a/b/z"],["/a","/c"],["/a","/ab"],["/"],["/ab"]]
                                                    -> [null,true,true,false,false,true,["ab","c"],["b"]]
```

`/a` can't move into its own subfolder, and it can't replace the existing `/c`. Renaming it to `/ab` is fine: that name only starts like `/a`, it isn't inside it.

**Example 3**

```
ops  = ["FileSystem","mkdir","write","write","rm","size","rm","rm","ls","size"]
args = [[],["/tmp/cache"],["/tmp/cache/x","12345"],["/tmp/y","12"],["/tmp/cache"],["/tmp"],["/tmp/cache"],["/"],["/tmp"],["/"]]
                                                    -> [null,true,true,true,true,2,false,false,["y"],2]
```

Deleting `/tmp/cache` deletes its file too, and the 5 characters leave every folder above it. A path that's already gone can't be deleted, and neither can the root.

## Constraints

- Every path in the tests is valid: `"/"`, or `/` followed by 1 to 100 names joined with `/`, with no trailing `/`.
- No file or folder is ever more than 100 names deep, before or after a move.
- A name is 1 to 20 characters, each a lowercase letter, a digit, `.`, `_` or `-`. A name is never `.` or `..`.
- `content` is 0 to 100 characters, each a lowercase letter, a digit or a space.
- At most `2 * 10^4` calls in total.

## Aim for

**Re-link, don't copy.** Everything inside a folder hangs off its node, so `mv` takes the node out of the old parent's dictionary and puts it into the new parent's under the new name: one delete and one insert, whatever the folder holds. For the sizes, subtract the node's size from every folder on the old path and add it to every folder on the new one. `rm` is the first half of that. Check every refusal before changing anything; the "inside itself" test is `dst.startswith(src + "/")`, and the slash is what lets `/a` become `/ab`. Each call is `O(L)` for paths of total length `L`.

## Follow-ups

- Add `cp(src, dst)`. Why can't it be as cheap as `mv`, and what would make it cheap?
- Add hard links: one file reachable from two folders. What happens to the folder sizes?
- `rm` should move things to a trash folder, to be restored later. What would you keep?
- Next step: `find(path, pattern, min_size)`, a search through a folder like the shell's `find`.
