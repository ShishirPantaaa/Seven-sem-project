export default function Home() {
  const stats = [
    { number: "5000+", label: "Patients Served" },
    { number: "15+", label: "Departments" },
    { number: "98%", label: "Satisfaction Rate" },
    { number: "24/7", label: "Emergency Care" }
  ];

  const departments = [
  { name: "Emergency", image: "/emergancy.jpg" },
  { name: "Cardiology", image: "/Cardiology.jpg" },
  { name: "Neurology", image: "/Neurology.jpg" },
  { name: "Orthopedics", image: "/Orthopedics.jpg" },
  { name: "Dermatology", image: "/Dermatology.jpg" },
  { name: "Pediatrics", image: "/Pediatrics.jpg" }
];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner - Full Page */}
      <section className="relative w-full h-screen overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-center bg-cover"
          style={{
            backgroundImage: "url('/mainbanner.jpg')",
          }}
        >
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-blue-900/60 to-cyan-900/50"></div>
        </div>

        {/* Content */}
        <div className="relative flex items-center justify-center h-full">
          <div className="max-w-4xl px-6 mx-auto text-center">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="inline-block px-4 py-2 text-sm font-semibold border rounded-full bg-cyan-500/30 text-cyan-300 border-cyan-400/70 backdrop-blur-md">
                   Smart Healthcare Solution
                </div>
                <h3 className="text-3xl font-bold leading-tight text-white md:text-7xl drop-shadow-lg">
                  {/* A Smarter Revolution in OPD Queue Management */}
                </h3>
              </div>
              
              <p className="max-w-2xl mx-auto text-lg leading-relaxed md:text-2xl text-cyan-50 drop-shadow-md">
               OPD never like before. Smart, digital and Patient Friendly.
              </p>
              
              <div className="flex flex-col justify-center gap-4 pt-8 sm:flex-row">
                <a
                  href="/book-token"
                  className="px-10 py-4 font-bold text-center text-white transition duration-300 transform rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-105"
                >
                  Book Appointment Now
                </a>
                <a
                  href="/departments"
                  className="px-10 py-4 font-bold text-center text-white transition duration-300 border-2 rounded-lg border-cyan-300 hover:bg-cyan-500/20 backdrop-blur-md"
                >
                  Explore Departments
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="relative py-16 overflow-hidden md:py-20 bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600">
        {/* Overlay Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 w-2 h-2 bg-white rounded-full left-1/4"></div>
          <div className="absolute w-2 h-2 bg-white rounded-full top-12 right-1/3"></div>
          <div className="absolute w-2 h-2 bg-white rounded-full bottom-1/4 left-1/2"></div>
        </div>

        <div className="relative max-w-6xl px-6 mx-auto">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center group">
                <div className="mb-3 text-5xl font-bold text-white transition transform md:text-6xl group-hover:scale-110">
                  {stat.number}
                </div>
                <p className="text-lg font-semibold text-cyan-100">{stat.label}</p>
                <div className="w-0 h-1 mx-auto mt-3 transition duration-300 group-hover:w-12 bg-white/60"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-16">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="grid items-center gap-12 mb-12 lg:grid-cols-2">
            {/* Image Gallery */}
            <div className="grid grid-cols-2 gap-4">
              <img
                className="object-cover w-full h-48 transition border-4 shadow-lg rounded-xl hover:shadow-xl border-cyan-200"
                src="/Lumbini-Provincial-Hospital.jpg"
                alt="Lumbini Hospital"
              />
              <img
                className="object-cover w-full h-48 transition border-4 border-blue-200 shadow-lg rounded-xl hover:shadow-xl"
                src="/Butwalhos.jpg"
                alt="Butwal Hospital"
              />
              <img
                className="object-cover w-full h-48 transition border-4 shadow-lg rounded-xl hover:shadow-xl border-cyan-200"
                src="/Eye.jpg"
                alt="Eye Hospital"
              />
              <img
                className="object-cover w-full h-48 transition border-4 border-blue-200 shadow-lg rounded-xl hover:shadow-xl"
                src="/Tinau-International-Hospital-Pvt.Ltd_..jpg"
                alt="Tinau Hospital"
              />
            </div>

            {/* Content Section */}
            <div>
              <h2 className="mb-6 text-4xl font-bold text-slate-900">
                Our Solution
              </h2>

              <p className="mb-4 text-lg leading-relaxed text-slate-700">
                Our <span className="font-semibold text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text">Priority-Based OPD Queue Management System</span> 
                is a smart and automated healthcare solution designed to transform hospital outpatient services.
              </p>

              <div className="mb-6 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl font-bold text-cyan-500">✓</span>
                  <div>
                    <p className="font-semibold text-slate-900">Intelligent Triage System</p>
                    <p className="text-sm text-slate-600">Rule-based priority queue algorithms identify emergencies and high-risk patients</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl font-bold text-cyan-500">✓</span>
                  <div>
                    <p className="font-semibold text-slate-900">Online Booking</p>
                    <p className="text-sm text-slate-600">Book OPD tokens anytime, anywhere without physical visits</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl font-bold text-cyan-500">✓</span>
                  <div>
                    <p className="font-semibold text-slate-900">Real-Time Updates</p>
                    <p className="text-sm text-slate-600">Receive instant queue status and wait time estimates</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl font-bold text-cyan-500">✓</span>
                  <div>
                    <p className="font-semibold text-slate-900">Fair Scheduling</p>
                    <p className="text-sm text-slate-600">FIFO scheduling for patients with similar priority levels</p>
                  </div>
                </div>
              </div>

              <p className="leading-relaxed text-slate-700">
                The system intelligently manages doctor assignments and token advancement based on expected consultation time, 
                improving workflow efficiency for hospital staff while reducing overcrowding in waiting areas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 bg-gradient-to-r from-slate-100 to-slate-50">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-4xl font-bold text-slate-900">Why Choose Us?</h2>
            <p className="text-lg text-slate-600">Comprehensive OPD management for modern hospitals</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
  {[
    {
      image: "/images/wait-time.jpg",
      title: "Reduced Wait Times",
      description: "From hours to minutes with smart queue management"
    },
    {
      image: "/images/efficiency.jpg",
      title: "Hospital Efficiency",
      description: "Better resource allocation and staff workflow optimization"
    },
    {
      image: "/images/patient-comfort.jpg",
      title: "Patient Comfort",
      description: "Eliminated overcrowding and improved healthcare experience"
    },
    {
      image: "/images/digital.jpg",
      title: "Digital First",
      description: "Easy-to-use mobile and web interfaces"
    },
    {
      image: "/images/security.jpg",
      title: "Secure & Reliable",
      description: "Protected patient data with encryption and backups"
    },
    {
      image: "/images/emergency.jpg",
      title: "Emergency Priority",
      description: "Critical cases receive immediate attention"
    }
  ].map((feature, idx) => (
    <div
      key={idx}
      className="p-8 transition bg-white border-t-4 shadow-lg rounded-xl hover:shadow-xl hover:-translate-y-2 border-cyan-500"
    >
      {/* IMAGE */}
      <div className="flex justify-center mb-4">
        <img
          src={feature.image}
          alt={feature.title}
          className="object-contain w-40 h-32 rounded-md"
        />
      </div>

      <h3 className="mb-2 text-xl font-bold text-slate-900">
        {feature.title}
      </h3>

      <p className="text-slate-600">
        {feature.description}
      </p>
    </div>
  ))}
</div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-16">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-4xl font-bold text-slate-900">Our Departments</h2>
            <p className="text-lg text-slate-600">Comprehensive healthcare services available</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {departments.map((dept, idx) => (
              <div key={idx} className="p-6 text-center transition border rounded-lg shadow-md bg-gradient-to-br from-cyan-50 to-blue-50 hover:shadow-lg hover:-translate-y-1 border-cyan-200">
                <div className="mb-4 overflow-hidden rounded-lg">
                     <img
                       src={dept.image}
                       alt={dept.name}
                       className="object-cover w-full h-24 transition duration-300 hover:scale-110"
                          />
</div>
                <p className="font-semibold text-slate-900">{dept.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 text-white bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-4xl font-bold">How It Works</h2>
            <p className="text-lg text-slate-300">Simple process for better healthcare</p>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            {[
              { num: "01", title: "Register", desc: "Create your account easily" },
              { num: "02", title: "Book", desc: "Select department and date" },
              { num: "03", title: "Pay", desc: "Secure payment via eSewa" },
              { num: "04", title: "Visit", desc: "Check your queue status" }
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className="p-8 text-center rounded-lg bg-gradient-to-br from-cyan-600 to-blue-600">
                  <div className="mb-3 text-5xl font-bold text-cyan-200">{step.num}</div>
                  <h3 className="mb-2 text-xl font-bold">{step.title}</h3>
                  <p className="text-slate-200">{step.desc}</p>
                </div>
                {idx < 3 && <div className="absolute hidden text-3xl md:block -right-4 top-12 text-cyan-400">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl px-6 mx-auto">
          <div className="p-12 text-center text-white shadow-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600 rounded-2xl">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              Ready to Experience Better OPD Services?
            </h2>
            <p className="mb-8 text-lg text-cyan-100">
              Book your appointment today and join thousands of satisfied patients
            </p>
            <a
              href="/book-token"
              className="inline-block px-10 py-4 text-lg font-bold transition-all duration-300 transform bg-white rounded-lg shadow-lg text-cyan-600 hover:bg-slate-100 hover:shadow-xl hover:scale-105"
            >
              Book Token Now
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
