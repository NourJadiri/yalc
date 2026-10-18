# 1. A node: children and an is_word flag
class TrieNode:
    def __init__(self):
        self.children = {}      # letter -> TrieNode
        self.is_word = False    # does an inserted word end exactly here?


class Trie:

    def __init__(self):
        self.root = TrieNode()

    # 2. Walk down, creating missing nodes
    def insert(self, word: str) -> None:
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_word = True

    # 3. search: the node must end a word
    def search(self, word: str) -> bool:
        node = self._find(word)
        return node is not None and node.is_word

    # 4. startsWith: reaching the node is enough
    def startsWith(self, prefix: str) -> bool:
        return self._find(prefix) is not None

    def _find(self, s: str) -> Optional[TrieNode]:
        # 5. Read-only on purpose: a lookup that falls off the trie must not
        # leave nodes behind, or later startsWith calls would see them.
        node = self.root
        for ch in s:
            node = node.children.get(ch)
            if node is None:
                return None
        return node
