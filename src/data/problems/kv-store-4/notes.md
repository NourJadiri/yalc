## Pattern
Snapshot plus log replay

## Key idea
Fold the disk's log into its snapshot and empty the log; recovery reads the snapshot and replays only what was logged since, and open transactions never touch either.

## Steps
1. In `recover`, start from `read_snapshot()`, or an empty dict before any checkpoint, then replay the log on top, oldest record first.
2. In `checkpoint`, read the snapshot and replay the log into it: that is the committed state.
3. Save it with `write_snapshot`, empty the log with `clear_log`, and return the number of keys.

## Cost
`O(s + k)` time per `recover` or `checkpoint` · `O(s + k)` disk space, `s` keys, `k` new records

## Approach

Pattern: a **snapshot plus a log**, the classic way to keep recovery time bounded.

In step 3, recovery replays the disk's whole log, and the log only grows. The large test writes about 77,000 records and crashes 4,480 times; replaying everything each time adds up to over 170 million records, for a store that never holds more than 200 keys. A checkpoint fixes that: write the committed state down once, and from then on recovery starts from it.

The disk now holds the durable state in two parts:

- the **snapshot**: the committed data as of the last checkpoint.
- the **log**: the records made durable since then, in order.

**checkpoint** reads the snapshot (an empty dict if none was written yet), replays the log into it, oldest record first, exactly as recovery would, and saves the result with `write_snapshot`. Then `clear_log` empties the log. Snapshot plus log still replays to the same committed state as before; the records only moved from one part to the other. Return the snapshot's size.

The order of those two writes matters on a real disk. Snapshot first, then clear: if the machine died in between, recovery would replay records the snapshot already holds, which changes nothing. The other way round, a crash in between would lose every logged change. Here a crash only strikes between calls, but the habit is worth having.

**recover** starts from `read_snapshot()` and replays `read_log()` on top. The disk hands back copies, so the new store's data can't share anything with the snapshot on the disk.

Open transactions are the subtle part, and the step 3 design makes them free. A transaction puts nothing on the disk before its outermost commit; its changes live only in the in-memory data and the undo log. So when a checkpoint runs mid-transaction, the log holds committed changes only, and so does the snapshot built from it. The transaction carries on untouched. If it rolls back, there is nothing on the disk to undo. If it commits, its batch of records lands in the log after the snapshot, and recovery replays it.

The tempting mistake is to write the live data as the snapshot. `self.data` is the committed state whenever no transaction is open. With one open, it holds uncommitted changes, and a crash then brings them back.

## Complexity

`checkpoint` is `O(s + k)` for a snapshot of `s` keys and the `k` records logged since the last one. `recover` is `O(s + k)` too. Everything else is as in step 3.

Space: `O(s + k)` on the disk, on top of the live data.

A real checkpoint costs the same `O(s)`: it writes the whole snapshot out. Real systems weigh how often to pay that against how long recovery may take; here, a checkpoint every few hundred changes keeps both small.

## Pitfalls

- Writing the live data as the snapshot. It includes the changes of transactions that are still open, and after a crash they wrongly survive.
- Recovering from the snapshot alone. Changes made durable after the last checkpoint sit in the log, and they count too.
- Folding the log into the snapshot but never clearing it. The answers are right, but recovery replays everything, and the large test crashes 4,480 times.
- Clearing the log before writing the snapshot. It passes here, since a crash can't strike in the middle of a call, but on a real disk a crash between the two loses every logged change.
