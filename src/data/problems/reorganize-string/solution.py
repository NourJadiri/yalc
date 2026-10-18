class Solution:
    def reorganizeString(self, s: str) -> str:
        # 1. Count letters; check the feasibility bound
        counts = Counter(s)
        if max(counts.values()) > (len(s) + 1) // 2:
            return ""     # that letter would need two neighbouring slots somewhere
        # 2. Max-heap on remaining count (negated for heapq). Always place the
        # most plentiful letter that isn't the one just placed; the one just
        # placed sits out a single round in `held`.
        heap = [(-c, ch) for ch, c in counts.items()]
        heapq.heapify(heap)
        out = []
        held = None
        # 3. Pop the most plentiful letter
        while heap:
            c, ch = heapq.heappop(heap)
            out.append(ch)
            # 4. Push back the held letter
            if held:
                heapq.heappush(heap, held)
            # 5. Hold out the letter just placed
            held = (c + 1, ch) if c + 1 < 0 else None
        return "".join(out)
