import { z } from 'zod';

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
  
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((event: any) => void) | null;
    onerror: ((event: any) => void) | null;
    onend: (() => void) | null;
  }
}

// Voice interaction schemas
export const VoiceCommandSchema = z.object({
  command: z.string(),
  intent: z.enum(['code_generation', 'explanation', 'debugging', 'navigation', 'control']),
  confidence: z.number().min(0).max(1),
  parameters: z.record(z.string(), z.unknown()).optional(),
  language: z.string().default('en'),
  timestamp: z.string(),
});

export const SpeechRecognitionResult = z.object({
  transcript: z.string(),
  confidence: z.number().min(0).max(1),
  alternatives: z.array(z.object({
    transcript: z.string(),
    confidence: z.number().min(0).max(1),
  })),
  final: z.boolean(),
});

export type VoiceCommand = z.infer<typeof VoiceCommandSchema>;
export type SpeechRecognitionResult = z.infer<typeof SpeechRecognitionResult>;

export class VoiceInteractionSystem {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis;
  private isListening: boolean = false;
  private supportedLanguages: string[] = ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-BR', 'ru-RU', 'ja-JP', 'zh-CN'];
  private commandPatterns: Map<string, RegExp> = new Map();

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initializeCommandPatterns();
    this.setupSpeechRecognition();
  }

  private initializeCommandPatterns(): void {
    this.commandPatterns.set('code_generation', /\b(generate|create|write|build|make)\s+(code|function|class|component|app|program)\b/i);
    this.commandPatterns.set('explanation', /\b(explain|what|how|why|describe|tell\s+me)\b/i);
    this.commandPatterns.set('debugging', /\b(debug|fix|error|issue|problem|broken|not\s+working)\b/i);
    this.commandPatterns.set('navigation', /\b(go\s+to|navigate|open|show|switch|page)\b/i);
    this.commandPatterns.set('control', /\b(stop|pause|resume|clear|reset|save|export)\b/i);
  }

  private setupSpeechRecognition(): void {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognitionClass = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.recognition = new SpeechRecognitionClass();
      
      if (this.recognition) {
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
      }
    }
  }

  // Speech Recognition
  startListening(
    onResult: (result: SpeechRecognitionResult) => void,
    onError?: (error: string) => void,
    onEnd?: () => void
  ): void {
    if (!this.recognition) {
      onError?.('Speech recognition not supported in this browser');
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.isListening = true;

    this.recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;

      const alternatives = Array.from(result).slice(1).map((alt: any) => ({
        transcript: alt.transcript,
        confidence: alt.confidence,
      }));

      onResult({
        transcript,
        confidence,
        alternatives,
        final: result.isFinal,
      });
    };

    this.recognition.onerror = (event: any) => {
      const errorMessages: Record<string, string> = {
        'no-speech': 'No speech was detected.',
        'audio-capture': 'Microphone not available.',
        'not-allowed': 'Microphone permission denied.',
        'network': 'Network error occurred.',
      };

      onError?.(errorMessages[event.error] || `Speech recognition error: ${event.error}`);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd?.();
    };

    this.recognition.start();
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  // Speech Synthesis
  speak(
    text: string,
    options: {
      language?: string;
      rate?: number;
      pitch?: number;
      volume?: number;
      voice?: string;
    } = {}
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.lang = options.language || 'en-US';
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      // Select voice if specified
      if (options.voice) {
        const voices = this.synthesis.getVoices();
        const selectedVoice = voices.find(voice => voice.name === options.voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event}`));

      this.synthesis.speak(utterance);
    });
  }

  // Voice Command Processing
  processVoiceCommand(transcript: string): VoiceCommand | null {
    const cleanedTranscript = transcript.toLowerCase().trim();
    
    // Match against command patterns
    for (const [intent, pattern] of this.commandPatterns.entries()) {
      const match = cleanedTranscript.match(pattern);
      if (match) {
        return {
          command: transcript,
          intent: intent as any,
          confidence: 0.8,
          parameters: this.extractParameters(cleanedTranscript, intent),
          language: 'en',
          timestamp: new Date().toISOString(),
        };
      }
    }

    // No specific intent matched
    return {
      command: transcript,
      intent: 'explanation', // Default to explanation
      confidence: 0.5,
      parameters: { query: transcript },
      language: 'en',
      timestamp: new Date().toISOString(),
    };
  }

  private extractParameters(transcript: string, intent: string): Record<string, unknown> {
    const parameters: Record<string, unknown> = {};

    switch (intent) {
      case 'code_generation':
        // Extract language and description
        const languageMatch = transcript.match(/\b(in|using|with)\s+(javascript|python|java|typescript|cpp|go|rust|php|ruby|csharp)\b/i);
        if (languageMatch) {
          parameters.language = languageMatch[2];
        }

        // Extract what to generate
        const generateMatch = transcript.match(/\b(generate|create|write|build|make)\s+(a|an)?\s*([a-z\s]+)\b/i);
        if (generateMatch) {
          parameters.description = generateMatch[3].trim();
        }
        break;

      case 'explanation':
        parameters.query = transcript;
        break;

      case 'debugging':
        parameters.error = transcript;
        break;

      case 'navigation':
        const pageMatch = transcript.match(/\b(go\s+to|navigate|open|show)\s+([a-z\s]+)\b/i);
        if (pageMatch) {
          parameters.page = pageMatch[2].trim();
        }
        break;

      case 'control':
        parameters.action = transcript;
        break;
    }

    return parameters;
  }

  // Voice Feedback System
  async provideFeedback(
    command: VoiceCommand,
    result: any,
    options: {
      speak?: boolean;
      language?: string;
    } = {}
  ): Promise<string> {
    const feedback = this.generateFeedback(command, result);
    
    if (options.speak !== false) {
      await this.speak(feedback, { language: options.language });
    }

    return feedback;
  }

  private generateFeedback(command: VoiceCommand, result: any): string {
    const { intent, confidence } = command;

    if (confidence < 0.6) {
      return "I'm not sure I understood that correctly. Could you please repeat or rephrase your command?";
    }

    switch (intent) {
      case 'code_generation':
        if (result.success) {
          return "I've generated the code for you. You can find it in the editor.";
        } else {
          return "I had some trouble generating the code. Please check your request and try again.";
        }

      case 'explanation':
        return "Here's the explanation you requested. I've provided it in the response area.";

      case 'debugging':
        if (result.success) {
          return "I've analyzed the code and found some potential solutions for the issue.";
        } else {
          return "I couldn't identify the specific issue. Could you provide more details about the error?";
        }

      case 'navigation':
        return `Navigating to ${command.parameters?.page || 'the requested page'}.`;

      case 'control':
        return `Executing ${command.parameters?.action || 'the requested action'}.`;

      default:
        return "I've processed your request. Please check the response area for results.";
    }
  }

  // Language Support
  getSupportedLanguages(): string[] {
    return this.supportedLanguages;
  }

  setLanguage(language: string): void {
    if (this.supportedLanguages.includes(language)) {
      if (this.recognition) {
        this.recognition.lang = language;
      }
    } else {
      throw new Error(`Unsupported language: ${language}`);
    }
  }

  // Voice Training and Adaptation
  async trainVoiceProfile(
    userId: string,
    samples: Array<{ transcript: string; audio: Blob }>
  ): Promise<void> {
    // This would integrate with a voice recognition service for personalization
    // For now, store samples locally for future use
    const profileKey = `voice_profile_${userId}`;
    const existingProfile = localStorage.getItem(profileKey) || '{}';
    const profile = JSON.parse(existingProfile);
    
    profile.samples = samples;
    profile.lastTrained = new Date().toISOString();
    
    localStorage.setItem(profileKey, JSON.stringify(profile));
  }

  // Voice Commands for IDE Integration
  getIDECommands(): Array<{
    command: string;
    description: string;
    example: string;
    intent: string;
  }> {
    return [
      {
        command: 'Generate function',
        description: 'Create a new function',
        example: 'Generate a function that sorts an array',
        intent: 'code_generation',
      },
      {
        command: 'Explain code',
        description: 'Get explanation for selected code',
        example: 'Explain what this function does',
        intent: 'explanation',
      },
      {
        command: 'Debug error',
        description: 'Help debug current error',
        example: 'Debug this syntax error',
        intent: 'debugging',
      },
      {
        command: 'Go to coding',
        description: 'Navigate to coding features',
        example: 'Go to coding features',
        intent: 'navigation',
      },
      {
        command: 'Stop listening',
        description: 'Stop voice recognition',
        example: 'Stop listening',
        intent: 'control',
      },
    ];
  }

  // Voice Analytics
  getVoiceAnalytics(userId: string): {
    totalCommands: number;
    commandDistribution: Record<string, number>;
    averageConfidence: number;
    mostUsedLanguage: string;
    errorRate: number;
  } {
    const analyticsKey = `voice_analytics_${userId}`;
    const analytics = JSON.parse(localStorage.getItem(analyticsKey) || '{}');

    return {
      totalCommands: analytics.totalCommands || 0,
      commandDistribution: analytics.commandDistribution || {},
      averageConfidence: analytics.averageConfidence || 0,
      mostUsedLanguage: analytics.mostUsedLanguage || 'en-US',
      errorRate: analytics.errorRate || 0,
    };
  }

  // Voice Settings
  updateVoiceSettings(settings: {
    language?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
    voice?: string;
  }): void {
    if (settings.language && this.supportedLanguages.includes(settings.language)) {
      this.setLanguage(settings.language);
    }

    // Store settings for future use
    const currentSettings = JSON.parse(localStorage.getItem('voice_settings') || '{}');
    const updatedSettings = { ...currentSettings, ...settings };
    localStorage.setItem('voice_settings', JSON.stringify(updatedSettings));
  }

  getVoiceSettings(): {
    language: string;
    rate: number;
    pitch: number;
    volume: number;
    voice?: string;
  } {
    return JSON.parse(localStorage.getItem('voice_settings') || '{"language":"en-US","rate":1.0,"pitch":1.0,"volume":1.0}');
  }

  // Voice Commands History
  getCommandHistory(userId: string, limit: number = 50): VoiceCommand[] {
    const historyKey = `voice_history_${userId}`;
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    return history.slice(-limit);
  }

  saveCommand(userId: string, command: VoiceCommand): void {
    const historyKey = `voice_history_${userId}`;
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    history.push(command);
    
    // Keep only last 100 commands
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    localStorage.setItem(historyKey, JSON.stringify(history));
  }

  // Voice Accessibility Features
  enableAccessibilityMode(): void {
    const settings = this.getVoiceSettings();
    this.updateVoiceSettings({
      ...settings,
      rate: Math.max(0.5, settings.rate - 0.2), // Slower speech
      volume: Math.min(1.0, settings.volume + 0.1), // Louder
    });
  }

  disableAccessibilityMode(): void {
    const settings = this.getVoiceSettings();
    this.updateVoiceSettings({
      ...settings,
      rate: 1.0, // Normal speed
      volume: 1.0, // Normal volume
    });
  }

  // Cleanup
  cleanup(): void {
    this.stopListening();
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }
}

// Singleton instance
export const voiceInteraction = new VoiceInteractionSystem();
