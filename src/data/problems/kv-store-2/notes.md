## Pattern
Undo log with bookmarks

## Key idea
Record each change's previous value in one shared log; a transaction is just the log position where it began, so rollback pops back to it and commit keeps everything.

## Steps
1. Keep one undo log of `(key, value before)` for all open transactions, and a stack of the log's length at each `begin`.
2. In `begin`, push the log's current length: the new transaction starts there.
3. In `rollback`, pop entries back to that mark, newest first, writing each old value back through `_write`.
4. In `commit`, pop only the mark, leaving the entries to the parent; clear the log once the outermost transaction closes.
5. Before a change inside a transaction, append the key and its current value (`None` if absent) to the log.

## Cost
`O(1)` amortized time per call, `rollback` `O(k)` for `k` changes undone · `O(k)` extra space

## Approach

Pattern: an **undo log** (a stack of inverse changes) plus a **stack of bookmarks** into it.

The tempting design copies the whole store at `begin` and puts the copy back on `rollback`. It's correct, but every transaction costs `O(n)`. With 50,000 keys and over 14,000 short transactions, that's hundreds of millions of copied entries.

Remember only what changes instead. Before a `set` or `delete` made while a transaction is open, append `(key, value before)` to the undo log, where the value before is `None` if the key was absent. Undoing that change later is a single `_write(key, value_before)`, and `_write` already moves the key between counts, so `count` stays right with no extra work.

Now nesting. Transactions nest like brackets, so their changes nest in the log too: everything the innermost transaction did sits at the end. A transaction is fully described by where it started in the log, so `begin` pushes `len(undo)` onto a stack of bookmarks.

- **rollback** pops the innermost bookmark, then pops log entries until the log is back to that length, newest first. Newest first matters when a key changed several times: the last restore must be the oldest value.
- **commit** pops the bookmark and nothing else. The entries stay in the log, and they now lie inside the parent's range, after the parent's bookmark. If the parent rolls back later, it undoes them along with its own. That is the whole trick of a nested commit: it costs nothing.
- When the stack empties, the outermost transaction has closed and nothing can be undone any more, so clear the log. With no transaction open, changes aren't logged at all.

Why it's correct: the log always holds, in order, every change made since the outermost `begin` that hasn't been rolled back. The bookmarks cut it into the ranges of the open transactions, innermost last. Popping the last range in reverse undoes exactly the innermost transaction's changes, the ones its committed children handed it included.

## Complexity

`begin` is `O(1)`, and so is `commit`, apart from clearing the log when the outermost transaction closes, a cost each logged change pays once. `rollback` is `O(k)` for the `k` changes it undoes; each change is logged once and undone at most once, so that's `O(1)` amortized per change. The step 1 methods stay `O(1)`, plus one append to the log while a transaction is open.

Space: one log entry per change made since the outermost `begin`.

## Pitfalls

- Throwing the entries away on a nested commit. The changes look final, but the parent's rollback can no longer undo them.
- Logging only keys that existed. A key created inside the transaction must be logged as absent (`None`), or rollback leaves it behind.
- Undoing oldest first. When a key changed several times, the last restore wins, so it has to be the oldest value.
- Restoring `data` directly and forgetting the counts. Undo through the same `_write` that keeps `holders` in step.
- Merging a child's changes into its parent on commit. That costs `O(child)` per commit, and a deep chain of commits makes it quadratic: the second large test has 30,000 of them.
