import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, upsertProfile, deleteProfile } from '../services/api'
import './Profile.css'

function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [suppressionSuccess, setSuppressionSuccess] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [agriculteurForm, setAgriculteurForm] = useState({
    nom: '', prenom: '', localisation: '',
    available: true, numeroAgriculmobile: '', numeroAgriculwhatsapp: '', produit: '', genre: '',
    age: ''
  })

  const [consommateurCommercantForm, setConsommateurCommercantForm] = useState({
    nomC: '', PrenomC: '', localisationC: '', numeroMobile: '', numeroWhatsapp: '',
    demande: '', genre: '', metier: '', age: ''
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
    const p = response.data?.profile ?? {}
    setProfile(p)

    if (currentUser.role === 'Agriculteur') {
      setAgriculteurForm({
        nom: p.nom || '',
        prenom: p.prenom || '',                        
        localisation: p.localisation || '',            
        available: p.available ?? true,
        numeroAgriculmobile: p.numeroAgriculmobile || '',   
        numeroAgriculwhatsapp: p.numeroAgriculwhatsapp || '', 
        produit: Array.isArray(p.produit) ? p.produit.join(', ') : p.produit || '',  
        genre: p.genre || '',                          
        age: p.age || ''
      })
    } else {
      setConsommateurCommercantForm({
        nomC: p.nomC || '',
        PrenomC: p.prenom || '',                      
        localisationC: p.localisationC || '',            
        numeroMobile: p.numeroMobile || '',            
        numeroWhatsapp: p.numeroWhatsapp || '',        
        demande: Array.isArray(p.demande) ? p.demande.join(', ') : p.demande || '',
        genre: p.genre || '',                          
        metier: p.metier || '',
        age: p.age || ''
      })
    }

  } catch (err) {
    if (err.response?.status === 404) return
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
          nom: agriculteurForm.nom,
          prenom: agriculteurForm.prenom,
          localisation: agriculteurForm.localisation,
          available: agriculteurForm.available,
          numeroAgriculmobile: agriculteurForm.numeroAgriculmobile,
          numeroAgriculwhatsapp: agriculteurForm.numeroAgriculwhatsapp,
          produit: agriculteurForm.produit.split(',').map(s => s.trim()).filter(Boolean),
          genre: agriculteurForm.genre,
          age: agriculteurForm.age
        }
      } else {
        data = {
          ...consommateurCommercantForm,
           nomC: consommateurCommercantForm.nomC,
           prenomC: consommateurCommercantForm.PrenomC,
          demande: consommateurCommercantForm.demande.split(',').map(s => s.trim()).filter(Boolean),
          localisationC: consommateurCommercantForm.localisationC,
          numeroMobile: consommateurCommercantForm.numeroMobile,
          numeroWhatsapp: consommateurCommercantForm.numeroWhatsapp,
          genre: consommateurCommercantForm.genre,
          metier: consommateurCommercantForm.metier,
          age: consommateurCommercantForm.age
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

 const handleDeleteProfile = async (e) => {
  e.preventDefault()
  const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer votre profil ?')
  if (!confirmed) return

  setSaving(true)
  setError('')
  setSuppressionSuccess('Suppression en cours...')

  try {
    await deleteProfile()
    setSuppressionSuccess('Profil supprimé avec succès !')
    if (draftKey) localStorage.removeItem(draftKey)
    setTimeout(() => navigate('/'), 2000) 
  } catch (err) {
    setError(err.response?.data?.error || 'Erreur lors de la suppression')
    setSuppressionSuccess('')
  } finally {
    setSaving(false)
  }
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
          <div className="header-buttons">
            {user.role === 'Agriculteur' && (
              <button onClick={() => navigate('/matching')} className="match-button">
                Voir mes matchs
              </button>
            )}
            <button onClick={handleLogout} className="logout-button">
              Déconnexion
            </button>
          </div>
        </div>

        {success && <div className="success">{success}</div>}
        {error && <div className="error">{error}</div>}
        {suppressionSuccess && <div className="success">{suppressionSuccess}</div>}

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
                <input className="input" value={agriculteurForm.prenom}
                  onChange={e => setAgriculteurForm({...agriculteurForm, prenom: e.target.value})}
                  placeholder="prénom" required />
              </div>
              <div className="field">
                <label className="label">Localisation</label>
                <select className="input" value={agriculteurForm.localisation}
                   onChange={e => setAgriculteurForm({...agriculteurForm, localisation: e.target.value})}>
                   <option value="">-- Sélectionner --</option>
                   <option value="Casablanca">Casablanca</option>
                   <option value="Rabat">Rabat</option>
                   <option value="Marrakech">Marrakech</option>
                   <option value="Fès">Fès</option>
                   <option value="Tanger">Tanger</option>
                   <option value="Agadir">Agadir</option>
                   <option value="Meknès">Meknès</option>
                   <option value="Oujda">Oujda</option>
                   <option value="Kénitra">Kénitra</option>
                   <option value="Tétouan">Tétouan</option>
                   <option value="Béni Mellal">Béni Mellal</option>
                   <option value="El Jadida">El Jadida</option>
                 </select>
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
              <label className="label">Âge</label>
              <input className="input" value={agriculteurForm.age}
                onChange={e => setAgriculteurForm({...agriculteurForm, age: e.target.value})}
                placeholder="25" type="number" min="0" required />
            </div>
            <div className="field">
              <label className="checkbox-label">
                <input type="checkbox" checked={agriculteurForm.available}
                  onChange={e => setAgriculteurForm({...agriculteurForm, available: e.target.checked})} />
                {' '}Disponible ou vérifié
              </label>
            </div>
            <button type="submit" className={saving ? "button-disabled" : "button"}>
              {saving ? 'Sauvegarde...' : 'Sauvegarder le profil'}
            </button>
            <button type="button" className={saving ? "button-disabled" : "delete-button"} onClick={handleDeleteProfile}>
              {saving ? 'Suppression...' : 'Supprimer le profil'}
            </button>
          </form>
        )}

        {/* Formulaire consommateur/Commerçant */}
        {(user.role === 'ConsommateurCommercant') && (
          <form onSubmit={handleSubmit} className="form">
            <div className="field">
              <label className="label">Nom</label>
              <input className="input" value={consommateurCommercantForm.nomC}
                onChange={e => setConsommateurCommercantForm({...consommateurCommercantForm, nomC: e.target.value})}
                placeholder="nom" required />
            </div>
            <div className="field">
              <label className="label">Prénom</label>
              <input className="input" value={consommateurCommercantForm.PrenomC}
                onChange={e => setConsommateurCommercantForm({...consommateurCommercantForm, PrenomC: e.target.value})}
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
                 <select className="input" value={consommateurCommercantForm.localisationC}
                   onChange={e => setConsommateurCommercantForm({...consommateurCommercantForm, localisationC: e.target.value})}>
                   <option value="">-- Sélectionner --</option>
                   <option value="Casablanca">Casablanca</option>
                   <option value="Rabat">Rabat</option>
                   <option value="Marrakech">Marrakech</option>
                   <option value="Fès">Fès</option>
                   <option value="Tanger">Tanger</option>
                   <option value="Agadir">Agadir</option>
                   <option value="Meknès">Meknès</option>
                   <option value="Oujda">Oujda</option>
                   <option value="Kénitra">Kénitra</option>
                   <option value="Tétouan">Tétouan</option>
                   <option value="Béni Mellal">Béni Mellal</option>
                   <option value="El Jadida">El Jadida</option>
                 </select>
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
            <div className="field">
              <label className="label">Âge</label>
              <input className="input" value={consommateurCommercantForm.age}
                onChange={e => setConsommateurCommercantForm({...consommateurCommercantForm, age: e.target.value})}
                placeholder="25" type="number" min="0" required />
            </div>
            <button type="submit" className={saving ? "button-disabled" : "button"}>
              {saving ? 'Sauvegarde...' : 'Sauvegarder le profil'}
            </button>
            <button type="button" className={saving ? "button-disabled" : "delete-button"} onClick={handleDeleteProfile}>
              {saving ? 'Suppression...' : 'Supprimer le profil'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}



export default Profile