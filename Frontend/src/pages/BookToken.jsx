import PatientForm from "../components/Form.jsx";
import { useLocation } from "react-router-dom";

export default function BookToken() {
  const location = useLocation();
  const preSelectedData = location.state || {};

  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-4xl font-bold text-transparent md:text-5xl bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text">
            Book Your OPD Token
          </h1>
          <p className="text-lg text-slate-600">Quick and easy appointment booking</p>
        </div>
        <PatientForm preSelectedDept={preSelectedData.selectedDept} preSelectedDoctor={preSelectedData.selectedDoctor} />
      </div>
    </div>
  );
}
