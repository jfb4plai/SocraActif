// src/pages/StudentSession.jsx
import { useState } from 'react'
import StudentLogin from '../components/Student/StudentLogin'
import StepView from '../components/Student/StepView'

export default function StudentSession() {
  const [session, setSession] = useState(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [attemptNumber, setAttemptNumber] = useState(1)
  const [canProceed, setCanProceed] = useState(false)
  const [blockingWarning, setBlockingWarning] = useState(false)
  const [finished, setFinished] = useState(false)

  if (!session) return <StudentLogin onLoggedIn={setSession} />

  if (finished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <p className="text-5xl">🎓</p>
          <h2 className="text-2xl font-bold text-gray-800">Parcours terminé !</h2>
          <p className="text-gray-500">{session.sequence.title}</p>
        </div>
      </div>
    )
  }

  const currentStep = session.steps[currentStepIndex]

  function handleStepSolved() {
    setCanProceed(true)
    setBlockingWarning(false)
  }

  function handleNext() {
    if (!canProceed && session.sequence.blocking_mode === 'strict') {
      setBlockingWarning(true)
      return
    }
    if (currentStepIndex + 1 >= session.steps.length) {
      setFinished(true)
    } else {
      setCurrentStepIndex(i => i + 1)
      setAttemptNumber(n => n + 1)
      setCanProceed(false)
      setBlockingWarning(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-teal rounded-full" />
            <span className="font-bold text-gray-800">SocraActif</span>
          </div>
          <span className="text-sm text-gray-500">
            {currentStepIndex + 1} / {session.steps.length}
          </span>
        </div>
      </header>
      <main className="max-w-xl mx-auto px-6 py-8">
        {blockingWarning && (
          <div className="bg-red-50 border border-red-300 rounded-md p-3 text-sm text-red-700 mb-4">
            Tu dois résoudre cette étape avant de continuer (mode strict).
          </div>
        )}
        <StepView
          step={currentStep}
          sequence={session.sequence}
          studentCode={session.studentCode}
          attemptNumber={attemptNumber}
          onNext={handleNext}
          onSolved={handleStepSolved}
        />
      </main>
    </div>
  )
}
