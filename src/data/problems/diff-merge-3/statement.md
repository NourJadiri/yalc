# Diff & Merge: Three-Way Merge

An object-oriented design drill in three steps, written for this app. There is no LeetCode page for it.

## In short
A line diff tool → add `merge(base, ours, theirs)`, which combines two edits of one file and marks where they clash.

## The task

**Step 3 of 3.** You're building the diff and merge commands of a small version-control tool. So far, `DiffTool` computes a line diff between two versions of a file and prints it as unified hunks. A file is a list of lines, and may have none. A line is a string without newline characters, and may be empty. Two lines match only if they are exactly the same string. The methods so far:

- `DiffTool()`: creates the tool. It keeps no state, so every call stands on its own.
- `diff(a, b)`: returns the diff from file `a`, the old version, to file `b`, the new one.
- `unified(a, b, context)`: returns the changes of `diff(a, b)` as hunks with line-numbered headers.
- `merge(base, ours, theirs)`: new in this step, described below.

**How `diff` works.** It returns one entry per line: `" " + line` for a line kept from both files, `"-" + line` for a line only in `a` (deleted), `"+" + line` for a line only in `b` (added). The kept and `-` entries, in order, spell `a`; the kept and `+` entries spell `b`. It is a **shortest** diff, with as few `-` and `+` entries as possible, and of all shortest diffs it is the one these rules build:

1. Keep the longest run of lines that both files start with. Then, of the lines that remain, keep the longest run that both files end with.
2. Build the part in between from the top, one entry at a time. If the next line of `a` matches the next line of `b`, keep it. Otherwise, delete the next line of `a` if the diff can still end up shortest after that. If it can't, or `a` has no lines left, add the next line of `b`.

**How `unified` works.** A change is a `-` or `+` entry of `diff(a, b)`. Going from the top, a change joins the hunk of the change before it when at most `2 * context` kept entries lie between the two, and starts a new hunk otherwise. A hunk holds the entries from its first change to its last, plus up to `context` kept entries before the first and after the last (fewer at the ends of the diff). It opens with `"@@ -s1,n1 +s2,n2 @@"`, where `n1` counts its lines of `a` (kept and `-`) and `n2` its lines of `b` (kept and `+`). `s1` is the number, counting from 1, of its first line of `a`, or, if `n1` is 0, of the last line of `a` before the hunk (0 if none); `s2` is the same for `b`. `unified` returns every hunk's header and entries, in order, in one list, and `[]` when nothing changed.

**New in this step.** Two people edited the same file: `ours` and `theirs` both started from `base`. `merge(base, ours, theirs)` combines their edits.

First take `diff(base, ours)` and `diff(base, theirs)`. In each, a kept entry pairs a line of `base` with a line of the other file, its *partner*. A line of `base` is an *anchor* when both diffs keep it.

Then walk the three files together from the top, with a current line in each, starting at their first lines. Until all three are used up, repeat:

1. If the current line of `base` is an anchor, and its partners are the current lines of `ours` and of `theirs`, output it and move all three to their next line.
2. Otherwise, find the first anchor at or after the current line of `base`. In `base`, the chunk is the lines from the current line up to that anchor, not including it. In `ours` and in `theirs`, it is the lines from the current line up to the anchor's partner there, again not including it. If no anchor is left, the chunk is the rest of all three files. Output the chunk resolved (see below), then make the anchor and its partners the current lines.

A chunk has a base part `O`, an ours part `A` and a theirs part `B`. Resolve it like this:

- If `A` equals `B`, output `A`: both sides made the same change.
- Otherwise, if `A` equals `O`, output `B`: only theirs changed it.
- Otherwise, if `B` equals `O`, output `A`: only ours changed it.
- Otherwise it's a conflict. Output the line `"<<<<<<< ours"`, the lines of `A`, the line `"======="`, the lines of `B`, and the line `">>>>>>> theirs"`.

Return the merged file as a list of lines.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation: `null` for the constructor, a list of strings for each `diff`, `unified` or `merge`.

Every test from the earlier steps still runs.

## Examples

**Example 1**

```
ops  = ["DiffTool","merge"]
args = [[],[["flour","sugar","eggs","milk","salt"],["flour","brown sugar","eggs","oat milk","salt"],["flour","sugar","eggs","oat milk","salt","vanilla"]]]
                                                    -> [null,["flour","brown sugar","eggs","oat milk","salt","vanilla"]]
```

The anchors are `flour`, `eggs` and `salt`, which neither side touched. Between them, only ours changed `sugar`, and both sides turned `milk` into `oat milk`, which is taken once. After `salt`, only theirs added a line.

**Example 2**

```
ops  = ["DiffTool","merge"]
args = [[],[["host = alpha","port = 80","debug = off"],["host = alpha","port = 8080","debug = off"],["host = alpha","port = 443","debug = off"]]]
                                                    -> [null,["host = alpha","<<<<<<< ours","port = 8080","=======","port = 443",">>>>>>> theirs","debug = off"]]
```

Both sides changed the port, differently. The tool can't choose, so it writes both versions between conflict markers.

**Example 3**

```
ops  = ["DiffTool","merge"]
args = [[],[["one","two","three","four"],["one","TWO","three","four"],["one","two","THREE","four"]]]
                                                    -> [null,["one","<<<<<<< ours","TWO","three","=======","two","THREE",">>>>>>> theirs","four"]]
```

The edits touch different lines, but no anchor separates them: ours keeps `three` and theirs keeps `two`, and neither line is kept by both. So `two` and `three` form one chunk, both sides changed it, differently, and the whole chunk is a conflict.

## Constraints

- `0 <= a.length, b.length, base.length, ours.length, theirs.length <= 10^4`
- For every diff a call makes (`diff(a, b)`, `unified(a, b, context)`, and both diffs inside `merge`), at most `500` lines of each file remain after rule 1 trims both ends.
- Each line has at most `100` printable ASCII characters.
- `0 <= context <= 10^4`
- At most `10` calls per test.

## Aim for

`O(n + p·q)` time: the two diffs, then one linear pass. From each diff, record for every line of `base` the index of its partner, or `-1` if that side dropped it. The walk only moves forward: outputting a lined-up anchor advances all three positions, and a chunk jumps them to the next anchor, so each line of each file is handled a constant number of times. This is the classic **diff3** algorithm.

## Follow-ups

- Git can also write conflicts in `diff3` style, with a `||||||| base` section holding `O` between the two sides, or in `zdiff3` style, which first moves lines that open or close both sides out of the conflict. What would each need from your chunks?
- Git's merges can come out differently from this one. Its diffs break ties another way, and its `ort` strategy, like `recursive` before it, first merges the common ancestors when two branches have more than one. How does a history end up with two?
- Ours moves a block and theirs edits it. Here that gives a conflict where the block was and a stale copy where it went. How could a merge follow moved blocks?
