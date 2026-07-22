import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { register } from '../services/api'
import './Register.css'


function Register() {
  const [searchParams] = useSearchParams()
  const roleFromUrl = searchParams.get('role') || 'Agriculteur'
  const [formData, setFormData] = useState({
    email: '', password: '', role: roleFromUrl })

  const navigate = useNavigate()
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
    <div className="container">
      <div className="card">
        <h1 className="title">SOUK</h1>
        <p className="subtitle">Créer votre compte</p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="field">
            <label className="label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="votre@email.com"
              className="input"
              required
            />
          </div>

          <div className="field">
            <label className="label">Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="input"
              required
            />
          </div>

          <div className="field">
            <label className="label">Je suis</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input"
            >
              <option value="Agriculteur">Agriculteur</option>
              <option value="ConsommateurCommercant">Grossiste/Commerçant</option>
            </select>
          </div>

          <button
            type="submit"
            className={loading ? "button-disabled" : "button"}
            disabled={loading}
          >
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>

        <p className="link">
          Déjà un compte ?{' '}
          <Link to="/" className="linkText">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}



export default Register
