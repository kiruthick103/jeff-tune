import { z } from 'zod';

// Core coding features schemas
export const CodeGenerationRequest = z.object({
  prompt: z.string(),
  language: z.enum(['python', 'javascript', 'typescript', 'java', 'cpp', 'go', 'rust', 'php', 'ruby', 'csharp']),
  framework: z.string().optional(),
  description: z.string().optional(),
  requirements: z.array(z.string()).optional(),
});

export const CodeExplanationRequest = z.object({
  code: z.string(),
  language: z.string(),
  detailLevel: z.enum(['basic', 'intermediate', 'advanced']),
  focusAreas: z.array(z.string()).optional(),
});

export const DebuggingRequest = z.object({
  code: z.string(),
  error: z.string().optional(),
  language: z.string(),
  expectedBehavior: z.string().optional(),
});

export const RefactoringRequest = z.object({
  code: z.string(),
  language: z.string(),
  refactoringType: z.enum(['optimize', 'clean', 'modularize', 'secure', 'performance']),
  targetPattern: z.string().optional(),
});

export const AutocompleteRequest = z.object({
  code: z.string(),
  cursorPosition: z.number(),
  language: z.string(),
  context: z.string().optional(),
});

// Developer productivity features
export const DocumentationRequest = z.object({
  code: z.string(),
  language: z.string(),
  docType: z.enum(['javadoc', 'jsdoc', 'pydoc', 'inline']),
  style: z.string().optional(),
});

export const ReadmeRequest = z.object({
  projectType: z.string(),
  features: z.array(z.string()).optional(),
  techStack: z.array(z.string()).optional(),
  installation: z.string().optional(),
  usage: z.string().optional(),
});

export const UnitTestRequest = z.object({
  code: z.string(),
  language: z.string(),
  testFramework: z.string().optional(),
  coverage: z.enum(['basic', 'comprehensive', 'edge-cases']),
});

export const DesignPatternRequest = z.object({
  problem: z.string(),
  context: z.string(),
  language: z.string(),
  patterns: z.array(z.string()).optional(),
});

export const CodeReviewRequest = z.object({
  code: z.string(),
  language: z.string(),
  reviewType: z.enum(['security', 'performance', 'style', 'architecture', 'comprehensive']),
  standards: z.array(z.string()).optional(),
});

export const SecurityAuditRequest = z.object({
  code: z.string(),
  language: z.string(),
  vulnerabilityTypes: z.array(z.string()).optional(),
});

// Project awareness features
export const ProjectAnalysisRequest = z.object({
  projectPath: z.string(),
  analysisType: z.enum(['structure', 'dependencies', 'frameworks', 'architecture']),
  depth: z.enum(['overview', 'detailed', 'comprehensive']),
});

export const MultiFileEditRequest = z.object({
  files: z.array(z.object({
    path: z.string(),
    operation: z.enum(['create', 'update', 'delete']),
    content: z.string().optional(),
  })),
  description: z.string(),
});

export const DependencyDetectionRequest = z.object({
  projectPath: z.string(),
  includeDevDependencies: z.boolean().default(false),
});

export const FrameworkDetectionRequest = z.object({
  projectPath: z.string(),
  targetFrameworks: z.array(z.string()).optional(),
});

// AI Agent features
export const MultiStepTaskRequest = z.object({
  task: z.string(),
  steps: z.array(z.string()).optional(),
  context: z.string().optional(),
  autoExecute: z.boolean().default(false),
});

export const BugFixRequest = z.object({
  code: z.string(),
  error: z.string().optional(),
  language: z.string(),
  testResults: z.string().optional(),
});

export const FeatureImplementationRequest = z.object({
  feature: z.string(),
  projectContext: z.string(),
  files: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
});

export const ProjectScaffoldingRequest = z.object({
  projectType: z.enum(['web-app', 'api', 'mobile', 'desktop', 'cli', 'library']),
  techStack: z.array(z.string()),
  features: z.array(z.string()).optional(),
  architecture: z.string().optional(),
});

export const GitCommitRequest = z.object({
  changes: z.string(),
  commitStyle: z.enum(['conventional', 'semantic', 'simple']),
  context: z.string().optional(),
});

// Terminal + DevOps features
export const TerminalCommandRequest = z.object({
  task: z.string(),
  environment: z.string().optional(),
  safeMode: z.boolean().default(true),
});

export const PackageInstallationRequest = z.object({
  packages: z.array(z.string()),
  packageManager: z.enum(['npm', 'yarn', 'pnpm', 'pip', 'cargo', 'go-mod', 'nuget']),
  environment: z.string().optional(),
});

export const DockerGenerationRequest = z.object({
  projectType: z.string(),
  techStack: z.array(z.string()),
  requirements: z.array(z.string()).optional(),
});

export const CICDRequest = z.object({
  platform: z.enum(['github-actions', 'gitlab-ci', 'azure-pipelines', 'jenkins']),
  projectType: z.string(),
  deploymentTarget: z.string(),
  testing: z.boolean().default(true),
});

export const EnvironmentSetupRequest = z.object({
  projectType: z.string(),
  techStack: z.array(z.string()),
  environment: z.enum(['development', 'staging', 'production']),
});

// Smart enhancements
export const CodeQualityRequest = z.object({
  code: z.string(),
  language: z.string(),
  metrics: z.array(z.string()).optional(),
});

export const StyleAnalysisRequest = z.object({
  codeSamples: z.array(z.string()),
  language: z.string(),
  analysisType: z.enum(['patterns', 'naming', 'structure', 'comprehensive']),
});

export const PromptImprovementRequest = z.object({
  originalPrompt: z.string(),
  context: z.string(),
  targetModel: z.string().optional(),
});

export const PerformanceOptimizationRequest = z.object({
  code: z.string(),
  language: z.string(),
  optimizationType: z.enum(['speed', 'memory', 'scalability', 'comprehensive']),
});

// Advanced AI features
export const FullAppGenerationRequest = z.object({
  description: z.string(),
  appType: z.enum(['web', 'mobile', 'desktop', 'api', 'microservices']),
  techStack: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  complexity: z.enum(['simple', 'medium', 'complex']).default('medium'),
});

export const ArchitectureDiagramRequest = z.object({
  systemDescription: z.string(),
  diagramType: z.enum(['c4', 'uml', 'flowchart', 'sequence', 'component']),
  detailLevel: z.enum(['high', 'medium', 'low']),
});

export const DatabaseSchemaRequest = z.object({
  requirements: z.string(),
  databaseType: z.enum(['postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch']),
  relationships: z.boolean().default(true),
});

export const CodeConversionRequest = z.object({
  sourceCode: z.string(),
  sourceLanguage: z.string(),
  targetLanguage: z.string(),
  preserveLogic: z.boolean().default(true),
});

export const APIGenerationRequest = z.object({
  specification: z.string(),
  apiStyle: z.enum(['rest', 'graphql', 'grpc']),
  language: z.string(),
  framework: z.string().optional(),
});

export type CodeGenerationRequest = z.infer<typeof CodeGenerationRequest>;
export type CodeExplanationRequest = z.infer<typeof CodeExplanationRequest>;
export type DebuggingRequest = z.infer<typeof DebuggingRequest>;
export type RefactoringRequest = z.infer<typeof RefactoringRequest>;
export type AutocompleteRequest = z.infer<typeof AutocompleteRequest>;
export type DocumentationRequest = z.infer<typeof DocumentationRequest>;
export type ReadmeRequest = z.infer<typeof ReadmeRequest>;
export type UnitTestRequest = z.infer<typeof UnitTestRequest>;
export type DesignPatternRequest = z.infer<typeof DesignPatternRequest>;
export type CodeReviewRequest = z.infer<typeof CodeReviewRequest>;
export type SecurityAuditRequest = z.infer<typeof SecurityAuditRequest>;
export type ProjectAnalysisRequest = z.infer<typeof ProjectAnalysisRequest>;
export type MultiFileEditRequest = z.infer<typeof MultiFileEditRequest>;
export type DependencyDetectionRequest = z.infer<typeof DependencyDetectionRequest>;
export type FrameworkDetectionRequest = z.infer<typeof FrameworkDetectionRequest>;
export type MultiStepTaskRequest = z.infer<typeof MultiStepTaskRequest>;
export type BugFixRequest = z.infer<typeof BugFixRequest>;
export type FeatureImplementationRequest = z.infer<typeof FeatureImplementationRequest>;
export type ProjectScaffoldingRequest = z.infer<typeof ProjectScaffoldingRequest>;
export type GitCommitRequest = z.infer<typeof GitCommitRequest>;
export type TerminalCommandRequest = z.infer<typeof TerminalCommandRequest>;
export type PackageInstallationRequest = z.infer<typeof PackageInstallationRequest>;
export type DockerGenerationRequest = z.infer<typeof DockerGenerationRequest>;
export type CICDRequest = z.infer<typeof CICDRequest>;
export type EnvironmentSetupRequest = z.infer<typeof EnvironmentSetupRequest>;
export type CodeQualityRequest = z.infer<typeof CodeQualityRequest>;
export type StyleAnalysisRequest = z.infer<typeof StyleAnalysisRequest>;
export type PromptImprovementRequest = z.infer<typeof PromptImprovementRequest>;
export type PerformanceOptimizationRequest = z.infer<typeof PerformanceOptimizationRequest>;
export type FullAppGenerationRequest = z.infer<typeof FullAppGenerationRequest>;
export type ArchitectureDiagramRequest = z.infer<typeof ArchitectureDiagramRequest>;
export type DatabaseSchemaRequest = z.infer<typeof DatabaseSchemaRequest>;
export type CodeConversionRequest = z.infer<typeof CodeConversionRequest>;
export type APIGenerationRequest = z.infer<typeof APIGenerationRequest>;
