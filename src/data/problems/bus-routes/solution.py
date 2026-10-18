class Solution:
    def numBusesToDestination(self, routes: List[List[int]], source: int, target: int) -> int:
        # 1. Already there: no bus needed
        if source == target:
            return 0
        # 2. Index the buses by stop
        buses_at = defaultdict(list)            # stop -> the buses that serve it
        for bus, stops in enumerate(routes):
            for stop in stops:
                buses_at[stop].append(bus)

        # 3. BFS over buses, not stops: layer k is every bus you can be riding
        # after boarding k buses. Riding one bus any distance costs one.
        boarded = set(buses_at[source])
        queue = deque(boarded)
        buses = 1
        # 4. Walk each bus's stops, layer by layer
        while queue:
            for _ in range(len(queue)):
                bus = queue.popleft()
                for stop in routes[bus]:
                    if stop == target:
                        return buses
                    # 5. Every bus at this stop is queued now, so the stop never
                    # needs expanding again: pop it from the map.
                    for nxt in buses_at.pop(stop, ()):
                        if nxt not in boarded:
                            boarded.add(nxt)
                            queue.append(nxt)
            # 6. Layer done: one more bus
            buses += 1
        return -1
