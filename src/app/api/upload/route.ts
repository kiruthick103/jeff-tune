import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'edge';

// File upload schemas
const FileUploadSchema = z.object({
  file: z.any(),
  fileType: z.enum(['image', 'document', 'code', 'audio', 'video', 'other']),
  analysis: z.enum(['ocr', 'content-extraction', 'security-scan', 'format-validation']).optional(),
  userId: z.string().optional(),
});

const SUPPORTED_TYPES: Record<string, {
  extensions: string[];
  maxSize: number;
  mimeTypes: string[];
}> = {
  image: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'],
    maxSize: 10 * 1024 * 1024, // 10MB
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/svg+xml']
  },
  document: {
    extensions: ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt', '.xls', '.xlsx', '.ppt', '.pptx'],
    maxSize: 50 * 1024 * 1024, // 50MB
    mimeTypes: [
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'application/rtf', 'application/vnd.oasis.opendocument.text',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]
  },
  code: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.h', '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.r', '.sql', '.html', '.css', '.scss', '.less', '.xml', '.json', '.yaml', '.yml', '.md', '.sh', '.bat', '.ps1'],
    maxSize: 5 * 1024 * 1024, // 5MB
    mimeTypes: ['text/plain', 'text/html', 'text/css', 'application/json', 'application/xml', 'text/x-script']
  },
  audio: {
    extensions: ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a', '.wma'],
    maxSize: 25 * 1024 * 1024, // 25MB
    mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac', 'audio/mp4', 'audio/x-ms-wma']
  },
  video: {
    extensions: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v'],
    maxSize: 100 * 1024 * 1024, // 100MB
    mimeTypes: ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv', 'video/x-flv', 'video/webm', 'video/x-matroska']
  }
};

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 20; // uploads per minute

function getRateLimitKey(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = (forwarded?.split(',')[0]?.trim() || req.headers.get('cf-connecting-ip')?.trim() || 'unknown') as string;
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

function getFileType(filename: string, mimeType: string): 'image' | 'document' | 'code' | 'audio' | 'video' {
  const ext = '.' + filename.split('.').pop()?.toLowerCase();
  
  for (const [type, config] of Object.entries(SUPPORTED_TYPES)) {
    if (config.extensions.includes(ext) || config.mimeTypes.includes(mimeType)) {
      return type as 'image' | 'document' | 'code' | 'audio' | 'video';
    }
  }
  
  return 'code'; // Default fallback
}

function validateFile(file: File, fileType: 'image' | 'document' | 'code' | 'audio' | 'video'): { valid: boolean; error?: string } {
  const config = SUPPORTED_TYPES[fileType];
  
  if (!config) {
    return { valid: false, error: 'Unsupported file type' };
  }
  
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!config.extensions.includes(ext)) {
    return { valid: false, error: `Unsupported file extension. Supported: ${config.extensions.join(', ')}` };
  }
  
  if (!config.mimeTypes.includes(file.type)) {
    return { valid: false, error: `Unsupported MIME type. Supported: ${config.mimeTypes.join(', ')}` };
  }
  
  if (file.size > config.maxSize) {
    return { valid: false, error: `File too large. Maximum size: ${config.maxSize / (1024 * 1024)}MB` };
  }
  
  return { valid: true };
}

async function analyzeFile(file: File, fileType: 'image' | 'document' | 'code' | 'audio' | 'video', analysisType?: string): Promise<any> {
  switch (fileType) {
    case 'image':
      return await analyzeImage(file, analysisType);
    case 'document':
      return await analyzeDocument(file, analysisType);
    case 'code':
      return await analyzeCodeFile(file, analysisType);
    case 'audio':
      return await analyzeAudio(file, analysisType);
    case 'video':
      return await analyzeVideo(file, analysisType);
    default:
      return await analyzeGenericFile(file, analysisType);
  }
}

async function analyzeImage(file: File, analysisType?: string) {
  // Convert file to base64 for analysis
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const dataUrl = `data:${file.type};base64,${base64}`;
  
  const analysis = {
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type,
      dimensions: null,
      format: file.type.split('/')[1]?.toUpperCase()
    },
    analysis: {
      type: analysisType || 'general',
      timestamp: new Date().toISOString()
    }
  };
  
  // Simulate different analysis types
  switch (analysisType) {
    case 'ocr':
      return {
        ...analysis,
        ocr: {
          text: "Sample extracted text from image. This would contain the actual OCR results.",
          confidence: 0.92,
          language: "en",
          words: 156,
          paragraphs: 3
        }
      };
    
    case 'content-analysis':
      return {
        ...analysis,
        content: {
          description: "Image appears to contain code snippets or technical documentation",
          objects: ["text", "code", "diagram"],
          textRegions: [
            { x: 10, y: 20, width: 200, height: 100, confidence: 0.95 },
            { x: 220, y: 150, width: 180, height: 80, confidence: 0.88 }
          ],
          colors: ["#ffffff", "#000000", "#282c34", "#61dafb"],
          brightness: 0.7,
          contrast: 0.8
        }
      };
    
    case 'security-scan':
      return {
        ...analysis,
        security: {
          safe: true,
          threats: [],
          metadata: {
            exif: {},
            containsQrCode: false,
            containsSensitiveData: false
          }
        }
      };
    
    default:
      return {
        ...analysis,
        preview: dataUrl,
        metadata: {
          lastModified: new Date(file.lastModified).toISOString(),
          uploadedAt: new Date().toISOString()
        }
      };
  }
}

async function analyzeDocument(file: File, analysisType?: string) {
  const text = await extractTextFromFile(file);
  
  return {
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type,
      pages: estimatePages(file),
      format: file.type.split('/')[1]?.toUpperCase()
    },
    analysis: {
      type: analysisType || 'content-extraction',
      timestamp: new Date().toISOString(),
      extractedText: text.substring(0, 1000) + (text.length > 1000 ? '...' : ''),
      wordCount: text.split(/\s+/).length,
      characterCount: text.length,
      language: detectLanguage(text),
      keywords: extractKeywords(text),
      summary: generateSummary(text)
    }
  };
}

async function analyzeCodeFile(file: File, analysisType?: string) {
  const content = await file.text();
  
  const lines = content.split('\n');
  const language = detectCodeLanguage(file.name, content);
  
  return {
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type,
      lines: lines.length,
      language: language,
      format: file.name.split('.').pop()?.toUpperCase()
    },
    analysis: {
      type: analysisType || 'code-analysis',
      timestamp: new Date().toISOString(),
      codeMetrics: {
        functions: countFunctions(content, language),
        classes: countClasses(content, language),
        imports: countImports(content, language),
        comments: countComments(content, language),
        complexity: calculateComplexity(content, language),
        linesOfCode: lines.filter(line => line.trim() && !line.trim().startsWith('//')).length
      },
      dependencies: extractDependencies(content, language),
      potentialIssues: analyzeCodeIssues(content, language),
      suggestions: generateCodeSuggestions(content, language)
    }
  };
}

async function analyzeAudio(file: File, analysisType?: string) {
  return {
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type,
      duration: estimateAudioDuration(file),
      format: file.type.split('/')[1]?.toUpperCase()
    },
    analysis: {
      type: analysisType || 'audio-analysis',
      timestamp: new Date().toISOString(),
      audioFeatures: {
        sampleRate: 44100,
        channels: 2,
        bitrate: 320000,
        format: file.type.split('/')[1]
      },
      transcription: analysisType === 'transcription' ? "This would contain the transcribed audio content." : null,
      metadata: {
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: "Unknown",
        album: "Unknown",
        year: new Date().getFullYear()
      }
    }
  };
}

async function analyzeVideo(file: File, analysisType?: string) {
  return {
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type,
      duration: estimateVideoDuration(file),
      format: file.type.split('/')[1]?.toUpperCase()
    },
    analysis: {
      type: analysisType || 'video-analysis',
      timestamp: new Date().toISOString(),
      videoFeatures: {
        resolution: "1920x1080",
        frameRate: 30,
        bitrate: 5000000,
        codec: file.type.split('/')[1]
      },
      thumbnail: analysisType === 'thumbnail' ? "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" : null,
      metadata: {
        title: file.name.replace(/\.[^/.]+$/, ""),
        duration: estimateVideoDuration(file),
        created: new Date(file.lastModified).toISOString()
      }
    }
  };
}

async function analyzeGenericFile(file: File, analysisType?: string) {
  const content = await file.text();
  
  return {
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type,
      format: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN'
    },
    analysis: {
      type: analysisType || 'content-analysis',
      timestamp: new Date().toISOString(),
      content: content.substring(0, 500) + (content.length > 500 ? '...' : ''),
      encoding: 'utf-8',
      lineCount: content.split('\n').length,
      characterCount: content.length,
      isBinary: !isTextFile(content),
      detectedType: detectContentType(content)
    }
  };
}

// Helper functions
async function extractTextFromFile(file: File): Promise<string> {
  try {
    if (file.type === 'text/plain' || file.type.startsWith('text/')) {
      return await file.text();
    }
    
    // For other file types, this would integrate with appropriate libraries
    // For now, return placeholder text
    return `Extracted text from ${file.name}. This would contain the actual extracted content using appropriate libraries like PDF-parse, mammoth for Word documents, etc.`;
  } catch (error) {
    return `Error extracting text: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

function estimatePages(file: File): number {
  // Rough estimation based on file size
  const bytesPerPage = 5000; // Average bytes per page
  return Math.ceil(file.size / bytesPerPage);
}

function detectLanguage(text: string): string {
  // Simple language detection based on common words
  const englishWords = ['the', 'and', 'is', 'in', 'to', 'of', 'a', 'that', 'it', 'with'];
  const spanishWords = ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no'];
  const frenchWords = ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir'];
  
  const words = text.toLowerCase().split(/\s+/);
  const englishCount = words.filter(word => englishWords.includes(word)).length;
  const spanishCount = words.filter(word => spanishWords.includes(word)).length;
  const frenchCount = words.filter(word => frenchWords.includes(word)).length;
  
  if (englishCount > spanishCount && englishCount > frenchCount) return 'en';
  if (spanishCount > englishCount && spanishCount > frenchCount) return 'es';
  if (frenchCount > englishCount && frenchCount > spanishCount) return 'fr';
  
  return 'unknown';
}

function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().split(/\W+/);
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  const filtered = words.filter(word => word.length > 3 && !commonWords.includes(word));
  const counts = filtered.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(counts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
}

function generateSummary(text: string): string {
  // Simple extractive summary - take first and last sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length <= 2) return text.substring(0, 200);
  
  return sentences[0].trim() + '. ' + sentences[sentences.length - 1].trim() + '.';
}

function detectCodeLanguage(filename: string, content: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'swift': 'swift',
    'kt': 'kotlin',
    'scala': 'scala',
    'r': 'r',
    'sql': 'sql',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'md': 'markdown',
    'sh': 'bash',
    'bat': 'batch',
    'ps1': 'powershell'
  };
  
  return languageMap[ext || ''] || 'unknown';
}

function countFunctions(content: string, language: string): number {
  const patterns: Record<string, RegExp> = {
    javascript: /\bfunction\s+\w+|const\s+\w+\s*=\s*\(|=>\s*{/g,
    python: /\bdef\s+\w+/g,
    java: /\b(public\s+|private\s+|protected\s+)?(static\s+)?(abstract\s+)?(synchronized\s+)?\w+\s+\w+\s*\(/g,
    cpp: /\w+\s+\w+\s*\(/g
  };
  
  const pattern = patterns[language] || /\w+\s*\(/g;
  const matches = content.match(pattern);
  return matches ? matches.length : 0;
}

function countClasses(content: string, language: string): number {
  const patterns: Record<string, RegExp> = {
    javascript: /\bclass\s+\w+/g,
    python: /\bclass\s+\w+/g,
    java: /\bclass\s+\w+/g,
    cpp: /\bclass\s+\w+/g
  };
  
  const pattern = patterns[language] || /\bclass\s+\w+/g;
  const matches = content.match(pattern);
  return matches ? matches.length : 0;
}

function countImports(content: string, language: string): number {
  const patterns: Record<string, RegExp> = {
    javascript: /\bimport\s+.*from\s+['"][^'"]+['"]|require\(['"][^'"]+['"]\)/g,
    python: /\bimport\s+.*|from\s+.*\s+import/g,
    java: /\bimport\s+.*;/g,
    cpp: /\b#include\s+<[^>]+>/g
  };
  
  const pattern = patterns[language] || /\b(import|include|require)\b/g;
  const matches = content.match(pattern);
  return matches ? matches.length : 0;
}

function countComments(content: string, language: string): number {
  const patterns: Record<string, RegExp> = {
    javascript: /\/\/.*|\/\*[\s\S]*?\*\//g,
    python: /#.*|'''[\s\S]*?'''|"""[\s\S]*?"""/g,
    java: /\/\/.*|\/\*[\s\S]*?\*\//g,
    cpp: /\/\/.*|\/\*[\s\S]*?\*\//g
  };
  
  const pattern = patterns[language] || /\/\/.*|#.*|\/\*[\s\S]*?\*\//g;
  const matches = content.match(pattern);
  return matches ? matches.length : 0;
}

function calculateComplexity(content: string, language: string): number {
  const patterns: Record<string, RegExp> = {
    javascript: /\b(if|else|for|while|switch|case|catch|&&|\|\|)\b/g,
    python: /\b(if|elif|else|for|while|try|except|and|or)\b/g,
    java: /\b(if|else|for|while|switch|case|catch|&&|\|\|)\b/g,
    cpp: /\b(if|else|for|while|switch|case|catch|&&|\|\|)\b/g
  };
  
  const pattern = patterns[language] || /\b(if|else|for|while|switch|case)\b/g;
  const matches = content.match(pattern);
  return matches ? matches.length + 1 : 1;
}

function extractDependencies(content: string, language: string): string[] {
  const dependencies: string[] = [];
  
  if (language === 'javascript') {
    const imports = content.match(/from\s+['"]([^'"]+)['"]/g);
    if (imports) {
      dependencies.push(...imports.map(imp => imp.match(/from\s+['"]([^'"]+)['"]/)?.[1] || imp.match(/import\s+(\w+)/)?.[1] || '').filter(Boolean));
    }
  } else if (language === 'python') {
    const imports = content.match(/import\s+(\w+)|from\s+(\w+)/g);
    if (imports) {
      dependencies.push(...imports.map(imp => imp.split(/\s+/)[1]).filter(Boolean));
    }
  }
  
  return [...new Set(dependencies)];
}

function analyzeCodeIssues(content: string, language: string): Array<{type: string, severity: string, message: string, line?: number}> {
  const issues: Array<{type: string, severity: string, message: string, line?: number}> = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Check for common issues
    if (line.length > 120) {
      issues.push({
        type: 'long-line',
        severity: 'warning',
        message: 'Line exceeds 120 characters',
        line: index + 1
      });
    }
    
    if (line.includes('TODO') || line.includes('FIXME')) {
      issues.push({
        type: 'todo',
        severity: 'info',
        message: 'Unfinished work detected',
        line: index + 1
      });
    }
    
    if (line.includes('console.log') || line.includes('print(')) {
      issues.push({
        type: 'debug-statement',
        severity: 'warning',
        message: 'Debug statement found',
        line: index + 1
      });
    }
  });
  
  return issues;
}

function generateCodeSuggestions(content: string, language: string): string[] {
  const suggestions = [];
  
  if (content.includes('console.log') || content.includes('print(')) {
    suggestions.push('Remove debug statements before production');
  }
  
  if (content.split('\n').some(line => line.length > 120)) {
    suggestions.push('Consider breaking long lines for better readability');
  }
  
  if (!content.includes('/*') && !content.includes('//') && !content.includes('#')) {
    suggestions.push('Add comments to explain complex logic');
  }
  
  return suggestions;
}

function estimateAudioDuration(file: File): string {
  // Rough estimation based on file size (assuming average bitrate)
  const avgBitrate = 128000; // 128 kbps
  const durationSeconds = (file.size * 8) / avgBitrate;
  return formatDuration(durationSeconds);
}

function estimateVideoDuration(file: File): string {
  // Rough estimation based on file size (assuming average bitrate)
  const avgBitrate = 2000000; // 2 Mbps
  const durationSeconds = (file.size * 8) / avgBitrate;
  return formatDuration(durationSeconds);
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function isTextFile(content: string): boolean {
  try {
    // Check if content contains mostly printable ASCII characters
    const printableChars = content.match(/[\x20-\x7E]/g);
    return printableChars ? printableChars.length / content.length > 0.9 : false;
  } catch {
    return false;
  }
}

function detectContentType(content: string): string {
  if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
    return 'json';
  }
  if (content.includes('<!DOCTYPE') || content.includes('<html')) {
    return 'html';
  }
  if (content.includes('#!/bin/bash') || content.includes('echo ')) {
    return 'shell-script';
  }
  if (content.includes('import ') || content.includes('from ')) {
    return 'python-code';
  }
  if (content.includes('function ') || content.includes('const ')) {
    return 'javascript-code';
  }
  return 'text';
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

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('fileType') as string;
    const analysis = formData.get('analysis') as string;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file
    const detectedFileType = getFileType(file.name, file.type);
    const finalFileType = (fileType || detectedFileType) as 'image' | 'document' | 'code' | 'audio' | 'video';
    const validation = validateFile(file, finalFileType);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Analyze file
    const result = await analyzeFile(file, finalFileType, analysis);

    return NextResponse.json({
      success: true,
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        fileType: finalFileType
      },
      analysis: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    supportedTypes: Object.keys(SUPPORTED_TYPES),
    limits: Object.entries(SUPPORTED_TYPES).reduce((acc, [type, config]) => {
      acc[type] = {
        extensions: config.extensions,
        maxSize: config.maxSize,
        mimeTypes: config.mimeTypes
      };
      return acc;
    }, {} as Record<string, any>),
    analysisTypes: {
      image: ['ocr', 'content-analysis', 'security-scan'],
      document: ['content-extraction', 'security-scan'],
      code: ['code-analysis', 'security-scan'],
      audio: ['transcription', 'audio-analysis'],
      video: ['thumbnail', 'video-analysis']
    },
    documentation: 'Jeff AI Pro - File Upload & Analysis API',
    version: '1.0.0'
  });
}
