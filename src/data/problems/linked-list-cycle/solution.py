class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        # 1. Both pointers start at the head
        slow = fast = head
        # 2. Slow takes one step, fast takes two
        while fast and fast.next:
            slow = slow.next          # one step
            fast = fast.next.next     # two steps
            # 3. Same node: fast lapped slow
            if slow is fast:          # the fast pointer lapped the slow one
                return True
        # 4. Fast ran out: no loop
        return False                  # fast fell off the end: no loop
