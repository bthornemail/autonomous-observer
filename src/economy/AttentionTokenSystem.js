class AttentionTokenSystem {
  constructor(options = {}) {
    this.options = options;
    this.tokens = [];
    this.availableTokens = options.maxTokens || 100;
    this.totalTokens = this.availableTokens;
    this.allocations = new Map();
    this.isActive = false;
    this.proofOfRelevance = false;
    this.mintedTokens = [];
  // Simple rate limiter to prevent resource exhaustion
  this._mintTimestamps = [];
  this._mintWindowMs = 1000; // 1 second window
  this._maxMintPerWindow = options.maxMintPerWindow || 200;
  }

  async activate() {
    console.log('🎯 Activating attention token system...');
    this.isActive = true;
    return this;
  }

  async shutdown() {
    console.log('🎯 Shutting down attention token system...');
    this.isActive = false;
    this.deallocateAll();
    return this;
  }

  async enableProofOfRelevance() {
    console.log('🎯 Enabling Proof of Relevance...');
    this.proofOfRelevance = true;
    return this;
  }

  async mintToken(tokenData) {
    // For developer ergonomics, implicitly enable proof on first mint if not already enabled
    if (!this.proofOfRelevance) {
      console.log('🎯 Enabling Proof of Relevance...');
      this.proofOfRelevance = true;
    }

    if (!tokenData || typeof tokenData !== 'object' || Array.isArray(tokenData)) {
      throw new Error('Token data must be a valid object');
    }

    const knowledge = tokenData.knowledge;
    if (typeof knowledge !== 'string' || knowledge.trim() === '') {
      throw new Error('Token must be backed by knowledge');
    }
    // Reject obvious script injections / javascript URLs
    if (/<script\b|javascript:/i.test(knowledge)) {
      throw new Error('Malicious knowledge content is not allowed');
    }

    // Accept relevanceScore alias and validate
    const rel = Number(
      Number.isFinite(tokenData.relevanceScore) ? tokenData.relevanceScore : tokenData.relevance
    );
    if (!Number.isFinite(rel) || rel < 0 || rel > 1) {
      throw new Error('relevanceScore must be a finite number between 0 and 1');
    }

    // Rate limiting per window
    const now = Date.now();
    this._mintTimestamps = this._mintTimestamps.filter(ts => now - ts < this._mintWindowMs);
    if (this._mintTimestamps.length >= this._maxMintPerWindow) {
      throw new Error('Mint rate exceeded; please slow down');
    }
    this._mintTimestamps.push(now);

    // Validate and sanitize token data
    const token = {
      id: this.mintedTokens.length,
      knowledge: knowledge.substring(0, 1000),
      relevance: rel,
      value: Math.max(0, Number(tokenData.value) || 1),
      timestamp: Date.now(),
      active: true
    };

    this.mintedTokens.push(token);
    this.totalTokens += token.value;
    this.availableTokens += token.value;

    console.log(`🎯 Minted token ${token.id} with knowledge: ${token.knowledge.substring(0, 50)}...`);
    return token;
  }

  async transferToken(fromAccount, toAccount, amount) {
    if (!this.proofOfRelevance) {
      throw new Error('Proof of Relevance must be enabled for transfers');
    }

    if (typeof fromAccount !== 'string' || typeof toAccount !== 'string' || !fromAccount || !toAccount) {
      throw new Error('Valid accounts required for transfer');
    }

    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      throw new Error('Transfer amount must be positive');
    }

    // Prevent double-spending by enforcing available balance
    if (amount > this.availableTokens) {
      throw new Error(`Insufficient tokens for transfer: requested ${amount}, available ${this.availableTokens}`);
    }
    this.availableTokens -= amount;

    // Simulate account system for testing
    const transfer = {
      id: Date.now(),
      from: String(fromAccount).substring(0, 50),
  to: String(toAccount).substring(0, 50),
  // Back-compat: expose recipient field as alias expected by some tests
  recipient: String(toAccount).substring(0, 50),
      amount: amount,
      timestamp: Date.now(),
      completed: true
    };

    console.log(`🎯 Transferred ${amount} tokens from ${fromAccount} to ${toAccount}`);
    return transfer;
  }

  // Alias for transferToken to match test expectations
  async transfer(toAccount, amount) {
    return await this.transferToken('system', toAccount, amount);
  }

  allocate(processId, amount) {
    if (!this.isActive) {
      throw new Error('Cannot allocate tokens from inactive system');
    }

    if (!processId || typeof processId !== 'string') {
      throw new Error('Process ID must be a non-empty string');
    }

    if (typeof amount !== 'number' || amount <= 0 || !isFinite(amount)) {
      throw new Error('Amount must be a positive finite number');
    }

    if (amount > this.availableTokens) {
      throw new Error(`Insufficient tokens: requested ${amount}, available ${this.availableTokens}`);
    }

    const allocation = {
      processId: String(processId).substring(0, 100), // Limit ID length
      amount: Math.min(amount, this.totalTokens), // Ensure within bounds
      timestamp: Date.now(),
      active: true
    };

    this.allocations.set(processId, allocation);
    this.availableTokens -= amount;

    console.log(`🎯 Allocated ${amount} tokens to ${processId}`);
    return allocation;
  }

  deallocate(processId) {
    if (!this.allocations.has(processId)) {
      return false;
    }

    const allocation = this.allocations.get(processId);
    this.availableTokens += allocation.amount;
    this.allocations.delete(processId);

    console.log(`🎯 Deallocated ${allocation.amount} tokens from ${processId}`);
    return true;
  }

  deallocateAll() {
    console.log('🎯 Deallocating all tokens...');
    this.availableTokens = this.totalTokens;
    this.allocations.clear();
  }

  getAvailableTokens() {
    return this.availableTokens;
  }

  getTotalTokens() {
    return this.totalTokens;
  }

  getAllocatedTokens() {
    return this.totalTokens - this.availableTokens;
  }

  getActiveAllocations() {
    return Array.from(this.allocations.values());
  }

  getUtilization() {
    return (this.totalTokens - this.availableTokens) / this.totalTokens;
  }

  getMintedTokens() {
    return this.mintedTokens;
  }
}

module.exports = { AttentionTokenSystem };
