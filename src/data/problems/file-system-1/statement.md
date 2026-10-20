# File System: Folders and Files

An object-oriented design drill in four steps, written for this app. There is no LeetCode page for it.

## In short
An in-memory file system → `mkdir` makes folders, `write` saves a file's text, `read` returns it and `ls` lists names.

## The task

**Step 1 of 4.** Build the core of an in-memory file system: a tree of folders and text files under one root folder. Later steps add sizes, moving and deleting, and search.

Every path is absolute. `"/"` is the root folder. Any other path is `/` followed by one or more names joined with `/`, like `"/docs/2024/plan.txt"`. Each name but the last is a folder on the way down, and the last is the folder or file the path points at. The tests only use valid paths (see Constraints).

Implement `class FileSystem`:

- `FileSystem()`: a file system holding only the empty root folder.
- `mkdir(path)`: makes the folder at `path`, and every missing folder above it.
- `write(path, content)`: creates the file at `path` holding the string `content`, or replaces the content of the file already there.
- `read(path)`: the content of the file at `path`.
- `ls(path)`: the names inside the folder at `path`.

The rules in full:

- `mkdir` returns `true` if a folder exists at `path` afterwards, including when it already existed. `mkdir("/")` returns `true`. If `path` itself, or any name on the way to it, is an existing file, it returns `false` and changes nothing.
- `write` never creates folders. It returns `false`, and changes nothing, if the folder that should hold the file is missing or is a file, if `path` is an existing folder, or if `path` is `"/"`. Otherwise it returns `true`.
- `read` returns the file's content, which may be the empty string. It returns `null` if `path` is a folder or doesn't exist.
- `ls` on a folder returns the names of its children, files and folders together, sorted. On a file it returns a one-element list with the file's own name. On a path that doesn't exist it returns `[]`.

Names sort as plain strings, by character code, the way Python's `sorted` sorts them: `-` comes before `.`, then digits, then `_`, then letters. So `"10"` comes before `"9"`.

Each call should cost about the length of its path (plus the sort in `ls`), not the size of the whole file system. One large test lists small folders 10,000 times in a tree of about 5,000 entries.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation: `null` for the constructor, `true` or `false` for `mkdir` and `write`, a string or `null` for `read`, a list of names for `ls`.

## Examples

**Example 1**

```
ops  = ["FileSystem","mkdir","write","write","ls","ls","read"]
args = [[],["/docs/drafts"],["/docs/todo.txt","call bob"],["/docs/drafts/a.md","hi"],["/docs"],["/docs/todo.txt"],["/docs/drafts/a.md"]]
                                                    -> [null,true,true,true,["drafts","todo.txt"],["todo.txt"],"hi"]
```

`mkdir` creates `/docs` on its way to `/docs/drafts`. Listing `/docs` gives the folder and the file together, sorted. Listing a file gives just its name.

**Example 2**

```
ops  = ["FileSystem","write","mkdir","write","mkdir","mkdir","write","read"]
args = [[],["/logs/a.txt","x"],["/logs"],["/logs/a.txt","x"],["/logs/a.txt/old"],["/logs/a.txt"],["/logs","y"],["/logs"]]
                                                    -> [null,false,true,true,false,false,false,null]
```

The first `write` fails because `/logs` doesn't exist yet, and `write` never makes folders. Once `/logs/a.txt` is a file, `mkdir` can neither go through it nor turn it into a folder. `/logs` is a folder, so it can't be written, and reading it gives `null`.

**Example 3**

```
ops  = ["FileSystem","ls","write","write","read","write","read","ls","ls"]
args = [[],["/"],["/b","old"],["/b","new"],["/b"],["/a",""],["/a"],["/"],["/c"]]
                                                    -> [null,[],true,true,"new",true,"",["a","b"],[]]
```

A new file system has an empty root. Writing to an existing file replaces its content. An empty file is still a file: `read` gives `""`, not `null`. A path that doesn't exist lists as `[]`.

## Constraints

- Every path in the tests is valid: `"/"`, or `/` followed by 1 to 100 names joined with `/`, with no trailing `/`.
- A name is 1 to 20 characters, each a lowercase letter, a digit, `.`, `_` or `-`. A name is never `.` or `..`.
- `content` is 0 to 100 characters, each a lowercase letter, a digit or a space.
- At most `2 * 10^4` calls in total.

## Aim for

A **trie** of names. Each folder node holds a dictionary from a child's name to the child node; a file node holds its content. Every call splits the path on `/` and walks it from the root, so it costs `O(L)` for a path of `L` characters, and `ls` adds `O(k log k)` to sort `k` names. A flat dictionary keyed by full paths makes `mkdir`, `write` and `read` just as easy, but then `ls` has to scan every stored path. Say it, then beat it.

## Follow-ups

- Add `append(path, text)`. Which of `write`'s rules carry over, and which change?
- Paths may now be relative to a current folder, with `cd`, `.` and `..`. Where would you resolve them?
- The tree no longer fits in memory. What stays in memory, and what moves to disk?
- Next step: `size(path)`, the total size of everything in a folder, answered without walking it.
