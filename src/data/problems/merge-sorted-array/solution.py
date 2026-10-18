class Solution:
    def merge(self, nums1: List[int], m: int, nums2: List[int], n: int) -> None:
        # 1. Pointers at the back of each list
        i, j = m - 1, n - 1     # the largest value not yet placed, in each list
        write = m + n - 1       # the last slot not yet filled
        # 2. Fill from the back, where the free room is. write is always i + j + 1,
        # so while nums2 still has values, write stays to the right of i and
        # never lands on a nums1 value that hasn't been placed yet.
        while j >= 0:
            # 3. Take the larger value, step its pointer
            if i >= 0 and nums1[i] > nums2[j]:
                nums1[write] = nums1[i]
                i -= 1
            else:
                nums1[write] = nums2[j]
                j -= 1
            # 4. Move write one slot left
            write -= 1
        # Once nums2 is used up, whatever is left of nums1 is already in place.
