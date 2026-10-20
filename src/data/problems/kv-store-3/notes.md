## Pattern
Write-ahead log

## Key idea
Only committed changes reach the durable log: changes outside transactions at once, a transaction's in one batch when the outermost commits; recovery replays the log.

## Steps
1. Keep a durable log of `(key, value)` records, `None` meaning deleted; it is the one field `crash` spares.
2. When the outermost transaction commits, append one record per key in the undo log, holding that key's final value.
3. In `crash`, drop the data, the counts, the undo log and the bookmarks.
4. In `recover`, replay the log oldest first into an empty dict, rebuild the counts, and return the number of keys.
5. In `_change`, append the record to the log straight away when no transaction is open.

## Cost
`O(1)` time per write, `O(k)` per outermost commit, `O(L)` per `recover` · `O(L)` space, `L` records

## Approach

Pattern: a **write-ahead log**, the way real databases survive crashes. Only the log is durable; everything in memory can be rebuilt from it.

Start from what must survive. After a crash the store has to come back in its committed state: every change made outside a transaction, plus every transaction whose outermost commit returned. Anything inside a transaction that was still open is gone, even the parts of it that a nested commit had closed.

So the log holds records `(key, value)`, with `None` for a deletion, and replaying them in order rebuilds the committed data. Records are added at two moments:

- **A change outside any transaction** is committed the moment it happens, so `_change` appends its record at once.
- **The outermost commit.** Inside transactions nothing durable is written: changes can still be rolled back, and a record in the log can't be taken back. When the outermost transaction commits, the changes it keeps are exactly the ones left in the undo log, since rollbacks popped theirs and nested commits kept theirs. So append one record per key named in the undo log, holding that key's current value. That one batch is the whole transaction.

Final values are enough, because replay only cares about the last record for each key. A key that was set and then deleted inside the transaction gets a single deletion record. A key whose changes were all rolled back is no longer in the undo log, so it gets no record at all.

`crash()` throws away everything but the log: the data, the counts, the undo log and the bookmarks. That is also what discards an open transaction, since its changes only ever lived in memory.

`recover()` replays the log into an empty dict, oldest record first, so each key ends up with its last record. Then it rebuilds `holders` from the recovered values in one pass and returns the number of keys.

Why it's correct: replaying the log always gives the committed state. A change outside transactions changes the committed state by exactly the record it appends. An outermost commit changes it by the transaction's surviving changes and appends each touched key's new value. Nothing else changes the committed state, and nothing else appends.

## Complexity

A change outside transactions adds one append: `O(1)`. The outermost commit is `O(k)` for the `k` undo entries it reads, and each of those was paid for when its change was made. `crash()` is `O(1)`: it just drops references. `recover()` is `O(L + n)` for `L` log records and `n` recovered keys.

Space: one record per change made outside transactions, plus one per key per committed transaction. The log never shrinks yet; the next step deals with that.

## Pitfalls

- Logging changes inside transactions as they happen. Logging the undo writes too makes rollbacks come out right, but a transaction still open at the crash has left its changes in the log, and they come back.
- Making a nested commit durable. Its parent can still roll back, and a record in the log can't be taken back.
- Logging only values that are set. A deletion needs a record of its own, or the deleted key reappears after recovery.
- Rebuilding the counts on top of the old ones. Recovery starts from empty maps, or every count doubles.
- Keeping a durable copy of the data and handing that same dict back on recovery. Later changes then write straight into the "disk", committed or not.
