class Solution:
    def middleNode(self, head: Optional[ListNode]) -> Optional[ListNode]:
        # 1. Both pointers start at the head
        slow = fast = head
        # 2. fast moves two nodes for every one that slow moves. Checking `fast`
        # and `fast.next` lets fast take its last step onto the final node
        # when the length is odd, or past it when it's even.
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
        # 3. slow is the middle node
        return slow     # fast has covered the whole list, so slow is halfway
