'use client';

'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Upload, 
  File, 
  Image as ImageIcon, 
  FileText, 
  Code, 
  Music, 
  Video, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Eye,
  Download,
  Trash2
} from 'lucide-react';

interface FileUploadProps {
  onUploadComplete?: (result: any) => void;
  onError?: (error: string) => void;
  maxFiles?: number;
  accept?: string;
  className?: string;
}

interface UploadedFile {
  id: string;
  file: File;
  type: 'image' | 'document' | 'code' | 'audio' | 'video' | 'other';
  status: 'uploading' | 'completed' | 'error';
  progress: number;
  result?: any;
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  onError,
  maxFiles = 5,
  accept = '*/*',
  className
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>('general');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="h-5 w-5" />;
      case 'document': return <FileText className="h-5 w-5" />;
      case 'code': return <Code className="h-5 w-5" />;
      case 'audio': return <Music className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      default: return <File className="h-5 w-5" />;
    }
  };

  const getFileType = (file: File): 'image' | 'document' | 'code' | 'audio' | 'video' | 'other' => {
    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();
    
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('audio/')) return 'audio';
    if (type.startsWith('video/')) return 'video';
    if (type.includes('pdf') || type.includes('document') || type.includes('word') || type.includes('excel') || type.includes('powerpoint')) return 'document';
    if (name.endsWith('.js') || name.endsWith('.ts') || name.endsWith('.jsx') || name.endsWith('.tsx') || 
        name.endsWith('.py') || name.endsWith('.java') || name.endsWith('.cpp') || name.endsWith('.c') ||
        name.endsWith('.cs') || name.endsWith('.php') || name.endsWith('.rb') || name.endsWith('.go') ||
        name.endsWith('.rs') || name.endsWith('.swift') || name.endsWith('.kt') || name.endsWith('.html') ||
        name.endsWith('.css') || name.endsWith('.json') || name.endsWith('.xml') || name.endsWith('.yaml')) {
      return 'code';
    }
    
    return 'other';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
  }, []);

  const addFiles = (newFiles: File[]) => {
    const remainingSlots = maxFiles - files.length;
    if (remainingSlots <= 0) {
      onError?.('Maximum file limit reached');
      return;
    }

    const filesToAdd = newFiles.slice(0, remainingSlots);
    const uploadedFiles: UploadedFile[] = filesToAdd.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      type: getFileType(file),
      status: 'uploading',
      progress: 0
    }));

    setFiles(prev => [...prev, ...uploadedFiles]);
    
    // Upload each file
    uploadedFiles.forEach(uploadedFile => {
      uploadFile(uploadedFile);
    });
  };

  const uploadFile = async (uploadedFile: UploadedFile) => {
    const formData = new FormData();
    formData.append('file', uploadedFile.file);
    formData.append('fileType', uploadedFile.type);
    formData.append('analysis', selectedAnalysis);
    formData.append('userId', 'user_' + Date.now());

    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setFiles(prev => prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, progress }
              : f
          ));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const result = JSON.parse(xhr.responseText);
            setFiles(prev => prev.map(f => 
              f.id === uploadedFile.id 
                ? { ...f, status: 'completed', result, progress: 100 }
                : f
            ));
            onUploadComplete?.(result);
          } catch (error) {
            setFiles(prev => prev.map(f => 
              f.id === uploadedFile.id 
                ? { ...f, status: 'error', error: 'Invalid response' }
                : f
            ));
            onError?.('Invalid response from server');
          }
        } else {
          setFiles(prev => prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, status: 'error', error: `Upload failed: ${xhr.statusText}` }
              : f
          ));
          onError?.(`Upload failed: ${xhr.statusText}`);
        }
      });

      xhr.addEventListener('error', () => {
        setFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, status: 'error', error: 'Network error' }
            : f
        ));
        onError?.('Network error during upload');
      });

      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, status: 'error', error: 'Upload failed' }
          : f
      ));
      onError?.('Upload failed');
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAll = () => {
    setFiles([]);
  };

  const retryUpload = (uploadedFile: UploadedFile) => {
    setFiles(prev => prev.map(f => 
      f.id === uploadedFile.id 
        ? { ...f, status: 'uploading', progress: 0, error: undefined }
        : f
    ));
    uploadFile(uploadedFile);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            File Upload & Analysis
          </CardTitle>
          <CardDescription>
            Upload images, documents, code files, audio, or video for AI analysis. 
            Maximum {maxFiles} files, up to 100MB per file.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Analysis Type Selection */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Analysis Type:</label>
            <Select value={selectedAnalysis} onValueChange={setSelectedAnalysis}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Analysis</SelectItem>
                <SelectItem value="ocr">OCR (Text Extraction)</SelectItem>
                <SelectItem value="content-extraction">Content Extraction</SelectItem>
                <SelectItem value="security-scan">Security Scan</SelectItem>
                <SelectItem value="code-analysis">Code Analysis</SelectItem>
                <SelectItem value="transcription">Audio Transcription</SelectItem>
                <SelectItem value="thumbnail">Video Thumbnail</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? 'border-primary bg-primary/10' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={accept}
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-medium">
                  {isDragging ? 'Drop files here' : 'Drop files here or click to browse'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports images, documents, code, audio, and video files
                </p>
              </div>
              <Button variant="outline">
                Choose Files
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Uploaded Files ({files.length})</CardTitle>
              <CardDescription>
                {files.filter(f => f.status === 'completed').length} completed, 
                {files.filter(f => f.status === 'uploading').length} uploading, 
                {files.filter(f => f.status === 'error').length} failed
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={clearAll}>
              Clear All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map((uploadedFile) => (
                <div key={uploadedFile.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  {/* File Icon */}
                  <div className="flex-shrink-0">
                    {getFileIcon(uploadedFile.type)}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{uploadedFile.file.name}</p>
                      <Badge variant="secondary">{uploadedFile.type}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatFileSize(uploadedFile.file.size)}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      {uploadedFile.status === 'uploading' && (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <Progress value={uploadedFile.progress} className="w-24" />
                          <span className="text-sm text-muted-foreground">
                            {uploadedFile.progress}%
                          </span>
                        </>
                      )}
                      
                      {uploadedFile.status === 'completed' && (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">Completed</span>
                        </>
                      )}
                      
                      {uploadedFile.status === 'error' && (
                        <>
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-600">
                            {uploadedFile.error || 'Upload failed'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {uploadedFile.status === 'completed' && uploadedFile.result && (
                      <>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </>
                    )}
                    
                    {uploadedFile.status === 'error' && (
                      <Button size="sm" variant="outline" onClick={() => retryUpload(uploadedFile)}>
                        Retry
                      </Button>
                    )}
                    
                    <Button size="sm" variant="outline" onClick={() => removeFile(uploadedFile.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {files.some(f => f.status === 'completed' && f.result) && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              AI-powered analysis of uploaded files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="results" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="results">Results</TabsTrigger>
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>
              
              <TabsContent value="results" className="space-y-4">
                {files.filter(f => f.status === 'completed' && f.result).map((file) => (
                  <div key={file.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {getFileIcon(file.type)}
                      <span className="font-medium">{file.file.name}</span>
                    </div>
                    <pre className="text-sm bg-muted p-3 rounded overflow-auto max-h-64">
                      {JSON.stringify(file.result, null, 2)}
                    </pre>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="metadata" className="space-y-4">
                {files.filter(f => f.status === 'completed' && f.result).map((file) => (
                  <div key={file.id} className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">{file.file.name}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Type:</span>
                        <span className="ml-2">{file.type}</span>
                      </div>
                      <div>
                        <span className="font-medium">Size:</span>
                        <span className="ml-2">{formatFileSize(file.file.size)}</span>
                      </div>
                      <div>
                        <span className="font-medium">Analysis:</span>
                        <span className="ml-2">{selectedAnalysis}</span>
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>
                        <span className="ml-2 text-green-600">Completed</span>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="insights" className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <p>Detailed insights would be displayed here based on the analysis results.</p>
                  <p className="text-sm">This could include patterns, recommendations, and key findings.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUpload;
