class Solution:
    def openLock(self, deadends: List[str], target: str) -> int:
        # 1. Dead ends behave exactly like codes we've already visited: never
        # enter them. So they go straight into the seen set.
        seen = set(deadends)
        if "0000" in seen:
            return -1
        seen.add("0000")
        queue = deque(["0000"])
        moves = 0
        # 2. Work through the queue layer by layer
        while queue:
            for _ in range(len(queue)):          # one BFS layer = one more move
                code = queue.popleft()
                if code == target:
                    return moves
                # 3. Turn each wheel up and down
                for i in range(4):
                    digit = int(code[i])
                    for turn in (1, -1):         # each wheel turns either way and wraps
                        nxt = code[:i] + str((digit + turn) % 10) + code[i + 1:]
                        # 4. Queue each new code once
                        if nxt not in seen:
                            seen.add(nxt)
                            queue.append(nxt)
            # 5. One more move per layer
            moves += 1
        return -1
