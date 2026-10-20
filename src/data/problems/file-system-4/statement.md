# File System: Find

An object-oriented design drill in four steps, written for this app. There is no LeetCode page for it.

## In short
A file system with sizes, moves and deletes → add `find`, which lists the files under a path whose names match a wildcard pattern.

## The task

**Step 4 of 4.** `FileSystem` keeps an in-memory tree of folders and text files, knows the size of everything in it, and can move and delete. The root folder's path is `"/"`; any other path is `/` followed by one or more names joined with `/`, like `"/docs/plan.txt"`, and the tests only use valid paths (see Constraints). So far it has:

- `FileSystem()`: a file system holding only the empty root folder.
- `mkdir(path)`: makes the folder and every missing folder above it. Returns `true` if a folder exists at `path` afterwards (also when it already did, and for `"/"`); returns `false` and changes nothing if `path` or any name on the way to it is a file.
- `write(path, content)`: creates the file or replaces its content, and returns `true`. It never creates folders: it returns `false` and changes nothing if the parent folder is missing or is a file, if `path` is a folder, or if `path` is `"/"`.
- `read(path)`: the file's content (possibly `""`), or `null` if `path` is a folder or doesn't exist.
- `ls(path)`: a folder's child names, sorted as plain strings by character code (Python's `sorted`); `[name]` for a file; `[]` for a path that doesn't exist.
- `size(path)`: a file's length, or the total length of every file anywhere beneath a folder (`0` if there are none); `-1` if `path` doesn't exist.
- `rm(path)`: deletes the file, or the folder with everything inside it, and returns `true`; returns `false` if `path` doesn't exist or is `"/"`.
- `mv(src, dst)`: moves the file or folder at `src`, with everything inside it, to `dst`, whose last name becomes its name, and returns `true`. Returns `false` and changes nothing if `src` doesn't exist or is `"/"`, if `dst` already exists, if the parent folder of `dst` doesn't exist or is a file, or if `dst` is inside `src`.

**New in this step**

- `find(path, pattern, min_size = 0)`: the full paths of every file at or under `path` whose name matches `pattern` and whose size is at least `min_size`, sorted. If `path` is a folder, the candidates are all the files anywhere beneath it. If `path` is a file, that file is the only candidate. If `path` doesn't exist, return `[]`. Folders are never listed, whatever their names.

A file's name is the last name in its path. Only the name is matched against the pattern, and it has to match as a whole. In a pattern, `*` matches any run of characters, including none, and `?` matches exactly one character. Every other character, `.` and `-` included, matches only itself. So `app*.log` matches `app.log` and `app12.log`, but not `app.log.old`.

The paths come back sorted as plain strings, by character code (Python's `sorted`). `/` sorts after `-` and `.` but before digits, `_` and letters, so `"/a-b"` comes before `"/a/x"`.

Patterns can hold many stars. A matcher that tries every way of splitting a name among them takes exponential time, and one large test matches ten-star patterns against 200 names of 20 characters. Another calls `find` 5,000 times on small folders of a big tree, so `find` should walk only what is under `path`.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation: `null` for the constructor, `true` or `false` for `mkdir`, `write`, `rm` and `mv`, a string or `null` for `read`, a list of names for `ls`, a number for `size`, a list of paths for `find`. A `find` called with two arguments has `min_size = 0`.

Every test from the earlier steps still runs.

## Examples

**Example 1**

```
ops  = ["FileSystem","mkdir","write","write","write","write","find","find"]
args = [[],["/src/lib"],["/src/main.py","run"],["/src/lib/util.py","def f"],["/src/lib/notes.txt","todo"],["/readme.md","hi"],["/","*.py"],["/src","*"]]
                                                    -> [null,true,true,true,true,true,["/src/lib/util.py","/src/main.py"],["/src/lib/notes.txt","/src/lib/util.py","/src/main.py"]]
```

`*.py` matches the names that end in `.py`, at any depth under the root. `*` matches every file under `/src`, but never the folder `/src/lib` itself.

**Example 2**

```
ops  = ["FileSystem","mkdir","write","write","write","find","find","find"]
args = [[],["/logs"],["/logs/app.log","12345"],["/logs/app1.log","123"],["/logs/app12.log",""],["/logs","app?.log"],["/logs","app*.log",3],["/logs","app*.log"]]
                                                    -> [null,true,true,true,true,["/logs/app1.log"],["/logs/app.log","/logs/app1.log"],["/logs/app.log","/logs/app1.log","/logs/app12.log"]]
```

`?` is exactly one character, so only `app1.log` matches `app?.log`. A `*` may match nothing, so `app*.log` matches `app.log` too. With `min_size` 3, the empty `app12.log` drops out, and `app1.log`, at exactly 3, stays.

**Example 3**

```
ops  = ["FileSystem","mkdir","write","write","find","find","find"]
args = [[],["/a"],["/a/x","1"],["/a-b","22"],["/a/x","*"],["/","*"],["/nope","*"]]
                                                    -> [null,true,true,true,["/a/x"],["/a-b","/a/x"],[]]
```

When `path` is a file, it is the whole search. `"/a-b"` sorts before `"/a/x"` because `-` comes before `/`. A path that doesn't exist finds nothing.

## Constraints

- Every path in the tests is valid: `"/"`, or `/` followed by 1 to 100 names joined with `/`, with no trailing `/`.
- No file or folder is ever more than 100 names deep, before or after a move.
- A name is 1 to 20 characters, each a lowercase letter, a digit, `.`, `_` or `-`. A name is never `.` or `..`.
- `content` is 0 to 100 characters, each a lowercase letter, a digit or a space.
- `pattern` is 1 to 20 characters, each a character allowed in names, `*` or `?`.
- `0 <= min_size <= 100`
- At most `2 * 10^4` calls in total.

## Aim for

Walk the subtree under `path` with a stack, carrying each node's full path, and test every file you meet. Match a name with **two pointers**, the classic wildcard match: advance both on a plain character or `?`; on a `*`, remember where it is and let it match nothing for now; on a mismatch, go back to the last `*` and let it take one more character. That's `O(w * p)` at worst for a name of `w` characters and a pattern of `p`, and usually close to linear. Sort at the end. Python's `fnmatch.fnmatchcase` gives the same answers: it turns the pattern into a regular expression (`?` becomes `.`, each `*` before a fixed piece becomes a lazy `.*?` inside an atomic group, the rest is escaped), caches it, and lets `re` match. A recursive matcher that tries every split for each `*` is exponential in the number of stars.

## Follow-ups

- Make filters objects: name patterns, size bounds and modification times, combined with AND, OR and NOT. How do you keep them composable?
- Add symbolic links. How does `find` avoid walking around a cycle forever?
- The file system now holds millions of files on disk. What would you index so `find` doesn't touch every one?
