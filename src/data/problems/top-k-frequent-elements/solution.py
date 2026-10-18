class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        # 1. Count each value
        count = Counter(nums)
        # 2. No value can occur more than len(nums) times, so a frequency is a
        # valid index: buckets[f] holds every value seen exactly f times.
        buckets = [[] for _ in range(len(nums) + 1)]
        # 3. File each value under its frequency
        for x, f in count.items():
            buckets[f].append(x)
        # 4. Walk from the top bucket, collecting values
        out = []
        for f in range(len(nums), 0, -1):   # highest frequency first
            for x in buckets[f]:
                out.append(x)
                if len(out) == k:
                    return out
        return out
