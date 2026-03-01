/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Languages, 
  ArrowRight, 
  Cpu, 
  BookOpen, 
  Users, 
  Lightbulb, 
  CheckCircle2, 
  Globe2,
  ChevronDown,
  Loader2,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { SUPPORTED_LANGUAGES, Language } from './types';

// Initialize Gemini API
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export default function App() {
  const [selectedLang, setSelectedLang] = useState<Language>(SUPPORTED_LANGUAGES[7]); // Default to Kannada
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [translation, setTranslation] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for Speech Recognition API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
        setIsRecording(false);
        translateText(transcriptText, selectedLang.name);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    } else {
      setError("Speech recognition is not supported in this browser.");
    }
  }, [selectedLang]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setTranscript("");
      setTranslation("");
      setError(null);
      recognitionRef.current.lang = selectedLang.code;
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const translateText = async (text: string, fromLang: string) => {
    setIsTranslating(true);
    try {
      const model = "gemini-3-flash-preview";
      const prompt = `Translate the following text from ${fromLang} to English. 
      Only provide the translated text, nothing else.
      
      Text: "${text}"`;

      const response = await genAI.models.generateContent({
        model,
        contents: prompt,
      });

      const result = response.text || "Translation failed.";
      setTranslation(result);
    } catch (err) {
      console.error("Translation error:", err);
      setError("Failed to translate. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-brand-primary p-2 rounded-lg">
                <Languages className="text-white w-6 h-6" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-slate-900">
                LanguaAssist
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-brand-primary transition-colors">How it Works</a>
              <a href="#technology" className="text-sm font-medium text-slate-600 hover:text-brand-primary transition-colors">Technology</a>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold uppercase tracking-wider mb-6">
                <Globe2 className="w-3 h-3" />
                Inclusive Learning for All
              </span>
              <h1 className="font-display text-5xl md:text-7xl font-bold text-slate-900 mb-12 tracking-tight">
                Local Language Learning <br />
                <span className="text-brand-primary">Assistant Using NLP</span>
              </h1>
            </motion.div>

            {/* Main Interface */}
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="p-6 md:p-10">
                <div className="flex flex-col md:flex-row gap-8 items-stretch">
                  {/* Input Side */}
                  <div className="flex-1 flex flex-col gap-4">
                    <div className="relative">
                      <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-left hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{selectedLang.nativeName}</span>
                          <span className="text-sm font-medium text-slate-500">({selectedLang.name})</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-20 max-h-64 overflow-y-auto"
                          >
                            {SUPPORTED_LANGUAGES.map((lang) => (
                              <button
                                key={lang.code}
                                onClick={() => {
                                  setSelectedLang(lang);
                                  setIsDropdownOpen(false);
                                }}
                                className="w-full flex flex-col px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-slate-900">{lang.name}</span>
                                  <span className="text-slate-400 text-sm">{lang.nativeName}</span>
                                </div>
                                <span className="text-xs text-slate-500">{lang.description}</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="relative flex-grow min-h-[160px] bg-slate-50 rounded-2xl border border-slate-200 p-4">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Speech Input</div>
                      <p className={`text-lg ${transcript ? 'text-slate-900' : 'text-slate-400 italic'}`}>
                        {transcript || "Your spoken words will appear here..."}
                      </p>
                      
                      <div className="absolute bottom-4 right-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={toggleRecording}
                          className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                            isRecording 
                              ? 'bg-red-500 mic-glow' 
                              : 'bg-brand-primary hover:bg-blue-700'
                          }`}
                        >
                          {isRecording ? (
                            <>
                              <div className="absolute inset-0 rounded-full bg-red-500 recording-pulse" />
                              <MicOff className="text-white w-6 h-6 relative z-10" />
                            </>
                          ) : (
                            <Mic className="text-white w-6 h-6" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="hidden md:flex items-center justify-center">
                    <div className="bg-slate-100 p-3 rounded-full">
                      <ArrowRight className="text-slate-400 w-6 h-6" />
                    </div>
                  </div>

                  {/* Output Side */}
                  <div className="flex-1 flex flex-col gap-4">
                    <div className="px-4 py-3 bg-slate-900 rounded-xl text-white font-medium flex items-center gap-2">
                      <Globe2 className="w-4 h-4 text-brand-secondary" />
                      English Translation
                    </div>

                    <div className="relative flex-grow min-h-[160px] bg-slate-50 rounded-2xl border border-slate-200 p-4">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">English Output</div>
                      {isTranslating ? (
                        <div className="flex items-center gap-2 text-slate-500 italic">
                          <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
                          Translating with AI...
                        </div>
                      ) : (
                        <p className={`text-lg ${translation ? 'text-slate-900' : 'text-slate-400 italic'}`}>
                          {translation || "The English translation will appear here..."}
                        </p>
                      )}

                      {translation && (
                        <button 
                          onClick={() => speakText(translation)}
                          className="absolute bottom-4 right-4 p-3 bg-white border border-slate-200 rounded-full text-slate-600 hover:text-brand-primary hover:border-brand-primary transition-all shadow-sm"
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-6 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">Our seamless pipeline ensures high accuracy and low latency for real-time learning.</p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Speech Recognition", desc: "Captures audio in regional languages using Web Speech API.", icon: Mic },
                { step: "02", title: "NLP Processing", desc: "Tokenizes and analyzes the structure of the spoken input.", icon: Cpu },
                { step: "03", title: "AI Translation", desc: "Uses Gemini Pro to translate contextually into English.", icon: Languages },
                { step: "04", title: "English Output", desc: "Displays and speaks the translated text for the user.", icon: CheckCircle2 },
              ].map((item, idx) => (
                <div key={idx} className="relative p-8 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                  <div className="text-4xl font-display font-black text-slate-200 mb-4 group-hover:text-brand-primary/20 transition-colors">{item.step}</div>
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 w-fit mb-6">
                    <item.icon className="w-6 h-6 text-brand-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology */}
        <section id="technology" className="py-24 bg-slate-900 text-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="font-display text-4xl font-bold mb-6">Cutting-Edge Technology</h2>
                <p className="text-slate-400 text-lg mb-10">We leverage the latest advancements in Artificial Intelligence and Natural Language Processing to create an inclusive educational tool.</p>
                
                <div className="space-y-6">
                  {[
                    { title: "Gemini AI Models", desc: "State-of-the-art LLMs for high-quality contextual translation.", icon: Cpu },
                    { title: "Web Speech API", desc: "Native browser support for robust speech-to-text conversion.", icon: Mic },
                    { title: "React & Motion", desc: "Modern frontend stack for a smooth, interactive user experience.", icon: Globe2 },
                  ].map((tech, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0 bg-brand-primary/20 p-3 rounded-xl">
                        <tech.icon className="w-6 h-6 text-brand-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-1">{tech.title}</h4>
                        <p className="text-slate-400 text-sm">{tech.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-brand-primary/20 blur-[120px] rounded-full" />
                <div className="relative bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <div className="font-mono text-sm text-slate-300 space-y-2">
                    <p className="text-brand-secondary">// NLP Translation Pipeline</p>
                    <p><span className="text-brand-primary">const</span> input = <span className="text-amber-300">"ನಮಸ್ಕಾರ, ಹೇಗಿದ್ದೀರಿ?"</span>;</p>
                    <p><span className="text-brand-primary">const</span> lang = <span className="text-amber-300">"kn-IN"</span>;</p>
                    <p>&nbsp;</p>
                    <p><span className="text-brand-primary">async function</span> <span className="text-blue-400">translate</span>() &#123;</p>
                    <p>&nbsp;&nbsp;<span className="text-brand-primary">const</span> res = <span className="text-brand-primary">await</span> ai.generate(&#123;</p>
                    <p>&nbsp;&nbsp;&nbsp;&nbsp;model: <span className="text-amber-300">"gemini-3-flash"</span>,</p>
                    <p>&nbsp;&nbsp;&nbsp;&nbsp;prompt: <span className="text-amber-300">`Translate $&#123;input&#125; to English`</span></p>
                    <p>&nbsp;&nbsp;&#125;);</p>
                    <p>&nbsp;&nbsp;<span className="text-brand-primary">return</span> res.text;</p>
                    <p>&#125;</p>
                    <p>&nbsp;</p>
                    <p><span className="text-slate-500">// Output: "Hello, how are you?"</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="bg-brand-primary p-2 rounded-lg">
                <Languages className="text-white w-5 h-5" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-slate-900">
                LanguaAssist
              </span>
            </div>
            <p className="text-slate-500 text-sm">
              Built with NLP & AI for Inclusive Education. © 2026 LanguaAssist Project.
            </p>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <a href="#" className="text-slate-400 hover:text-brand-primary transition-colors">GitHub</a>
              <span className="text-slate-400">made by - Naitik sharma</span>
              <a href="mailto:naitik28sharma@gmail.com" className="text-slate-400 hover:text-brand-primary transition-colors">contact email - naitik28sharma@gmail.com</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
