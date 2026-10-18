## Pattern
Recursion (bottom-up)

## Key idea
Computing a node's height already gives you both child heights, so test the balance right there and return `-1`, never a real height, to say "unbalanced below".

## Steps
1. Write `height(node)` to return the subtree's height, or `-1` if it is unbalanced anywhere inside; an empty tree is `0`.
2. Get the left height; if it is `-1`, return `-1` straight away.
3. Get the right height; return `-1` if it is `-1` or differs from the left height by more than `1`.
4. Otherwise return `1 + max(left, right)`.
5. Return `True` exactly when `height(root)` is not `-1`.

## Cost
`O(n)` time · `O(h)` space for a tree of height `h`

## Approach

The definition tells you what to compute: at every node, the heights of its two subtrees. Height is Maximum Depth again — `0` for an empty tree, otherwise `1 + max(left height, right height)`.

**The direct approach (top-down).** At each node, call a `height` helper on both children and compare; then check both children the same way. It's correct and a fine first answer in an interview. But each `height` call walks a whole subtree, and you make those calls at every node: a node `d` levels down gets measured again for each of its `d` ancestors. That's `O(n·h)` in total — `O(n log n)` on a bushy tree.

**The one-pass approach (bottom-up).** Look at what the recursive height computation already does: before it can return a node's height, it has the heights of both children in hand. Those are exactly the two numbers the balance check needs. So check right there, then pass the height up to the parent.

The only snag is reporting a failure. The function returns a height — how does it also say "something below me is unbalanced"? Return a value that can never be a real height: `-1`. Now `height(node)` means "the height of this subtree, or `-1` if it is unbalanced anywhere inside":

- Empty tree: return `0`.
- Get the left height. If it's `-1`, return `-1` at once — the answer is already `False`, so there's no point looking right.
- Get the right height. If it's `-1`, or the two heights differ by more than `1`, return `-1`.
- Otherwise return `1 + max(left, right)`.

The whole tree is balanced exactly when `height(root)` isn't `-1`.

Why that's right: read it from the leaves up. A non-negative return value is the true height of a subtree that is balanced at every node, and `-1` means some node inside breaks the rule. A node passes only when neither child reported `-1` and their heights are within `1` — the definition, applied at every node.

This is the move from Diameter of Binary Tree once more: the call returns what the parent needs (a height) while carrying a second piece of information. Here the second piece is folded into the same number by the `-1` signal; returning a pair `(is_balanced, height)` works just as well if you find it clearer.

How to spot it next time: a check at every node needs a quantity that is itself computed recursively — heights, sizes, sums. Compute the quantity and run the check in the same pass, instead of calling a helper from every node.

## Complexity

Bottom-up: `O(n)` time — each node is visited at most once, and the walk stops early once an imbalance is found. `O(h)` extra space for the call stack. Top-down: `O(n·h)` time.

## Pitfalls

- Checking only the root. In Example 2 the root is balanced and the node just below it isn't.
- Losing the `-1`. If you test `abs(left - right) > 1` without first checking for `-1`, the signal can pass for an ordinary height: `-1` and `0` differ by only `1`, and the failure quietly disappears.
- Confusing "balanced" with "all leaves at about the same depth". Every node may lean by one, and the leans add up: a balanced tree can have leaves whose depths differ by much more than `1`.
