import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiClock,
  FiActivity,
  FiShield,
  FiSmartphone,
  FiMoon,
  FiSun,
  FiUsers,
  FiStar,
  FiCheckCircle,
  FiBox
} from "react-icons/fi";

// --- Sub-Components for cleaner structure --- //

const StatCard = ({ icon: Icon, number, label }) => (
  <div className="p-6 transition-all duration-300 bg-white/70 dark:bg-slate-800/50 border border-white/50 dark:border-slate-700/50 backdrop-blur-xl shadow-lg shadow-slate-200/20 dark:shadow-none rounded-3xl hover:-translate-y-2 group">
    <div className="flex items-center gap-4 mb-4">
      <div className="p-3 rounded-2xl bg-cyan-100/50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <div className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
      {number}
    </div>
    <div className="font-semibold text-slate-500 dark:text-slate-400">
      {label}
    </div>
  </div>
);

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="p-8 transition-all duration-300 bg-white border shadow-sm dark:bg-slate-800 dark:border-slate-700/50 rounded-3xl hover:shadow-xl hover:-translate-y-2 border-slate-100">
    <div className="inline-flex items-center justify-center w-14 h-14 mb-6 rounded-2xl bg-slate-50 dark:bg-slate-700/50 text-cyan-600 dark:text-cyan-400 ring-1 ring-slate-100 dark:ring-slate-700">
      <Icon className="w-7 h-7" />
    </div>
    <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
    <p className="leading-relaxed text-slate-600 dark:text-slate-400">{description}</p>
  </div>
);

const DepartmentCard = ({ name, image, color }) => (
  <div className="relative overflow-hidden transition-all duration-500 bg-white border group rounded-3xl dark:bg-slate-800 dark:border-slate-700/50 hover:shadow-2xl hover:-translate-y-2">
    <div className="relative h-64 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-t opacity-60 mix-blend-multiply transition-opacity duration-300 group-hover:opacity-40 ${color} z-10`} />
      <img src={image} alt={name} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-x-0 bottom-0 z-20 p-6 bg-gradient-to-t from-slate-900/90 to-transparent pt-20">
        <h3 className="text-2xl font-bold text-white">{name}</h3>
      </div>
    </div>
  </div>
);

const StepCard = ({ num, title, desc }) => (
  <div className="relative z-10 p-8 text-center transition-all bg-slate-800/80 backdrop-blur-md rounded-3xl hover:-translate-y-2 border border-slate-700/50 hover:bg-slate-800">
    <div className="inline-flex items-center justify-center w-16 h-16 mb-6 text-2xl font-bold text-white rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
      {num}
    </div>
    <h3 className="mb-3 text-xl font-bold text-white">{title}</h3>
    <p className="text-slate-400">{desc}</p>
  </div>
);

// --- Main Page Component --- //

export default function Home() {
  const [isDark, setIsDark] = useState(false);

  // Initialize Theme
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (storedTheme === "dark" || (!storedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const stats = [
    { number: "5000+", label: "Patients Served", icon: FiUsers },
    { number: "15+", label: "Departments", icon: FiBox },
    { number: "98%", label: "Satisfaction", icon: FiStar },
    { number: "24/7", label: "Emergency", icon: FiClock },
  ];

  const departments = [
    { name: "Emergency", image: "/emergancy.jpg", color: "from-red-500 to-rose-600" },
    { name: "Cardiology", image: "/Cardiology.jpg", color: "from-blue-500 to-cyan-600" },
    { name: "Neurology", image: "/Neurology.jpg", color: "from-indigo-500 to-purple-600" },
    { name: "Orthopedics", image: "/Orthopedics.jpg", color: "from-emerald-500 to-teal-600" },
    { name: "Dermatology", image: "/Dermatology.jpg", color: "from-amber-500 to-orange-600" },
    { name: "Pediatrics", image: "/Pediatrics.jpg", color: "from-pink-500 to-rose-500" },
  ];

  const features = [
    { icon: FiClock, title: "Zero Wait Times", description: "Our smart algorithms calculate optimal arrival times, significantly reducing waiting." },
    { icon: FiActivity, title: "Enhanced Efficiency", description: "Seamless resource management allows staff to focus entirely on patient care." },
    { icon: FiStar, title: "Premium Comfort", description: "Experience a stress-free queue process without the typical overcrowding." },
    { icon: FiSmartphone, title: "100% Digital", description: "Manage your appointments, track live queues, and pay securely via your phone." },
    { icon: FiShield, title: "Bank-Grade Security", description: "Your medical data is encrypted and kept private with enterprise-level security." },
    { icon: FiUsers, title: "Smart Triage", description: "Critical emergency cases are automatically prioritized to ensure timely care." },
  ];

  const steps = [
    { num: "01", title: "Sign Up", desc: "Create a secure account in less than a minute." },
    { num: "02", title: "Select", desc: "Choose the exact department and time slot." },
    { num: "03", title: "Checkout", desc: "Pay seamlessly with integrated eSewa." },
    { num: "04", title: "Arrive", desc: "Walk in when your token is ready." },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-500 overflow-hidden">
      
      {/* Floating Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed z-50 bottom-8 right-8 p-4 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-2xl hover:scale-110 transition-all duration-300 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-4 focus:ring-cyan-500/20"
        aria-label="Toggle Dark Mode"
      >
        {isDark ? (
          <FiSun className="w-6 h-6 text-amber-400" />
        ) : (
          <FiMoon className="w-6 h-6 text-slate-700" />
        )}
      </button>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Abstract Floating Orbs Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-400/20 dark:bg-cyan-600/10 blur-[100px]" />
          <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-500/20 dark:bg-indigo-600/10 blur-[120px]" />
          <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-emerald-400/10 dark:bg-emerald-900/10 blur-[120px]" />
        </div>

        <div className="container relative z-10 px-6 mx-auto max-w-7xl">
          <div className="flex flex-col items-center text-center">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm font-semibold tracking-wide uppercase rounded-full bg-white/50 dark:bg-slate-800/50 text-cyan-700 dark:text-cyan-300 ring-1 ring-cyan-200/50 dark:ring-cyan-800/50 backdrop-blur-md shadow-sm">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full opacity-75 bg-cyan-400 animate-ping"></span>
                <span className="relative inline-flex w-2 h-2 rounded-full bg-cyan-500"></span>
              </span>
              Next-Gen Healthcare
            </div>

            <h1 className="max-w-5xl mb-6 text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl text-slate-900 dark:text-white drop-shadow-sm">
              Experience <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-500">OPD</span> <br className="hidden md:block" /> Like Never Before.
            </h1>

            <p className="max-w-2xl mb-10 text-lg leading-relaxed md:text-2xl text-slate-600 dark:text-slate-400">
              Smart, digital, and patient-first. Skip the crowded waiting rooms and book your consultation in seconds.
            </p>

            <div className="flex flex-col w-full gap-4 sm:flex-row sm:w-auto sm:justify-center">
              <Link
                to="/book-token"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold text-white transition-all duration-300 shadow-xl rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 dark:from-white dark:to-slate-200 dark:text-slate-900 dark:hover:from-slate-200 dark:hover:to-slate-300 hover:shadow-2xl hover:-translate-y-1"
              >
                Book Appointment <FiArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/departments"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold transition-all duration-300 bg-white border shadow-sm rounded-2xl text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-800/50 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800 hover:shadow-md hover:-translate-y-1 backdrop-blur-md"
              >
                Explore Departments
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-12 -mt-10 lg:-mt-20">
        <div className="container relative z-20 px-6 mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 md:gap-6">
            {stats.map((stat, idx) => <StatCard key={idx} {...stat} />)}
          </div>
        </div>
      </section>

      {/* Modern Solution Showcase */}
      <section className="py-20 lg:py-32">
        <div className="container px-6 mx-auto max-w-7xl">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            
            {/* Elegant Bento Grid for Hospital Images */}
            <div className="grid grid-cols-2 gap-4 lg:gap-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-3xl blur-3xl -z-10" />
              <div className="space-y-4 lg:space-y-6 pt-12">
                <img src="/Lumbini-Provincial-Hospital.jpg" alt="Lumbini Hospital" className="object-cover w-full h-48 rounded-3xl shadow-2xl lg:h-64 border border-white/20" />
                <img src="/Eye.jpg" alt="Eye Hospital" className="object-cover w-full h-40 rounded-3xl shadow-xl lg:h-56 border border-white/20" />
              </div>
              <div className="space-y-4 lg:space-y-6">
                <img src="/Butwalhos.jpg" alt="Butwal Hospital" className="object-cover w-full h-56 rounded-3xl shadow-2xl lg:h-72 border border-white/20" />
                <img src="/Tinau-International-Hospital-Pvt.Ltd_..jpg" alt="Tinau Hospital" className="object-cover w-full h-48 rounded-3xl shadow-xl lg:h-64 border border-white/20" />
              </div>
            </div>

            {/* Content Sidebar */}
            <div className="space-y-8">
              <div>
                <h2 className="mb-4 text-4xl font-extrabold text-slate-900 dark:text-white md:text-5xl tracking-tight">
                  Intelligent <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-500">Triage System.</span>
                </h2>
                <p className="text-xl leading-relaxed text-slate-600 dark:text-slate-400">
                  Our algorithm-driven OPD Queue Management System completely transforms outpatient services through intelligent pacing and prioritization.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { title: "Real-Time Updates", desc: "Get push-notifications and live wait-time estimates directly to your device." },
                  { title: "Fair Scheduling", desc: "First-In-First-Out (FIFO) scheduling matched strictly with patient priority tiers." },
                  { title: "Remote Booking", desc: "Securely generate your OPD token from home and bypass the reception desk entirely." }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-5 p-5 transition-colors duration-300 border border-transparent rounded-2xl hover:bg-white dark:hover:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm">
                    <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400">
                      <FiCheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{item.title}</h4>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 lg:py-32 bg-slate-100/50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="container px-6 mx-auto max-w-7xl">
          <div className="max-w-2xl mx-auto mb-16 text-center">
            <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Built for the Future</h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">Comprehensive, state-of-the-art management for modern healthcare facilities.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => <FeatureCard key={idx} {...feature} />)}
          </div>
        </div>
      </section>

      {/* Departments Gallery */}
      <section className="py-20 lg:py-32">
        <div className="container px-6 mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 mb-16 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Specialized Departments</h2>
              <p className="text-xl text-slate-600 dark:text-slate-400">Explore our comprehensive range of world-class healthcare departments.</p>
            </div>
            <Link to="/departments" className="inline-flex items-center gap-2 font-bold transition-colors text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300">
              View All Departments <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept, idx) => <DepartmentCard key={idx} {...dept} />)}
          </div>
        </div>
      </section>

      {/* How It Works - Modern Steps Timeline */}
      <section className="relative py-20 overflow-hidden lg:py-32 bg-slate-900 dark:bg-slate-950">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-900/20 to-transparent blur-3xl" />
        
        <div className="container relative z-10 px-6 mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-white">How It Works</h2>
            <p className="text-xl text-slate-400">Your journey to better healthcare in 4 frictionless steps.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-4 relative">
            {/* Connecting Line Wrapper */}
            <div className="hidden md:block absolute top-[4.5rem] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent z-0" />
            
            {steps.map((step, idx) => <StepCard key={idx} {...step} />)}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 my-10 lg:py-32 lg:my-0">
        <div className="container px-6 mx-auto max-w-5xl">
          <div className="relative p-12 overflow-hidden text-center lg:p-20 rounded-[3rem] bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 shadow-2xl border border-white/10">
            {/* Geometric glow pattern */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent blur-2xl"></div>
            
            <div className="relative z-10">
              <h2 className="mb-6 text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-5xl drop-shadow-sm">
                Ready to Experience <br /> Better OPD Services?
              </h2>
              <p className="max-w-2xl mx-auto mb-10 text-xl font-medium text-cyan-100">
                Join thousands of satisfied patients who have discovered the fastest, easiest way to manage their hospital visits.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  to="/book-token"
                  className="px-10 py-5 text-lg font-bold text-slate-900 transition-all duration-300 bg-white shadow-xl rounded-2xl hover:bg-slate-50 hover:-translate-y-1 hover:shadow-2xl ring-4 ring-white/20"
                >
                  Book Your Token Now
                </Link>
                <Link
                  to="/register"
                  className="px-10 py-5 text-lg font-bold text-white transition-all duration-300 border border-white/30 rounded-2xl hover:bg-white/10 backdrop-blur-sm"
                >
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
