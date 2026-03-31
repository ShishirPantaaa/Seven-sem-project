export default function About() {
  const problems = [
    {
      image: "/images/wait-time.jpg",
      title: "Long Waiting Times",
      description: "Patients spend hours in physical queues, reducing hospital efficiency"
    },
    {
      image: "/images/overcrowding.jpg",
      title: "Overcrowding",
      description: "Excessive crowd at OPD makes environment unhealthy and chaotic"
    },
    {
      image: "/images/manual-process.jpg",
      title: "Manual Process",
      description: "Paper-based registration and token systems lead to errors and delays"
    },
    {
      image: "/images/priority.jpg",
      title: "No Priority System",
      description: "Emergency cases treated equally with routine patients, risking lives"
    }
  ];

  const solutions = [
    {
       image: "/images/online-booking.jpg",
      title: "Online Booking",
      description: "Book OPD tokens from anywhere, anytime without physical visits"
    },
    {
       image: "/images/smart-queue.jpg",
      title: "Smart Queue Management",
      description: "Real-time queue updates and priority-based patient sequencing"
    },
    {
       image: "/images/emergency.jpg",
      title: "Emergency Priority",
      description: "Critical patients get immediate attention with automatic escalation"
    },
    {
       image: "/images/notifications.jpg",
      title: "Instant Notifications",
      description: "SMS and email updates keep patients informed about their turn"
    }
  ];

  const features = [
    "Patient-friendly online registration",
    "Department-wise queue management",
    "Real-time status tracking",
    "Emergency classification system",
    "Payment integration with eSewa",
    "Token generation and scheduling"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Hero Section */}
      <section className="max-w-6xl px-6 py-16 mx-auto">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold text-transparent md:text-6xl bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text">
            Priority OPD System
          </h1>
          <p className="max-w-3xl mx-auto text-xl text-slate-600">
            Revolutionizing Hospital Outpatient Services with Smart Queue Management
          </p>
        </div>

        {/* Overview Section */}
        <div className="grid items-center gap-12 mb-16 md:grid-cols-2">
          <div>
            <img
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&h=400&fit=crop"
              alt="Hospital OPD Management"
              className="border shadow-xl rounded-2xl border-slate-200"
            />
          </div>

          <div>
            <h2 className="mb-6 text-4xl font-bold text-slate-900">
              About Our System
            </h2>

            <p className="mb-4 text-lg leading-relaxed text-slate-700">
              We are developing a <span className="font-semibold text-cyan-600">Priority-Based Online OPD Queue Management System</span> to transform hospital outpatient services in Nepal.
            </p>

            <p className="mb-4 text-lg leading-relaxed text-slate-700">
              Traditional OPD systems require patients to physically visit hospitals, obtain tickets, and wait in long queues. This creates overcrowding, delays, and poor patient experience.
            </p>

            <p className="text-lg leading-relaxed text-slate-700">
              Our automated system enables online booking, real-time queue updates, and intelligent prioritization—ensuring emergency patients receive immediate care while maintaining fairness for all.
            </p>
          </div>
        </div>
      </section>

      {/* Problems We Solve */}
      <section className="py-16 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-4xl font-bold text-slate-900">
              Problems We Solve
            </h2>
            <p className="text-lg text-slate-600">Traditional hospital OPD systems face critical challenges</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {problems.map((problem, idx) => (
              <div key={idx} className="p-6 transition bg-white border-t-4 border-red-500 shadow-lg rounded-xl hover:shadow-xl">
                <div className="relative h-48 mb-4 overflow-hidden rounded-lg">
                  <img
                    src={problem.image}
                    alt={problem.title}
                    className="object-cover w-full h-full"
                      />
                 <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">{problem.title}</h3>
                <p className="text-slate-600">{problem.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions We Provide */}
      <section className="py-16">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-4xl font-bold text-slate-900">
              Our Solutions
            </h2>
            <p className="text-lg text-slate-600">How we revolutionize OPD management</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {solutions.map((solution, idx) => (
              <div key={idx} className="p-6 transition border shadow-lg bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border-cyan-200 hover:shadow-xl hover:-translate-y-2">
                <div className="flex justify-center mb-4">
                  <img
                     src={solution.image}
                     alt={solution.title}
                     className="object-contain w-16 h-16"
                      />
                  </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">{solution.title}</h3>
                <p className="text-slate-600">{solution.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 text-white bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-4xl font-bold">
              Key Features
            </h2>
            <p className="text-lg text-slate-300">Comprehensive OPD management capabilities</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-full bg-gradient-to-r from-cyan-500 to-blue-500">
                    ✓
                  </div>
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">{feature}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Use */}
      <section className="py-16">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-4xl font-bold text-slate-900">
              How to Book an OPD Token
            </h2>
            <p className="text-lg text-slate-600">Simple 5-step process for quick booking</p>
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            {[
              { num: "1", title: "Register", desc: "Create account or login" },
              { num: "2", title: "Fill Details", desc: "Enter patient information" },
              { num: "3", title: "Select Department", desc: "Choose your department" },
              { num: "4", title: "Make Payment", desc: "Complete payment via eSewa" },
              { num: "5", title: "Get Token", desc: "Receive confirmation & token" }
            ].map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="flex items-center justify-center w-16 h-16 text-2xl font-bold text-white rounded-full shadow-lg bg-gradient-to-r from-cyan-500 to-blue-600">
                    {step.num}
                  </div>
                </div>
                <h3 className="mb-1 text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="text-sm text-slate-600">{step.desc}</p>
                {idx < 4 && <div className="absolute right-0 hidden text-2xl md:block top-8 text-cyan-300">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-4xl font-bold text-slate-900">
              Benefits for Everyone
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "For Patients",
                benefits: [
                  "No need to visit hospital physically for tickets",
                  "Reduced waiting time",
                  "Know exact turn and wait duration",
                  "Emergency cases prioritized"
                ]
              },
              {
                title: "For Hospitals",
                benefits: [
                  "Better resource allocation",
                  "Reduced overcrowding",
                  "Improved patient flow management",
                  "Data-driven decision making"
                ]
              },
              {
                title: "For Doctors",
                benefits: [
                  "Organized patient queue",
                  "Complete patient information beforehand",
                  "Better time management",
                  "Focus on patient care"
                ]
              }
            ].map((group, idx) => (
              <div key={idx} className="p-8 bg-white border-l-4 shadow-lg rounded-xl border-cyan-500">
                <h3 className="mb-5 text-2xl font-bold text-slate-900">{group.title}</h3>
                <ul className="space-y-3">
                  {group.benefits.map((benefit, bidx) => (
                    <li key={bidx} className="flex items-start gap-3">
                      <span className="mt-1 font-bold text-cyan-500">•</span>
                      <span className="text-slate-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl px-6 mx-auto text-center">
          <div className="p-12 text-white shadow-2xl bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl">
            <h2 className="mb-4 text-4xl font-bold">Ready to Book Your OPD Token?</h2>
            <p className="mb-8 text-lg text-cyan-100">
              Experience hassle-free OPD booking with our Priority-Based Queue Management System
            </p>
            <a href="/book-token" className="inline-block px-8 py-4 font-bold transition-all duration-300 transform bg-white rounded-lg shadow-lg text-cyan-600 hover:bg-slate-100 hover:shadow-xl hover:scale-105">
              Book Token Now
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
