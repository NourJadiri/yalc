class Solution:
    def networkDelayTime(self, times: List[List[int]], n: int, k: int) -> int:
        # 1. Adjacency list of outgoing links
        graph = defaultdict(list)
        for u, v, w in times:
            graph[u].append((v, w))

        # 2. Heap of (time, node), starting at k
        arrival = {}                    # node -> its final (earliest) arrival time
        heap = [(0, k)]
        while heap:
            # 3. Pop the earliest entry
            t, u = heappop(heap)
            if u in arrival:            # stale entry: u was already settled, sooner
                continue
            # 4. Settle u, push its neighbours
            arrival[u] = t              # the smallest time in the heap can't improve
            for v, w in graph[u]:
                if v not in arrival:
                    heappush(heap, (t + w, v))
        # 5. Latest arrival, or -1
        return max(arrival.values()) if len(arrival) == n else -1
