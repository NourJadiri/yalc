## Pattern
Linked list pointers

## Key idea
Save `cur.next` before overwriting it, then turn the link back to `prev`; when `cur` falls off the end, `prev` is the new head.

## Steps
1. Start with `prev = None`, the reversed part so far, and `cur = head`, and loop while `cur` is a node.
2. Save the rest of the list first: `nxt = cur.next`.
3. Turn the link around: `cur.next = prev`.
4. Move both pointers forward: `prev, cur = cur, nxt`.
5. Return `prev`: `cur` fell off the end, so `prev` is the old tail and the new head.

## Cost
`O(n)` time · `O(1)` space

## Approach

Walk the list once, turning each link around as you pass it. Three names do it: `prev` (the reversed part so far), `cur` (the node being turned), and `nxt` (the rest of the original list, saved *before* `cur.next` is overwritten — lose it and the rest of the list is gone).

Each step: save `nxt`, point `cur.next` at `prev`, then move both `prev` and `cur` one step forward. When `cur` runs off the end, `prev` is the old tail, which is the new head.

The recursive version reverses `head.next` onward first, then hangs `head` on the end: `head.next.next = head; head.next = None`.

## Complexity

Iterative: `O(n)` time, `O(1)` extra space. Recursive: `O(n)` time but `O(n)` call stack.

## Pitfalls

- Forgetting to save `nxt` before turning the link.
- Returning `head` (now the tail) instead of `prev`.
