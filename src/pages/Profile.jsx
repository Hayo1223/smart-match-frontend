import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, upsertProfile, deleteProfile, uploadPhoto } from '../services/api'
import Swal from "sweetalert2"
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
    numeroAgriculmobile: '+212-', numeroAgriculwhatsapp: '+212-',
    produit: [], genre: '', age: ''
  })

  const [consommateurCommercantForm, setConsommateurCommercantForm] = useState({
    nomC: '', PrenomC: '', localisationC: '', numeroMobile: '+212-',
    numeroWhatsapp: '+212-', demande: [], genre: '', metier: '', age: ''
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
          numeroAgriculmobile: p.numeroAgriculmobile || '+212-',
          numeroAgriculwhatsapp: p.numeroAgriculwhatsapp || '+212-',
          produit: Array.isArray(p.produit) ? p.produit : [],
          genre: p.genre || '',
          age: p.age || ''
        })
        setPhotoPreview(p.photoUrl || null)
      } else {
        setConsommateurCommercantForm({
          nomC: p.nomC || '',
          PrenomC: p.prenomC || '',
          localisationC: p.localisationC || '',
          numeroMobile: p.numeroMobile || '+212-',
          numeroWhatsapp: p.numeroWhatsapp || '+212-',
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
        setConsommateurCommercantForm(prev => ({ ...prev, ...parsed }))
      }
    } catch {
      setError('Erreur lors du chargement de l\'ébauche')
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
        data = { ...agriculteurForm }
      } else {
        data = {
          nomC: consommateurCommercantForm.nomC,
          prenomC: consommateurCommercantForm.PrenomC,
          localisationC: consommateurCommercantForm.localisationC,
          numeroMobile: consommateurCommercantForm.numeroMobile,
          numeroWhatsapp: consommateurCommercantForm.numeroWhatsapp,
          demande: consommateurCommercantForm.demande,
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

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setPhotoPreview(reader.result)
    reader.readAsDataURL(file)
    setUploadingPhoto(true)
    setError('')
    const tailleMax = 5 * 1024 * 1024; 
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
  e.preventDefault();

  const confirmed = await Swal.fire({
    title: "Supprimer le profil ?",
    text: "Cette action est irréversible.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Oui, supprimer",
    cancelButtonText: "Annuler",
  });

  if (!confirmed.isConfirmed) return;

  setSaving(true);
  setError("");
  setSuppressionSuccess("");

  try {
    await deleteProfile();

    if (draftKey) {
      localStorage.removeItem(draftKey);
    }

    setSuppressionSuccess("Profil supprimé avec succès !");

    setTimeout(() => {
      navigate("/", { replace: true });
    }, 1500);

  } catch (err) {
    setError(
      err.response?.data?.error ||
      err.message ||
      "Une erreur est survenue lors de la suppression du profil."
    );
  } finally {
    setSaving(false);
  }
}

  const toggleProduit = (produit, form, setForm, field) => {
    const value = produit.value;
    setForm({
      ...form,
      [field]: form[field]?.includes(value)
        ? form[field].filter(p => p !== value)
        : [...(form[field] || []), value]
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
          checked={selected.includes(produit.value)}
          onChange={() => onToggle(produit, agriculteurForm, setAgriculteurForm, 'produits')}
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
                    <input  type="tel"    className="input"
                        value={agriculteurForm.numeroAgriculmobile}
                            onChange={(e) => { const digits = e.target.value
                                      .replace("+212-", "")
                                      .replace(/\D/g, "")
                                      .slice(0, 9);
                                      setAgriculteurForm({
                                      ...agriculteurForm,
                                      numeroAgriculmobile: `+212-${digits}`,
                                     });
                                        }}
                                          placeholder="+212-600000000"
                                          pattern="^\+212-[5-7][0-9]{8}$"
                                          required/>
                </div>
              <div className="field">
                <label className="label">Numéro WhatsApp</label>
                <input type="tel" className="input" value={agriculteurForm.numeroAgriculwhatsapp}
                  onChange={e => {const digits = e.target.value
                                      .replace("+212-", "")
                                      .replace(/\D/g, "")
                                      .slice(0, 9);
                                      setAgriculteurForm({
                                      ...agriculteurForm,
                                      numeroAgriculwhatsapp: `+212-${digits}`,
                                     });
                                        }}
                                          placeholder="+212-600000000"
                                          pattern="^\+212-[5-7][0-9]{8}$"
                                          required />
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
                <input className="input" value={consommateurCommercantForm.nomC}
                  onChange={e => setConsommateurCommercantForm({...consommateurCommercantForm, nomC: e.target.value})}
                  placeholder="Nom" required />
              </div>
              <div className="field">
                <label className="label">Prénom</label>
                <input className="input" value={consommateurCommercantForm.PrenomC}
                  onChange={e => setConsommateurCommercantForm({...consommateurCommercantForm, PrenomC: e.target.value})}
                  placeholder="Prénom" required />
              </div>
              <div className="field">
                <label className="label">Métier</label>
                <input className="input" value={consommateurCommercantForm.metier}
                  onChange={e => setConsommateurCommercantForm({...consommateurCommercantForm, metier: e.target.value})}
                  placeholder="Restaurateur, Épicier..." required />
              </div>
              <div className="field">
                <label className="label">Localisation</label>
                <SelectVilles
                  value={consommateurCommercantForm.localisationC}
                  onChange={e => setConsommateurCommercantForm({...consommateurCommercantForm, localisationC: e.target.value})}
                />
              </div>
              <div className="field">
                <label className="label">Numéro mobile</label>
                <input type="tel" className="input" value={consommateurCommercantForm.numeroMobile}
                  onChange={e => {const digits = e.target.value
                                      .replace("+212-", "")
                                      .replace(/\D/g, "")
                                      .slice(0, 9);
                                      setConsommateurCommercantForm({
                                        ...consommateurCommercantForm,
                                        numeroMobile: `+212-${digits}`,
                                      });
                                    }}
                                    placeholder="+212-600000000" 
                                    pattern="^\+212-[5-7][0-9]{8}$" 
                                    required />
              </div>
              <div className="field">
                <label className="label">Numéro WhatsApp</label>
                <input type="tel" className="input" value={consommateurCommercantForm.numeroWhatsapp}
                  onChange={e => setConsommateurCommercantForm({...consommateurCommercantForm, numeroWhatsapp: e.target.value})}
                  placeholder="+212-600000000" pattern="^\+212-[5-7][0-9]{8}$" required />
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
                <input className="input" type="number" min="5" max="200"
                  value={consommateurCommercantForm.age}
                  onChange={e => setConsommateurCommercantForm({...consommateurCommercantForm, age: e.target.value})}
                  placeholder="25" required />
              </div>
            </div>

            <div className="field">
              <label className="label">Produits recherchés</label>        
              <CheckboxProduits
                selected={consommateurCommercantForm.demande}                
                onToggle={(p) => toggleProduit(p, consommateurCommercantForm, setConsommateurCommercantForm, 'demande')}
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
