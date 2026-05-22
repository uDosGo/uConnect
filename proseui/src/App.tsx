/* ═══════════════════════════════════════════════════════════════════
   proseui — App Root
   Routes: ProseSurfaceManager (shell) → all surfaces
   ═══════════════════════════════════════════════════════════════════ */
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProseSurfaceManager from './views/surfaces/ProseSurfaceManager'
import ProseUISurface from './views/surfaces/proseui/ProseUISurface'
import VibeSurface from './views/surfaces/VibeSurface'
import UCode2ReasoningSurface from './views/surfaces/UCode2ReasoningSurface'
import UCode2PublishSurface from './views/surfaces/UCode2PublishSurface'
import VaultSurface from './views/surfaces/VaultSurface'
import WorkflowSurface from './views/surfaces/WorkflowSurface'
import ToolBuilderSurface from './views/surfaces/ToolBuilderSurface'
import USXDRendererSurface from './views/surfaces/USXDRendererSurface'
import GitHubSyncSurface from './views/surfaces/GitHubSyncSurface'
import WordPressAdaptorSurface from './views/surfaces/WordPressAdaptorSurface'
import SettingsSurface from './views/surfaces/SettingsSurface'
import DevSurface from './views/surfaces/DevSurface'
import { ProseUIProvider } from './views/surfaces/proseui/stores/proseUIStore'

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/surface/proseui" replace />} />
      <Route path="/surface" element={
        <ProseUIProvider>
          <ProseSurfaceManager />
        </ProseUIProvider>
      }>
        {/* ProseUI Document Views */}
        <Route index element={<Navigate to="board" replace />} />
        <Route path="board" element={<ProseUISurface />} />
        <Route path="list" element={<ProseUISurface />} />
        <Route path="prose" element={<ProseUISurface />} />
        <Route path="editor" element={<ProseUISurface />} />
        <Route path="story" element={<ProseUISurface />} />

        {/* uCode Editions */}
        <Route path="ucode2reasoning" element={<UCode2ReasoningSurface />} />
        <Route path="ucode2" element={<UCode2PublishSurface />} />
        <Route path="proseui" element={<ProseUISurface />} />

        {/* Core Surfaces */}
        <Route path="vibe" element={<VibeSurface />} />

        <Route path="vault" element={<VaultSurface />} />
        <Route path="workflow" element={<WorkflowSurface />} />

        <Route path="tools" element={<ToolBuilderSurface />} />
        <Route path="usxd" element={<USXDRendererSurface />} />

        {/* Integrations */}
        <Route path="github-sync" element={<GitHubSyncSurface />} />
        <Route path="wordpress" element={<WordPressAdaptorSurface />} />

        {/* Dev */}
        <Route path="dev" element={<DevSurface />} />

        {/* Settings */}
        <Route path="settings" element={<SettingsSurface />} />

      </Route>
      <Route path="*" element={<Navigate to="/surface/board" replace />} />

    </Routes>
  )
}

export default App
