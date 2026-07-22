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

  const [filters, setFilters] = useState({
  nom: "",
  prenom: "",
  localisation: "",
  produit: ""
});

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [avisOuvert, setAvisOuvert] = useState(null)

  const [contactes, setContactes] = useState(() => {
    const saved = localStorage.getItem(`contactes_agriculteurs_${user?.id}`)
    return saved ? JSON.parse(saved) : []
  })


  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }

    if (user.role !== 'GrossiseCommercant') {
      navigate('/profile')
      return
    }

    fetchAgriculteurs()
  }, [])

  const fetchAgriculteurs = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getMesAgriculteurs(filters);
  
    setAgriculteurs(response.data.agriculteurs);

    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
  setFilters({
    ...filters,
    [e.target.name]: e.target.value
  });
 }; 

  const contacter = (agriculteurs) => {
    if (!contactes.includes(agriculteurs.agriculteurId)) {
      const nouveaux = [...contactes, agriculteurs.agriculteurId]

      setContactes(nouveaux)

      localStorage.setItem(
        `contactes_agriculteurs_${user?.id}`,
        JSON.stringify(nouveaux)
      )
    }
  }

  const handleKeyUp = (e) => {
    if (e.key === "Enter") {
        fetchAgriculteurs();
    }
};

  if (loading) {
    return <div className="loading">Chargement...</div>
  }

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

          <button
            onClick={() => navigate('/profile')}
            className="back-button"
          >
            ← Mon profil
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="filters">
            <input  name="nom" placeholder='Nom' value={filters.nom} onChange={handleFilterChange} onKeyUp={handleKeyUp}/>
                
            <input  name="prenom" placeholder='Prenom' value={filters.prenom} onChange={handleFilterChange} onKeyUp={handleKeyUp}/>
          
            <input  name="localisation" placeholder='Localisation' value={filters.localisation} onChange={handleFilterChange} onKeyUp={handleKeyUp}/>
              
            <input  name="produit" placeholder='Produit' value={filters.produit} onChange={handleFilterChange} onKeyUp={handleKeyUp}/>
            
            <button onClick={fetchAgriculteurs} disabled={loading}> {loading ? "Recherche en cours..." : "Filtrer"} </button>
            
          </div>

        {agriculteurs.length === 0 && !error ? (
          <div className="empty-state">
            <p className="empty-title">
              Aucun agriculteur disponible
            </p>
          </div>
        ) : (
          <div className="match-list">
            {agriculteurs.map((agriculteurs) => (
              <div
                key={agriculteurs.agriculteurId}
                className="match-card"
              >

                <div className="card-header">
                  {agriculteurs.photoUrl ? (
                    <img
                      src={agriculteurs.photoUrl}
                      alt={agriculteurs.nom}
                      className="match-photo"
                    />
                  ) : (
                    <div className="match-photo-placeholder">📷</div>
                  )}

                  <div>
                    <h2 className="name">
                      {agriculteurs.nom} {agriculteurs.prenom}
                    </h2>

                    <div className="info-row">
                      <span className="info-tag">
                        {agriculteurs.localisation}
                      </span>

                      <span className="info-tag">
                        {agriculteurs.produit?.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="email">{agriculteurs.email}</p>

                <p className="info-tag">
                  {agriculteurs.numeroMobile}
                </p>

                <p className="info-tag">
                  {agriculteurs.numeroWhatsapp}
                </p>

                {/* Avis */}
                <AffichageAvis userId={agriculteurs.userId} />

                {/* Boutons */}
                <div className='button-container'>
                  <button
                    className={
                      contactes.includes(agriculteurs.agriculteurId)
                        ? 'button-disabled'
                        : 'button'
                    }
                    disabled={contactes.includes(agriculteurs.agriculteurId)}
                    onClick={() => contacter(agriculteurs)}
                  >
                    {contactes.includes(agriculteurs.agriculteurId)
                      ? 'Contacté'
                      : 'Contacter'}
                  </button>

                  {contactes.includes(agriculteurs.agriculteurId) && (
                    <button
                      className="avis-toggle-button"
                      onClick={() =>
                        setAvisOuvert(
                          avisOuvert === agriculteurs.agriculteurId
                            ? null
                            : agriculteurs.agriculteurId
                        )
                      }
                    >
                      {avisOuvert === agriculteurs.agriculteurId
                        ? 'Fermer'
                        : 'Laisser un avis'}
                    </button>
                  )}
                </div>

                {/* Formulaire */}
                {avisOuvert === agriculteurs.agriculteurId && (
                  <FormulaireAvis
                    cibleId={agriculteurs.userId}
                    cibleNom={`${agriculteurs.nom} ${agriculteurs.prenom}`}
                  />
                )}

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default MesAgriculteurs