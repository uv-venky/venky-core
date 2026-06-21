'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
const DEFAULT_SILENCE_TIMEOUT_MS = 5000;
export function useVoiceInput(options = {}) {
    const { onTranscript, onInterimTranscript, continuous = false, language = 'en-US', silenceTimeoutMs = DEFAULT_SILENCE_TIMEOUT_MS, } = options;
    const [isListening, setIsListening] = useState(false);
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState(null);
    const [isSupported, setIsSupported] = useState(false);
    const recognitionRef = useRef(null);
    const onTranscriptRef = useRef(onTranscript);
    const onInterimTranscriptRef = useRef(onInterimTranscript);
    const silenceTimeoutRef = useRef(null);
    const lastFinalTranscriptRef = useRef('');
    const noSpeechRetryCountRef = useRef(0);
    // Keep refs updated
    useEffect(() => {
        onTranscriptRef.current = onTranscript;
        onInterimTranscriptRef.current = onInterimTranscript;
    }, [onTranscript, onInterimTranscript]);
    // Initialize speech recognition
    useEffect(() => {
        if (typeof window === 'undefined')
            return;
        const isIOS = /iPad|iPhone|iPod/.test(window.navigator.userAgent) ||
            // iPadOS can present as Mac; touch points is a common heuristic
            (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
        if (isIOS) {
            // iOS browsers (Safari/WebKit) do not reliably support the Web Speech API.
            setIsSupported(false);
            return;
        }
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) {
            setIsSupported(false);
            return;
        }
        setIsSupported(true);
        const recognition = new SpeechRecognitionAPI();
        // Use continuous when we have a silence timeout so the browser doesn't cut off on short pauses
        recognition.continuous = continuous || silenceTimeoutMs > 0;
        recognition.interimResults = true;
        recognition.lang = language;
        recognition.maxAlternatives = 1;
        function clearSilenceTimer() {
            if (silenceTimeoutRef.current !== null) {
                clearTimeout(silenceTimeoutRef.current);
                silenceTimeoutRef.current = null;
            }
        }
        recognition.onstart = () => {
            setIsListening(true);
            setStatus('listening');
            setError(null);
            lastFinalTranscriptRef.current = '';
            noSpeechRetryCountRef.current = 0;
            clearSilenceTimer();
        };
        recognition.onresult = (event) => {
            clearSilenceTimer();
            // Android/Chrome can resend the entire accumulated "final" transcript on each onresult
            // call. If consumers append final transcript to an input, this causes duplication.
            // To avoid this, compute the full final transcript and emit only the delta since last time.
            let fullFinalTranscript = '';
            let interimTranscript = '';
            for (let i = 0; i < event.results.length; i++) {
                const result = event.results[i];
                const transcript = result[0].transcript;
                if (result.isFinal) {
                    fullFinalTranscript += transcript;
                }
                else if (i >= event.resultIndex) {
                    // Only use interim results from the changed range to reduce jitter.
                    interimTranscript += transcript;
                }
            }
            if (interimTranscript && onInterimTranscriptRef.current) {
                onInterimTranscriptRef.current(interimTranscript);
            }
            const previousFinal = lastFinalTranscriptRef.current;
            const nextFinal = fullFinalTranscript;
            if (nextFinal) {
                lastFinalTranscriptRef.current = nextFinal;
            }
            if (onTranscriptRef.current && nextFinal) {
                const delta = nextFinal.startsWith(previousFinal) ? nextFinal.slice(previousFinal.length) : nextFinal;
                if (delta.trim()) {
                    onTranscriptRef.current(delta);
                }
            }
            // After any speech, wait silenceTimeoutMs before auto-stopping so the user can continue
            if (silenceTimeoutMs > 0 && recognitionRef.current === recognition) {
                silenceTimeoutRef.current = setTimeout(() => {
                    silenceTimeoutRef.current = null;
                    try {
                        recognition.stop();
                    }
                    catch {
                        // ignore if already stopped
                    }
                }, silenceTimeoutMs);
            }
        };
        recognition.onerror = async (event) => {
            clearSilenceTimer();
            setStatus('error');
            switch (event.error) {
                case 'not-allowed': {
                    // The Web Speech API reports 'not-allowed' for multiple reasons beyond
                    // actual permission denial (service errors, rate-limiting, etc.).
                    // Check the real mic permission before blaming browser settings.
                    let micBlocked = true;
                    try {
                        const permResult = await navigator.permissions.query({ name: 'microphone' });
                        micBlocked = permResult.state === 'denied';
                    }
                    catch {
                        // permissions.query may not be supported; fall through to getUserMedia
                        try {
                            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                            stream.getTracks().forEach((t) => {
                                t.stop();
                            });
                            micBlocked = false;
                        }
                        catch {
                            micBlocked = true;
                        }
                    }
                    if (micBlocked) {
                        setError('Microphone access denied. Please allow microphone access in your browser settings.');
                    }
                    else {
                        setError('Speech recognition failed to start. Please try again.');
                    }
                    break;
                }
                case 'service-not-allowed':
                case 'service-not-available':
                    setError('Speech recognition is not available in this browser/device.');
                    break;
                case 'no-speech':
                    // Chrome fires 'no-speech' after ~5-10s of silence. Silently retry
                    // up to 3 times before surfacing an error, so the mic stays open.
                    if (noSpeechRetryCountRef.current < 3) {
                        noSpeechRetryCountRef.current++;
                        setStatus('listening');
                        try {
                            recognition.start();
                        }
                        catch {
                            setError('No speech detected. Please try again.');
                        }
                        return;
                    }
                    setError('No speech detected. Please try again.');
                    break;
                case 'audio-capture':
                    setError('No microphone found. Please connect a microphone and try again.');
                    break;
                case 'network':
                    setError('Network error occurred. Please check your connection.');
                    break;
                case 'aborted':
                    setError(null);
                    setStatus('idle');
                    break;
                default:
                    setError(`Speech recognition error: ${event.error}`);
            }
            setIsListening(false);
        };
        recognition.onend = () => {
            clearSilenceTimer();
            setIsListening(false);
            // If an error was set, preserve it; otherwise go back to idle
            setStatus((prev) => (prev === 'error' ? prev : 'idle'));
        };
        recognitionRef.current = recognition;
        return () => {
            clearSilenceTimer();
            recognition.abort();
            recognitionRef.current = null;
        };
    }, [continuous, language, silenceTimeoutMs]);
    const startListening = useCallback(() => {
        if (!recognitionRef.current) {
            setError('Speech recognition is not supported in this browser.');
            return;
        }
        setError(null);
        setStatus('processing');
        try {
            recognitionRef.current.start();
        }
        catch (err) {
            // Recognition might already be running
            if (err instanceof Error && err.message.includes('already started')) {
                setStatus('listening');
            }
            else {
                setError('Failed to start speech recognition.');
                setStatus('error');
            }
        }
    }, []);
    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
        setStatus('idle');
    }, [isListening]);
    const toggleListening = useCallback(() => {
        if (isListening) {
            stopListening();
        }
        else {
            startListening();
        }
    }, [isListening, startListening, stopListening]);
    return {
        isListening,
        status,
        error,
        isSupported,
        startListening,
        stopListening,
        toggleListening,
    };
}
//# sourceMappingURL=use-voice-input.js.map