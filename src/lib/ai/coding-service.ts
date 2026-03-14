import { 
  CodeGenerationRequest, 
  CodeExplanationRequest, 
  DebuggingRequest, 
  RefactoringRequest,
  AutocompleteRequest,
  DocumentationRequest,
  ReadmeRequest,
  UnitTestRequest,
  DesignPatternRequest,
  CodeReviewRequest,
  SecurityAuditRequest,
  ProjectAnalysisRequest,
  MultiFileEditRequest,
  DependencyDetectionRequest,
  FrameworkDetectionRequest,
  MultiStepTaskRequest,
  BugFixRequest,
  FeatureImplementationRequest,
  ProjectScaffoldingRequest,
  GitCommitRequest,
  TerminalCommandRequest,
  PackageInstallationRequest,
  DockerGenerationRequest,
  CICDRequest,
  EnvironmentSetupRequest,
  CodeQualityRequest,
  StyleAnalysisRequest,
  PromptImprovementRequest,
  PerformanceOptimizationRequest,
  FullAppGenerationRequest,
  ArchitectureDiagramRequest,
  DatabaseSchemaRequest,
  CodeConversionRequest,
  APIGenerationRequest
} from './coding-features';

export class CodingService {
  // CORE CODING FEATURES
  
  static async generateCode(request: CodeGenerationRequest): Promise<string> {
    const { prompt, language, framework, description, requirements = [] } = request;
    
    const systemPrompt = `You are an expert software developer specializing in ${language}. 
Generate clean, production-ready code based on the user's requirements.
Follow best practices, include proper error handling, and add relevant comments.
${framework ? `Use the ${framework} framework.` : ''}
${requirements.length > 0 ? `Requirements: ${requirements.join(', ')}` : ''}`;

    const userPrompt = `Generate ${language} code for: ${prompt}
${description ? `Description: ${description}` : ''}
Please provide:
1. Complete, working code
2. Clear comments explaining key parts
3. Error handling where appropriate
4. Any necessary imports or dependencies`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  static async explainCode(request: CodeExplanationRequest): Promise<string> {
    const { code, language, detailLevel = 'intermediate', focusAreas = [] } = request;
    
    const systemPrompt = `You are an expert code educator. Explain ${language} code in ${detailLevel} detail.
${focusAreas.length > 0 ? `Focus on: ${focusAreas.join(', ')}` : 'Cover all important aspects'}
Use clear, simple language and provide practical examples.`;

    const userPrompt = `Explain this ${language} code:
\`\`\`${language}
${code}
\`\`\`

Please provide:
1. Overall purpose and functionality
2. Step-by-step breakdown
3. Key concepts and patterns used
4. Potential improvements or best practices`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  static async debugCode(request: DebuggingRequest): Promise<string> {
    const { code, error, language, expectedBehavior } = request;
    
    const systemPrompt = `You are an expert debugging specialist. Analyze ${language} code to identify and fix issues.
Provide clear explanations of problems and solutions.`;

    const userPrompt = `Debug this ${language} code:
\`\`\`${language}
${code}
\`\`\`
${error ? `Error: ${error}` : ''}
${expectedBehavior ? `Expected behavior: ${expectedBehavior}` : ''}

Please provide:
1. Identification of the issue(s)
2. Root cause analysis
3. Fixed code with explanations
4. Prevention strategies for similar issues`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  static async refactorCode(request: RefactoringRequest): Promise<string> {
    const { code, language, refactoringType, targetPattern } = request;
    
    const systemPrompt = `You are an expert code refactoring specialist. Improve ${language} code with focus on ${refactoringType}.
Maintain functionality while enhancing code quality.`;

    const userPrompt = `Refactor this ${language} code for ${refactoringType}:
\`\`\`${language}
${code}
\`\`\`
${targetPattern ? `Target pattern: ${targetPattern}` : ''}

Please provide:
1. Refactored code
2. Explanation of improvements made
3. Benefits of the refactoring
4. Any trade-offs or considerations`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  static async autocompleteCode(request: AutocompleteRequest): Promise<string> {
    const { code, cursorPosition, language, context } = request;
    
    const systemPrompt = `You are an expert code completion specialist. Provide intelligent code suggestions for ${language}.
Consider the surrounding context and best practices.`;

    const userPrompt = `Complete this ${language} code at cursor position:
\`\`\`${language}
${code}
\`\`\`
Cursor position: ${cursorPosition}
${context ? `Context: ${context}` : ''}

Provide the most relevant completion with:
1. Code snippet
2. Brief explanation
3. Any imports needed`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  // DEVELOPER PRODUCTIVITY FEATURES

  static async generateDocumentation(request: DocumentationRequest): Promise<string> {
    const { code, language, docType, style } = request;
    
    const systemPrompt = `You are a technical documentation expert. Generate ${docType} documentation for ${language} code.
${style ? `Use ${style} style.` : 'Follow standard conventions.'}`;

    const userPrompt = `Generate documentation for this ${language} code:
\`\`\`${language}
${code}
\`\`\`

Provide comprehensive documentation including:
1. Function/class descriptions
2. Parameter explanations
3. Return value documentation
4. Usage examples
5. Any important notes or warnings`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  static async generateReadme(request: ReadmeRequest): Promise<string> {
    const { projectType, features = [], techStack = [], installation, usage } = request;
    
    const systemPrompt = `You are a technical writer specializing in README files. Create comprehensive documentation for ${projectType} projects.`;

    const userPrompt = `Generate a README for a ${projectType} project.
${features.length > 0 ? `Features: ${features.join(', ')}` : ''}
${techStack.length > 0 ? `Tech Stack: ${techStack.join(', ')}` : ''}
${installation ? `Installation: ${installation}` : ''}
${usage ? `Usage: ${usage}` : ''}

Create a professional README with:
1. Project title and description
2. Features overview
3. Installation instructions
4. Usage examples
5. API documentation (if applicable)
6. Contributing guidelines
7. License information`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  static async generateUnitTests(request: UnitTestRequest): Promise<string> {
    const { code, language, testFramework, coverage = 'basic' } = request;
    
    const systemPrompt = `You are a testing expert. Generate ${coverage} unit tests for ${language} code.
${testFramework ? `Use ${testFramework} framework.` : 'Use standard testing practices.'}`;

    const userPrompt = `Generate unit tests for this ${language} code:
\`\`\`${language}
${code}
\`\`\`

Provide comprehensive tests including:
1. Happy path scenarios
2. Edge cases and error conditions
3. Boundary value testing
4. Mock implementations if needed
5. Test setup and teardown`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  static async suggestDesignPatterns(request: DesignPatternRequest): Promise<string> {
    const { problem, context, language, patterns = [] } = request;
    
    const systemPrompt = `You are a software architecture expert. Suggest appropriate design patterns for ${language} development.`;

    const userPrompt = `Suggest design patterns for:
Problem: ${problem}
Context: ${context}
Language: ${language}
${patterns.length > 0 ? `Consider these patterns: ${patterns.join(', ')}` : ''}

Provide:
1. Recommended pattern(s) with explanations
2. Implementation examples in ${language}
3. Benefits and trade-offs
4. When to use/avoid each pattern`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  static async reviewCode(request: CodeReviewRequest): Promise<string> {
    const { code, language, reviewType, standards = [] } = request;
    
    const systemPrompt = `You are a senior code reviewer. Perform ${reviewType} code review for ${language} code.
${standards.length > 0 ? `Follow these standards: ${standards.join(', ')}` : 'Follow industry best practices.'}`;

    const userPrompt = `Review this ${language} code for ${reviewType}:
\`\`\`${language}
${code}
\`\`\`

Provide detailed review covering:
1. Code quality assessment
2. Security vulnerabilities (if applicable)
3. Performance issues
4. Style and readability
5. Architecture concerns
6. Specific improvement suggestions`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  static async auditSecurity(request: SecurityAuditRequest): Promise<string> {
    const { code, language, vulnerabilityTypes = [] } = request;
    
    const systemPrompt = `You are a cybersecurity expert. Perform comprehensive security audit for ${language} code.`;

    const userPrompt = `Audit this ${language} code for security vulnerabilities:
\`\`\`${language}
${code}
\`\`\`
${vulnerabilityTypes.length > 0 ? `Focus on: ${vulnerabilityTypes.join(', ')}` : 'Check all common vulnerability types'}

Provide:
1. Identified vulnerabilities with severity levels
2. Exploitation scenarios
3. Remediation steps
4. Security best practices
5. Prevention strategies`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  // PROJECT AWARENESS FEATURES

  static async analyzeProject(request: ProjectAnalysisRequest): Promise<string> {
    const { projectPath, analysisType, depth } = request;
    
    const systemPrompt = `You are a software architecture expert. Perform ${depth} ${analysisType} analysis of projects.`;

    const userPrompt = `Analyze the project at: ${projectPath}
Type: ${analysisType}
Depth: ${depth}

Provide comprehensive analysis including:
1. Project structure overview
2. Key components and their relationships
3. Architecture patterns used
4. Dependencies and integrations
5. Strengths and potential improvements
6. Recommendations for optimization`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  static async editMultipleFiles(request: MultiFileEditRequest): Promise<string> {
    const { files, description } = request;
    
    const systemPrompt = `You are an expert software developer. Perform coordinated multi-file edits while maintaining consistency.`;

    const userPrompt = `Perform multi-file edits:
Description: ${description}
Files:
${files.map(f => `- ${f.path}: ${f.operation}`).join('\n')}

Provide:
1. Updated content for each file
2. Explanation of changes
3. Impact analysis
4. Any additional files that need modification`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  static async detectDependencies(request: DependencyDetectionRequest): Promise<string> {
    const { projectPath, includeDevDependencies } = request;
    
    const systemPrompt = `You are a dependency management expert. Analyze project dependencies and their relationships.`;

    const userPrompt = `Detect dependencies for project at: ${projectPath}
Include dev dependencies: ${includeDevDependencies}

Provide:
1. List of all dependencies
2. Dependency tree visualization
3. Version conflicts or issues
4. Security vulnerabilities
5. Optimization suggestions
6. Unused dependencies`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  static async detectFrameworks(request: FrameworkDetectionRequest): Promise<string> {
    const { projectPath, targetFrameworks = [] } = request;
    
    const systemPrompt = `You are a framework detection expert. Identify frameworks, libraries, and technologies used in projects.`;

    const userPrompt = `Detect frameworks in project at: ${projectPath}
${targetFrameworks.length > 0 ? `Target frameworks: ${targetFrameworks.join(', ')}` : 'Detect all frameworks'}

Provide:
1. Identified frameworks and versions
2. Framework configurations
3. Integration patterns
4. Compatibility assessment
5. Migration considerations`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  // AI AGENT FEATURES

  static async executeMultiStepTask(request: MultiStepTaskRequest): Promise<string> {
    const { task, steps = [], context, autoExecute } = request;
    
    const systemPrompt = `You are an AI agent capable of executing complex multi-step development tasks.
Break down tasks into actionable steps and execute them systematically.`;

    const userPrompt = `Execute multi-step task:
Task: ${task}
${steps.length > 0 ? `Steps: ${steps.join('\n')}` : 'Determine optimal steps'}
${context ? `Context: ${context}` : ''}
Auto-execute: ${autoExecute}

Provide:
1. Detailed step-by-step plan
2. Execution results for each step
3. Issues encountered and solutions
4. Final outcome verification`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  static async fixBug(request: BugFixRequest): Promise<string> {
    const { code, error, language, testResults } = request;
    
    const systemPrompt = `You are an expert debugging agent. Automatically identify and fix bugs in code.`;

    const userPrompt = `Fix bug in ${language} code:
\`\`\`${language}
${code}
\`\`\`
${error ? `Error: ${error}` : ''}
${testResults ? `Test results: ${testResults}` : ''}

Provide:
1. Bug identification and root cause
2. Fixed code with explanations
3. Verification steps
4. Prevention strategies`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  static async implementFeature(request: FeatureImplementationRequest): Promise<string> {
    const { feature, projectContext, files = [], constraints = [] } = request;
    
    const systemPrompt = `You are a full-stack development agent. Implement features across multiple files while maintaining code quality.`;

    const userPrompt = `Implement feature: ${feature}
Project context: ${projectContext}
${files.length > 0 ? `Files to modify: ${files.join(', ')}` : 'Determine relevant files'}
${constraints.length > 0 ? `Constraints: ${constraints.join(', ')}` : ''}

Provide:
1. Implementation plan
2. Code changes for each file
3. Integration points
4. Testing strategy
5. Documentation updates`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  static async scaffoldProject(request: ProjectScaffoldingRequest): Promise<string> {
    const { projectType, techStack, features = [], architecture } = request;
    
    const systemPrompt = `You are a project scaffolding expert. Generate complete project structures with best practices.`;

    const userPrompt = `Scaffold ${projectType} project:
Tech stack: ${techStack.join(', ')}
${features.length > 0 ? `Features: ${features.join(', ')}` : ''}
${architecture ? `Architecture: ${architecture}` : ''}

Provide:
1. Complete project structure
2. Configuration files
3. Boilerplate code
4. Setup instructions
5. Development workflow`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  static async generateGitCommit(request: GitCommitRequest): Promise<string> {
    const { changes, commitStyle, context } = request;
    
    const systemPrompt = `You are a Git expert. Generate meaningful commit messages following ${commitStyle} conventions.`;

    const userPrompt = `Generate commit message for:
Changes: ${changes}
Style: ${commitStyle}
${context ? `Context: ${context}` : ''}

Provide:
1. Commit message
2. Detailed description
3. Breaking changes (if any)
4. Issue references (if applicable)`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  // TERMINAL + DEVOPS FEATURES

  static async executeTerminalCommand(request: TerminalCommandRequest): Promise<string> {
    const { task, environment, safeMode } = request;
    
    const systemPrompt = `You are a DevOps expert. Generate safe and effective terminal commands.
${safeMode ? 'Prioritize safety and avoid destructive operations.' : 'Include advanced operations as needed.'}`;

    const userPrompt = `Generate terminal commands for: ${task}
${environment ? `Environment: ${environment}` : ''}
Safe mode: ${safeMode}

Provide:
1. Command sequence
2. Explanation of each command
3. Expected outputs
4. Safety considerations
5. Troubleshooting tips`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  static async installPackages(request: PackageInstallationRequest): Promise<string> {
    const { packages, packageManager, environment } = request;
    
    const systemPrompt = `You are a package management expert. Generate optimal package installation commands.`;

    const userPrompt = `Install packages: ${packages.join(', ')}
Package manager: ${packageManager}
${environment ? `Environment: ${environment}` : ''}

Provide:
1. Installation commands
2. Version recommendations
3. Dependency conflicts resolution
4. Configuration steps
5. Verification commands`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  static async generateDocker(request: DockerGenerationRequest): Promise<string> {
    const { projectType, techStack, requirements = [] } = request;
    
    const systemPrompt = `You are a Docker expert. Generate optimized Docker configurations for various project types.`;

    const userPrompt = `Generate Docker configuration for:
Project type: ${projectType}
Tech stack: ${techStack.join(', ')}
${requirements.length > 0 ? `Requirements: ${requirements.join(', ')}` : ''}

Provide:
1. Dockerfile
2. docker-compose.yml (if needed)
3. .dockerignore
4. Build and run commands
5. Optimization tips`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  static async generateCICD(request: CICDRequest): Promise<string> {
    const { platform, projectType, deploymentTarget, testing } = request;
    
    const systemPrompt = `You are a CI/CD expert. Generate comprehensive pipeline configurations for ${platform}.`;

    const userPrompt = `Generate ${platform} CI/CD pipeline:
Project type: ${projectType}
Deployment target: ${deploymentTarget}
Testing: ${testing}

Provide:
1. Pipeline configuration file
2. Build stages
3. Testing configuration
4. Deployment setup
5. Environment variables
6. Security considerations`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  static async setupEnvironment(request: EnvironmentSetupRequest): Promise<string> {
    const { projectType, techStack, environment } = request;
    
    const systemPrompt = `You are a DevOps expert. Generate comprehensive environment setup instructions.`;

    const userPrompt = `Setup ${environment} environment for:
Project type: ${projectType}
Tech stack: ${techStack.join(', ')}

Provide:
1. Prerequisites and system requirements
2. Installation steps
3. Configuration files
4. Environment variables
5. Verification steps
6. Troubleshooting guide`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  // SMART ENHANCEMENTS

  static async analyzeCodeQuality(request: CodeQualityRequest): Promise<string> {
    const { code, language, metrics = [] } = request;
    
    const systemPrompt = `You are a code quality expert. Analyze and provide comprehensive quality assessments.`;

    const userPrompt = `Analyze code quality for ${language} code:
\`\`\`${language}
${code}
\`\`\`
${metrics.length > 0 ? `Focus on metrics: ${metrics.join(', ')}` : 'Analyze all quality aspects'}

Provide:
1. Overall quality score
2. Specific metrics analysis
3. Code smells identification
4. Improvement recommendations
5. Best practices compliance`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  static async analyzeStyle(request: StyleAnalysisRequest): Promise<string> {
    const { codeSamples, language, analysisType } = request;
    
    const systemPrompt = `You are a code style expert. Analyze coding patterns and style consistency.`;

    const userPrompt = `Analyze ${language} coding style:
Analysis type: ${analysisType}
Code samples:
${codeSamples.map((sample, i) => `\nSample ${i + 1}:\n\`\`\`${language}\n${sample}\n\`\`\``).join('\n')}

Provide:
1. Style patterns identified
2. Consistency analysis
3. Naming conventions
4. Structure patterns
5. Improvement suggestions`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  static async improvePrompt(request: PromptImprovementRequest): Promise<string> {
    const { originalPrompt, context, targetModel } = request;
    
    const systemPrompt = `You are a prompt engineering expert. Improve prompts for better AI responses.`;

    const userPrompt = `Improve this prompt:
Original: ${originalPrompt}
Context: ${context}
${targetModel ? `Target model: ${targetModel}` : ''}

Provide:
1. Improved prompt
2. Explanation of improvements
3. Expected benefits
4. Alternative variations
5. Best practices applied`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  static async optimizePerformance(request: PerformanceOptimizationRequest): Promise<string> {
    const { code, language, optimizationType } = request;
    
    const systemPrompt = `You are a performance optimization expert. Analyze and optimize code for ${optimizationType}.`;

    const userPrompt = `Optimize ${language} code for ${optimizationType}:
\`\`\`${language}
${code}
\`\`\`

Provide:
1. Performance analysis
2. Bottlenecks identified
3. Optimized code
4. Performance improvements
5. Benchmarking suggestions`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  // ADVANCED AI FEATURES

  static async generateFullApp(request: FullAppGenerationRequest): Promise<string> {
    const { description, appType, techStack = [], features = [], complexity = 'medium' } = request;
    
    const systemPrompt = `You are a full-stack development expert. Generate complete applications with ${complexity} complexity.`;

    const userPrompt = `Generate full ${appType} application:
Description: ${description}
${techStack.length > 0 ? `Tech stack: ${techStack.join(', ')}` : ''}
${features.length > 0 ? `Features: ${features.join(', ')}` : ''}
Complexity: ${complexity}

Provide:
1. Complete application structure
2. All source files
3. Configuration files
4. Database schemas
5. API documentation
6. Deployment instructions`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  static async generateArchitectureDiagram(request: ArchitectureDiagramRequest): Promise<string> {
    const { systemDescription, diagramType, detailLevel } = request;
    
    const systemPrompt = `You are a software architecture expert. Generate ${diagramType} diagrams with ${detailLevel} detail.`;

    const userPrompt = `Generate ${diagramType} architecture diagram for:
${systemDescription}
Detail level: ${detailLevel}

Provide:
1. Diagram in Mermaid syntax
2. Component descriptions
3. Relationship explanations
4. Design decisions
5. Scalability considerations`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  static async generateDatabaseSchema(request: DatabaseSchemaRequest): Promise<string> {
    const { requirements, databaseType, relationships } = request;
    
    const systemPrompt = `You are a database design expert. Create optimized schemas for ${databaseType}.`;

    const userPrompt = `Generate database schema for:
Requirements: ${requirements}
Database type: ${databaseType}
Include relationships: ${relationships}

Provide:
1. Complete schema design
2. Table definitions
3. Relationships and constraints
4. Indexes and optimizations
5. Migration scripts`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  static async convertCode(request: CodeConversionRequest): Promise<string> {
    const { sourceCode, sourceLanguage, targetLanguage, preserveLogic } = request;
    
    const systemPrompt = `You are a code conversion expert. Convert code between programming languages while ${preserveLogic ? 'preserving exact logic' : 'adapting to target language idioms'}.`;

    const userPrompt = `Convert code from ${sourceLanguage} to ${targetLanguage}:
\`\`\`${sourceLanguage}
${sourceCode}
\`\`\`

Provide:
1. Converted code
2. Explanation of changes
3. Language-specific adaptations
4. Testing recommendations
5. Potential issues`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  static async generateAPI(request: APIGenerationRequest): Promise<string> {
    const { specification, apiStyle, language, framework } = request;
    
    const systemPrompt = `You are an API design expert. Generate ${apiStyle} APIs in ${language}${framework ? ` using ${framework}` : ''}.`;

    const userPrompt = `Generate ${apiStyle} API for:
Specification: ${specification}
Language: ${language}
${framework ? `Framework: ${framework}` : ''}

Provide:
1. Complete API implementation
2. Endpoint definitions
3. Request/response models
4. Authentication setup
5. Documentation
6. Testing examples`;

    return await this.callAI(systemPrompt, userPrompt);
  }

  // Helper method to call AI
  private static async callAI(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          model: 'moonshotai/Kimi-K2-Instruct-0905' // Use default model
        })
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract the actual message content from the streaming response
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content;
      }
      
      // Handle streaming response format
      if (data.content) {
        return data.content;
      }
      
      throw new Error('Invalid AI response format');
    } catch (error) {
      console.error('AI service call failed:', error);
      return `[AI Service Error: ${error instanceof Error ? error.message : 'Unknown error'}]\n\nSystem: ${systemPrompt}\n\nUser: ${userPrompt}`;
    }
  }
}
