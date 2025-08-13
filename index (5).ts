/**
 * 🌉 Universal Life Protocol Web2-Web3 Bridge
 * Seamless transition layer for easy Web3 adoption
 */

import express from 'express'
import { ProgressiveWalletIntegration } from './wallet/ProgressiveIntegration'
import { AttentionTokenRewards } from './rewards/AttentionTokens'
import { OnboardingFlow } from './onboarding/OnboardingFlow'

export class Web2Web3Bridge {
  private app = express()
  private walletIntegration = new ProgressiveWalletIntegration()
  private tokenRewards = new AttentionTokenRewards()
  private onboarding = new OnboardingFlow()

  constructor() {
    this.setupRoutes()
  }

  private setupRoutes() {
    // Traditional auth endpoints
    this.app.post('/auth/login', this.handleTraditionalLogin.bind(this))
    this.app.post('/auth/register', this.handleTraditionalRegister.bind(this))
    
    // Progressive Web3 integration
    this.app.get('/wallet/status', this.getWalletStatus.bind(this))
    this.app.post('/wallet/connect', this.connectWallet.bind(this))
    
    // AttentionToken rewards for Web2 actions
    this.app.post('/rewards/earn', this.earnTokens.bind(this))
    this.app.get('/rewards/balance', this.getTokenBalance.bind(this))
    
    // Onboarding and education
    this.app.get('/onboarding/start', this.startOnboarding.bind(this))
    this.app.post('/onboarding/complete', this.completeStep.bind(this))
  }

  private async handleTraditionalLogin(req: express.Request, res: express.Response) {
    // Traditional email/password login with progressive Web3 hints
    const { email, password } = req.body
    
    try {
      const user = await this.authenticateUser(email, password)
      const walletHint = await this.walletIntegration.getSoftWalletHint(user)
      
      res.json({
        success: true,
        user,
        web3_hint: walletHint,
        attention_tokens: await this.tokenRewards.getBalance(user.id)
      })
    } catch (error) {
      res.status(401).json({ error: 'Authentication failed' })
    }
  }

  private async handleTraditionalRegister(req: express.Request, res: express.Response) {
    // Traditional registration with optional Web3 preparation
    const { email, password, web3_interest = false } = req.body
    
    try {
      const user = await this.createUser(email, password)
      
      // Award welcome AttentionTokens
      await this.tokenRewards.award(user.id, 100, 'welcome_bonus')
      
      if (web3_interest) {
        await this.walletIntegration.prepareWalletOnboarding(user)
      }
      
      res.json({
        success: true,
        user,
        welcome_tokens: 100,
        onboarding_url: `/onboarding/start?user=${user.id}`
      })
    } catch (error) {
      res.status(400).json({ error: 'Registration failed' })
    }
  }

  private async getWalletStatus(req: express.Request, res: express.Response) {
    const userId = req.query.user_id as string
    const status = await this.walletIntegration.getStatus(userId)
    res.json(status)
  }

  private async connectWallet(req: express.Request, res: express.Response) {
    const { user_id, wallet_address, signature } = req.body
    
    try {
      await this.walletIntegration.connectWallet(user_id, wallet_address, signature)
      await this.tokenRewards.award(user_id, 250, 'wallet_connected')
      
      res.json({ 
        success: true,
        bonus_tokens: 250,
        web3_features_unlocked: true
      })
    } catch (error) {
      res.status(400).json({ error: 'Wallet connection failed' })
    }
  }

  private async earnTokens(req: express.Request, res: express.Response) {
    const { user_id, action, data } = req.body
    
    const reward = await this.tokenRewards.processAction(user_id, action, data)
    res.json({ tokens_earned: reward })
  }

  private async getTokenBalance(req: express.Request, res: express.Response) {
    const userId = req.query.user_id as string
    const balance = await this.tokenRewards.getBalance(userId)
    res.json({ balance })
  }

  private async startOnboarding(req: express.Request, res: express.Response) {
    const userId = req.query.user as string
    const flow = await this.onboarding.createFlow(userId)
    res.json(flow)
  }

  private async completeStep(req: express.Request, res: express.Response) {
    const { user_id, step_id, data } = req.body
    const next = await this.onboarding.completeStep(user_id, step_id, data)
    res.json(next)
  }

  // Helper methods
  private async authenticateUser(email: string, password: string) {
    // Traditional auth logic
    return { id: 'user_123', email, created_at: new Date() }
  }

  private async createUser(email: string, password: string) {
    // User creation logic
    return { id: 'user_new', email, created_at: new Date() }
  }

  start(port = 3002) {
    this.app.listen(port, () => {
      console.log(`🌉 Web2-Web3 Bridge active at http://localhost:${port}`)
    })
  }
}

export default Web2Web3Bridge