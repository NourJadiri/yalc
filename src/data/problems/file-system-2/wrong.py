# On an overwrite, every folder above the file gains the new length, but the
# old length is never taken back out. The file's own size is right; the
# folders above it only ever grow.
class Node:
    def __init__(self, is_file):
        self.is_file = is_file
        self.children = {}
        self.content = ""
        self.size = 0


class FileSystem:
    def __init__(self):
        self.root = Node(False)

    def mkdir(self, path):
        node = self.root
        for name in [n for n in path.split("/") if n]:
            child = node.children.get(name)
            if child is None:
                child = node.children[name] = Node(False)
            elif child.is_file:
                return False
            node = child
        return True

    def write(self, path, content):
        if path == "/":
            return False
        head, name = path.rsplit("/", 1)
        chain = self._chain(head or "/")
        if chain is None or chain[-1].is_file:
            return False
        node = chain[-1].children.get(name)
        if node is None:
            node = chain[-1].children[name] = Node(True)
        elif not node.is_file:
            return False
        for folder in chain:
            folder.size += len(content)         # forgets to subtract node.size
        node.content, node.size = content, len(content)
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

    def size(self, path):
        node = self._find(path)
        return node.size if node is not None else -1

    def _chain(self, path):
        chain = [self.root]
        for name in [n for n in path.split("/") if n]:
            if chain[-1].is_file or name not in chain[-1].children:
                return None
            chain.append(chain[-1].children[name])
        return chain

    def _find(self, path):
        chain = self._chain(path)
        return chain[-1] if chain else None
