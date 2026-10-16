import React, { useState, useEffect } from 'react';
import {
  RefreshCw, Cpu, Monitor, Zap, FileText, ShieldCheck, HardHat,
  Lock, Check, Home, Award, BookOpen, BarChart2, User
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
  const [activeTab, setActiveTab] = useState('passport');
  const [loading, setLoading] = useState(false);

  // Fetch Data จาก Backend API Proxy
  const fetchPassportData = async (targetEmp) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/passport?empNo=${targetEmp}`);
      const data = await res.json();
      if (res.ok) {
        setUserData(data);
        setPassedStations(data.passedStations || []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassportData(empNo);
  }, [empNo]);

  // Trainer บันทึกผลประเมิน
  const handleToggleStation = async (stationName) => {
    const isPassed = passedStations.includes(stationName);
    if (isPassed) return; // ใน Sheet จริงจะเน้นบันทึกเพิ่ม Log PASS

    setLoading(true);
    try {
      await fetch('/api/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empNo: empNo,
          station: stationName,
          result: 'PASS',
          confirmBy: 'TRAINER-ADMIN'
        })
      });
      await fetchPassportData(empNo);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setLoading(false);
    }
  };

  const progressPercent = Math.round((passedStations.length / STATIONS_DATA.length) * 100);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f4f8fd] relative font-sans">

      {/* Top Switcher */}
      <div className="bg-slate-900 text-white px-4 py-1.5 flex justify-between items-center text-[10px] font-bold">
        <span>LDNA DOJO e-PASSPORT</span>
        <select
          className="bg-slate-800 text-amber-400 border border-slate-700 rounded px-1.5 py-0.5 text-[10px]"
          value={empNo}
          onChange={(e) => setEmpNo(e.target.value)}
        >
          <option value="OPT-1001">OPT-1001 - SARAH CHEN</option>
          <option value="OPT-1002">OPT-1002 - SUTTICHAI K.</option>
        </select>
      </div>

      <div className="text-center pt-3 pb-1">
        <h1 className="text-base font-extrabold text-[#0f2851] tracking-wider uppercase">LDNA DOJO e-PASSPORT</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-20">

        {/* User Card */}
        <div className="bg-white rounded-2xl p-3 shadow-md border border-slate-100 flex items-center space-x-3 mb-3">
          <div className="relative">
            <img src={userData?.pic || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200"} className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 p-0.5" />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 text-[9px] font-extrabold px-2 py-0.2 rounded-full uppercase shadow">
              GOLD
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-base font-extrabold text-[#0f2851] leading-tight">{userData?.name || "Loading..."}</h2>
            <p className="text-[11px] text-slate-500 font-medium">{userData?.role || "Operator"}</p>
            <p className="text-[11px] text-slate-600 font-semibold mt-0.5">ID: {empNo}</p>
          </div>
        </div>

        {/* Passport Board */}
        <div className="bg-white rounded-3xl p-3 shadow-md border border-slate-100 relative">
          <div className="flex items-center justify-center space-x-2 my-1">
            <div className="h-[2px] w-6 bg-blue-300"></div>
            <h3 className="text-sm font-extrabold text-[#0f2851] tracking-wider uppercase">TRAINING PASSPORT</h3>
            <div className="h-[2px] w-6 bg-blue-300"></div>
          </div>

          {activeTab === 'passport' ? (
            <div>
              <div className="relative min-h-[340px] w-full mt-2">
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M 18,18 L 50,18 L 82,18 L 82,32 Q 82,44 66,44 L 34,44 L 18,44 Q 18,60 18,76 L 34,76 L 66,76"
                        fill="none" stroke="#cbd5e1" strokeWidth="1.2" className="dotted-path" />
                </svg>

                <div className="relative z-10 grid grid-cols-3 gap-y-6 text-center pt-2">
                  {STATIONS_DATA.slice(0, 3).map(st => <BadgeItem key={st.id} st={st} isPassed={passedStations.some(p => p.includes(st.name.split('. ')[1]))} />)}
                </div>
                <div className="relative z-10 grid grid-cols-2 gap-y-6 text-center mt-6 px-6">
                  {STATIONS_DATA.slice(3, 5).map(st => <BadgeItem key={st.id} st={st} isPassed={passedStations.some(p => p.includes(st.name.split('. ')[1]))} />)}
                </div>
                <div className="relative z-10 grid grid-cols-2 gap-y-6 text-center mt-6 px-6">
                  {STATIONS_DATA.slice(5, 7).map(st => <BadgeItem key={st.id} st={st} isPassed={passedStations.some(p => p.includes(st.name.split('. ')[1]))} />)}
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                  <span className="text-slate-700">{passedStations.length}/{STATIONS_DATA.length} Badges</span>
                  <span className="text-blue-600">{progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
                  <div className="bg-gradient-to-r from-blue-600 to-amber-400 h-full transition-all duration-500 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-2 space-y-2">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 text-[11px] text-blue-900 mb-3">
                🛠️ <strong>มุมมองผู้คุมฐาน:</strong> กดบันทึกเพื่อยิงข้อมูลเข้า Google Sheet จริง
              </div>
              {STATIONS_DATA.map(st => {
                const rawName = st.name.split('. ')[1];
                const isPassed = passedStations.some(p => p.includes(rawName));
                return (
                  <div key={st.id} className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-800">{st.name}</span>
                    <button
                      disabled={loading || isPassed}
                      onClick={() => handleToggleStation(rawName)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        isPassed ? "bg-green-500 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {isPassed ? "✓ ผ่านแล้ว" : "+ ประเมินผ่าน"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="bg-white border-t border-slate-200 px-4 py-2 flex justify-between items-center absolute bottom-0 left-0 right-0 z-20 shadow-lg">
        <button className="flex flex-col items-center text-[10px] font-semibold text-slate-400"><Home className="w-5 h-5 mb-0.5" />Home</button>
        <button onClick={() => setActiveTab('passport')} className={`flex flex-col items-center text-[10px] font-bold ${activeTab === 'passport' ? "text-blue-700" : "text-slate-400"}`}><Award className="w-5 h-5 mb-0.5" />Passport</button>
        <button onClick={() => setActiveTab('trainer')} className={`flex flex-col items-center text-[10px] font-bold ${activeTab === 'trainer' ? "text-blue-700" : "text-slate-400"}`}><BookOpen className="w-5 h-5 mb-0.5" />Trainer</button>
        <button className="flex flex-col items-center text-[10px] font-semibold text-slate-400"><BarChart2 className="w-5 h-5 mb-0.5" />Rank</button>
        <button className="flex flex-col items-center text-[10px] font-semibold text-slate-400"><User className="w-5 h-5 mb-0.5" />Profile</button>
      </div>

    </div>
  );
}

function BadgeItem({ st, isPassed }) {
  const IconComponent = st.icon;
  return (
    <div className="flex flex-col items-center relative">
      <div className={`absolute -top-2.5 text-[8px] font-extrabold px-1.5 py-0.2 rounded-full border shadow-sm z-20 ${
        isPassed ? 'bg-amber-400 text-amber-950 border-amber-300' : 'bg-slate-200 text-slate-500 border-slate-300'
      }`}>
        +{st.pts} PTS
      </div>
      <div className="relative my-1">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
          isPassed ? 'bg-gradient-to-b from-blue-500 to-blue-700 text-white border-2 border-amber-400 ring-2 ring-blue-200' : 'bg-slate-200 text-slate-400 border-2 border-slate-300'
        }`}>
          {isPassed ? <IconComponent className="w-6 h-6" /> : <Lock className="w-6 h-6 text-slate-400" />}
        </div>
        {isPassed && (
          <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 text-white rounded-full p-0.5 border border-white shadow">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
        )}
      </div>
      <span className={`text-[10px] font-bold leading-tight max-w-[85px] mt-0.5 ${isPassed ? 'text-slate-900' : 'text-slate-400'}`}>
        {st.name}
      </span>
    </div>
  );
}
