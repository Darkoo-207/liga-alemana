import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';

function Coleccion() {
  const [partidos, setPartidos] = useState([]);
  const [fecha, setFecha] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://api.openligadb.de/getmatchdata/bl1/2025')
      .then((respuesta) => respuesta.json())
      .then((datos) => setPartidos(datos ?? []))
      .catch((error) => console.error('Error al cargar partidos:', error));
  }, []);

  // Fechas (jornadas) disponibles
  const fechas = [...new Set(partidos.map((p) => p.group?.groupOrderID))]
    .filter(Boolean)
    .sort((a, b) => a - b);

  // Partidos de la fecha elegida, agrupados por día
  const partidosFecha = partidos
    .filter((p) => p.group?.groupOrderID === fecha)
    .sort((a, b) => a.matchDateTime.localeCompare(b.matchDateTime));

  const partidosPorDia = partidosFecha.reduce((grupos, partido) => {
    const dia = partido.matchDateTime.slice(0, 10);
    if (!grupos[dia]) grupos[dia] = [];
    grupos[dia].push(partido);
    return grupos;
  }, {});

  const formatearDia = (dia) =>
    new Date(`${dia}T12:00:00`).toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

  const resultadoFinal = (partido) => {
    if (!partido.matchIsFinished || !partido.matchResults?.length) return null;
    return (
      partido.matchResults.find((r) => r.resultTypeID === 2) ||
      partido.matchResults[partido.matchResults.length - 1]
    );
  };

  if (partidos.length === 0) return <p>Cargando...</p>;

  return (
    <main className="coleccion">
      <h1 className="coleccion-titulo">Enfrentamientos</h1>

      <div className="coleccion-jornadas">
        {fechas.map((numero) => (
          <button
            type="button"
            key={numero}
            className={numero === fecha ? 'activa' : ''}
            onClick={() => setFecha(numero)}
          >
            {numero}
          </button>
        ))}
      </div>

      <h2 className="coleccion-subtitulo">Fecha {fecha}</h2>

      {Object.entries(partidosPorDia).map(([dia, partidosDelDia]) => (
        <section key={dia} className="coleccion-fecha">
          <h3>{formatearDia(dia)}</h3>
          {partidosDelDia.map((partido) => {
            const resultado = resultadoFinal(partido);
            return (
              <div className="coleccion-partido" key={partido.matchID}>
                <div
                  className="coleccion-partido-equipo"
                  onClick={() => navigate(`/equipo/${partido.team1.teamId}`)}
                >
                  <img src={partido.team1.teamIconUrl} alt={partido.team1.teamName} height="30" />
                  <p>{partido.team1.teamName}</p>
                </div>

                <p className="coleccion-partido-marcador">
                  {resultado
                    ? `${resultado.pointsTeam1} - ${resultado.pointsTeam2}`
                    : partido.matchDateTime.slice(11, 16)}
                </p>

                <div
                  className="coleccion-partido-equipo"
                  onClick={() => navigate(`/equipo/${partido.team2.teamId}`)}
                >
                  <img src={partido.team2.teamIconUrl} alt={partido.team2.teamName} height="30" />
                  <p>{partido.team2.teamName}</p>
                </div>
              </div>
            );
          })}
        </section>
      ))}
    </main>
  );
}

export default Coleccion;