import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface StoryStep {
  id: string
  title: string
  content: string
  type: 'information' | 'question' | 'action' | 'decision' | 'presentation' | 'input' | 'single_choice' | 'multi_choice' | 'stars' | 'scale'
  options?: StoryOption[]
  required?: boolean
  field?: string
  min?: number
  max?: number
}

export interface StoryOption {
  id: string
  text: string
  value: string
  correct?: boolean
  feedback?: string
  next?: string | null
}

export interface Story {
  id: string
  title: string
  description: string
  type: 'guide' | 'onboarding' | 'survey' | 'tutorial' | 'interactive-narrative' | 'custom'
  status: 'draft' | 'published' | 'archived'
  steps: StoryStep[]
  views: number
  completions: number
  createdAt: string
  updatedAt: string
  lane?: string
  version?: string
  completion?: {
    title: string
    message: string
  }
}

// ─── Built-in Stories ───────────────────────────────────────────

const questForTheLostLink: Story = {
  id: 'quest-for-the-lost-link',
  title: 'The Quest for the Lost Link',
  description: 'An interactive narrative that teaches [[wiki-link]] syntax through a fantasy adventure.',
  type: 'interactive-narrative',
  status: 'published',
  views: 42,
  completions: 15,
  createdAt: '2026-04-01T00:00:00Z',
  updatedAt: '2026-04-15T00:00:00Z',
  lane: 'public',
  version: '1.0.0',
  completion: {
    title: '🏆 Quest Complete!',
    message: `You have restored the Great Knowledge Vault and mastered the art of [[wiki-links]].\n\nThe true power of knowledge is not in what you know, but in how you connect it.`
  },
  steps: [
    {
      id: 'broken-vault',
      title: 'The Broken Vault',
      content: `You stand before the Great Knowledge Vault. Its doors are sealed, and the once-bright runes that connected all knowledge are dark.

An old sage approaches: "The links have been broken. To restore them, you must learn the ancient syntax of connection."

"Tell me, young archivist — what symbol do we use to create a link between two notes in uDos?"`,
      type: 'single_choice',
      options: [
        { id: '1', text: '[[double brackets]]', value: '[[double brackets]]', correct: true, feedback: 'Correct! [[wiki-links]] are the heart of uDos knowledge connections.', next: 'whispering-hall' },
        { id: '2', text: '{{curly braces}}', value: '{{curly braces}}', correct: false, feedback: 'Not quite. Curly braces are for templates, not links.', next: 'broken-vault' },
        { id: '3', text: '((parentheses))', value: '((parentheses))', correct: false, feedback: 'Close! But parentheses are for inline references, not wiki-links.', next: 'broken-vault' },
      ]
    },
    {
      id: 'whispering-hall',
      title: 'The Whispering Hall',
      content: `The hall is filled with floating notes, each whispering its title. You need to create a link from your current note "Dragon Encounter" to another note called "Treasure Map".

"Write the link syntax that connects 'Dragon Encounter' to 'Treasure Map'."`,
      type: 'single_choice',
      options: [
        { id: '1', text: '[[Treasure Map]]', value: '[[Treasure Map]]', correct: true, feedback: 'Perfect! [[Treasure Map]] creates a link. The vault trembles as a connection reforms.', next: 'mirror-chamber' },
        { id: '2', text: '[Treasure Map]', value: '[Treasure Map]', correct: false, feedback: 'Single brackets are for external URLs, not wiki-links. Try double brackets.', next: 'whispering-hall' },
        { id: '3', text: '{{Treasure Map}}', value: '{{Treasure Map}}', correct: false, feedback: 'Those are template braces. Wiki-links use double square brackets.', next: 'whispering-hall' },
      ]
    },
    {
      id: 'mirror-chamber',
      title: 'The Mirror Chamber',
      content: `In this chamber, mirrors show different names for the same thing. You want to link to "The Ancient Dragon of Mount Ember" but display it as just "Dragon" in your note.

"What syntax shows 'Dragon' but links to 'The Ancient Dragon of Mount Ember'?"`,
      type: 'single_choice',
      options: [
        { id: '1', text: '[[The Ancient Dragon of Mount Ember|Dragon]]', value: '[[The Ancient Dragon of Mount Ember|Dragon]]', correct: true, feedback: 'Magnificent! The pipe | creates an alias.', next: 'web-of-knowledge' },
        { id: '2', text: '[[Dragon|The Ancient Dragon of Mount Ember]]', value: '[[Dragon|The Ancient Dragon of Mount Ember]]', correct: false, feedback: 'Almost! The format is [[target|display]]. Target comes first.', next: 'mirror-chamber' },
        { id: '3', text: '[[Dragon -> The Ancient Dragon of Mount Ember]]', value: '[[Dragon -> The Ancient Dragon of Mount Ember]]', correct: false, feedback: 'Use the pipe | character: [[target|display]]', next: 'mirror-chamber' },
      ]
    },
    {
      id: 'web-of-knowledge',
      title: 'The Web of Knowledge',
      content: `You enter a vast chamber where threads of light connect notes. Three notes float before you: "Quest Log", "Dragon Encounter", "Treasure Map".

"Create a knowledge web: Link 'Quest Log' to both 'Dragon Encounter' and 'Treasure Map'."`,
      type: 'single_choice',
      options: [
        { id: '1', text: '# Quest Log\n\nToday I had a [[Dragon Encounter]] and found a [[Treasure Map]].', value: 'correct-links', correct: true, feedback: 'Yes! Multiple links in one note create a knowledge web.', next: 'restoration' },
        { id: '2', text: '# Quest Log\n\nToday I had a Dragon Encounter and found a Treasure Map.', value: 'no-links', correct: false, feedback: 'Without [[brackets]], these are just words, not connections.', next: 'web-of-knowledge' },
        { id: '3', text: '# Quest Log\n\nToday I had a [Dragon Encounter] and found a [Treasure Map].', value: 'single-brackets', correct: false, feedback: 'Single brackets create external links. Use [[double brackets]].', next: 'web-of-knowledge' },
      ]
    },
    {
      id: 'restoration',
      title: 'The Restoration',
      content: `The Great Knowledge Vault shudders as the final connections reform. Light floods the chamber as the sage speaks once more:

"You have learned the three sacred syntaxes:
 1. [[Link]] — Basic connection
 2. [[Target|Display]] — Aliased connection
 3. Multiple [[Link]]s in one note — Knowledge web

One final lesson: When you open a note that is linked TO by others, you see its 'backlinks'. What command shows which notes link TO your current note?"`,
      type: 'single_choice',
      options: [
        { id: '1', text: 'udos note backlinks', value: 'udos note backlinks', correct: true, feedback: '🎉 THE VAULT IS RESTORED! Backlinks show the web of connections pointing TO your note.', next: null },
        { id: '2', text: 'udos note links', value: 'udos note links', correct: false, feedback: "'links' shows what your note links TO. 'backlinks' shows what links TO your note.", next: 'restoration' },
        { id: '3', text: 'udos link list', value: 'udos link list', correct: false, feedback: "Close! The command is 'udos note backlinks'.", next: 'restoration' },
      ]
    },
  ]
}

const userOnboarding: Story = {
  id: 'user-onboarding',
  title: 'User Setup Story',
  description: 'Welcome to uDos! Set up your workspace, create your first vault, and learn the basics.',
  type: 'onboarding',
  status: 'published',
  views: 128,
  completions: 89,
  createdAt: '2026-03-15T00:00:00Z',
  updatedAt: '2026-04-10T00:00:00Z',
  completion: {
    title: '🎉 Welcome to uDos!',
    message: `You're all set up! Your vault is ready, your workspace is configured, and you know the basics.

Next steps:
• Explore the surfaces in the sidebar
• Try the "Quest for the Lost Link" story
• Create your first notes with [[wiki-links]]`
  },
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to uDos',
      content: `Welcome to uDos — your personal knowledge operating system.

This quick setup will help you get started. Let's begin by setting up your workspace.`,
      type: 'presentation',
    },
    {
      id: 'workspace-name',
      title: 'Name Your Workspace',
      content: 'What would you like to call your workspace? This is the name that appears in the header.',
      type: 'input',
      field: 'text',
      required: true,
    },
    {
      id: 'vault-location',
      title: 'Vault Location',
      content: 'Where would you like to store your vault? The default is ~/vault.',
      type: 'input',
      field: 'text',
    },
    {
      id: 'features',
      title: 'Select Features',
      content: 'Which features would you like to enable?',
      type: 'multi_choice',
      options: [
        { id: 'vault', text: '📁 Vault Browser', value: 'vault' },
        { id: 'github', text: '🌐 GitHub Sync', value: 'github' },
        { id: 'wp', text: '🌍 WordPress Adaptor', value: 'wordpress' },
        { id: 'usxd', text: '🎨 USXD Renderer', value: 'usxd' },
        { id: 'workflow', text: '⚙️ Workflow Engine', value: 'workflow' },
        { id: 'mcp', text: '🔌 MCP Bridge', value: 'mcp' },
      ]
    },
    {
      id: 'experience',
      title: 'Your Experience Level',
      content: 'How familiar are you with knowledge management tools?',
      type: 'stars',
      max: 5,
    },
    {
      id: 'cli-experience',
      title: 'CLI Experience',
      content: 'Rate your comfort level with command-line interfaces.',
      type: 'scale',
      min: 1,
      max: 5,
    },
    {
      id: 'summary',
      title: 'Review Your Setup',
      content: 'Here is a summary of your choices. You can go back to change anything.',
      type: 'presentation',
    },
    {
      id: 'confirm',
      title: 'Ready to Go?',
      content: 'Click Finish to complete your setup and launch uDos!',
      type: 'presentation',
    },
  ]
}

const customerSurvey: Story = {
  id: 'customer-survey',
  title: 'Customer Feedback Survey',
  description: 'Help us improve by sharing your experience with uDos.',
  type: 'survey',
  status: 'published',
  views: 67,
  completions: 42,
  createdAt: '2026-04-01T00:00:00Z',
  updatedAt: '2026-04-12T00:00:00Z',
  completion: {
    title: '🙏 Thank You!',
    message: 'Your feedback helps us make uDos better for everyone. We appreciate your time!'
  },
  steps: [
    {
      id: 'intro',
      title: 'Quick Feedback',
      content: 'We value your opinion! This short survey will take about 2 minutes.',
      type: 'presentation',
    },
    {
      id: 'satisfaction',
      title: 'Overall Satisfaction',
      content: 'How satisfied are you with uDos overall?',
      type: 'stars',
      max: 5,
    },
    {
      id: 'features-used',
      title: 'Features You Use',
      content: 'Which features do you use most?',
      type: 'multi_choice',
      options: [
        { id: 'vault', text: '📁 Vault Browser', value: 'vault' },
        { id: 'terminal', text: '📟 Terminal', value: 'terminal' },
        { id: 'github', text: '🌐 GitHub Sync', value: 'github' },
        { id: 'usxd', text: '🎨 USXD Renderer', value: 'usxd' },
        { id: 'workflow', text: '⚙️ Workflow Engine', value: 'workflow' },
        { id: 'vibe', text: '🌀 Vibe TUI', value: 'vibe' },
      ]
    },
    {
      id: 'improvement',
      title: 'What Can We Improve?',
      content: 'Please tell us what we can do better.',
      type: 'input',
      field: 'textarea',
    },
    {
      id: 'recommend',
      title: 'Would You Recommend?',
      content: 'How likely are you to recommend uDos to a friend or colleague?',
      type: 'scale',
      min: 1,
      max: 10,
    },
    {
      id: 'thanks',
      title: 'Thank You!',
      content: 'Thanks for your feedback! Your responses have been recorded.',
      type: 'presentation',
    },
  ]
}

const featureTutorial: Story = {
  id: 'feature-tutorial',
  title: 'Wiki-Link Tutorial',
  description: 'Learn how to use [[wiki-links]] to connect your notes and build a knowledge web.',
  type: 'tutorial',
  status: 'published',
  views: 34,
  completions: 22,
  createdAt: '2026-04-05T00:00:00Z',
  updatedAt: '2026-04-14T00:00:00Z',
  completion: {
    title: '🎓 Tutorial Complete!',
    message: 'You now know how to create wiki-links, use aliases, and build a knowledge web. Keep connecting your ideas!'
  },
  steps: [
    {
      id: 'intro',
      title: 'Introduction to Wiki-Links',
      content: `Wiki-links are the heart of uDos knowledge management. They let you connect notes together, creating a web of related ideas.

In this tutorial, you'll learn:
• Basic [[wiki-link]] syntax
• Aliased links with [[target|display]]
• Building a knowledge web`,
      type: 'presentation',
    },
    {
      id: 'basic-link',
      title: 'Creating a Basic Link',
      content: 'To link to another note, wrap its title in double square brackets: [[Note Title]].\n\nTry it: Create a link to a note called "My Ideas".',
      type: 'input',
      field: 'text',
      required: true,
    },
    {
      id: 'alias-link',
      title: 'Using Link Aliases',
      content: 'Sometimes you want to display different text than the note title. Use the pipe | character: [[target|display]].\n\nExample: [[The Ancient Dragon of Mount Ember|Dragon]] shows "Dragon" but links to the full title.',
      type: 'input',
      field: 'text',
    },
    {
      id: 'multiple-links',
      title: 'Multiple Links in One Note',
      content: 'You can add multiple links in a single note to create a knowledge web:\n\n# My Note\n\nRelated to [[Topic A]] and [[Topic B]].\n\nThis connects your note to both topics.',
      type: 'presentation',
    },
    {
      id: 'practice',
      title: 'Practice Exercise',
      content: 'Create a note with links to three different topics of your choice.',
      type: 'input',
      field: 'textarea',
    },
    {
      id: 'completion',
      title: 'You Did It!',
      content: 'Congratulations! You now know how to use wiki-links. Start connecting your notes today!',
      type: 'presentation',
    },
  ]
}

// ─── Store ──────────────────────────────────────────────────────

export const useStoryStore = defineStore('story', () => {
  const stories = ref<Story[]>([
    questForTheLostLink,
    userOnboarding,
    customerSurvey,
    featureTutorial,
  ])

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const publishedStories = computed(() => stories.value.filter(s => s.status === 'published'))
  const totalViews = computed(() => stories.value.reduce((sum, s) => sum + s.views, 0))
  const totalCompletions = computed(() => stories.value.reduce((sum, s) => sum + s.completions, 0))

  async function loadStories() {
    isLoading.value = true
    error.value = null
    try {
      // Stories are built-in; simulate a brief load
      await new Promise(resolve => setTimeout(resolve, 300))
    } catch (err: any) {
      error.value = err.message || 'Could not load stories'
    } finally {
      isLoading.value = false
    }
  }

  async function createStory(data: Partial<Story>) {
    const story: Story = {
      id: `story-${Date.now()}`,
      title: data.title || 'Untitled Story',
      description: data.description || '',
      type: data.type || 'custom',
      status: 'draft',
      steps: data.steps || [],
      views: 0,
      completions: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    stories.value.push(story)
    return story
  }

  async function saveStory(story: Story) {
    const index = stories.value.findIndex(s => s.id === story.id)
    if (index >= 0) {
      story.updatedAt = new Date().toISOString()
      stories.value[index] = story
    }
  }

  async function deleteStory(id: string) {
    stories.value = stories.value.filter(s => s.id !== id)
  }

  function getStoryById(id: string): Story | undefined {
    return stories.value.find(s => s.id === id)
  }

  return {
    stories,
    isLoading,
    error,
    publishedStories,
    totalViews,
    totalCompletions,
    loadStories,
    createStory,
    saveStory,
    deleteStory,
    getStoryById,
  }
})
