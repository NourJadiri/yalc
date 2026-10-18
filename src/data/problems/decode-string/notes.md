## Pattern
Stack

## Key idea
Innermost groups finish first, so at each `[` set the text so far and the count aside on a stack, and resume from them at the matching `]`.

## Steps
1. Keep a `stack` of saved depths, plus `cur` (the text pieces at this depth) and `num` (the count being read).
2. Scan `s` once. A digit extends the count: `num = num * 10 + int(ch)`.
3. On `[`, push `(cur, num)` onto the stack, then start `cur` and `num` fresh.
4. On `]`, pop `(prev, k)`, append `cur` repeated `k` times to `prev`, and make `prev` the new `cur`.
5. Any other character is a letter: append it to `cur`.
6. Join `cur` and return it: the stack is empty by then.

## Cost
`O(n + m)` time for output length `m` (worst case `O(m · depth)`) · `O(m + depth)` space

## Approach

**A stack of frames.** Nesting is the whole difficulty: when a `[` opens, the text built so far has to wait until the matching `]` closes, and then the inner result is repeated and glued onto it. "Put it aside, finish the inner part, come back" — innermost first — is a stack.

Keep two pieces of state, the text at the current depth (`cur`) and the count being read (`num`), and scan once:

- **digit:** `num = num * 10 + d` — counts can be several digits long;
- **`[`:** push `(cur, num)` and reset both — a new depth begins;
- **`]`:** pop `(prev, k)`; the finished inner text, repeated `k` times, is appended to `prev`, which becomes `cur` again;
- **letter:** append it to `cur`.

When the scan ends, the input was balanced, so the stack is empty and `cur` is the answer.

Each frame holds exactly what the enclosing depth needs to resume: the text it had before the bracket and how many times to repeat what's inside. That pairing — "(count, prefix)" — is the thing to say out loud.

Building `cur` as a list of pieces and joining once per `]` keeps the copying down; growing one string with `+` inside loops can copy the same characters again and again.

**Recursion is the same machine.** `parse(i)` decodes from index `i` until an unmatched `]` or the end of the string and returns the text plus the index where it stopped; a count followed by `[` calls `parse` for the inside. The call stack plays the explicit stack's role, and the depth is the bracket nesting — tiny here.

## Complexity

Time is proportional to the text produced: each finished inner piece is copied once into the level above. With counts of at least `2` that's `O(n + m)` for output length `m`; the worst case is `O(m * depth)`, when counts of `1` make every level copy everything (`1[1[1[abc]]]`). Space is `O(m)` for the pieces plus `O(depth)` stack frames.

## Pitfalls

- Reading one digit at a time as the whole count: `12[o]` becomes `oo`.
- Forgetting to reset `num` (or `cur`) after pushing at `[`: the next count glues onto the old one.
- Dropping letters that follow a `]`, or that come before the first count — they belong to `cur` like any other letter.
