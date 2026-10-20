# Drives the store the way a crash really works. run_design builds a Disk and
# hands it to KVStore(disk). On every "crash" it throws the object away and
# builds a fresh KVStore(disk) on the same disk, so only what the store put on
# the disk survives: its log and its snapshot. The disk keeps copies of what it
# is given and hands back copies, so nothing on it can stay shared with a
# store's memory.
#
# Most tests carry their expected outputs. The large generated tests carry
# null and are checked against simulate() instead, so the spec doesn't have to
# store a hundred thousand answers. simulate() models a crash its own way: the
# committed state is exactly what is left after every open transaction rolls
# back. Each open transaction remembers what every key it touched held before
# its first change; a commit merges that into the parent (smaller into larger).
# checkpoint() only has to say how many keys are committed: a key touched by an
# open transaction is committed with the value the outermost such map holds.

_ATOMS = {str, int, float, bool, type(None)}


def _copy(x):
    """A deep copy of plain data, as if it had been written out and read back."""
    if type(x) in _ATOMS:
        return x
    if isinstance(x, (list, tuple)):
        items = [_copy(v) for v in x]
        return tuple(items) if isinstance(x, tuple) else items
    if isinstance(x, dict):
        return {_copy(k): _copy(v) for k, v in x.items()}
    raise TypeError("the disk stores plain data (numbers, strings, None, and lists, tuples or dicts "
                    "of them), not " + type(x).__name__)


class _Kept:
    """A record with something mutable inside, kept as a private copy."""
    __slots__ = ("value",)

    def __init__(self, value):
        self.value = value


class Disk:
    """What survives a crash: an append-only log of records, and a snapshot."""

    def __init__(self):
        self._log = []
        self._kept = 0                          # how many records needed a private copy
        self._snapshot = None

    def append(self, record):
        t = type(record)
        if (t is tuple and len(record) == 2 and type(record[0]) in _ATOMS and type(record[1]) in _ATOMS
                or t in _ATOMS or t is tuple and _ATOMS.issuperset(map(type, record))):
            self._log.append(record)            # can't change, so it needs no copy
        else:
            self._log.append(_Kept(_copy(record)))
            self._kept += 1

    def read_log(self):
        if not self._kept:
            return list(self._log)
        return [_copy(r.value) if type(r) is _Kept else r for r in self._log]

    def clear_log(self):
        self._log = []
        self._kept = 0

    def write_snapshot(self, data):
        if (type(data) is dict and _ATOMS.issuperset(map(type, data))
                and _ATOMS.issuperset(map(type, data.values()))):
            self._snapshot = dict(data)         # only atoms inside: a flat copy is a full copy
        else:
            self._snapshot = _Kept(_copy(data))

    def read_snapshot(self):
        snap = self._snapshot
        if snap is None:
            return None
        return dict(snap) if type(snap) is dict else _copy(snap.value)


def run_design(cls, ops, args):
    disk = Disk()
    store, out = None, []
    for k, op in enumerate(ops):
        try:
            if k == 0 or op == "crash":
                store = None                    # a crash leaves nothing but the disk
                store = cls(disk)
                out.append(None)
            else:
                res = getattr(store, op)(*args[k])
                out.append(res if type(res) in _ATOMS else plain(res))
        except Exception as e:
            if k == 0:
                e.add_note("Raised during call #0, KVStore(disk): the store is built with the disk.")
            elif op == "crash":
                e.add_note("Raised during call #" + str(k) + ", building a new KVStore(disk) after the crash.")
            else:
                e.add_note("Raised during call #" + str(k) + " (" + op + ").")
            raise
    return out


def simulate(ops, args):
    data, holders, out = {}, {}, []
    first = []                          # per open transaction: key -> value before (None if absent)

    def put(key, value):
        if key in data:
            holders[data[key]] -= 1
            del data[key]
        if value is not None:
            data[key] = value
            holders[value] = holders.get(value, 0) + 1

    def touch(key):
        if first and key not in first[-1]:
            first[-1][key] = data.get(key)

    def rollback():
        for key, value in first.pop().items():
            put(key, value)

    for op, a in zip(ops, args):
        res = None
        if op == "set":
            touch(a[0])
            put(a[0], a[1])
        elif op == "get":
            res = data.get(a[0])
        elif op == "delete":
            res = a[0] in data
            if res:
                touch(a[0])
                put(a[0], None)
        elif op == "count":
            res = holders.get(a[0], 0)
        elif op == "begin":
            first.append({})
        elif op == "rollback":
            res = bool(first)
            if res:
                rollback()
        elif op == "commit":
            res = bool(first)
            if res:
                child = first.pop()
                if first:
                    parent = first[-1]
                    if len(child) > len(parent):
                        child.update(parent)        # the parent's "before" is older: it wins
                        first[-1] = child
                    else:
                        for key, value in child.items():
                            parent.setdefault(key, value)
        elif op == "crash":
            while first:
                rollback()
        elif op == "recover":
            res = len(data)
        elif op == "checkpoint":
            res, seen = len(data), set()
            for level in first:                     # outermost first
                for key, before in level.items():
                    if key not in seen:
                        seen.add(key)
                        res += (before is not None) - (key in data)
        out.append(res)
    return out


def check(got, expected, args):
    ops, xs = args["ops"], args["args"]
    if expected is None:
        expected = simulate(ops, xs)
    if not isinstance(got, list) or len(got) != len(expected):
        return False
    for k, (g, e) in enumerate(zip(got, expected)):
        if not same(g, e):
            return ("Call #" + str(k) + " " + ops[k] + "(" + ", ".join(map(show, xs[k])) + ")"
                    + " returned " + show(g) + ", expected " + show(e) + ".")
    return True
