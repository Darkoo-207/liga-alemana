import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';

function Coleccion() {
  const totalEquipos = 18;
  const [listaCapturados, setListaCapturados] = useState(() => {
    try {
      const guardados = JSON.parse(localStorage.getItem('misEquipos') || '[]');
      return Array.isArray(guardados) ? [...new Set(guardados.map(Number))] : [];
    } catch {
      return [];
    }
  });
  const [equipos, setEquipos] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [jornada, setJornada] = useState(1);
  const [nuevos, setNuevos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://api.openligadb.de/getbltable/bl1/2025')
      .then((respuesta) => respuesta.json())
      .then((datos) => setEquipos(datos ?? []))
      .catch((error) => console.error('Error al cargar equipos:', error));

    fetch('https://api.openligadb.de/getmatchdata/bl1/2025')
      .then((respuesta) => respuesta.json())
      .then((datos) => setPartidos(datos ?? []))
      .catch((error) => console.error('Error al cargar partidos:', error));
  }, []);

  const buscarEquipo = (id) => equipos.find((equipo) => equipo.teamInfoId === id);

  const capturarAleatorios = () => {
    if (equipos.length === 0) return;

    const seleccionados = Array.from(
      { length: 4 },
      () => equipos[Math.floor(Math.random() * equipos.length)].teamInfoId
    );
    const vistos = new Set(listaCapturados);
    const resultados = seleccionados.map((id) => {
      const repetido = vistos.has(id);
      vistos.add(id);
      return { id, repetido };
    });
    const actualizados = [...vistos];

    setListaCapturados(actualizados);
    setNuevos(resultados);
    localStorage.setItem('misEquipos', JSON.stringify(actualizados));
  };

  // Enfrentamientos de la jornada elegida, agrupados por fecha
  const jornadas = [...new Set(partidos.map((p) => p.group?.groupOrderID))]
    .filter(Boolean)
    .sort((a, b) => a - b);

  const partidosJornada = partidos
    .filter((p) => p.group?.groupOrderID === jornada)
    .sort((a, b) => a.matchDateTime.localeCompare(b.matchDateTime));

  const partidosPorFecha = partidosJornada.reduce((grupos, partido) => {
    const fecha = partido.matchDateTime.slice(0, 10);
    if (!grupos[fecha]) grupos[fecha] = [];
    grupos[fecha].push(partido);
    return grupos;
  }, {});

  const formatearFecha = (fecha) =>
    new Date(`${fecha}T12:00:00`).toLocaleDateString('es-CO', {
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

  return (
    <main className="coleccion">
      <h1 className="coleccion-titulo">Colección</h1>
      <p className="coleccion-contador">{listaCapturados.length} <span>/ {totalEquipos}</span></p>
      <button
        className="coleccion-boton"
        onClick={capturarAleatorios}
        disabled={listaCapturados.length >= totalEquipos || equipos.length === 0}
      >
        4 nuevos
      </button>

      {nuevos.length > 0 && <h2 className="coleccion-subtitulo">Tus nuevos equipos</h2>}
      <section className="coleccion-nuevos">
        {nuevos.map(({ id, repetido }, indice) => {
          const equipo = buscarEquipo(id);
          return (
            <div
              key={`${id}-${indice}`}
              className={repetido ? 'coleccion-nuevo repetido' : 'coleccion-nuevo'}
              onClick={() => navigate(`/equipo/${id}`)}
            >
              <p>{id}</p>
              <img
                src={equipo?.teamIconUrl}
                alt={equipo?.teamName || `Equipo ${id}`}
                width="60"
                height="60"
              />
              <p>{equipo?.teamName || ''}</p>
            </div>
          );
        })}
      </section>

      <section className="coleccion-album">
        {equipos.map((equipo) => {
          const id = equipo.teamInfoId;
          const capturado = listaCapturados.includes(id);
          return (
            <div
              key={id}
              className={capturado ? 'coleccion-pokemon capturado' : 'coleccion-pokemon'}
              onClick={() => capturado && navigate(`/equipo/${id}`)}
            >
              {capturado && (
                <img
                  src={equipo.teamIconUrl}
                  width="auto"
                  height="45"
                  loading="lazy"
                  alt={equipo.teamName}
                />
              )}
              <p>{id}</p>
            </div>
          );
        })}
      </section>

      <h2 className="coleccion-subtitulo">Enfrentamientos</h2>
      <div className="coleccion-jornadas">
        {jornadas.map((numero) => (
          <button
            type="button"
            key={numero}
            className={numero === jornada ? 'activa' : ''}
            onClick={() => setJornada(numero)}
          >
            {numero}
          </button>
        ))}
      </div>

      {partidos.length === 0 && <p>Cargando enfrentamientos...</p>}

      {Object.entries(partidosPorFecha).map(([fecha, partidosDelDia]) => (
        <section key={fecha} className="coleccion-fecha">
          <h3>{formatearFecha(fecha)}</h3>
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