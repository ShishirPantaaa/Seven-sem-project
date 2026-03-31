import { useState, useEffect } from "react";
import jsPDF from 'jspdf';
import { useAuth } from "../context/AuthContext";
import { departments, doctorsByDept } from "../data/departmentsData";

export default function OPDForm({ preSelectedDept, preSelectedDoctor }) {
  const auth = useAuth();

  // Helper utilities
  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  function isSaturday(date) {
    return new Date(date).getDay() === 6;
  }

  function getNextAvailableDay(date) {
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    while (isSaturday(next)) {
      next.setDate(next.getDate() + 1);
    }
    return next;
  }

  function formatISODate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    age: "",
    dateOfBirth: "",
    address: "",
    contact: "",
    photo: null,
  });

  const [generatedToken, setGeneratedToken] = useState(null);
  const [bookingTime, setBookingTime] = useState(null);
  const [etaTime, setEtaTime] = useState(null);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Visit date (for booking) - default to today or next available non-Saturday.
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const safeDate = isSaturday(today) ? getNextAvailableDay(today) : today;
    return formatISODate(safeDate);
  });
  const [dateError, setDateError] = useState(null);

  // Form step state
  const [step, setStep] = useState(preSelectedDept && preSelectedDoctor ? "form" : (preSelectedDept ? "doctor" : "department"));
  const [selectedDept, setSelectedDept] = useState(preSelectedDept ? { title: preSelectedDept } : null);
  const [selectedDoctor, setSelectedDoctor] = useState(preSelectedDoctor ? { name: preSelectedDoctor } : null);
  const [autoSelectedDoctor, setAutoSelectedDoctor] = useState(false);
  
  // Average consultation time fallback if backend estimate is unavailable.
  const AVG_CONSULTATION_TIME = 15;

  // Fetch request to backend to book token
  async function submitForm(payload) {
  // Backend expects JSON; we deliberately exclude the photo here since
  // the server doesn't handle multipart uploads. If you later add
  // file support, switch to FormData and adjust the backend accordingly.
  if (!auth.token) {
    throw new Error("You must be logged in to book a token. Please login first.");
  }
  try {
    const response = await fetch("http://localhost:5000/api/opd/book-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Server responded ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("submitForm error", err);
    throw err;
  }
}

const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "dateOfBirth") {
    const age = calculateAge(value);

    setFormData((prev) => ({
      ...prev,
      dateOfBirth: value,
      age: age,
    }));
  } else {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // Clear specific error when user starts typing
  if (errors[name] || errors.ageMatch) {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];

      if (name === "age" || name === "dateOfBirth") {
        delete newErrors.ageMatch;
      }

      return newErrors;
    });
  }
};

  const handleDateChange = (e) => {
    const value = e.target.value;

    if (!value) {
      setSelectedDate("");
      setDateError(null);
      return;
    }

    const selected = new Date(value);
    const today = new Date();
    const max = new Date(today);
    max.setDate(max.getDate() + 3);

    const normalize = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const selectedN = normalize(selected);
    const todayN = normalize(today);
    const maxN = normalize(max);

    if (selectedN < todayN) {
      setDateError("Date must be today or later.");
      return;
    }

    if (selectedN > maxN) {
      setDateError("Date can be at most 3 days ahead.");
      return;
    }

    if (isSaturday(selected)) {
      setDateError("Saturdays are closed for booking. Please choose another date.");
      return;
    }

    setDateError(null);
    setSelectedDate(value);
  };

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

      if (parseInt(formData.age, 10) !== calculatedAge) {
        newErrors.ageMatch = "Age does not match the date of birth.";
      }
    }

    // Phone validation: 10 digits and starts with 98 or 97
    const contactValue = (formData.contact || "").trim();
    if (!contactValue) {
      newErrors.contact = "Phone number is required.";
    } else if (!/^[0-9]+$/.test(contactValue)) {
      newErrors.contact = "Phone number must contain only digits.";
    } else if (contactValue.length !== 10) {
      newErrors.contact = "Phone number must be exactly 10 digits.";
    } else if (!/^(98|97)/.test(contactValue)) {
      newErrors.contact = "Phone number must start with 98 or 97.";
    }

    if (!selectedDate) {
      newErrors.visitDate = "Please select a visit date.";
    } else {
      const today = new Date();
      const selected = new Date(selectedDate);
      const maxDate = new Date(today); maxDate.setDate(maxDate.getDate() + 3);

      // normalize dates to avoid timezone differences
      const normalize = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const normalizedSelected = normalize(selected);
      const normalizedToday = normalize(today);
      const normalizedMax = normalize(maxDate);

      if (normalizedSelected < normalizedToday) {
        newErrors.visitDate = 'Visit date cannot be before today.';
      } else if (normalizedSelected > normalizedMax) {
        newErrors.visitDate = 'Visit date can be at most 3 days from today.';
      }
    }

    if (dateError) {
      newErrors.visitDate = dateError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [patientQueues, setPatientQueues] = useState({});

  const fetchQueueCountForDoctor = async (doctorName, departmentName) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/opd/queue-count?doctorName=${encodeURIComponent(doctorName)}&departmentName=${encodeURIComponent(departmentName)}`
      );
      if (!response.ok) {
        console.warn(`Queue count fetch failed for ${doctorName}: ${response.status}`);
        return { count: 0, estimatedWaitMinutes: 0 };
      }
      const data = await response.json();
      return {
        count: Number(data.count || 0),
        estimatedWaitMinutes: Number(data.estimatedWaitMinutes || 0),
      };
    } catch (error) {
      console.error('Error fetching queue count:', error);
      return { count: 0, estimatedWaitMinutes: 0 };
    }
  };

  useEffect(() => {
    if (!selectedDept) {
      return;
    }

    const doctors = doctorsByDept[selectedDept.title] || [];

    const refreshCounts = async () => {
      const updated = {};
      await Promise.all(
        doctors.map(async (doctor) => {
          updated[doctor.name] = await fetchQueueCountForDoctor(doctor.name, selectedDept.title);
        })
      );
      setPatientQueues(updated);
    };

    refreshCounts();
    const interval = setInterval(refreshCounts, 15000);

    return () => clearInterval(interval);
  }, [selectedDept]);

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
                key={dept.title}
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
                      alt={dept.title}
                      className="object-cover w-full h-full transition duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/400x160?text=${dept.title}`;
                      }}
                    />
                    {/* GRADIENT OVERLAY */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${dept.color} opacity-30`}
                    ></div>
                  </div>

                  {/* TEXT CONTENT */}
                  <h3 className="mb-2 text-2xl font-bold text-slate-900">
                    {dept.title}
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
      const queueInfo = patientQueues[doctorName] || { count: 0, estimatedWaitMinutes: 0 };
      if (typeof queueInfo.estimatedWaitMinutes === "number") {
        return queueInfo.estimatedWaitMinutes;
      }
      return (queueInfo.count || 0) * AVG_CONSULTATION_TIME;
    };

    // Get doctors for selected department
    const doctors = doctorsByDept[selectedDept?.title] || [];
    
    // Calculate ETA for each doctor
    const doctorsWithETA = doctors.map((doctor) => ({
      ...doctor,
      patientCount: patientQueues[doctor.name]?.count || 0,
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
          <p className="mt-2 text-center text-cyan-100">Step 2 of 3 - {selectedDept.title} Department</p>
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
                       RECOMMENDED
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

  const estimatedWait = typeof estimatedWaitTime === 'number'
    ? estimatedWaitTime
    : ((patientQueues[selectedDoctor.name]?.estimatedWaitMinutes ?? null) ?? ((patientQueues[selectedDoctor.name]?.count || 0) * AVG_CONSULTATION_TIME));
  const waitText = typeof estimatedWait === 'number' ? `${estimatedWait} min` : 'N/A';
  // `etaTime` is populated from backend (e.g. "10:15 AM")
  const appointmentTimeText = etaTime || 'N/A';

  const downloadTicket = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;

    // Light background
    doc.setFillColor(245, 248, 255);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // Header block
    doc.setFillColor(18, 84, 171);
    doc.rect(margin, margin, contentWidth, 28, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("OPD APPOINTMENT TOKEN", margin + 6, margin + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Hospital Management System", margin + 6, margin + 16);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`TOKEN #${generatedToken}`, pageWidth - margin - 2, margin + 10, { align: "right" });

    // Divider
    doc.setDrawColor(200, 210, 230);
    doc.setLineWidth(0.5);
    doc.line(margin, margin + 34, pageWidth - margin, margin + 34);

    // Photo box (top-right)
    const photoW = 38;
    const photoH = 34;
    const photoX = pageWidth - margin - photoW;
    const photoY = margin + 38;

    doc.setDrawColor(180, 190, 210);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(photoX, photoY, photoW, photoH, 3, 3, "FD");

    if (formData.photo) {
      try {
        doc.addImage(formData.photo, "JPEG", photoX + 1, photoY + 1, photoW - 2, photoH - 2);
      } catch (error) {
        console.warn("Unable to embed photo in PDF:", error);
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text("Invalid photo", photoX + photoW / 2, photoY + photoH / 2, { align: "center", baseline: "middle" });
      }
    } else {
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text("No photo", photoX + photoW / 2, photoY + photoH / 2, { align: "center", baseline: "middle" });
    }

    // Patient information block
    let y = margin + 46;
    const labelX = margin + 4;
    const valueX = margin + 55;
    const lineHeight = 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(34, 44, 59);
    doc.text("Patient Information", labelX, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const writeLine = (label, value) => {
      doc.text(`${label}:`, labelX, y);
      doc.text(value, valueX, y);
      y += lineHeight;
    };

    writeLine("Name", `${formData.firstName} ${formData.lastName}`);
    writeLine("Gender", formData.gender || "N/A");
    writeLine("Age", formData.age ? `${formData.age} yrs` : "N/A");
    writeLine("Contact", formData.contact ? `+977 ${formData.contact}` : "N/A");
    writeLine("Location", formData.address || "N/A");

    // Appointment details block
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Appointment Details", labelX, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const bookingDate = bookingTime ? new Date(bookingTime).toLocaleDateString() : appointmentTimeText;
    const bookingTimeOnly = appointmentTimeText;
    const waitMins = typeof estimatedWait === "number" ? estimatedWait : 0;
    const waitHours = Math.floor(waitMins / 60);
    const waitRemainingMins = waitMins % 60;

    writeLine("Department", selectedDept?.title || "N/A");
    writeLine("Doctor", selectedDoctor?.name || "N/A");
    writeLine("Date", bookingDate);
    writeLine("Time", bookingTimeOnly);
    writeLine("Est. Wait", `${waitHours}h ${waitRemainingMins}m`);

    // Important notes
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Important Notes", labelX, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const notes = [
      "Please arrive 15 minutes early.",
      "Bring this token and an ID proof.",
      "Follow the queue number order.",
      "No refunds for cancellations.",
    ];

    notes.forEach((note) => {
      doc.text(`• ${note}`, labelX + 2, y);
      y += 5.5;
    });

    // Footer
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(110, 120, 140);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
      margin,
      pageHeight - margin - 4
    );

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

                  <div className="flex items-center justify-between py-2 border-b border-white/20">
                    <span className="font-medium">Contact:</span>
                    <span>+977 {formData.contact}</span>
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
                    <span className="font-semibold">{selectedDept.title}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b border-white/20">
                    <span className="font-medium">Doctor:</span>
                    <span className="font-semibold">{selectedDoctor.name}</span>
                  </div>
                  
                  <div className="flex flex-col gap-1 py-2 border-b border-white/20">
                    <span className="font-medium">Appointment Time:</span>
                    <span className="text-sm">{appointmentTimeText}</span>
                    <span className="text-xs text-white/70">Date: {bookingTime}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <span className="font-medium">Est. Wait</span>
                    <span className="font-bold text-orange-300">{waitText}</span>
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
                        className="object-cover w-40 h-32 border-4 border-white shadow-lg"
                      />
                      <div className="absolute flex items-center justify-center w-8 h-8 bg-green-500 rounded-full -bottom-2 -right-2">
                        <span className="text-sm text-white">✓</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-40 h-32 border-4 bg-white/20 border-white/30">
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
            <p className="font-bold text-slate-900">{selectedDept.title}</p>
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
        onSubmit={async (e) => {
          e.preventDefault();

          if (!validateForm()) {
            return;
          }

          const payload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            age: formData.age,
            gender: formData.gender,
            address: formData.address,
            contact: formData.contact,
            department: selectedDept.title,
            doctor: selectedDoctor.name,
            appointmentDate: selectedDate,
          };

          setIsSubmitting(true);
          try {
            console.log("Submitting form with payload:", payload);

            const data = await submitForm(payload);
            console.log("Server Response:", data);

            alert("Your record is successfully submitted");

            setGeneratedToken(data.tokenNumber);
            setEtaTime(data.eta);
            setEstimatedWaitTime(data.estimatedWaitMinutes ?? null);
            setBookingTime(data.appointmentDate);

            setPatientQueues((prev) => ({
              ...prev,
              [selectedDoctor.name]: {
                count: (prev[selectedDoctor.name]?.count || 0) + 1,
                estimatedWaitMinutes: (prev[selectedDoctor.name]?.estimatedWaitMinutes || 0) + AVG_CONSULTATION_TIME,
              },
            }));

            setStep("ticket");
          } catch (error) {
            console.error("Error submitting form:", error);
            if (error.message.includes("403") && error.message.includes("Invalid or expired token")) {
              auth.logout();
              alert("Your session has expired. Please login again.");
              window.location.href = "/login";
            } else {
              alert("Error submitting form: " + error.message);
            }
          } finally {
            setIsSubmitting(false);
          }
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
               readOnly
               className="w-full px-4 py-3 bg-gray-100 border rounded-lg"
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
              name="contact"
              value={formData.contact || ""}
              onChange={handleChange}
              required
              placeholder="Contact number"
              className={`w-full px-4 py-3 transition border rounded-r-lg ${errors.contact ? 'border-red-500 bg-red-100' : 'border-slate-300'}`}
            />
          </div>
          {errors.contact && <p className="mt-1 text-sm text-red-600">{errors.contact}</p>}
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
            <p className="mb-1 text-xs text-slate-500">
              Saturdays are unavailable for booking (closed). Please pick another day.
            </p>
            <input
              type="date"
              required
              value={selectedDate}
              min={formatISODate(isSaturday(new Date()) ? getNextAvailableDay(new Date()) : new Date())}
              onChange={handleDateChange}
              className={`w-full px-4 py-3 transition border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                dateError ? 'border-red-500 ring-red-500 bg-red-100' : 'border-slate-300 bg-emerald-100 font-bold'
              }`}
            />
            {dateError && (
              <p className="mt-2 text-sm text-red-600">{dateError}</p>
            )}
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
            disabled={isSubmitting}
            className="flex-1 py-4 text-lg font-semibold transition-all duration-300 rounded-lg text-slate-900 bg-slate-300 hover:bg-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-4 text-lg font-semibold text-white transition-all duration-300 rounded-lg shadow-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            {isSubmitting ? "Booking..." : "Book OPD Token"}
          </button>
        </div>
      </form>
    </div>
  );
}
