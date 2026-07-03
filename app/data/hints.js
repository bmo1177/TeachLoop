export const TEACH_HINTS = {
  "Backpropagation": [
    "Think about how information flows backward through a network — what's the goal of that backward pass?",
    "It's chain rule applied at scale. Explain how errors at the output layer propagate to earlier layers, and how each layer's weights get updated.",
    "Start with forward pass → compute loss → then for each layer, calculate the gradient of the loss w.r.t. weights using the chain rule. Mention learning rate, gradient vanishing, and how backprop is what makes deep learning feasible."
  ],
  "The Attention Mechanism in Transformers": [
    "Focus on the core idea of weighing how much each input word matters to every other word.",
    "Attention lets each token look at all other tokens and decide which ones are most relevant. Explain query, key, value vectors and the softmax weighting.",
    "In 'Attention Is All You Need', each token is projected into Q, K, V. Attention scores = softmax(QK^T/√d)V. This gives a context-aware representation. Multi-head attention runs this in parallel. It's why Transformers handle long-range dependencies so well."
  ],
  "Gradient Descent": [
    "Imagine standing on a hill in fog — how do you find the bottom step by step?",
    "You compute the gradient (slope) of the loss function and take steps in the opposite direction. The learning rate controls step size. Too big = overshoot, too small = slow.",
    "Gradient descent: initialize weights, compute loss, calculate ∂loss/∂weights, update: w = w − η·∇w. Variants: SGD (one sample per step), mini-batch (small subset), Adam (adaptive learning rates). Convergence depends on loss surface shape."
  ],
  "Overfitting vs Underfitting": [
    "Think about a student who memorizes answers vs one who barely studies — which problems does each face?",
    "Overfitting: model learns training noise, performs poorly on new data. Underfitting: model is too simple, can't capture patterns even in training data.",
    "Overfitting: high variance, low bias. Signs: training loss ≪ validation loss. Fixes: more data, regularization (L1/L2), dropout, simpler architecture. Underfitting: high bias, low variance. Signs: both losses high. Fixes: more complex model, better features, reduce regularization."
  ],
  "Convolutional Neural Networks": [
    "Think about how a sliding window scanning an image can detect patterns at different positions.",
    "CNNs use filters (kernels) that slide over the input detecting local patterns like edges, textures. Pooling layers downsample, and deeper layers combine low-level features into high-level ones.",
    "Conv layer: filter slides over input, computing dot products → feature map. Multiple filters learn different patterns. ReLU adds non-linearity. Pooling (max/avg) reduces spatial size. Stack: conv → ReLU → pool → conv → ReLU → pool → FC. Great for images because of translation invariance and parameter sharing."
  ],
  "Transfer Learning": [
    "Why start from scratch when someone else has already done most of the hard work?",
    "Take a model pre-trained on a large dataset (e.g., ImageNet) and fine-tune it on your specific smaller task. The pre-trained layers already know useful features.",
    "Transfer learning: freeze early layers (generic features like edges), retrain later layers (task-specific features). Saves data, compute, and time. Common in vision (ImageNet → medical imaging) and NLP (BERT → sentiment analysis). Alternatives: feature extraction vs full fine-tuning."
  ],
  "Tokenization in Large Language Models": [
    "How do you chop a sentence into pieces an AI can understand?",
    "Tokenization splits text into tokens (words, subwords, or characters). LLMs use subword tokenization (BPE, WordPiece) to handle any word while keeping common words as single tokens.",
    "Subword tokenization: common words stay whole (\"the\" → [\"the\"]), rare words are split into known pieces (\"tokenization\" → [\"token\", \"ization\"]). BPE merges most frequent character pairs iteratively. Token limit (e.g., 4096) constrains context length. Different tokenizers affect model behavior and language efficiency."
  ],
  "Retrieval-Augmented Generation (RAG)": [
    "What if the model could look up facts in a knowledge base before answering?",
    "RAG combines a retrieval system (search relevant documents) with a generative model (summarize/fill in). The model's answer is grounded in retrieved facts.",
    "Pipeline: user query → embed query → search vector DB for similar docs → prepend retrieved docs to prompt → LLM generates grounded answer. Benefits: reduces hallucinations, keeps knowledge up-to-date without retraining, cites sources. Key components: chunking strategy, embedding model, vector DB (Pinecone, Weaviate)."
  ],
  "The Bias-Variance Tradeoff": [
    "Can a model be too simple and too complex at the same time? Hint: it's about balancing two kinds of errors.",
    "Bias: error from wrong assumptions (underfitting). Variance: error from sensitivity to training data (overfitting). Total error = bias² + variance + irreducible error.",
    "High bias: model misses relevant patterns (e.g., linear model on quadratic data). High variance: model learns noise (e.g., deep tree on small data). Sweet spot: add complexity until validation error starts rising again. Controlled via regularization, model selection, and the amount of training data."
  ],
  "Reinforcement Learning from Human Feedback (RLHF)": [
    "How do you teach an AI to follow human preferences instead of just optimizing a fixed metric?",
    "RLHF uses human comparisons to train a reward model, then fine-tunes the LLM via reinforcement learning (PPO) to maximize that reward.",
    "Step 1: collect human preference data (which output is better?). Step 2: train a reward model to predict human preferences. Step 3: fine-tune LLM with PPO to maximize reward while staying close to original model (KL penalty). This is what makes ChatGPT helpful and harmless. Key challenge: reward hacking."
  ],
};

export const SWE_HINTS = {
  "Design a URL shortening service. Walk through the key architecture decisions.": [
    "Start with the core operation: mapping a short string to a long URL. What data do you need to store and serve?",
    "Consider: hash function choice (base62, murmur), collision handling, redirection (301 vs 302), read/write ratio, and how to handle 10M+ URLs.",
    "Architecture: API (POST /shorten, GET/{shortCode}) → hash service (Base62 encode a unique ID or use a distributed ID generator) → DB (key-value store like Redis + Cassandra for persistence). Cache hot URLs in Redis. Use 301 redirects for permanent URLs, 302 for analytics tracking. Estimate storage: 10M URLs × ~500 bytes ≈ 5GB."
  ],
  "Explain the CAP theorem and give a real example of a system that trades each property.": [
    "CAP says you can only pick two out of three in a distributed system — what are the three properties?",
    "Consistency (every read gets the latest write), Availability (every request gets a response), Partition tolerance (system works despite network splits). Under a partition, you must choose C or A.",
    "CP example (sacrifices A): traditional databases during network split stop accepting writes until consistency restored. AP example (sacrifices C): DNS — always responds, but may serve stale data. CA example (sacrifices P, theoretical): single-node DB — no partitions possible. In practice, partitions are inevitable, so it's really CP vs AP."
  ],
  "What is database indexing? When would you avoid using it?": [
    "Think of a book's index vs reading every page to find a topic — what's the tradeoff?",
    "Indexes speed up reads (O(log n) lookup vs O(n) full scan) but slow down writes (must update index on INSERT/UPDATE/DELETE) and use extra storage.",
    "B-tree indexes are most common — good for range queries and point lookups. Hash indexes fast for exact match only. Avoid indexes on: small tables (full scan is fine), low-cardinality columns (boolean), columns rarely used in WHERE/JOIN/ORDER BY, write-heavy tables (index maintenance cost exceeds read benefit)."
  ],
  "Compare microservices vs monolithic architecture. When would you choose each?": [
    "Imagine one big codebase vs many small services — what problems does each solve or create?",
    "Monolith: simpler dev/debug/deploy, shared memory, but scales as a unit and tight coupling. Microservices: independent scaling/deploy, polyglot, but adds network overhead, distributed complexity, eventual consistency.",
    "Choose monolith for: early-stage products, small teams, simple domains, when speed to market > scale. Choose microservices for: large teams, complex domains needing independent deploy cycles, different scaling needs per component. Many successful companies start monolithic and split services when the monolith's boundaries become clear."
  ],
  "How would you design a real-time notification system for 10 million users?": [
    "Think about push vs pull, and what happens when 10M users get notified simultaneously.",
    "Core components: notification producer (service events) → message queue (Kafka/RabbitMQ) → delivery service (WebSocket for online, push notification for mobile, email/SMS fallback). Need batching, rate limiting, and deduplication.",
    "Design: Notification service API → Kafka topic per notification type → consumer groups process → user preference service checks opt-ins → delivery handler (WebSocket server for real-time, push for mobile via FCM/APNs, email queue for async). Use Redis for presence detection, connection pools for WebSockets. Rate limit per user (max 10/min). Store delivery status for retry. Estimate: 10M users × 10 notifications/day = 100M/day ≈ 1150/sec."
  ],
  "Explain eventual consistency. Where is it acceptable and where is it dangerous?": [
    "What does 'eventually' mean in a distributed system — and what happens during the window before consistency?",
    "Eventual consistency means given enough time with no updates, all replicas will converge to the same value. The window of inconsistency is the risk zone.",
    "Acceptable: social media feeds (seeing a like count slightly stale is fine), DNS (TTL-based propagation), content delivery networks. Dangerous: financial transactions (bank balance must be immediately consistent), inventory management (double-selling), medical records. Mitigations for eventual consistency: read-repair, hinted handoff, version vectors."
  ],
  "SQL vs NoSQL — how do you decide which to use for a new product?": [
    "Start with: how structured is your data, and do you need joins or flexible schemas?",
    "SQL (PostgreSQL, MySQL): structured schemas, ACID transactions, joins, strong consistency. NoSQL (MongoDB, Cassandra): flexible schemas, horizontal scaling, eventual consistency, specialized query patterns.",
    "Pick SQL when: data is relational (users ↔ orders), need transactions, complex queries/aggregations, data integrity is critical. Pick NoSQL when: schema evolves rapidly, need massive horizontal scale, simple key-value access patterns, high write throughput. Hybrid approach is common: SQL for core transactions + NoSQL for caching, analytics, or event logs."
  ],
  "How would you design the backend for a live collaborative document editor?": [
    "Multiple people editing the same document — how do you prevent one person's edits from overwriting another's?",
    "Core problems: conflict resolution, operational transformation (OT) or CRDTs, real-time sync via WebSockets, and persistence.",
    "Architecture: WebSocket server (socket.io or custom) manages document state in memory. Each edit is an operation (OT: insert 'a' at position 5). Server transforms concurrent operations so they apply in any order → same result. CRDTs (used by Figma, Google Docs) are a newer approach — each character has a unique ID, merges automatically. Store: Redis for active document state, DB for persistence/tombstone. Handle reconnection by replaying missed ops from an event log."
  ],
};
