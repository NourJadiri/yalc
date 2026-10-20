## Pattern
Hash map with a counter

## Key idea
Keep a second map, value → number of keys holding it, and update it on every change, so `count` becomes one lookup instead of a scan.

## Steps
1. Keep the data in a dict, and beside it a counter of how many keys hold each value.
2. Send `set` and `delete` through one helper, `_write`, so the two maps can't drift apart.
3. Answer `count` with a lookup in the counter; never scan the data.
4. In `_write`, take the key off its old value's count first, then store the new value and count it.

## Cost
`O(1)` average time per call · `O(n)` space for `n` keys

## Approach

Pattern: a **hash map** for the data, plus a **counter** that indexes it by value.

The data is a dict from key to value, so `get` and `delete` are dict operations. The only real question is `count`: how many keys hold a value? Scanning every key answers it in `O(n)`. With 50,000 keys and 25,000 counts, that is over a billion steps.

So keep the answer ready. A second map, `holders`, says for each value how many keys hold it right now. `count(value)` reads `holders[value]`; a `Counter` returns 0 for a value it has never seen.

The work moves to the writes. Every change must keep `holders` true, and there are three kinds:

- A new key: count it toward its value.
- A deleted key: take it off its value's count.
- An overwrite: both. The key leaves its old value's count and joins the new one's. Setting a key to the value it already holds takes one off and adds one back, which is exactly "nothing changed".

All three go through one helper, `_write(key, value)`, where `None` means "remove the key". Values are integers, so `None` can't be mistaken for a real value, not even `0`. One place that touches both maps is what keeps them in step, and the next steps lean on it: undoing a change will be one more `_write`.

## Complexity

Every method is `O(1)` on average: a constant number of dict operations.

Space: `O(n)` for `n` keys, plus one counter entry per distinct value ever stored. Entries that drop to zero can be deleted to keep the counter small; the answers stay the same.

## Pitfalls

- Forgetting the overwrite. If `set` only adds to the new value's count, a key moved from 3 to 8 still counts toward 3.
- Testing presence by truthiness. `if self.data.get(key):` treats a key that holds `0` as missing, so `delete` on it returns `false`. Use `key in self.data`, or compare with `None`.
- Scanning in `count`. The answers are right, but each call is `O(n)`, and the large test makes 25,000 counts against 50,000 keys.
