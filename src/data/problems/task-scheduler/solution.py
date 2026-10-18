class Solution:
    def leastInterval(self, tasks: List[str], n: int) -> int:
        # 1. Count the copies of each label
        counts = Counter(tasks).values()
        # 2. The top count, and how many labels tie
        top = max(counts)
        ties = sum(1 for c in counts if c == top)
        # 3. The most frequent label forces top - 1 frames of n + 1 slots, then a
        # final frame holding the last copy of every label tied at `top`.
        # If the other tasks overflow those frames, nothing ever idles and the
        # answer is simply the number of tasks.
        return max(len(tasks), (top - 1) * (n + 1) + ties)
