## Pattern
Two pointers (expand around centres)

## Key idea
A palindrome is symmetric about its centre, a character or a gap, so grow outwards from each of the `2n - 1` centres while the two ends match.

## Steps
1. Write `expand(lo, hi)`: grow outwards while both ends are in range and equal, then return the bounds `(lo + 1, hi)` (the loop overshoots by one).
2. Start with `best = (0, 1)`, the first character.
3. For each index `i`, expand around the character at `i` (odd length) and around the gap after it (even length).
4. Whenever a result is longer than `best`, replace `best` with it.
5. Return `s[best[0]:best[1]]`.

## Cost
`O(n^2)` time · `O(1)` extra space

## Approach

**Expand around centres.** Every palindrome is symmetric about its middle, and the middle is either a character (odd length, `"aba"`) or the gap between two equal neighbours (even length, `"abba"`). A string of length `n` has `2n - 1` such centres. From each one, grow outwards while the two ends match. As soon as they differ, or you run off either end of the string, that centre's palindrome is as long as it gets: any longer palindrome with the same centre would contain the mismatched pair. The longest of the `2n - 1` is the answer.

**The interval DP underneath it.**

- Subproblem: `pal[i][j]` = whether `s[i..j]` is a palindrome.
- Recurrence: `pal[i][j] = (s[i] == s[j]) and pal[i+1][j-1]`.
- Base cases: `pal[i][i]` is true, and `pal[i][i+1]` is `s[i] == s[i+1]` (the inside is empty).
- Fill order: by increasing length, or `i` from `n - 1` down to `0` with `j` ascending, so `pal[i+1][j-1]` is ready before `pal[i][j]`. Track the longest true entry.
- Top-down: `isPal(i, j)` memoised, with the same `O(n^2)` states.

The DP is `O(n^2)` time too, but it stores `n^2` booleans and visits every pair even when all the palindromes are short. Expanding around centres is that same DP with the table thrown away. Each expansion walks one diagonal of `pal` outwards from its base case and stops at the first false entry, because nothing past it on that diagonal can be true.

**Manacher's algorithm** reuses expansions already done. Inside a long palindrome, the palindrome around the mirrored centre gives a free lower bound, so each character is matched only a constant number of times overall. That's `O(n)`. Name it in an interview; a working version is rarely expected on a whiteboard.

## Complexity

Expand around centres: `O(n^2)` time in the worst case (`"aaa…a"`, where every expansion runs to an edge), and close to `O(n)` on varied text. `O(1)` extra space besides the answer. Interval DP: `O(n^2)` time and `O(n^2)` space. Manacher: `O(n)` time and space.

## Pitfalls

- Expanding only around characters misses every even-length palindrome, like `"abba"` in Example 2.
- The expansion loop stops one step past the palindrome on each side, so the palindrome is `s[lo + 1:hi]`, not `s[lo:hi + 1]`.
- Normalising case: `'A'` and `'a'` are different characters here.
