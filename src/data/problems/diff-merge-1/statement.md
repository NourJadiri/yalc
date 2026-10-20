# Diff & Merge: Line Diff

An object-oriented design drill in three steps, written for this app. There is no LeetCode page for it.

## In short
A line diff tool → `diff(a, b)` marks every line as kept, deleted or added, in a shortest diff picked by fixed rules.

## The task

**Step 1 of 3.** You're building the diff and merge commands of a small version-control tool, one step at a time. This step is the diff. A file is a list of lines, and may have none. A line is a string without newline characters, and may be empty. Two lines match only if they are exactly the same string. Implement `class DiffTool`:

- `DiffTool()`: creates the tool. It keeps no state, so every call stands on its own.
- `diff(a, b)`: returns the diff from file `a`, the old version, to file `b`, the new one.

A diff lists the lines of both files in one sequence, one entry per line:

- `" " + line` for a line kept from both files,
- `"-" + line` for a line only in `a` (deleted),
- `"+" + line` for a line only in `b` (added).

The kept and `-` entries, in order, spell `a`. The kept and `+` entries spell `b`.

Return a **shortest** diff: one with as few `-` and `+` entries as possible, which is the same as keeping as many lines as possible. Two files usually have several shortest diffs. Return the one these rules build:

1. Keep the longest run of lines that both files start with. Then, of the lines that remain, keep the longest run that both files end with.
2. Build the part in between from the top, one entry at a time. If the next line of `a` matches the next line of `b`, keep it. Otherwise, delete the next line of `a` if the diff can still end up shortest after that. If it can't, or `a` has no lines left, add the next line of `b`.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation: `null` for the constructor, a list of strings for each `diff`.

## Examples

**Example 1**

```
ops  = ["DiffTool","diff"]
args = [[],[["milk","eggs","bread"],["milk","flour","bread"]]]
                                                    -> [null,[" milk","-eggs","+flour"," bread"]]
```

Both files start with `milk` and end with `bread`, so rule 1 keeps them. In between, `eggs` doesn't match `flour`. Deleting `eggs` first costs no kept line, so `-eggs` comes before `+flour`.

**Example 2**

```
ops  = ["DiffTool","diff"]
args = [[],[["title","intro","body"],["draft","title","intro","notes"]]]
                                                    -> [null,["+draft"," title"," intro","-body","+notes"]]
```

Nothing is shared at the ends. A shortest diff keeps `title` and `intro`. Deleting `title` first would lose it, so `+draft` has to come first. After the two kept lines, `body` and `notes` don't match, and this time the delete can go first.

**Example 3**

```
ops  = ["DiffTool","diff"]
args = [[],[["log","ok","ok"],["ok"]]]
                                                    -> [null,["-log","-ok"," ok"]]
```

The files start differently but both end with `ok`, so rule 1 keeps the last `ok`. That leaves `log` and `ok` in `a` and nothing in `b`, so both are deleted. Keeping the first `ok` instead would also be a shortest diff, but rule 1 comes first.

## Constraints

- `0 <= a.length, b.length <= 10^4`
- After rule 1 trims both ends, at most `500` lines of each file remain.
- Each line has at most `100` printable ASCII characters.
- At most `10` calls per test.

## Aim for

`O(n + p·q)` time, for `n` lines in all and `p`, `q` lines left in each file after the trim. The trim is linear. For the part in between, a walk from the top has to know, at every step, how many lines it can still keep: the length of the longest common subsequence (LCS) of what's left of each file. So fill the LCS table over **suffixes**, from the bottom-right corner, then walk from the top: keep on a match, delete when that doesn't lower the table's value, otherwise add. A table over two whole 10^4-line files would have 10^8 cells. The trim is what makes the problem fit, and it's why real diff tools trim first.

## Follow-ups

- The table takes `O(p·q)` memory. How would you find a shortest diff in linear space, and could you keep these exact tie-breaking rules?
- Real tools use Myers' algorithm, which runs in `O((p + q)·d)` time for a diff with `d` changes. Why is that fast for everyday edits?
- A moved block shows up as a delete and an add. How would you detect moves?
- Next step: group the diff into unified hunks, with line numbers and a few lines of context.
