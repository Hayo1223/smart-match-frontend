import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, upsertProfile, deleteProfile, uploadPhoto } from '../services/api'
import './Profile.css'


const PRODUITS = [{
  label: 'Tomates', value: 'Tomates', Image: 'https://cdn-icons-png.flaticon.com/512/135/135763.png'
}, {
  label: 'Oranges', value: 'Oranges', Image: 'https://cdn-icons-png.flaticon.com/512/135/135763.png'
}, {
  label: 'Blé', value: 'Blé', Image: 'https://cdn-icons-png.flaticon.com/512/135/135763.png'
}, {
  label: 'Pommes de terre', value: 'Pommes de terre', Image: 'https://cdn-icons-png.flaticon.com/512/135/135763.png'
}, {
  label: 'Oignons', value: 'Oignons', Image: 'https://cdn-icons-png.flaticon.com/512/135/135763.png'
}, {
  label: 'Carottes', value: 'Carottes', Image: 'https://cdn-icons-png.flaticon.com/512/135/135763.png'
}, {
  label: 'Courgettes', value: 'Courgettes', Image: 'https://cdn-icons-png.flaticon.com/512/135/135763.png'
}, {
  label: 'Aubergines', value: 'Aubergines', Image: 'https://cdn-icons-png.flaticon.com/512/135/135763.png'
}, {
  label: 'Poivrons', value: 'Poivrons', Image: 'https://cdn-icons-png.flaticon.com/512/135/135763.png'
}, {
  label: 'Concombres', value: 'Concombres', Image: 'https://cdn-icons-png.flaticon.com/512/135/135763.png'
}, {
  label: 'Pastèques', value: 'Pastèques', Image: 'https://cdn-icons-png.flaticon.com/512/135/135763.png'
}, {
  label: 'Melons', value: 'Melons', Image: 'https://cdn-icons-png.flaticon.com/512/135/135763.png'
}, {
  label: 'Raisins', value: 'Raisins', Image: 'https://cdn-icons-png.flaticon.com/512/135/135763.png'
}, {
  label: 'Figues', value: 'Figues', Image: 'https://cdn-icons-png.flaticon.com/512/135/135763.png'
}, {
  label: 'Olives', value: 'Olives', Image: 'https://cdn-icons-png.flaticon.com/512/135/135763.png'
}, {
  label: 'Dattes', value: 'Dattes', Image: 'https://cdn-icons-png.flaticon.com/512/135/135763.png'
}, {
  label: 'Amandes', value: 'Amandes', Image: 'https://cdn-icons-png.flaticon.com/512/135/135763.png'
}, {
  label: 'Grenades', value: 'Grenades', Image: 'https://cdn-icons-png.flaticon.com/512/135/135763.png'
}, {
  label: 'Citrons', value: 'Citrons', Image: 'https://cdn-icons-png.flaticon.com/512/135/135763.png'
}, {
  label: 'Mandarines', value: 'Mandarines', Image: 'https://cdn-icons-png.flaticon.com/512/135/135763.png'
}]


const VILLES = [
  'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger',
  'Agadir', 'Meknès', 'Oujda', 'Kénitra', 'Tétouan',
  'Béni Mellal', 'El Jadida'
]

function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [suppressionSuccess, setSuppressionSuccess] = useState('')
  const [error, setError] = useState('')
  const [photoPreview, setPhotoPreview] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const [agriculteurForm, setAgriculteurForm] = useState({
    nom: '', prenom: '', localisation: '', available: true,
    numeroAgriculmobile: '', numeroAgriculwhatsapp: '',
    produit: [], genre: '', age: ''
  })

  const [consommateurForm, setConsommateurForm] = useState({
    nomC: '', PrenomC: '', localisationC: '', numeroMobile: '',
    numeroWhatsapp: '', demande: [], genre: '', metier: '', age: ''
  })

  const draftKey = user ? `profileDraft_${user.id}_${user.role}` : null

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null')
    if (!storedUser) { navigate('/'); return }
    setUser(storedUser)
    fetchProfile(storedUser)
  }, [])

  const fetchProfile = async (currentUser) => {
    try {
      const response = await getProfile()
      const p = response.data?.profile ?? {}

      if (currentUser.role === 'Agriculteur') {
        setAgriculteurForm({
          nom: p.nom || '',
          prenom: p.prenom || '',
          localisation: p.localisation || '',
          available: p.available ?? true,
          numeroAgriculmobile: p.numeroAgriculmobile || '',
          numeroAgriculwhatsapp: p.numeroAgriculwhatsapp || '',
          produit: Array.isArray(p.produit) ? p.produit : [],
          genre: p.genre || '',
          age: p.age || ''
        })
        setPhotoPreview(p.photoUrl || null)
      } else {
        setConsommateurForm({
          nomC: p.nomC || '',
          PrenomC: p.prenomC || '',
          localisationC: p.localisationC || '',
          numeroMobile: p.numeroMobile || '',
          numeroWhatsapp: p.numeroWhatsapp || '',
          demande: Array.isArray(p.demande) ? p.demande : [],
          genre: p.genre || '',
          metier: p.metier || '',
          age: p.age || ''
        })
        setPhotoPreview(p.photoUrl || null)
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
        setConsommateurForm(prev => ({ ...prev, ...parsed }))
      }
    } catch {
      setError('Erreur lors du chargement de l\'ébauche')
      localStorage.removeItem(draftKey)
    }
  }, [draftKey, loading])


  useEffect(() => {
    if (!draftKey || loading || !user) return
    const formToSave = user.role === 'Agriculteur' ? agriculteurForm : consommateurForm
    const timeout = setTimeout(() => {
      localStorage.setItem(draftKey, JSON.stringify(formToSave))
    }, 500)
    return () => clearTimeout(timeout)
  }, [agriculteurForm, consommateurForm, draftKey, loading, user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      let data
      if (user.role === 'Agriculteur') {
        data = { ...agriculteurForm }
      } else {
        data = {
          nomC: consommateurForm.nomC,
          prenomC: consommateurForm.PrenomC,
          localisationC: consommateurForm.localisationC,
          numeroMobile: consommateurForm.numeroMobile,
          numeroWhatsapp: consommateurForm.numeroWhatsapp,
          demande: consommateurForm.demande,
          genre: consommateurForm.genre,
          metier: consommateurForm.metier,
          age: consommateurForm.age
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

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setPhotoPreview(reader.result)
    reader.readAsDataURL(file)
    setUploadingPhoto(true)
    setError('')
    const tailleMax = 5 * 1024 * 1024; // 5 Mo

    if (file.size > tailleMax) {
    alert("L'image ne doit pas dépasser 5 Mo.");
    return;
     }
    try {
      const formData = new FormData()
      formData.append('photo', file)
      const response = await uploadPhoto(formData)
      setPhotoPreview(response.data.photoUrl)
      setSuccess('Photo uploadée avec succès !')
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'upload")
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const handleDeleteProfile = async (e) => {
    e.preventDefault()
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer votre profil ?')) return
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

  const toggleProduit = (produit, form, setForm, field) => {
    const current = form[field]
    setForm({
      ...form,
      [field]: current.includes(produit)
        ? current.filter(p => p !== produit)
        : [...current, produit]
    })
  }

  const PhotoUpload = () => {
  return (
    <div className="field">
      <label className="label">Photo de profil</label>

      <div className="photo-upload-container">
        {photoPreview ? (
          <img
            src={photoPreview}
            alt="Photo de profil"
            className="photo-preview"
            loading="lazy"
          />
        ) : (
          <div className="photo-placeholder">
            <span>Ajouter</span>
            <p>Aucune photo sélectionnée</p>
          </div>
        )}

        <label className="photo-upload-label">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoUpload}
            hidden
            disabled={uploadingPhoto}
          />

          {uploadingPhoto
            ? "Upload en cours..."
            : "Choisir une photo"}
        </label>
      </div>
    </div>
  );
};

  const SelectVilles = ({ value, onChange }) => (
    <select className="input" value={value} onChange={onChange}>
      <option value="">-- Sélectionner --</option>
      {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
    </select>
  )

 const CheckboxProduits = ({ selected, onToggle }) => (
  <div className="checkbox-group">
    {PRODUITS.map((produit) => (
      <label key={produit.value} className="checkbox-item">

        <input
          type="checkbox"
          checked={selected.includes(produit)}
          onChange={() => onToggle(produit)}
        />

        <img
          src={produit.Image}
          alt={produit.label}
          width="40"
          height="40"
        />

        <span>{produit.label}</span>

      </label>
    ))}
  </div>
)

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

        {/* Formulaire Agriculteur */}
        {user.role === 'Agriculteur' && (
          <form onSubmit={handleSubmit} className="form">

            <div className="grid">
              <div className="field">
                <label className="label">Nom</label>
                <input className="input" value={agriculteurForm.nom}
                  onChange={e => setAgriculteurForm({...agriculteurForm, nom: e.target.value})}
                  placeholder="Nom" required />
              </div>
              <div className="field">
                <label className="label">Prénom</label>
                <input className="input" value={agriculteurForm.prenom}
                  onChange={e => setAgriculteurForm({...agriculteurForm, prenom: e.target.value})}
                  placeholder="Prénom" required />
              </div>
              <div className="field">
                <label className="label">Localisation</label>
                <SelectVilles
                  value={agriculteurForm.localisation}
                  onChange={e => setAgriculteurForm({...agriculteurForm, localisation: e.target.value})}
                />
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
                <input className="input" type="number" min="5" max="200"
                  value={agriculteurForm.age}
                  onChange={e => setAgriculteurForm({...agriculteurForm, age: e.target.value})}
                  placeholder="25" required />
              </div>
            </div>

            <div className="field">
              <label className="label">Produits vendus</label>              
              <CheckboxProduits
                selected={agriculteurForm.produit}
                onToggle={(p) => toggleProduit(p, agriculteurForm, setAgriculteurForm, 'produit')}
              />
            </div>

            <div className="field">
              <label className="checkbox-label">
                <input type="checkbox" checked={agriculteurForm.available}
                  onChange={e => setAgriculteurForm({...agriculteurForm, available: e.target.checked})} />
                {' '}Disponible ou vérifié
              </label>
            </div>

            <PhotoUpload />
            <small>Formats acceptés : JPG, PNG, WEBP (5 Mo maximum)</small>

            <button type="submit" className={saving ? "button-disabled" : "button"} disabled={saving}>
              {saving ? 'Sauvegarde...' : 'Sauvegarder le profil'}
            </button>
            <button type="button" className={saving ? "button-disabled" : "delete-button"} onClick={handleDeleteProfile} disabled={saving}>
              {saving ? 'Suppression...' : 'Supprimer le profil'}
            </button>

          </form>
        )}

        {/* Formulaire ConsommateurCommercant */}
        {user.role === 'ConsommateurCommercant' && (
          <form onSubmit={handleSubmit} className="form">

            <div className="grid">
              <div className="field">
                <label className="label">Nom</label>
                <input className="input" value={consommateurForm.nomC}
                  onChange={e => setConsommateurForm({...consommateurForm, nomC: e.target.value})}
                  placeholder="Nom" required />
              </div>
              <div className="field">
                <label className="label">Prénom</label>
                <input className="input" value={consommateurForm.PrenomC}
                  onChange={e => setConsommateurForm({...consommateurForm, PrenomC: e.target.value})}
                  placeholder="Prénom" required />
              </div>
              <div className="field">
                <label className="label">Métier</label>
                <input className="input" value={consommateurForm.metier}
                  onChange={e => setConsommateurForm({...consommateurForm, metier: e.target.value})}
                  placeholder="Restaurateur, Épicier..." required />
              </div>
              <div className="field">
                <label className="label">Localisation</label>
                <SelectVilles
                  value={consommateurForm.localisationC}
                  onChange={e => setConsommateurForm({...consommateurForm, localisationC: e.target.value})}
                />
              </div>
              <div className="field">
                <label className="label">Numéro mobile</label>
                <input type="tel" className="input" value={consommateurForm.numeroMobile}
                  onChange={e => setConsommateurForm({...consommateurForm, numeroMobile: e.target.value})}
                  placeholder="+212-600000000" pattern="\+?[0-9 -]{9,17}" required />
              </div>
              <div className="field">
                <label className="label">Numéro WhatsApp</label>
                <input type="tel" className="input" value={consommateurForm.numeroWhatsapp}
                  onChange={e => setConsommateurForm({...consommateurForm, numeroWhatsapp: e.target.value})}
                  placeholder="+212-600000000" pattern="\+?[0-9 -]{9,17}" required />
              </div>
              <div className="field">
                <label className="label">Genre</label>
                <select className="input" value={consommateurForm.genre}
                  onChange={e => setConsommateurForm({...consommateurForm, genre: e.target.value})}>
                  <option value="">-- Sélectionner --</option>
                  <option value="Feminin">Féminin</option>
                  <option value="Masculin">Masculin</option>
                </select>
              </div>
              <div className="field">
                <label className="label">Âge</label>
                <input className="input" type="number" min="5" max="200"
                  value={consommateurForm.age}
                  onChange={e => setConsommateurForm({...consommateurForm, age: e.target.value})}
                  placeholder="25" required />
              </div>
            </div>

            <div className="field">
              <label className="label">Produits recherchés</label>        
              <CheckboxProduits
                selected={consommateurForm.demande}                
                onToggle={(p) => toggleProduit(p, consommateurForm, setConsommateurForm, 'demande')}
              />
            </div>

            <PhotoUpload />
            <small>Formats acceptés : JPG, PNG, WEBP (5 Mo maximum)</small>

            <button type="submit" className={saving ? "button-disabled" : "button"} disabled={saving}>
              {saving ? 'Sauvegarde...' : 'Sauvegarder le profil'}
            </button>
            <button type="button" className={saving ? "button-disabled" : "delete-button"} onClick={handleDeleteProfile} disabled={saving}>
              {saving ? 'Suppression...' : 'Supprimer le profil'}
            </button>

          </form>
        )}

      </div>
    </div>
  )
}

export default Profile
