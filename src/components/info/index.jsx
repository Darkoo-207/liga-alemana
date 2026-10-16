import imagenInfo from '../../assets/Bundesapi.png'
import './style.css'

function Info() {
  return (
    <main className="info">
      <img
        className="info-imagen"
        src={imagenInfo}
        alt="Bundes-API: lo mejor del fútbol alemán en una sola página"
      />
    </main>
  )
}

export default Info
