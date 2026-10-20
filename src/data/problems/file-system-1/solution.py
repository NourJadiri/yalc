class Node:
    def __init__(self, is_file):
        self.is_file = is_file
        self.children = {}          # name -> Node; only a folder ever has children
        self.content = ""           # only a file has content


class FileSystem:

    def __init__(self):
        # 1. A trie of names: the root folder, and in each folder a dict from child name to node
        self.root = Node(is_file=False)

    def mkdir(self, path: str) -> bool:
        # 2. Walk down from the root, creating each missing folder
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
        # 3. Find the parent folder, never create it
        if path == "/":
            return False
        parent_path, name = self._split(path)
        parent = self._find(parent_path)
        if parent is None or parent.is_file:
            return False
        node = parent.children.get(name)
        if node is None:
            node = parent.children[name] = Node(is_file=True)
        elif not node.is_file:
            return False                # a folder is never overwritten
        node.content = content
        return True

    def read(self, path: str) -> Optional[str]:
        # 4. read and ls are one walk to the node
        node = self._find(path)
        return node.content if node is not None and node.is_file else None

    def ls(self, path: str) -> List[str]:
        node = self._find(path)
        if node is None:
            return []
        if node.is_file:
            return [self._split(path)[1]]
        return sorted(node.children)

    @staticmethod
    def _names(path):
        return [name for name in path.split("/") if name]      # "/" -> [], "/a/b" -> ["a", "b"]

    @staticmethod
    def _split(path):
        parent, name = path.rsplit("/", 1)                      # "/a/b" -> ("/a", "b")
        return parent or "/", name                              # "/a" -> ("/", "a")

    def _find(self, path):
        node = self.root
        for name in self._names(path):
            if node.is_file:            # nothing lives below a file
                return None
            node = node.children.get(name)
            if node is None:
                return None
        return node
