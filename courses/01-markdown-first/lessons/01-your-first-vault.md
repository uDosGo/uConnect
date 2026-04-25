# Week 1: Your First Vault & Notes

**Welcome to uDos!** This week you'll learn how to create your digital notebook where you can store all your ideas, notes, and knowledge.

## What You'll Build

By the end of this lesson, you'll have:
- A digital vault to store your notes
- Several notes with different tags
- Understanding of how uDos organizes information

## Step 1: Initialize Your Vault

Your vault is like a magical chest where you store all your knowledge. Let's create your first one:

```bash
udos vault init ~/my-first-vault
```

This creates a special folder called `my-first-vault` in your home directory where all your notes will be stored.

## Step 2: Create Your First Note

Now let's add your first piece of knowledge to the vault:

```bash
udos note create "Dragon encounter" --tag quest
```

This creates a new note titled "Dragon encounter" with the tag "quest". You can open the file in your vault folder to see it.

## Step 3: List All Your Notes

Let's see what's in your vault:

```bash
udos note list
```

You should see your "Dragon encounter" note listed.

## Step 4: Explore the Markdown File

Open the note file in your vault folder (it will be named something like `dragon-encounter.md`). You'll see it has:

```markdown
---
title: Dragon Encounter
created: 2024-04-25T12:00:00
tags: [quest]
---

# Dragon Encounter

<!-- Your content here -->
```

This is called "frontmatter" - it's metadata about your note that helps uDos organize it.

## Step 5: Create Another Note with Links

Let's create a second note that links to the first one:

```bash
udos note create "Treasure map" --tag quest
```

Now edit the "Treasure map" note and add a link to the dragon encounter:

```markdown
I found a treasure map that leads to the [[dragon-encounter]].
```

The `[[dragon-encounter]]` syntax creates a link between notes!

## Step 6: Organize with Tags

Create a few more notes with different tags:

```bash
udos note create "Shopping list" --tag personal
udos note create "Project ideas" --tag work
udos note create "Book recommendations" --tag reading
```

Now when you run `udos note list`, you'll see all your notes organized.

## Step 7: Filter by Tag

You can list notes by tag:

```bash
udos note list --tag quest
```

This will show only your quest-related notes.

## 🎉 Congratulations!

You've created your first digital vault and learned how to:
- Initialize a vault
- Create notes with tags
- Link notes together
- List and filter your knowledge

## Next Steps

- **Week 2**: Learn how to turn your notes into tasks and quests
- **Explore**: Try creating notes about your current projects or interests
- **Experiment**: Add more tags and see how they help organize your knowledge

## Lexicon

- **Vault** = Your digital knowledge chest = A folder with special uDos structure
- **Note** = A piece of knowledge = A markdown file with frontmatter
- **Tag** = A category or label = Helps organize and filter notes
- **Link** = Connection between notes = `[[note-title]]` syntax