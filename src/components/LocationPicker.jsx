import { useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'


delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const CENTRE_MAROC = [31.7917, -7.0926] 
const ZOOM_INITIAL = 6

function ClicHandler({ onClic }) {
  useMapEvents({
    click(e) {
      onClic(e.latlng)
    }
  })
  return null
}

function LocationPicker({ onLocationSelect }) {
  const [position, setPosition] = useState(null)
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')

  const handleClic = async (latlng) => {
    const { lat, lng } = latlng
    setPosition([lat, lng])
    setLoading(true)
    setErreur('')

    try {
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fr`
      )
      if (!response.ok) throw new Error('Erreur de géocodage')

      const data = await response.json()
      const adresse = data.display_name || ''

      onLocationSelect({ lat, lng, adresse })
    } catch (err) {
      setErreur("Impossible de récupérer l'adresse, mais la position a bien été enregistrée")
      
      onLocationSelect({ lat, lng, adresse: '' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="location-picker">
      <p className="location-picker-hint">
        Cliquez sur la carte pour définir votre position précise
      </p>

      <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
        <MapContainer
          center={CENTRE_MAROC}
          zoom={ZOOM_INITIAL}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClicHandler onClic={handleClic} />
          {position && <Marker position={position} />}
        </MapContainer>
      </div>

      {loading && <p className="location-picker-status">Récupération de l'adresse...</p>}
      {erreur && <p className="location-picker-error">{erreur}</p>}
    </div>
  )
}

export default LocationPicker