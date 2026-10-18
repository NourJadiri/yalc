class Solution:
    def isPalindrome(self, s: str) -> bool:
        # 1. Pointers at both ends
        i, j = 0, len(s) - 1
        while i < j:
            # 2. Skip a character that doesn't count
            if not s[i].isalnum():      # skip what doesn't count, one side at a time
                i += 1
            elif not s[j].isalnum():
                j -= 1
            # 3. Compare the pair, ignoring case
            elif s[i].lower() != s[j].lower():
                return False
            # 4. A matching pair: step both inward
            else:                       # a matching pair: both step inward
                i += 1
                j -= 1
        # 5. Every pair matched
        return True
