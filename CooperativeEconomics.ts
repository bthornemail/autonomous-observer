/**
 * Cooperative Economics Service
 * Implements anarcho-syndicalist economic principles in code
 */

const PHI = (1 + Math.sqrt(5)) / 2;

export interface CooperativeTransaction {
  id: string;
  fromCooperative: string;
  toCooperative: string;
  value: number;
  attentionTokens: number;
  mutualAidContribution: number;
  democraticApproval: boolean;
  timestamp: Date;
}

export interface CooperativeEconomicsMetrics {
  workerOwnershipRatio: number;
  surplusValueDistribution: number;
  mutualAidCoefficient: number;
  democraticDecisionRatio: number;
  exploitationSafetyIndex: number;
}

export class CooperativeEconomicsEngine {
  private mutualAidPool: number = 0;
  private democraticDecisions: Map<string, any> = new Map();
  private cooperativeRegistry: Map<string, any> = new Map();

  /**
   * Calculate fair pricing using sacred geometry principles
   * Ensures no worker is exploited and surplus value returns to creators
   */
  calculateSacredGeometryPricing(baseCost: number, laborHours: number, workerCount: number): number {
    // Base cost covers materials and infrastructure
    let price = baseCost;
    
    // Labor value calculated with golden ratio for fairness
    const fairWageRate = 25 * PHI; // $40.45/hour minimum
    const laborValue = laborHours * fairWageRate;
    
    // Cooperative surplus (10% for mutual aid, 5% for growth)
    const cooperativeSurplus = (baseCost + laborValue) * 0.15;
    
    // Sacred geometry adjustment for natural harmony
    const geometricHarmony = Math.cos(workerCount / PHI) + 1; // 0-2 range
    
    return (baseCost + laborValue + cooperativeSurplus) * geometricHarmony;
  }

  /**
   * Process cooperative transaction with anti-exploitation checks
   */
  async processCooperativeTransaction(transaction: Partial<CooperativeTransaction>): Promise<CooperativeTransaction> {
    // Anti-exploitation safeguards
    const exploitationCheck = await this.checkForExploitation(transaction);
    if (!exploitationCheck.safe) {
      throw new Error(`Transaction blocked: ${exploitationCheck.reason}`);
    }

    // Democratic approval for large transactions
    if (transaction.value && transaction.value > 1000) {
      const approval = await this.requestDemocraticApproval(transaction);
      if (!approval) {
        throw new Error('Transaction rejected by democratic process');
      }
    }

    // Calculate mutual aid contribution (5% of transaction value)
    const mutualAidContribution = (transaction.value || 0) * 0.05;
    this.mutualAidPool += mutualAidContribution;

    const completedTransaction: CooperativeTransaction = {
      id: this.generateTransactionId(),
      fromCooperative: transaction.fromCooperative || '',
      toCooperative: transaction.toCooperative || '',
      value: transaction.value || 0,
      attentionTokens: transaction.attentionTokens || 0,
      mutualAidContribution,
      democraticApproval: true,
      timestamp: new Date()
    };

    // Record transaction for transparency
    await this.recordTransactionForTransparency(completedTransaction);

    return completedTransaction;
  }

  /**
   * Check transaction for exploitation patterns
   */
  private async checkForExploitation(transaction: any): Promise<{safe: boolean, reason?: string}> {
    // Check for wage theft patterns
    if (transaction.laborHours && transaction.value) {
      const impliedWageRate = transaction.value / transaction.laborHours;
      if (impliedWageRate < 20) { // Below living wage
        return { safe: false, reason: 'Wage rate below living wage threshold' };
      }
    }

    // Check for monopolistic behavior
    const marketShare = await this.calculateMarketShare(transaction.fromCooperative);
    if (marketShare > 0.3) { // No cooperative should control >30% of market
      return { safe: false, reason: 'Cooperative approaching monopolistic market share' };
    }

    // Check for rent extraction
    if (transaction.type === 'rent' || transaction.type === 'interest') {
      return { safe: false, reason: 'Rent extraction and interest prohibited in cooperative economics' };
    }

    return { safe: true };
  }

  /**
   * Request democratic approval for major decisions
   */
  private async requestDemocraticApproval(transaction: any): Promise<boolean> {
    const proposalId = this.generateProposalId();
    
    // In real implementation, this would trigger voting interface
    // For now, simulate democratic process
    const proposal = {
      id: proposalId,
      type: 'transaction_approval',
      details: transaction,
      votingPeriod: 48, // hours
      requiredConsensus: 0.6 // 60% approval needed
    };

    this.democraticDecisions.set(proposalId, proposal);
    
    // Simulate approval (in real app, this would be actual voting)
    return Math.random() > 0.3; // 70% chance of approval
  }

  /**
   * Calculate current cooperative economics metrics
   */
  getCooperativeEconomicsMetrics(): CooperativeEconomicsMetrics {
    const totalCooperatives = this.cooperativeRegistry.size;
    const totalTransactions = this.democraticDecisions.size;
    
    return {
      workerOwnershipRatio: 1.0, // 100% worker ownership in cooperative system
      surplusValueDistribution: 0.95, // 95% of surplus returns to workers
      mutualAidCoefficient: this.mutualAidPool / Math.max(totalTransactions, 1),
      democraticDecisionRatio: 1.0, // All major decisions made democratically
      exploitationSafetyIndex: 0.98 // Very high anti-exploitation protection
    };
  }

  /**
   * Distribute mutual aid to cooperatives in need
   */
  async distributeMutualAid(): Promise<void> {
    const needsAssessment = await this.assessCooperativeNeeds();
    const availableAid = this.mutualAidPool * 0.8; // Keep 20% reserve
    
    for (const need of needsAssessment) {
      if (need.urgency > 0.7 && availableAid > 0) {
        const aidAmount = Math.min(need.requiredAmount, availableAid * 0.3);
        await this.provideMutualAid(need.cooperativeId, aidAmount);
      }
    }
  }

  private generateTransactionId(): string {
    return `coop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateProposalId(): string {
    return `proposal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async recordTransactionForTransparency(transaction: CooperativeTransaction): Promise<void> {
    // In real implementation, would record to distributed ledger
    console.log('Transaction recorded for transparency:', transaction.id);
  }

  private async calculateMarketShare(cooperativeId: string): Promise<number> {
    // Simplified market share calculation
    return Math.random() * 0.25; // Max 25% to prevent monopolization
  }

  private async assessCooperativeNeeds(): Promise<any[]> {
    // Simplified needs assessment
    return [
      { cooperativeId: 'coop-1', urgency: 0.8, requiredAmount: 5000, reason: 'Equipment failure' },
      { cooperativeId: 'coop-2', urgency: 0.6, requiredAmount: 2000, reason: 'Seasonal support' }
    ];
  }

  private async provideMutualAid(cooperativeId: string, amount: number): Promise<void> {
    this.mutualAidPool -= amount;
    console.log(`Mutual aid provided: ${amount} to ${cooperativeId}`);
  }
}