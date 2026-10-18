class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        # 1. Sort by start; collect merged blocks
        merged = []
        for start, end in sorted(intervals, key=lambda iv: iv[0]):
            # 2. Sorted by start, an interval can only overlap the LAST merged
            # block: every earlier block ended before that one began.
            if merged and start <= merged[-1][1]:
                # 3. Overlap: extend the last block
                merged[-1][1] = max(merged[-1][1], end)   # it may sit entirely inside
            else:
                # 4. Gap: start a new block
                merged.append([start, end])
        return merged
