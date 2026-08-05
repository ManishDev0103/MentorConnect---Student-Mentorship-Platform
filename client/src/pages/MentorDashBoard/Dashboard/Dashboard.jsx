import React, { useState } from 'react'
import Sidebar from '../../../Component/MentorComponents/Sidebar/Sidebar';
import { Routes, Route } from 'react-router-dom'
import DashboardHome from '../DashboardHome/DashboardHome';
import Availability from '../Availability/Availability';
import MyStudents from '../MyStudents/MyStudents';
import MentorMessages from '../Messages/MentorMessages';
import Feedback from '../Feedback/Feedback';
import Earnings from '../Earnings/Earnings';
import MentorProfile from '../MentorProfile';
import MCQPractice from '../MCQPractice/MCQPractice';
import "./Dashboard.css";

function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  return (
    <div className={`dashboard-layout${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
      <Sidebar />
      <main className='main-content'>
        <div className='d-flex justify-content-end mb-3'>
          <button
            type='button'
            className='btn btn-outline-secondary btn-sm sidebar-toggle-btn'
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Show Menu' : 'Hide Menu'}
            title={sidebarCollapsed ? 'Show Menu' : 'Hide Menu'}
          >
            {sidebarCollapsed ? '☰' : '◀'}
          </button>
        </div>
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path='dashboard' element={<DashboardHome />} />
          <Route path='availability' element={<Availability />} />
          <Route path='students' element={<MyStudents />} />
          <Route path='messages' element={<MentorMessages />} />
          <Route path='mcq-practice/:studentId' element={<MCQPractice />} />
          <Route path='feedback' element={<Feedback />} />
          <Route path='earnings' element={<Earnings />} />
          <Route path='profile' element={<MentorProfile />} />
        </Routes>
      </main>
    </div>
  )
}

export default Dashboard
