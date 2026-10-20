class Node:
    def __init__(self, is_file):
        self.is_file = is_file
        self.children = {}          # name -> Node; only a folder ever has children
        self.content = ""           # only a file has content
        # 1. A file's size is its length; a folder's is the total of every file beneath it
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
        # 2. Find the parent folder, never create it, and keep every node on the way:
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
        # 3. Each of them changes by the same amount: new length minus old (0 for a new file)
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
        # 4. The total is already stored: walk to the node and read it
        node = self._find(path)
        return node.size if node is not None else -1

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
