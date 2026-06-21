interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}
interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
}
interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
    length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
    isFinal: boolean;
}
interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    onstart: (() => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
}
interface SpeechRecognitionConstructor {
    new (): SpeechRecognition;
}
declare global {
    interface Window {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
    }
}
export type VoiceInputStatus = 'idle' | 'listening' | 'processing' | 'error';
export interface UseVoiceInputOptions {
    onTranscript?: (transcript: string) => void;
    onInterimTranscript?: (transcript: string) => void;
    continuous?: boolean;
    language?: string;
    silenceTimeoutMs?: number;
}
export interface UseVoiceInputReturn {
    isListening: boolean;
    status: VoiceInputStatus;
    error: string | null;
    isSupported: boolean;
    startListening: () => void;
    stopListening: () => void;
    toggleListening: () => void;
}
export declare function useVoiceInput(options?: UseVoiceInputOptions): UseVoiceInputReturn;
export {};
//# sourceMappingURL=use-voice-input.d.ts.map