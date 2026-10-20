class KVStore:

    def __init__(self):
        # 1. The data, and beside it how many keys hold each value
        self.data = {}                          # key -> value
        self.holders = collections.Counter()    # value -> number of keys holding it

    def set(self, key: str, value: int) -> None:
        # 2. Every change goes through _write, so the two maps never drift apart
        self._write(key, value)

    def get(self, key: str) -> int | None:
        return self.data.get(key)

    def delete(self, key: str) -> bool:
        if key not in self.data:
            return False
        self._write(key, None)
        return True

    def count(self, value: int) -> int:
        # 3. A lookup, never a scan
        return self.holders[value]

    def _write(self, key, value):
        # 4. Store value under key (None removes the key). The key leaves its
        # old value's count before it joins the new one's.
        old = self.data.get(key)
        if old is not None:
            self.holders[old] -= 1
        if value is None:
            del self.data[key]
        else:
            self.data[key] = value
            self.holders[value] += 1
