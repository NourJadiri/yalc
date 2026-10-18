class RandomizedSet:

    def __init__(self):
        # 1. Members in a list, positions in a dict
        self.vals = []    # the members, in no particular order: getRandom rolls an index here
        self.pos = {}     # member -> its index in self.vals

    def insert(self, val: int) -> bool:
        # 2. Add only a new member, at the end
        if val in self.pos:
            return False
        self.pos[val] = len(self.vals)
        self.vals.append(val)
        return True

    def remove(self, val: int) -> bool:
        # 3. Forget val, keeping the index it had
        i = self.pos.pop(val, None)
        if i is None:
            return False
        # 4. Fill the hole with the last element
        last = self.vals.pop()
        # If val wasn't the last element, the popped one fills its hole —
        # and its recorded index has to follow it there.
        if i < len(self.vals):
            self.vals[i] = last
            self.pos[last] = i
        return True

    def getRandom(self) -> int:
        # 5. A uniform slot is a uniform member
        return random.choice(self.vals)
