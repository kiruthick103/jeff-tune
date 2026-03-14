import { z } from 'zod';

// Memory system schemas
export const UserMemorySchema = z.object({
  userId: z.string(),
  preferences: z.object({
    codingLanguage: z.string().optional(),
    codeStyle: z.string().optional(),
    framework: z.string().optional(),
    documentationStyle: z.string().optional(),
    responseLength: z.enum(['concise', 'detailed', 'comprehensive']).default('detailed'),
    complexity: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
  }),
  interactionHistory: z.array(z.object({
    timestamp: z.string(),
    type: z.enum(['code_generation', 'explanation', 'debugging', 'refactoring', 'chat']),
    input: z.string(),
    output: z.string(),
    feedback: z.enum(['positive', 'negative', 'neutral']).optional(),
    context: z.record(z.string(), z.unknown()).optional(),
  })),
  codePatterns: z.array(z.object({
    pattern: z.string(),
    language: z.string(),
    frequency: z.number(),
    lastUsed: z.string(),
    examples: z.array(z.string()),
  })),
  commonErrors: z.array(z.object({
    error: z.string(),
    language: z.string(),
    frequency: z.number(),
    solutions: z.array(z.string()),
    lastEncountered: z.string(),
  })),
  projectContexts: z.array(z.object({
    projectId: z.string(),
    name: z.string(),
    language: z.string(),
    frameworks: z.array(z.string()),
    lastAccessed: z.string(),
    fileStructure: z.record(z.string(), z.string()).optional(),
    dependencies: z.array(z.string()).optional(),
  })),
  learningProgress: z.object({
    topics: z.array(z.object({
      topic: z.string(),
      mastery: z.number().min(0).max(1),
      lastPracticed: z.string(),
      difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
      examplesCompleted: z.number(),
    })),
    overallProgress: z.number().min(0).max(1),
    streakDays: z.number(),
    lastActiveDate: z.string(),
  }),
  customInstructions: z.array(z.object({
    id: z.string(),
    instruction: z.string(),
    context: z.string(),
    isActive: z.boolean().default(true),
    createdAt: z.string(),
    usageCount: z.number().default(0),
  })),
});

export type UserMemory = z.infer<typeof UserMemorySchema>;

export class AIMemorySystem {
  private memories: Map<string, UserMemory> = new Map();
  private storageKey = 'jeff-ai-memory';

  constructor() {
    this.loadMemories();
  }

  // Memory persistence
  private loadMemories(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          const memories = JSON.parse(stored);
          Object.entries(memories).forEach(([userId, memory]) => {
            this.memories.set(userId, UserMemorySchema.parse(memory));
          });
        }
      } catch (error) {
        console.error('Failed to load memories:', error);
      }
    }
  }

  private saveMemories(): void {
    if (typeof window !== 'undefined') {
      try {
        const memoriesObject = Object.fromEntries(this.memories);
        localStorage.setItem(this.storageKey, JSON.stringify(memoriesObject));
      } catch (error) {
        console.error('Failed to save memories:', error);
      }
    }
  }

  // User memory management
  getMemory(userId: string): UserMemory {
    if (!this.memories.has(userId)) {
      const newMemory: UserMemory = {
        userId,
        preferences: {
          responseLength: 'detailed',
          complexity: 'intermediate',
        },
        interactionHistory: [],
        codePatterns: [],
        commonErrors: [],
        projectContexts: [],
        learningProgress: {
          topics: [],
          overallProgress: 0,
          streakDays: 0,
          lastActiveDate: new Date().toISOString(),
        },
        customInstructions: [],
      };
      this.memories.set(userId, newMemory);
      this.saveMemories();
    }
    return this.memories.get(userId)!;
  }

  updateMemory(userId: string, updates: Partial<UserMemory>): void {
    const memory = this.getMemory(userId);
    const updatedMemory = { ...memory, ...updates };
    this.memories.set(userId, updatedMemory);
    this.saveMemories();
  }

  // Interaction tracking
  recordInteraction(userId: string, interaction: Omit<UserMemory['interactionHistory'][0], 'timestamp'>): void {
    const memory = this.getMemory(userId);
    const interactionWithTimestamp = {
      ...interaction,
      timestamp: new Date().toISOString(),
    };
    
    memory.interactionHistory.push(interactionWithTimestamp);
    
    // Keep only last 100 interactions
    if (memory.interactionHistory.length > 100) {
      memory.interactionHistory = memory.interactionHistory.slice(-100);
    }
    
    this.saveMemories();
  }

  // Pattern learning
  learnCodePattern(userId: string, pattern: string, language: string, example: string): void {
    const memory = this.getMemory(userId);
    const existingPattern = memory.codePatterns.find(p => p.pattern === pattern && p.language === language);
    
    if (existingPattern) {
      existingPattern.frequency += 1;
      existingPattern.lastUsed = new Date().toISOString();
      if (!existingPattern.examples.includes(example)) {
        existingPattern.examples.push(example);
      }
    } else {
      memory.codePatterns.push({
        pattern,
        language,
        frequency: 1,
        lastUsed: new Date().toISOString(),
        examples: [example],
      });
    }
    
    this.saveMemories();
  }

  // Error learning
  recordError(userId: string, error: string, language: string, solution: string): void {
    const memory = this.getMemory(userId);
    const existingError = memory.commonErrors.find(e => e.error === error && e.language === language);
    
    if (existingError) {
      existingError.frequency += 1;
      existingError.lastEncountered = new Date().toISOString();
      if (!existingError.solutions.includes(solution)) {
        existingError.solutions.push(solution);
      }
    } else {
      memory.commonErrors.push({
        error,
        language,
        frequency: 1,
        solutions: [solution],
        lastEncountered: new Date().toISOString(),
      });
    }
    
    this.saveMemories();
  }

  // Project context management
  updateProjectContext(userId: string, projectId: string, name: string, language: string, frameworks: string[]): void {
    const memory = this.getMemory(userId);
    const existingContext = memory.projectContexts.find(p => p.projectId === projectId);
    
    if (existingContext) {
      existingContext.lastAccessed = new Date().toISOString();
      existingContext.frameworks = frameworks;
    } else {
      memory.projectContexts.push({
        projectId,
        name,
        language,
        frameworks,
        lastAccessed: new Date().toISOString(),
      });
    }
    
    this.saveMemories();
  }

  // Learning progress tracking
  updateLearningProgress(userId: string, topic: string, mastery: number, difficulty: 'beginner' | 'intermediate' | 'advanced'): void {
    const memory = this.getMemory(userId);
    const existingTopic = memory.learningProgress.topics.find(t => t.topic === topic);
    
    if (existingTopic) {
      existingTopic.mastery = Math.max(existingTopic.mastery, mastery);
      existingTopic.lastPracticed = new Date().toISOString();
      existingTopic.examplesCompleted += 1;
    } else {
      memory.learningProgress.topics.push({
        topic,
        mastery,
        lastPracticed: new Date().toISOString(),
        difficulty,
        examplesCompleted: 1,
      });
    }
    
    // Update overall progress
    const totalMastery = memory.learningProgress.topics.reduce((sum, t) => sum + t.mastery, 0);
    memory.learningProgress.overallProgress = totalMastery / Math.max(memory.learningProgress.topics.length, 1);
    
    // Update streak
    const today = new Date().toDateString();
    const lastActive = new Date(memory.learningProgress.lastActiveDate).toDateString();
    if (today !== lastActive) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastActive === yesterday.toDateString()) {
        memory.learningProgress.streakDays += 1;
      } else {
        memory.learningProgress.streakDays = 1;
      }
    }
    memory.learningProgress.lastActiveDate = new Date().toISOString();
    
    this.saveMemories();
  }

  // Custom instructions management
  addCustomInstruction(userId: string, instruction: string, context: string): string {
    const memory = this.getMemory(userId);
    const id = `custom_${Date.now()}`;
    
    memory.customInstructions.push({
      id,
      instruction,
      context,
      isActive: true,
      createdAt: new Date().toISOString(),
      usageCount: 0,
    });
    
    this.saveMemories();
    return id;
  }

  toggleCustomInstruction(userId: string, id: string): void {
    const memory = this.getMemory(userId);
    const instruction = memory.customInstructions.find(i => i.id === id);
    if (instruction) {
      instruction.isActive = !instruction.isActive;
      this.saveMemories();
    }
  }

  deleteCustomInstruction(userId: string, id: string): void {
    const memory = this.getMemory(userId);
    memory.customInstructions = memory.customInstructions.filter(i => i.id !== id);
    this.saveMemories();
  }

  // Personalization helpers
  getPersonalizedPrompt(userId: string, basePrompt: string, context: string): string {
    const memory = this.getMemory(userId);
    let personalizedPrompt = basePrompt;
    
    // Add custom instructions
    const activeInstructions = memory.customInstructions.filter(i => i.isActive && i.context === context);
    if (activeInstructions.length > 0) {
      personalizedPrompt += '\n\nCustom instructions:\n' + activeInstructions.map(i => i.instruction).join('\n');
    }
    
    // Add user preferences
    const { preferences } = memory;
    personalizedPrompt += `\n\nUser preferences:
- Response length: ${preferences.responseLength}
- Complexity level: ${preferences.complexity}
${preferences.codingLanguage ? `- Preferred language: ${preferences.codingLanguage}` : ''}
${preferences.codeStyle ? `- Code style: ${preferences.codeStyle}` : ''}
${preferences.framework ? `- Framework: ${preferences.framework}` : ''}`;
    
    // Add relevant patterns
    const relevantPatterns = memory.codePatterns.filter(p => 
      context.toLowerCase().includes(p.language.toLowerCase()) || 
      context.toLowerCase().includes(p.pattern.toLowerCase())
    ).slice(-5); // Last 5 relevant patterns
    
    if (relevantPatterns.length > 0) {
      personalizedPrompt += '\n\nUser frequently uses these patterns:\n' + 
        relevantPatterns.map(p => `- ${p.pattern} (${p.language})`).join('\n');
    }
    
    return personalizedPrompt;
  }

  // Analytics and insights
  getUserInsights(userId: string): {
    totalInteractions: number;
    favoriteLanguage: string;
    mostUsedPatterns: string[];
    commonErrors: string[];
    learningProgress: number;
    streakDays: number;
    projectCount: number;
  } {
    const memory = this.getMemory(userId);
    
    const languageCounts = memory.interactionHistory.reduce((acc, interaction) => {
      const lang = (interaction.context?.language as string) || 'unknown';
      acc[lang] = (acc[lang] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const favoriteLanguage = Object.entries(languageCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown';
    
    return {
      totalInteractions: memory.interactionHistory.length,
      favoriteLanguage,
      mostUsedPatterns: memory.codePatterns
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5)
        .map(p => p.pattern),
      commonErrors: memory.commonErrors
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5)
        .map(e => e.error),
      learningProgress: memory.learningProgress.overallProgress,
      streakDays: memory.learningProgress.streakDays,
      projectCount: memory.projectContexts.length,
    };
  }

  // Memory cleanup
  cleanupOldMemories(userId: string, daysToKeep: number = 90): void {
    const memory = this.getMemory(userId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    // Clean old interactions
    memory.interactionHistory = memory.interactionHistory.filter(
      interaction => new Date(interaction.timestamp) > cutoffDate
    );
    
    // Clean old patterns with low frequency
    memory.codePatterns = memory.codePatterns.filter(
      pattern => pattern.frequency > 1 || new Date(pattern.lastUsed) > cutoffDate
    );
    
    // Clean old errors
    memory.commonErrors = memory.commonErrors.filter(
      error => error.frequency > 1 || new Date(error.lastEncountered) > cutoffDate
    );
    
    this.saveMemories();
  }

  // Export/Import functionality
  exportMemory(userId: string): string {
    const memory = this.getMemory(userId);
    return JSON.stringify(memory, null, 2);
  }

  importMemory(userId: string, memoryData: string): void {
    try {
      const importedMemory = UserMemorySchema.parse(JSON.parse(memoryData));
      importedMemory.userId = userId; // Ensure correct userId
      this.memories.set(userId, importedMemory);
      this.saveMemories();
    } catch (error) {
      throw new Error('Invalid memory data format');
    }
  }
}

// Singleton instance
export const aiMemory = new AIMemorySystem();
