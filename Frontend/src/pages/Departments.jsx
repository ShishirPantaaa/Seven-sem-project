import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const baseUrl = "http://localhost:5000";

const cardGradients = [
  "from-red-500 to-orange-500",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-indigo-500 to-sky-600",
  "from-amber-500 to-yellow-600",
  "from-fuchsia-500 to-pink-600",
];

const getDepartmentImage = (name) => {
  const key = (name || "").trim().toLowerCase();
  const imageMap = {
    emergency: "/emergancy.jpg",
    cardiology: "/Cardiology.jpg",
    neurology: "/Neurology.jpg",
    orthopedics: "/Orthopedics.jpg",
    dermatology: "/Dermatology.jpg",
    pediatrics: "/Pediatrics.jpg",
  };
  return imageMap[key] || "/mainbanner.jpg";
};

export default function Departments() {
  const [selectedDept, setSelectedDept] = useState(null);
  const [departmentsWithDoctors, setDepartmentsWithDoctors] = useState([]);
  const [queueStats, setQueueStats] = useState({});
  const [recommendedDoctor, setRecommendedDoctor] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const departments = useMemo(() => {
    return departmentsWithDoctors.map((dept, idx) => ({
      ...dept,
      title: dept.department_name,
      color: cardGradients[idx % cardGradients.length],
      image: getDepartmentImage(dept.department_name),
    }));
  }, [departmentsWithDoctors]);

  const activeDoctors = useMemo(() => {
    if (!selectedDept) return [];

    const doctors = selectedDept.doctors || [];
    return doctors
      .filter((doctor) => doctor.status === "available")
      .map((doctor) => ({
        id: doctor.doctor_id,
        name: doctor.doctor_name,
        specialization: doctor.specialization || "OPD Specialist",
        image: doctor.photo_url || "/doctors/default-doctor.jpg",
        description: doctor.qualifications || "Experienced OPD doctor",
      }));
  }, [selectedDept]);

  const fetchLegacyDepartments = async () => {
    const baseRes = await fetch(`${baseUrl}/api/departments`);
    if (!baseRes.ok) {
      throw new Error("Failed to load departments");
    }

    const baseDepartments = await baseRes.json();
    const departmentsData = await Promise.all(
      baseDepartments.map(async (dept) => {
        const departmentName = dept.department_name || dept.name || "Unknown";
        let doctors = [];

        try {
          const doctorsRes = await fetch(`${baseUrl}/api/departments/${dept.department_id}/doctors`);
          if (doctorsRes.ok) {
            doctors = await doctorsRes.json();
          }
        } catch (err) {
          console.error("fallback doctor fetch failed", err);
        }

        return {
          department_id: dept.department_id,
          department_name: departmentName,
          description: dept.description || "",
          doctors,
        };
      })
    );

    return departmentsData;
  };

  const fetchLiveDepartments = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/departments/live`);
      if (!res.ok) {
        throw new Error("Live endpoint unavailable");
      }

      const data = await res.json();
      setDepartmentsWithDoctors(Array.isArray(data) ? data : []);
      setError("");

      if (selectedDept) {
        const updated = data.find((dept) => dept.department_id === selectedDept.department_id);
        if (updated) {
          setSelectedDept(updated);
        }
      }
    } catch (err) {
      try {
        const fallbackDepartments = await fetchLegacyDepartments();
        setDepartmentsWithDoctors(fallbackDepartments);
        setError("");

        if (selectedDept) {
          const updated = fallbackDepartments.find((dept) => dept.department_id === selectedDept.department_id);
          if (updated) {
            setSelectedDept(updated);
          }
        }
      } catch (fallbackErr) {
        console.error("Fallback department load failed", fallbackErr);
        setDepartmentsWithDoctors([]);
        setError("Could not load departments. Please restart the backend server.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedDoctor = async (deptName) => {
    if (!deptName) {
      setRecommendedDoctor("");
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/opd/recommended-doctor?departmentName=${encodeURIComponent(deptName)}`);
      if (res.ok) {
        const body = await res.json();
        setRecommendedDoctor(body.recommendedDoctor || "");
      } else {
        setRecommendedDoctor("");
      }
    } catch (err) {
      console.error("fetchRecommendedDoctor failed", err);
      setRecommendedDoctor("");
    }
  };

  const refreshQueueCounts = async (deptName, doctorList) => {
    if (!deptName || !doctorList.length) {
      setQueueStats({});
      return;
    }

    const entries = await Promise.all(
      doctorList.map(async (doctor) => {
        const name = doctor.name;

        try {
          const res = await fetch(`${baseUrl}/api/opd/queue-count?doctorName=${encodeURIComponent(name)}&departmentName=${encodeURIComponent(deptName)}`);

          if (res.ok) {
            const body = await res.json();
            return [
              name,
              {
                count: Number(body.count || 0),
                estimatedWaitMinutes: Number(body.estimatedWaitMinutes || 0),
              },
            ];
          }
        } catch (err) {
          console.error("queue-count fetch failed", err);
        }

        return [name, { count: 0, estimatedWaitMinutes: 0 }];
      })
    );

    setQueueStats(Object.fromEntries(entries));
  };

  useEffect(() => {
    fetchLiveDepartments();
    const intervalId = setInterval(fetchLiveDepartments, 10000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedDept) {
      setQueueStats({});
      setRecommendedDoctor("");
      return;
    }

    fetchRecommendedDoctor(selectedDept.department_name);
    refreshQueueCounts(selectedDept.department_name, activeDoctors);

    const intervalId = setInterval(() => {
      fetchRecommendedDoctor(selectedDept.department_name);
      refreshQueueCounts(selectedDept.department_name, activeDoctors);
    }, 15000);

    return () => clearInterval(intervalId);
  }, [selectedDept, activeDoctors]);

  const renderDoctorCard = (doctor) => {
    const queueInfo = queueStats[doctor.name] || { count: 0, estimatedWaitMinutes: 0 };

    return (
      <div
        key={doctor.id || doctor.name}
        className={`overflow-hidden transition-all duration-300 border-2 shadow-lg rounded-xl group ${
          doctor.name === recommendedDoctor
            ? "border-green-500 bg-gradient-to-br from-green-50 to-green-100"
            : "bg-gradient-to-br from-slate-50 to-slate-100 border-slate-300 hover:border-cyan-500"
        }`}
      >
        <div className="p-6 text-white bg-gradient-to-r from-cyan-500 to-blue-600">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <img
              src={doctor.image}
              alt={doctor.name}
              className="object-cover w-full h-full border-4 border-white rounded-full shadow-lg"
              onError={(e) => {
                e.target.src = "/doctors/default-doctor.jpg";
              }}
            />
          </div>

          <h3 className="text-xl font-bold text-center">{doctor.name}</h3>
          <p className="mt-1 text-sm text-center text-cyan-100">{doctor.specialization}</p>

          {doctor.name === recommendedDoctor ? (
            <span className="inline-block px-3 py-1 mt-3 text-xs font-semibold text-white bg-green-500 rounded-full">
              Recommended
            </span>
          ) : null}
        </div>

        <div className="p-6">
          <p className="mb-2 text-sm text-slate-700">{doctor.description}</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-white rounded-lg">
              <p className="text-slate-500">Current Queue</p>
              <p className="font-semibold text-slate-900">{queueInfo.count}</p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <p className="text-slate-500">Estimated Wait</p>
              <p className="font-semibold text-slate-900">{queueInfo.estimatedWaitMinutes} mins</p>
            </div>
          </div>

          <div className="p-3 mt-3 text-sm rounded-lg bg-emerald-50">
            <p className="text-slate-500">Availability</p>
            <p className="font-semibold text-emerald-700">Present</p>
          </div>

          <Link
            to="/book-token"
            state={{ selectedDept: selectedDept?.department_name, selectedDoctor: doctor.name }}
            className="inline-block px-4 py-2 mt-4 font-semibold text-white transition rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
          >
            Book Token
          </Link>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-12 bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading live departments...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50 px-4 py-10 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-4xl font-bold text-transparent md:text-5xl bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text">
            Departments & Doctors
          </h1>
          <p className="text-lg text-slate-600">Live hospital availability from admin panel</p>
          {error ? <p className="mt-3 text-sm text-amber-600">{error}</p> : null}
        </div>

        {!selectedDept ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept) => (
              <button
                key={dept.department_id}
                onClick={() => setSelectedDept(dept)}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl"
              >
                <div className={`h-2 bg-gradient-to-r ${dept.color}`}></div>

                <div className="p-5 sm:p-6">
                  <div className="relative mb-4 h-32 overflow-hidden rounded-xl">
                    <img
                      src={dept.image}
                      alt={dept.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/25 to-transparent"></div>
                  </div>

                  <h2 className="text-xl font-bold text-slate-900">{dept.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {dept.description || "No description available"}
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center sm:gap-3">
                    <div className="flex min-h-[92px] flex-col items-center justify-center rounded-2xl bg-slate-50 px-2 py-3 sm:px-3">
                      <p className="text-[13px] font-medium text-slate-600 whitespace-nowrap">Total</p>
                      <p className="mt-1 text-xl font-bold leading-none text-slate-900">{dept.total_doctors}</p>
                    </div>
                    <div className="flex min-h-[92px] flex-col items-center justify-center rounded-2xl bg-emerald-50 px-2 py-3 sm:px-3">
                      <p className="text-[13px] font-medium text-slate-600 whitespace-nowrap">Present</p>
                      <p className="mt-1 text-xl font-bold leading-none text-emerald-700">{dept.available_doctors}</p>
                    </div>
                    <div className="flex min-h-[92px] flex-col items-center justify-center rounded-2xl bg-rose-50 px-2 py-3 sm:px-3">
                      <p className="text-[13px] font-medium text-slate-600 whitespace-nowrap">Leave</p>
                      <p className="mt-1 text-xl font-bold leading-none text-rose-700">{dept.unavailable_doctors}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm font-semibold text-cyan-700">
                    <span>Open Department</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <button
              onClick={() => setSelectedDept(null)}
              className="px-4 py-2 mb-6 font-semibold text-white rounded-lg bg-slate-800"
            >
              Back to Departments
            </button>

            <div className="p-6 mb-6 bg-white border shadow-sm rounded-2xl border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">{selectedDept.department_name} Department</h2>
              <p className="mt-1 text-slate-600">
                Recommended doctor: <span className="font-semibold">{recommendedDoctor || "N/A"}</span>
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Present doctors: {selectedDept.available_doctors} / {selectedDept.total_doctors}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {activeDoctors.map((doctor) => renderDoctorCard(doctor))}
            </div>

            {!activeDoctors.length ? (
              <div className="p-6 mt-4 bg-white border shadow-sm rounded-xl border-slate-200">
                <p className="text-slate-600">No doctors are present in this department right now.</p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
