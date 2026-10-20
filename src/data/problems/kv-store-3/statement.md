# Key-Value Store: Crash Recovery

An object-oriented design drill, written for this app. There is no LeetCode page for it.

## In short
A key-value store with nested transactions → add `crash()` and `recover()`: after a simulated power cut, rebuild exactly the committed data.

## The task

**Step 3 of 4.** The store maps string keys to integer values, counts how many keys hold each value, and runs nested transactions. So far it has:

- `KVStore()`: an empty store.
- `set(key, value)`: store `value` under `key`, replacing any value the key held.
- `get(key)`: the value stored under `key`, or `null` if the store doesn't have it.
- `delete(key)`: remove `key`; `true` if it was in the store, `false` (and nothing changes) if not.
- `count(value)`: how many keys hold exactly `value` right now.
- `begin()`: open a transaction, nested inside the innermost open one if there is one.
- `rollback()`: undo every change made since the innermost open transaction began, then close it; `false` if none is open.
- `commit()`: close the innermost open transaction and keep its changes; `false` if none is open.

A change is a `set`, or a `delete` that returns `true`. Reads see every change made so far, committed or not. Committing a nested transaction hands its changes to the enclosing one, which can still roll them back. Committing the outermost transaction makes its changes permanent.

Costs so far: `set`, `get`, `delete`, `count` and `begin` run in `O(1)`, `commit` in amortized `O(1)`, and `rollback` in time proportional to the number of changes it undoes.

**New in this step**: the store survives crashes.

- `crash()`: a simulated power cut. Everything the store holds in memory is lost: the data, the counts and every open transaction. Only what the store has made durable survives, as if it had been written to a file on disk.
- `recover()`: rebuild the store from its durable data. Return the number of keys in the store afterwards.

The rules:

- A change made while no transaction is open is durable as soon as the call returns.
- A change made inside a transaction becomes durable only when the outermost transaction commits. Then every change that transaction keeps becomes durable at once. Committing a nested transaction is not enough: its parent can still roll back.
- After `recover()`, the store holds exactly its committed state at the moment of the crash: every durable change, and nothing else. No transaction is open, and `count` is right for every value.
- After `crash()`, the next call is always `recover()`, and `recover()` is never called at any other time.
- How you keep durable data is up to you; a list you only ever append to is a fine stand-in for a file. But play it straight: after `crash()`, the object keeps nothing except its durable data, and `recover()` rebuilds everything else from it.
- Writes stay cheap: making a change durable must not cost time proportional to the size of the store. Committing the outermost transaction may take time proportional to its changes, and `recover()` time proportional to everything made durable so far.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation: `null` for the constructor, `set`, `begin` and `crash`, a number or `null` for `get`, a number for `count` and `recover`, and `true` or `false` for `delete`, `rollback` and `commit`.

Every test from the earlier steps still runs.

## Examples

**Example 1**

```
ops  = ["KVStore","set","set","begin","set","delete","crash","recover","get","get","count","rollback"]
args = [[],["a",1],["b",2],[],["a",9],["b"],[],[],["a"],["b"],[9],[]]
                                                    -> [null,null,null,null,null,true,null,2,1,2,0,false]
```

`a` and `b` were set with no transaction open, so they were durable at once. The transaction was still open at the crash, so both of its changes are lost. `recover` finds 2 keys, and no transaction is open afterwards, so `rollback` returns `false`.

**Example 2**

```
ops  = ["KVStore","begin","set","begin","set","commit","crash","recover","get"]
args = [[],[],["x",1],[],["y",2],[],[],[],["y"]]
                                                    -> [null,null,null,null,null,true,null,0,null]
```

Committing the inner transaction only hands the change to `y` to the outer one, and that one was still open at the crash. Nothing became durable.

**Example 3**

```
ops  = ["KVStore","set","begin","set","begin","delete","commit","commit","crash","recover","get","get","count"]
args = [[],["k",5],[],["m",5],[],["k"],[],[],[],[],["k"],["m"],[5]]
                                                    -> [null,null,null,null,null,true,true,true,null,1,null,5,1]
```

When the outermost transaction commits, the deletion of `k` and the new key `m` become durable together, so both outlive the crash.

## Constraints

- A key is 1 to 10 characters, each a lowercase English letter or a digit.
- `-10^9 <= value <= 10^9`, in `set` and in `count`.
- At most `10^5` calls in total.
- Transactions can nest to any depth.
- `crash` is called at most `10` times.

## Aim for

A **write-ahead log**: a list of `(key, value)` records, `None` for a deletion, that only ever grows and replays into the committed data. A change made with no transaction open appends its record at once. Inside transactions nothing durable is written yet: the undo log already names every key the transaction changed, so when the outermost transaction commits, append one record per changed key, holding its final value. Rolled-back changes never reach the log, and neither do transactions still open at the crash. `crash()` drops the data, the counts, the undo log and the bookmarks. `recover()` replays the log, oldest record first, into empty maps and rebuilds the counts. Writes stay `O(1)`, the outermost commit costs `O(changes)`, and `recover()` costs `O(log length)`.

## Follow-ups

- Writing to a real disk is slow, so databases make many commits durable with one flush. What must each committer wait for before its call returns?
- Should a record reach the disk before or after the change is made in memory? Why does the order matter once a crash can strike in the middle of a call?
- A transaction changes more keys than fit in memory. What would you write to disk early, and what must recovery then do about a transaction that never committed?
- Next step: checkpoints, so recovery replays only what came after the last one.
