class Solution:
    def findOrder(self, numCourses: int, prerequisites: List[List[int]]) -> List[int]:
        # 1. Build the graph and the counts
        unlocks = [[] for _ in range(numCourses)]   # b -> the courses that need b
        waiting = [0] * numCourses                  # prerequisites each course still lacks
        for a, b in prerequisites:
            unlocks[b].append(a)
            waiting[a] += 1

        # 2. Queue every course with nothing unmet
        ready = deque(c for c in range(numCourses) if waiting[c] == 0)
        order = []
        # 3. Pop a ready course into order
        while ready:
            course = ready.popleft()
            order.append(course)                    # everything it needs is already in `order`
            # 4. Free the courses it unlocks
            for nxt in unlocks[course]:
                waiting[nxt] -= 1
                if waiting[nxt] == 0:
                    ready.append(nxt)
        # 5. Courses left out are stuck on a cycle (or behind one): no full order.
        return order if len(order) == numCourses else []
