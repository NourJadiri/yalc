## Pattern
Breadth-first search

## Key idea
Codes are nodes and every move costs the same, so BFS finds the fewest moves; dead ends act like already-visited codes, so they go straight into `seen`.

## Steps
1. Seed `seen` with the dead ends. If `"0000"` is one, return `-1`; otherwise mark it seen, queue it, and start `moves` at `0`.
2. Process the queue one layer at a time (one layer = one more move); return `moves` when a popped code is `target`.
3. Turn each of the four wheels up and down, wrapping with `% 10`, to build the code's eight neighbours.
4. Skip neighbours already in `seen`; mark each new one seen as you queue it.
5. After the layer, add one to `moves`; if the queue empties without reaching `target`, return `-1`.

## Cost
`O(10^4 · 8)` time, from 10^4 codes with 8 neighbours each · `O(10^4)` space

## Approach

Model the lock as a graph. Each of the 10,000 codes is a node, and two codes are joined when one move turns one into the other. Every code has exactly eight neighbours: four wheels, each turned up or down, with `(d + 1) % 10` and `(d - 1) % 10` handling the wrap-around. Every move costs the same, so the fewest moves is a shortest path in an unweighted graph, and that's BFS.

Process the BFS one layer at a time. Layer `k` holds exactly the codes reachable in `k` moves and no fewer. When the target comes off the queue, the current layer number is the answer. If the queue empties first, the target is unreachable.

Dead ends need no special case inside the loop. You must never enter a dead end, and you must never re-enter a code you've already visited, so seeding the `seen` set with the dead ends handles both with one membership test. The only special case is the start: if `"0000"` is itself a dead end, the lock can't move at all.

**Bidirectional BFS** is the standard upgrade. Grow one frontier from `"0000"` and another from `target`, always expanding the smaller one, and stop when they meet. Each side only has to search about half the distance. The number of codes within `k` moves grows quickly with `k`, so two half-depth searches visit far fewer codes than one full-depth search. It's the answer to "can you make it faster?".

This is the shape of every state-space search: the nodes aren't cells of a grid but configurations (codes, words, board positions), and the edges are the legal moves between them. Work out what a state is and what its neighbours are, and the rest is ordinary BFS.

## Complexity

`O(10^4 · 8)` time: every code is queued at most once and generates eight neighbours (building each costs `O(4)`), plus `O(D)` to load `D` dead ends. `O(10^4)` space for the `seen` set and the queue. In general, `w` wheels of `d` digits give `d^w` codes with `2w` neighbours each.

## Pitfalls

- Forgetting that `"0000"` itself can be a dead end.
- Not wrapping around. `0` turns down to `9` and `9` turns up to `0`; without that, `"0009"` looks nine moves away instead of one.
- Testing membership against `deadends` as a list. Each test scans up to 500 strings. Convert it to a set once, or better, seed `seen` with it.
- Marking codes visited when they're popped instead of when they're pushed. The answer stays right, but the queue fills with duplicates.
