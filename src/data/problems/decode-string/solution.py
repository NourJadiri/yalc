class Solution:
    def decodeString(self, s: str) -> str:
        # 1. Saved depths, plus this depth's text and count
        stack = []           # one frame per open bracket: (text before it, its count)
        cur, num = [], 0     # pieces of the text at this depth; the count being read
        # 2. Scan once: a digit extends the count
        for ch in s:
            if ch.isdigit():
                num = num * 10 + int(ch)        # counts can run to several digits
            elif ch == "[":
                # 3. Open a depth: set the old one aside
                stack.append((cur, num))        # set this depth aside...
                cur, num = [], 0                # ...and start the inner text fresh
            elif ch == "]":
                # 4. Close a depth: repeat its text k times
                prev, k = stack.pop()
                prev.append("".join(cur) * k)   # inner text, k times, after what came before
                cur = prev
            else:
                # 5. A letter joins the current depth
                cur.append(ch)
        # 6. Balanced input leaves the stack empty
        return "".join(cur)
