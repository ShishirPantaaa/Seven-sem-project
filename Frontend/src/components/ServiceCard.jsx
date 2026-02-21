import { Link } from "react-router-dom";

const ServiceCard = ({ icon, title, description }) => {
  return (
    <div className="relative p-8 text-center transition duration-300 border shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl hover:shadow-2xl hover:-translate-y-2 group border-slate-200">
      {/* Accent bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-t-2xl"></div>

      {icon && (
        <div className="flex justify-center p-4 mx-auto mb-6 transition-all duration-300 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 w-fit group-hover:shadow-lg">
          <img src={icon} alt={title} className="w-16 h-16 transition-transform duration-300 group-hover:scale-110" />
        </div>
      )}

      <h3 className="mb-3 text-2xl font-bold text-transparent bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text">
        {title}
      </h3>

      <p className="mb-6 leading-relaxed text-slate-600">
        {description}
      </p>

      <Link to="/book-token" className="inline-block">
        <button className="px-6 py-3 font-semibold text-white transition-all duration-300 rounded-full shadow-md bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 hover:scale-105 hover:shadow-lg active:scale-95">
          Book An Appointment
        </button>
      </Link>
    </div>
  );
};

export default ServiceCard;
