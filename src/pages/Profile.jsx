import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, upsertProfile } from '../services/api'
import '../src/Profile.css'

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
    nomC: '', PrénomC: '', localisation: '', numeroMobile: '', numeroWhatsapp: '',
    demande: '', genre: '', metier: ''
  })

  
  const draftKey = user ? `profileDraft_${user.id}_${user.role}` : null

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
      const p = response.data?.profile?? {}
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
          localisation: p.localisation?.join(', ') || '',
          numeroMobile: p.numeroMobile?.join(', ') || '',
          numeroWhatsapp: p.numeroWhatsapp?.join(', ') || '',
          demande: p.demande?.join(', ') || '',
          genre: p.genre?.join(', ') || '',
          metier: p.metier?.join(', ') || ''
        })
      }
    } catch (err) {
  if (err.response?.status === 404) {
    // Le profil n'existe pas encore : formulaire vide
    return
  }

  setError(err.response?.data?.error || 'Erreur lors du chargement du profil')

    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    if (!draftKey || loading) return
    const draft = localStorage.getItem(draftKey)
    if (!draft) return

    try {
      const parsed = JSON.parse(draft)
      if (user.role === 'Agriculteur') {
        setAgriculteurForm(prev => ({ ...prev, ...parsed }))
      } else {
        setConsommateurCommercantForm(prev => ({ ...prev, ...parsed }))
      }
    } catch {

      localStorage.removeItem(draftKey)
    }
  }, [draftKey, loading])


  useEffect(() => {
    if (!draftKey || loading || !user) return
    const formToSave = user.role === 'Agriculteur' ? agriculteurForm : consommateurCommercantForm
    const timeout = setTimeout(() => {
      localStorage.setItem(draftKey, JSON.stringify(formToSave))
    }, 500)
    return () => clearTimeout(timeout)
  }, [agriculteurForm, consommateurCommercantForm, draftKey, loading, user])

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
          localisation: consommateurCommercantForm.localisation.split(',').map(d => d.trim()).filter(Boolean),
          numeroMobile: consommateurCommercantForm.numeroMobile.split(',').map(s => s.trim()).filter(Boolean),
          numeroWhatsapp: consommateurCommercantForm.numeroWhatsapp.split(',').map(s => s.trim()).filter(Boolean),
          genre: consommateurCommercantForm.genre.split(',').map(s => s.trim()).filter(Boolean),
          metier: consommateurCommercantForm.metier.split(',').map(s => s.trim()).filter(Boolean)
        }
      }

      await upsertProfile(data)
      setSuccess('Profil sauvegardé avec succès !')
      if (draftKey) localStorage.removeItem(draftKey) 
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

  if (loading || !user) return <div className="loading">Chargement...</div>

  return (
    <div className="container">
      <div className="card">

        {/* Header */}
        <div className="header">
          <div>
            <h1 className="title">Mon Profil</h1>
            <p className="subtitle">
              {user.role === 'Agriculteur' ? 'Agriculteur' : 'Consommateur/Commerçant'} — {user.email}
            </p>
          </div>
          <div className="headerButtons">
            {user.role === 'Agriculteur' && (
              <button onClick={() => navigate('/matching')} className="matchButton">
                Voir mes matchs
              </button>
            )}
            <button onClick={handleLogout} className="logoutButton">
              Déconnexion
            </button>
          </div>
        </div>

        {success && <div className="success">{success}</div>}
        {error && <div className="error">{error}</div>}

        {/* Formulaire agriculteur */}
        {user.role === 'Agriculteur' && (
          <form onSubmit={handleSubmit} className="form">
            <div className="grid">
              <div className="field">
                <label className="label">Nom</label>
                <input className="input" value={agriculteurForm.nom}
                  onChange={e => setAgriculteurForm({...agriculteurForm, nom: e.target.value})}
                  placeholder="nom" required />
              </div>
              <div className="field">
                <label className="label">Prénom</label>
                <input className="input" value={agriculteurForm.prénom}
                  onChange={e => setAgriculteurForm({...agriculteurForm, prénom: e.target.value})}
                  placeholder="prénom" required />
              </div>
              <div className="field">
                <label className="label">Localisation</label>
                <input className="input" value={agriculteurForm.localisation}
                  onChange={e => setAgriculteurForm({...agriculteurForm, localisation: e.target.value})}
                  placeholder="Casablanca, Maroc" required />
              </div>
              <div className="field">
                <label className="label">Produit (séparées par des virgules)</label>
                <input className="input" value={agriculteurForm.produit}
                  onChange={e => setAgriculteurForm({...agriculteurForm, produit: e.target.value})}
                  placeholder="Tomates, Oranges, Blé" required />
              </div>
              <div className="field">
                <label className="label">Numéro mobile</label>
                <input type="tel" className="input" value={agriculteurForm.numeroAgriculmobile}
                  onChange={e => setAgriculteurForm({...agriculteurForm, numeroAgriculmobile: e.target.value})}
                  placeholder="+212-600000000" pattern="\+?[0-9 -]{9,17}" required />
              </div>
              <div className="field">
                <label className="label">Numéro WhatsApp</label>
                <input type="tel" className="input" value={agriculteurForm.numeroAgriculwhatsapp}
                  onChange={e => setAgriculteurForm({...agriculteurForm, numeroAgriculwhatsapp: e.target.value})}
                  placeholder="+212-600000000" pattern="\+?[0-9 -]{9,17}" required />
              </div>
            </div>
            <div className="field">
              <label className="label">Genre</label>
              <select className="input" value={agriculteurForm.genre}
                onChange={e => setAgriculteurForm({...agriculteurForm, genre: e.target.value})}>
                <option value="">-- Sélectionner --</option>
                <option value="Feminin">Féminin</option>
                <option value="Masculin">Masculin</option>
              </select>
            </div>
            <div className="field">
              <label className="checkboxLabel">
                <input type="checkbox" checked={agriculteurForm.available}
                  onChange={e => setAgriculteurForm({...agriculteurForm, available: e.target.checked})} />
                {' '}Disponible ou vérifié
              </label>
            </div>
            <button type="submit" className={saving ? buttonDisabled : button} disabled={saving}>
              {saving ? 'Sauvegarde...' : 'Sauvegarder le profil'}
            </button>
          </form>
        )}

        {/* Formulaire consommateur/Commerçant */}
        {(user.role === 'Consommateur' || user.role === 'Commercant') && (
          <form onSubmit={handleSubmit} className="form">
            <div className="field">
              <label className="label">Nom</label>
              <input className="input" value={consommateurCommercantForm.nomC}
                onChange={e => setConsommateurCommercantForm({...consommateurCommercantForm, nomC: e.target.value})}
                placeholder="nom" required />
            </div>
            <div className="field">
              <label className="label">Prénom</label>
              <input className="input" value={consommateurCommercantForm.PrénomC}
                onChange={e => setConsommateurCommercantForm({...consommateurCommercantForm, PrénomC: e.target.value})}
                placeholder="prénom" required />
            </div>
            <div className="grid">
              <div className="field">
                <label className="label">Métier</label>
                <input className="input" value={consommateurCommercantForm.metier}
                  onChange={e => setConsommateurCommercantForm({...consommateurCommercantForm, metier: e.target.value})}
                  placeholder="Développement web" required />
              </div>
              <div className="field">
                <label className="label">Localisation</label>
                <input className="input" value={consommateurCommercantForm.localisation}
                  onChange={e => setConsommateurCommercantForm({...consommateurCommercantForm, localisation: e.target.value})}
                  placeholder="Casablanca, Maroc" required />
              </div>
              <div className="field">
                <label className="label">Numéro mobile</label>
                <input type="tel" className="input" value={consommateurCommercantForm.numeroMobile}
                  onChange={e => setConsommateurCommercantForm({...consommateurCommercantForm, numeroMobile: e.target.value})}
                  placeholder="+212-600000000" pattern="\+?[0-9 -]{9,17}" required />
              </div>
              <div className="field">
                <label className="label">Numéro WhatsApp</label>
                <input type="tel" className="input" value={consommateurCommercantForm.numeroWhatsapp}
                  onChange={e => setConsommateurCommercantForm({...consommateurCommercantForm, numeroWhatsapp: e.target.value})}
                  placeholder="+212-600000000" pattern="\+?[0-9 -]{9,17}" required />
              </div>
            </div>
            <div className="field">
              <label className="label">Produits recherchés (séparées par des virgules)</label>
              <input className="input" value={consommateurCommercantForm.demande}
                onChange={e => setConsommateurCommercantForm({...consommateurCommercantForm, demande: e.target.value})}
                placeholder="Tomates, Oranges, Blé" required />
            </div>
            <div className="field">
              <label className="label">Genre</label>
              <select className="input" value={consommateurCommercantForm.genre}
                onChange={e => setConsommateurCommercantForm({...consommateurCommercantForm, genre: e.target.value})}>
                <option value="">-- Sélectionner --</option>
                <option value="Feminin">Féminin</option>
                <option value="Masculin">Masculin</option>
              </select>
            </div>
            <button type="submit" className={saving ? buttonDisabled : button} disabled={saving}>
              {saving ? 'Sauvegarde...' : 'Sauvegarder le profil'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}



export default Profile