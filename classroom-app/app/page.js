"use client";
import React, { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [systemActive, setSystemActive] = useState(true);
  const [modes, setModes] = useState({
    studentChatter: true,
    outsideNoise: true,
    teacherMode: true,
  });
  
  const [noiseLevels, setNoiseLevels] = useState({
    overall: 35,
    students: 20,
    outside: 10,
    reduced: 92,
  });
  
  const [stats, setStats] = useState({
    activeStudents: 0,
    activeSpeakers: 0,
  });

  const canvasRef = useRef(null);
  const stateRef = useRef({
    noiseWaves: [],
    cancelWaves: [],
    tick: 0,
    activeSpeakers: new Set(),
    activeStudents: new Set(),
    outsideNoiseActive: false,
    teacherSpeaking: false,
    lastNoiseTime: 0,
    lastOutsideTime: 0,
    lastTeacherTime: 0,
  });

  const speakers = [
    { id: 1, x: 80, y: 25 },
    { id: 2, x: 300, y: 25 },
    { id: 3, x: 520, y: 25 },
    { id: 4, x: 740, y: 25 },
    { id: 5, x: 80, y: 420 },
    { id: 6, x: 740, y: 420 },
  ];

  const microphones = [
    { id: 1, x: 180, y: 130 },
    { id: 2, x: 450, y: 130 },
    { id: 3, x: 720, y: 130 },
    { id: 4, x: 180, y: 280 },
    { id: 5, x: 450, y: 280 },
    { id: 6, x: 720, y: 280 },
  ];

  const windows = [
    { x: 5, y: 60, w: 20, h: 100 },
    { x: 5, y: 180, w: 20, h: 100 },
    { x: 5, y: 300, w: 20, h: 100 },
  ];

  const students = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 6; col++) {
      const x = 100 + col * 130;
      const y = 80 + row * 90;
      students.push({ id: row * 12 + col * 2 + 1, x: x - 18, y: y - 5 });
      students.push({ id: row * 12 + col * 2 + 2, x: x + 18, y: y - 5 });
    }
  }

  const teacher = { x: 450, y: 490 };
  const whiteboard = { x: 175, y: 470, w: 550, h: 55 };
  const door = { x: 850, y: 220, w: 40, h: 90 };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 900, H = 550;
    let animationId;

    const animate = (timestamp) => {
      const state = stateRef.current;
      state.tick++;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(100,116,139,0.1)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      if (systemActive) {
        if ((modes.studentChatter) && timestamp - state.lastNoiseTime > 1500) {
          if (Math.random() < 0.4) {
            state.lastNoiseTime = timestamp;
            const student = students[Math.floor(Math.random() * students.length)];
            state.activeStudents.add(student.id);
            state.noiseWaves.push({
              id: Date.now() + Math.random(),
              x: student.x, y: student.y,
              radius: 0, maxRadius: 80, speed: 1.2,
              type: 'student', cancelled: false,
            });
            setTimeout(() => state.activeStudents.delete(student.id), 2500);
          }
        }

        if (modes.outsideNoise && timestamp - state.lastOutsideTime > 4000) {
          if (Math.random() < 0.3) {
            state.lastOutsideTime = timestamp;
            state.outsideNoiseActive = true;
            const win = windows[Math.floor(Math.random() * windows.length)];
            state.noiseWaves.push({
              id: Date.now() + Math.random(),
              x: win.x + win.w, y: win.y + win.h / 2,
              radius: 0, maxRadius: 200, speed: 1.5,
              type: 'outside', cancelled: false,
            });
            setTimeout(() => { state.outsideNoiseActive = false; }, 3000);
          }
        }

        if (modes.teacherMode && timestamp - state.lastTeacherTime > 5000) {
          if (Math.random() < 0.25) {
            state.lastTeacherTime = timestamp;
            state.teacherSpeaking = true;
            state.noiseWaves.push({
              id: Date.now() + Math.random(),
              x: teacher.x, y: teacher.y,
              radius: 0, maxRadius: 250, speed: 1.8,
              type: 'teacher', cancelled: false,
            });
            setTimeout(() => { state.teacherSpeaking = false; }, 3500);
          }
        }
      }

      windows.forEach(win => {
        ctx.fillStyle = state.outsideNoiseActive ? 'rgba(239,68,68,0.3)' : 'rgba(56,189,248,0.15)';
        ctx.fillRect(win.x, win.y, win.w, win.h);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.strokeRect(win.x, win.y, win.w, win.h);
      });

      ctx.fillStyle = 'rgba(139,92,246,0.15)';
      ctx.fillRect(door.x, door.y, door.w, door.h);
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(door.x, door.y, door.w, door.h);

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(whiteboard.x, whiteboard.y, whiteboard.w, whiteboard.h);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.strokeRect(whiteboard.x, whiteboard.y, whiteboard.w, whiteboard.h);
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('WHITEBOARD', whiteboard.x + whiteboard.w / 2, whiteboard.y + 33);

      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 6; col++) {
          const x = 100 + col * 130;
          const y = 80 + row * 90;
          ctx.fillStyle = 'rgba(51,65,85,0.7)';
          ctx.fillRect(x - 40, y - 20, 80, 40);
          ctx.strokeStyle = 'rgba(100,116,139,0.5)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x - 40, y - 20, 80, 40);
        }
      }

      state.activeSpeakers.clear();

      state.noiseWaves = state.noiseWaves.filter(wave => {
        wave.radius += wave.speed;
        if (wave.radius >= wave.maxRadius) return false;

        const opacity = 1 - wave.radius / wave.maxRadius;
        let color;
        let shouldCancel = false;

        if (wave.type === 'student') {
          color = `rgba(251,146,60,${opacity * 0.6})`;
          shouldCancel = modes.studentChatter;
        } else if (wave.type === 'outside') {
          color = `rgba(239,68,68,${opacity * 0.7})`;
          shouldCancel = modes.outsideNoise;
        } else if (wave.type === 'teacher') {
          color = `rgba(34,197,94,${opacity * 0.6})`;
          shouldCancel = !modes.teacherMode;
        }

        for (let i = 0; i < 3; i++) {
          const r = wave.radius - i * 8;
          if (r > 0) {
            ctx.beginPath();
            ctx.arc(wave.x, wave.y, r, 0, Math.PI * 2);
            ctx.strokeStyle = color;
            ctx.lineWidth = 3 - i;
            ctx.stroke();
          }
        }

        if (systemActive && shouldCancel && wave.radius > 15 && !wave.cancelled) {
          wave.cancelled = true;
          speakers.forEach((sp, idx) => {
            const dist = Math.sqrt((sp.x - wave.x) ** 2 + (sp.y - wave.y) ** 2);
            if (dist < 400) {
              state.activeSpeakers.add(sp.id);
              state.cancelWaves.push({
                id: Date.now() + idx + Math.random(),
                x: sp.x, y: sp.y,
                targetX: wave.x, targetY: wave.y,
                radius: 0, maxRadius: Math.min(dist * 0.8, 150),
                speed: 2.5, speakerId: sp.id,
              });
            }
          });
        }

        return true;
      });

      state.cancelWaves = state.cancelWaves.filter(wave => {
        wave.radius += wave.speed;
        if (wave.radius >= wave.maxRadius) return false;

        state.activeSpeakers.add(wave.speakerId);
        const opacity = 1 - wave.radius / wave.maxRadius;
        const angle = Math.atan2(wave.targetY - wave.y, wave.targetX - wave.x);
        const spread = Math.PI / 2;

        ctx.beginPath();
        ctx.moveTo(wave.x, wave.y);
        ctx.arc(wave.x, wave.y, wave.radius, angle - spread, angle + spread);
        ctx.closePath();
        ctx.fillStyle = `rgba(16,185,129,${opacity * 0.4})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, angle - spread, angle + spread);
        ctx.strokeStyle = `rgba(16,185,129,${opacity * 0.8})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        return true;
      });

      students.forEach(student => {
        const isActive = state.activeStudents.has(student.id);
        
        if (isActive) {
          ctx.beginPath();
          ctx.arc(student.x, student.y, 16, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(251,146,60,0.3)';
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(student.x, student.y, 9, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? '#fb923c' : '#3b82f6';
        ctx.fill();
      });

      ctx.beginPath();
      ctx.arc(teacher.x, teacher.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = state.teacherSpeaking ? '#22c55e' : '#a855f7';
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('T', teacher.x, teacher.y + 4);

      speakers.forEach(sp => {
        const isActive = state.activeSpeakers.has(sp.id);
        
        if (isActive) {
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, 22, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(16,185,129,0.25)';
          ctx.fill();
        }

        ctx.fillStyle = isActive ? '#10b981' : '#6366f1';
        ctx.fillRect(sp.x - 15, sp.y - 10, 30, 20);
      });

      microphones.forEach(mic => {
        ctx.beginPath();
        ctx.arc(mic.x, mic.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
      });

      ctx.fillStyle = '#64748b';
      ctx.font = '11px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('WINDOWS', 30, 55);
      ctx.fillText('DOOR', door.x - 10, door.y - 10);

      setStats({
        activeStudents: state.activeStudents.size,
        activeSpeakers: state.activeSpeakers.size,
      });

      setNoiseLevels({
        overall: Math.min(100, 25 + state.activeStudents.size * 8 + (state.outsideNoiseActive ? 20 : 0)),
        students: Math.min(100, state.activeStudents.size * 10),
        outside: state.outsideNoiseActive ? 50 : 5,
        reduced: systemActive ? 90 : 0,
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [systemActive, modes]);

  const toggleMode = (mode) => {
    setModes(prev => ({ ...prev, [mode]: !prev[mode] }));
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a', color: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ width: 300, background: '#1e293b', padding: 20, borderRight: '1px solid #334155' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: 20 }}>🎓 ClassRoom ANC</h2>
        
        <button
          onClick={() => setSystemActive(!systemActive)}
          style={{
            width: '100%',
            padding: 15,
            marginBottom: 20,
            border: 'none',
            borderRadius: 10,
            background: systemActive ? '#10b981' : '#ef4444',
            color: '#fff',
            fontSize: 16,
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          {systemActive ? '⏻ SYSTEM ON' : '⭘ SYSTEM OFF'}
        </button>

        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, color: '#94a3b8', marginBottom: 10 }}>Noise Control</h3>
          
          {[
            { key: 'studentChatter', icon: '👥', name: 'Student Chatter', color: '#fb923c' },
            { key: 'outsideNoise', icon: '🏠', name: 'Outside Noise', color: '#ef4444' },
            { key: 'teacherMode', icon: '👨‍🏫', name: 'Teacher Voice', color: '#22c55e' },
          ].map(mode => (
            <button
              key={mode.key}
              onClick={() => toggleMode(mode.key)}
              style={{
                width: '100%',
                padding: 12,
                marginBottom: 8,
                border: modes[mode.key] ? `2px solid ${mode.color}` : '2px solid transparent',
                borderRadius: 8,
                background: modes[mode.key] ? `${mode.color}20` : '#334155',
                color: '#fff',
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ fontSize: 20 }}>{mode.icon}</span>
              <span style={{ flex: 1, textAlign: 'left' }}>{mode.name}</span>
              <span style={{
                padding: '4px 10px',
                borderRadius: 12,
                fontSize: 11,
                fontWeight: 'bold',
                background: modes[mode.key] ? mode.color : '#475569',
              }}>
                {modes[mode.key] ? 'ON' : 'OFF'}
              </span>
            </button>
          ))}
        </div>

        <div>
          <h3 style={{ fontSize: 14, color: '#94a3b8', marginBottom: 10 }}>Live Stats</h3>
          
          {[
            { label: 'Overall Noise', value: noiseLevels.overall, color: '#f59e0b' },
            { label: 'Student Noise', value: noiseLevels.students, color: '#fb923c' },
            { label: 'Outside Noise', value: noiseLevels.outside, color: '#ef4444' },
            { label: 'Reduction', value: noiseLevels.reduced, color: '#10b981' },
          ].map(stat => (
            <div key={stat.label} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: '#94a3b8' }}>{stat.label}</span>
                <span>{stat.value.toFixed(0)}%</span>
              </div>
              <div style={{ height: 6, background: '#334155', borderRadius: 3 }}>
                <div style={{
                  width: `${stat.value}%`,
                  height: '100%',
                  background: stat.color,
                  borderRadius: 3,
                  transition: 'width 0.3s',
                }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, padding: 15, background: '#334155', borderRadius: 10 }}>
          <h4 style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>Legend</h4>
          {[
            { color: '#3b82f6', label: 'Student' },
            { color: '#fb923c', label: 'Talking' },
            { color: '#a855f7', label: 'Teacher' },
            { color: '#6366f1', label: 'Speaker' },
            { color: '#10b981', label: 'Active Speaker' },
            { color: '#ef4444', label: 'Microphone' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: item.color }} />
              <span style={{ fontSize: 11, color: '#94a3b8' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 style={{ margin: 0, fontSize: 22 }}>🏫 Classroom View</h1>
          <div style={{
            padding: '8px 16px',
            borderRadius: 20,
            background: systemActive ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
            border: `1px solid ${systemActive ? '#10b981' : '#ef4444'}`,
            fontSize: 13,
          }}>
            <span style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: systemActive ? '#10b981' : '#ef4444',
              marginRight: 8,
            }} />
            {systemActive ? 'ONLINE' : 'OFFLINE'}
          </div>
        </div>

        <div style={{ background: '#1e293b', borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <canvas
            ref={canvasRef}
            width={900}
            height={550}
            style={{ borderRadius: 12, display: 'block', margin: '0 auto', maxWidth: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 15 }}>
          {[
            { value: students.length, label: 'Students', icon: '👥' },
            { value: stats.activeStudents, label: 'Talking', icon: '🗣️' },
            { value: speakers.length, label: 'Speakers', icon: '🔊' },
            { value: stats.activeSpeakers, label: 'Active', icon: '✨' },
            { value: microphones.length, label: 'Mics', icon: '🎤' },
            { value: `${noiseLevels.reduced}%`, label: 'Reduction', icon: '📉' },
          ].map(stat => (
            <div key={stat.label} style={{
              flex: 1,
              padding: 15,
              background: '#1e293b',
              borderRadius: 12,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 16, marginBottom: 5 }}>{stat.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 'bold' }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
