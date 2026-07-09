import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMesAgriculteurs } from '../services/api'
import FormulaireAvis from '../components/FormulaireAvis'
import AffichageAvis from '../components/AffichageAvis'
import './MesAgriculteurs.css'

function MesAgriculteurs() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const [agriculteurs, setAgriculteurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [avisOuvert, setAvisOuvert] = useState(null)
  const [contactes, setContactes] = useState(() => {
    const saved = localStorage.getItem(`contactes_agriculteurs_${user?.id}`)
    return saved ? JSON.parse(saved) : []
  })

  const [agriculteurForm, setAgriculteurForm] = useState({
    nom: '', prenom: '', localisation: '', available: true,
    numeroAgriculmobile: '+212-', numeroAgriculwhatsapp: '+212-',
    produit: [], genre: '', age: ''
  })

  useEffect(() => {
    if (!user) { navigate('/'); return }
    if (user.role !== 'ConsommateurCommercant') { navigate('/profile'); return }
    fetchAgriculteurs()
  }, [])

  const fetchAgriculteurs = async () => {
    try {
      const response = await getMesAgriculteurs()
      setAgriculteurs(response.data.agriculteurs)
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const contacter = (agriculteur) => {
    if (!contactes.includes(agriculteur.agriculteurId)) {
      const nouveaux = [...contactes, agriculteur.agriculteurId]
      setContactes(nouveaux)
      localStorage.setItem(
        `contactes_agriculteurs_${user?.id}`,
        JSON.stringify(nouveaux)
      )
    }
  }

  if (loading) return <div className="loading">Chargement...</div>

  return (
    <div className="container">
      <div className="wrapper">

        <div className="header">
          <div>
            <h1 className="title">Agriculteurs disponibles</h1>
            <p className="subtitle">
              {agriculteurs.length} agriculteur(s) trouvé(s)
            </p>
          </div>
          <button onClick={() => navigate('/profile')} className="back-button">
            ← Mon profil
          </button>
        </div>

        {error && <div className="error">{error}</div>}
        
        if (agriculteurForm.available === false) {}
        {agriculteurs.length === 0 && !error && (
          <div className="empty-state">
            <p className="empty-title">Aucun agriculteur disponible</p>
          </div>
        )}
        else {
            <div className="match-list">
          {agriculteurs.map((agriculteur, index) => (
            <div key={agriculteur.agriculteurId} className="match-card">

              <div className="card-header">
                {agriculteur.photoUrl ? (
                  <img src={agriculteur.photoUrl} alt={agriculteur.nom}
                    className="match-photo" />
                ) : (
                  <div className="match-photo-placeholder">🌾</div>
                )}
                <div>
                  <h2 className="company-name">
                    {agriculteur.nom} {agriculteur.prenom}
                  </h2>
                  <div className="info-row">
                    <span className="info-tag">{agriculteur.localisation}</span>
                    <span className="info-tag">
                       {agriculteur.produit?.join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              <p className="email">{agriculteur.email}</p>
              <p className="info-tag">{agriculteur.numeroMobile}</p>
              <p className="info-tag">{agriculteur.numeroWhatsapp}</p>

              {/* Avis existants */}
              <AffichageAvis userId={agriculteur.userId} />

              {/* Bouton contacter */}
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  className={contactes.includes(agriculteur.agriculteurId)
                    ? "button-disabled" : "button"}
                  disabled={contactes.includes(agriculteur.agriculteurId)}
                  onClick={() => contacter(agriculteur)}
                >
                  {contactes.includes(agriculteur.agriculteurId)
                    ? 'Contacté' : 'Contacter'}
                </button>

                {/* Bouton laisser un avis */}
                {contactes.includes(agriculteur.agriculteurId) && (
                  <button
                    className="avis-toggle-button"
                    onClick={() => setAvisOuvert(
                      avisOuvert === agriculteur.agriculteurId
                        ? null
                        : agriculteur.agriculteurId
                    )}
                  >
                    {avisOuvert === agriculteur.agriculteurId
                      ? 'Fermer' : 'Laisser un avis'}
                  </button>
                )}
              </div>

              {/* Formulaire avis */}
              {avisOuvert === agriculteur.agriculteurId && (
                <FormulaireAvis
                  cibleId={agriculteur.userId}
                  cibleNom={`${agriculteur.nom} ${agriculteur.prenom}`}
                />
              )}

            </div>
          ))}
        </div>

        }

        

      </div>
    </div>
  )
}

export default MesAgriculteurs