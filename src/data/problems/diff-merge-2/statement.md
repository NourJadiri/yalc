# Diff & Merge: Unified Hunks

An object-oriented design drill in three steps, written for this app. There is no LeetCode page for it.

## In short
A line diff tool → add `unified(a, b, context)`, which groups the changes into numbered hunks with up to `context` kept lines around them.

## The task

**Step 2 of 3.** You're building the diff and merge commands of a small version-control tool. So far, `DiffTool` computes a line diff between two versions of a file. A file is a list of lines, and may have none. A line is a string without newline characters, and may be empty. Two lines match only if they are exactly the same string. The methods so far:

- `DiffTool()`: creates the tool. It keeps no state, so every call stands on its own.
- `diff(a, b)`: returns the diff from file `a`, the old version, to file `b`, the new one.
- `unified(a, b, context)`: new in this step, described below.

**How `diff` works.** It returns one entry per line: `" " + line` for a line kept from both files, `"-" + line` for a line only in `a` (deleted), `"+" + line` for a line only in `b` (added). The kept and `-` entries, in order, spell `a`; the kept and `+` entries spell `b`. It is a **shortest** diff, with as few `-` and `+` entries as possible, and of all shortest diffs it is the one these rules build:

1. Keep the longest run of lines that both files start with. Then, of the lines that remain, keep the longest run that both files end with.
2. Build the part in between from the top, one entry at a time. If the next line of `a` matches the next line of `b`, keep it. Otherwise, delete the next line of `a` if the diff can still end up shortest after that. If it can't, or `a` has no lines left, add the next line of `b`.

**New in this step.** `unified(a, b, context)` shows only the parts of `diff(a, b)` around its changes, the way code review tools do. A change is a `-` or `+` entry.

- Changes are grouped into hunks, from the top. A change joins the hunk of the change before it when at most `2 * context` kept entries lie between the two; otherwise it starts a new hunk. With `context = 0`, only changes with nothing at all between them share a hunk.
- A hunk holds the entries from its first change to its last, plus up to `context` kept entries right before its first change and up to `context` right after its last. It has fewer when the diff starts or ends sooner.
- Each hunk opens with a header `"@@ -s1,n1 +s2,n2 @@"`. `n1` counts the hunk's entries that are lines of `a` (kept and `-`), and `n2` those that are lines of `b` (kept and `+`). `s1` is the line number in `a`, counting from 1, of the hunk's first line of `a`. When the hunk has no lines of `a` (`n1` is 0), `s1` is instead the number of the last line of `a` before the hunk, or 0 if there is none. `s2` is the same for `b`.

Return all the hunks in order, each as its header followed by its entries, in one flat list of strings. When the files have no changes, return an empty list.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation: `null` for the constructor, a list of strings for each `diff` or `unified`.

Every test from the earlier steps still runs.

## Examples

**Example 1**

```
ops  = ["DiffTool","unified"]
args = [[],[["red","orange","yellow","green","blue"],["red","orange","gold","green","blue"],1]]
                                                    -> [null,["@@ -2,3 +2,3 @@"," orange","-yellow","+gold"," green"]]
```

The diff replaces `yellow` with `gold`. With `context = 1`, the hunk takes one kept line on each side. It covers lines 2 to 4 of both files, so both halves of the header read `2,3`.

**Example 2**

```
ops  = ["DiffTool","unified"]
args = [[],[["ant","bee","cat","dog","eel","fox","gnu","hen","owl"],["ant","BEE","cat","dog","fox","gnu","hen","OWL"],1]]
                                                    -> [null,["@@ -1,6 +1,5 @@"," ant","-bee","+BEE"," cat"," dog","-eel"," fox","@@ -8,2 +7,2 @@"," hen","-owl","+OWL"]]
```

Two kept lines, `cat` and `dog`, separate `+BEE` from `-eel`. That's `2 * context`, so they share a hunk. Three kept lines separate `-eel` from `-owl`, so a second hunk starts. It begins at `hen`, line 8 of `a` but line 7 of `b`, because `eel` is gone. `owl` is the last line, so no context follows it.

**Example 3**

```
ops  = ["DiffTool","unified"]
args = [[],[["intro","body"],["body","outro"],0]]
                                                    -> [null,["@@ -1,1 +0,0 @@","-intro","@@ -2,0 +2,1 @@","+outro"]]
```

The diff deletes `intro`, keeps `body` and adds `outro`. With no context, the kept line splits the changes into two hunks. The first has no lines of `b`, and no line of `b` comes before it, so `s2` is 0. The second has no lines of `a`; the last line of `a` before it is line 2, `body`.

## Constraints

- `0 <= a.length, b.length <= 10^4`
- After rule 1 trims both ends, at most `500` lines of each file remain.
- Each line has at most `100` printable ASCII characters.
- `0 <= context <= 10^4`
- At most `10` calls per test.

## Aim for

`O(n)` on top of the diff, for a diff of `n` entries. Walk it once: a change joins the current hunk when at most `2 * context` kept entries separate it from the previous change, and starts a new hunk otherwise. Count, for every position, the lines of `a` and of `b` before it, and each header is two subtractions. The diff itself still costs `O(n + p·q)` for middles of `p` and `q` lines.

## Follow-ups

- Write the reverse: apply the hunks to `a` to rebuild `b`. How do the context lines help when `a` has gained lines above a hunk since the diff was made?
- `git diff` writes `@@ -3 +3 @@` when a count is 1, and prints the enclosing function's first line after the header. How would you find that line cheaply?
- Next step: a three-way merge that combines two edits of the same file.
