# Key-Value Store: Crash Recovery

An object-oriented design drill, written for this app. There is no LeetCode page for it.

## In short
A key-value store with nested transactions → build it on a disk that survives crashes, and add `recover()`, which rebuilds exactly the committed data.

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

**New in this step**: the store lives on a disk, and survives crashes.

Your store is now handed a disk when it is built, and the disk is the only thing that survives a crash. A crash throws your `KVStore` object away, with everything it held in memory: the data, the counts and every open transaction. The tests then build a new `KVStore` on the same disk, and its first call is always `recover()`.

- `KVStore(disk=None)`: an empty store that keeps its durable data on `disk`. The tests always pass a disk. The default only keeps code that builds `KVStore()` working; such a store makes nothing durable.
- `recover()`: on the store built after a crash, rebuild the committed state from the disk alone, counts included, and return the number of keys.

The disk has two methods:

- `disk.append(record)`: add `record` at the end of the disk's log.
- `disk.read_log()`: return a list of every record appended so far, oldest first.

A record is plain data: a number, a string, `None`, or a list, tuple or dict of plain data. The disk keeps its own copy of each record, and `read_log()` hands back copies, so nothing in memory is ever shared with the disk. A tuple comes back as a tuple. Appending a small record is `O(1)`; reading the log takes time proportional to its length.

In the tests, a crash is the operation `"crash"` in `ops`, with no arguments and output `null`. It isn't a method of your class: it is the moment your object is thrown away and the next one is built.

The rules:

- A change made while no transaction is open is durable as soon as the call returns: after a crash, `recover()` must bring it back.
- A change made inside a transaction becomes durable only when the outermost transaction commits, together with every other change that transaction keeps. If the crash comes first, the change is lost. Committing a nested transaction is not enough: its parent could still roll back.
- After `recover()`, the store holds exactly its committed state at the moment of the crash: every durable change, and nothing else. No transaction is open, and `count` is right for every value.
- `recover()` is called only on a store built after a crash, as its first call.
- Writes stay cheap: making a change durable must not cost time proportional to the size of the store. Committing the outermost transaction may take time proportional to its changes, and `recover()` time proportional to the length of the disk's log.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation: `null` for the constructor, `set`, `begin` and `"crash"`, a number or `null` for `get`, a number for `count` and `recover`, and `true` or `false` for `delete`, `rollback` and `commit`.

Every test from the earlier steps still runs.

## Examples

**Example 1**

```
ops  = ["KVStore","set","set","begin","set","delete","crash","recover","get","get","count","rollback"]
args = [[],["a",1],["b",2],[],["a",9],["b"],[],[],["a"],["b"],[9],[]]
                                                    -> [null,null,null,null,null,true,null,2,1,2,0,false]
```

`a` and `b` were set with no transaction open, so they were durable at once. The transaction was still open at the crash, so both of its changes are lost with the old object. The new store's `recover` finds 2 keys, and it has no open transaction, so `rollback` returns `false`.

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
- A test crashes at most `10` times.

## Aim for

A **write-ahead log** on the disk: `(key, value)` records, `None` for a deletion, that replay into the committed data. A change made with no transaction open appends its record at once. Inside transactions nothing goes to the disk yet: the undo log already names every key the transaction changed, so when the outermost transaction commits, append one record per changed key, holding its final value. Rolled-back changes never reach the disk, and neither do transactions still open at a crash. `recover()` replays the log, oldest record first, into empty maps and rebuilds the counts. Writes stay `O(1)`, the outermost commit costs `O(changes)`, and `recover()` costs `O(log length)`.

## Follow-ups

- Writing to a real disk is slow, so databases make many commits durable with one flush. What must each committer wait for before its call returns?
- Should a record reach the disk before or after the change is made in memory? Why does the order matter once a crash can strike in the middle of a call?
- A transaction changes more keys than fit in memory. What would you write to disk early, and what must recovery then do about a transaction that never committed?
- Next step: checkpoints, so recovery replays only what came after the last one.
