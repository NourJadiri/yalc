# Key-Value Store: Store and Count

An object-oriented design drill, written for this app. There is no LeetCode page for it.

## In short
A key-value store → `set`, `get` and `delete` integer values by string key; `count(value)` says how many keys hold that value.

## The task

**Step 1 of 4.** Over four steps you build a small storage engine: a key-value store, then nested transactions, then crash recovery, then checkpoints. This step is the core. Keys are strings and values are integers. Implement `class KVStore`:

- `KVStore()`: an empty store.
- `set(key, value)`: store `value` under `key`.
- `get(key)`: return the value stored under `key`, or `null` if the store doesn't have `key`.
- `delete(key)`: remove `key`. Return `true` if it was in the store, `false` if it wasn't.
- `count(value)`: return how many keys hold exactly `value` right now.

The rules:

- A key holds one value at a time. Setting a key that already exists replaces its value: from then on it counts toward the new value only, not the old one.
- Setting a key to the value it already holds changes nothing.
- A deleted key is gone: `get` returns `null` for it, and it counts toward no value. It can be set again later.
- Deleting a key that isn't in the store returns `false` and changes nothing.
- `0` and negative numbers are values like any other.
- Every method must run in `O(1)` average time, `count` included.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation: `null` for the constructor and for `set`, a number or `null` for `get`, `true` or `false` for `delete`, a number for `count`.

## Examples

**Example 1**

```
ops  = ["KVStore","set","set","set","count","get","get","set","count","count"]
args = [[],["apple",3],["pear",3],["plum",8],[3],["pear"],["fig"],["pear",8],[3],[8]]
                                                    -> [null,null,null,null,2,3,null,null,1,2]
```

Two keys hold 3. `fig` was never set, so it reads `null`. Moving `pear` to 8 takes it off 3's count and adds it to 8's.

**Example 2**

```
ops  = ["KVStore","set","get","delete","delete","get","count"]
args = [[],["x",0],["x"],["x"],["x"],["x"],[0]]
                                                    -> [null,null,0,true,false,null,0]
```

`0` is a real value, not a missing one. The first `delete` removes `x` and the second finds nothing. After that, `x` reads `null` and no key holds 0.

## Constraints

- A key is 1 to 10 characters, each a lowercase English letter or a digit.
- `-10^9 <= value <= 10^9`, in `set` and in `count`.
- At most `10^5` calls in total.

## Aim for

`O(1)` for every method. Keep a second map beside the data: value → how many keys hold it. Every change updates both maps, and an overwrite is two moves: the key leaves its old value's count and joins the new one's. Then `count` is a single lookup. Scanning the data on every `count` costs `O(n)` per call, which is too slow when counts are frequent.

## Follow-ups

- Return the keys that hold a value, not just how many. What does that cost, and what must an overwrite update?
- Add `count_range(lo, hi)`: how many keys hold a value between `lo` and `hi`. What replaces the counter?
- Keys expire after a time to live. How does `count` stay right without sweeping every key?
- Next step: nested transactions, with `begin`, `commit` and `rollback`.
