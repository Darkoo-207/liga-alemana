import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';

const TOTAL_JORNADAS = 34;

const leer = (clave, defecto) => {
  try {
    return JSON.parse(localStorage.getItem(clave)) ?? defecto;
  } catch {
    return defecto;
  }
};

function Coleccion() {
  const [jornada, setJornada] = useState(1);
  const [partidos, setPartidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [predicciones, setPredicciones] = useState(() => leer('quiniela', {}));

  const [puntosPorJornada, setPuntosPorJornada] = useState(() => leer('quinielaPuntos', {}));
  const navigate = useNavigate();

  const revelada = puntosPorJornada[jornada] !== undefined;
  const puntosTotales = Object.values(puntosPorJornada).reduce((a, b) => a + b, 0);

  useEffect(() => {
    setCargando(true);
    fetch(`https://api.openligadb.de/getmatchdata/bl1/2025/${jornada}`)
      .then((r) => r.json())
      .then((datos) => setPartidos(datos))
      .catch((e) => console.error('Error al cargar partidos:', e))
      .finally(() => setCargando(false));
  }, [jornada]);

  useEffect(() => {
    localStorage.setItem('quiniela', JSON.stringify(predicciones));
  }, [predicciones]);

  useEffect(() => {
    localStorage.setItem('quinielaPuntos', JSON.stringify(puntosPorJornada));
  }, [puntosPorJornada]);

  const resultadoFinal = (partido) =>
    partido.matchResults?.find((r) => r.resultTypeID === 2) || null;

  const cambiarPrediccion = (id, lado, valor) => {
    const num = valor === '' ? '' : Math.max(0, Number(valor));
    setPredicciones((prev) => ({
      ...prev,
      [id]: { ...prev[id], [lado]: num },
    }));
  };

  const prediccionCompleta = (partido) => {
    const p = predicciones[partido.matchID];
    return p && p.l !== undefined && p.l !== '' && p.v !== undefined && p.v !== '';
  };

  const todosLlenos = partidos.length > 0 && partidos.every(prediccionCompleta);

  const calcularPuntos = (partido) => {
    const pred = predicciones[partido.matchID];
    const real = resultadoFinal(partido);
    if (!real || !prediccionCompleta(partido)) return 0;
    if (pred.l === real.pointsTeam1 && pred.v === real.pointsTeam2) return 3;
    const signo = (a, b) => Math.sign(a - b);
    return signo(pred.l, pred.v) === signo(real.pointsTeam1, real.pointsTeam2) ? 1 : 0;
  };

  const verResultados = () => {
    const total = partidos.reduce((acc, p) => acc + calcularPuntos(p), 0);
    setPuntosPorJornada((prev) => ({ ...prev, [jornada]: total }));
  };

  const reiniciar = () => {
    if (!window.confirm('¿Borrar todas tus predicciones y puntos?')) return;
    setPredicciones({});
    setPuntosPorJornada({});
  };

  return (
    <main className="coleccion">
      <h1 className="coleccion-titulo">Quiniela Bundesliga</h1>

      <p className="coleccion-contador">
        {puntosTotales} <span>pts totales</span>
      </p>

      <div className="coleccion-jornadas">
        <button disabled={jornada === 1} onClick={() => setJornada(jornada - 1)}>◀</button>
        <span>Jornada {jornada} / {TOTAL_JORNADAS}</span>
        <button disabled={jornada === TOTAL_JORNADAS} onClick={() => setJornada(jornada + 1)}>▶</button>
      </div>

      {revelada && (
        <p className="coleccion-subtitulo">
          Hiciste {puntosPorJornada[jornada]} pts en esta jornada
        </p>
      )}

      {cargando && <p>Cargando partidos...</p>}

      <section className="coleccion-nuevos">
        {partidos.map((p) => {
          const real = resultadoFinal(p);
          const pred = predicciones[p.matchID] || {};
          const puntos = revelada ? calcularPuntos(p) : null;

          return (
            <div
              key={p.matchID}
              className={`coleccion-nuevo ${puntos === 3 ? 'exacto' : puntos === 1 ? 'acierto' : puntos === 0 ? 'fallo' : ''}`}
            >
              <div className="partido-equipo" onClick={() => navigate(`/equipo/${p.team1.teamId}`)}>
                <img src={p.team1.teamIconUrl} alt={p.team1.teamName} height="40" />
                <p>{p.team1.shortName || p.team1.teamName}</p>
              </div>

              <div className="partido-marcador">
                <input
                  type="number"
                  min="0"
                  disabled={revelada}
                  value={pred.l ?? ''}
                  onChange={(e) => cambiarPrediccion(p.matchID, 'l', e.target.value)}
                />
                <span>-</span>
                <input
                  type="number"
                  min="0"
                  disabled={revelada}
                  value={pred.v ?? ''}
                  onChange={(e) => cambiarPrediccion(p.matchID, 'v', e.target.value)}
                />
              </div>

              <div className="partido-equipo" onClick={() => navigate(`/equipo/${p.team2.teamId}`)}>
                <img src={p.team2.teamIconUrl} alt={p.team2.teamName} height="40" />
                <p>{p.team2.shortName || p.team2.teamName}</p>
              </div>

              {revelada && real && (
                <p className="partido-estado">
                  Real: {real.pointsTeam1} - {real.pointsTeam2} · {puntos} pts
                </p>
              )}
            </div>
          );
        })}
      </section>

      <div className="coleccion-acciones">
        {!revelada ? (
          <button className="coleccion-boton" disabled={!todosLlenos} onClick={verResultados}>
            {todosLlenos ? 'Ver resultados' : 'Completa todos los marcadores'}
          </button>
        ) : (
          <button
            className="coleccion-boton"
            disabled={jornada === TOTAL_JORNADAS}
            onClick={() => setJornada(jornada + 1)}
          >
            Siguiente jornada
          </button>
        )}
        <button onClick={reiniciar}>Reiniciar quiniela</button>
      </div>
    </main>
  );
}

export default Coleccion;