class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        # 1. A min-heap holding the current head of every non-empty list. The list
        # index i breaks ties between equal values, so heapq never has to
        # compare two ListNodes (which have no ordering).
        heap = [(node.val, i, node) for i, node in enumerate(lists) if node]
        heapify(heap)
        # 2. A dummy head to link behind
        dummy = tail = ListNode()
        # 3. Pop the smallest, link it on
        while heap:
            _, i, node = heappop(heap)
            tail.next = node            # reuse the node itself; no copying
            tail = node
            # 4. Push its successor in its place
            if node.next:
                heappush(heap, (node.next.val, i, node.next))
        # 5. Return the list after the dummy
        return dummy.next
