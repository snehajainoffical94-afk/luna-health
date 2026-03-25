export default function AboutPage() {
  return (
    <div className="min-h-screen bg-luna-dark pt-20">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-5xl font-display font-bold mb-6"><span className="gold-text">About</span> Luna Health</h1>
        <div className="space-y-6 text-white/60 text-base leading-relaxed">
          <p>Luna Health is a demo AI-powered health intelligence platform built on top of the Noise Luna smart ring ecosystem. We believe your health data — blood work, sleep, heart rate, recovery — should work together to give you clear, actionable guidance every week.</p>
          <p>Most people get blood tests done once a year, review them with a busy doctor for 5 minutes, and forget about them. Luna Health changes that. Your blood panel is a goldmine of information — and when read alongside your daily wearable data, it becomes a real-time picture of your health.</p>
          <p>This is a demo project built with Claude Code and Antigravity, showcasing what an AI-native health intelligence layer looks like for a D2C wearable brand.</p>
        </div>
      </div>
    </div>
  );
}
