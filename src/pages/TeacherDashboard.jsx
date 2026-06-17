import { supabase } from '../lib/supabase'

export default function TeacherDashboard({ session }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-teal rounded-full" />
          <span className="font-bold text-gray-800">SocraActif</span>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Déconnexion
        </button>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-8">
        <p className="text-gray-600">Tableau de bord enseignant — à compléter (Task 7)</p>
      </main>
    </div>
  )
}
