class Solution:
    def accountsMerge(self, accounts: List[List[str]]) -> List[List[str]]:
        # 1. One union-find set per account
        parent = list(range(len(accounts)))     # union-find over account indices

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]   # path halving
                x = parent[x]
            return x

        # 2. Union accounts that share an email
        owner = {}                              # email -> first account seen holding it
        for i, account in enumerate(accounts):
            for email in account[1:]:
                if email in owner:
                    parent[find(i)] = find(owner[email])   # shared email: same person
                else:
                    owner[email] = i

        # 3. Each distinct email sits in `owner` once, so this also drops repeats.
        emails_of = defaultdict(list)           # root account -> that person's emails
        for email, i in owner.items():
            emails_of[find(i)].append(email)
        # 4. Name first, then the emails sorted
        return [[accounts[root][0]] + sorted(emails) for root, emails in emails_of.items()]
