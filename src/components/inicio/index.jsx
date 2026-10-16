import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './style.css'

function Inicio() {
  const [todoslosequipos, setTodoslosequipos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [zona, setZona] = useState('All')
  const navigate = useNavigate()

  useEffect(() => {
    const cargarEquipos = async () => {
      try {
        const response = await fetch('https://api.openligadb.de/getbltable/bl1/2025')
        const responseData = await response.json()
        // La API ya devuelve la tabla ordenada, la posición es el índice + 1
        const equipos = (responseData ?? []).map((equipo, index) => ({
          ...equipo,
          posicion: index + 1
        }))
        setTodoslosequipos(equipos)
      } catch (error) {
        console.error('Error:', error)
      }
    }

    cargarEquipos()
  }, [])

  const zonas = {
    All: [1, 18],
    Champions: [1, 4],
    Europa: [5, 6],
    'Mitad de tabla': [7, 15],
    Descenso: [16, 18]
  }

  const [desde, hasta] = zonas[zona]
  const equiposPorZona = todoslosequipos.filter(
    (equipo) => equipo.posicion >= desde && equipo.posicion <= hasta
  )

  const resultados = busqueda.trim().length >= 3 && isNaN(busqueda)
    ? equiposPorZona.filter((equipo) =>
        equipo.teamName.toLowerCase().includes(busqueda.toLowerCase())
      )
    : equiposPorZona

  if (todoslosequipos.length === 0) return <p>Cargando...</p>
  if (resultados.length === 0) return <p>No se encontraron equipos.</p>

  return (
    <>
      <div className="c-filtro">
        {Object.keys(zonas).map((unaZona, index) => (
          <button type="button" key={index} onClick={() => setZona(unaZona)}>
            {unaZona}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Buscar equipo"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="c-buscador"
      />

      <div className="c-lista">
      {resultados.map((equipo) => (
        <div className="c-lista-pokemon" key={equipo.teamInfoId} onClick={() => navigate(`/equipo/${equipo.teamInfoId}`)}>
          <p>{equipo.posicion}</p>
          <p>{equipo.teamName}</p>

          <img
            src={equipo.teamIconUrl}
            alt={`Equipo ${equipo.teamName}`}
            width="auto"
            height="60"
            loading="lazy"
          />
        </div>
      ))}
      </div>
    </>
  )
}

export default Inicio