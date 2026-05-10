import { useState } from 'react';
import { 
  FiPhoneCall, 
  FiMail, 
  FiMapPin, 
  FiClock, 
  FiInfo, 
  FiCheckCircle, 
  FiSend,
  FiChevronDown
} from 'react-icons/fi';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    department: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', phone: '', subject: '', message: '', department: '' });
      setSubmitted(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen font-sans bg-slate-200">
      {/* Hero Section */}
      <div className="relative overflow-hidden text-white bg-indigo-600">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-blue-700 to-cyan-500 opacity-90"></div>
        <div className="relative px-6 py-20 mx-auto max-w-7xl lg:py-28">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white drop-shadow-sm">
              Get in Touch
            </h1>
            <p className="text-lg leading-relaxed text-blue-100 sm:text-xl">
              We're here to help. Reach out to us for appointments, emergencies, or general inquiries. Our team is always ready to assist you.
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-6 py-12 mx-auto -mt-16 max-w-7xl lg:py-20 lg:-mt-24">
        {/* Contact Information Grid */}
        <div className="grid gap-6 mb-16 lg:grid-cols-3">
          {/* Phone Card */}
          <div className="flex flex-col items-center p-8 transition-all duration-300 bg-white border shadow-xl shadow-slate-200/40 rounded-3xl hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-100 border-slate-50">
            <div className="flex items-center justify-center w-16 h-16 mb-6 text-indigo-600 bg-indigo-50 rounded-2xl">
              <FiPhoneCall className="w-8 h-8" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-slate-800">Call Us</h3>
            <p className="mb-4 text-center text-slate-500">Available Monday to Friday</p>
            <p className="text-xl font-bold tracking-wide text-indigo-600">+977-81-429-XXX</p>
            <div className="px-4 py-2 mt-4 text-sm font-medium text-red-600 bg-red-50 rounded-full">
              Emergency: +977-98-XXXX-XXXX
            </div>
          </div>

          {/* Email Card */}
          <div className="flex flex-col items-center p-8 transition-all duration-300 bg-white border shadow-xl shadow-slate-200/40 rounded-3xl hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-100 border-slate-50">
            <div className="flex items-center justify-center w-16 h-16 mb-6 text-blue-600 bg-blue-50 rounded-2xl">
              <FiMail className="w-8 h-8" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-slate-800">Email Us</h3>
            <p className="mb-4 text-center text-slate-500">Response within 24 hours</p>
            <a href="mailto:contact@medicalcare.com" className="text-lg font-semibold tracking-wide text-blue-600 hover:text-blue-700">contact@medicalcare.com</a>
            <a href="mailto:support@medicalcare.com" className="mt-2 text-sm font-medium text-slate-400 hover:text-blue-600">support@medicalcare.com</a>
          </div>

          {/* Location Card */}
          <div className="flex flex-col items-center p-8 transition-all duration-300 bg-white border shadow-xl shadow-slate-200/40 rounded-3xl hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-100 border-slate-50">
            <div className="flex items-center justify-center w-16 h-16 mb-6 text-cyan-600 bg-cyan-50 rounded-2xl">
              <FiMapPin className="w-8 h-8" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-slate-800">Visit Us</h3>
            <p className="mb-4 text-center text-slate-500">Main Hospital Location</p>
            <p className="text-lg font-semibold tracking-wide text-center text-cyan-600">Nepalgunj, Banke, Nepal</p>
            <p className="mt-4 text-sm font-medium text-slate-400">Get directions on Google Maps</p>
          </div>
        </div>

        {/* Two Column Layout: Form & Info */}
        <div className="grid gap-12 lg:grid-cols-5">
          
          {/* Contact Form Details */}
          <div className="lg:col-span-3">
            <div className="p-8 bg-white border shadow-xl shadow-slate-200/50 rounded-3xl md:p-12 border-slate-50">
              <div className="mb-8">
                <h2 className="mb-3 text-3xl font-extrabold text-slate-800">Send a Message</h2>
                <p className="text-lg text-slate-500">Have a specific inquiry? Fill out the form below and we'll get back to you shortly.</p>
              </div>

              {submitted && (
                <div className="flex items-center gap-3 p-5 mb-8 text-green-700 bg-green-50 border border-green-200 rounded-2xl">
                  <FiCheckCircle className="w-6 h-6 shrink-0" />
                  <p className="text-sm font-medium md:text-base">Thank you! Your message has been sent successfully. We'll be in touch soon.</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="w-full px-5 py-3.5 transition-all bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 font-medium text-slate-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                      className="w-full px-5 py-3.5 transition-all bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+977-98XXXXXXXX"
                      required
                      className="w-full px-5 py-3.5 transition-all bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 font-medium text-slate-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Department</label>
                    <div className="relative">
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 transition-all bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-medium text-slate-800 appearance-none cursor-pointer"
                      >
                        <option value="" disabled className="text-slate-400">Select a department</option>
                        <option value="emergency">Emergency</option>
                        <option value="neurology">Neurology</option>
                        <option value="orthopedics">Orthopedics</option>
                        <option value="cardiology">Cardiology</option>
                        <option value="dermatology">Dermatology</option>
                        <option value="pediatrics">Pediatrics</option>
                      </select>
                      <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Briefly describe what this is about"
                    required
                    className="w-full px-5 py-3.5 transition-all bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 font-medium text-slate-800"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us everything we need to know..."
                    required
                    rows="5"
                    className="w-full px-5 py-3.5 transition-all bg-slate-50 border border-slate-200 rounded-xl resize-none focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 font-medium text-slate-800"
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="relative flex items-center justify-center w-full px-8 py-4 overflow-hidden font-bold text-white transition-all duration-300 bg-indigo-600 group sm:w-auto rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/30"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Send Message
                      <FiSend className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-8 lg:col-span-2">
            {/* Hours */}
            <div className="p-8 bg-white border shadow-xl shadow-slate-200/50 rounded-3xl border-slate-50">
              <h3 className="flex items-center gap-3 mb-6 text-xl font-extrabold text-slate-800">
                <span className="flex items-center justify-center w-10 h-10 text-indigo-600 bg-indigo-50 rounded-xl">
                  <FiClock className="w-5 h-5" />
                </span>
                Operating Hours
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="font-medium text-slate-600">Monday - Friday</span>
                  <span className="font-bold text-indigo-600">8:00 AM - 6:00 PM</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="font-medium text-slate-600">Saturday</span>
                  <span className="font-bold text-indigo-600">9:00 AM - 2:00 PM</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="font-medium text-slate-600">Sunday</span>
                  <span className="font-bold text-indigo-600">Emergency Only</span>
                </div>
                <div className="flex items-center justify-between pt-3">
                  <span className="font-medium text-slate-600">Emergency Desk</span>
                  <span className="px-3 py-1 font-bold text-red-600 bg-red-50 rounded-lg">24/7 Open</span>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="p-8 text-white shadow-xl bg-gradient-to-br from-indigo-700 to-blue-600 shadow-blue-500/20 rounded-3xl">
              <h3 className="flex items-center gap-3 mb-6 text-xl font-extrabold">
                <span className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-xl">
                  <FiInfo className="w-5 h-5" />
                </span>
                Quick Info
              </h3>
              <div className="space-y-6 text-indigo-50">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1 text-cyan-300">
                    <FiCheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="mb-1 font-semibold text-white">Online OPD Booking</h4>
                    <p className="text-sm leading-relaxed opacity-90">Avoid lines by booking your appointment instantly through our patient portal.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1 text-cyan-300">
                    <FiCheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="mb-1 font-semibold text-white">Real-time Queue tracking</h4>
                    <p className="text-sm leading-relaxed opacity-90">Track your current position in the queue digitally while you wait.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1 text-cyan-300">
                    <FiCheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="mb-1 font-semibold text-white">6+ Departments</h4>
                    <p className="text-sm leading-relaxed opacity-90">Comprehensive specialist care across multiple critical and general departments.</p>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 sm:mt-24">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-extrabold text-slate-800">Frequently Asked Questions</h2>
            <p className="max-w-2xl mx-auto text-lg text-slate-500">Find quick answers to common questions about our procedures and services.</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                q: "How do I book an OPD appointment?",
                a: "Visit the Departments section, select your desired department and doctor, then fill in your details through our online booking system.",
                icon: "📅"
              },
              {
                q: "Can I cancel my appointment?",
                a: "Yes, you can cancel up to 2 hours before your scheduled appointment time. Contact us or use your booking reference.",
                icon: "⚙️"
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept cash, debit cards, credit cards, and digital payment methods including eSewa and Khalti.",
                icon: "💳"
              },
              {
                q: "How can I track my queue position?",
                a: "After booking, you can track your real-time queue position through your booking reference number in our system.",
                icon: "📊"
              }
            ].map((faq, i) => (
              <div key={i} className="flex gap-5 p-8 transition-transform duration-300 bg-white border shadow-lg shadow-slate-200/30 rounded-3xl hover:-translate-y-1 border-slate-50">
                <div className="text-3xl shrink-0">{faq.icon}</div>
                <div>
                  <h4 className="mb-2 text-lg font-bold text-slate-800">{faq.q}</h4>
                  <p className="leading-relaxed text-slate-500">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
