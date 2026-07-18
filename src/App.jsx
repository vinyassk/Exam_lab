import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [buildTime, setBuildTime] = useState('')
  const [podName, setPodName] = useState('')

  useEffect(() => {
    setBuildTime(new Date().toLocaleString())
    setPodName(import.meta.env.VITE_POD_NAME || 'local-dev')
  }, [])

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>React CI/CD Pipeline Demo</h1>
        <p className="subtitle">Jenkins + Docker + Kubernetes</p>
      </header>

      <main className="main-content">
        <div className="card">
          <h2>Pipeline Status</h2>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Build Time:</span>
              <span className="status-value">{buildTime}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Pod Name:</span>
              <span className="status-value">{podName}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Status:</span>
              <span className="status-value success">Deployed</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Interactive Counter</h2>
          <p>Click the button to test React functionality:</p>
          <button
            className="counter-btn"
            onClick={() => setCount((count) => count + 1)}
          >
            Count: {count}
          </button>
        </div>

        <div className="card">
          <h2>Tech Stack</h2>
          <div className="tech-stack">
            <span className="tech-badge">React 19</span>
            <span className="tech-badge">Vite</span>
            <span className="tech-badge">Jenkins</span>
            <span className="tech-badge">Docker</span>
            <span className="tech-badge">Kubernetes</span>
            <span className="tech-badge">GitHub</span>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>DevOps Lab - CI/CD Pipeline Project</p>
      </footer>
    </div>
  )
}

export default App
