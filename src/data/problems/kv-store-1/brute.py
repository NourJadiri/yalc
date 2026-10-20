# The obvious version: one dict, and count() looks at every key.


class KVStore:
    def __init__(self):
        self.data = {}

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
