class Solution:
    def mostCommonWord(self, paragraph: str, banned: List[str]) -> str:
        # 1. Lowercase every letter and turn everything else into a space, so a
        # plain split() finds exactly the words -- "red,blue" and "can't" too.
        cleaned = "".join(ch.lower() if ch.isalpha() else " " for ch in paragraph)
        # 2. A set makes each banned check O(1)
        banned_set = set(banned)
        # 3. Split into words and count the allowed ones
        counts = Counter(w for w in cleaned.split() if w not in banned_set)
        # 4. The most frequent word wins
        return counts.most_common(1)[0][0]
