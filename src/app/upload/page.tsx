'use client';

import { useState } from 'react';
import FileUpload from '@/components/file-upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Image as ImageIcon, FileText, Code, Music, Video, Shield, Zap } from 'lucide-react';

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function UploadPage() {
  const [uploadResults, setUploadResults] = useState<any[]>([]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">AI File Analysis</h1>
          <p className="text-muted-foreground">
            Upload files for intelligent AI analysis and insights
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ImageIcon className="h-5 w-5" />
                Image Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="secondary">OCR</Badge>
                <Badge variant="secondary">Content Detection</Badge>
                <Badge variant="secondary">Security Scan</Badge>
                <p className="text-sm text-muted-foreground">
                  Extract text, identify objects, and analyze images with AI
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Document Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="secondary">Text Extraction</Badge>
                <Badge variant="secondary">Content Analysis</Badge>
                <Badge variant="secondary">Summary</Badge>
                <p className="text-sm text-muted-foreground">
                  Process PDFs, Word docs, and extract key information
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Code className="h-5 w-5" />
                Code Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="secondary">Quality Metrics</Badge>
                <Badge variant="secondary">Security Scan</Badge>
                <Badge variant="secondary">Refactoring</Badge>
                <p className="text-sm text-muted-foreground">
                  Analyze code quality, detect issues, and get suggestions
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Music className="h-5 w-5" />
                Audio Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="secondary">Transcription</Badge>
                <Badge variant="secondary">Analysis</Badge>
                <Badge variant="secondary">Format Detection</Badge>
                <p className="text-sm text-muted-foreground">
                  Convert speech to text and analyze audio content
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Video className="h-5 w-5" />
                Video Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="secondary">Thumbnail</Badge>
                <Badge variant="secondary">Metadata</Badge>
                <Badge variant="secondary">Duration</Badge>
                <p className="text-sm text-muted-foreground">
                  Generate thumbnails and analyze video content
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5" />
                Security Scanning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="secondary">Malware</Badge>
                <Badge variant="secondary">Privacy</Badge>
                <Badge variant="secondary">Validation</Badge>
                <p className="text-sm text-muted-foreground">
                  Scan files for security threats and privacy issues
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Component */}
        <FileUpload
          onUploadComplete={(result) => {
            setUploadResults(prev => [...prev, result]);
          }}
          onError={(error) => {
            console.error('Upload error:', error);
          }}
          maxFiles={5}
        />

        {/* Analysis Results */}
        {uploadResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>
                Latest {uploadResults.length} file analysis results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {uploadResults.map((result, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">File {index + 1}</h4>
                    <pre className="text-sm bg-muted p-3 rounded overflow-auto max-h-32">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Supported Formats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Supported Formats
            </CardTitle>
            <CardDescription>
              Comprehensive file format support with intelligent analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Images
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• JPG, PNG, GIF, BMP, WebP, SVG</li>
                  <li>• Up to 10MB per file</li>
                  <li>• OCR and content analysis</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documents
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• PDF, DOC, DOCX, TXT, RTF</li>
                  <li>• XLS, XLSX, PPT, PPTX</li>
                  <li>• Up to 50MB per file</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Code Files
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• JS, TS, JSX, TSX, Python</li>
                  <li>• Java, C++, C#, Go, Rust</li>
                  <li>• Up to 5MB per file</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Music className="h-4 w-4" />
                  Audio
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• MP3, WAV, OGG, FLAC, AAC</li>
                  <li>• M4A, WMA</li>
                  <li>• Up to 25MB per file</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Video
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• MP4, AVI, MOV, WMV</li>
                  <li>• FLV, WebM, MKV, M4V</li>
                  <li>• Up to 100MB per file</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Features
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Drag & drop upload</li>
                  <li>• Real-time progress</li>
                  <li>• Multi-file analysis</li>
                  <li>• Security scanning</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
