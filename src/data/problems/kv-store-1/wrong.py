# The classic miss: set() counts the new value but never takes the key off the
# value it held before. A key moved from 3 to 8 still counts toward 3.
import collections


class KVStore:
    def __init__(self):
        self.data = {}
        self.holders = collections.Counter()

    def set(self, key, value):
        self.data[key] = value
        self.holders[value] += 1

    def get(self, key):
        return self.data.get(key)

    def delete(self, key):
        if key not in self.data:
            return False
        self.holders[self.data.pop(key)] -= 1
        return True

    def count(self, value):
        return self.holders[value]
