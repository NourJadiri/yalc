class Solution:
    def minMeetingRooms(self, intervals: List[List[int]]) -> int:
        # 1. Min-heap of studio end times
        ends = []          # min-heap: the end time of the session in each studio opened so far
        # 2. Take bookings in start order
        for start, end in sorted(intervals):
            # 3. Is the earliest-ending studio free by now?
            if ends and ends[0] <= start:
                heapreplace(ends, end)     # the earliest-free studio is free by now: reuse it
            # 4. Otherwise open a new studio
            else:
                heappush(ends, end)        # every studio is busy: open another
        # 5. The heap never shrinks, so its final size is the most studios ever needed at once.
        return len(ends)
