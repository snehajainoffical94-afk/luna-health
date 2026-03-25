const testimonials = [
  { name: "Arjun M.", role: "Marathon Runner", text: "The AI caught that my ferritin was low before I even felt fatigued. Adjusted my diet and training load based on the weekly brief — PRd at my next race.", avatar: "AM" },
  { name: "Priya S.", role: "Founder & Exec", text: "I work 12-hour days. Luna tells me when I'm overtraining my nervous system vs. when I can push. The blood work integration is what makes it different from every other wearable.", avatar: "PS" },
  { name: "Dr. Rahul K.", role: "Sports Physician", text: "As a doctor, I recommend Luna to patients who want to be proactive. The AI flags are accurate and the explanation of implications is consumer-friendly without being dumbed down.", avatar: "RK" },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-luna-dark">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-luna-gold text-sm font-medium uppercase tracking-widest mb-3">Testimonials</p>
          <h2 className="text-4xl font-display font-bold">Real people. Real results.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="glass rounded-2xl p-6 hover:border-white/12 transition-all hover:-translate-y-1 duration-300">
              <p className="text-white/60 text-sm leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-luna-purple to-luna-gold flex items-center justify-center text-xs font-bold text-white">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-white/40">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
