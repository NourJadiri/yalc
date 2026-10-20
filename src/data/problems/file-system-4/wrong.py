# The matcher's * always takes at least one character, never none: "app*.log"
# misses "app.log", "*.txt" misses ".txt", and "a*" misses "a".
class Node:
    def __init__(self, is_file):
        self.is_file = is_file
        self.children = {}          # name -> Node; only a folder ever has children
        self.content = ""           # only a file has content
        # A file's size is its length; a folder's is the total of every file beneath it
        self.size = 0


class FileSystem:

    def __init__(self):
        # A trie of names: the root folder, and in each folder a dict from child name to node
        self.root = Node(is_file=False)

    def mkdir(self, path: str) -> bool:
        # Walk down from the root, creating each missing folder. A new folder is empty,
        # so no size changes.
        node = self.root
        for name in self._names(path):
            child = node.children.get(name)
            if child is None:
                child = node.children[name] = Node(is_file=False)
            elif child.is_file:
                # Nothing was created on the way: every folder above a file already exists.
                return False
            node = child
        return True

    def write(self, path: str, content: str) -> bool:
        if path == "/":
            return False
        parent_path, name = self._split(path)
        # Find the parent folder, never create it, and keep every node on the way:
        # those are exactly the folders whose totals include this file.
        chain = self._chain(parent_path)
        if chain is None or chain[-1].is_file:
            return False
        parent = chain[-1]
        node = parent.children.get(name)
        if node is None:
            node = parent.children[name] = Node(is_file=True)
        elif not node.is_file:
            return False                # a folder is never overwritten
        # Each of them changes by the same amount: new length minus old (0 for a new file)
        delta = len(content) - node.size
        for folder in chain:
            folder.size += delta
        node.content, node.size = content, len(content)
        return True

    def read(self, path: str) -> Optional[str]:
        # read and ls are one walk to the node
        node = self._find(path)
        return node.content if node is not None and node.is_file else None

    def ls(self, path: str) -> List[str]:
        node = self._find(path)
        if node is None:
            return []
        if node.is_file:
            return [self._split(path)[1]]
        return sorted(node.children)

    def size(self, path: str) -> int:
        # The total is already stored: walk to the node and read it
        node = self._find(path)
        return node.size if node is not None else -1

    def rm(self, path: str) -> bool:
        # The root stays, and a missing path has nothing to remove
        if path == "/":
            return False
        chain = self._chain(path)
        if chain is None:
            return False
        # Unlink the node: everything below it goes with it, untouched. Then take
        # its size out of every folder above it.
        node = chain[-1]
        del chain[-2].children[self._split(path)[1]]
        for folder in chain[:-1]:
            folder.size -= node.size
        return True

    def mv(self, src: str, dst: str) -> bool:
        # Check every reason to refuse before changing anything. The slash matters:
        # "/ab" starts with "/a" but isn't inside it.
        if src == "/" or dst.startswith(src + "/"):
            return False
        src_chain = self._chain(src)
        if src_chain is None or self._find(dst) is not None:
            return False
        dst_parent, dst_name = self._split(dst)
        dst_chain = self._chain(dst_parent)
        if dst_chain is None or dst_chain[-1].is_file:
            return False
        # Re-link the node under its new parent and name, and move its size from the
        # old chain of folders to the new one. Nothing inside it is touched.
        node = src_chain[-1]
        del src_chain[-2].children[self._split(src)[1]]
        for folder in src_chain[:-1]:
            folder.size -= node.size
        dst_chain[-1].children[dst_name] = node
        for folder in dst_chain:
            folder.size += node.size
        return True

    def find(self, path: str, pattern: str, min_size: int = 0) -> List[str]:
        # Start at path itself: missing means no matches, and a file there is
        # checked on its own
        node = self._find(path)
        if node is None:
            return []
        found = []
        # Walk the subtree with a stack, carrying each node's full path and name
        stack = [(path, self._split(path)[1], node)]
        while stack:
            full, name, node = stack.pop()
            if node.is_file:
                # Keep a file that is big enough and whose name matches
                if node.size >= min_size and self._match(name, pattern):
                    found.append(full)
            else:
                prefix = "" if full == "/" else full
                for child_name, child in node.children.items():
                    stack.append((prefix + "/" + child_name, child_name, child))
        # Sort as plain strings: "/a-b" comes before "/a/x", whatever order the walk took
        return sorted(found)

    @staticmethod
    def _match(name, pattern):
        i = j = 0
        star, mark = -1, 0
        while i < len(name):
            if j < len(pattern) and pattern[j] == "*":
                star, mark = j, i + 1           # takes name[i] at once
                i += 1
                j += 1
            elif j < len(pattern) and pattern[j] in ("?", name[i]):
                i += 1
                j += 1
            elif star >= 0:
                mark += 1
                i, j = mark, star + 1
            else:
                return False
        return j == len(pattern)

    @staticmethod
    def _names(path):
        return [name for name in path.split("/") if name]      # "/" -> [], "/a/b" -> ["a", "b"]

    @staticmethod
    def _split(path):
        parent, name = path.rsplit("/", 1)                      # "/a/b" -> ("/a", "b")
        return parent or "/", name                              # "/a" -> ("/", "a")

    def _chain(self, path):
        # Every node from the root down to path, or None if path doesn't exist
        chain = [self.root]
        for name in self._names(path):
            node = chain[-1]
            if node.is_file or name not in node.children:
                return None             # nothing lives below a file
            chain.append(node.children[name])
        return chain

    def _find(self, path):
        chain = self._chain(path)
        return chain[-1] if chain else None
