class Solution:
    def isValid(self, s: str) -> bool:
        # 1. Closer-to-opener map, and a stack
        opener_for = {")": "(", "]": "[", "}": "{"}
        stack = []                  # openers still waiting for their closer, newest on top
        for ch in s:
            if ch in opener_for:
                # 2. A closer must match the most recent opener that is still open.
                if not stack or stack.pop() != opener_for[ch]:
                    return False
            else:
                # 3. An opener waits on the stack
                stack.append(ch)
        # 4. Balanced only if nothing is left open
        return not stack            # anything left over was never closed
