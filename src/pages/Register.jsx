import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../services/api'
import '../services/Register.css'

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '', role: 'Agriculteur' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await register(formData)
      const { token, user } = response.data

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      navigate('/profile')

    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>SOUK</h1>
        <p style={styles.subtitle}>Créer votre compte</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="votre@email.com"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Je suis</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="Agriculteur">Agriculteur</option>
              <option value="ConsommateurCommercant">Consommateur/Commerçant</option>
            </select>
          </div>

          <button
            type="submit"
            style={loading ? styles.buttonDisabled : styles.button}
            disabled={loading}
          >
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>

        <p style={styles.link}>
          Déjà un compte ?{' '}
          <Link to="/" style={styles.linkText}>Se connecter</Link>
        </p>
      </div>
    </div>
  )
}



export default Register