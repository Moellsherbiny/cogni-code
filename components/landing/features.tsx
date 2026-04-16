import { BrainCircuit, Mic, Pencil, Volume2, Zap, Map } from "lucide-react";
import React from "react";

export default function Features() {

    const features = [
  { icon: <BrainCircuit size={28} />, title: "Adaptive Learning", desc: "AI adjusts content speed, type, and difficulty based on your real-time performance." },
  { icon: <Mic size={28} />, title: "Voice Interaction", desc: "Full audio mode for blind students — listen to lessons and answer assignments by voice." },
  { icon: <Pencil size={28} />, title: "Smart Whiteboard", desc: "Real-time collaborative board with AI suggestions, code snippets, and live sharing." },
  { icon: <Zap size={28} />, title: "AI Exam Generator", desc: "Auto-generated quizzes tailored to your level using NLP across all programming topics." },
  { icon: <Map size={28} />, title: "Mind Maps & Summaries", desc: "AI-generated visual maps and auto-summaries for every lesson." },
  { icon: <Volume2 size={28} />, title: "Audio Learning Mode", desc: "Convert any lesson to audio. Ideal for auditory learners and visually impaired students." },
];


  return (
    <section id="features" className="features-section">
      <div className="section-inner">
        <div className="section-label">Platform Features</div>
        <h2 className="section-title">
          Everything You Need to
          <br />
          <span className="accent">Code Smarter</span>
        </h2>
        <div className="features-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
