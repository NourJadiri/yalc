# mkdir never looks at what it walks through. An existing file is treated as a
# folder: mkdir("/notes") on a file returns true, and mkdir("/notes/old")
# quietly hangs a folder under the file.
class Node:
    def __init__(self, is_file):
        self.is_file = is_file
        self.children = {}
        self.content = ""


class FileSystem:
    def __init__(self):
        self.root = Node(False)

    def mkdir(self, path):
        node = self.root
        for name in [n for n in path.split("/") if n]:
            node = node.children.setdefault(name, Node(False))
        return True

    def write(self, path, content):
        if path == "/":
            return False
        head, name = path.rsplit("/", 1)
        parent = self._find(head or "/")
        if parent is None or parent.is_file:
            return False
        node = parent.children.get(name)
        if node is None:
            node = parent.children[name] = Node(True)
        elif not node.is_file:
            return False
        node.content = content
        return True

    def read(self, path):
        node = self._find(path)
        return node.content if node is not None and node.is_file else None

    def ls(self, path):
        node = self._find(path)
        if node is None:
            return []
        if node.is_file:
            return [path.rsplit("/", 1)[1]]
        return sorted(node.children)

    def _find(self, path):
        node = self.root
        for name in [n for n in path.split("/") if n]:
            if node.is_file:
                return None
            node = node.children.get(name)
            if node is None:
                return None
        return node
