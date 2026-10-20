# The obvious version: begin() saves a full copy of the data, rollback() puts
# that copy back, commit() throws it away. count() looks at every key.


class KVStore:
    def __init__(self):
        self.data = {}
        self.saved = []                 # one full copy per open transaction

    def set(self, key, value):
        self.data[key] = value

    def get(self, key):
        return self.data.get(key)

    def delete(self, key):
        if key in self.data:
            del self.data[key]
            return True
        return False

    def count(self, value):
        return sum(1 for v in self.data.values() if v == value)

    def begin(self):
        self.saved.append(dict(self.data))

    def rollback(self):
        if not self.saved:
            return False
        self.data = self.saved.pop()
        return True

    def commit(self):
        if not self.saved:
            return False
        self.saved.pop()                # the parent's copy still predates these changes
        return True
