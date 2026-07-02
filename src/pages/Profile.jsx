import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, upsertProfile } from '../services/api'

function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [agriculteurForm, setAgriculteurForm] = useState({
    nom: '', prénom: '', localisation: '',
    available: true, numeroAgriculmobile: '', numeroAgriculwhatsapp: '', produit: '', genre: ''
  })

  const [consommateurCommercantForm, setConsommateurCommercantForm] = useState({
    nomC: '', PrénomC: '', localisationC: '', numeroMobile: '', nnumeroWhatsapp: '',
    demande: '', genre: '', metier: ''
  })

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null')
    if (!storedUser) {
      navigate('/')
      return
    }
    setUser(storedUser)
    fetchProfile(storedUser)
  }, [])

  const fetchProfile = async (currentUser) => {
    try {
      const response = await getProfile()
      const p = response.data.profile
      setProfile(p)

      if (currentUser.role === 'Agriculteur') {
        setAgriculteurForm({
          nom: p.nom || '',
          prénom: p.prénom || '',
          localisation: p.localisation?.join(', ') || '',
          available: p.available ?? true,
          numeroAgriculmobile: p.numeroAgriculmobile?.join(', ') || '',
          numeroAgriculwhatsapp: p.numeroAgriculwhatsapp?.join(', ') || '',
          produit: p.produit?.join(', ') || '',
          genre: p.genre?.join(', ') || ''
        })
      } else {
        setConsommateurCommercantForm({
          nomC: p.nomC || '',
          PrénomC: p.PrénomC || '',
          localisationC: p.localisationC?.join(', ') || '',
          numeroMobile: p.numeroMobile?.join(', ') || '',
          nnumeroWhatsapp: p.nnumeroWhatsapp?.join(', ') || '',
          demande: p.demande?.join(', ') || '',
          genre: p.genre?.join(', ') || '',
          metier: p.metier || ''
        })
      }
    } catch {
      
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      let data
      if (user.role === 'Agriculteur') {
        data = {
          ...agriculteurForm,
          localisation: agriculteurForm.localisation.split(',').map(d => d.trim()).filter(Boolean),
          available: agriculteurForm.available,
          numeroAgriculmobile: agriculteurForm.numeroAgriculmobile.split(',').map(s => s.trim()).filter(Boolean),
          numeroAgriculwhatsapp: agriculteurForm.numeroAgriculwhatsapp.split(',').map(s => s.trim()).filter(Boolean),
          produit: agriculteurForm.produit.split(',').map(s => s.trim()).filter(Boolean),
          genre: agriculteurForm.genre.split(',').map(s => s.trim()).filter(Boolean)
        }
      } else {
        data = {
          ...consommateurCommercantForm,
          demande: consommateurCommercantForm.demande.split(',').map(s => s.trim()).filter(Boolean),
          localisationC: consommateurCommercantForm.localisationC.split(',').map(d => d.trim()).filter(Boolean),
          numeroMobile: consommateurCommercantForm.numeroMobile.split(',').map(s => s.trim()).filter(Boolean),
          nnumeroWhatsapp: consommateurCommercantForm.nnumeroWhatsapp.split(',').map(s => s.trim()).filter(Boolean),
          genre: consommateurCommercantForm.genre.split(',').map(s => s.trim()).filter(Boolean),
          metier: consommateurCommercantForm.metier.split(',').map(s => s.trim()).filter(Boolean)
        }
      }

      await upsertProfile(data)
      setSuccess('Profil sauvegardé avec succès !')

    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  if (loading || !user) return <div style={styles.loading}>Chargement...</div>

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Mon Profil</h1>
            <p style={styles.subtitle}>
              {user.role === 'Agriculteur' ? 'Agriculteur' : 'Consommateur/Commerçant'} — {user.email}
            </p>
          </div>
          <div style={styles.headerButtons}>
            {user.role === 'Agriculteur' && (
              <button onClick={() => navigate('/matching')} style={styles.matchButton}>
                Voir mes matchs
              </button>
            )}
            <button onClick={handleLogout} style={styles.logoutButton}>
              Déconnexion
            </button>
          </div>
        </div>

        {success && <div style={styles.success}>{success}</div>}
        {error && <div style={styles.error}>{error}</div>}

        {/* Formulaire agriculteur */}
        {user.role === 'Agriculteur' && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>Nom</label>
                <input style={styles.input} value={agriculteurForm.nom}
                  onChange={e => setAgriculteurForm({...agriculteurForm, nom: e.target.value})}
                  placeholder="nom" required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Prénom</label>
                <input style={styles.input} value={agriculteurForm.prénom}
                  onChange={e => setAgriculteurForm({...agriculteurForm, prénom: e.target.value})}
                  placeholder="prénom" required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Localisation</label>
                <input style={styles.input} value={agriculteurForm.localisation}
                  onChange={e => setAgriculteurForm({...agriculteurForm, localisation: e.target.value})}
                  placeholder="Casablanca, Maroc" required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Produit (séparées par des virgules)</label>
                <input style={styles.input} value={agriculteurForm.produit}
                  onChange={e => setAgriculteurForm({...agriculteurForm, produit: e.target.value})}
                  placeholder="Tomates, Oranges, Blé" required />
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Genre</label>
              <select style={styles.input} value={agriculteurForm.genre}
                onChange={e => setAgriculteurForm({...agriculteurForm, genre: e.target.value})}>
                <option value="Feminin">Féminin</option>
                <option value="Masculin">Masculin</option>
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.checkboxLabel}>
                <input type="checkbox" checked={agriculteurForm.available}
                  onChange={e => setAgriculteurForm({...agriculteurForm, available: e.target.checked})} />
                {' '}Disponible ou vérifié
              </label>
            </div>
            <button type="submit" style={saving ? styles.buttonDisabled : styles.button} disabled={saving}>
              {saving ? 'Sauvegarde...' : 'Sauvegarder le profil'}
            </button>
          </form>
        )}

        {/* Formulaire consommateur/Commerçant */}
        {(user.role === 'Consommateur' || user.role === 'Commercant') && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Nom</label>
              <input style={styles.input} value={consommateurCommercantForm.nomC}
                onChange={e => setConsommateurCommercantForm({...consommateurCommercantForm, nomC: e.target.value})}
                placeholder="nom" required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Prénom</label>
              <input style={styles.input} value={consommateurCommercantForm.PrénomC}
                onChange={e => setConsommateurCommercantForm({...consommateurCommercantForm, PrénomC: e.target.value})}
                placeholder="prénom" required />
            </div>
            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>Métier</label>
                <input style={styles.input} value={consommateurCommercantForm.metier}
                  onChange={e => setConsommateurCommercantForm({...consommateurCommercantForm, metier: e.target.value})}
                  placeholder="Développement web" required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Localisation</label>
                <input style={styles.input} value={consommateurCommercantForm.localisationC}
                  onChange={e => setConsommateurCommercantForm({...consommateurCommercantForm, localisationC: e.target.value})}
                  placeholder="Casablanca, Maroc" required />
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Produits recherchés (séparées par des virgules)</label>
              <input style={styles.input} value={consommateurCommercantForm.demande}
                onChange={e => setConsommateurCommercantForm({...consommateurCommercantForm, demande: e.target.value})}
                placeholder="Tomates, Oranges, Blé" required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Genre</label>
              <select style={styles.input} value={consommateurCommercantForm.genre}
                onChange={e => setConsommateurCommercantForm({...consommateurCommercantForm, genre: e.target.value})}>
                <option value="Feminin">Féminin</option>
                <option value="Masculin">Masculin</option>
              </select>
            </div>
            <button type="submit" style={saving ? styles.buttonDisabled : styles.button} disabled={saving}>
              {saving ? 'Sauvegarde...' : 'Sauvegarder le profil'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem' },
  card: {
    backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)', maxWidth: '700px', margin: '0 auto'
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' },
  headerButtons: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
  title: { fontSize: '1.8rem', fontWeight: '700', color: '#1e293b' },
  subtitle: { color: '#64748b', marginTop: '0.25rem' },
  success: { backgroundColor: '#f0fdf4', color: '#16a34a', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' },
  error: { backgroundColor: '#fef2f2', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.2rem' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.9rem', fontWeight: '600', color: '#374151' },
  checkboxLabel: { fontSize: '0.9rem', color: '#374151', cursor: 'pointer' },
  input: { padding: '0.75rem 1rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '1rem' },
  button: { padding: '0.85rem', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  buttonDisabled: { padding: '0.85rem', backgroundColor: '#a5b4fc', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'not-allowed' },
  matchButton: { padding: '0.6rem 1.2rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' },
  logoutButton: { padding: '0.6rem 1.2rem', backgroundColor: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' },
  loading: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#64748b' }
}

export default Profile