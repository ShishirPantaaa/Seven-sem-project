import { useState } from "react";

export default function Departments() {
  const [selectedDept, setSelectedDept] = useState(null);

  const departments = [
    {
      title: "Emergency",
      description: "Immediate medical care for accidents, critical injuries, and life-threatening conditions.",
      image: "/emergancy.jpg",
      color: "from-red-500 to-red-600",
    },
    {
      title: "Neurology",
      description: "Diagnosis and treatment of disorders related to the brain, nerves, and spinal cord.",
      image: "/Neurology.jpg",
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Orthopedics",
      description: "Treatment of bone, joint, muscle, and spine-related problems.",
      image: "/Orthopedics.jpg",
      color: "from-orange-500 to-orange-600",
    },
    {
      title: "Cardiology",
      description: "Specialized care for heart diseases, blood pressure, and vascular conditions.",
      image: "/Cardiology.jpg",
      color: "from-pink-500 to-pink-600",
    },
    {
      title: "Dermatology",
      description: "Diagnosis and treatment of skin, hair, and nail-related conditions.",
      image: "/Dermatology.jpg",
      color: "from-green-500 to-green-600",
    },
    {
      title: "Pediatrics",
      description: "Medical care for infants, children, and adolescents.",
      image: "/Pediatrics.jpg",
      color: "from-blue-500 to-blue-600",
    },
  ];

  const doctorsByDept = {
    Emergency: [
      {
        id: 1,
        name: "Dr. Ram Prasad Bhattarai",
        specialization: "Emergency Medicine Specialist",
        experience: "15 years",
        rating: 4.9,
        reviews: 342,
        image: "/doctors/doctor1.jpg",
        description: "Expert in trauma management and critical care",
        availability: "24/7 - Available Now",
        availabilityScore: 1,
      },
      {
        id: 2,
        name: "Dr. Rohit pandey",
        specialization: "Emergency Physician",
        experience: "12 years",
        rating: 4.8,
        reviews: 298,
        image: "/doctors/doctor2.jpg",
        description: "Specialist in acute medical emergencies",
        availability: "24/7 - Available in 2 hrs",
        availabilityScore: 2,
      },
      {
        id: 3,
        name: "Dr.  Priya pokhrel",
        specialization: "Trauma Surgeon",
        experience: "14 years",
        rating: 4.9,
        reviews: 315,
        image: "/doctors/doctor3.jpg",
        description: "Highly experienced in surgical emergencies",
        availability: "24/7 - Available in 4 hrs",
        availabilityScore: 4,
      },
    ],
    Neurology: [
      {
        id: 1,
        name: "Dr. Anjali Pokhrel",
        specialization: "Neurologist",
        experience: "18 years",
        rating: 4.9,
        reviews: 356,
        image: "/doctors/doctor4.jpg",
        description: "Expert in brain disorders and seizures",
        availability: "Mon-Sat 9AM-5PM - Available Now",
        availabilityScore: 1,
      },
      {
        id: 2,
        name: "Dr. Govind Rana",
        specialization: "Neuro Specialist",
        experience: "13 years",
        rating: 4.8,
        reviews: 289,
        image: "/doctors/doctor5.jpg",
        description: "Specialist in stroke and neurological conditions",
        availability: "Tue-Sun 10AM-6PM - Available in 30 min",
        availabilityScore: 30,
      },
      {
        id: 3,
        name: "Dr. Nirmal Kumar",
        specialization: "Neurosurgeon",
        experience: "16 years",
        rating: 4.9,
        reviews: 328,
        image: "/doctors/doctor6.jpg",
        description: "Expert in brain and spine surgery",
        availability: "Mon-Fri 8AM-4PM - Available tomorrow",
        availabilityScore: 1440,
      },
    ],
    Orthopedics: [
      {
        id: 1,
        name: "Dr. Rajesh Gupta",
        specialization: "Orthopedic Surgeon",
        experience: "17 years",
        rating: 4.8,
        reviews: 312,
        image: "/doctors/doctor7.jpg",
        description: "Specialist in joint replacement and sports injuries",
        availability: "Mon-Fri 10AM-5PM - Available in 1 hr",
        availabilityScore: 60,
      },
      {
        id: 2,
        name: "Dr. Sanjana Das",
        specialization: "Orthopedist",
        experience: "14 years",
        rating: 4.9,
        reviews: 334,
        image: "/doctors/doctor8.jpg",
        description: "Expert in spine and orthopedic trauma",
        availability: "Tue-Sat 9AM-6PM - Available Now",
        availabilityScore: 1,
      },
      {
        id: 3,
        name: "Dr. Santi Thapa",
        specialization: "Sports Medicine Doctor",
        experience: "12 years",
        rating: 4.7,
        reviews: 267,
        image: "/doctors/doctor9.jpg",
        description: "Specialist in athletic injuries and rehabilitation",
        availability: "Mon-Thu 11AM-5PM - Available in 3 hrs",
        availabilityScore: 3,
      },
    ],
    Cardiology: [
      {
        id: 1,
        name: "Dr. Rima BK",
        specialization: "Cardiologist",
        experience: "19 years",
        rating: 4.9,
        reviews: 378,
        image: "/doctors/doctor10.jpg",
        description: "Expert in heart disease management and interventional cardiology",
        availability: "Mon-Wed 9AM-4PM - Available in 2 hrs",
        availabilityScore: 2,
      },
      {
        id: 2,
        name: "Dr. Meera Iyer",
        specialization: "Cardiac Specialist",
        experience: "15 years",
        rating: 4.8,
        reviews: 305,
        image: "/doctors/doctor11.jpg",
        description: "Specialist in arrhythmia and heart failure",
        availability: "Thu-Sat 10AM-5PM - Available Now",
        availabilityScore: 1,
      },
      {
        id: 3,
        name: "Dr. Anil Reddy",
        specialization: "Interventional Cardiologist",
        experience: "16 years",
        rating: 4.9,
        reviews: 341,
        image: "/doctors/doctor12.jpg",
        description: "Expert in cardiac catheterization and angioplasty",
        availability: "Tue-Fri 8AM-3PM - Available in 45 min",
        availabilityScore: 45,
      },
    ],
    Dermatology: [
      {
        id: 1,
        name: "Dr. Ramesh Shrestha",
        specialization: "Dermatologist",
        experience: "13 years",
        rating: 4.8,
        reviews: 298,
        image: "/doctors/doctor13.jpg",
        description: "Expert in skin disease treatment and cosmetic procedures",
        availability: "Mon-Sat 10AM-5PM - Available in 30 min",
        availabilityScore: 30,
      },
      {
        id: 2,
        name: "Dr. Rahul Joshi",
        specialization: "Skin Specialist",
        experience: "11 years",
        rating: 4.7,
        reviews: 276,
        image: "/doctors/doctor14.jpg",
        description: "Specialist in acne, allergies, and hair problems",
        availability: "Tue-Sun 11AM-6PM - Available Now",
        availabilityScore: 1,
      },
      {
        id: 3,
        name: "Dr. Priya Kapoor",
        specialization: "Cosmetic Dermatologist",
        experience: "12 years",
        rating: 4.8,
        reviews: 312,
        image: "/doctors/doctor15.jpg",
        description: "Expert in aesthetic treatments and skin procedures",
        availability: "Wed-Sat 9AM-5PM - Available in 2 hours",
        availabilityScore: 2,
      },
    ],
    Pediatrics: [
      {
        id: 1,
        name: "Dr. Rajeev Malik",
        specialization: "Pediatrician",
        experience: "14 years",
        rating: 4.9,
        reviews: 328,
        image: "/doctors/doctor16.jpg",
        description: "Specialist in child development and pediatric vaccines",
        availability: "Mon-Fri 9AM-5PM - Available Now",
        availabilityScore: 1,
      },
      {
        id: 2,
        name: "Dr. Kavya Sharma",
        specialization: "Pediatric Specialist",
        experience: "12 years",
        rating: 4.8,
        reviews: 289,
        image: "/doctors/doctor17.png",
        description: "Expert in childhood illnesses and nutrition",
        availability: "Tue-Sat 10AM-6PM - Available in 1 hr",
        availabilityScore: 60,
      },
      {
        id: 3,
        name: "Dr. Akshay Patel",
        specialization: "Child Specialist",
        experience: "13 years",
        rating: 4.7,
        reviews: 301,
        image: "/doctors/doctor18.jpg",
        description: "Specialist in neonatal and pediatric care",
        availability: "Mon-Thu 8AM-4PM - Available in 2 hrs",
        availabilityScore: 120,
      },
    ],
  };

  const renderStars = (rating) => {
    return "⭐".repeat(Math.floor(rating));
  };

  const getMockReviews = (doctor) => {
    return [
      {
        id: 1,
        user: "A. Kumar",
        text: `${doctor.name} was very professional and attentive. Highly recommended!`,
        date: "2025-11-02",
      },
      {
        id: 2,
        user: "S. Mehta",
        text: `Quick diagnosis and clear explanation by ${doctor.name}.`,
        date: "2025-10-12",
      },
      {
        id: 3,
        user: "R. Gupta",
        text: `${doctor.name} helped me recover quickly. Great experience.`,
        date: "2025-09-22",
      },
    ];
  };

  const getFastestDoctor = (doctors) => {
    return doctors.reduce((prev, current) =>
      prev.availabilityScore < current.availabilityScore ? prev : current
    );
  };

  const getRecommendedDoctor = (doctors) => {
    return doctors.reduce((prev, current) =>
      prev.rating > current.rating ? prev : current
    );
  };

  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {!selectedDept ? (
        <>
          <div className="mb-12 text-center">
            <h1 className="mb-3 text-5xl font-bold text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text">
              Our Departments
            </h1>
            <p className="text-lg text-slate-600">Select a department to view available doctors</p>
          </div>

          <div className="grid grid-cols-1 gap-6 mx-auto max-w-7xl sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept, index) => (
              <button
                key={index}
                onClick={() => setSelectedDept(dept)}
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
        </>
      ) : (
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setSelectedDept(null)}
            className="flex items-center gap-2 px-6 py-3 mb-8 font-semibold text-white transition rounded-lg bg-slate-700 hover:bg-slate-800"
          >
            ← Back to Departments
          </button>

          <div className="mb-8">
            <h2 className="mb-2 text-5xl font-bold text-slate-900">
              {selectedDept.title} Department
            </h2>
            <p className="text-lg text-slate-600">{selectedDept.description}</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {doctorsByDept[selectedDept.title]?.map((doctor) => {
              const fastestDoctor = getFastestDoctor(doctorsByDept[selectedDept.title]);
              const recommendedDoctor = getRecommendedDoctor(doctorsByDept[selectedDept.title]);
              const isFastest = doctor.id === fastestDoctor.id;
              const isRecommended = doctor.id === recommendedDoctor.id;

              return (
                <div
                  key={doctor.id}
                  className="relative overflow-hidden transition-all duration-300 bg-white border shadow-lg rounded-2xl hover:shadow-2xl border-slate-200 hover:border-cyan-300 group"
                >
                  {/* RECOMMENDED BADGE */}
                  {isRecommended && (
                    <div className="absolute top-0 right-0 z-20 px-4 py-2 text-white rounded-bl-lg bg-gradient-to-r from-amber-500 to-orange-600">
                      ⭐ Recommended
                    </div>
                  )}

                  {/* FASTEST AVAILABLE BADGE */}
                  {isFastest && !isRecommended && (
                    <div className="absolute top-0 right-0 z-20 px-4 py-2 text-white rounded-bl-lg bg-gradient-to-r from-green-500 to-emerald-600">
                      ⚡ Available Soon
                    </div>
                  )}

                  {/* Doctor Card Header with Image */}
                  <div className="p-6 text-white bg-gradient-to-r from-cyan-500 to-blue-600">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="object-cover w-full h-full border-4 border-white rounded-full shadow-lg"
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/96?text=${doctor.name.split(" ")[1]}`;
                        }}
                      />
                    </div>
                    <h3 className="text-2xl font-bold text-center">{doctor.name}</h3>
                    <p className="font-semibold text-center text-cyan-100">{doctor.specialization}</p>
                  </div>

                  {/* Doctor Card Body */}
                  <div className="p-6 space-y-4">
                    {/* Rating */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50">
                      <div>
                        <p className="text-sm text-slate-600">Rating</p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-slate-900">
                            {doctor.rating}
                          </span>
                          <span className="text-sm">{renderStars(doctor.rating)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">Reviews</p>
                        <p className="text-xl font-bold text-slate-900">
                          {doctor.reviews}
                        </p>
                      </div>
                    </div>

                    {/* Experience */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
                      <span className="text-3xl">👨‍💼</span>
                      <div>
                        <p className="text-sm text-slate-600">Experience</p>
                        <p className="font-semibold text-slate-900">
                          {doctor.experience}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <p className="mb-2 text-sm text-slate-600">About</p>
                      <p className="text-sm leading-relaxed text-slate-700">
                        {doctor.description}
                      </p>
                    </div>

                    {/* Availability - FASTEST AVAILABLE INDICATOR */}
                    <div
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        isFastest
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
                          : "bg-green-50"
                      }`}
                    >
                      <span className="text-2xl">🕐</span>
                      <div>
                        <p className="text-sm text-slate-600">Availability</p>
                        <p
                          className={`font-semibold ${
                            isFastest
                              ? "text-green-700 font-bold"
                              : "text-slate-900"
                          }`}
                        >
                          {doctor.availability}
                        </p>
                      </div>
                    </div>

                    {/* Reviews Section */}
                    <div className="mt-4">
                      <div className="mb-3 text-lg font-semibold text-slate-800">
                        Patient Reviews
                      </div>
                      <div className="p-4 space-y-3 rounded-lg bg-slate-50">
                        {getMockReviews(doctor).map((r) => (
                          <div key={r.id} className="p-3 bg-white rounded-md">
                            <div className="flex items-center justify-between">
                              <div className="font-semibold text-slate-900">
                                {r.user}
                              </div>
                              <div className="text-xs text-slate-500">{r.date}</div>
                            </div>
                            <div className="mt-2 text-sm text-slate-700">
                              {r.text}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
