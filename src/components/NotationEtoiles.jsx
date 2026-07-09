import { useState } from 'react'
import './NotationEtoiles.css'

function NotationEtoiles({ note, onChange, readOnly = false, taille = 'medium' }) {
  const [survol, setSurvol] = useState(0)

  return (
    <div className={`etoiles etoiles-${taille}`}>
      {[1, 2, 3, 4, 5].map(etoile => (
        <span
          key={etoile}
          className={`etoile ${
            etoile <= (survol || note) ? 'etoile-active' : 'etoile-inactive'
          } ${readOnly ? 'etoile-readonly' : ''}`}
          onMouseEnter={() => !readOnly && setSurvol(etoile)}
          onMouseLeave={() => !readOnly && setSurvol(0)}
          onClick={() => !readOnly && onChange && onChange(etoile)}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export default NotationEtoiles