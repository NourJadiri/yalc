class Solution:
    def plusOne(self, digits: List[int]) -> List[int]:
        # 1. Walk in from the last digit, as on paper: a 9 becomes 0 and passes
        # the carry left; any other digit absorbs it and we're done.
        for i in range(len(digits) - 1, -1, -1):
            # 2. Below 9: this digit absorbs the carry
            if digits[i] < 9:
                digits[i] += 1
                return digits
            # 3. A 9 rolls over to 0
            digits[i] = 0
        # 4. The carry fell off the front
        return [1] + digits    # every digit was 9: 99...9 + 1 = 100...0
