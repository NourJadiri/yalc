class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        # 1. Last-seen map, and the window's start
        last = {}            # character -> index of its latest occurrence
        start = best = 0     # invariant: s[start..i] has no repeated character
        for i, ch in enumerate(s):
            # 2. Only a previous copy inside the window forces it to shrink. An
            # older copy (before start) must not drag start backwards.
            if last.get(ch, -1) >= start:
                start = last[ch] + 1
            # 3. Record the sighting, then measure the window
            last[ch] = i
            best = max(best, i - start + 1)
        # 4. The longest window seen
        return best
