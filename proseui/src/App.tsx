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
import VaultSurface from './views/surfaces/VaultSurface'
import WorkflowSurface from './views/surfaces/WorkflowSurface'
import ToolBuilderSurface from './views/surfaces/ToolBuilderSurface'
import SettingsSurface from './views/surfaces/SettingsSurface'
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
        <Route path="proseui" element={<ProseUISurface />} />

        {/* Core Surfaces */}
        <Route path="vibe" element={<VibeSurface />} />
        <Route path="vault" element={<VaultSurface />} />
        <Route path="workflow" element={<WorkflowSurface />} />
        <Route path="tools" element={<ToolBuilderSurface />} />

        {/* Settings */}
        <Route path="settings" element={<SettingsSurface />} />

      </Route>
      <Route path="*" element={<Navigate to="/surface/board" replace />} />

    </Routes>
  )
}

export default App
