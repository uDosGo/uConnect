#!/usr/bin/env swift
// ═══════════════════════════════════════════════════════════════════
// uDos Menu Bar — macOS status bar app for uConnect surfaces
// ═══════════════════════════════════════════════════════════════════
// Compile: swiftc -o /usr/local/bin/udos-menu-bar udos-menu-bar.swift
// Run:     /usr/local/bin/udos-menu-bar &
// Auto-start: Add to Login Items in System Settings
//
// Provides a macOS menu bar icon with:
//   • Quick launch/stop for all 6 surfaces + hub
//   • Status indicators (running/stopped)
//   • Open in browser, Launch All, Stop All
//   • On-demand start/stop per surface
//   • Port management
//   • Quit option
// ═══════════════════════════════════════════════════════════════════

import Cocoa
import UserNotifications
import WebKit

// ─── Surface Configuration ───────────────────────────────────────
struct Surface {
    let name: String
    let label: String
    let icon: String
    let port: Int
    let directory: String
}

let surfaces: [Surface] = [
    Surface(name: "ui",      label: "UI Hub (Index)",  icon: "🏠", port: 5173, directory: "ui"),
    Surface(name: "proseui", label: "Prose Editor",    icon: "📝", port: 5174, directory: "proseui"),
    Surface(name: "code3ui", label: "Code Editor v3",  icon: "💻", port: 5175, directory: "code3ui"),
    Surface(name: "code4ui", label: "Code Editor v4",  icon: "🖥️", port: 5176, directory: "code4ui"),
    Surface(name: "opsui",   label: "Server Ops",      icon: "⚙️",  port: 5177, directory: "opsui"),
    Surface(name: "gridui",  label: "Grid Workspace",  icon: "📊", port: 5178, directory: "gridui"),
]

let connectDir = NSString(string: "\(NSHomeDirectory())/Code/uConnect").expandingTildeInPath

// ─── Helper Functions ────────────────────────────────────────────

/// Check if a process is running on the given port
func isPortInUse(_ port: Int) -> Bool {
    let task = Process()
    task.launchPath = "/usr/sbin/lsof"
    task.arguments = ["-ti", ":\(port)"]
    
    let pipe = Pipe()
    task.standardOutput = pipe
    task.standardError = Pipe()
    
    do {
        try task.run()
        task.waitUntilExit()
        let data = pipe.fileHandleForReading.readDataToEndOfFile()
        return !data.isEmpty
    } catch {
        return false
    }
}

/// Get the PID of the process on a given port
func pidForPort(_ port: Int) -> String? {
    let task = Process()
    task.launchPath = "/usr/sbin/lsof"
    task.arguments = ["-ti", ":\(port)"]
    
    let pipe = Pipe()
    task.standardOutput = pipe
    task.standardError = Pipe()
    
    do {
        try task.run()
        task.waitUntilExit()
        let data = pipe.fileHandleForReading.readDataToEndOfFile()
        let output = String(data: data, encoding: .utf8)?.trimmingCharacters(in: .whitespacesAndNewlines)
        return output?.isEmpty == false ? output : nil
    } catch {
        return nil
    }
}

/// Start a Vite dev server for a surface
func startSurface(_ surface: Surface) {
    let surfaceDir = "\(connectDir)/\(surface.directory)"
    
    guard FileManager.default.fileExists(atPath: surfaceDir) else {
        showNotification(title: "uDos Menu Bar", body: "Directory not found: \(surfaceDir)")
        return
    }
    
    // Check if node_modules exists, install if not
    if !FileManager.default.fileExists(atPath: "\(surfaceDir)/node_modules") {
        let installTask = Process()
        installTask.launchPath = "/usr/local/bin/npm"
        installTask.arguments = ["install"]
        installTask.currentDirectoryURL = URL(fileURLWithPath: surfaceDir)
        installTask.standardOutput = Pipe()
        installTask.standardError = Pipe()
        
        do {
            try installTask.run()
            installTask.waitUntilExit()
        } catch {
            showNotification(title: "uDos Menu Bar", body: "Failed to install dependencies for \(surface.label)")
            return
        }
    }
    
    // Start vite in background using nohup
    let task = Process()
    task.launchPath = "/bin/bash"
    task.arguments = ["-c", "cd '\(surfaceDir)' && nohup npx vite --port \(surface.port) --host > /tmp/udos-\(surface.name).log 2>&1 &"]
    task.standardOutput = Pipe()
    task.standardError = Pipe()
    
    do {
        try task.run()
        task.waitUntilExit()
        
        // Wait a moment then verify
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            if isPortInUse(surface.port) {
                showNotification(title: "uDos Menu Bar", body: "\(surface.label) started on :\(surface.port)")
            } else {
                showNotification(title: "uDos Menu Bar", body: "\(surface.label) may still be starting...")
            }
        }
    } catch {
        showNotification(title: "uDos Menu Bar", body: "Failed to start \(surface.label)")
    }
}

/// Stop a surface by killing the process on its port
func stopSurface(_ surface: Surface) {
    guard let pid = pidForPort(surface.port) else { return }
    
    let task = Process()
    task.launchPath = "/bin/kill"
    task.arguments = ["-9", pid]
    task.standardOutput = Pipe()
    task.standardError = Pipe()
    
    do {
        try task.run()
        task.waitUntilExit()
        showNotification(title: "uDos Menu Bar", body: "\(surface.label) stopped")
    } catch {
        showNotification(title: "uDos Menu Bar", body: "Failed to stop \(surface.label)")
    }
}

/// Open a URL in the default browser
func openURL(_ urlString: String) {
    if let url = URL(string: urlString) {
        NSWorkspace.shared.open(url)
    }
}

/// Show a macOS notification using modern UserNotifications API
func showNotification(title: String, body: String) {
    let center = UNUserNotificationCenter.current()
    center.requestAuthorization(options: [.alert, .sound]) { granted, error in
        guard granted else { return }
        
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        
        let request = UNNotificationRequest(
            identifier: UUID().uuidString,
            content: content,
            trigger: nil
        )
        
        center.add(request)
    }
}

// ─── Menu Bar App Delegate ───────────────────────────────────────

class AppDelegate: NSObject, NSApplicationDelegate, NSMenuDelegate {
    var statusItem: NSStatusItem!
    var statusMenu: NSMenu!
    var surfaceMenuItems: [String: NSMenuItem] = [:]
    var timer: Timer?
    
    func applicationDidFinishLaunching(_ notification: Notification) {
        // Create status bar item
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        
        if let button = statusItem.button {
            button.title = "🍔"
            button.action = #selector(showMenu)
            button.target = self
        }
        
        buildMenu()
        
        // Refresh status every 5 seconds
        timer = Timer.scheduledTimer(timeInterval: 5.0, target: self, selector: #selector(refreshStatus), userInfo: nil, repeats: true)
    }
    
    func buildMenu() {
        statusMenu = NSMenu()
        statusMenu.delegate = self
        
        // Header
        let headerItem = NSMenuItem(title: "uDos / Connect", action: nil, keyEquivalent: "")
        headerItem.isEnabled = false
        statusMenu.addItem(headerItem)
        
        statusMenu.addItem(NSMenuItem.separator())
        
        // Surface items
        for surface in surfaces {
            let statusIcon = isPortInUse(surface.port) ? "🟢" : "⚪"
            let title = "\(statusIcon) \(surface.icon) \(surface.label)  :\(surface.port)"
            let item = NSMenuItem(title: title, action: #selector(surfaceClicked(_:)), keyEquivalent: "")
            item.representedObject = surface
            item.target = self
            statusMenu.addItem(item)
            surfaceMenuItems[surface.name] = item
        }
        
        statusMenu.addItem(NSMenuItem.separator())
        
        // Actions
        let openHubItem = NSMenuItem(title: "🌐 Open Hub in Browser", action: #selector(openHub), keyEquivalent: "")
        openHubItem.target = self
        statusMenu.addItem(openHubItem)
        
        let openAllItem = NSMenuItem(title: "🌐 Open All Running in Browser", action: #selector(openAllSurfaces), keyEquivalent: "")
        openAllItem.target = self
        statusMenu.addItem(openAllItem)
        
        let launchAllItem = NSMenuItem(title: "🚀 Launch All Surfaces", action: #selector(launchAllSurfaces), keyEquivalent: "")
        launchAllItem.target = self
        statusMenu.addItem(launchAllItem)
        
        let stopAllItem = NSMenuItem(title: "⏹  Stop All Surfaces", action: #selector(stopAllSurfaces), keyEquivalent: "")
        stopAllItem.target = self
        statusMenu.addItem(stopAllItem)
        
        statusMenu.addItem(NSMenuItem.separator())
        
        // Port Status
        let portStatusItem = NSMenuItem(title: "📡 Port Status", action: nil, keyEquivalent: "")
        portStatusItem.isEnabled = false
        statusMenu.addItem(portStatusItem)
        
        for surface in surfaces {
            let inUse = isPortInUse(surface.port)
            let statusStr = inUse ? "🟢 in use" : "⚪ free"
            let portItem = NSMenuItem(title: "  :\(surface.port)  \(statusStr)  — \(surface.label)", action: nil, keyEquivalent: "")
            portItem.isEnabled = false
            statusMenu.addItem(portItem)
        }
        
        statusMenu.addItem(NSMenuItem.separator())
        
        // Dev Mode
        let devModeItem = NSMenuItem(title: "🛠️  Dev Mode (Surface Picker)", action: #selector(openDevMode), keyEquivalent: "")
        devModeItem.target = self
        statusMenu.addItem(devModeItem)
        
        statusMenu.addItem(NSMenuItem.separator())
        
        // About & Quit
        let aboutItem = NSMenuItem(title: "ℹ️  About uDos Menu Bar", action: #selector(showAbout), keyEquivalent: "")
        aboutItem.target = self
        statusMenu.addItem(aboutItem)
        
        statusMenu.addItem(NSMenuItem(title: "🚪 Quit", action: #selector(quitApp), keyEquivalent: "q"))
    }
    
    @objc func showMenu() {
        refreshStatus()
        statusItem.menu = statusMenu
        statusItem.button?.performClick(nil)
        statusItem.menu = nil
    }
    
    @objc func refreshStatus() {
        for surface in surfaces {
            let inUse = isPortInUse(surface.port)
            let statusIcon = inUse ? "🟢" : "⚪"
            if let item = surfaceMenuItems[surface.name] {
                item.title = "\(statusIcon) \(surface.icon) \(surface.label)  :\(surface.port)"
            }
        }
    }
    
    @objc func surfaceClicked(_ sender: NSMenuItem) {
        guard let surface = sender.representedObject as? Surface else { return }
        
        let inUse = isPortInUse(surface.port)
        
        if inUse {
            // Show submenu: Open or Stop
            let alert = NSAlert()
            alert.messageText = "\(surface.label) is running on :\(surface.port)"
            alert.informativeText = "What would you like to do?"
            alert.addButton(withTitle: "🌐 Open in Browser")
            alert.addButton(withTitle: "⏹  Stop")
            alert.addButton(withTitle: "Cancel")
            
            let response = alert.runModal()
            if response == .alertFirstButtonReturn {
                openURL("http://localhost:\(surface.port)")
            } else if response == .alertSecondButtonReturn {
                stopSurface(surface)
                refreshStatus()
            }
        } else {
            // Start the surface
            startSurface(surface)
            DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
                self.refreshStatus()
            }
        }
    }
    
    @objc func openHub() {
        openURL("http://localhost:5173")
    }
    
    @objc func openAllSurfaces() {
        for surface in surfaces {
            if isPortInUse(surface.port) {
                openURL("http://localhost:\(surface.port)")
            }
        }
    }
    
    @objc func launchAllSurfaces() {
        for surface in surfaces {
            if !isPortInUse(surface.port) {
                startSurface(surface)
            }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 5.0) {
            self.refreshStatus()
        }
    }
    
    @objc func stopAllSurfaces() {
        for surface in surfaces {
            stopSurface(surface)
        }
        refreshStatus()
    }
    
    @objc func openDevMode() {
        let task = Process()
        task.launchPath = "/bin/bash"
        task.arguments = ["-c", "cd '\(connectDir)' && bash scripts/udosui-launcher.sh dev"]
        task.standardOutput = Pipe()
        task.standardError = Pipe()
        
        do {
            try task.run()
        } catch {
            showNotification(title: "uDos Menu Bar", body: "Failed to open Dev Mode")
        }
    }
    
    @objc func showAbout() {
        let alert = NSAlert()
        alert.messageText = "uDos Menu Bar v2.0"
        alert.informativeText = """
        macOS menu bar controller for uDos / Connect surfaces.
        
        Surfaces:
        🏠 UI Hub (Index)  :5173
        📝 Prose Editor    :5174
        💻 Code Editor v3  :5175
        🖥️  Code Editor v4  :5176
        ⚙️  Server Ops      :5177
        📊 Grid Workspace  :5178
        
        Click a surface to start/stop/open it.
        Port status shows which surfaces are running.
        """
        alert.addButton(withTitle: "OK")
        alert.runModal()
    }
    
    @objc func quitApp() {
        timer?.invalidate()
        NSApplication.shared.terminate(nil)
    }
}

// ─── Main ────────────────────────────────────────────────────────

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.accessory)  // No dock icon, menu bar only
app.run()
