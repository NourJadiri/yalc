## Pattern
Hash map, one pass

## Key idea
The only number that can pair with `x` is `target - x`, so as you walk the list, ask whether you have already seen it.

## Steps
1. Keep a dictionary from each value seen so far to its index.
2. For each `x`, look up `target - x`; if it's there, return both indices.
3. Only then store `x`, so a number never pairs with itself.

## Cost
`O(n)` time · `O(n)` space

## Approach

For each number `x`, the only partner that works is `target - x`. So walk the list once, keeping a dictionary from every value seen so far to its index. At each position, look the complement up first; if it's there, the pair is found. Only then store `x`.

The order of those two steps is the whole subtlety: storing first would let `x` find itself when `x + x == target`, returning the same index twice.

## Complexity

`O(n)` time — one pass, each dictionary operation `O(1)` on average. `O(n)` extra space for the dictionary.

## Pitfalls

- Duplicates: with `[7,7]` and `14` the first `7` is stored, the second finds it. Storing a value's *last* index up front breaks the "different positions" rule instead.
- Returning values instead of indices.
