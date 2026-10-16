import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css'

function Favoritos() {
  const navigate = useNavigate();
  const [favoritos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('favoritosEquipos') || '[]');
    } catch {
      return [];
    }
  });

  return (
    <>
      <div className="c-lista">
        {favoritos.map((equipo) => (
          <div
            key={equipo.id}
            className="c-lista-pokemon"
            onClick={() => navigate(`/equipo/${equipo.id}`)}
          >
            <p>{equipo.id}</p>
            <p>{equipo.nombre}</p>
            <img
              src={equipo.icono}
              alt={`Equipo ${equipo.nombre}`}
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

export default Favoritos