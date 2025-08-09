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
    if (!this.proofOfRelevance) {
      throw new Error('Proof of Relevance must be enabled before minting tokens');
    }

    if (!tokenData || typeof tokenData !== 'object') {
      throw new Error('Token data must be a valid object');
    }

    if (!tokenData.knowledge && tokenData.knowledge !== '') {
      throw new Error('Token must be backed by knowledge');
    }

    // Validate and sanitize token data
    const token = {
      id: this.mintedTokens.length,
      knowledge: String(tokenData.knowledge).substring(0, 1000),
      relevance: Math.max(0, Math.min(1, Number(tokenData.relevance) || 0.5)),
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

    if (!fromAccount || !toAccount) {
      throw new Error('Valid accounts required for transfer');
    }

    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error('Transfer amount must be positive');
    }

    // Simulate account system for testing
    const transfer = {
      id: Date.now(),
      from: String(fromAccount).substring(0, 50),
      to: String(toAccount).substring(0, 50),
      amount: amount,
      timestamp: Date.now(),
      completed: true
    };

    console.log(`🎯 Transferred ${amount} tokens from ${fromAccount} to ${toAccount}`);
    return transfer;
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
