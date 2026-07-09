import { useState, useEffect } from 'react'
import { getAvis } from '../services/api'
import NotationEtoiles from './NotationEtoiles'
import './AffichageAvis.css'

function AffichageAvis({ userId }) {
  const [avis, setAvis] = useState([])
  const [moyenne, setMoyenne] = useState(null)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    chargerAvis()
  }, [userId])

  const chargerAvis = async () => {
    try {
      const response = await getAvis(userId)
      setAvis(response.data.avis)
      setMoyenne(response.data.moyenne)
      setTotal(response.data.total)
    } catch {
      // Silencieux
    } finally {
      setLoading(false)
    }
  }

  if (loading) return null

  return (
    <div className="affichage-avis">
      {/* Résumé */}
      <div className="avis-resume">
        {moyenne ? (
          <>
            <NotationEtoiles note={Math.round(moyenne)} readOnly taille="small" />
            <span className="avis-moyenne">{moyenne}/5</span>
            <span className="avis-total">({total} avis)</span>
          </>
        ) : (
          <span className="avis-aucun">Aucun avis pour le moment</span>
        )}
      </div>

      {/* Liste des avis */}
      {avis.length > 0 && (
        <div className="avis-liste">
          {avis.slice(0, 3).map(a => (
            <div key={a.id} className="avis-item">
              <div className="avis-item-header">
                <NotationEtoiles note={a.note} readOnly taille="small" />
                <span className="avis-date">
                  {new Date(a.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
              {a.commentaire && (
                <p className="avis-commentaire-texte">"{a.commentaire}"</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AffichageAvis