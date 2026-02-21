import { useState } from "react";
import jsPDF from 'jspdf';

export default function OPDForm({ preSelectedDept, preSelectedDoctor }) {
  const [formData, setFormData] = useState({
  firstName: "",
  lastName: "",
  gender: "",
  age: "",
  address: "",
});
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};


const [generatedToken, setGeneratedToken] = useState(null);
const [bookingTime, setBookingTime] = useState(null);

  const [step, setStep] = useState(preSelectedDept && preSelectedDoctor ? "form" : (preSelectedDept ? "doctor" : "department"));
  const [selectedDept, setSelectedDept] = useState(preSelectedDept ? { name: preSelectedDept } : null);
  const [selectedDoctor, setSelectedDoctor] = useState(preSelectedDoctor ? { name: preSelectedDoctor } : null);
  const [autoSelectedDoctor, setAutoSelectedDoctor] = useState(false);
  
  // Average consultation time in minutes for each doctor
  const AVG_CONSULTATION_TIME = 15; // minutes
  
  // Queue tracking - stores number of patients for each doctor
  const [patientQueues, setPatientQueues] = useState({
    "Dr. Ram Prasad": 3,
    "Dr. Priya Singh": 5,
    "Dr. Arjun Sharma": 2,
    "Dr. Deepak Verma": 4,
    "Dr. Anjali Patel": 3,
    "Dr. Nirmal Kumar": 6,
    "Dr. Rajesh Gupta": 5,
    "Dr. Sanjana Das": 2,
    "Dr. Vikram Singh": 4,
    "Dr. Suresh Nair": 7,
    "Dr. Meera Iyer": 3,
    "Dr. Anil Reddy": 5,
    "Dr. Neha Saxena": 2,
    "Dr. Rahul Joshi": 4,
    "Dr. Priya Kapoor": 3,
    "Dr. Rajeev Malik": 6,
    "Dr. Kavya Sharma": 4,
    "Dr. Akshay Patel": 2,
  });

  const departments = [
    { name: "Emergency", image: "/emergancy.jpg", color: "from-red-500 to-red-600", description: "Immediate medical care" },
    { name: "Neurology", image: "/Neurology.jpg", color: "from-purple-500 to-purple-600", description: "Brain and nerve disorders" },
    { name: "Orthopedics", image: "/Orthopedics.jpg", color: "from-orange-500 to-orange-600", description: "Bone and joint care" },
    { name: "Cardiology", image: "/Cardiology.jpg", color: "from-pink-500 to-pink-600", description: "Heart care" },
    { name: "Dermatology", image: "/Dermatology.jpg", color: "from-green-500 to-green-600", description: "Skin treatment" },
    { name: "Pediatrics", image: "/Pediatrics.jpg", color: "from-blue-500 to-blue-600", description: "Child healthcare" },
  ];

  const doctorsByDept = {
    Emergency: [
      { id: 1, name: "Dr. Ram Prasad", image: "/doctors/doctor1.jpg", rating: 4.9, specialty: "Emergency Medicine Specialist", experience: "15 years", reviews: 342 },
      { id: 2, name: "Dr. Priya Singh", image: "/doctors/doctor2.jpg", rating: 4.8, specialty: "Emergency Physician", experience: "12 years", reviews: 298 },
      { id: 3, name: "Dr. Arjun Sharma", image: "/doctors/doctor3.jpg", rating: 4.9, specialty: "Trauma Surgeon", experience: "14 years", reviews: 315 },
    ],
    Neurology: [
      { id: 1, name: "Dr. Deepak Verma", image: "/doctors/doctor4.jpg", rating: 4.9, specialty: "Neurologist", experience: "18 years", reviews: 356 },
      { id: 2, name: "Dr. Anjali Patel", image: "/doctors/doctor5.jpg", rating: 4.8, specialty: "Neuro Specialist", experience: "13 years", reviews: 289 },
      { id: 3, name: "Dr. Nirmal Kumar", image: "/doctors/doctor6.jpg", rating: 4.9, specialty: "Neurosurgeon", experience: "16 years", reviews: 328 },
    ],
    Orthopedics: [
      { id: 1, name: "Dr. Rajesh Gupta", image: "/doctors/doctor7.jpg", rating: 4.8, specialty: "Orthopedic Surgeon", experience: "17 years", reviews: 312 },
      { id: 2, name: "Dr. Sanjana Das", image: "/doctors/doctor8.jpg", rating: 4.9, specialty: "Orthopedist", experience: "14 years", reviews: 334 },
      { id: 3, name: "Dr. Vikram Singh", image: "/doctors/doctor9.jpg", rating: 4.7, specialty: "Sports Medicine Doctor", experience: "12 years", reviews: 267 },
    ],
    Cardiology: [
      { id: 1, name: "Dr. Suresh Nair", image: "/doctors/doctor10.jpg", rating: 4.9, specialty: "Cardiologist", experience: "19 years", reviews: 378 },
      { id: 2, name: "Dr. Meera Iyer", image: "/doctors/doctor11.jpg", rating: 4.8, specialty: "Cardiac Specialist", experience: "15 years", reviews: 305 },
      { id: 3, name: "Dr. Anil Reddy", image: "/doctors/doctor12.jpg", rating: 4.9, specialty: "Interventional Cardiologist", experience: "16 years", reviews: 341 },
    ],
    Dermatology: [
      { id: 1, name: "Dr. Neha Saxena", image: "/doctors/doctor13.jpg", rating: 4.8, specialty: "Dermatologist", experience: "13 years", reviews: 298 },
      { id: 2, name: "Dr. Rahul Joshi", image: "/doctors/doctor14.jpg", rating: 4.7, specialty: "Skin Specialist", experience: "11 years", reviews: 276 },
      { id: 3, name: "Dr. Priya Kapoor", image: "/doctors/doctor15.jpg", rating: 4.8, specialty: "Cosmetic Dermatologist", experience: "12 years", reviews: 312 },
    ],
    Pediatrics: [
      { id: 1, name: "Dr. Rajeev Malik", image: "/doctors/doctor16.jpg", rating: 4.9, specialty: "Pediatrician", experience: "14 years", reviews: 328 },
      { id: 2, name: "Dr. Kavya Sharma", image: "/doctors/doctor17.jpg", rating: 4.8, specialty: "Pediatric Specialist", experience: "12 years", reviews: 289 },
      { id: 3, name: "Dr. Akshay Patel", image: "/doctors/doctor18.jpg", rating: 4.7, specialty: "Child Specialist", experience: "13 years", reviews: 301 },
    ],
  };

  // STEP 1: SELECT DEPARTMENT
  if (step === "department") {
    return (
      <div className="w-full overflow-hidden bg-white border shadow-2xl rounded-2xl border-slate-200">
        <div className="px-8 py-8 bg-gradient-to-r from-cyan-500 to-blue-600">
          <h1 className="text-3xl font-bold text-center text-white md:text-4xl">
            Select Your Department
          </h1>
          <p className="mt-2 text-center text-cyan-100">Step 1 of 3</p>
        </div>

        <div className="p-8 md:p-10">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept) => (
              <button
                key={dept.name}
                onClick={() => {
                  setSelectedDept(dept);
                  setStep("doctor");
                }}
                className="relative overflow-hidden text-left transition-all duration-300 bg-white border shadow-lg group rounded-2xl hover:shadow-2xl hover:-translate-y-2 border-slate-200 hover:border-cyan-300"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${dept.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                ></div>
                <div className="relative z-10 p-6">
                  {/* IMAGE CONTAINER */}
                  <div className="relative h-40 mb-6 overflow-hidden rounded-xl">
                    <img
                      src={dept.image}
                      alt={dept.name}
                      className="object-cover w-full h-full transition duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/400x160?text=${dept.name}`;
                      }}
                    />
                    {/* GRADIENT OVERLAY */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${dept.color} opacity-30`}
                    ></div>
                  </div>

                  {/* TEXT CONTENT */}
                  <h3 className="mb-2 text-2xl font-bold text-slate-900">
                    {dept.name}
                  </h3>

                  <p className="mb-4 text-slate-600">
                    {dept.description}
                  </p>

                  <div className="flex items-center gap-2 font-semibold transition-transform text-cyan-600 group-hover:translate-x-2">
                    View Doctors →
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: SELECT DOCTOR (WITH ETA-BASED QUEUE MANAGEMENT)
  if (step === "doctor") {
    // ETA-Based Queue Time Estimation Algorithm
    const calculateETA = (doctorName) => {
      const patientCount = patientQueues[doctorName] || 0;
      return patientCount * AVG_CONSULTATION_TIME;
    };

    // Get doctors for selected department
    const doctors = doctorsByDept[selectedDept.name] || [];
    
    // Calculate ETA for each doctor
    const doctorsWithETA = doctors.map((doctor) => ({
      ...doctor,
      patientCount: patientQueues[doctor.name] || 0,
      eta: calculateETA(doctor.name),
    })).sort((a, b) => a.eta - b.eta);

    // Auto-select doctor with minimum ETA
    const doctorWithMinETA = doctorsWithETA[0];
    
    const handleDoctorSelection = (doctor, isAuto = false) => {
      setSelectedDoctor(doctor);
      setAutoSelectedDoctor(isAuto);
      setStep("form");
    };

    return (
      <div className="w-full overflow-hidden bg-white border shadow-2xl rounded-2xl border-slate-200">
        <div className="px-8 py-8 bg-gradient-to-r from-cyan-500 to-blue-600">
          <h1 className="text-3xl font-bold text-center text-white md:text-4xl">
            Select a Doctor
          </h1>
          <p className="mt-2 text-center text-cyan-100">Step 2 of 3 - {selectedDept.name} Department</p>
        </div>

        {/* Auto-Selected Doctor Alert */}
        <div className="px-8 py-4 border-b border-blue-200 bg-blue-50">
          <div className="p-4 bg-blue-100 rounded-lg">
            <p className="font-semibold text-blue-900">💡 Smart Queue Management</p>
            <p className="mt-1 text-sm text-blue-800">
              <strong>{doctorWithMinETA.name}</strong> is recommended (Shortest Wait: {Math.round(doctorWithMinETA.eta / 60)}h {doctorWithMinETA.eta % 60}m)
            </p>
            <p className="mt-2 text-xs text-blue-700">You can select any doctor below, or proceed with the recommended option.</p>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {doctorsWithETA.map((doctor) => {
              const isRecommended = doctor.id === doctorWithMinETA.id;
              const etaHours = Math.floor(doctor.eta / 60);
              const etaMinutes = doctor.eta % 60;

              return (
                <div
                  key={doctor.id}
                  className={`overflow-hidden transition-all duration-300 border-2 shadow-lg cursor-pointer rounded-xl hover:shadow-xl group ${
                    isRecommended
                      ? "border-green-500 bg-gradient-to-br from-green-50 to-green-100"
                      : "bg-gradient-to-br from-slate-50 to-slate-100 border-slate-300 hover:border-cyan-500"
                  }`}
                  onClick={() => handleDoctorSelection(doctor, false)}
                >
                  {/* Recommended Badge */}
                  {isRecommended && (
                    <div className="absolute top-0 right-0 z-10 px-3 py-1 text-xs font-bold text-white bg-green-500 rounded-bl-lg">
                      ⭐ RECOMMENDED
                    </div>
                  )}

                  <div className="p-6 text-center text-white bg-gradient-to-r from-cyan-500 to-blue-600">
                    <div className="relative mx-auto mb-4 w-20 h-20">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/80?text=${doctor.name.split(" ")[1]}`;
                        }}
                      />
                    </div>
                    <h3 className="text-lg font-bold">{doctor.name}</h3>
                    <p className="text-sm text-cyan-100">{doctor.specialty}</p>
                    <p className="text-xs text-cyan-200 mt-1">{doctor.experience}</p>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between p-3 mb-3 rounded-lg bg-amber-50">
                      <span className="text-sm text-slate-600">Rating</span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-900">{doctor.rating}</span>
                        <span className="text-xs">⭐</span>
                      </div>
                    </div>

                    {/* Experience */}
                    <div className="flex items-center justify-between p-3 mb-3 rounded-lg bg-blue-50">
                      <span className="text-sm text-slate-600">Experience</span>
                      <span className="font-bold text-slate-900">{doctor.experience}</span>
                    </div>

                    {/* Reviews */}
                    <div className="flex items-center justify-between p-3 mb-3 rounded-lg bg-purple-50">
                      <span className="text-sm text-slate-600">Reviews</span>
                      <span className="font-bold text-slate-900">{doctor.reviews}</span>
                    </div>

                    {/* Queue Information */}
                    <div className="flex items-center justify-between p-3 mb-3 rounded-lg bg-green-50">
                      <div>
                        <p className="text-xs text-slate-600">Current Queue</p>
                        <p className="font-bold text-slate-900">{doctor.patientCount} patients</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-600">Est. Wait</p>
                        <p className="font-bold text-slate-900">
                          {etaHours}h {etaMinutes}m
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDoctorSelection(doctor, false);
                      }}
                      className={`w-full py-2 font-semibold text-white transition rounded-lg group-hover:scale-105 ${
                        isRecommended
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                          : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                      }`}
                    >
                      {isRecommended ? "Select (Recommended)" : "Select Doctor"} →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setStep("department")}
            className="px-6 py-3 mt-6 font-semibold transition rounded-lg bg-slate-300 hover:bg-slate-400 text-slate-900"
          >
            ← Back to Departments
          </button>
        </div>
      </div>
    );
  }
  //ticket 
  // STEP 4: SHOW TICKET
if (step === "ticket") {
  if (!selectedDoctor) return null;

  const estimatedWait = (patientQueues[selectedDoctor.name] || 0) * AVG_CONSULTATION_TIME;
  const hours = Math.floor(estimatedWait / 60);
  const minutes = estimatedWait % 60;

  const downloadTicket = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('OPD Appointment Ticket', 20, 30);
    doc.setFontSize(12);
    doc.text(`Token Number: #${generatedToken}`, 20, 50);
    doc.text(`Name: ${formData.firstName} ${formData.lastName}`, 20, 60);
    doc.text(`Gender: ${formData.gender}`, 20, 70);
    doc.text(`Age: ${formData.age}`, 20, 80);
    doc.text(`Location: ${formData.address}`, 20, 90);
    doc.text(`Department: ${selectedDept.name}`, 20, 100);
    doc.text(`Doctor: ${selectedDoctor.name}`, 20, 110);
    doc.text(`Booking Time: ${bookingTime?.toLocaleString()}`, 20, 120);
    doc.text(`Estimated Waiting Time: ${hours}h ${minutes}m`, 20, 130);
    doc.save('OPD_Ticket.pdf');
  };

  return (
    <div className="max-w-lg p-8 mx-auto bg-white border shadow-2xl rounded-2xl border-slate-200">

      <div className="pb-6 text-center border-b">
        <h1 className="text-3xl font-bold text-cyan-600">
          OPD Appointment Ticket
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Please keep this ticket for your consultation
        </p>
      </div>

      <div className="mt-6 space-y-4 text-slate-800">

        <div className="flex justify-between">
          <span className="font-semibold">Token Number:</span>
          <span className="text-2xl font-bold text-blue-600">
            #{generatedToken}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Name:</span>
          <span>{formData.firstName} {formData.lastName}</span>
        </div>

        <div className="flex justify-between">
          <span>Gender:</span>
          <span>{formData.gender}</span>
        </div>

        <div className="flex justify-between">
          <span>Age:</span>
          <span>{formData.age}</span>
        </div>

        <div className="flex justify-between">
          <span>Location:</span>
          <span>{formData.address}</span>
        </div>

        <div className="flex justify-between">
          <span>Department:</span>
          <span>{selectedDept.name}</span>
        </div>

        <div className="flex justify-between">
          <span>Doctor:</span>
          <span>{selectedDoctor.name}</span>
        </div>

        <div className="flex justify-between">
          <span>Booking Time:</span>
          <span>{bookingTime?.toLocaleString()}</span>
        </div>

        <div className="flex justify-between">
          <span>Estimated Waiting Time:</span>
          <span className="font-semibold text-orange-600">
            {hours}h {minutes}m
          </span>
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={downloadTicket}
          className="flex-1 py-3 font-semibold text-white rounded-lg bg-cyan-500 hover:bg-cyan-600"
        >
          Download Ticket
        </button>

        <button
          onClick={() => window.location.reload()}
          className="flex-1 py-3 font-semibold rounded-lg bg-slate-300 hover:bg-slate-400"
        >
          Book New
        </button>
      </div>
    </div>
  );
}


  // STEP 3: FILL FORM
  return (
    <div className="w-full overflow-hidden bg-white border shadow-2xl rounded-2xl border-slate-200">
      <div className="px-8 py-8 bg-gradient-to-r from-cyan-500 to-blue-600">
        <h1 className="text-3xl font-bold text-center text-white md:text-4xl">
          OPD Token Booking Form
        </h1>
        <p className="mt-2 text-center text-cyan-100">Step 3 of 3</p>
      </div>

      {/* Selected Department and Doctor Info */}
      <div className="px-8 py-4 border-b bg-gradient-to-r from-cyan-50 to-blue-50 border-slate-200">
        <div className="flex flex-col justify-center gap-6 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-sm text-slate-600">Selected Department</p>
            <p className="font-bold text-slate-900">{selectedDept.name}</p>
          </div>
          <div className="hidden text-2xl sm:block text-cyan-400">|</div>
          <div>
            <p className="text-sm text-slate-600">Selected Doctor</p>
            <div className="flex items-center gap-2">
              <p className="font-bold text-slate-900">{selectedDoctor.name}</p>
              {autoSelectedDoctor && (
                <span className="px-2 py-1 text-xs font-semibold text-white bg-green-500 rounded">Auto-Selected</span>
              )}
            </div>
          </div>
        </div>
      </div>

      

      <form
  onSubmit={(e) => {
    e.preventDefault();

    // Generate token based on doctor queue
    const currentQueue = patientQueues[selectedDoctor.name] || 0;
    const newToken = currentQueue + 1;

    // Update queue count
    setPatientQueues((prev) => ({
      ...prev,
      [selectedDoctor.name]: newToken,
    }));

    setGeneratedToken(newToken);
    setBookingTime(new Date());
    setStep("ticket");
  }}
  className="p-8 space-y-6 md:p-10"
>

        {/* Name */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block mb-2 font-semibold text-slate-900">First Name *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="Enter your first name"
              className="w-full px-4 py-3 transition border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-slate-900">Last Name *</label>
            <input
               type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Enter your last name"
              className="w-full px-4 py-3 transition border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="block mb-3 font-semibold text-slate-900">
            Select your Gender *
          </label>
          <div className="flex justify-center gap-8 p-4 border-2 rounded-lg border-slate-200 bg-slate-50">
            {["Male", "Female", "Others"].map((g) => (
              <label key={g} className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input type="radio"
                       name="gender"
                       value={g}
                       checked={formData.gender === g}
                       onChange={handleChange} className="w-4 h-4 cursor-pointer accent-cyan-500" required />
                <span className="font-medium">{g}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Age & Contact */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block mb-2 font-semibold text-slate-900">Age *</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Enter your age"
              required
              className="w-full px-4 py-3 transition border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-slate-900">Contact No *</label>
            <div className="flex mt-0">
              <span className="flex items-center px-4 font-medium border border-r-0 rounded-l-lg bg-slate-100 border-slate-300 text-slate-700">
                🇳🇵 +977
              </span>
              <input
                type="tel"
                required
                placeholder="Contact number"
                className="w-full px-4 py-3 transition border rounded-r-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Blood Group & Email */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block mb-2 font-semibold text-slate-900">Blood Group</label>
            <select className="w-full px-4 py-3 transition bg-white border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
              <option>Select Blood Group</option>
              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>B-</option>
              <option>AB+</option>
              <option>AB-</option>
              <option>O+</option>
              <option>O-</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-slate-900">Email</label>
            <input
              type="email"
              placeholder="your.email@example.com"
              className="w-full px-4 py-3 transition border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block mb-2 font-semibold text-slate-900">Full Address *</label>
          <input
           type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter your complete address"
            required
            className="w-full px-4 py-3 transition border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        {/* Emergency Details */}
        <div className="p-6 border-2 rounded-lg bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            Emergency Details
          </h2>

          <div className="grid gap-4 mb-6 md:grid-cols-2">
            {["Pregnant", "Bleeding", "Unconscious", "Accident Case"].map((item) => (
              <label key={item} className="flex items-center gap-3 cursor-pointer text-slate-700">
                <input type="checkbox" className="w-4 h-4 rounded cursor-pointer accent-cyan-500" />
                <span className="font-medium">{item}</span>
              </label>
            ))}
          </div>

          <div className="mb-6">
            <label className="block mb-3 font-semibold text-slate-900">Pain Level (1–10)</label>
            <input
              type="range"
              min="1"
              max="10"
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-300 accent-cyan-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-slate-900">
              Describe your symptoms or problem
            </label>
            <textarea
              rows="4"
              className="w-full px-4 py-3 transition border rounded-lg resize-none border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Describe your symptoms in detail..."
            ></textarea>
          </div>
        </div>

        {/* Date & Payment */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block mb-2 font-semibold text-slate-900">Select Date *</label>
            <input
              type="date"
              required
              className="w-full px-4 py-3 transition border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-slate-900">Payment Method</label>
            <div className="flex items-center justify-center p-4 border rounded-lg bg-slate-50 border-slate-300">
              <a
                href="https://esewa.com.np/login#/home"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:scale-110 hover:shadow-lg"
              >
                <img
                  src="./esewa_og.webp"
                  alt="eSewa"
                  className="h-12"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Upload Payment Screenshot */}
        <div>
          <label className="block mb-2 font-semibold text-slate-900">
            Upload Screenshot of Payment *
          </label>
          <input
            type="file"
            accept="image/*"
            required
            className="w-full px-4 py-3 transition bg-white border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-100 file:text-cyan-700 hover:file:bg-cyan-200 file:cursor-pointer"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            type="button"
            onClick={() => setStep("doctor")}
            className="flex-1 py-4 text-lg font-semibold transition-all duration-300 rounded-lg text-slate-900 bg-slate-300 hover:bg-slate-400"
          >
            ← Back
          </button>
          <button
            type="submit"
            className="flex-1 py-4 text-lg font-semibold text-white transition-all duration-300 rounded-lg shadow-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 hover:shadow-xl hover:scale-105 active:scale-95"
          >
            Book OPD Token
          </button>
        </div>
      </form>
      
    </div>
  );
}
