import React from 'react'
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
  return (
    <div className='dashboard-layout'>
      <Sidebar />
      <main className='main-content'>
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
