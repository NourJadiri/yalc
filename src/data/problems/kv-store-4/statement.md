# Key-Value Store: Checkpoints

An object-oriented design drill, written for this app. There is no LeetCode page for it.

## In short
A key-value store that recovers from crashes → add `checkpoint()`, which saves the committed data so recovery replays only later changes.

## The task

**Step 4 of 4.** The store maps string keys to integer values, counts how many keys hold each value, runs nested transactions, and survives crashes. So far it has:

- `KVStore()`: an empty store.
- `set(key, value)`: store `value` under `key`, replacing any value the key held.
- `get(key)`: the value stored under `key`, or `null` if the store doesn't have it.
- `delete(key)`: remove `key`; `true` if it was in the store, `false` (and nothing changes) if not.
- `count(value)`: how many keys hold exactly `value` right now.
- `begin()`: open a transaction, nested inside the innermost open one if there is one.
- `rollback()`: undo every change made since the innermost open transaction began, then close it; `false` if none is open.
- `commit()`: close the innermost open transaction and keep its changes; `false` if none is open.
- `crash()`: a simulated power cut. Everything in memory is lost; only durable data survives.
- `recover()`: rebuild the store from its durable data and return the number of keys.

How these fit together:

- A change is a `set`, or a `delete` that returns `true`. Reads see every change made so far, committed or not.
- A change made while no transaction is open is committed, and durable, as soon as the call returns.
- A change made inside a transaction is committed, and durable, only when the outermost transaction commits, together with every other change that transaction keeps. A nested commit only hands its changes to the enclosing transaction, which can still roll them back.
- `crash()` loses the data, the counts and every open transaction. The next call is always `recover()`, which leaves the store in exactly its committed state at the moment of the crash, with no transaction open.
- Play it straight: after `crash()`, the object keeps nothing except its durable data, and `recover()` rebuilds everything else from it.
- Costs: `set`, `get`, `delete`, `count` and `begin` run in `O(1)`, and `commit` in amortized `O(1)`, except that committing the outermost transaction may take time proportional to its changes. `rollback` takes time proportional to the number of changes it undoes. Making a change durable never costs time proportional to the size of the store.

**New in this step**: checkpoints.

- `checkpoint()`: save a snapshot of the committed state as durable data, so that recovery can start from it instead of from the very beginning. Return the number of keys in the snapshot, which is the number of keys in the committed state.

The rules:

- A snapshot holds committed data only. Changes made inside transactions that are still open are never part of it.
- `checkpoint()` can be called while transactions are open. They carry on as if nothing had happened: they can still roll back, and if the outermost one commits later, its changes become durable as usual.
- `checkpoint()` changes nothing that `get` or `count` can see.
- `recover()` must take time proportional to the size of the latest snapshot plus the number of changes made durable since it. Replaying everything since the store was created is too slow.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation: `null` for the constructor, `set`, `begin` and `crash`, a number or `null` for `get`, a number for `count`, `recover` and `checkpoint`, and `true` or `false` for `delete`, `rollback` and `commit`.

Every test from the earlier steps still runs.

## Examples

**Example 1**

```
ops  = ["KVStore","set","set","checkpoint","delete","set","crash","recover","get","get","get"]
args = [[],["a",1],["b",2],[],["a"],["c",3],[],[],["a"],["b"],["c"]]
                                                    -> [null,null,null,2,true,null,null,2,null,2,3]
```

The snapshot holds `a` and `b`. The deletion of `a` and the new key `c` were made durable after it, so recovery applies them on top of the snapshot.

**Example 2**

```
ops  = ["KVStore","set","begin","set","set","checkpoint","commit","crash","recover","get","get"]
args = [[],["x",1],[],["x",2],["y",3],[],[],[],[],["x"],["y"]]
                                                    -> [null,null,null,null,null,1,true,null,2,2,3]
```

At the checkpoint the transaction is still open, so the snapshot sees only `x = 1`: 1 key. The transaction carries on, and its commit makes `x = 2` and `y = 3` durable.

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
- At most `10` calls to `crash` come between one checkpoint and the next, where the start and the end of a test count as checkpoints.
- The results of all `recover` calls in a test add up to at most `10^6`.

## Aim for

Keep the durable state in two parts: a snapshot dict, and the log of records made durable since it. `checkpoint()` replays the log into the snapshot, oldest record first, then empties the log. The log only ever holds committed changes, since open transactions write nothing durable before the outermost commit, so the snapshot is committed-only for free and open transactions never notice the checkpoint. `recover()` starts from a copy of the snapshot, never the snapshot itself, and replays the log on top: `O(snapshot + log since the last checkpoint)`. Copying the live data instead would capture uncommitted changes.

## Follow-ups

- A write isn't really on the disk until it's flushed, and a crash can leave half a record at the end of the log. How do you make a commit truly durable, and what should recovery do with a torn last record?
- Instead of snapshots, some stores rewrite the log itself as one record per live key, in the background, while new writes keep arriving. How would you swap in the rewritten log without losing any of them?
- A second machine replays your log as it grows, to stay a copy of the store. What can it serve, and what goes wrong when it falls behind?
