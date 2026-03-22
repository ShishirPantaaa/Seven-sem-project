import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { departments, doctorsByDept } from "../data/departmentsData";

export default function Departments() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [queueStats, setQueueStats] = useState({});
  const [recommendedDoctor, setRecommendedDoctor] = useState("");

  const baseUrl = "http://localhost:5000";

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
        const name = doctor.doctor_name || doctor.name;

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
    if (!selectedDept) {
      setDoctors([]);
      setRecommendedDoctor("");
      setQueueStats({});
      return;
    }

    const deptName = selectedDept.title;
    setDoctors(doctorsByDept[deptName] || []);
    fetchRecommendedDoctor(deptName);
  }, [selectedDept]);

  useEffect(() => {
    if (!selectedDept) return;

    const name = selectedDept.title;
    const sync = async () => {
      await fetchRecommendedDoctor(name);
    };

    sync();
    const id = setInterval(sync, 15000);
    return () => clearInterval(id);
  }, [selectedDept]);

  useEffect(() => {
    if (!selectedDept || !doctors.length) {
      setQueueStats({});
      return;
    }

    const name = selectedDept.title;
    const sync = async () => {
      await refreshQueueCounts(name, doctors);
    };

    sync();
    const id = setInterval(sync, 15000);
    return () => clearInterval(id);
  }, [selectedDept, doctors]);

  const renderDoctorCard = (doctor) => {
    const name = doctor.name || doctor.doctor_name;
    const queueInfo = queueStats[name] || { count: 0, estimatedWaitMinutes: 0 };
    const queue = queueInfo.count;
    const estimatedWait = queueInfo.estimatedWaitMinutes;

    return (
      <div
        key={doctor.id || name}
        className={`overflow-hidden transition-all duration-300 border-2 shadow-lg rounded-xl group ${
          name === recommendedDoctor
            ? "border-green-500 bg-gradient-to-br from-green-50 to-green-100"
            : "bg-gradient-to-br from-slate-50 to-slate-100 border-slate-300 hover:border-cyan-500"
        }`}
      >
        <div className="p-6 text-white bg-gradient-to-r from-cyan-500 to-blue-600">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <img
              src={doctor.image || "/doctors/default-doctor.jpg"}
              alt={name}
              className="object-cover w-full h-full border-4 border-white rounded-full shadow-lg"
            />
          </div>

          <h3 className="text-xl font-bold text-center">{name}</h3>
          <p className="mt-1 text-sm text-center text-cyan-100">{doctor.specialization || "OPD Specialist"}</p>

          {name === recommendedDoctor ? (
            <span className="inline-block px-3 py-1 mt-3 text-xs font-semibold text-white bg-green-500 rounded-full">
              Recommended
            </span>
          ) : null}
        </div>

        <div className="p-6">
          <p className="mb-2 text-sm text-slate-700">{doctor.description || "Experienced OPD doctor"}</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-white rounded-lg">
              <p className="text-slate-500">Experience</p>
              <p className="font-semibold text-slate-900">{doctor.experience || "N/A"}</p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <p className="text-slate-500">Rating</p>
              <p className="font-semibold text-slate-900">
                {doctor.rating ? `${doctor.rating} (${doctor.reviews || 0})` : "N/A"}
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <p className="text-slate-500">Current Queue</p>
              <p className="font-semibold text-slate-900">{queue}</p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <p className="text-slate-500">Estimated Wait</p>
              <p className="font-semibold text-slate-900">{estimatedWait} mins</p>
            </div>
          </div>

          <div className="p-3 mt-3 text-sm rounded-lg bg-cyan-50">
            <p className="text-slate-500">Availability</p>
            <p className="font-semibold text-slate-900">{doctor.availability || "Check at reception"}</p>
          </div>

          <Link
            to="/book-token"
            state={{ selectedDept: selectedDept?.title, selectedDoctor: name }}
            className="inline-block px-4 py-2 mt-4 font-semibold text-white transition rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
          >
            Book Token
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-4xl font-bold text-transparent md:text-5xl bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text">
            Departments & Doctors
          </h1>
          <p className="text-lg text-slate-600">Select a department and choose your doctor</p>
        </div>

        {!selectedDept ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept) => {
              return (
                <button
                  key={dept.title}
                  onClick={() => setSelectedDept(dept)}
                  className="relative overflow-hidden text-left transition-all duration-300 bg-white border shadow-lg group rounded-2xl hover:shadow-2xl hover:-translate-y-2 border-slate-200 hover:border-cyan-300"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${dept.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  ></div>

                  <div className="relative z-10 p-6">
                    <div className="relative h-40 mb-6 overflow-hidden rounded-xl">
                      <img
                        src={dept.image}
                        alt={dept.title}
                        className="object-cover w-full h-full transition duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/400x160?text=${dept.title}`;
                        }}
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${dept.color} opacity-30`}></div>
                    </div>

                    <h2 className="mb-2 text-2xl font-bold text-slate-900">{dept.title}</h2>
                    <p className="mb-4 text-sm text-slate-600">{dept.description}</p>
                    <div className="flex items-center gap-2 font-semibold transition-transform text-cyan-600 group-hover:translate-x-2">
                      View Doctors →
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div>
            <button
              onClick={() => setSelectedDept(null)}
              className="px-4 py-2 mb-6 font-semibold text-white rounded-lg bg-slate-800"
            >
              Back to Departments
            </button>

            <div className="p-6 mb-6 bg-white border shadow-sm rounded-xl border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">{selectedDept.title} Department</h2>
              <p className="mt-1 text-slate-600">
                Recommended doctor: <span className="font-semibold">{recommendedDoctor || "N/A"}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{doctors.map((doctor) => renderDoctorCard(doctor))}</div>

            {!doctors.length ? (
              <div className="p-6 mt-4 bg-white border shadow-sm rounded-xl border-slate-200">
                <p className="text-slate-600">No doctors available for this department right now.</p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}