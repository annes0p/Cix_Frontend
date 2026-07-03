import { Bell, Building2, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function Navbar({ currentCompany, onChangeCompany }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const companies = ["CIXOIL S.A.C."];

    return (
        <header className="bg-white h-16 border-b border-gray-100 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-3">
                <h1 className="text-xl font-black text-cixoil-red tracking-tight">
                    Dashboard
                </h1>
                <span className="text-gray-300">|</span>
                <p className="text-xs font-medium text-gray-500 hidden sm:block">
                    Resumen general de la gestion de CIXOIL
                </p>
            </div>

            <div className="flex items-center gap-4 relative">
                <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-cixoil-red text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        3
                    </span>
                </button>

                <div className="relative">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <Building2 size={16} className="text-cixoil-red" />
                        <span className="hidden sm:block">
                            {currentCompany}
                        </span>
                        <ChevronDown size={14} className="text-gray-400" />
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-xl py-1 z-50 text-xs font-semibold text-gray-700">
                            {companies.map((co, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        onChangeCompany(co);
                                        setDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors ${
                                        currentCompany === co
                                            ? "text-cixoil-red bg-red-50/40 font-bold"
                                            : ""
                                    }`}
                                >
                                    {co}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
