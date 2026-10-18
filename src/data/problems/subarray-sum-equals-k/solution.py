class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        # 1. seen[p] = how many prefixes so far sum to p. The empty prefix (sum 0)
        # is there from the start, so subarrays beginning at index 0 count too.
        seen = {0: 1}
        # 2. Walk the list with a running prefix
        prefix = count = 0
        for x in nums:
            prefix += x
            # 3. A subarray ending here sums to k exactly when an earlier prefix
            # equals prefix - k. Look up BEFORE storing the current prefix, or
            # k == 0 would count the empty subarray at every step.
            count += seen.get(prefix - k, 0)
            # 4. Only now store the current prefix
            seen[prefix] = seen.get(prefix, 0) + 1
        return count
