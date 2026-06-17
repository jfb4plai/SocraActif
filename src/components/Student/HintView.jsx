// src/components/Student/HintView.jsx
export default function HintView({ hint, onContinue }) {
  return (
    <div className="bg-amber-50 border border-amber-300 rounded-lg p-5 space-y-3">
      <p className="font-medium text-amber-800">Indice</p>
      <p className="text-gray-800 leading-relaxed">{hint}</p>
      <button onClick={onContinue}
        className="bg-amber-500 text-white px-4 py-2 rounded-md font-medium hover:opacity-90">
        Réessayer avec cet indice
      </button>
    </div>
  )
}
