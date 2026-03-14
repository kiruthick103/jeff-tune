import { z } from 'zod';

// Code intelligence schemas
export const CodeAnalysisSchema = z.object({
  language: z.string(),
  framework: z.string().optional(),
  complexity: z.enum(['low', 'medium', 'high']),
  patterns: z.array(z.object({
    type: z.string(),
    name: z.string(),
    confidence: z.number().min(0).max(1),
    location: z.string(),
    description: z.string(),
  })),
  smells: z.array(z.object({
    type: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    description: z.string(),
    location: z.string(),
    suggestion: z.string(),
  })),
  metrics: z.object({
    linesOfCode: z.number(),
    cyclomaticComplexity: z.number(),
    maintainabilityIndex: z.number(),
    technicalDebt: z.string(),
    testCoverage: z.number().min(0).max(1),
  }),
  dependencies: z.array(z.object({
    name: z.string(),
    version: z.string(),
    type: z.enum(['internal', 'external', 'dev']),
    security: z.object({
      vulnerabilities: z.number(),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
    }).optional(),
  })),
  security: z.object({
    vulnerabilities: z.array(z.object({
      type: z.string(),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      description: z.string(),
      location: z.string(),
      recommendation: z.string(),
    })),
    bestPractices: z.array(z.object({
      practice: z.string(),
      compliance: z.boolean(),
      suggestion: z.string(),
    })),
  }),
  performance: z.object({
    bottlenecks: z.array(z.object({
      type: z.string(),
      location: z.string(),
      impact: z.enum(['low', 'medium', 'high']),
      optimization: z.string(),
    })),
    recommendations: z.array(z.string()),
  }),
});

export type CodeAnalysis = z.infer<typeof CodeAnalysisSchema>;

export class AdvancedCodeIntelligence {
  // AST Analysis
  static async analyzeAST(code: string, language: string): Promise<{
    structure: any;
    patterns: string[];
    complexity: number;
    dependencies: string[];
  }> {
    // This would integrate with language-specific parsers
    // For now, return a placeholder implementation
    const lines = code.split('\n').length;
    const complexity = Math.min(lines / 10, 10); // Simple complexity calculation
    
    return {
      structure: { type: 'program', body: [] },
      patterns: this.detectPatterns(code, language),
      complexity,
      dependencies: this.extractDependencies(code, language),
    };
  }

  // Pattern Recognition
  static detectPatterns(code: string, language: string): string[] {
    const patterns: string[] = [];
    
    // Common patterns across languages
    if (code.includes('class ')) patterns.push('object-oriented');
    if (code.includes('function') || code.includes('def ')) patterns.push('functional');
    if (code.includes('async') || code.includes('await')) patterns.push('asynchronous');
    if (code.includes('try') && code.includes('catch')) patterns.push('error-handling');
    if (code.includes('import') || code.includes('require')) patterns.push('modular');
    
    // Language-specific patterns
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'typescript':
        if (code.includes('useState') || code.includes('useEffect')) patterns.push('react-hooks');
        if (code.includes('=>')) patterns.push('arrow-functions');
        if (code.includes('Promise')) patterns.push('promises');
        if (code.includes('async/await')) patterns.push('async-await');
        break;
      case 'python':
        if (code.includes('def ') && code.includes('self')) patterns.push('class-methods');
        if (code.includes('@')) patterns.push('decorators');
        if (code.includes('lambda:')) patterns.push('lambda-functions');
        break;
      case 'java':
        if (code.includes('@Override')) patterns.push('annotations');
        if (code.includes('implements')) patterns.push('interfaces');
        if (code.includes('extends')) patterns.push('inheritance');
        break;
    }
    
    return [...new Set(patterns)]; // Remove duplicates
  }

  // Dependency Extraction
  static extractDependencies(code: string, language: string): string[] {
    const dependencies: string[] = [];
    const lines = code.split('\n');
    
    lines.forEach(line => {
      const trimmed = line.trim();
      
      switch (language.toLowerCase()) {
        case 'javascript':
        case 'typescript':
          if (trimmed.startsWith('import ')) {
            const match = trimmed.match(/from ['"]([^'"]+)['"]/);
            if (match) dependencies.push(match[1]);
          }
          if (trimmed.startsWith('require(')) {
            const match = trimmed.match(/require\(['"]([^'"]+)['"]\)/);
            if (match) dependencies.push(match[1]);
          }
          break;
        case 'python':
          if (trimmed.startsWith('import ')) {
            const parts = trimmed.split(' ');
            if (parts.length > 1) dependencies.push(parts[1]);
          }
          if (trimmed.startsWith('from ')) {
            const match = trimmed.match(/from ['"]([^'"]+)['"] import/);
            if (match) dependencies.push(match[1]);
          }
          break;
        case 'java':
          if (trimmed.startsWith('import ')) {
            const parts = trimmed.split(' ');
            if (parts.length > 1) dependencies.push(parts[1].replace(';', ''));
          }
          break;
      }
    });
    
    return [...new Set(dependencies)];
  }

  // Code Quality Analysis
  static async analyzeCodeQuality(code: string, language: string): Promise<{
    score: number;
    issues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      message: string;
      line: number;
    }>;
    metrics: {
      maintainability: number;
      complexity: number;
      duplication: number;
      coverage: number;
    };
  }> {
    const lines = code.split('\n');
    const issues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      message: string;
      line: number;
    }> = [];
    let score = 100;
    
    // Basic quality checks
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Long lines
      if (line.length > 120) {
        issues.push({
          type: 'long-line',
          severity: 'low',
          message: 'Line exceeds 120 characters',
          line: index + 1,
        });
        score -= 1;
      }
      
      // TODO comments
      if (trimmed.includes('TODO') || trimmed.includes('FIXME')) {
        issues.push({
          type: 'todo-comment',
          severity: 'medium',
          message: 'Unfinished work detected',
          line: index + 1,
        });
        score -= 2;
      }
      
      // Console logs
      if (trimmed.includes('console.log') || trimmed.includes('print(')) {
        issues.push({
          type: 'debug-statement',
          severity: 'low',
          message: 'Debug statement found',
          line: index + 1,
        });
        score -= 1;
      }
      
      // Hard-coded values
      if (/=\s*\d+/.test(line) && !trimmed.includes('//')) {
        issues.push({
          type: 'magic-number',
          severity: 'low',
          message: 'Magic number detected',
          line: index + 1,
        });
        score -= 1;
      }
    });
    
    // Calculate metrics
    const complexity = this.calculateComplexity(code, language);
    const maintainability = Math.max(0, 100 - complexity * 5);
    const duplication = this.calculateDuplication(code);
    const coverage = 0; // Would be calculated from test coverage
    
    score = Math.max(0, Math.min(100, score));
    
    return {
      score,
      issues,
      metrics: {
        maintainability,
        complexity,
        duplication,
        coverage,
      },
    };
  }

  // Complexity Calculation
  static calculateComplexity(code: string, language: string): number {
    let complexity = 1; // Base complexity
    
    const complexityKeywords: Record<string, string[]> = {
      javascript: ['if', 'else', 'while', 'for', 'switch', 'case', 'catch', '&&', '||'],
      python: ['if', 'elif', 'else', 'while', 'for', 'try', 'except', 'and', 'or'],
      java: ['if', 'else', 'while', 'for', 'switch', 'case', 'catch', '&&', '||'],
    };
    
    const keywords = complexityKeywords[language.toLowerCase()] || complexityKeywords.javascript;
    
    keywords.forEach((keyword: string) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = code.match(regex);
      if (matches) {
        complexity += matches.length;
      }
    });
    
    return complexity;
  }

  // Code Duplication
  static calculateDuplication(code: string): number {
    const lines = code.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const lineCount = lines.length;
    const uniqueLines = new Set(lines).size;
    
    return lineCount > 0 ? ((lineCount - uniqueLines) / lineCount) * 100 : 0;
  }

  // Security Analysis
  static async analyzeSecurity(code: string, language: string): Promise<{
    vulnerabilities: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      location: string;
      recommendation: string;
    }>;
    score: number;
  }> {
    const vulnerabilities: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      location: string;
      recommendation: string;
    }> = [];
    let score = 100;
    
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // SQL Injection patterns
      if (trimmed.includes('SELECT') || trimmed.includes('INSERT') || trimmed.includes('UPDATE')) {
        if (trimmed.includes('+') || trimmed.includes('${')) {
          vulnerabilities.push({
            type: 'sql-injection',
            severity: 'high',
            description: 'Potential SQL injection vulnerability',
            location: `Line ${index + 1}`,
            recommendation: 'Use parameterized queries or prepared statements',
          });
          score -= 20;
        }
      }
      
      // XSS patterns
      if (trimmed.includes('innerHTML') || trimmed.includes('document.write')) {
        vulnerabilities.push({
          type: 'xss',
          severity: 'high',
          description: 'Potential XSS vulnerability',
          location: `Line ${index + 1}`,
          recommendation: 'Sanitize user input before rendering',
        });
        score -= 15;
      }
      
      // Hard-coded secrets
      if (trimmed.includes('password') || trimmed.includes('secret') || trimmed.includes('api_key')) {
        if (trimmed.includes('=') && !trimmed.includes('env.')) {
          vulnerabilities.push({
            type: 'hardcoded-secret',
            severity: 'critical',
            description: 'Hard-coded secret detected',
            location: `Line ${index + 1}`,
            recommendation: 'Use environment variables for secrets',
          });
          score -= 25;
        }
      }
      
      // Weak crypto
      if (trimmed.includes('md5') || trimmed.includes('sha1')) {
        vulnerabilities.push({
          type: 'weak-cryptography',
          severity: 'medium',
          description: 'Weak cryptographic algorithm detected',
          location: `Line ${index + 1}`,
          recommendation: 'Use stronger algorithms like SHA-256 or bcrypt',
        });
        score -= 10;
      }
    });
    
    return {
      vulnerabilities,
      score: Math.max(0, score),
    };
  }

  // Performance Analysis
  static async analyzePerformance(code: string, language: string): Promise<{
    bottlenecks: Array<{
      type: string;
      location: string;
      impact: 'low' | 'medium' | 'high';
      optimization: string;
    }>;
    recommendations: string[];
    score: number;
  }> {
    const bottlenecks: Array<{
      type: string;
      location: string;
      impact: 'low' | 'medium' | 'high';
      optimization: string;
    }> = [];
    const recommendations: string[] = [];
    let score = 100;
    
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Nested loops
      if (trimmed.includes('for') && lines.slice(index + 1, index + 5).some(l => l.trim().includes('for'))) {
        bottlenecks.push({
          type: 'nested-loops',
          location: `Line ${index + 1}`,
          impact: 'high',
          optimization: 'Consider using more efficient algorithms or data structures',
        });
        score -= 15;
        recommendations.push('Optimize nested loops for better performance');
      }
      
      // Synchronous operations
      if (trimmed.includes('fs.') || trimmed.includes('readFileSync')) {
        bottlenecks.push({
          type: 'blocking-io',
          location: `Line ${index + 1}`,
          impact: 'medium',
          optimization: 'Use asynchronous operations for I/O',
        });
        score -= 10;
        recommendations.push('Use async/await for non-blocking I/O operations');
      }
      
      // Large object allocations in loops
      if (trimmed.includes('new ') && lines.slice(Math.max(0, index - 3), index).some(l => l.trim().includes('for'))) {
        bottlenecks.push({
          type: 'memory-allocation',
          location: `Line ${index + 1}`,
          impact: 'medium',
          optimization: 'Move object allocation outside loops when possible',
        });
        score -= 5;
        recommendations.push('Optimize memory allocation in loops');
      }
    });
    
    return {
      bottlenecks,
      recommendations: [...new Set(recommendations)],
      score: Math.max(0, score),
    };
  }

  // Smart Refactoring Suggestions
  static async suggestRefactoring(code: string, language: string): Promise<{
    suggestions: Array<{
      type: string;
      description: string;
      benefit: string;
      effort: 'low' | 'medium' | 'high';
      code: string;
    }>;
    overallScore: number;
  }> {
    const suggestions: Array<{
      type: string;
      description: string;
      benefit: string;
      effort: 'low' | 'medium' | 'high';
      code: string;
    }> = [];
    let overallScore = 100;
    
    const analysis = await this.analyzeCodeQuality(code, language);
    
    // Suggest based on issues found
    analysis.issues.forEach(issue => {
      switch (issue.type) {
        case 'long-line':
          suggestions.push({
            type: 'line-break',
            description: 'Break long lines for better readability',
            benefit: 'Improved code readability',
            effort: 'low',
            code: '// Break long lines at logical points',
          });
          break;
        case 'magic-number':
          suggestions.push({
            type: 'constants',
            description: 'Extract magic numbers into named constants',
            benefit: 'Better code maintainability',
            effort: 'low',
            code: 'const MAX_RETRY_ATTEMPTS = 3;',
          });
          break;
        case 'debug-statement':
          suggestions.push({
            type: 'remove-debug',
            description: 'Remove debug statements from production code',
            benefit: 'Cleaner production code',
            effort: 'low',
            code: '// Remove console.log statements',
          });
          break;
      }
    });
    
    overallScore = analysis.score;
    
    return {
      suggestions,
      overallScore,
    };
  }

  // Code Documentation Generation
  static async generateDocumentation(code: string, language: string): Promise<{
    overview: string;
    functions: Array<{
      name: string;
      description: string;
      parameters: Array<{
        name: string;
        type: string;
        description: string;
      }>;
      returns: string;
      examples: string[];
    }>;
    classes: Array<{
      name: string;
      description: string;
      methods: Array<{
        name: string;
        description: string;
        parameters: Array<{
          name: string;
          type: string;
          description: string;
        }>;
        returns: string;
      }>;
    }>;
  }> {
    // This would integrate with AST parsing for accurate documentation
    // For now, provide a basic implementation
    return {
      overview: `This ${language} code module contains various functions and classes for application functionality.`,
      functions: [],
      classes: [],
    };
  }

  // Comprehensive Code Analysis
  static async comprehensiveAnalysis(code: string, language: string): Promise<CodeAnalysis> {
    const [quality, security, performance] = await Promise.all([
      this.analyzeCodeQuality(code, language),
      this.analyzeSecurity(code, language),
      this.analyzePerformance(code, language),
    ]);
    
    const ast = await this.analyzeAST(code, language);
    
    return {
      language,
      complexity: ast.complexity > 5 ? 'high' : ast.complexity > 2 ? 'medium' : 'low',
      patterns: ast.patterns.map(pattern => ({
        type: pattern,
        name: pattern,
        confidence: 0.8,
        location: 'multiple',
        description: `Detected ${pattern} pattern in the code`,
      })),
      smells: quality.issues.map(issue => ({
        type: issue.type,
        severity: issue.severity as 'low' | 'medium' | 'high' | 'critical',
        description: issue.message,
        location: `Line ${issue.line}`,
        suggestion: 'Refactor to improve code quality',
      })),
      metrics: {
        linesOfCode: code.split('\n').length,
        cyclomaticComplexity: ast.complexity,
        maintainabilityIndex: quality.metrics.maintainability,
        technicalDebt: `${Math.round((100 - quality.score) * 0.5)}h`,
        testCoverage: quality.metrics.coverage,
      },
      dependencies: ast.dependencies.map(dep => ({
        name: dep,
        version: 'latest',
        type: 'external' as const,
      })),
      security: {
        vulnerabilities: security.vulnerabilities,
        bestPractices: [],
      },
      performance: {
        bottlenecks: performance.bottlenecks,
        recommendations: performance.recommendations,
      },
    };
  }
}
