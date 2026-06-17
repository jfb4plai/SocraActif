export default function StepManager({ sequence, onBack }) {
  return (
    <div>
      <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 mb-4">← Retour</button>
      <h2 className="text-lg font-semibold mb-2">{sequence.title}</h2>
      <p className="text-gray-500 text-sm">Gestion des étapes — à compléter (Task 8)</p>
    </div>
  )
}
