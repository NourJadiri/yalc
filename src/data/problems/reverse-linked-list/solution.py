class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        # 1. Reversed part so far: nothing yet
        prev = None
        cur = head
        while cur:
            # 2. Remember the next node
            nxt = cur.next      # save the rest of the list before the link turns
            # 3. Point this node backwards
            cur.next = prev     # turn the link
            # 4. Advance both pointers
            prev, cur = cur, nxt
        # 5. prev is the new head
        return prev             # cur fell off the end; prev is the old tail
