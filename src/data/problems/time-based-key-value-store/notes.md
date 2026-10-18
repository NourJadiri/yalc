## Pattern
Binary search

## Key idea
Because `set` timestamps only increase, appending keeps each key's timestamp list sorted, so `get` is a binary search for the newest timestamp at or before the query.

## Steps
1. Keep two dicts of lists, `times[key]` and `values[key]`, side by side.
2. In `set`, append the timestamp and the value to that key's lists; they stay sorted because timestamps only increase.
3. In `get`, return `""` if the key has no history.
4. Set `i = bisect_right(times, timestamp)`, the number of timestamps `<= timestamp`.
5. Return `values[key][i - 1]`, the newest version at or before `timestamp`, or `""` if `i` is `0`.

## Cost
`O(1)` time per `set`, `O(log m)` per `get` for `m` versions of the key · `O(n)` space

## Approach

A dictionary from key to that key's history, where the history is two parallel lists: the timestamps of its `set` calls and the values they stored. The guarantee that `set` timestamps strictly increase is the whole design: appending to the end of a key's list keeps it sorted, so no balanced tree or re-sorting is ever needed.

`get(key, t)` asks for the newest version at or before `t` — the last timestamp `<= t` in a sorted list. `bisect_right(times, t)` returns the number of timestamps `<= t`, call it `i`; if `i == 0` nothing had been set yet and the answer is `""`, otherwise it's `values[i - 1]`. A timestamp equal to `t` counts as "at or before", which is exactly why `bisect_right` (not `bisect_left`) is the right search.

## Complexity

`set`: `O(1)` amortised (two appends). `get`: `O(log m)`, where `m` is the number of versions of that key. Space: `O(n)` over all `set` calls.

## Pitfalls

- `bisect_left` finds the first timestamp `>= t`, so `bisect_left(...) - 1` skips a version stored at exactly `t`.
- Scanning a key's history linearly — from either end — is `O(m)` per `get`; with `10^5` versions of one key and lookups at random times, that's billions of steps.
- Bisecting one list of `(timestamp, value)` pairs with the probe `(t, "")` misses a version stored at exactly `t`, because `(t, "red") > (t, "")`. Probe with `bisect_left(pairs, (t + 1,))` instead — or keep the timestamps in their own list, as here.
- A key that was never set: look it up with `.get` (or `in`), so a lookup doesn't raise or quietly create empty entries.
