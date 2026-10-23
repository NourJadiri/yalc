import type { Day, Diff, NonEmpty, Problem } from "../types";

/** One step of a build: an in-app original whose bank directory is `<build>-<n>`. */
const S = (id: string, n: string, drill: string, diff: Diff): Problem => ({ id, n, drill, diff, orig: true });

// Station ids ("e1".."e7") and problem ids never collide with the other lines' ids.
// Every station is one build in steps: the workspace opens step N on the code of step N-1.
export const ENG_PLAN: NonEmpty<Day> = [
  { id:"e1", d:1, stn:"Checkout", ph:"ds", steps:true,
    name:"SIG's OOP round: a grocery till",
    note:"Candidates report SIG's final round as an hour of object-oriented design: a grocery checkout with items, produce by weight, coupons and a receipt. Build exactly that, one feature at a time, and keep the classes clean enough to take the next one.",
    ritual:"Before coding, sketch the classes: product, line, promotion, receipt. Say what each one knows and who computes the total.",
    probs:[
      S("co1", "Scan and total", "checkout-1", "E"),
      S("co2", "Produce by weight", "checkout-2", "E"),
      S("co3", "Promotions", "checkout-3", "M"),
      S("co4", "Voids and the receipt", "checkout-4", "M"),
    ]},
  { id:"e2", d:2, stn:"Rate Limiter", ph:"ds", steps:true,
    name:"The gate in front of a voice API",
    note:"ElevenLabs sells its API by the character and caps how many requests each plan can run at once. Build that gate: a token bucket, then costs and stacked limits, then concurrency slots that time out, then monthly quotas.",
    ritual:"Say the two numbers a bucket keeps per client, and how a request's timestamp turns into tokens, before writing a line.",
    probs:[
      S("rl1", "Token bucket", "rate-limiter-1", "M"),
      S("rl2", "Costs and stacked limits", "rate-limiter-2", "M"),
      S("rl3", "Concurrency slots", "rate-limiter-3", "H"),
      S("rl4", "Plans and monthly quotas", "rate-limiter-4", "M"),
    ]},
  { id:"e3", d:3, stn:"Key-Value Store", ph:"ds", steps:true,
    name:"A tiny database that survives a crash",
    note:"Every trading system and every API keeps state that has to stay right through rollbacks and crashes. A key-value store, then nested transactions, then a write-ahead log, then checkpoints: the core of Redis and of every storage engine.",
    ritual:"Write the undo-log entry for a set and for a delete, then say what a nested commit does with its entries.",
    probs:[
      S("kv1", "Store and count", "kv-store-1", "E"),
      S("kv2", "Nested transactions", "kv-store-2", "M"),
      S("kv3", "Crash recovery", "kv-store-3", "M"),
      S("kv4", "Checkpoints", "kv-store-4", "H"),
    ]},
  { id:"e4", d:4, stn:"Voice Stream", ph:"ds", steps:true,
    name:"A voice agent's ears: packets in, audio out",
    note:"Reported from an ElevenLabs coding screen: drop duplicate packets with a sliding window of sequence numbers. Then it grows into what a voice agent's player needs: play in order, give up on what's too late, and cut off the old answer when the user interrupts.",
    ritual:"Draw the window on paper: the top, the oldest sequence number you still remember, and what happens to a packet that lands just outside.",
    probs:[
      S("vs1", "Drop duplicates", "voice-stream-1", "M"),
      S("vs2", "Play in order", "voice-stream-2", "M"),
      S("vs3", "Latency budget", "voice-stream-3", "M"),
      S("vs4", "Interruptions", "voice-stream-4", "H"),
    ]},
  { id:"e5", d:5, stn:"File System", ph:"graphs", steps:true,
    name:"A tree that knows its own size",
    note:"Paths are a trie, sizes are sums you keep current instead of recounting, and a move is one re-link if you refuse the one move that breaks the tree. Then search it the way find does.",
    ritual:"Draw a node: children, size, parent. Then say which nodes a write of k bytes has to touch.",
    probs:[
      S("fs1", "Folders and files", "file-system-1", "M"),
      S("fs2", "Sizes", "file-system-2", "M"),
      S("fs3", "Move and delete", "file-system-3", "H"),
      S("fs4", "Find", "file-system-4", "M"),
    ]},
  { id:"e6", d:6, stn:"Order Book", ph:"ds", steps:true,
    name:"SIG's favourite: an exchange in a class",
    note:"Candidates report SIG asking for exactly this: add a buy, add a sell, match them with price-time priority, then defend the data structures. Two heaps facing each other, like Find Median, then cancels, amends and every trader's P&L.",
    ritual:"Say the heap keys for bids and for asks, and how a cancelled order leaves the book without a search.",
    probs:[
      S("ob1", "Match on arrival", "order-book-1", "M"),
      S("ob2", "Cancel orders", "order-book-2", "M"),
      S("ob3", "Amend orders", "order-book-3", "M"),
      S("ob4", "Traders and P&L", "order-book-4", "H"),
    ]},
  { id:"e7", d:7, stn:"Diff & Merge", ph:"dp", steps:true,
    name:"git diff, then git merge",
    note:"The string DP you drilled, running the tool you use every day: a canonical line diff, unified hunks with context, then a three-way merge that knows when to stop and mark a conflict.",
    ritual:"Fill a 3x3 LCS table by hand for two tiny files, then read the edit script off it.",
    probs:[
      S("dm1", "Line diff", "diff-merge-1", "M"),
      S("dm2", "Unified hunks", "diff-merge-2", "M"),
      S("dm3", "Three-way merge", "diff-merge-3", "H"),
    ]},
];
