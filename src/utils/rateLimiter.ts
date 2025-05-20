export interface RateLimitConfig {
  maxRequestsPerMinute: number;
  maxRequestsPerDay: number;
}

export interface RateLimitStatus {
  canMakeRequest: boolean;
  nextAvailableTime?: Date;
  message?: string;
}

class RateLimiter {
  private minuteRequests: number = 0;
  private dayRequests: number = 0;
  private lastMinuteReset: Date = new Date();
  private lastDayReset: Date = new Date();
  
  // Config for Gemini 2.0 Flash free tier
  private config: RateLimitConfig = {
    maxRequestsPerMinute: 12, // Setting to 10 instead of 15 for safety margin
    maxRequestsPerDay: 1400, // Setting to 1400 instead of 1500 for safety margin
  };
  
  constructor() {
    this.resetCounters();
    
    // Load state from localStorage if available
    this.loadState();
    
    // Check if we need to reset counters based on elapsed time
    this.checkResets();
  }
  
  private loadState(): void {
    try {
      const savedState = localStorage.getItem('intellibuddy_rate_limits');
      if (savedState) {
        const state = JSON.parse(savedState);
        this.minuteRequests = state.minuteRequests || 0;
        this.dayRequests = state.dayRequests || 0;
        this.lastMinuteReset = new Date(state.lastMinuteReset || new Date());
        this.lastDayReset = new Date(state.lastDayReset || new Date());
      }
    } catch (error) {
      console.error("Failed to load rate limit state:", error);
    }
  }
  
  private saveState(): void {
    try {
      const state = {
        minuteRequests: this.minuteRequests,
        dayRequests: this.dayRequests,
        lastMinuteReset: this.lastMinuteReset.toISOString(),
        lastDayReset: this.lastDayReset.toISOString(),
      };
      localStorage.setItem('intellibuddy_rate_limits', JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save rate limit state:", error);
    }
  }
  
  private checkResets(): void {
    const now = new Date();
    
    // Check if a minute has passed
    if ((now.getTime() - this.lastMinuteReset.getTime()) > 60000) {
      this.minuteRequests = 0;
      this.lastMinuteReset = now;
    }
    
    // Check if a day has passed
    if ((now.getTime() - this.lastDayReset.getTime()) > 86400000) {
      this.dayRequests = 0;
      this.lastDayReset = now;
    }
    
    this.saveState();
  }
  
  private resetCounters(): void {
    this.minuteRequests = 0;
    this.dayRequests = 0;
    this.lastMinuteReset = new Date();
    this.lastDayReset = new Date();
  }
  
  public checkLimit(): RateLimitStatus {
    this.checkResets();
    
    // Check day limit first (more critical)
    if (this.dayRequests >= this.config.maxRequestsPerDay) {
      const resetTime = new Date(this.lastDayReset);
      resetTime.setDate(resetTime.getDate() + 1);
      
      return {
        canMakeRequest: false,
        nextAvailableTime: resetTime,
        message: `Daily request limit reached. Please try again tomorrow.`
      };
    }
    
    // Then check minute limit
    if (this.minuteRequests >= this.config.maxRequestsPerMinute) {
      const resetTime = new Date(this.lastMinuteReset);
      resetTime.setMinutes(resetTime.getMinutes() + 1);
      
      const secondsToWait = Math.ceil((resetTime.getTime() - new Date().getTime()) / 1000);
      
      return {
        canMakeRequest: false,
        nextAvailableTime: resetTime,
        message: `Rate limit reached. Please wait ${secondsToWait} seconds before sending another message.`
      };
    }
    
    return { canMakeRequest: true };
  }
  
  public incrementCounter(): void {
    this.checkResets();
    
    this.minuteRequests++;
    this.dayRequests++;
    
    this.saveState();
  }
  
  // Optional - get current status for UI display
  public getStatus(): { minute: number, day: number, minuteLimit: number, dayLimit: number } {
    this.checkResets();
    
    return {
      minute: this.minuteRequests,
      day: this.dayRequests,
      minuteLimit: this.config.maxRequestsPerMinute,
      dayLimit: this.config.maxRequestsPerDay,
    };
  }
}

// Export a singleton instance
export const rateLimiter = new RateLimiter();

export default rateLimiter;
