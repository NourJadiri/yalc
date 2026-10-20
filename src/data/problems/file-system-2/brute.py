# No tree at all: a set of folder paths and a dict of file paths. Every
# question is answered by looking the path up, or by scanning everything.

class FileSystem:
    def __init__(self):
        self.folders = {"/"}
        self.files = {}

    @staticmethod
    def _parent(path):
        return path.rsplit("/", 1)[0] or "/"

    @staticmethod
    def _down_to(path):
        # "/a/b/c" -> ["/a", "/a/b", "/a/b/c"]
        names = path.split("/")[1:]
        return ["/" + "/".join(names[:k]) for k in range(1, len(names) + 1)]

    def mkdir(self, path):
        if path == "/":
            return True
        chain = self._down_to(path)
        if any(p in self.files for p in chain):
            return False
        self.folders.update(chain)
        return True

    def write(self, path, content):
        if path == "/" or path in self.folders or self._parent(path) not in self.folders:
            return False
        self.files[path] = content
        return True

    def read(self, path):
        return self.files.get(path)

    def ls(self, path):
        if path in self.files:
            return [path.rsplit("/", 1)[1]]
        if path not in self.folders:
            return []
        everything = self.folders | set(self.files)
        return sorted(p.rsplit("/", 1)[1] for p in everything if p != "/" and self._parent(p) == path)

    def size(self, path):
        if path in self.files:
            return len(self.files[path])
        if path not in self.folders:
            return -1
        inside = "/" if path == "/" else path + "/"
        return sum(len(c) for p, c in self.files.items() if p.startswith(inside))
