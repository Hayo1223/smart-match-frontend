import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMatches } from '../services/api'
import FormulaireAvis from '../components/FormulaireAvis'
import AffichageAvis from '../components/AffichageAvis'
import './Matching.css'

function Matching() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const [matches, setMatches] = useState([])

  const [filters, setFilters] = useState({
  nom: "",
  prenom: "",
  localisation: "",
  produit: "",
  scoreMin: "",
  scoreMax: ""
});

  const [nom, setAgriculteurnom] = useState('')
  const [prenom, setAgriculteurprenom] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [avisOuvert, setAvisOuvert] = useState(null)
  const [contactes, setContactes] = useState(() => {
  const saved = localStorage.getItem(`contactes_${user?.id}`)
  return saved ? JSON.parse(saved) : []
})
  


  useEffect(() => {
    if (!user) { navigate('/'); return; }

    if (user.role !== 'Agriculteur') { navigate('/profile'); return;}
      fetchMatches();
  }, [])

  const fetchMatches = async () => {
    setLoading(true);
    setError("");
  try {
    const response = await getMatches(filters);
  
    setMatches(response.data.matches);
    setAgriculteurnom(response.data.nom);
    setAgriculteurprenom(response.data.prenom);

  } catch (err) {
    setError(
      err.response?.data?.error ||
      "Erreur lors du chargement des matchs"
    );
  } finally {
    setLoading(false);
  }
 };

  const handleFilterChange = (e) => {
  setFilters({
    ...filters,
    [e.target.name]: e.target.value
  });
 };

  const getScoreColor = (score) => {
    if (score >= 50) return '#16a34a'
    if (score >= 25) return '#f59e0b'
    return '#ef4444'
  }

  const contacter = (match) => {
  if (!contactes.includes(match.grossiseCommercantId)) {
    const nouveauxContactes = [...contactes, match.grossiseCommercantId]
    setContactes(nouveauxContactes)
    localStorage.setItem(`contactes_${user?.id}`, JSON.stringify(nouveauxContactes)
    )
  }

 }

 const handleKeyUp = (e) => {
    if (e.key === "Enter") {
        fetchMatches();
    }
};

  if (loading) return <div className="loading">Calcul des matchs en cours...</div>

  return (
    
    <div className="container">
      <div className="wrapper">

        {/* Header */}
        <div className="header">
          <div>
            <h1 className="title">Mes Matchs</h1>
            <p className="subtitle">
              {nom} — {matches.length} Grossiste(s) ou Commerçant(s) compatible(s) trouvée(s)
            </p>
          </div>
          <button onClick={() => navigate('/profile')} className="back-button">
            ← Mon profil
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="filters">
            <input  name="nom" placeholder='Nom' value={filters.nom} onChange={handleFilterChange} onKeyUp={handleKeyUp}/>
                
            <input  name="prenom" placeholder='Prenom' value={filters.prenom} onChange={handleFilterChange} onKeyUp={handleKeyUp}/>
          
            <input  name="localisation" placeholder='Localisation' value={filters.localisation} onChange={handleFilterChange} onKeyUp={handleKeyUp}/>
              
            <input  name="produit" placeholder='Produit' value={filters.produit} onChange={handleFilterChange} onKeyUp={handleKeyUp}/>
            
            <input  type='number' name='scoreMin' placeholder='Score minimum' value={filters.scoreMin} onChange={handleFilterChange} onKeyUp={handleKeyUp}/>
            
            <input  type='number' name="scoreMax" placeholder='Score maximum' value={filters.scoreMax} onChange={handleFilterChange} onKeyUp={handleKeyUp}/>
          
            <button onClick={fetchMatches} disabled={loading}> {loading ? "Recherche en cours..." : "Filtrer"} </button>
            
          </div>

        {/* Aucun match */}
        {matches.length === 0 && !error && (
          <div className="empty-state">
            <p className="empty-title">Aucun match trouvé pour le moment</p>
            <p className="empty-text">
              Complétez votre profil avec plus de produits et d'éléments
              pour augmenter vos chances de matching.
            </p>
            <button onClick={() => navigate('/profile')} className="button">
              Compléter mon profil
            </button>
          </div>
        )}

        {/* Liste des matchs */}
        <div className="match-list">
          {matches.map((match, index) => (
            <div key={match.grossiseCommercantId} className="match-card">

              {/* Rang et score */}
              <div className="card-header">
                <div className="rank">#{index + 1}</div>
                <div className="score-badge"
                 style={{backgroundColor: getScoreColor(match.score)
                }}>
                  {match.score} pts
                </div>                                  
                                      {match.photoUrl ? (
                                            <img src={match.photoUrl} alt={match.nomC} className="match-photo" />
                                            ) : (
                                                  <div className="match-photo-placeholder">📷</div>
                                                    )}
              </div>

              {/* Infos Consommateur/Commerçant*/}
              <h2 className="nomC">{match.nomC}</h2>
              <div className="info-row">
                <span className="info-tag"> {match.prenomC}</span>
                <span className="info-tag"> {match.localisationC}</span>
                <span className="info-tag"> {match.metier}</span>
              </div>

              {/* Contact */}
              <p className="email"> {match.email}</p>
              <p className="info-tag"> {match.numeroMobile}</p>
              <p className="info-tag"> {match.numeroWhatsapp}</p>

              {/* Détails du match */}
              <div className="details-box">
                <p className="details-title">Pourquoi ce match ?</p>
                <ul className="details-list">
                  {match.matchDetails.map((detail, i) => (
                    <li key={i} className="detail-item"> {detail}</li>
                  ))}
                </ul>
              <div>

                <button
                  className={
                     contactes.includes(match.grossiseCommercantId)
                      ? "button-disabled"
                      : "button"
                     }
                       disabled={contactes.includes(match.grossiseCommercantId)}
                       onClick={() => contacter(match)}
                  >
                      {contactes.includes(match.grossiseCommercantId)
                      ? "Contacté"
                      : "Contacter le profil"}
                 </button>

                 {contactes.includes(match.grossiseCommercantId) && (
                 <div className="contact-message">
                   <p className="contact-message">Vous avez contacté {match.nomC} {match.prenomC}.</p>
                   <p>Localisation : {match.localisationC}</p>
                   <p>Demande du client : {match.demande.join(", ")}</p>
                  </div>
                  )}
                </div>
              </div>

              {/* Avis */}
                <AffichageAvis userId={match.userId} />              
                {contactes.includes(match.grossiseCommercantId) && (
                    <div className="avis-container">
                          <button  className="avis-toggle-button"
                              onClick={() => setAvisOuvert(
                                avisOuvert === match.grossiseCommercantId
                                    ? null
                                    : match.grossiseCommercantId
                                    )}>
                                {avisOuvert === match.grossiseCommercantId
                                        ? 'Fermer'
                                        : 'Laisser un avis'}
                            </button>
                 {avisOuvert === match.grossiseCommercantId && (
                        <FormulaireAvis
                            cibleId={match.userId}
                            cibleNom={`${match.nomC} ${match.prenomC}`}/>
                                )}
                      </div>
                    )}

            </div>
          ))}
         </div>
      </div>
    </div>
  )
}


export default Matching