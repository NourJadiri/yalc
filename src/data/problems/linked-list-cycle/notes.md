## Pattern
Fast and slow pointers

## Key idea
In a loop `fast` gains one node per round on `slow`, so it must land on the same node; without a loop `fast` falls off the end.

## Steps
1. Start `slow` and `fast` both at `head`.
2. While `fast` and `fast.next` exist, move `slow` one node and `fast` two.
3. If `slow is fast`, the fast pointer lapped the slow one: return `True`. Compare nodes, not values.
4. If the loop ends, `fast` fell off the end: return `False`.

## Cost
`O(n)` time · `O(1)` space

## Approach

Floyd's tortoise and hare. Start two pointers at the head; each round, `slow` moves one node and `fast` moves two. Without a loop, `fast` reaches `None` and the answer is `False`. With a loop, both pointers end up circling it, and since `fast` gains one node per round on `slow`, it must land on exactly the same node eventually — compare nodes with `is`, never values.

## Complexity

`O(n)` time: once `slow` enters the loop, `fast` catches it within one lap. `O(1)` extra space.

## Pitfalls

- Comparing `val`s: two different nodes can hold the same value.
- Checking `fast.next.next` without checking `fast.next` first.
