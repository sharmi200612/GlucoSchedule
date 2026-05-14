// ============================================
// Page: Reports & Health History
// ============================================
import React, { useEffect, useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend
} from 'chart.js';
import API from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const ReportsPage = () => {
  const [glucose,    setGlucose]    = useState([]);
  const [exercises,  setExercises]  = useState([]);
  const [meals,      setMeals]      = useState([]);
  const [planner,    setPlanner]    = useState([]);
  const [medication, setMedication] = useState([]);

  useEffect(() => {
    API.get('/glucose').then(r   => setGlucose(r.data)).catch(() => {});
    API.get('/exercise').then(r  => setExercises(r.data)).catch(() => {});
    API.get('/meals').then(r     => setMeals(r.data)).catch(() => {});
    API.get('/planner').then(r   => setPlanner(r.data)).catch(() => {});
    API.get('/medication').then(r => setMedication(r.data)).catch(() => {});
  }, []);

  // ── Glucose stats ─────────────────────────
  const last14        = [...glucose].reverse().slice(-14);
  const avgGlucose    = glucose.length ? Math.round(glucose.reduce((a,r)=>a+r.level,0)/glucose.length) : 0;
  const lowCount      = glucose.filter(r=>r.level<70).length;
  const highCount     = glucose.filter(r=>r.level>180).length;
  const normalCount   = glucose.filter(r=>r.level>=70&&r.level<=180).length;
  const inRangePct    = glucose.length ? Math.round((normalCount/glucose.length)*100) : 0;

  // ── Exercise stats ────────────────────────
  const completedEx   = exercises.filter(e=>e.completed);
  const totalMins     = completedEx.reduce((a,e)=>a+(e.durationMinutes||0),0);

  // ── Meal stats ────────────────────────────
  const completedMeals = meals.filter(m=>m.completed);
  const totalCals      = meals.reduce((a,m)=>a+(Number(m.calories)||0),0);
  const completedCals  = completedMeals.reduce((a,m)=>a+(Number(m.calories)||0),0);

  // ── Daily Planner stats (from localStorage) ──
  const plannerData = (() => {
    try {
      const saved = localStorage.getItem('gs_daily_planner');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  })();
  const plannerDone    = plannerData.filter(p=>p.done).length;
  const plannerTotal   = plannerData.length || 18;
  const plannerPct     = plannerTotal ? Math.round((plannerDone/plannerTotal)*100) : 0;

  // ── Medication stats ──────────────────────
  const takenMeds  = medication.filter(m=>m.takenToday).length;

  // ── Glucose chart ─────────────────────────
  const glucoseChart = {
    labels: last14.map(r => new Date(r.recordedAt).toLocaleDateString()),
    datasets: [{
      label: 'Blood Glucose (mg/dL)',
      data: last14.map(r => r.level),
      borderColor:'#2d6a4f', backgroundColor:'rgba(45,106,79,0.1)',
      tension:0.4, fill:true, pointRadius:5,
      pointBackgroundColor: last14.map(r => r.level<70?'#e63946':r.level>180?'#f4a261':'#2d6a4f'),
    }],
  };

  // ── Exercise bar chart ────────────────────
  const exTypes = ['walking','yoga','workout','cycling','swimming','other'];
  const exCounts = exTypes.map(t => completedEx.filter(e=>e.activityType===t).length);
  const exerciseChart = {
    labels: ['Walking','Yoga','Workout','Cycling','Swimming','Other'],
    datasets: [{
      label:'Completed Sessions', data:exCounts,
      backgroundColor:['#90caf9','#ce93d8','#f48fb1','#ffcc02','#80deea','#aed581'],
      borderRadius:6,
    }],
  };

  // ── Glucose distribution donut ────────────
  const donutChart = {
    labels:['Normal (70-180)','Low (<70)','High (>180)'],
    datasets:[{
      data:[normalCount, lowCount, highCount],
      backgroundColor:['#52b788','#e63946','#f4a261'],
      borderWidth:2,
    }],
  };

  // ── Meal type breakdown ───────────────────
  const mealTypes   = ['breakfast','lunch','dinner','snack'];
  const mealCounts  = mealTypes.map(t => meals.filter(m=>m.type===t).length);
  const mealChart   = {
    labels:['Breakfast','Lunch','Dinner','Snack'],
    datasets:[{
      label:'Meals Logged', data:mealCounts,
      backgroundColor:['#ffd54f','#66bb6a','#7986cb','#f06292'],
      borderRadius:6,
    }],
  };

  // ── Daily planner by category ─────────────
  const plannerCats = ['medication','meal','glucose','exercise','water','meditation','sleep'];
  const plannerCatDone = plannerCats.map(c => plannerData.filter(p=>p.category===c&&p.done).length);
  const plannerChart = {
    labels:['Medication','Meals','Glucose','Exercise','Water','Meditation','Sleep'],
    datasets:[{
      label:'Completed', data:plannerCatDone,
      backgroundColor:['#e57373','#ffb74d','#64b5f6','#81c784','#4fc3f7','#ce93d8','#9575cd'],
      borderRadius:6,
    }],
  };

  const chartOpts = {
    responsive:true,
    plugins:{ legend:{ display:false } },
    scales:{ y:{ beginAtZero:true, grid:{ color:'#e8f5e9' } }, x:{ grid:{ display:false } } },
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>📊 Health Reports</h1><p>Complete overview of your health, meals, exercise & daily planner</p></div>
      </div>

      {/* ── TOP STATS ── */}
      <div className="stats-grid" style={{ gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))' }}>
        {[
          { label:'Avg Glucose',     value: avgGlucose ? `${avgGlucose} mg/dL` : '—', icon:'💉', color:'var(--primary)' },
          { label:'In Range %',      value: glucose.length ? `${inRangePct}%` : '—',   icon:'✅', color:'#52b788' },
          { label:'Low Episodes',    value: lowCount,   icon:'🔴', color:'#e63946' },
          { label:'High Episodes',   value: highCount,  icon:'🟠', color:'#f4a261' },
          { label:'Exercise Done',   value: completedEx.length,  icon:'🏃', color:'#81c784' },
          { label:'Total Ex. Mins',  value: totalMins,  icon:'⏱️', color:'#f4a261' },
          { label:'Meals Completed', value: `${completedMeals.length}/${meals.length}`, icon:'🥗', color:'#66bb6a' },
          { label:'Calories Logged', value: totalCals,  icon:'🔥', color:'#f4845f' },
          { label:'Daily Planner',   value: `${plannerDone}/${plannerTotal}`, icon:'📋', color:'#7b2d8b' },
          { label:'Medications Taken', value: medication.length ? `${takenMeds}/${medication.length}` : '—', icon:'💊', color:'#2E75B6' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ borderLeftColor:s.color }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value" style={{ color:s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── GLUCOSE SECTION ── */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:16 }}>
        <div className="card">
          <h3 style={{ marginBottom:16 }}>📈 Glucose Trend (Last 14 Readings)</h3>
          {last14.length > 1
            ? <Line data={glucoseChart} options={{ ...chartOpts, plugins:{ legend:{ display:false } }, scales:{ y:{ grid:{ color:'#e8f5e9' } }, x:{ grid:{ display:false } } } }} />
            : <p style={{ color:'var(--text-light)' }}>Add more glucose readings to see the trend.</p>
          }
        </div>
        <div className="card">
          <h3 style={{ marginBottom:16 }}>🩸 Glucose Distribution</h3>
          {glucose.length > 0 ? (
            <>
              <Doughnut data={donutChart} options={{ plugins:{ legend:{ position:'bottom', labels:{ font:{ size:11 } } } } }} />
              <div style={{ textAlign:'center', marginTop:12, fontSize:'1.1rem', fontWeight:800, color:'#52b788', fontFamily:'Nunito,sans-serif' }}>
                {inRangePct}% In Safe Range
              </div>
            </>
          ) : <p style={{ color:'var(--text-light)' }}>No glucose data yet.</p>}
        </div>
      </div>

      {/* ── MEALS SECTION ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
        <div className="card">
          <h3 style={{ marginBottom:16 }}>🥗 Meal Completion Status</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {/* Progress bar */}
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ fontSize:'0.85rem', fontWeight:600 }}>Meals Completed</span>
              <span style={{ fontSize:'0.85rem', fontWeight:800, color:'#52b788' }}>{completedMeals.length}/{meals.length}</span>
            </div>
            <div style={{ background:'#e8f5e9', borderRadius:20, height:12, marginBottom:12 }}>
              <div style={{ width:`${meals.length?Math.round(completedMeals.length/meals.length*100):0}%`, height:'100%', borderRadius:20, background:'linear-gradient(90deg,#2d6a4f,#52b788)' }} />
            </div>
            {/* Meal list */}
            {meals.length === 0 ? <p style={{ color:'var(--text-light)' }}>No meals logged yet.</p> : (
              meals.slice(0,6).map(m => (
                <div key={m._id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px',
                  borderRadius:8, background:m.completed?'#f0faf4':'#fff8f0',
                  border:`1px solid ${m.completed?'#b7e4c7':'#ffe0b2'}` }}>
                  <span style={{ fontSize:'1.1rem' }}>{m.completed?'✅':'⏳'}</span>
                  <div style={{ flex:1 }}>
                    <span style={{ fontWeight:700, textTransform:'capitalize', fontSize:'0.88rem' }}>{m.type}</span>
                    <span style={{ color:'var(--text-light)', fontSize:'0.78rem', marginLeft:8 }}>{m.calories?`🔥${m.calories}cal`:''}</span>
                  </div>
                  <span style={{ fontSize:'0.75rem', fontWeight:700,
                    color:m.completed?'#2d6a4f':'#f4a261',
                    background:m.completed?'#d8f3dc':'#fff3e0',
                    padding:'2px 8px', borderRadius:10 }}>
                    {m.completed?'Done':'Pending'}
                  </span>
                </div>
              ))
            )}
            <div style={{ marginTop:8, padding:'10px 14px', background:'#f0faf4', borderRadius:8, fontSize:'0.85rem', color:'var(--primary)', fontWeight:600 }}>
              🔥 Total Calories: {totalCals} cal &nbsp;|&nbsp; Completed: {completedCals} cal
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom:16 }}>🍽️ Meals by Type</h3>
          {meals.length > 0
            ? <Bar data={mealChart} options={chartOpts} />
            : <p style={{ color:'var(--text-light)' }}>No meal data yet.</p>}
        </div>
      </div>

      {/* ── DAILY PLANNER REPORT ── */}
      <div className="card" style={{ marginBottom:16 }}>
        <h3 style={{ marginBottom:4 }}>📋 Daily Planner Report</h3>
        <p style={{ color:'var(--text-light)', fontSize:'0.82rem', marginBottom:16 }}>Today's activity completion from your daily planner</p>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div>
            {/* Overall progress */}
            <div style={{ marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontWeight:700 }}>Overall Progress</span>
                <span style={{ fontWeight:800, color:'#7b2d8b', fontFamily:'Nunito,sans-serif', fontSize:'1.1rem' }}>{plannerPct}%</span>
              </div>
              <div style={{ background:'#e8f5e9', borderRadius:20, height:14 }}>
                <div style={{ width:`${plannerPct}%`, height:'100%', borderRadius:20,
                  background: plannerPct===100 ? 'linear-gradient(90deg,#52b788,#2d6a4f)' : 'linear-gradient(90deg,#7b2d8b,#9c4fba)' }} />
              </div>
              <div style={{ textAlign:'center', marginTop:8, fontSize:'0.85rem', color:'#7b2d8b', fontWeight:600 }}>
                {plannerDone} of {plannerTotal} activities completed today
              </div>
            </div>

            {/* Category breakdown */}
            {[
              { cat:'medication', label:'💊 Medication', color:'#e57373' },
              { cat:'meal',       label:'🍽️ Meals',      color:'#ffb74d' },
              { cat:'glucose',    label:'💉 Glucose Checks', color:'#64b5f6' },
              { cat:'exercise',   label:'🏃 Exercise',   color:'#81c784' },
              { cat:'water',      label:'💧 Water',       color:'#4fc3f7' },
              { cat:'meditation', label:'🧘 Meditation',  color:'#ce93d8' },
              { cat:'sleep',      label:'😴 Sleep',       color:'#9575cd' },
            ].map(({ cat, label, color }) => {
              const total = plannerData.filter(p=>p.category===cat).length;
              const done  = plannerData.filter(p=>p.category===cat&&p.done).length;
              if (total === 0) return null;
              return (
                <div key={cat} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <span style={{ fontSize:'0.83rem', width:130 }}>{label}</span>
                  <div style={{ flex:1, background:'#f0f0f0', borderRadius:10, height:10 }}>
                    <div style={{ width:`${total?done/total*100:0}%`, height:'100%', borderRadius:10, background:color }} />
                  </div>
                  <span style={{ fontSize:'0.78rem', fontWeight:700, color, width:35, textAlign:'right' }}>{done}/{total}</span>
                </div>
              );
            })}
          </div>

          <div>
            <Bar data={plannerChart} options={{ ...chartOpts, plugins:{ legend:{ display:false } } }} />
          </div>
        </div>
      </div>

      {/* ── EXERCISE SECTION ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
        <div className="card">
          <h3 style={{ marginBottom:16 }}>🏃 Exercise by Type (Completed)</h3>
          {completedEx.length > 0
            ? <Bar data={exerciseChart} options={chartOpts} />
            : <p style={{ color:'var(--text-light)' }}>No completed exercises yet.</p>}
        </div>
        <div className="card">
          <h3 style={{ marginBottom:16 }}>🏃 Exercise Log</h3>
          {exercises.length === 0 ? <p style={{ color:'var(--text-light)' }}>No exercises logged.</p> : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {exercises.slice(0,6).map(e => (
                <div key={e._id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px',
                  borderRadius:8, background:e.completed?'#f0faf4':'#fff',
                  border:`1px solid ${e.completed?'#b7e4c7':'var(--border)'}` }}>
                  <span style={{ fontSize:'1.1rem' }}>{e.completed?'✅':'⏳'}</span>
                  <div style={{ flex:1 }}>
                    <span style={{ fontWeight:700, textTransform:'capitalize', fontSize:'0.88rem' }}>{e.activityType}</span>
                    <span style={{ color:'var(--text-light)', fontSize:'0.78rem', marginLeft:8 }}>{e.durationMinutes?`${e.durationMinutes}min`:''}</span>
                  </div>
                  <span style={{ fontSize:'0.75rem', fontWeight:700,
                    color:e.completed?'#2d6a4f':'#f4a261',
                    background:e.completed?'#d8f3dc':'#fff3e0',
                    padding:'2px 8px', borderRadius:10 }}>
                    {e.completed?'Done':'Pending'}
                  </span>
                </div>
              ))}
              <div style={{ marginTop:8, padding:'10px 14px', background:'#f0faf4', borderRadius:8, fontSize:'0.85rem', color:'var(--primary)', fontWeight:600 }}>
                ⏱️ Total Exercise Time: <strong>{totalMins} minutes</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── SUMMARY ── */}
      <div className="card" style={{ background:'var(--primary-pale)' }}>
        <h3 style={{ marginBottom:12 }}>📋 Health Summary</h3>
        <p style={{ color:'var(--text-mid)', lineHeight:2 }}>
          You have recorded <strong>{glucose.length}</strong> glucose readings with an average of <strong>{avgGlucose||'—'} mg/dL</strong> and <strong>{inRangePct}%</strong> in target range.
          {' '}Meals logged: <strong>{meals.length}</strong> total, <strong>{completedMeals.length}</strong> completed ({Math.round(meals.length?completedMeals.length/meals.length*100:0)}% adherence).
          {' '}Exercise: <strong>{completedEx.length}</strong> sessions completed totaling <strong>{totalMins} minutes</strong>.
          {' '}Daily Planner: <strong>{plannerDone}/{plannerTotal}</strong> activities done today (<strong>{plannerPct}%</strong>).
          {lowCount > 0 && <span style={{ color:'var(--danger)' }}> ⚠️ {lowCount} low glucose episode(s) detected — please consult your doctor.</span>}
          {plannerPct === 100 && <span style={{ color:'#2d6a4f' }}> 🎉 Amazing! You completed your full daily plan today!</span>}
        </p>
      </div>
    </div>
  );
};

export default ReportsPage;
