import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CodingService } from '@/lib/ai/coding-service';
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
} from '@/lib/ai/coding-features';

export const runtime = 'edge';

// Request schema for the API
const CodingFeatureRequest = z.object({
  feature: z.enum([
    'generate-code',
    'explain-code', 
    'debug-code',
    'refactor-code',
    'autocomplete-code',
    'generate-documentation',
    'generate-readme',
    'generate-unit-tests',
    'suggest-design-patterns',
    'review-code',
    'audit-security',
    'analyze-project',
    'edit-multiple-files',
    'detect-dependencies',
    'detect-frameworks',
    'execute-multi-step-task',
    'fix-bug',
    'implement-feature',
    'scaffold-project',
    'generate-git-commit',
    'execute-terminal-command',
    'install-packages',
    'generate-docker',
    'generate-cicd',
    'setup-environment',
    'analyze-code-quality',
    'analyze-style',
    'improve-prompt',
    'optimize-performance',
    'generate-full-app',
    'generate-architecture-diagram',
    'generate-database-schema',
    'convert-code',
    'generate-api'
  ]),
  params: z.record(z.any(), z.unknown())
});

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 50; // requests per minute

function getRateLimitKey(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0] || req.headers.get('cf-connecting-ip') || 'unknown';
  return ip || 'unknown';
}

function checkRateLimit(req: NextRequest): boolean {
  const key = getRateLimitKey(req);
  const now = Date.now();
  const limit = rateLimitMap.get(key);

  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (limit.count >= RATE_LIMIT_MAX) {
    return false;
  }

  limit.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    if (!checkRateLimit(req)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { feature, params } = CodingFeatureRequest.parse(body);

    let result: string;

    switch (feature) {
      // CORE CODING FEATURES
      case 'generate-code':
        result = await CodingService.generateCode(CodeGenerationRequest.parse(params));
        break;
      
      case 'explain-code':
        result = await CodingService.explainCode(CodeExplanationRequest.parse(params));
        break;
      
      case 'debug-code':
        result = await CodingService.debugCode(DebuggingRequest.parse(params));
        break;
      
      case 'refactor-code':
        result = await CodingService.refactorCode(RefactoringRequest.parse(params));
        break;
      
      case 'autocomplete-code':
        result = await CodingService.autocompleteCode(AutocompleteRequest.parse(params));
        break;

      // DEVELOPER PRODUCTIVITY FEATURES
      case 'generate-documentation':
        result = await CodingService.generateDocumentation(DocumentationRequest.parse(params));
        break;
      
      case 'generate-readme':
        result = await CodingService.generateReadme(ReadmeRequest.parse(params));
        break;
      
      case 'generate-unit-tests':
        result = await CodingService.generateUnitTests(UnitTestRequest.parse(params));
        break;
      
      case 'suggest-design-patterns':
        result = await CodingService.suggestDesignPatterns(DesignPatternRequest.parse(params));
        break;
      
      case 'review-code':
        result = await CodingService.reviewCode(CodeReviewRequest.parse(params));
        break;
      
      case 'audit-security':
        result = await CodingService.auditSecurity(SecurityAuditRequest.parse(params));
        break;

      // PROJECT AWARENESS FEATURES
      case 'analyze-project':
        result = await CodingService.analyzeProject(ProjectAnalysisRequest.parse(params));
        break;
      
      case 'edit-multiple-files':
        result = await CodingService.editMultipleFiles(MultiFileEditRequest.parse(params));
        break;
      
      case 'detect-dependencies':
        result = await CodingService.detectDependencies(DependencyDetectionRequest.parse(params));
        break;
      
      case 'detect-frameworks':
        result = await CodingService.detectFrameworks(FrameworkDetectionRequest.parse(params));
        break;

      // AI AGENT FEATURES
      case 'execute-multi-step-task':
        result = await CodingService.executeMultiStepTask(MultiStepTaskRequest.parse(params));
        break;
      
      case 'fix-bug':
        result = await CodingService.fixBug(BugFixRequest.parse(params));
        break;
      
      case 'implement-feature':
        result = await CodingService.implementFeature(FeatureImplementationRequest.parse(params));
        break;
      
      case 'scaffold-project':
        result = await CodingService.scaffoldProject(ProjectScaffoldingRequest.parse(params));
        break;
      
      case 'generate-git-commit':
        result = await CodingService.generateGitCommit(GitCommitRequest.parse(params));
        break;

      // TERMINAL + DEVOPS FEATURES
      case 'execute-terminal-command':
        result = await CodingService.executeTerminalCommand(TerminalCommandRequest.parse(params));
        break;
      
      case 'install-packages':
        result = await CodingService.installPackages(PackageInstallationRequest.parse(params));
        break;
      
      case 'generate-docker':
        result = await CodingService.generateDocker(DockerGenerationRequest.parse(params));
        break;
      
      case 'generate-cicd':
        result = await CodingService.generateCICD(CICDRequest.parse(params));
        break;
      
      case 'setup-environment':
        result = await CodingService.setupEnvironment(EnvironmentSetupRequest.parse(params));
        break;

      // SMART ENHANCEMENTS
      case 'analyze-code-quality':
        result = await CodingService.analyzeCodeQuality(CodeQualityRequest.parse(params));
        break;
      
      case 'analyze-style':
        result = await CodingService.analyzeStyle(StyleAnalysisRequest.parse(params));
        break;
      
      case 'improve-prompt':
        result = await CodingService.improvePrompt(PromptImprovementRequest.parse(params));
        break;
      
      case 'optimize-performance':
        result = await CodingService.optimizePerformance(PerformanceOptimizationRequest.parse(params));
        break;

      // ADVANCED AI FEATURES
      case 'generate-full-app':
        result = await CodingService.generateFullApp(FullAppGenerationRequest.parse(params));
        break;
      
      case 'generate-architecture-diagram':
        result = await CodingService.generateArchitectureDiagram(ArchitectureDiagramRequest.parse(params));
        break;
      
      case 'generate-database-schema':
        result = await CodingService.generateDatabaseSchema(DatabaseSchemaRequest.parse(params));
        break;
      
      case 'convert-code':
        result = await CodingService.convertCode(CodeConversionRequest.parse(params));
        break;
      
      case 'generate-api':
        result = await CodingService.generateAPI(APIGenerationRequest.parse(params));
        break;

      default:
        return NextResponse.json(
          { error: 'Unknown feature' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      feature,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Coding feature error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for feature listing and documentation
export async function GET() {
  const features = {
    'core-coding': {
      'generate-code': 'Generate code from natural language prompts',
      'explain-code': 'Explain code in simple language',
      'debug-code': 'Debug and fix code errors',
      'refactor-code': 'Refactor and optimize code',
      'autocomplete-code': 'Smart code autocomplete suggestions'
    },
    'developer-productivity': {
      'generate-documentation': 'Generate automatic documentation',
      'generate-readme': 'Create README files',
      'generate-unit-tests': 'Generate unit tests automatically',
      'suggest-design-patterns': 'Suggest appropriate design patterns',
      'review-code': 'Provide code review suggestions',
      'audit-security': 'Detect security vulnerabilities'
    },
    'project-awareness': {
      'analyze-project': 'Full project/codebase understanding',
      'edit-multiple-files': 'Multi-file editing capabilities',
      'detect-dependencies': 'Dependency detection and analysis',
      'detect-frameworks': 'Framework detection and analysis'
    },
    'ai-agent': {
      'execute-multi-step-task': 'Execute multi-step coding tasks',
      'fix-bug': 'Automatic bug fixing',
      'implement-feature': 'Feature implementation across files',
      'scaffold-project': 'Project scaffolding (generate full apps)',
      'generate-git-commit': 'Git commit message generation'
    },
    'terminal-devops': {
      'execute-terminal-command': 'Run terminal commands safely',
      'install-packages': 'Install packages automatically',
      'generate-docker': 'Docker file generation',
      'generate-cicd': 'CI/CD pipeline suggestions',
      'setup-environment': 'Environment setup automation'
    },
    'smart-enhancements': {
      'analyze-code-quality': 'Real-time code quality score',
      'analyze-style': 'Learn user coding style',
      'improve-prompt': 'Prompt improvement suggestions',
      'optimize-performance': 'Performance optimization suggestions'
    },
    'advanced-ai': {
      'generate-full-app': 'Build full applications from prompt',
      'generate-architecture-diagram': 'Generate system architecture diagrams',
      'generate-database-schema': 'Create database schemas automatically',
      'convert-code': 'Convert code between programming languages',
      'generate-api': 'Generate API endpoints automatically'
    }
  };

  return NextResponse.json({
    features,
    documentation: 'Jeff AI Pro - Comprehensive Coding Assistant',
    version: '2.0.0',
    endpoints: {
      'POST /api/coding/features': 'Execute any coding feature',
      'GET /api/coding/features': 'List all available features'
    }
  });
}
