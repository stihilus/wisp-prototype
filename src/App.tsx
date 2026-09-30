import { useCallback, useEffect, useState } from 'react'
import { TopNav } from './components/TopNav'
import { LeftSideNav } from './components/LeftSideNav'
import { RightSideNav } from './components/RightSideNav'
import { HomeHero } from './components/HomeHero'
import { ChatView } from './components/ChatView'
import { ReleaseModal } from './components/ReleaseModal'
import { NewsModal } from './components/NewsModal'
import { HomeDashboard } from './components/dashboard/HomeDashboard'
import { UpdatesPanel } from './components/dashboard/UpdatesPanel'
import { Toasts } from './components/ui/Toasts'
import { useTheme } from './hooks/useTheme'
import { usePrototype } from './store/prototype'
import backgroundDark from './assets/bg/background-dark.svg'
import styles from './App.module.css'

type PanelKey = 'files' | 'transcript' | 'skills' | 'connectors'

function useNow(interval = 20000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), interval)
    return () => window.clearInterval(t)
  }, [interval])
  return now
}

function App() {
  const { theme, toggleTheme } = useTheme()
  const { state, actions } = usePrototype()
  const [activePanel, setActivePanel] = useState<PanelKey | null>(null)
  const [releaseModalOpen, setReleaseModalOpen] = useState(false)
  const [newsModalOpen, setNewsModalOpen] = useState(false)
  const [guidedModelTrigger, setGuidedModelTrigger] = useState(0)
  const now = useNow()

  const { view } = state
  const { sidebarOpen } = state
  const showUpdates = state.updatesOpen

  const handleNewChat = useCallback(() => {
    actions.newChat()
    // Clears any leftover guided-tour trigger so a plain "New Chat" never
    // replays the "Try <model>" animation — only that button should.
    setGuidedModelTrigger(0)
  }, [actions])

  const handleOpenChat = useCallback(() => {
    actions.openThread()
    setGuidedModelTrigger(0)
  }, [actions])

  const togglePanel = useCallback((panel: PanelKey) => {
    setActivePanel((current) => (current === panel ? null : panel))
  }, [])

  const closePanel = useCallback(() => setActivePanel(null), [])

  const handleTryModel = useCallback(() => {
    setReleaseModalOpen(false)
    setNewsModalOpen(false)
    actions.newChat()
    setGuidedModelTrigger((v) => v + 1)
  }, [actions])

  return (
    <div className={styles.app}>
      <img src={backgroundDark} alt="" className={styles.backgroundDecoration} data-theme={theme} />

      <div className={styles.shell}>
        <TopNav
          sidebarOpen={sidebarOpen}
          onToggleSidebar={actions.toggleSidebar}
          onToggleTheme={toggleTheme}
          onOpenReleaseModal={() => setReleaseModalOpen(true)}
        />

        <div className={styles.body}>
          <LeftSideNav
            open={sidebarOpen}
            view={view}
            onHome={actions.goHome}
            onChat={actions.goChat}
            onNewChat={handleNewChat}
            onOpenChat={handleOpenChat}
          />

          <div className={styles.contentRegion} data-view={view} data-updates={showUpdates}>
            <main className={styles.main}>
              {view === 'home' ? (
                <HomeDashboard />
              ) : state.chat.started ? (
                <ChatView messages={state.chat.messages} onSend={actions.sendMessage} />
              ) : (
                <HomeHero onSend={actions.sendMessage} guidedModelTrigger={guidedModelTrigger} autoSelectModelId="muse-glimmer-30b" />
              )}
            </main>
            {showUpdates ? (
              <UpdatesPanel now={now} />
            ) : (
              <RightSideNav
                activePanel={activePanel}
                onTogglePanel={togglePanel}
                onClosePanel={closePanel}
                feedBadge={state.feedBadge}
                onOpenFeed={actions.openFeed}
              />
            )}
          </div>
        </div>
      </div>

      {releaseModalOpen && (
        <ReleaseModal
          onClose={() => setReleaseModalOpen(false)}
          onTryModel={handleTryModel}
          onSeeAllUpdates={() => {
            setReleaseModalOpen(false)
            setNewsModalOpen(true)
          }}
        />
      )}

      {newsModalOpen && <NewsModal onClose={() => setNewsModalOpen(false)} onTryModel={handleTryModel} />}

      <Toasts />
    </div>
  )
}

export default App
