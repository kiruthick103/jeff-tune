'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Code, 
  BookOpen, 
  Bug, 
  RefreshCw, 
  Zap, 
  FileText, 
  TestTube, 
  Shield, 
  FolderOpen, 
  GitBranch, 
  Terminal, 
  Database, 
  Cpu, 
  Globe,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface FeatureResponse {
  success: boolean;
  feature: string;
  result: string;
  timestamp: string;
}

const CodingFeaturesPanel = () => {
  const [activeTab, setActiveTab] = useState('core-coding');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<FeatureResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states for different features
  const [codeGeneration, setCodeGeneration] = useState({
    prompt: '',
    language: 'javascript',
    framework: '',
    description: '',
    requirements: ''
  });

  const [codeExplanation, setCodeExplanation] = useState({
    code: '',
    language: 'javascript',
    detailLevel: 'intermediate',
    focusAreas: ''
  });

  const [debugging, setDebugging] = useState({
    code: '',
    error: '',
    language: 'javascript',
    expectedBehavior: ''
  });

  const [refactoring, setRefactoring] = useState({
    code: '',
    language: 'javascript',
    refactoringType: 'optimize',
    targetPattern: ''
  });

  const languages = [
    'javascript', 'typescript', 'python', 'java', 'cpp', 'go', 'rust', 'php', 'ruby', 'csharp'
  ];

  const frameworks = {
    javascript: ['React', 'Vue', 'Angular', 'Express', 'Next.js'],
    python: ['Django', 'Flask', 'FastAPI', 'TensorFlow', 'PyTorch'],
    java: ['Spring', 'Spring Boot', 'Hibernate', 'Maven'],
    typescript: ['React', 'Angular', 'Express', 'Nest.js']
  };

  const callFeature = async (feature: string, params: Record<string, any>) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/coding/features', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feature,
          params
        })
      });

      const data = await res.json();

      if (data.success) {
        setResponse(data);
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch (err) {
      setError('Failed to connect to the API');
    } finally {
      setLoading(false);
    }
  };

  const CoreCodingFeatures = () => (
    <div className="space-y-6">
      {/* Code Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Code Generation
          </CardTitle>
          <CardDescription>
            Generate code from natural language prompts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe what you want to build..."
            value={codeGeneration.prompt}
            onChange={(e) => setCodeGeneration({...codeGeneration, prompt: e.target.value})}
            className="min-h-[100px]"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select value={codeGeneration.language} onValueChange={(value) => setCodeGeneration({...codeGeneration, language: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Framework (optional)"
              value={codeGeneration.framework}
              onChange={(e) => setCodeGeneration({...codeGeneration, framework: e.target.value})}
            />
          </div>
          <Textarea
            placeholder="Additional description (optional)"
            value={codeGeneration.description}
            onChange={(e) => setCodeGeneration({...codeGeneration, description: e.target.value})}
          />
          <Textarea
            placeholder="Requirements (comma-separated, optional)"
            value={codeGeneration.requirements}
            onChange={(e) => setCodeGeneration({...codeGeneration, requirements: e.target.value})}
          />
          <Button 
            onClick={() => callFeature('generate-code', {
              ...codeGeneration,
              requirements: codeGeneration.requirements ? codeGeneration.requirements.split(',').map(r => r.trim()) : []
            })}
            disabled={loading || !codeGeneration.prompt}
            className="w-full"
          >
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Code className="h-4 w-4 mr-2" />}
            Generate Code
          </Button>
        </CardContent>
      </Card>

      {/* Code Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Code Explanation
          </CardTitle>
          <CardDescription>
            Explain code in simple language
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste your code here..."
            value={codeExplanation.code}
            onChange={(e) => setCodeExplanation({...codeExplanation, code: e.target.value})}
            className="min-h-[150px] font-mono"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select value={codeExplanation.language} onValueChange={(value) => setCodeExplanation({...codeExplanation, language: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={codeExplanation.detailLevel} onValueChange={(value) => setCodeExplanation({...codeExplanation, detailLevel: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Detail level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input
            placeholder="Focus areas (comma-separated, optional)"
            value={codeExplanation.focusAreas}
            onChange={(e) => setCodeExplanation({...codeExplanation, focusAreas: e.target.value})}
          />
          <Button 
            onClick={() => callFeature('explain-code', {
              ...codeExplanation,
              focusAreas: codeExplanation.focusAreas ? codeExplanation.focusAreas.split(',').map(f => f.trim()) : []
            })}
            disabled={loading || !codeExplanation.code}
            className="w-full"
          >
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <BookOpen className="h-4 w-4 mr-2" />}
            Explain Code
          </Button>
        </CardContent>
      </Card>

      {/* Debugging */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Debug Code
          </CardTitle>
          <CardDescription>
            Debug and fix code errors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste your code with bugs..."
            value={debugging.code}
            onChange={(e) => setDebugging({...debugging, code: e.target.value})}
            className="min-h-[150px] font-mono"
          />
          <Textarea
            placeholder="Error message (if any)"
            value={debugging.error}
            onChange={(e) => setDebugging({...debugging, error: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select value={debugging.language} onValueChange={(value) => setDebugging({...debugging, language: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Expected behavior (optional)"
              value={debugging.expectedBehavior}
              onChange={(e) => setDebugging({...debugging, expectedBehavior: e.target.value})}
            />
          </div>
          <Button 
            onClick={() => callFeature('debug-code', debugging)}
            disabled={loading || !debugging.code}
            className="w-full"
          >
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Bug className="h-4 w-4 mr-2" />}
            Debug Code
          </Button>
        </CardContent>
      </Card>

      {/* Refactoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Refactor Code
          </CardTitle>
          <CardDescription>
            Refactor and optimize code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste code to refactor..."
            value={refactoring.code}
            onChange={(e) => setRefactoring({...refactoring, code: e.target.value})}
            className="min-h-[150px] font-mono"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select value={refactoring.language} onValueChange={(value) => setRefactoring({...refactoring, language: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={refactoring.refactoringType} onValueChange={(value) => setRefactoring({...refactoring, refactoringType: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Refactoring type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="optimize">Optimize</SelectItem>
                <SelectItem value="clean">Clean</SelectItem>
                <SelectItem value="modularize">Modularize</SelectItem>
                <SelectItem value="secure">Secure</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input
            placeholder="Target pattern (optional)"
            value={refactoring.targetPattern}
            onChange={(e) => setRefactoring({...refactoring, targetPattern: e.target.value})}
          />
          <Button 
            onClick={() => callFeature('refactor-code', refactoring)}
            disabled={loading || !refactoring.code}
            className="w-full"
          >
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refactor Code
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const DeveloperProductivityFeatures = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Documentation
          </CardTitle>
          <CardDescription>
            Generate automatic documentation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste your code..."
            className="min-h-[150px] font-mono"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Doc type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javadoc">Javadoc</SelectItem>
                <SelectItem value="jsdoc">JSDoc</SelectItem>
                <SelectItem value="pydoc">PyDoc</SelectItem>
                <SelectItem value="inline">Inline</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full">
            <FileText className="h-4 w-4 mr-2" />
            Generate Documentation
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Generate Unit Tests
          </CardTitle>
          <CardDescription>
            Generate unit tests automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste your code..."
            className="min-h-[150px] font-mono"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Coverage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="comprehensive">Comprehensive</SelectItem>
                <SelectItem value="edge-cases">Edge Cases</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full">
            <TestTube className="h-4 w-4 mr-2" />
            Generate Tests
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Audit
          </CardTitle>
          <CardDescription>
            Detect security vulnerabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste your code for security analysis..."
            className="min-h-[150px] font-mono"
          />
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map(lang => (
                <SelectItem key={lang} value={lang}>{lang}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="w-full">
            <Shield className="h-4 w-4 mr-2" />
            Audit Security
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const ProjectAwareFeatures = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Analyze Project
          </CardTitle>
          <CardDescription>
            Full project/codebase understanding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Project path..." />
          <div className="grid grid-cols-2 gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Analysis type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="structure">Structure</SelectItem>
                <SelectItem value="dependencies">Dependencies</SelectItem>
                <SelectItem value="frameworks">Frameworks</SelectItem>
                <SelectItem value="architecture">Architecture</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Depth" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
                <SelectItem value="comprehensive">Comprehensive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full">
            <FolderOpen className="h-4 w-4 mr-2" />
            Analyze Project
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Generate Git Commit
          </CardTitle>
          <CardDescription>
            Git commit message generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe your changes..."
            className="min-h-[100px]"
          />
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Commit style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conventional">Conventional</SelectItem>
              <SelectItem value="semantic">Semantic</SelectItem>
              <SelectItem value="simple">Simple</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full">
            <GitBranch className="h-4 w-4 mr-2" />
            Generate Commit Message
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const TerminalDevOpsFeatures = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Execute Terminal Command
          </CardTitle>
          <CardDescription>
            Run terminal commands safely
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe the command you want to execute..."
            className="min-h-[100px]"
          />
          <Input placeholder="Environment (optional)" />
          <Button className="w-full">
            <Terminal className="h-4 w-4 mr-2" />
            Generate Command
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Generate Database Schema
          </CardTitle>
          <CardDescription>
            Create database schemas automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe your database requirements..."
            className="min-h-[100px]"
          />
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Database type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="postgresql">PostgreSQL</SelectItem>
              <SelectItem value="mysql">MySQL</SelectItem>
              <SelectItem value="mongodb">MongoDB</SelectItem>
              <SelectItem value="redis">Redis</SelectItem>
              <SelectItem value="elasticsearch">Elasticsearch</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full">
            <Database className="h-4 w-4 mr-2" />
            Generate Schema
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const AdvancedAIFeatures = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Generate Full Application
          </CardTitle>
          <CardDescription>
            Build full applications from prompt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe the application you want to build..."
            className="min-h-[150px]"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="App type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="web">Web App</SelectItem>
                <SelectItem value="mobile">Mobile App</SelectItem>
                <SelectItem value="desktop">Desktop App</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="microservices">Microservices</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Complexity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Simple</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="complex">Complex</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input placeholder="Tech stack (comma-separated, optional)" />
          <Button className="w-full">
            <Globe className="h-4 w-4 mr-2" />
            Generate Application
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Convert Code Between Languages
          </CardTitle>
          <CardDescription>
            Convert code between programming languages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste your source code..."
            className="min-h-[150px] font-mono"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Source language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Target language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full">
            <Cpu className="h-4 w-4 mr-2" />
            Convert Code
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Jeff AI Pro - Coding Features</h1>
        <p className="text-muted-foreground">
          Comprehensive AI-powered development tools
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="core-coding" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Core Coding
          </TabsTrigger>
          <TabsTrigger value="productivity" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Productivity
          </TabsTrigger>
          <TabsTrigger value="project-aware" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Project Aware
          </TabsTrigger>
          <TabsTrigger value="devops" className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            DevOps
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            Advanced AI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="core-coding" className="space-y-6">
          <CoreCodingFeatures />
        </TabsContent>

        <TabsContent value="productivity" className="space-y-6">
          <DeveloperProductivityFeatures />
        </TabsContent>

        <TabsContent value="project-aware" className="space-y-6">
          <ProjectAwareFeatures />
        </TabsContent>

        <TabsContent value="devops" className="space-y-6">
          <TerminalDevOpsFeatures />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <AdvancedAIFeatures />
        </TabsContent>
      </Tabs>

      {/* Response Display */}
      {response && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Response
            </CardTitle>
            <CardDescription>
              Feature: <Badge variant="secondary">{response.feature}</Badge>
              <span className="ml-2 text-xs text-muted-foreground">
                {new Date(response.timestamp).toLocaleString()}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
              {response.result}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CodingFeaturesPanel;
