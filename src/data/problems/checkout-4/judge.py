# Most tests carry their expected outputs. The large ones would need tens of
# thousands, so they carry null and are checked against this plain model of
# the checkout instead. It keeps, per sku, a stack of line prices and the few
# sums a promotion needs, plus a running subtotal, so it stays linear however
# long the test is. (No large test prints a receipt.)


def simulate(ops, args):
    price, per_kg, promo = {}, set(), {}        # promo: sku -> (n, deal) or percent
    units, gross, saved, stack = {}, {}, {}, {}   # per sku in the basket; stack holds (qty, line price)
    coupons, sub, out = [], 0, []

    def cost(s):
        if s not in units:
            return 0
        p = promo.get(s)
        if p is None:
            return gross[s]
        if isinstance(p, tuple):
            n, deal = p
            return gross[s] - units[s] // n * (n * price[s] - deal)
        return gross[s] - saved[s]

    def own_saving(s, lp):
        p = promo.get(s)
        return (lp * p + 50) // 100 if isinstance(p, int) else 0

    for op, a in zip(ops, args):
        if op in ("add_product", "add_weighed"):
            s = a[0]
            out.append(s not in price)
            if s not in price:
                price[s] = a[2]
                if op == "add_weighed":
                    per_kg.add(s)
        elif op == "scan":
            s = a[0]
            q = a[1] if len(a) > 1 else 1
            if s not in price:
                out.append(False)
                continue
            lp = (price[s] * q + 500) // 1000 if s in per_kg else price[s] * q
            before = cost(s)
            units[s] = units.get(s, 0) + q
            gross[s] = gross.get(s, 0) + lp
            saved[s] = saved.get(s, 0) + own_saving(s, lp)
            stack.setdefault(s, []).append((q, lp))
            sub += cost(s) - before
            out.append(True)
        elif op == "void":
            s = a[0]
            if not stack.get(s):
                out.append(False)
                continue
            before = cost(s)
            q, lp = stack[s].pop()
            units[s] -= q
            gross[s] -= lp
            saved[s] -= own_saving(s, lp)
            sub += cost(s) - before
            out.append(True)
        elif op in ("add_multibuy", "add_percent_off"):
            s = a[0]
            if op == "add_multibuy":
                n, deal = a[1], a[2]
                ok = s in price and s not in per_kg and n >= 2 and deal < n * price[s]
                new = (n, deal)
            else:
                ok = s in price and 1 <= a[1] <= 100
                new = a[1]
            ok = ok and s not in promo
            out.append(ok)
            if ok:
                before = cost(s)
                promo[s] = new
                if s in units:
                    saved[s] = sum(own_saving(s, lp) for _, lp in stack[s])
                sub += cost(s) - before
        elif op == "add_spend_discount":
            t, amt = a
            out.append(1 <= amt <= t)
            if 1 <= amt <= t:
                coupons.append((t, amt))
        elif op == "total":
            out.append(sub - max([amt for t, amt in coupons if sub >= t], default=0))
        else:
            out.append(None)
    return out


def check(got, expected, args):
    ops, xs = args["ops"], args["args"]
    if expected is None:
        expected = simulate(ops, xs)
    if not isinstance(got, list) or len(got) != len(expected):
        return "Expected " + str(len(expected)) + " outputs, one per operation."
    for k, (g, e) in enumerate(zip(got, expected)):
        if (g != e or type(g) is not type(e)) and not same(g, e):
            return ("Call #" + str(k) + " " + ops[k] + "(" + ", ".join(map(show, xs[k])) + ")"
                    + " returned " + show(g, 200) + ", expected " + show(e, 200) + ".")
    return True
