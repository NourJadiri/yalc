class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        # 1. Start with zeros and an empty stack
        answer = [0] * len(temperatures)
        # Indices of days still waiting for a warmer day. Their temperatures
        # never rise from bottom to top: a warmer day would have resolved them.
        stack = []
        # 2. Sweep; pop each colder waiting day
        for i, t in enumerate(temperatures):
            while stack and temperatures[stack[-1]] < t:   # strictly warmer only
                j = stack.pop()
                # 3. Record how long j waited
                answer[j] = i - j
            # 4. Push today: it waits now too
            stack.append(i)
        return answer                 # days left on the stack keep their 0
