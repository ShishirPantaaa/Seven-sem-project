import { useState } from "react";
import jsPDF from 'jspdf';

export default function OPDForm({ preSelectedDept, preSelectedDoctor }) {
  const [formData, setFormData] = useState({
  firstName: "",
  lastName: "",
  gender: "",
  age: "",
  dateOfBirth: "",
  address: "",
  photo: null,
});
const [generatedToken, setGeneratedToken] = useState(null);
const [bookingTime, setBookingTime] = useState(null);
const [errors, setErrors] = useState({});
  
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
  
  // Clear specific error when user starts typing
  if (errors[name] || errors.ageMatch) {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      if (name === 'age' || name === 'dateOfBirth') {
        delete newErrors.ageMatch;
      }
      return newErrors;
    });
  }
};
  
  // Validation function
  const validateForm = () => {
    const newErrors = {};
    
    if (formData.age && formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      
      if (parseInt(formData.age) !== calculatedAge) {
        newErrors.ageMatch = "Age does not match the date of birth.";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
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
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="object-cover w-full h-full border-4 border-white rounded-full shadow-lg"
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/80?text=${doctor.name.split(" ")[1]}`;
                        }}
                      />
                    </div>
                    <h3 className="text-lg font-bold">{doctor.name}</h3>
                    <p className="text-sm text-cyan-100">{doctor.specialty}</p>
                    <p className="mt-1 text-xs text-cyan-200">{doctor.experience}</p>
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
    
    // Set background color
    doc.setFillColor(59, 130, 246); // Blue background
    doc.rect(0, 0, 210, 297, 'F');
    
    // Add decorative border
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(2);
    doc.rect(10, 10, 190, 277);
    
    // Header
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text('OPD APPOINTMENT TOKEN', 105, 30, { align: 'center' }, {fontstyle: 'bold'});
    
    doc.setFontSize(12);
    doc.setTextColor(224, 242, 254);
    doc.text('Hospital Management System', 105, 40, { align: 'center' });
    
    // Token Number - Large and prominent
    doc.setFontSize(18);
    doc.setTextColor(255, 193, 7);
    doc.text(`TOKEN #${generatedToken}`, 105, 60, { align: 'center' });
    
    // Patient Photo (if available)
    if (formData.photo) {
      try {
        // Add photo in a circle - jsPDF can handle base64 data URLs
        doc.addImage(formData.photo, 'JPEG', 75, 70, 30, 30);
        // Add circular border
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(2);
        doc.circle(90, 85, 16);
      } catch (error) {
        console.log('Error adding photo to PDF:', error);
        // Fallback: add a placeholder circle
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(2);
        doc.circle(90, 85, 15);
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text('PHOTO', 90, 90, { align: 'center' });
      }
    } else {
      // No photo uploaded - add placeholder
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(2);
      doc.circle(90, 85, 15);
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text('PHOTO', 90, 90, { align: 'center' });
    }
    
    // Patient Information Section
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('PATIENT INFORMATION', 20, 120);
    
    doc.setFontSize(11);
    doc.setTextColor(224, 242, 254);
    doc.text(`Name: ${formData.firstName} ${formData.lastName}`, 20, 135);
    doc.text(`Gender: ${formData.gender}`, 20, 145);
    doc.text(`Age: ${formData.age} years`, 20, 155);
    doc.text(`Location: ${formData.address}`, 20, 165);
    
    // Appointment Details Section
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('APPOINTMENT DETAILS', 110, 120);
    
    doc.setFontSize(11);
    doc.setTextColor(224, 242, 254);
    doc.text(`Department: ${selectedDept.name}`, 110, 135);
    doc.text(`Doctor: ${selectedDoctor.name}`, 110, 145);
    doc.text(`Booking Time: ${bookingTime?.toLocaleString()}`, 110, 155);
    doc.text(`Est. Wait Time: ${hours}h ${minutes}m`, 110, 165);
    
    // Important Notes
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('IMPORTANT NOTES:', 20, 190);
    
    doc.setFontSize(9);
    doc.setTextColor(255, 193, 7);
    doc.text('• Please arrive 15 minutes early', 20, 200);
    doc.text('• Bring this token and ID proof', 20, 210);
    doc.text('• Follow queue number order', 20, 220);
    doc.text('• No refund for cancellation', 20, 230);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(224, 242, 254);
    doc.text('This token is valid only for the scheduled date and time.', 105, 250, { align: 'center' });
    doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 105, 260, { align: 'center' });
    
    // Add some decorative elements
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(1);
    doc.circle(20, 20, 5);
    doc.circle(190, 20, 3);
    doc.circle(20, 277, 3);
    doc.circle(190, 277, 4);
    
    doc.save(`OPD_Token_${generatedToken}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Ticket Display */}
      <div className="relative overflow-hidden shadow-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-500 rounded-3xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-white rounded-full shadow-lg">
              <span className="text-3xl"></span>
            </div>
            <h1 className="mb-2 text-4xl font-bold text-white">
              OPD APPOINTMENT TOKEN
            </h1>
            <p className="text-lg text-cyan-100">Hospital Management System</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Left Side - Patient Info */}
            <div className="space-y-4">
              <div className="p-6 border bg-white/10 backdrop-blur-sm rounded-2xl border-white/20">
                <h3 className="flex items-center gap-2 mb-4 text-xl font-bold text-white">
                  <span></span> Patient Information
                </h3>
                
                <div className="space-y-3 text-white">
                  <div className="flex items-center justify-between py-2 border-b border-white/20">
                    <span className="font-medium">Token Number:</span>
                    <span className="text-2xl font-bold text-yellow-300">#{generatedToken}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b border-white/20">
                    <span className="font-medium">Name:</span>
                    <span className="font-semibold">{formData.firstName} {formData.lastName}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b border-white/20">
                    <span className="font-medium">Gender:</span>
                    <span>{formData.gender}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b border-white/20">
                    <span className="font-medium">Age:</span>
                    <span>{formData.age} years</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <span className="font-medium">Location:</span>
                    <span className="text-right truncate max-w-48">{formData.address}</span>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="p-6 border bg-white/10 backdrop-blur-sm rounded-2xl border-white/20">
                <h3 className="flex items-center gap-2 mb-4 text-xl font-bold text-white">
                  <span>📅</span> Appointment Details
                </h3>
                
                <div className="space-y-3 text-white">
                  <div className="flex items-center justify-between py-2 border-b border-white/20">
                    <span className="font-medium">Department:</span>
                    <span className="font-semibold">{selectedDept.name}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b border-white/20">
                    <span className="font-medium">Doctor:</span>
                    <span className="font-semibold">{selectedDoctor.name}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b border-white/20">
                    <span className="font-medium">Booking Time:</span>
                    <span className="text-sm">{bookingTime?.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <span className="font-medium">Est. Wait Time:</span>
                    <span className="font-bold text-orange-300">{hours}h {minutes}m</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Photo and QR */}
            <div className="space-y-6">
              {/* Patient Photo */}
              <div className="p-6 border bg-white/10 backdrop-blur-sm rounded-2xl border-white/20">
                <h3 className="mb-4 text-xl font-bold text-center text-white">Patient Photo</h3>
                <div className="flex justify-center">
                  {formData.photo ? (
                    <div className="relative">
                      <img
                        src={formData.photo}
                        alt="Patient"
                        className="object-cover w-32 h-32 border-4 border-white rounded-full shadow-lg"
                      />
                      <div className="absolute flex items-center justify-center w-8 h-8 bg-green-500 rounded-full -bottom-2 -right-2">
                        <span className="text-sm text-white">✓</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-32 h-32 border-4 rounded-full bg-white/20 border-white/30">
                      <span className="text-4xl text-white">👤</span>
                    </div>
                  )}
                </div>
              </div>

              {/* QR Code Placeholder */}
              <div className="p-6 border bg-white/10 backdrop-blur-sm rounded-2xl border-white/20">
                <h3 className="mb-4 text-xl font-bold text-center text-white">Scan to Verify</h3>
                <div className="flex justify-center">
                  <div className="flex items-center justify-center w-32 h-32 bg-white border-2 rounded-lg border-white/30">
                    <div className="text-center">
                      <div className="mb-2 text-6xl">📱</div>
                      <p className="text-xs text-gray-600">QR Code</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="p-4 border bg-red-500/20 backdrop-blur-sm rounded-2xl border-red-400/30">
                <h4 className="flex items-center gap-2 mb-2 text-lg font-bold text-white">
                  <span>⚠️</span> Important Notes
                </h4>
                <ul className="space-y-1 text-sm text-white/90">
                  <li>• Please arrive 15 minutes early</li>
                  <li>• Bring this token and ID proof</li>
                  <li>• Follow queue number order</li>
                  <li>• No refund for cancellation</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 mt-8 text-center border-t border-white/20">
            <p className="text-sm text-cyan-100">
              This token is valid only for the scheduled date and time.
              For any queries, contact hospital reception.
            </p>
            <p className="mt-2 text-xs text-white/80">
              Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute w-12 h-12 rounded-full top-4 left-4 bg-white/10"></div>
        <div className="absolute w-8 h-8 rounded-full top-4 right-4 bg-white/10"></div>
        <div className="absolute w-6 h-6 rounded-full bottom-4 left-4 bg-white/10"></div>
        <div className="absolute w-10 h-10 rounded-full bottom-4 right-4 bg-white/10"></div>
      </div>

      {/* Action Buttons */}
      <div className="flex max-w-md gap-4 mx-auto mt-8">
        <button
          onClick={downloadTicket}
          className="flex items-center justify-center flex-1 gap-2 px-6 py-4 font-bold text-white transition-all duration-300 transform shadow-lg rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-xl hover:scale-105"
        >
          <span>📥</span> Download Ticket
        </button>

        <button
          onClick={() => window.location.reload()}
          className="flex items-center justify-center flex-1 gap-2 px-6 py-4 font-bold transition-all duration-300 transform bg-white border-2 border-gray-300 shadow-lg rounded-xl hover:border-gray-400 hover:shadow-xl hover:scale-105"
        >
          <span>🔄</span> Book New
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
    
    if (!validateForm()) {
      return; // Stop submission if validation fails
    }

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

        {/* Age & Date of Birth */}
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
              className={`w-full px-4 py-3 transition border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${errors.ageMatch ? 'border-red-500' : ''}`}
            />
            {errors.ageMatch && <p className="mt-1 text-sm text-red-600">{errors.ageMatch}</p>}
          </div>

          <div>
            <label className="block mb-2 font-semibold text-slate-900">Date of Birth *</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 transition border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${errors.ageMatch ? 'border-red-500' : ''}`}
            />
            {errors.ageMatch && <p className="mt-1 text-sm text-red-600">{errors.ageMatch}</p>}
          </div>
        </div>

        {/* Contact No */}
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
        
        {/* Upload Photo */}
        <div>
          <label className="block mb-2 font-semibold text-slate-900">
            Upload Your Photo *
          </label>
          <input
            type="file"
            name="photo"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  setFormData((prev) => ({
                    ...prev,
                    photo: e.target.result,
                  }));
                };
                reader.readAsDataURL(file);
              }
            }}
            required
            className="w-full px-4 py-3 transition bg-white border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-100 file:text-cyan-700 hover:file:bg-cyan-200 file:cursor-pointer"
          />
        </div>


        {/*Special Care Category*/}
        <div className="p-6 border-2 rounded-lg bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            Special Care Category
          </h2>

          <div className="grid gap-4 mb-6 md:grid-cols-2">
            {["Pregnant", "Bleeding", "Person with disability", "Senior citizen"].map((item) => (
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
