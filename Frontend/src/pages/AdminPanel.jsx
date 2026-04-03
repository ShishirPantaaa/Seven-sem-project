import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function AdminPanel() {
  const navigate = useNavigate();
  const { admin, adminToken, adminLogout } = useAdminAuth();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentsWithDoctors, setDepartmentsWithDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all"); // Default to "all"
  const [selectedDepartmentInTab, setSelectedDepartmentInTab] = useState("");
  const [activeTab, setActiveTab] = useState("list"); // list, add, department, edit
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({
    doctorName: "",
    departmentId: "",
    specialization: "",
    qualifications: "",
    photoUrl: "",
    contactNo: "",
    status: "available",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!admin || !adminToken) {
      navigate("/admin-login");
    }
  }, [admin, adminToken, navigate]);

  // Fetch doctors and departments
  useEffect(() => {
    if (!adminToken) return;
    fetchData();
  }, [adminToken]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [doctorsRes, deptRes, groupedRes] = await Promise.all([
        fetch("http://localhost:5000/api/admin/doctors", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        fetch("http://localhost:5000/api/admin/departments", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        fetch("http://localhost:5000/api/admin/departments-with-doctors", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
      ]);

      if (!doctorsRes.ok || !deptRes.ok || !groupedRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const doctorsData = await doctorsRes.json();
      const departmentsData = await deptRes.json();
      const groupedData = await groupedRes.json();

      setDoctors(doctorsData);
      setDepartments(departmentsData);
      setDepartmentsWithDoctors(groupedData);
      setError("");
    } catch (err) {
      setError("Failed to load data: " + err.message);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.doctorName || !formData.departmentId || !formData.specialization || !formData.photoUrl || !formData.contactNo) {
      setError("Please fill required fields: name, department, specialization, photo URL, contact number");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/admin/doctors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to add doctor");
        return;
      }

      setSuccess("Doctor added successfully!");
      setFormData({
        doctorName: "",
        departmentId: "",
        specialization: "",
        qualifications: "",
        photoUrl: "",
        contactNo: "",
        status: "available",
      });
      setActiveTab("list");
      fetchData();
    } catch (err) {
      setError("Error adding doctor: " + err.message);
    }
  };

  const handleEditDoctor = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      doctorName: doctor.doctor_name || "",
      departmentId: doctor.department_id || "",
      specialization: doctor.specialization || "",
      qualifications: doctor.qualifications || "",
      photoUrl: doctor.photo_url || "",
      contactNo: doctor.contact_no || "",
      status: doctor.status || "available",
    });
    setActiveTab("edit");
  };

  const handleUpdateDoctor = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.doctorName || !formData.departmentId || !formData.specialization || !formData.photoUrl || !formData.contactNo) {
      setError("Please fill required fields: name, department, specialization, photo URL, contact number");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/doctors/${editingDoctor.doctor_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update doctor");
        return;
      }

      setSuccess("Doctor updated successfully!");
      setFormData({
        doctorName: "",
        departmentId: "",
        specialization: "",
        qualifications: "",
        photoUrl: "",
        contactNo: "",
        status: "available",
      });
      setEditingDoctor(null);
      setActiveTab("list");
      fetchData();
    } catch (err) {
      setError("Error updating doctor: " + err.message);
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/admin/doctors/${doctorId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (!response.ok) {
        throw new Error("Failed to delete doctor");
      }

      setSuccess("Doctor deleted successfully!");
      fetchData();
    } catch (err) {
      setError("Error deleting doctor: " + err.message);
    }
  };

  const handleStatusToggle = async (doctor) => {
    setError("");
    setSuccess("");

    const nextStatus = doctor.status === "available" ? "unavailable" : "available";

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/doctors/${doctor.doctor_id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ status: nextStatus }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Failed to update status");
        return;
      }

      setSuccess("Doctor status updated successfully!");
      fetchData();
    } catch (err) {
      setError("Error updating status: " + err.message);
    }
  };

  const getDepartmentName = (deptId) => {
    const department = departments.find((d) => d.department_id === deptId);
    return department?.department_name || department?.name || "Unknown";
  };

  const uniqueDepartments = useMemo(() => {
    const map = new Map();
    departments.forEach((dept) => {
      const name = (dept.department_name || dept.name || "").trim();
      if (!name) return;
      const key = name.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          department_id: dept.department_id,
          department_name: name,
          description: dept.description || "",
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.department_name.localeCompare(b.department_name));
  }, [departments]);

  const uniqueDepartmentGroups = useMemo(() => {
    const map = new Map();

    departmentsWithDoctors.forEach((group) => {
      const name = (group.department_name || "").trim();
      if (!name) return;
      const key = name.toLowerCase();

      if (!map.has(key)) {
        map.set(key, {
          department_id: group.department_id,
          department_name: name,
          description: group.description || "",
          doctors: [],
        });
      }

      const current = map.get(key);
      if (!current.description && group.description) {
        current.description = group.description;
      }

      (group.doctors || []).forEach((doctor) => {
        if (!current.doctors.some((d) => d.doctor_id === doctor.doctor_id)) {
          current.doctors.push(doctor);
        }
      });
    });

    return Array.from(map.values()).sort((a, b) => a.department_name.localeCompare(b.department_name));
  }, [departmentsWithDoctors]);

  useEffect(() => {
    if (!selectedDepartmentInTab && uniqueDepartmentGroups.length > 0) {
      setSelectedDepartmentInTab(uniqueDepartmentGroups[0].department_name);
    }
  }, [uniqueDepartmentGroups, selectedDepartmentInTab]);

  const activeDepartmentGroup =
    uniqueDepartmentGroups.find((group) => group.department_name === selectedDepartmentInTab) || null;

  const filteredDoctors =
    selectedDepartment === "all"
      ? doctors
      : doctors.filter((doctor) => getDepartmentName(doctor.department_id) === selectedDepartment);

  const handleLogout = () => {
    adminLogout();
    navigate("/");
  };

  if (loading && doctors.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text">
              Admin Panel
            </h1>
            <p className="text-slate-400 mt-2">Welcome, {admin?.name || "Admin"}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300"
          >
            Logout
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-900/30 border border-green-700 rounded-lg text-green-300">
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b border-slate-700">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 font-semibold transition-all duration-300 ${
              activeTab === "list"
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            Doctor List
          </button>
          <button
            onClick={() => {
              setActiveTab("add");
              setFormData({
                doctorName: "",
                departmentId: "",
                specialization: "",
                qualifications: "",
                photoUrl: "",
                contactNo: "",
                status: "available",
              });
            }}
            className={`px-4 py-2 font-semibold transition-all duration-300 ${
              activeTab === "add"
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            Add Doctor
          </button>
          <button
            onClick={() => setActiveTab("department")}
            className={`px-4 py-2 font-semibold transition-all duration-300 ${
              activeTab === "department"
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            By Department
          </button>
        </div>

        {/* Content */}
        {activeTab === "list" && (
          <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <p className="text-slate-300 text-sm">
                Showing <span className="font-semibold text-cyan-300">{filteredDoctors.length}</span> doctor(s)
              </p>
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-300">Filter by Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Departments</option>
                  {uniqueDepartments.map((dept) => (
                    <option key={dept.department_id} value={dept.department_name}>
                      {dept.department_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">
                      Doctor Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">
                      Department
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">
                      Specialization
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-200">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredDoctors.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                        No doctors found for selected department.
                      </td>
                    </tr>
                  ) : (
                    filteredDoctors.map((doctor) => (
                      <tr
                        key={doctor.doctor_id}
                        className="hover:bg-slate-700/50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 text-slate-200">{doctor.doctor_name}</td>
                        <td className="px-6 py-4 text-slate-300">
                          {getDepartmentName(doctor.department_id)}
                        </td>
                        <td className="px-6 py-4 text-slate-300">{doctor.specialization || "-"}</td>
                        <td className="px-6 py-4 text-slate-300">{doctor.contact_no || "-"}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              doctor.status === "available"
                                ? "bg-green-900/30 text-green-300 border border-green-700"
                                : "bg-red-900/30 text-red-300 border border-red-700"
                            }`}
                          >
                            {doctor.status === "available" ? "Present" : "On Leave"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleStatusToggle(doctor)}
                            className={`mr-3 px-3 py-1 text-white text-sm rounded transition-colors duration-200 ${
                              doctor.status === "available"
                                ? "bg-amber-600 hover:bg-amber-700"
                                : "bg-emerald-600 hover:bg-emerald-700"
                            }`}
                          >
                            {doctor.status === "available" ? "Mark On Leave" : "Mark Present"}
                          </button>
                          <button
                            onClick={() => handleEditDoctor(doctor)}
                            className="mr-3 px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded transition-colors duration-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteDoctor(doctor.doctor_id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors duration-200"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "add" && (
          <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-6">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6">Add New Doctor</h2>
            <form onSubmit={handleAddDoctor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Doctor Name *
                </label>
                <input
                  type="text"
                  value={formData.doctorName}
                  onChange={(e) =>
                    setFormData({ ...formData, doctorName: e.target.value })
                  }
                  placeholder="Enter doctor name"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Department *
                </label>
                <select
                  value={formData.departmentId}
                  onChange={(e) =>
                    setFormData({ ...formData, departmentId: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  required
                >
                  <option value="">Select department</option>
                  {uniqueDepartments.map((dept) => (
                    <option key={dept.department_id} value={dept.department_id}>
                      {dept.department_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Specialization *
                </label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="e.g. Cardiology"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Qualifications
                </label>
                <input
                  type="text"
                  value={formData.qualifications}
                  onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                  placeholder="e.g. MBBS, MD"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  PP Size Photo URL *
                </label>
                <input
                  type="url"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Contact Number *
                </label>
                <input
                  type="text"
                  value={formData.contactNo}
                  onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
                  placeholder="98XXXXXXXX"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="available">Present</option>
                  <option value="unavailable">On Leave</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300"
                >
                  Add Doctor
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("list")}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "department" && (
          <div className="space-y-4">
            {uniqueDepartmentGroups.length === 0 ? (
              <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-6 text-slate-300">
                No department data found.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {uniqueDepartmentGroups.map((department) => (
                    <button
                      key={department.department_name}
                      onClick={() => setSelectedDepartmentInTab(department.department_name)}
                      className={`text-left p-4 rounded-lg border transition ${
                        selectedDepartmentInTab === department.department_name
                          ? "bg-cyan-900/20 border-cyan-500"
                          : "bg-slate-800 border-slate-700 hover:border-slate-500"
                      }`}
                    >
                      <h3 className="text-cyan-300 font-semibold">{department.department_name}</h3>
                      <p className="text-slate-400 text-sm mt-1">{department.doctors.length} doctor(s)</p>
                    </button>
                  ))}
                </div>

                {activeDepartmentGroup && (
                  <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden">
                    <div className="px-6 py-4 bg-slate-700/50 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-cyan-300">{activeDepartmentGroup.department_name}</h3>
                        <p className="text-sm text-slate-400">{activeDepartmentGroup.description || "No description"}</p>
                      </div>
                      <button
                        onClick={() => {
                          const target = uniqueDepartments.find((d) => d.department_name === activeDepartmentGroup.department_name);
                          if (!target) return;
                          setFormData({
                            doctorName: "",
                            departmentId: target.department_id,
                            specialization: "",
                            qualifications: "",
                            photoUrl: "",
                            contactNo: "",
                            status: "available",
                          });
                          setActiveTab("add");
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-sm font-semibold rounded-lg"
                      >
                        Add Doctor to Department
                      </button>
                    </div>

                    {activeDepartmentGroup.doctors.length === 0 ? (
                      <div className="px-6 py-4 text-slate-400">No doctors assigned to this department.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-700/30">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Doctor</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Specialization</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Contact</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Photo</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700">
                            {activeDepartmentGroup.doctors.map((doctor) => (
                              <tr key={doctor.doctor_id} className="hover:bg-slate-700/40">
                                <td className="px-6 py-3 text-slate-200">{doctor.doctor_name}</td>
                                <td className="px-6 py-3 text-slate-300">{doctor.specialization || "-"}</td>
                                <td className="px-6 py-3 text-slate-300">{doctor.contact_no || "-"}</td>
                                <td className="px-6 py-3">
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-semibold ${
                                      doctor.status === "available"
                                        ? "bg-green-900/30 text-green-300 border border-green-700"
                                        : "bg-red-900/30 text-red-300 border border-red-700"
                                    }`}
                                  >
                                    {doctor.status === "available" ? "Present" : "On Leave"}
                                  </span>
                                </td>
                                <td className="px-6 py-3 text-slate-300">
                                  {doctor.photo_url ? (
                                    <a className="text-cyan-300 hover:underline" href={doctor.photo_url} target="_blank" rel="noreferrer">
                                      View
                                    </a>
                                  ) : (
                                    "-"
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "edit" && editingDoctor && (
          <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-6">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6">
              Edit Doctor: {editingDoctor.doctor_name}
            </h2>
            <form onSubmit={handleUpdateDoctor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Doctor Name *
                </label>
                <input
                  type="text"
                  value={formData.doctorName}
                  onChange={(e) =>
                    setFormData({ ...formData, doctorName: e.target.value })
                  }
                  placeholder="Enter doctor name"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Department *
                </label>
                <select
                  value={formData.departmentId}
                  onChange={(e) =>
                    setFormData({ ...formData, departmentId: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  required
                >
                  <option value="">Select department</option>
                  {uniqueDepartments.map((dept) => (
                    <option key={dept.department_id} value={dept.department_id}>
                      {dept.department_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Specialization *
                </label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="e.g. Cardiology"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Qualifications
                </label>
                <input
                  type="text"
                  value={formData.qualifications}
                  onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                  placeholder="e.g. MBBS, MD"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  PP Size Photo URL *
                </label>
                <input
                  type="url"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Contact Number *
                </label>
                <input
                  type="text"
                  value={formData.contactNo}
                  onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
                  placeholder="98XXXXXXXX"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="available">Present</option>
                  <option value="unavailable">On Leave</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300"
                >
                  Update Doctor
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("list")}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
