# Most tests carry their expected outputs. The large ones would need more than
# a thousand each, so they carry null and are checked against this plain model of
# the checkout instead: a dict of unit prices and a running total.


def simulate(ops, args):
    price, total, out = {}, 0, []
    for op, a in zip(ops, args):
        if op == "add_product":
            sku, _, cents = a
            out.append(sku not in price)
            price.setdefault(sku, cents)
        elif op == "scan":
            sku = a[0]
            qty = a[1] if len(a) > 1 else 1
            if sku in price:
                total += price[sku] * qty
            out.append(sku in price)
        elif op == "total":
            out.append(total)
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
