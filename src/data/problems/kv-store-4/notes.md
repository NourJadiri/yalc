## Pattern
Snapshot plus log replay

## Key idea
Fold the log into a durable snapshot and start a fresh log; recovery copies the snapshot and replays only what was logged since, and open transactions never touch either.

## Steps
1. Keep the durable state in two parts: a snapshot dict of committed data, and the log written since.
2. In `recover`, start from a copy of the snapshot, then replay the log on top, oldest record first.
3. In `checkpoint`, replay the log into the snapshot, empty the log, and return the snapshot's size.

## Cost
`O(s + k)` time per `recover`, `O(k)` per `checkpoint` · `O(s + k)` space, `s` keys, `k` new records

## Approach

Pattern: a **snapshot plus a log**, the classic way to keep recovery time bounded.

In step 3, recovery replays the whole durable log, and the log only grows. The large test writes about 77,000 records and crashes 4,480 times; replaying everything each time adds up to over 170 million records, for a store that never holds more than 200 keys. A checkpoint fixes that: write the committed state down once, and from then on recovery starts from it.

The durable state now has two parts:

- `snapshot`: the committed data as of the last checkpoint.
- `log`: the records made durable since then, in order.

**checkpoint** replays the log into the snapshot, oldest record first, exactly as recovery would, then empties the log. Snapshot plus log still replays to the same committed state as before, since the records only moved from one part to the other. Return the snapshot's size.

**recover** starts from a copy of the snapshot and replays the log on top. It has to be a copy: if the live data and the snapshot were the same dict, every later change, committed or not, would write straight into durable storage.

Open transactions are the subtle part, and the step 3 design makes them free. A transaction writes nothing durable before its outermost commit; its changes live only in the in-memory data and the undo log. So when a checkpoint runs mid-transaction, the log holds committed changes only, and so does the snapshot built from it. The transaction carries on untouched. If it rolls back, there is nothing durable to undo. If it commits, its batch of records lands in the new log, after the snapshot, and recovery replays it.

The tempting mistake is to snapshot the live data. `dict(self.data)` is the committed state whenever no transaction is open. With one open, it captures uncommitted changes, and a crash then brings them back.

## Complexity

`checkpoint` is `O(k)` for the `k` records written since the last one, a cost spread over those writes. `recover` is `O(s + k)` for a snapshot of `s` keys. Everything else is as in step 3.

Space: `O(s + k)` of durable state, on top of the live data.

A real checkpoint writes the whole snapshot out, which is `O(s)`, and real systems weigh how often to pay that against how long recovery may take. Here the snapshot lives in memory, so folding the log in is enough.

## Pitfalls

- Snapshotting the live data. It includes the changes of transactions that are still open, and after a crash they wrongly survive.
- Sharing the snapshot with the live data after recovery. Later changes, committed or not, then write straight into durable storage.
- Recovering from the snapshot alone. Changes made durable after the last checkpoint sit in the log, and they count too.
- Keeping the whole log and replaying all of it. The answers are right, but the large test crashes 4,480 times.
