/**
 * Demo Mode seed data. Shapes match the API contracts documented in services/api.js,
 * so replacing Demo Mode with the real backend needs no UI changes.
 * Dates are stored as day offsets from "today" so the demo always looks current.
 */

export const DEMO_STUDENT = {
  id: "demo-harman",
  name: "Harman",
  program: "B.E. Computer Science",
  semester: "Semester 5",
  preferences: {
    explanationStyle: "simple",   // simple | detailed | exam-focused
    sessionLength: 45,            // minutes
    dailyGoalMinutes: 120,
  },
  stats: { streakDays: 6, studyHours: 38, quizzesTaken: 6, topicsMastered: 5 },
};

export const DEMO_SUBJECTS = [
  { id: "cn", name: "Computer Networks" },
  { id: "os", name: "Operating Systems" },
  { id: "dbms", name: "DBMS" },
  { id: "ml", name: "Machine Learning" },
];

/** Topic mastery (0–100). Subject progress is the average of its topics. */
export const DEMO_TOPICS = [
  { id: "arq", name: "ARQ Protocols", subject: "cn", mastery: 48 },
  { id: "tcp-cc", name: "TCP Congestion Control", subject: "cn", mastery: 56 },
  { id: "routing", name: "Routing Algorithms", subject: "cn", mastery: 64 },
  { id: "subnetting", name: "Subnetting", subject: "cn", mastery: 92 },
  { id: "osi", name: "OSI & TCP/IP Models", subject: "cn", mastery: 100 },

  { id: "deadlocks", name: "Deadlocks", subject: "os", mastery: 53 },
  { id: "scheduling", name: "CPU Scheduling", subject: "os", mastery: 72 },
  { id: "paging", name: "Paging & Virtual Memory", subject: "os", mastery: 67 },

  { id: "normalization", name: "Normalization", subject: "dbms", mastery: 84 },
  { id: "sql-joins", name: "SQL Joins", subject: "dbms", mastery: 90 },
  { id: "transactions", name: "Transactions & ACID", subject: "dbms", mastery: 69 },

  { id: "linreg", name: "Linear Regression", subject: "ml", mastery: 66 },
  { id: "nn", name: "Neural Networks", subject: "ml", mastery: 46 },
];

export const DEMO_EXAMS = [
  { id: "ex-cn", subject: "cn", title: "Mid-semester exam", dayOffset: 4, hour: 10 },
  { id: "ex-os", subject: "os", title: "Sessional test 2", dayOffset: 9, hour: 10 },
  { id: "ex-dbms", subject: "dbms", title: "Mid-semester exam", dayOffset: 16, hour: 14 },
  { id: "ex-ml", subject: "ml", title: "Project viva", dayOffset: 23, hour: 11 },
];

export const DEMO_QUIZ_HISTORY = [
  { id: "qh1", dayOffset: -11, topic: "Subnetting", subject: "cn", score: 64 },
  { id: "qh2", dayOffset: -9, topic: "CPU Scheduling", subject: "os", score: 68 },
  { id: "qh3", dayOffset: -7, topic: "ARQ Protocols", subject: "cn", score: 55 },
  { id: "qh4", dayOffset: -5, topic: "SQL Joins", subject: "dbms", score: 70 },
  { id: "qh5", dayOffset: -3, topic: "Normalization", subject: "dbms", score: 74 },
  { id: "qh6", dayOffset: -1, topic: "Linear Regression", subject: "ml", score: 72 },
];

export const DEMO_MATERIALS = [
  { id: "m1", fileName: "Computer_Networks_Notes.pdf", subject: "cn", fileType: "pdf", sizeBytes: 4_812_000, dayOffset: -12, status: "processed" },
  { id: "m2", fileName: "CNDC_Lecture_5.pptx", subject: "cn", fileType: "pptx", sizeBytes: 9_240_000, dayOffset: -6, status: "processed" },
  { id: "m3", fileName: "DBMS_Unit3_Normalization.pdf", subject: "dbms", fileType: "pdf", sizeBytes: 2_150_000, dayOffset: -4, status: "processed" },
  { id: "m4", fileName: "Operating_Systems_Notes.docx", subject: "os", fileType: "docx", sizeBytes: 1_320_000, dayOffset: 0, status: "processing" },
];

/* ─────────────────────── Question banks ───────────────────────
 * `answer` is the index of the correct option. The demo adapter strips it
 * before sending questions to the UI, mirroring how the backend should behave.
 */
export const QUESTION_BANKS = {
  "ARQ Protocols": [
    {
      id: "arq-1", subtopic: "Stop-and-Wait ARQ",
      question: "In Stop-and-Wait ARQ, what does the sender do after transmitting a frame?",
      options: ["Sends the next frame immediately", "Waits for an ACK before sending the next frame", "Waits for a NAK only", "Retransmits the frame twice"],
      answer: 1,
      explanation: "Stop-and-Wait sends one frame and then waits for its acknowledgement (or a timeout) before sending anything else.",
    },
    {
      id: "arq-2", subtopic: "Go-Back-N ARQ",
      question: "What happens in Go-Back-N ARQ when frame 3 is lost and frames 4 and 5 arrive?",
      options: ["The receiver buffers frames 4 and 5", "Only frame 3 is retransmitted", "Frames 3, 4 and 5 are all retransmitted", "The connection is reset"],
      answer: 2,
      explanation: "The Go-Back-N receiver discards out-of-order frames, so the sender goes back and resends frame 3 and everything after it.",
    },
    {
      id: "arq-3", subtopic: "Go-Back-N ARQ",
      question: "What is the primary purpose of Go-Back-N ARQ?",
      options: [
        "To encrypt frames on the data link layer",
        "To send multiple frames before needing an ACK, improving throughput while still recovering from errors",
        "To route packets across different networks",
        "To compress frames before transmission",
      ],
      answer: 1,
      explanation: "Go-Back-N is a sliding-window protocol: the sender can transmit up to W frames without waiting, which uses the link better than Stop-and-Wait.",
    },
    {
      id: "arq-4", subtopic: "Selective Repeat ARQ",
      question: "Which feature distinguishes Selective Repeat ARQ from Go-Back-N?",
      options: ["It uses no sequence numbers", "The receiver buffers out-of-order frames and only lost frames are resent", "It sends one frame at a time", "It never uses timers"],
      answer: 1,
      explanation: "Selective Repeat keeps correctly received out-of-order frames in a buffer, so only the missing frames are retransmitted.",
    },
    {
      id: "arq-5", subtopic: "Go-Back-N ARQ",
      question: "With m-bit sequence numbers, what is the maximum sender window size in Go-Back-N?",
      options: ["2^m", "2^m − 1", "2^(m−1)", "m"],
      answer: 1,
      explanation: "Go-Back-N allows a sender window of at most 2^m − 1 so the receiver can tell new frames from retransmissions.",
    },
    {
      id: "arq-6", subtopic: "Stop-and-Wait ARQ",
      question: "Why are sequence numbers needed even in Stop-and-Wait ARQ?",
      options: ["To order packets across routers", "To detect duplicate frames when an ACK is lost", "To encrypt the payload", "To measure bandwidth"],
      answer: 1,
      explanation: "If an ACK is lost the sender retransmits; the 0/1 sequence number lets the receiver recognise and discard the duplicate.",
    },
    {
      id: "arq-7", subtopic: "Selective Repeat ARQ",
      question: "With m-bit sequence numbers, what is the maximum window size in Selective Repeat ARQ?",
      options: ["2^m", "2^m − 1", "2^(m−1)", "2m"],
      answer: 2,
      explanation: "Selective Repeat limits sender and receiver windows to 2^(m−1) to avoid confusing old and new frames.",
    },
    {
      id: "arq-8", subtopic: "Stop-and-Wait ARQ",
      question: "Stop-and-Wait efficiency is 1 / (1 + 2a). What does 'a' represent?",
      options: ["Number of frames in the window", "Propagation delay ÷ transmission delay", "Bit error rate", "Bandwidth ÷ frame size"],
      answer: 1,
      explanation: "a = Tp / Tt. Long links (large propagation delay) make Stop-and-Wait very inefficient.",
    },
    {
      id: "arq-9", subtopic: "Go-Back-N ARQ",
      question: "What is the receiver window size in Go-Back-N ARQ?",
      options: ["1", "Equal to the sender window", "2^m", "It changes dynamically"],
      answer: 0,
      explanation: "The Go-Back-N receiver only accepts the next expected frame, so its window size is 1.",
    },
    {
      id: "arq-10", subtopic: "Selective Repeat ARQ",
      question: "Which acknowledgement style does Selective Repeat ARQ typically use?",
      options: ["Cumulative ACKs only", "Individual ACKs for each correctly received frame", "No ACKs at all", "ACKs only after the full window"],
      answer: 1,
      explanation: "Each frame is acknowledged individually so the sender knows exactly which frames to resend.",
    },
  ],

  "TCP Congestion Control": [
    {
      id: "tcp-1", subtopic: "Slow Start",
      question: "During TCP Slow Start, how does the congestion window grow?",
      options: ["Linearly by 1 MSS per RTT", "Exponentially, doubling each RTT", "It stays constant", "It halves every RTT"],
      answer: 1, explanation: "cwnd increases by 1 MSS for every ACK, which doubles it each round-trip time until ssthresh is reached.",
    },
    {
      id: "tcp-2", subtopic: "AIMD",
      question: "What does AIMD stand for in TCP congestion avoidance?",
      options: ["Adaptive Increase, Maximum Decrease", "Additive Increase, Multiplicative Decrease", "Automatic Increase, Manual Decrease", "Average Increase, Minimum Decrease"],
      answer: 1, explanation: "cwnd grows by about 1 MSS per RTT and is cut (usually halved) on congestion.",
    },
    {
      id: "tcp-3", subtopic: "Fast Retransmit",
      question: "What triggers Fast Retransmit in TCP?",
      options: ["A timeout", "Three duplicate ACKs", "A SYN packet", "An empty receive buffer"],
      answer: 1, explanation: "Three duplicate ACKs suggest a single lost segment, so TCP resends it without waiting for the timer.",
    },
    {
      id: "tcp-4", subtopic: "Slow Start",
      question: "What happens to ssthresh when a timeout occurs (TCP Tahoe)?",
      options: ["It doubles", "It is set to half the current cwnd", "It is set to 1 MSS", "It is unchanged"],
      answer: 1, explanation: "ssthresh = cwnd / 2, and cwnd restarts from 1 MSS in Slow Start.",
    },
    {
      id: "tcp-5", subtopic: "AIMD",
      question: "Once cwnd reaches ssthresh, TCP enters which phase?",
      options: ["Slow Start", "Congestion Avoidance", "Fast Recovery", "Connection teardown"],
      answer: 1, explanation: "Above ssthresh, growth becomes linear — the congestion avoidance phase.",
    },
    {
      id: "tcp-6", subtopic: "Fast Retransmit",
      question: "In TCP Reno, after three duplicate ACKs cwnd is set to…",
      options: ["1 MSS", "About half its previous value (Fast Recovery)", "Double its value", "Zero"],
      answer: 1, explanation: "Reno skips Slow Start after duplicate ACKs and continues from roughly half the old window.",
    },
  ],

  "Routing Algorithms": [
    {
      id: "rt-1", subtopic: "Distance Vector",
      question: "Which problem is Distance Vector routing known for?",
      options: ["Count-to-infinity", "Flooding storms only", "Needing the full topology", "No support for metrics"],
      answer: 0, explanation: "Bad news spreads slowly in Distance Vector, so routers can keep increasing a dead route's cost.",
    },
    {
      id: "rt-2", subtopic: "Link State",
      question: "Which algorithm does Link State routing use to compute routes?",
      options: ["Bellman-Ford", "Dijkstra's shortest path", "Kruskal's", "Floyd–Warshall only"],
      answer: 1, explanation: "Each router builds the full map and runs Dijkstra's algorithm on it.",
    },
    {
      id: "rt-3", subtopic: "Distance Vector",
      question: "RIP is an example of which routing type?",
      options: ["Link State", "Distance Vector", "Path Vector", "Static"],
      answer: 1, explanation: "RIP uses hop count with the Bellman-Ford distance-vector approach.",
    },
    {
      id: "rt-4", subtopic: "Link State",
      question: "OSPF shares information using…",
      options: ["Link State Advertisements", "Full routing tables every 30s", "ARP requests", "DNS queries"],
      answer: 0, explanation: "OSPF floods LSAs so every router has the same link-state database.",
    },
    {
      id: "rt-5", subtopic: "Path Vector",
      question: "BGP is best described as a…",
      options: ["Link State protocol", "Path Vector protocol", "Distance Vector protocol inside one AS", "Transport protocol"],
      answer: 1, explanation: "BGP advertises full AS paths, which helps avoid loops between autonomous systems.",
    },
  ],

  "Deadlocks": [
    {
      id: "dl-1", subtopic: "Coffman Conditions",
      question: "Which is NOT one of the four necessary conditions for deadlock?",
      options: ["Mutual exclusion", "Hold and wait", "Preemption", "Circular wait"],
      answer: 2, explanation: "The condition is *no* preemption. Allowing preemption actually helps prevent deadlock.",
    },
    {
      id: "dl-2", subtopic: "Banker's Algorithm",
      question: "The Banker's algorithm is used for deadlock…",
      options: ["Prevention", "Avoidance", "Detection only", "Recovery"],
      answer: 1, explanation: "It only grants a request if the system stays in a safe state — that's avoidance.",
    },
    {
      id: "dl-3", subtopic: "Prevention",
      question: "Ordering all resources and requesting them in increasing order breaks which condition?",
      options: ["Mutual exclusion", "Hold and wait", "No preemption", "Circular wait"],
      answer: 3, explanation: "A global ordering makes a cycle of waiting processes impossible.",
    },
    {
      id: "dl-4", subtopic: "Banker's Algorithm",
      question: "In the Banker's algorithm, Need is computed as…",
      options: ["Max − Allocation", "Available − Allocation", "Max + Available", "Allocation − Max"],
      answer: 0, explanation: "Need[i][j] = Max[i][j] − Allocation[i][j].",
    },
    {
      id: "dl-5", subtopic: "Coffman Conditions",
      question: "A cycle in a resource allocation graph with single-instance resources means…",
      options: ["Deadlock may occur", "Deadlock definitely exists", "No deadlock", "Starvation only"],
      answer: 1, explanation: "With one instance per resource type, a cycle is both necessary and sufficient for deadlock.",
    },
    {
      id: "dl-6", subtopic: "Prevention",
      question: "Requiring a process to request all resources at once breaks which condition?",
      options: ["Hold and wait", "Circular wait", "Mutual exclusion", "No preemption"],
      answer: 0, explanation: "A process never holds some resources while waiting for others.",
    },
  ],

  "Normalization": [
    {
      id: "nf-1", subtopic: "Normal Forms",
      question: "A relation is in 1NF when…",
      options: ["All attributes hold atomic values", "There are no partial dependencies", "There are no transitive dependencies", "Every determinant is a key"],
      answer: 0, explanation: "1NF only requires atomic (indivisible) attribute values.",
    },
    {
      id: "nf-2", subtopic: "Normal Forms",
      question: "2NF removes which kind of dependency?",
      options: ["Transitive", "Partial", "Multivalued", "Join"],
      answer: 1, explanation: "No non-key attribute may depend on only part of a composite key.",
    },
    {
      id: "nf-3", subtopic: "BCNF",
      question: "BCNF requires that for every functional dependency X → Y…",
      options: ["Y is a key", "X is a superkey", "X is a single attribute", "Y is atomic"],
      answer: 1, explanation: "Every determinant must be a superkey.",
    },
    {
      id: "nf-4", subtopic: "Normal Forms",
      question: "3NF removes which dependency?",
      options: ["Partial", "Transitive", "Trivial", "Functional"],
      answer: 1, explanation: "Non-key attributes must not depend on other non-key attributes.",
    },
    {
      id: "nf-5", subtopic: "BCNF",
      question: "Why normalize a schema?",
      options: ["To speed up every query", "To reduce redundancy and update anomalies", "To add more tables for security", "To remove all joins"],
      answer: 1, explanation: "Normalization removes redundancy, which prevents insert, update and delete anomalies.",
    },
  ],

  "Neural Networks": [
    {
      id: "nn-1", subtopic: "Activation Functions",
      question: "Why are non-linear activation functions needed?",
      options: ["To speed up training only", "Without them, stacked layers collapse into one linear function", "To reduce the number of weights", "To normalize the input"],
      answer: 1, explanation: "A composition of linear layers is still linear, so non-linearity is what lets networks learn complex patterns.",
    },
    {
      id: "nn-2", subtopic: "Backpropagation",
      question: "Backpropagation computes gradients using…",
      options: ["The chain rule", "Random search", "The normal equation", "K-means"],
      answer: 0, explanation: "Gradients flow backwards layer by layer by applying the chain rule.",
    },
    {
      id: "nn-3", subtopic: "Activation Functions",
      question: "Which activation outputs values between 0 and 1?",
      options: ["ReLU", "Sigmoid", "tanh", "Linear"],
      answer: 1, explanation: "σ(x) = 1 / (1 + e^−x) squashes inputs into (0, 1).",
    },
    {
      id: "nn-4", subtopic: "Training",
      question: "What is a common sign of overfitting?",
      options: ["High training and validation loss", "Low training loss but rising validation loss", "Both losses decreasing together", "Training loss increasing"],
      answer: 1, explanation: "The model memorises training data but generalises poorly.",
    },
    {
      id: "nn-5", subtopic: "Training",
      question: "What does the learning rate control?",
      options: ["Number of layers", "Size of each weight update step", "Batch size", "Number of epochs"],
      answer: 1, explanation: "It scales the gradient in each update: too high diverges, too low trains slowly.",
    },
  ],
};

/** Which bank to use when a topic has no dedicated demo questions. */
export const SUBJECT_FALLBACK_BANK = {
  cn: "ARQ Protocols",
  os: "Deadlocks",
  dbms: "Normalization",
  ml: "Neural Networks",
};
