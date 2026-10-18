class Solution:
    def findJudge(self, n: int, trust: List[List[int]]) -> int:
        # 1. Index 0 is unused so that resident p lives at index p.
        trusted_by = [0] * (n + 1)   # arrows coming in: how many trust p
        trusts = [0] * (n + 1)       # arrows going out: how many p trusts
        # 2. Count arrows in and out
        for a, b in trust:
            trusts[a] += 1
            trusted_by[b] += 1
        # 3. Scan the residents for the judge
        for person in range(1, n + 1):
            if trusted_by[person] == n - 1 and trusts[person] == 0:
                return person
        return -1
