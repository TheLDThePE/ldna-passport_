import React, { useState, useEffect } from 'react';
import {
  RefreshCw, Cpu, Monitor, Zap, FileText, ShieldCheck, HardHat,
  Lock, Check, Home, Award, BookOpen, BarChart2, User, AlertCircle
} from 'lucide-react';

const STATIONS_DATA = [
  { id: 1, name: "1. BLU (TBL)", pts: 50, icon: RefreshCw },
  { id: 2, name: "2. BLU (ABL)", pts: 50, icon: Cpu },
  { id: 3, name: "3. LCDM", pts: 50, icon: Monitor },
  { id: 4, name: "4. ESD / ELECTRIC PUCK", pts: 75, icon: Zap },
  { id: 5, name: "5. CLEAR INSTRUCTION (WI/QI)", pts: 50, icon: FileText },
  { id: 6, name: "6. COPQ & QUALITY", pts: 75, icon: ShieldCheck },
  { id: 7, name: "7. SAFETY MIND & 5S", pts: 100, icon: HardHat }
];

export default function App() {
  const [empNo, setEmpNo] = useState('OPT-1001');
  const [userData, setUserData] = useState(null);
  const [passedStations, setPassedStations] = useState([]);
  const [employeeList, setEmployeeList] = useState([]); // รายชื่อพนักงานแบบ Dynamic
  const [activeTab, setActiveTab] = useState('passport');
  const [loading, setLoading] = useState(false);
  const [savingStations, setSavingStations] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  // ดึงข้อมูลพนักงานและประวัติจาก Backend
  const fetchPassportData = async (targetEmp) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/passport?empNo=${targetEmp}`);
      const data = await res.json();
      if (res.ok) {
        setUserData(data);
        setPassedStations(data.passedStations || []);
        if (data.allEmployees && data.allEmployees.length > 0) {
          setEmployeeList(data.allEmployees); // อัปเดต Dropdown ด้วยรายชื่อจาก Google Sheet
        }
      } else {
        setErrorMessage("ไม่สามารถดึงข้อมูลได้");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setErrorMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassportData(empNo);
  }, [empNo]);

  // Optimistic UI Update
  const handleToggleStation = async (stationName) => {
    const isPassed = passedStations.some(p => p.includes(stationName));
    if (isPassed) return;

    const previousPassed = [...passedStations];
    setPassedStations(prev => [...prev, stationName]);
    setSavingStations(prev => [...prev, stationName]);

    try {
      const res = await fetch('/api/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empNo: empNo,
          station: stationName,
          result: 'PASS',
          confirmBy: 'TRAINER-ADMIN'
        })
      });

      if (!res.ok) {
        throw new Error("บันทึกข้อมูลไม่สำเร็จ");
      }
    } catch (err) {
      console.error("Save error:", err);
      setPassedStations(previousPassed);
      alert("⚠️ บันทึกลง Google Sheets ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSavingStations(prev => prev.filter(s => s !== stationName));
    }
  };

  const progressPercent = Math.round((passedStations.length / STATIONS_DATA.length) * 100);

  return (
    <div className="w-full h-dvh sm:h-[812px] max-w-md mx-auto bg-[#f4f8fd] sm:rounded-[36px] shadow-2xl flex flex-col justify-between overflow-hidden relative border-0 sm:border-[6px] border-slate-900 font-sans select-none">

      {/* Top Switcher Header (Dynamic Dropdown) */}
      <div className="bg-slate-900 text-white px-4 py-2 flex justify-between items-center text-xs font-bold shrink-0 z-20">
        <span className="tracking-wide">LDNA DOJO e-PASSPORT</span>
        <select
          className="bg-slate-800 text-amber-400 border border-slate-700 rounded-lg px-2 py-1 text-xs focus:outline-none max-w-[180px] truncate"
          value={empNo}
          onChange={(e) => setEmpNo(e.target.value)}
        >
          {employeeList.length > 0 ? (
            employeeList.map(emp => (
              <option key={emp.empNo} value={emp.empNo}>
                {emp.empNo} - {emp.name}
              </option>
            ))
          ) : (
            <>
              <option value="OPT-1001">OPT-1001 - SARAH CHEN</option>
              <option value="OPT-1002">OPT-1002 - SUTTICHAI K.</option>
            </>
          )}
        </select>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 pt-3 pb-20">

        <div className="text-center mb-2">
          <h1 className="text-base font-black text-[#0f2851] tracking-wider uppercase">LDNA DOJO e-PASSPORT</h1>
        </div>

        {/* User Card */}
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex items-center space-x-3 mb-3">
          <div className="relative shrink-0">
            <img src={userData?.pic || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200"} className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 p-0.5 shadow" />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 text-[9px] font-black px-2 py-0.2 rounded-full uppercase shadow-sm">
              GOLD
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-extrabold text-[#0f2851] leading-tight truncate">{loading ? "กำลังโหลด..." : (userData?.name || "ไม่พบชื่อ")}</h2>
            <p className="text-[11px] text-slate-500 font-medium truncate">{userData?.dept || "Operator"}</p>
            <p className="text-[11px] text-slate-700 font-bold mt-0.5">ID: {empNo}</p>
          </div>
        </div>

        {/* Passport / Trainer Board */}
        <div className="bg-white rounded-3xl p-3 shadow-sm border border-slate-100 relative">

          <div className="flex items-center justify-center space-x-2 my-1">
            <div className="h-[2px] w-6 bg-blue-200"></div>
            <h3 className="text-xs font-black text-[#0f2851] tracking-wider uppercase">
              {activeTab === 'passport' ? 'TRAINING PASSPORT' : 'TRAINER EVALUATION'}
            </h3>
            <div className="h-[2px] w-6 bg-blue-200"></div>
          </div>

          {activeTab === 'passport' ? (
            <div>
              <div className="relative min-h-[320px] w-full mt-2">
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M 18,18 L 50,18 L 82,18 L 82,32 Q 82,44 66,44 L 34,44 L 18,44 Q 18,60 18,76 L 34,76 L 66,76"
                        fill="none" stroke="#cbd5e1" strokeWidth="1.2" className="dotted-path" />
                </svg>

                <div className="relative z-10 grid grid-cols-3 gap-y-5 text-center pt-2">
                  {STATIONS_DATA.slice(0, 3).map(st => <BadgeItem key={st.id} st={st} isPassed={passedStations.some(p => p.includes(st.name.split('. ')[1]))} />)}
                </div>
                <div className="relative z-10 grid grid-cols-2 gap-y-5 text-center mt-5 px-6">
                  {STATIONS_DATA.slice(3, 5).map(st => <BadgeItem key={st.id} st={st} isPassed={passedStations.some(p => p.includes(st.name.split('. ')[1]))} />)}
                </div>
                <div className="relative z-10 grid grid-cols-2 gap-y-5 text-center mt-5 px-6">
                  {STATIONS_DATA.slice(5, 7).map(st => <BadgeItem key={st.id} st={st} isPassed={passedStations.some(p => p.includes(st.name.split('. ')[1]))} />)}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span className="text-slate-700">{passedStations.length}/{STATIONS_DATA.length} Badges</span>
                  <span className="text-blue-600 font-black">{progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
                  <div className="bg-gradient-to-r from-blue-600 to-amber-400 h-full transition-all duration-500 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>
            </div>
          ) : (
            /* Trainer View */
            <div className="py-2 space-y-2">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 text-[11px] text-blue-900 mb-2 font-medium">
                ⚡ <strong>ระบบประเมินด่วน:</strong> กดแล้วสถานะจะอัปเดตทันทีและบันทึกลง Google Sheets เบื้องหลัง
              </div>

              {STATIONS_DATA.map(st => {
                const rawName = st.name.split('. ')[1];
                const isPassed = passedStations.some(p => p.includes(rawName));
                const isSaving = savingStations.includes(rawName);

                return (
                  <div key={st.id} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-bold text-slate-800">{st.name}</span>
                    <button
                      disabled={isPassed}
                      onClick={() => handleToggleStation(rawName)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                        isPassed
                          ? "bg-emerald-500 text-white shadow-sm"
                          : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow"
                      }`}
                    >
                      {isPassed ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>ผ่านแล้ว</span>
                        </>
                      ) : (
                        <span>+ ประเมินผ่าน</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* Bottom Nav */}
      <div className="bg-white border-t border-slate-200 px-4 py-2 flex justify-between items-center shrink-0 z-30 shadow-lg pb-safe">
        <button className="flex flex-col items-center text-[10px] font-bold text-slate-400 hover:text-blue-600">
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </button>
        <button onClick={() => setActiveTab('passport')} className={`flex flex-col items-center text-[10px] font-bold transition-colors ${activeTab === 'passport' ? "text-blue-600" : "text-slate-400"}`}>
          <Award className="w-5 h-5 mb-0.5" />
          <span>Passport</span>
        </button>
        <button onClick={() => setActiveTab('trainer')} className={`flex flex-col items-center text-[10px] font-bold transition-colors ${activeTab === 'trainer' ? "text-blue-600" : "text-slate-400"}`}>
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span>Trainer</span>
        </button>
        <button className="flex flex-col items-center text-[10px] font-bold text-slate-400 hover:text-blue-600">
          <BarChart2 className="w-5 h-5 mb-0.5" />
          <span>Rank</span>
        </button>
        <button className="flex flex-col items-center text-[10px] font-bold text-slate-400 hover:text-blue-600">
          <User className="w-5 h-5 mb-0.5" />
          <span>Profile</span>
        </button>
      </div>

    </div>
  );
}

function BadgeItem({ st, isPassed }) {
  const IconComponent = st.icon;
  return (
    <div className="flex flex-col items-center relative">
      <div className={`absolute -top-2 text-[8px] font-black px-1.5 py-0.2 rounded-full border shadow-sm z-20 ${
        isPassed ? 'bg-amber-400 text-amber-950 border-amber-300' : 'bg-slate-200 text-slate-500 border-slate-300'
      }`}>
        +{st.pts} PTS
      </div>
      <div className="relative my-1">
        <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
          isPassed ? 'bg-gradient-to-b from-blue-500 to-blue-700 text-white border-2 border-amber-400 ring-2 ring-blue-200' : 'bg-slate-200 text-slate-400 border-2 border-slate-300'
        }`}>
          {isPassed ? <IconComponent className="w-6 h-6" /> : <Lock className="w-6 h-6 text-slate-400" />}
        </div>
        {isPassed && (
          <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 text-white rounded-full p-0.5 border border-white shadow">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        )}
      </div>
      <span className={`text-[10px] font-bold leading-tight max-w-[85px] mt-0.5 ${isPassed ? 'text-slate-900' : 'text-slate-400'}`}>
        {st.name}
      </span>
    </div>
  );
}
