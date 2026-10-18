class Solution:
    def floodFill(self, image: List[List[int]], sr: int, sc: int, color: int) -> List[List[int]]:
        # 1. The colour the region has now
        start = image[sr][sc]
        if start == color:
            # 2. Nothing would change. Worse, repainting is how we mark a pixel as
            # done, and a pixel "repainted" to its own colour still looks
            # unvisited, so the search would bounce between pixels forever.
            return image
        rows, cols = len(image), len(image[0])

        def fill(r, c):
            # 3. Stop off the edge of the picture, or at any pixel outside the region.
            if r < 0 or r >= rows or c < 0 or c >= cols or image[r][c] != start:
                return
            # 4. Paint it, then spread to the four neighbours
            image[r][c] = color     # paint it; this also marks it visited
            fill(r + 1, c)
            fill(r - 1, c)
            fill(r, c + 1)
            fill(r, c - 1)

        # 5. Start from the clicked pixel
        fill(sr, sc)
        return image
