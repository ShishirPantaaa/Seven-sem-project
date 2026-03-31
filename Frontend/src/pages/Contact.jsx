import { useState } from 'react';

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
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="py-12 text-white bg-gradient-to-r from-cyan-500 to-blue-600">
        <div className="max-w-6xl px-6 mx-auto">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Get In Touch</h1>
          <p className="text-lg text-cyan-50">We're here to help and answer any question you might have.</p>
        </div>
      </div>

      {/* Main Content */}
      <section className="max-w-6xl px-6 py-12 mx-auto">
        {/* Contact Information Grid */}
        <div className="grid gap-6 mb-12 md:grid-cols-3">
          {/* Phone */}
          <div className="p-8 transition duration-300 bg-white shadow-lg rounded-xl hover:shadow-xl">
            <div className="mb-3 text-4xl text-cyan-500">📞</div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">Call Us</h3>
            <p className="mb-2 text-gray-600">Available Monday - Friday</p>
            <p className="text-lg font-semibold text-blue-600">+977-81-429-XXX</p>
            <p className="mt-2 text-sm text-gray-500">Emergency: +977-98-XXXX-XXXX</p>
          </div>

          {/* Email */}
          <div className="p-8 transition duration-300 bg-white shadow-lg rounded-xl hover:shadow-xl">
            <div className="mb-3 text-4xl text-blue-500">📧</div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">Email Us</h3>
            <p className="mb-2 text-gray-600">Response within 24 hours</p>
            <p className="text-lg font-semibold text-blue-600">contact@medicalcare.com</p>
            <p className="mt-2 text-sm text-gray-500">support@medicalcare.com</p>
          </div>

          {/* Location */}
          <div className="p-8 transition duration-300 bg-white shadow-lg rounded-xl hover:shadow-xl">
            <div className="mb-3 text-4xl text-cyan-500">📍</div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">Visit Us</h3>
            <p className="mb-2 text-gray-600">Main Hospital Location</p>
            <p className="text-sm font-semibold text-blue-600">Nepalgunj, Banke, Nepal</p>
            <p className="mt-2 text-xs text-gray-500">Directions available on Google Maps</p>
          </div>
        </div>

        {/* Operating Hours and Information */}
        <div className="grid gap-8 mb-12 md:grid-cols-2">
          {/* Hours */}
          <div className="p-8 bg-white shadow-lg rounded-xl">
            <h3 className="flex items-center gap-2 mb-6 text-2xl font-bold text-slate-900">
              <span className="text-cyan-500">🕒</span> Operating Hours
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between pb-2 border-b">
                <span className="font-semibold text-gray-700">Monday - Friday</span>
                <span className="font-semibold text-blue-600">8:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between pb-2 border-b">
                <span className="font-semibold text-gray-700">Saturday</span>
                <span className="font-semibold text-blue-600">9:00 AM - 2:00 PM</span>
              </div>
              <div className="flex justify-between pb-2 border-b">
                <span className="font-semibold text-gray-700">Sunday</span>
                <span className="font-semibold text-blue-600">Emergency Only</span>
              </div>
              <div className="flex justify-between pb-2 border-b">
                <span className="font-semibold text-gray-700">Emergency Desk</span>
                <span className="font-semibold text-red-600">24/7 Available</span>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="p-8 bg-white shadow-lg rounded-xl">
            <h3 className="flex items-center gap-2 mb-6 text-2xl font-bold text-slate-900">
              <span className="text-blue-500">ℹ️</span> Quick Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="font-bold text-cyan-500">✓</span>
                <div>
                  <p className="font-semibold text-gray-700">Online OPD Booking</p>
                  <p className="text-sm text-gray-500">Book appointments instantly</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-bold text-cyan-500">✓</span>
                <div>
                  <p className="font-semibold text-gray-700">Real-time Queue Updates</p>
                  <p className="text-sm text-gray-500">Track your position in queue</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-bold text-cyan-500">✓</span>
                <div>
                  <p className="font-semibold text-gray-700">Multiple Departments</p>
                  <p className="text-sm text-gray-500">6+ specialist departments</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="p-8 bg-white shadow-lg rounded-xl md:p-12">
          <h2 className="mb-2 text-3xl font-bold text-slate-900">Send Us a Message</h2>
          <p className="mb-8 text-gray-600">Have a question? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>

          {submitted && (
            <div className="p-4 mb-6 font-semibold text-green-700 border border-green-200 rounded-lg bg-green-50">
              ✓ Thank you! Your message has been sent successfully. We'll get back to you soon.
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
            {/* Name */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                required
                className="w-full px-4 py-3 transition border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 transition border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+977-98XXXXXXXX"
                required
                className="w-full px-4 py-3 transition border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-3 transition border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
              >
                <option value="">Select a department</option>
                <option value="emergency">Emergency</option>
                <option value="neurology">Neurology</option>
                <option value="orthopedics">Orthopedics</option>
                <option value="cardiology">Cardiology</option>
                <option value="dermatology">Dermatology</option>
                <option value="pediatrics">Pediatrics</option>
              </select>
            </div>

            {/* Subject */}
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-semibold text-gray-700">Subject *</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="What is this regarding?"
                required
                className="w-full px-4 py-3 transition border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
              />
            </div>

            {/* Message */}
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-semibold text-gray-700">Message *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us more about your inquiry..."
                required
                rows="6"
                className="w-full px-4 py-3 transition border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
              ></textarea>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full px-6 py-3 font-semibold text-white transition duration-300 transform rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:scale-105"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>

        {/* FAQ Section */}
        <div className="p-8 mt-12 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
          <h3 className="mb-6 text-2xl font-bold text-slate-900">Frequently Asked Questions</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-semibold text-blue-600">How do I book an OPD appointment?</h4>
              <p className="text-sm text-gray-600">Visit the Departments section, select your desired department and doctor, then fill in your details through our online booking system.</p>
            </div>
            <div>
              <h4 className="mb-2 font-semibold text-blue-600">Can I cancel my appointment?</h4>
              <p className="text-sm text-gray-600">Yes, you can cancel up to 2 hours before your scheduled appointment time. Contact us or use your booking reference.</p>
            </div>
            <div>
              <h4 className="mb-2 font-semibold text-blue-600">What payment methods do you accept?</h4>
              <p className="text-sm text-gray-600">We accept cash, debit cards, credit cards, and digital payment methods including eSewa and Khalti.</p>
            </div>
            <div>
              <h4 className="mb-2 font-semibold text-blue-600">How can I track my queue position?</h4>
              <p className="text-sm text-gray-600">After booking, you can track your real-time queue position through your booking reference number in our system.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
