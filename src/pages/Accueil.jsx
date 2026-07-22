import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStats } from '../services/api'
import soukLogo from './soukLogo.png'
import image from './image.png'
import image2 from './image2.png'
import './Accueil.css'

function Accueil() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ agriculteur: 0,  grossiteCommercant: 0 })

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    if (user) { navigate('/profile'); return }

    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await getStats()
      setStats(response.data)
    } catch {
      // Silencieux — les stats sont optionnelles
    }
  }

  return (
    <div className="accueil">

      {/* Navbar */}
      <nav className="navbar">
       <div className="navbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src={soukLogo} alt="SOUK" className="logo" />
        </div>
        <div className="navbar-links">
          <button onClick={() => navigate('/login')} className="navbar-login">
            Se connecter
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🇲🇦 Plateforme agricole marocaine</div>
          <h1 className="hero-titre">
            Connectez les <span className="hero-accent">agriculteurs</span><br />
            aux grossistes ou 
            commerçants du Maroc
          </h1>
          <p className="hero-description">
            Vendez vos produits directement, sans intermédiaire.<br />
            Trouvez des acheteurs locaux grâce à notre algorithme de matching intelligent.
          </p>

          {/* Les deux CTA */}
          <div className="hero-cta">
            <button
              className="cta-agriculteur"
              onClick={() => navigate('/register?role=Agriculteur')}
            >
              <span className="cta-emoji">🌾</span>
              <div>
                <div className="cta-titre">Je suis Agriculteur</div>
                <div className="cta-sous-titre">Vendez vos récoltes directement</div>
              </div>
            </button>

            <button
              className="cta-commercant"
              onClick={() => navigate('/register?role=ConsommateurCommercant')}
            >
              <span className="cta-emoji">🛒</span>
              <div>
                <div className="cta-titre">Je suis Commerçant / Grossistes</div>
                <div className="cta-sous-titre">Trouvez des producteurs locaux</div>
              </div>
            </button>
          </div>

          <p className="hero-login-text">
            Déjà inscrit ?{' '}
            <span className="hero-login-link" onClick={() => navigate('/login')}>
              Se connecter
            </span>
          </p>
        </div>

        {/* Visuel décoratif */}
        <div className="hero-visuel">
          <div className="hero-emoji-grid">
            {['🍅', '🥕', '🌾', '🍊', '🥔', '🫒', '🍇', '🍋', '🧅', '🍆'].map((emoji, i) => (
              <div key={i} className={`hero-emoji-item delay-${i % 4}`}>
                {emoji}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-nombre">{stats.agriculteur}</div>
            <div className="stat-label"> 🌾Agriculteurs inscrits</div>
          </div>
          <div className="stat-card">
            <div className="stat-nombre">{stats.consommateurCommercant}</div>
            <div className="stat-label"> 🛒 Commerçant / Grossistes inscrits</div>
          </div>
          <div className="stat-card">
            <div className="stat-nombre">12</div>
            <div className="stat-label"> Villes couvertes</div>
          </div>
          <div className="stat-card">
            <div className="stat-nombre">20</div>
            <div className="stat-label"> Types de produits</div>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="comment-section">
        <h2 className="comment-titre">Comment ça marche ?</h2>
        <div className="etapes-grid">
          <div className="etape-card">
            <div className="etape-numero">1</div>
            <div className="etape-emoji">👤</div>
            <h3 className="etape-titre">Créez votre profil</h3>
            <p className="etape-desc">
              Inscrivez-vous en tant qu'agriculteur ou Commerçant / Grossistes et renseignez vos produits et localisation.
            </p>
          </div>
          <div className="etape-card">
            <div className="etape-numero">2</div>
            <div className="etape-emoji">⚡</div>
            <h3 className="etape-titre">Trouvez vos matchs</h3>
            <p className="etape-desc">
              Notre algorithme calcule un score de compatibilité basé sur vos produits, localisation et disponibilité.
            </p>
          </div>
          <div className="etape-card">
            <div className="etape-numero">3</div>
            <div className="etape-emoji">📞</div>
            <h3 className="etape-titre">Contactez directement</h3>
            <p className="etape-desc">
              Échangez par téléphone ou WhatsApp sans intermédiaire et concluez vos accords directement.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <img src = {soukLogo} alt='Logo' className='Logo'/>
        <p> SOUK — Plateforme agricole marocaine</p>
        <p className="footer-sub">Connecter les producteurs aux acheteurs depuis 2026</p>
        <p className="footer-sub"> Vos données sont protégées par un chiffrement 
          de pointe et traitées avec une transparence totale, car votre tranquillité
           d'esprit est notre priorité absolue.</p>
      </footer>

    </div>
  )
}

export default Accueil
