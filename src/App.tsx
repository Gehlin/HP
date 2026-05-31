import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Practice from './pages/Practice'
import Session from './pages/Session'
import Results from './pages/Results'
import Theory from './pages/Theory'
import Progress from './pages/Progress'
import ExamSelect from './pages/ExamSelect'
import ExamStart from './pages/ExamStart'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/session" element={<Session />} />
        <Route path="/results" element={<Results />} />
        <Route path="/theory" element={<Theory />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/exam-select" element={<ExamSelect />} />
        <Route path="/exam/:examId" element={<ExamStart />} />
      </Routes>
    </BrowserRouter>
  )
}
