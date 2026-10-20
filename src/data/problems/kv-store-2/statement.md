# Key-Value Store: Nested Transactions

An object-oriented design drill, written for this app. There is no LeetCode page for it.

## In short
A key-value store with value counts → add nested transactions: `begin` opens one, `rollback` undoes its changes, `commit` keeps them.

## The task

**Step 2 of 4.** The store maps string keys to integer values and counts how many keys hold each value. So far it has:

- `KVStore()`: an empty store.
- `set(key, value)`: store `value` under `key`, replacing any value the key held.
- `get(key)`: the value stored under `key`, or `null` if the store doesn't have it.
- `delete(key)`: remove `key`; `true` if it was in the store, `false` (and nothing changes) if not.
- `count(value)`: how many keys hold exactly `value` right now.

**New in this step**: transactions, which can nest.

- `begin()`: open a new transaction. If one is already open, the new one is nested inside it and becomes the innermost open transaction.
- `rollback()`: undo every change made since the innermost open transaction began, including changes made in transactions nested inside it, then close it. Return `true`, or `false` if no transaction is open; then nothing happens.
- `commit()`: close the innermost open transaction and keep its changes. Return `true`, or `false` if no transaction is open.

The rules:

- A change is a `set`, or a `delete` that returns `true`.
- Reads always see the latest data: `get` and `count` reflect every change made so far, committed or not.
- Committing a nested transaction doesn't make its changes final. They now belong to the enclosing transaction: if that one rolls back, they are undone too.
- Committing the outermost transaction makes its changes permanent. Once no transaction is open, nothing can be undone.
- After a rollback, the data and every count are exactly what they were when that transaction began.
- `begin` and `commit` must run in `O(1)`, and `rollback` in time proportional to the number of changes it undoes. The step 1 methods stay `O(1)`.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation: `null` for the constructor, `set` and `begin`, a number or `null` for `get`, a number for `count`, and `true` or `false` for `delete`, `rollback` and `commit`.

Every test from the earlier steps still runs.

## Examples

**Example 1**

```
ops  = ["KVStore","set","begin","set","begin","delete","get","rollback","get","rollback","get","rollback"]
args = [[],["a",10],[],["a",20],[],["a"],["a"],[],["a"],[],["a"],[]]
                                                    -> [null,null,null,null,null,true,null,true,20,true,10,false]
```

The inner rollback undoes only the `delete`, so `a` is back to 20. The outer rollback undoes the second `set`, back to 10. The third `rollback` finds no open transaction.

**Example 2**

```
ops  = ["KVStore","begin","set","begin","set","commit","count","rollback","get","count","commit"]
args = [[],[],["x",5],[],["y",5],[],[5],[],["y"],[5],[]]
                                                    -> [null,null,null,null,null,true,2,true,null,0,false]
```

Committing the inner transaction hands the change to `y` to the outer one, so it isn't final yet. Rolling back the outer transaction undoes both changes, and no key holds 5 any more. The last `commit` has nothing to close.

**Example 3**

```
ops  = ["KVStore","set","begin","set","set","commit","rollback","get","count"]
args = [[],["a",1],[],["a",2],["b",2],[],[],["a"],[2]]
                                                    -> [null,null,null,null,null,true,false,2,2]
```

Committing the only open transaction makes both changes permanent. The `rollback` after it returns `false` and changes nothing.

## Constraints

- A key is 1 to 10 characters, each a lowercase English letter or a digit.
- `-10^9 <= value <= 10^9`, in `set` and in `count`.
- At most `10^5` calls in total.
- Transactions can nest to any depth.

## Aim for

One undo log shared by all open transactions, plus a stack of bookmarks. Before each change made while a transaction is open, append the key and what it held before ("absent" if nothing). `begin` pushes the log's length. `rollback` pops entries back to that bookmark, newest first, restoring each value through the same write path that keeps the counts. `commit` pops only the bookmark: its entries now lie inside the parent's range, so the parent's rollback still reaches them. Clear the log when the outermost transaction closes. That makes `begin` and `commit` `O(1)` and `rollback` `O(changes undone)`. Copying the store at every `begin` costs `O(n)` per transaction and is too slow.

## Follow-ups

- Add `rollback_all()`, which closes every open transaction at once. What does it cost with your log?
- Two clients each run their own transaction at the same time. What can go wrong, and how do databases keep them apart?
- Named savepoints: `save(name)` and `rollback_to(name)`. How do bookmarks change?
- Next step: crash recovery, with `crash()` and `recover()`.
