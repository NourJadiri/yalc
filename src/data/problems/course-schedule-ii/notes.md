## Pattern
Topological sort (Kahn's algorithm)

## Key idea
A course enters the order only after all its prerequisites have, so repeatedly take one with none unmet; courses never freed sit on or behind a cycle.

## Steps
1. For each pair `[a, b]`, add `a` to `unlocks[b]` and count one more unmet prerequisite in `waiting[a]`.
2. Queue every course whose `waiting` count is `0`.
3. While the queue is not empty, pop a course and append it to `order`.
4. For each course it unlocks, decrement its `waiting` count and queue it when the count hits `0`.
5. Return `order`, or `[]` if it came out shorter than `numCourses`: the missing courses sit on or behind a cycle.

## Cost
`O(V + E)` time for `V` courses and `E` pairs · `O(V + E)` space

## Approach

Each pair `[a, b]` is a directed edge `b -> a`, and a valid schedule is a **topological order** of that graph. **Kahn's algorithm** builds one directly, by simulating the schedule.

Count each course's unmet prerequisites (its indegree), and queue every course at zero. Then repeat: pop a course, append it to `order`, and decrement the count of every course it unlocks. A count that reaches zero means that course's last prerequisite just went into `order`, so it can be queued. A course enters the queue only after all of its prerequisites are already in `order`, so `order` respects every pair by construction.

When the queue empties, either every course is in `order` (return it) or some never reached zero. Those leftovers each wait on another leftover, which means they sit on a cycle or behind one, so no complete order exists and the answer is `[]`. Returning the partial `order` there is the classic bug (Example 2).

Many orders can be valid. Kahn's returns whichever its queue discipline produces. A heap instead of a FIFO queue gives the lexicographically smallest order, for an extra `log V` per course.

**DFS gives an order too.** Run the three-state DFS from Course Schedule (unvisited, on the path, finished). When a course *finishes*, everything it unlocks has already finished. So the finishing order lists every course after the courses it unlocks, which is backwards. Reverse it to get a valid schedule. Stepping onto a course that's still on the path means a cycle, so return `[]`.

## Complexity

`O(V + E)` time: each course is queued once, and each pair is followed once. `O(V + E)` space for the adjacency lists, the counts, the queue and the order.

## Pitfalls

- Returning a partial order when a cycle exists. The leftover check (`len(order) == numCourses`) is the whole cycle test.
- Reversing the edges, so that each course is scheduled before its prerequisites. Trace Example 1 by hand to check that the order points the right way.
- DFS postorder without the final reversal: it lists every course *after* the courses it unlocks.
