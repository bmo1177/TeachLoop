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
  "Generative Adversarial Networks (GANs)": [
    "What if two neural networks played a cat-and-mouse game — one trying to fool the other, the other trying to catch the lie?",
    "GANs have a generator (creates fake data) and a discriminator (detects fakes). They train together — the generator gets better at fooling, the discriminator gets better at detecting.",
    "Generator: maps random noise to data (e.g., images). Discriminator: classifies real vs generated. Training: alternate — freeze one, update the other. Nash equilibrium: generator produces indistinguishable samples. Challenges: mode collapse (limited variety), training instability, evaluation difficulty (FID score). Applications: image synthesis, style transfer, data augmentation."
  ],
  "Dropout Regularization": [
    "What if randomly ignoring some neurons during training forced the network to learn more robust features?",
    "Dropout randomly sets a fraction of neurons to zero during each training step. This prevents co-adaptation and acts as an ensemble of many sub-networks.",
    "During training: each neuron has probability p (typically 0.2-0.5) of being zeroed out. At inference: all neurons active, weights scaled by (1-p). Why it works: forces redundant representations, prevents overfitting to specific neuron combinations. Similar to bagging — each forward pass trains a different sub-network. Key insight: neurons can't rely on specific other neurons being present."
  ],
  "Batch Normalization": [
    "What if normalizing the inputs to each layer could speed up training and reduce sensitivity to initialization?",
    "Batch Norm normalizes each layer's inputs to zero mean and unit variance, then applies learnable scale and shift parameters. This stabilizes training and allows higher learning rates.",
    "For each mini-batch: compute mean and variance, normalize: x̂ = (x - μ) / √(σ² + ε), then scale and shift: y = γx̂ + β. Benefits: faster convergence, reduced sensitivity to weight initialization, slight regularization effect (noise from batch statistics). Placed between linear and activation layers. Inference uses running averages of stats. Debate: does it help because of the normalization or the added noise?"
  ],
  "The Transformer Architecture": [
    "What if you could process all positions in a sequence simultaneously instead of one at a time?",
    "Transformers replace recurrence with self-attention, allowing parallel processing of entire sequences. Each position attends to all others to build context-aware representations.",
    "Core: self-attention mechanism. Each token produces Query, Key, Value vectors. Attention weight = softmax(QK^T/√d_k). Output = weighted sum of Values. Multi-head: run attention in parallel with different projections. Feed-forward network after attention. Positional encoding adds sequence order info. Layer norm + residual connections stabilize deep stacks. Encoder-decoder for seq2seq, decoder-only for GPT-style LLMs. Why it won: parallelizable (unlike RNNs), captures long-range dependencies, scales well."
  ],
  "Word Embeddings": [
    "How do you turn words into numbers that capture meaning — so 'king' and 'queen' are close, but 'king' and 'car' are far apart?",
    "Word embeddings map words to dense vectors where semantic similarity corresponds to geometric proximity. Words used in similar contexts end up close together in vector space.",
    "Word2Vec: two architectures — CBOW (predict word from context) and Skip-gram (predict context from word). GloVe: factorizes the word co-occurrence matrix. Key property: vector arithmetic — king - man + woman ≈ queen. Limitations: static (one vector per word regardless of context), can't handle OOV words. Modern approach: contextual embeddings (BERT, GPT) where each word gets a different vector based on its context."
  ],
  "Long Short-Term Memory (LSTM) Networks": [
    "How do you build a neural network that can remember important information over long sequences while forgetting irrelevant details?",
    "LSTMs use gating mechanisms (input, forget, output gates) to control information flow through a cell state, enabling learning of long-range dependencies that vanilla RNNs struggle with.",
    "Cell state: the 'conveyor belt' carrying information through time. Forget gate: decides what to discard from cell state (sigmoid output × cell state). Input gate: decides what new information to store. Output gate: decides what to output from cell state. Each gate: σ(W·[h_{t-1}, x_t] + b). Gradient flow: cell state creates a 'gradient highway' that avoids vanishing gradients. Variants: GRU (simplified, 2 gates), Bidirectional LSTM, Stacked LSTM."
  ],
  "Precision vs Recall": [
    "When is it worse to say 'yes' when the answer is 'no' — and when is it worse to say 'no' when the answer is 'yes'?",
    "Precision: of all positive predictions, how many are correct? Recall: of all actual positives, how many did you find? They trade off — increasing one often decreases the other.",
    "Precision = TP / (TP + FP). Recall = TP / (TP + FN). F1 = harmonic mean of both. High precision: few false positives (spam filter — don't lose real email). High recall: few false negatives (cancer screening — don't miss cases). Precision-recall tradeoff controlled by decision threshold. PR curve plots precision vs recall at different thresholds. When to optimize which: cost of false positive ≠ cost of false negative."
  ],
  "Random Forests vs Gradient Boosting": [
    "What's better — training many models independently and voting, or training them sequentially where each one fixes the previous one's mistakes?",
    "Random Forests: many decision trees trained independently on random subsets, predictions averaged. Gradient Boosting: trees trained sequentially, each one correcting the errors of the ensemble before it.",
    "Random Forest: bagging + random feature subsets. Each tree sees different data and features → reduces variance. Parallelizable, robust to overfitting, less tuning needed. Gradient Boosting: sequential, each tree fits the residual errors. Reduces bias more effectively. XGBoost/LightGBM/CatBoost: optimized implementations with regularization. GB requires careful tuning (learning rate, tree depth, n_estimators). RF is harder to overfit; GB can overfit if too many rounds. Generally: GB wins on tabular data competitions; RF is a reliable default."
  ],
  "The Vanishing Gradient Problem": [
    "Why do deep networks sometimes stop learning in their early layers — and what does that have to do with multiplying lots of small numbers?",
    "During backpropagation, gradients are multiplied through many layers. If these gradients are < 1, they shrink exponentially, making early layers learn extremely slowly or not at all.",
    "Chain rule: ∂L/∂w₁ = ∂L/∂aₙ × ∂aₙ/∂aₙ₋₁ × ... × ∂a₂/∂a₁ × ∂a₁/∂w₁. If each ∂aᵢ₊₁/∂aᵢ < 1, product → 0 exponentially. Sigmoid: derivative max is 0.25, so gradients shrink fast. Solutions: ReLU (gradient = 1 for positive inputs), residual connections (skip connections preserve gradient flow), batch normalization, LSTM gates, careful initialization (He, Xavier). The opposite — exploding gradients — happens when products > 1, solved by gradient clipping."
  ],
  "Mixture of Experts (MoE)": [
    "What if instead of one giant model processing every input, you had specialized expert networks and a router that sent each input only to the most relevant experts?",
    "MoE uses a gating network to route each token to a small subset of expert sub-networks. This increases model capacity without proportionally increasing compute — sparse activation.",
    "Architecture: N expert networks (each a FFN) + gating network. Gate outputs routing weights for each token (softmax over experts). Top-k routing: only k experts process each token (usually k=1 or 2). Total parameters = N × expert_params, but compute = k × expert_params. Training challenges: load balancing (experts must receive similar amounts of data), routing instability, expert collapse. Used in: Switch Transformer (Google, k=1), Mixtral (Mistral, 8 experts, top-2). Why it matters: scales model quality without linear compute cost."
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
  "Design a distributed rate limiter. What data structures and algorithms would you use?": [
    "How do you prevent a single user from overwhelming your API while keeping the check fast and distributed across servers?",
    "Core challenge: counting requests across multiple servers in real-time without a single point of failure.",
    "Algorithms: Fixed window (simple, bursty at boundaries), sliding window log (exact but memory-heavy), sliding window counter (hybrid, good balance), token bucket (allows controlled bursts). Distributed approach: Redis INCR + EXPIRE for atomic counter per user. Race condition safe: Lua script or MULTI/EXEC. For multi-region: local rate limiters with periodic sync, or central Redis cluster with read replicas. Consider: per-user, per-IP, per-endpoint limits. Fallback: if Redis down, fail open or fail closed depending on business needs."
  ],
  "How would you approach migrating a monolithic database to a microservices architecture?": [
    "You have one giant database serving 50 services. How do you untangle them without downtime?",
    "The Strangler Fig pattern is your friend — gradually replace parts of the monolith while the system keeps running.",
    "Steps: 1) Map dependencies — which services read/write which tables. 2) Identify bounded contexts (domain-driven design). 3) Create service-specific databases per context. 4) Use Change Data Capture (Debezium) to sync data during transition. 5) Route reads to new DB, then writes. 6) Decommission old tables. Key risks: data consistency during dual-write period, circular dependencies between services. Tools: Outbox pattern for reliable event publishing, Saga pattern for distributed transactions. Timeline: months, not weeks. Start with the least coupled service."
  ],
  "Explain the difference between horizontal and vertical scaling. When do you choose each?": [
    "When should you buy a bigger machine vs. when should you buy more machines?",
    "Vertical = bigger machine (more CPU/RAM). Horizontal = more machines. Each has hard limits and hidden costs.",
    "Vertical: simple (no code changes), good for stateful systems (databases), limited by hardware ceiling, single point of failure. Horizontal: scales almost infinitely, fault-tolerant (node dies, others take over), requires stateless design or distributed state, adds network complexity. Choose vertical when: database, single-server app, rapid prototyping, strong consistency needed. Choose horizontal when: stateless web servers, high availability required, unpredictable traffic, need zero downtime. Most systems use both: vertical for DB (then sharding), horizontal for app tier."
  ],
  "Design a ride-sharing matching system like Uber or Lyft. What are the hard problems?": [
    "When a rider requests a ride, how do you find the best driver in milliseconds across millions of active drivers?",
    "The core challenge is real-time spatial matching at massive scale with continuously moving entities.",
    "Hard problems: 1) Spatial indexing — geohash or quadtree to find nearby drivers in O(log n). 2) Matching algorithm — bipartite matching with constraints (driver direction, rating, ETA). 3) ETA estimation — road network graph + real-time traffic. 4) Surge pricing — demand/supply balancing per geohash region. 5) Real-time tracking — WebSocket connection per driver, position updates every 3-5 seconds. 6) Trip state machine — requested → accepted → en-route → in-progress → completed. Infrastructure: event-driven (Kafka), spatial DB (PostGIS or Redis geospatial), cell-based architecture (each city region independent). Scale: 1M concurrent drivers × 1 update/sec = 1M writes/sec."
  ],
  "How would you ensure zero downtime during a major database schema migration?": [
    "You need to change a column type on a table with 500M rows — and the app can't go down. How?",
    "The expand-and-contract pattern: add new columns, migrate data, switch reads, drop old columns — all while the app keeps running.",
    "Steps: 1) Expand — add new column (nullable). 2) Backfill — write to both old and new columns (dual write). 3) Migrate existing rows in batches (background job, throttle to avoid load spikes). 4) Verify — read from new column, compare with old. 5) Switch — app reads from new column. 6) Contract — stop writing to old column, drop it. Key tools: online schema migration tools (gh-ost for MySQL, pg_repack for Postgres), feature flags for gradual rollout. Never: ALTER TABLE on a 500M row table directly (locks table for hours). Always: test on a copy of production data first."
  ],
  "Design a content delivery network (CDN) from scratch. What are the key components?": [
    "How do you serve a user in Tokyo the same content as a user in New York — but fast for both?",
    "A CDN caches content at edge servers worldwide, routing users to the nearest point of presence (PoP).",
    "Components: 1) Origin server (source of truth). 2) Edge servers (cache content at PoPs worldwide). 3) DNS routing (Anycast or GeoDNS to direct users to nearest PoP). 4) Cache layer (LRU eviction, TTL-based invalidation). 5) Cache invalidation (purge API, versioned URLs). 6) Origin shield (mid-tier cache to protect origin from stampedes). 7) TLS termination at edge. 8) Origin failover (multiple origins for HA). Cache key strategy: URL + relevant headers (Accept-Encoding, Vary). Cache hit ratio target: >95%. Cold start: pull-through cache on first request. Thundering herd: use locks/stale-while-revalidate."
  ],
  "Explain consensus algorithms (Raft, Paxos). Why are they necessary in distributed systems?": [
    "If you have 5 servers, how do they all agree on the same value — even if some crash or messages arrive out of order?",
    "Consensus algorithms ensure all non-faulty nodes agree on a single value despite failures — the foundation of distributed systems.",
    "Why necessary: without consensus, split-brain scenarios cause data inconsistency. Two leaders → conflicting writes → data loss. Raft: leader-based. Leader sends AppendEntries to followers. Majority (quorum) must acknowledge before commit. If leader fails, election selects new leader. Simpler than Paxos, same guarantees. Key properties: safety (never commit wrong value), liveness (eventually makes progress). Tolerates f failures with 2f+1 nodes (majority quorum). Trade-off: latency = 1 RTT to leader + majority acknowledgment. Use cases: etcd (Raft), ZooKeeper (ZAB/Paxos), Consul (Raft). Multi-Paxos optimizes for stable leader. Viewstamped Replication is another variant."
  ],
  "How would you design a real-time analytics dashboard that processes billions of events per day?": [
    "Marketing wants a live dashboard showing user activity across millions of events per minute. How do you build it?",
    "The key is separating the write path (ingest billions of events) from the read path (fast aggregations for dashboards).",
    "Write path: events → Kafka (buffering) → stream processor (Flink/Spark Streaming) → pre-aggregated materialized views. Read path: dashboard queries pre-computed views, not raw events. Storage: columnar DB (ClickHouse, Druid, or BigQuery for batch). Time-series optimization: partition by time, roll up (minute → hour → day), retention policy. Real-time: WebSockets push updates to dashboard when aggregates change. Architecture layers: 1) Collection (Kafka, 5M events/sec). 2) Processing (Flink: windowed aggregations, anomaly detection). 3) Storage (Druid/ClickHouse for sub-second queries). 4) Serving (API + WebSocket). 5) Visualization (React dashboard). Scale tricks: approximate algorithms (HyperLogLog for unique counts), sampling for high-cardinality dimensions."
  ],
};
