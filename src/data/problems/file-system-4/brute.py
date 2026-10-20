import re

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

    def _exists(self, path):
        return path in self.folders or path in self.files

    def _below(self, path):
        # path itself and every entry under it
        return lambda p: p == path or p.startswith(path + "/")

    def rm(self, path):
        if path == "/" or not self._exists(path):
            return False
        gone = self._below(path)
        self.folders = {p for p in self.folders if not gone(p)}
        self.files = {p: c for p, c in self.files.items() if not gone(p)}
        return True

    def mv(self, src, dst):
        if src == "/" or not self._exists(src) or self._exists(dst):
            return False
        if self._parent(dst) not in self.folders:
            return False
        if src in self._down_to(dst):          # src is one of dst's folders
            return False
        moving = self._below(src)
        rename = lambda p: dst + p[len(src):] if moving(p) else p
        self.folders = {rename(p) for p in self.folders}
        self.files = {rename(p): c for p, c in self.files.items()}
        return True

    def find(self, path, pattern, min_size=0):
        if not self._exists(path):
            return []
        # * is any run of characters, ? exactly one, everything else itself
        regex = "".join(".*" if ch == "*" else "." if ch == "?" else re.escape(ch) for ch in pattern)
        under = (lambda p: True) if path == "/" else self._below(path)
        return sorted(p for p, c in self.files.items()
                      if under(p) and len(c) >= min_size and re.fullmatch(regex, p.rsplit("/", 1)[1]))
