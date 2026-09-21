/**
 * Prepared tutor answers for Demo Mode. In live mode these come from the
 * Foundry agent (with RAG over the student's uploaded materials).
 */

export const LESSONS = {
  arq: {
    topic: "ARQ Protocols",
    subject: "cn",
    sources: ["course_material"],
    citations: [
      { title: "CNDC_Lecture_5.pptx", location: "Slides 12–18" },
      { title: "Computer_Networks_Notes.pdf", location: "Page 41" },
    ],
    reply: `## ARQ protocols, made simple

**ARQ (Automatic Repeat reQuest)** is how the data link layer makes an unreliable link reliable. The idea from your Lecture 5 slides fits in one line:

> Send a frame, wait for proof it arrived, and **resend it if the proof doesn't come in time.**

Every ARQ protocol is built from three pieces:

1. **Acknowledgements (ACKs)**: the receiver says "got it".
2. **Timers**: the sender waits a fixed time for that ACK.
3. **Retransmission**: no ACK before the timer ends means the frame is sent again.

### 1. Stop-and-Wait ARQ
The sender transmits **one frame**, then waits. Frames are numbered 0 and 1 so the receiver can spot duplicates when an ACK gets lost.

It's simple but slow on long links. Its efficiency is

$$\\eta = \\frac{1}{1 + 2a}, \\qquad a = \\frac{T_p}{T_t}$$

where $T_p$ is propagation delay and $T_t$ is transmission delay.

### 2. Go-Back-N ARQ
The sender can send **up to $W$ frames** before waiting. The receiver only accepts frames **in order**.

If frame 3 is lost, the receiver throws away 4 and 5, so the sender **goes back to 3** and resends everything from there:

\`\`\`text
Sender:   F2  F3  F4  F5 | timeout | F3  F4  F5
Receiver: ✓   ✗   drop drop         ✓   ✓   ✓
\`\`\`

Window rule: $W_s \\le 2^m - 1$, and the receiver window is **1**.

### 3. Selective Repeat ARQ
The receiver **buffers** out-of-order frames and ACKs each one individually. Only the **lost frame** is resent, which is efficient but needs more memory and logic.

Window rule: $W_s = W_r \\le 2^{m-1}$.

### Quick comparison

| | Stop-and-Wait | Go-Back-N | Selective Repeat |
|---|---|---|---|
| Frames before ACK | 1 | up to $2^m-1$ | up to $2^{m-1}$ |
| On a lost frame, resend | that frame | it **and all after it** | **only** that frame |
| Receiver buffer | none | none | yes |

**Exam tip:** your notes (p. 41) flag the window-size limits as a frequent 2-mark question. Learn *why* Go-Back-N uses $2^m - 1$: it stops the receiver mistaking a retransmission for a new frame.

Want to check what stuck? Ask me for a quiz on this topic.`,
  },

  arqSimple: {
    topic: "ARQ Protocols",
    subject: "cn",
    sources: ["general_knowledge"],
    reply: `## ARQ as numbered postcards

Imagine mailing numbered postcards to a friend who texts back **"got #3"** for each one.

- **Stop-and-Wait**: you mail one card and wait for the text before mailing the next. Safe, but slow.
- **Go-Back-N**: you mail cards 1–5 together. If #3 goes missing, your friend ignores #4 and #5, so you re-mail **3, 4 and 5**.
- **Selective Repeat**: your friend keeps #4 and #5 on the desk and only asks for **#3 again**.

The "text back" is the **ACK**, and "how long you wait for it" is the **timer**. That's all ARQ is.`,
  },

  tcp: {
    topic: "TCP Congestion Control",
    subject: "cn",
    sources: ["course_material"],
    citations: [{ title: "Computer_Networks_Notes.pdf", location: "Pages 58–63" }],
    reply: `## TCP congestion control

TCP keeps a **congestion window (cwnd)** that limits how much it sends before hearing back. It grows while the network copes and shrinks when it doesn't.

1. **Slow Start**: cwnd starts at 1 MSS and **doubles every RTT** until it hits the threshold \`ssthresh\`.
2. **Congestion Avoidance (AIMD)**: above \`ssthresh\`, cwnd grows by about **1 MSS per RTT**.
3. **On 3 duplicate ACKs** (Reno): Fast Retransmit the lost segment, set cwnd to about half, and continue.
4. **On a timeout**: \`ssthresh = cwnd / 2\`, cwnd drops to **1 MSS**, and Slow Start begins again.

**Exam tip:** your notes include a cwnd-vs-time graph. Practise labelling where Slow Start ends and where each loss happens.`,
  },

  deadlocks: {
    topic: "Deadlocks",
    subject: "os",
    sources: ["general_knowledge"],
    reply: `## Deadlocks

A **deadlock** is when a set of processes each wait for a resource another one holds, so none of them can continue.

It needs **all four** Coffman conditions at once:

1. **Mutual exclusion**: a resource can be used by one process at a time.
2. **Hold and wait**: a process holds one resource while waiting for another.
3. **No preemption**: resources can't be taken away forcibly.
4. **Circular wait**: P1 waits for P2, which waits for P1.

Ways to handle them:

- **Prevention**: break one condition (e.g. request resources in a fixed order).
- **Avoidance**: the **Banker's algorithm** only grants requests that keep the system in a *safe state*. Remember $\\text{Need} = \\text{Max} - \\text{Allocation}$.
- **Detection and recovery**: let deadlocks happen, find cycles, then kill or roll back processes.

Your *Operating_Systems_Notes.docx* is still being processed, so this answer uses general knowledge. Ask again once it's ready for a version based on your notes.`,
  },

  explainWhich: {
    sources: ["general_knowledge"],
    reply: `Happy to. Which topic should I simplify? For example:

- "Explain **ARQ protocols** simply"
- "Explain **TCP congestion control** simply"
- "Explain **deadlocks** simply"`,
  },

  fallback: {
    sources: ["general_knowledge"],
    reply: `I can't answer that one in Demo Mode, because open-ended questions need the live PISTA study service.

In this demo, try:

- **"Teach me ARQ protocols"**
- **"Explain TCP congestion control"**
- **"What should I study today?"**
- **"What are my weakest topics?"**
- **"Give me a quiz"**`,
  },
};

/** Keyword routing for Demo Mode messages. Order matters. */
export function matchIntent(text) {
  const t = text.toLowerCase();
  if (/\bquiz\b|test me|practice questions/.test(t)) return "quiz";
  if (/weak(est)?|struggl/.test(t)) return "weak";
  if (/what should i study|study today|recommend|plan for today/.test(t)) return "today";
  if (/simpl|eli5|easy|analogy/.test(t)) {
    if (/arq|go.?back|selective repeat|stop.?and.?wait/.test(t)) return "arqSimple";
    if (/\bthis\b|\bit\b|\bthat\b/.test(t)) return "simpleContext";
    return "explainWhich";
  }
  if (/arq|go.?back.?n|selective repeat|stop.?and.?wait|sliding window/.test(t)) return "arq";
  if (/tcp|congestion|slow start|aimd/.test(t)) return "tcp";
  if (/deadlock|banker/.test(t)) return "deadlocks";
  return "fallback";
}

/** Maps a lesson key or free text to a topic name for "quiz on this topic". */
export const TOPIC_KEYWORDS = [
  { re: /arq|go.?back|selective repeat|stop.?and.?wait/i, topic: "ARQ Protocols", subject: "cn" },
  { re: /tcp|congestion/i, topic: "TCP Congestion Control", subject: "cn" },
  { re: /routing|dijkstra|bellman/i, topic: "Routing Algorithms", subject: "cn" },
  { re: /deadlock|banker/i, topic: "Deadlocks", subject: "os" },
  { re: /normaliz|bcnf|3nf/i, topic: "Normalization", subject: "dbms" },
  { re: /neural|backprop/i, topic: "Neural Networks", subject: "ml" },
];
