import { useState, useEffect } from 'react'
import { laisserAvis, getMonAvis } from '../services/api'
import NotationEtoiles from './NotationEtoiles'
import './FormulaireAvis.css'

function FormulaireAvis({ cibleId, cibleNom }) {
  const [note, setNote] = useState(0)
  const [commentaire, setCommentaire] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [avisExistant, setAvisExistant] = useState(null)

  useEffect(() => {
    chargerMonAvis()
  }, [cibleId])

  const chargerMonAvis = async () => {
    try {
      const response = await getMonAvis(cibleId)
      if (response.data.avis) {
        setAvisExistant(response.data.avis)
        setNote(response.data.avis.note)
        setCommentaire(response.data.avis.commentaire || '')
      }
    } catch {
      // Pas d'avis existant
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (note === 0) {
      setError('Veuillez sélectionner une note')
      return
    }
    setLoading(true)
    setError('')
    try {
      await laisserAvis({ cibleId, note, commentaire })
      setSuccess(avisExistant ? 'Avis mis à jour !' : 'Avis enregistré !')
      setAvisExistant({ note, commentaire })
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'envoi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="formulaire-avis">
      <h4 className="avis-titre">
        {avisExistant ? 'Modifier votre avis sur' : 'Noter'} {cibleNom}
      </h4>

      {success && <div className="avis-success">{success}</div>}
      {error && <div className="avis-error">{error}</div>}

      <form onSubmit={handleSubmit} className="avis-form">
        <div className="avis-note-container">
          <span className="avis-label">Votre note :</span>
          <NotationEtoiles
            note={note}
            onChange={setNote}
            taille="large"
          />
          {note > 0 && (
            <span className="avis-note-texte">
              {['', 'Très mauvais', 'Mauvais', 'Correct', 'Bien', 'Excellent'][note]}
            </span>
          )}
        </div>

        <div className="avis-commentaire">
          <label className="avis-label">Commentaire (optionnel)</label>
          <textarea
            className="avis-textarea"
            value={commentaire}
            onChange={e => setCommentaire(e.target.value)}
            placeholder="Partagez votre expérience..."
            rows={3}
            maxLength={800}
          />
          <small>{commentaire.length}/800 caractères</small>
        </div>

        <button
          type="submit"
          className={loading ? 'avis-button-disabled' : 'avis-button'}
          disabled={loading || note === 0}
        >
          {loading ? 'Envoi...' : avisExistant ? 'Mettre à jour' : 'Envoyer l\'avis'}
        </button>
      </form>
    </div>
  )
}

export default FormulaireAvis