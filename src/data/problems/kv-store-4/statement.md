# Key-Value Store: Checkpoints

An object-oriented design drill, written for this app. There is no LeetCode page for it.

## In short
A key-value store that recovers from crashes → add `checkpoint()`, which saves the committed data so recovery replays only later changes.

## The task

**Step 4 of 4.** The store maps string keys to integer values, counts how many keys hold each value, runs nested transactions, and survives crashes by keeping a log on a disk. So far it has:

- `KVStore(disk=None)`: an empty store that keeps its durable data on `disk`. The tests always pass a disk; the default only keeps older code that builds `KVStore()` running.
- `set(key, value)`: store `value` under `key`, replacing any value the key held.
- `get(key)`: the value stored under `key`, or `null` if the store doesn't have it.
- `delete(key)`: remove `key`; `true` if it was in the store, `false` (and nothing changes) if not.
- `count(value)`: how many keys hold exactly `value` right now.
- `begin()`: open a transaction, nested inside the innermost open one if there is one.
- `rollback()`: undo every change made since the innermost open transaction began, then close it; `false` if none is open.
- `commit()`: close the innermost open transaction and keep its changes; `false` if none is open.
- `recover()`: on the store built after a crash, rebuild the committed state from the disk alone and return the number of keys.

How these fit together:

- A change is a `set`, or a `delete` that returns `true`. Reads see every change made so far, committed or not.
- A change made while no transaction is open is committed, and durable, as soon as the call returns.
- A change made inside a transaction is committed, and durable, only when the outermost transaction commits, together with every other change that transaction keeps. A nested commit only hands its changes to the enclosing transaction, which can still roll them back.
- A crash throws your `KVStore` object away, with everything it held in memory: the data, the counts and every open transaction. The tests then build a new `KVStore` on the same disk, and its first call is `recover()`, which leaves the store in exactly its committed state at the moment of the crash, with no transaction open. In the tests, a crash is the operation `"crash"` in `ops`, with no arguments and output `null`; it isn't a method of your class.
- The disk is the only thing that survives a crash. So far it has `disk.append(record)`, which adds `record` at the end of its log, and `disk.read_log()`, which returns a list of every record in the log, oldest first.
- A record is plain data: a number, a string, `None`, or a list, tuple or dict of plain data. The disk keeps its own copy of everything it is given and hands back copies, so nothing in memory is ever shared with it.
- Costs: `set`, `get`, `delete`, `count` and `begin` run in `O(1)`, and `commit` in amortized `O(1)`, except that committing the outermost transaction may take time proportional to its changes. `rollback` takes time proportional to the number of changes it undoes. Making a change durable never costs time proportional to the size of the store.

**New in this step**: checkpoints, and three more disk methods.

- `checkpoint()`: write the committed state to the disk as a snapshot, then empty the disk's log. Return the number of keys in the snapshot, which is the number of keys in the committed state.

The disk now also has:

- `disk.write_snapshot(data)`: store a copy of the dict `data` as the disk's snapshot, replacing the one before.
- `disk.read_snapshot()`: return a copy of the last snapshot written, or `None` if none has been written yet.
- `disk.clear_log()`: remove every record from the log.

Writing or reading a snapshot takes time proportional to its size.

The rules:

- A snapshot holds committed data only: never a change made inside a transaction that is still open.
- `checkpoint()` can be called while transactions are open. They carry on as if nothing had happened: they can still roll back, and if the outermost one commits later, its changes become durable as usual, in the log after the snapshot.
- `checkpoint()` changes nothing that `get` or `count` can see.
- Recovery starts from the snapshot, if there is one, and replays the records logged after it. `recover()` must take time proportional to the snapshot's size plus the length of the log. Replaying every change since the store was created is too slow.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation: `null` for the constructor, `set`, `begin` and `"crash"`, a number or `null` for `get`, a number for `count`, `recover` and `checkpoint`, and `true` or `false` for `delete`, `rollback` and `commit`.

Every test from the earlier steps still runs.

## Examples

**Example 1**

```
ops  = ["KVStore","set","set","checkpoint","delete","set","crash","recover","get","get","get"]
args = [[],["a",1],["b",2],[],["a"],["c",3],[],[],["a"],["b"],["c"]]
                                                    -> [null,null,null,2,true,null,null,2,null,2,3]
```

The snapshot holds `a` and `b`. The deletion of `a` and the new key `c` are logged after it, so recovery applies them on top of the snapshot.

**Example 2**

```
ops  = ["KVStore","set","begin","set","set","checkpoint","commit","crash","recover","get","get"]
args = [[],["x",1],[],["x",2],["y",3],[],[],[],[],["x"],["y"]]
                                                    -> [null,null,null,null,null,1,true,null,2,2,3]
```

At the checkpoint the transaction is still open, so the snapshot sees only `x = 1`: 1 key. The transaction carries on, and its commit logs `x = 2` and `y = 3` after the snapshot.

**Example 3**

```
ops  = ["KVStore","set","begin","delete","set","checkpoint","crash","recover","get","get"]
args = [[],["p",4],[],["p"],["q",4],[],[],[],["p"],["q"]]
                                                    -> [null,null,null,true,null,1,null,1,4,null]
```

The snapshot has `p = 4` and no `q`, because the deletion of `p` and the new `q` were never committed. The crash ends the transaction, and recovery brings back exactly the snapshot.

## Constraints

- A key is 1 to 10 characters, each a lowercase English letter or a digit.
- `-10^9 <= value <= 10^9`, in `set` and in `count`.
- At most `10^5` calls in total.
- Transactions can nest to any depth.
- At most `10` crashes come between one checkpoint and the next, where the start and the end of a test count as checkpoints.
- The results of all `recover` calls in a test add up to at most `10^6`.

## Aim for

A checkpoint folds the disk's log into its snapshot: read the snapshot (an empty dict if there is none), replay the log onto it, oldest record first, save it with `write_snapshot`, then `clear_log`. The log only ever holds committed changes, since open transactions put nothing on the disk before the outermost commit, so the snapshot is committed-only for free and open transactions never notice the checkpoint. `recover()` starts from `read_snapshot()` and replays `read_log()` on top: `O(snapshot + log since the last checkpoint)`. Writing the live data as the snapshot instead would capture uncommitted changes.

## Follow-ups

- On a real disk a write isn't safe until it's flushed, and a crash can leave half a record at the end of the log. How do you make a commit truly durable, and what should recovery do with a torn last record?
- Instead of snapshots, some stores rewrite the log itself as one record per live key, in the background, while new writes keep arriving. How would you swap in the rewritten log without losing any of them?
- A second machine replays your log as it grows, to stay a copy of the store. What can it serve, and what goes wrong when it falls behind?
