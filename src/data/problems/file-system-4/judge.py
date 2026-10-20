import fnmatch

# Most tests carry their expected outputs. The large generated tests carry
# null and are checked against this simulation instead, so the spec doesn't
# have to store thousands of answers. It is a second model of the file system,
# kept apart from the reference: every node knows its parent and its own name,
# and a change in size is pushed up through the parent links.


class _Node:
    def __init__(self, parent, name, text=None):
        self.parent = parent
        self.name = name
        self.text = text                                # None for a folder
        self.kids = {} if text is None else None        # name -> _Node, folders only
        self.total = 0 if text is None else len(text)


def _names(path):
    return path.split("/")[1:] if path != "/" else []


class _Model:
    def __init__(self):
        self.root = _Node(None, "")

    def node(self, path):
        cur = self.root
        for name in _names(path):
            if cur.kids is None or name not in cur.kids:
                return None
            cur = cur.kids[name]
        return cur

    def bump(self, folder, delta):
        while folder is not None:
            folder.total += delta
            folder = folder.parent

    def mkdir(self, path):
        cur = self.root
        for name in _names(path):
            if cur.kids is None:
                return False
            if name not in cur.kids:
                cur.kids[name] = _Node(cur, name)
            cur = cur.kids[name]
        return cur.kids is not None

    def write(self, path, content):
        if path == "/":
            return False
        head, name = path.rsplit("/", 1)
        parent = self.node(head or "/")
        if parent is None or parent.kids is None:
            return False
        old = parent.kids.get(name)
        if old is None:
            parent.kids[name] = _Node(parent, name, content)
            self.bump(parent, len(content))
            return True
        if old.kids is not None:
            return False
        self.bump(parent, len(content) - old.total)
        old.text, old.total = content, len(content)
        return True

    def read(self, path):
        n = self.node(path)
        return None if n is None else n.text

    def ls(self, path):
        n = self.node(path)
        if n is None:
            return []
        return [n.name] if n.kids is None else sorted(n.kids)

    def size(self, path):
        n = self.node(path)
        return -1 if n is None else n.total

    def rm(self, path):
        n = self.node(path)
        if n is None or n is self.root:
            return False
        del n.parent.kids[n.name]
        self.bump(n.parent, -n.total)
        return True

    def mv(self, src, dst):
        n = self.node(src)
        if n is None or n is self.root or self.node(dst) is not None:
            return False
        head, name = dst.rsplit("/", 1)
        parent = self.node(head or "/")
        if parent is None or parent.kids is None:
            return False
        up = parent
        while up is not None:               # the new parent can't be n or anything inside it
            if up is n:
                return False
            up = up.parent
        del n.parent.kids[n.name]
        self.bump(n.parent, -n.total)
        n.parent, n.name = parent, name
        parent.kids[name] = n
        self.bump(parent, n.total)
        return True

    def find(self, path, pattern, min_size=0):
        start = self.node(path)
        if start is None:
            return []
        out, stack = [], [(start, path)]
        while stack:
            n, p = stack.pop()
            if n.kids is None:
                if n.total >= min_size and fnmatch.fnmatchcase(n.name, pattern):
                    out.append(p)
            else:
                for name, kid in n.kids.items():
                    stack.append((kid, (p if p != "/" else "") + "/" + name))
        out.sort()
        return out


def simulate(ops, args):
    model, out = None, []
    for op, a in zip(ops, args):
        if op == "FileSystem":
            model = _Model()
            out.append(None)
        else:
            out.append(getattr(model, op)(*a))
    return out


def check(got, expected, args):
    ops, xs = args["ops"], args["args"]
    if expected is None:
        expected = simulate(ops, xs)
    if not isinstance(got, list) or len(got) != len(expected):
        return False
    for k, (g, e) in enumerate(zip(got, expected)):
        if not same(g, e):
            return ("Call #" + str(k) + " " + ops[k] + "(" + ", ".join(show(v, 80) for v in xs[k]) + ")"
                    + " returned " + show(g, 200) + ", expected " + show(e, 200) + ".")
    return True
