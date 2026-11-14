import { useEffect, useRef, useState } from "react";
import { Mic, Square, Volume2, VolumeX } from "lucide-react";
import { useToast } from "../context/ToastContext";

/** Voice dictation using the browser's built-in speech recognition. */
export function VoiceInput({ onResult, disabled = false, label = "Speak your question" }) {
  const { toast } = useToast();
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
    };
  }, []);

  function start() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      toast("Voice input is not available in this browser. You can still type your question.", "warning");
      return;
    }
    try {
      const recognition = new Recognition();
      recognition.lang = "en-NG";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) onResult(transcript);
      };
      recognition.onerror = (event) => {
        if (event.error !== "aborted" && event.error !== "no-speech") {
          toast("We could not hear that. Please try again or type instead.", "warning");
        }
        setListening(false);
      };
      recognition.onend = () => setListening(false);
      recognition.start();
      recognitionRef.current = recognition;
      setListening(true);
    } catch {
      toast("Voice input could not start. Please type instead.", "warning");
    }
  }

  function stop() {
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    setListening(false);
  }

  return (
    <button
      type="button"
      onClick={listening ? stop : start}
      disabled={disabled}
      className={`inline-flex h-11 items-center gap-2 rounded-full border px-3.5 text-[0.85rem] font-semibold transition-colors disabled:opacity-50 ${
        listening ? "border-clay bg-clay text-white" : "border-line bg-paper text-ink hover:border-leaf"
      }`}
      aria-pressed={listening}
      aria-label={listening ? "Stop listening" : label}
    >
      {listening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4 text-leaf" />}
      <span className="hidden sm:inline">{listening ? "Listening…" : "Speak"}</span>
    </button>
  );
}

function cleanForSpeech(text) {
  return String(text || "")
    .replace(/[#*_`>]/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** Read an answer aloud. Always available; no data leaves the browser. */
export function SpeakButton({ text, className = "" }) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  function toggle() {
    if (!("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(cleanForSpeech(text).slice(0, 2000));
    utterance.lang = "en-NG";
    utterance.rate = 0.92;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  if (!("speechSynthesis" in window)) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-2.5 py-1 text-[0.72rem] font-semibold text-muted hover:border-leaf hover:text-leaf ${className}`}
      aria-label={speaking ? "Stop reading aloud" : "Read this answer aloud"}
    >
      {speaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
      {speaking ? "Stop" : "Listen"}
    </button>
  );
}
