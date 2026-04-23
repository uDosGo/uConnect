import chalk from "chalk";
import { upgradeMessage } from "../cloud-stubs/upgrade.js";
import { WordPressClient, WordPressClientFactory, WordPressPost } from "../cloud-stubs/wordpress/wordpress-client.js";
import { WordPressSyncFactory } from "../sync/wordpress-sync.js";

/**
 * WordPress Sync Command - Bidirectional synchronization (A2 Implementation)
 */
export async function cmdWpSync(): Promise<void> {
  try {
    const syncEngine = await WordPressSyncFactory.getSyncEngine();
    
    console.log(chalk.green("🔄 WordPress Bidirectional Synchronization (A2)"));
    console.log("\n📋 Sync Options:");
    console.log("   --dry-run       Preview changes without applying");
    console.log("   --since <date>  Sync changes since date");
    console.log("   --limit <num>   Limit number of items to sync");
    console.log("   --resolve <strategy> Conflict resolution (udos|wordpress|manual)");
    console.log("   --batch <size>  Batch size for processing");
    
    // For A2, we'll implement the basic sync with dry-run mode
    const result = await syncEngine.sync({
      dryRun: true, // Always dry-run for A2 safety
      limit: 10     // Limit for A2 testing
    });
    
    if (result.success) {
      console.log(chalk.blue("\n📊 Sync Preview Results:"));
      console.log(`   Created: ${result.created}`);
      console.log(`   Updated: ${result.updated}`);
      console.log(`   Deleted: ${result.deleted}`);
      console.log(`   Skipped: ${result.skipped}`);
      console.log(`   Conflicts: ${result.conflicts}`);
      console.log(`   Duration: ${result.durationMs}ms`);
      
      if (result.conflicts > 0) {
        console.log(chalk.yellow("\n⚠️  Manual conflict resolution required"));
        console.log("   Use --resolve-strategy to auto-resolve conflicts");
      }
      
      console.log(chalk.green("\n✅ Dry run completed successfully"));
      console.log("   Run with --apply to execute changes (A2 feature)");
      
    } else {
      console.log(chalk.red("\n❌ Sync preview failed:"));
      result.errors.forEach(error => console.log(`   - ${error}`));
    }
    
  } catch (error: any) {
    console.error(chalk.red("❌ Sync command failed:"), error.message);
    console.log(chalk.blue("\n📋 Setup required:"));
    console.log("   Run: udo wp setup");
    console.log("   Configure WordPress connection first");
  }
}

/**
 * WordPress Publish Command
 */
export async function cmdWpPublish(): Promise<void> {
  console.log(chalk.yellow(upgradeMessage("WordPress publish")));
  console.log(chalk.blue("\n📝 WordPress publish workflow"));
  console.log("   Status: A1 stub - will publish uDos notes as WordPress posts in A2");
  console.log("\n🎯 Usage:");
  console.log("   udo wp publish <note-id>   - Publish specific note");
  console.log("   udo wp publish --all       - Publish all draft notes");
}

/**
 * WordPress Editorial Review Command
 */
export async function cmdWpReview(): Promise<void> {
  console.log(chalk.yellow(upgradeMessage("WordPress editorial review")));
  console.log(chalk.blue("\n🔍 WordPress review workflow"));
  console.log("   Status: A1 stub - will manage editorial workflow in A2");
  console.log("\n📋 Features (A2):");
  console.log("   - Review queue management");
  console.log("   - Approval workflow");
  console.log("   - Version comparison");
  console.log("   - Collaborator comments");
}

/**
 * WordPress Draft Submission Command
 */
export async function cmdWpSubmit(): Promise<void> {
  console.log(chalk.yellow(upgradeMessage("WordPress draft submission")));
  console.log(chalk.blue("\n✏️  WordPress draft submission"));
  console.log("   Status: A1 stub - will submit uDos notes as WordPress drafts in A2");
  console.log("\n📝 Usage:");
  console.log("   udo wp submit <note-id>   - Submit note as draft");
  console.log("   udo wp submit --review     - Submit for editorial review");
}

/**
 * WordPress Draft Approval Command
 */
export async function cmdWpApprove(): Promise<void> {
  console.log(chalk.yellow(upgradeMessage("WordPress draft approval")));
  console.log(chalk.blue("\n✅ WordPress approval workflow"));
  console.log("   Status: A1 stub - will manage approval process in A2");
  console.log("\n🔄 Workflow:");
  console.log("   draft → review → approved → published");
}

/**
 * WordPress Setup Command - Configure connection
 */
export async function cmdWpSetup(): Promise<void> {
  console.log(chalk.blue("\n🛠️  WordPress Adaptor Setup"));
  console.log("\n📋 Configuration required:");
  console.log("   WORDPRESS_URL              - Your WordPress site URL");
  console.log("   WORDPRESS_USERNAME         - WordPress username");
  console.log("   WORDPRESS_APPLICATION_PASSWORD - Application password");
  console.log("\n💡 Setup methods:");
  console.log("   1. Environment variables: .env file or export");
  console.log("   2. Adaptor config: .udos/adaptors/wordpress.config.json");
  console.log("\n🔗 WordPress Application Password Setup:");
  console.log("   1. Go to Users → Edit User → Application Passwords");
  console.log("   2. Create new application password");
  console.log("   3. Copy the generated password");
  console.log("   4. Use it as WORDPRESS_APPLICATION_PASSWORD");
  
  console.log(chalk.green("\n✅ Example .env configuration:"));
  console.log("   WORDPRESS_URL=https://your-wordpress-site.com");
  console.log("   WORDPRESS_USERNAME=your-username");
  console.log("   WORDPRESS_APPLICATION_PASSWORD=your-application-password");
}

/**
 * WordPress Import Command - Import posts from WordPress
 */
export async function cmdWpImport(): Promise<void> {
  try {
    const { WordPressImporterFactory } = await import("../import/wordpress-importer.js");
    const importer = await WordPressImporterFactory.getImporter();
    
    console.log(chalk.blue("\n📥 WordPress Import"));
    console.log("🎯 Importing posts from WordPress to uDos");
    
    // For A2, we'll implement basic import with dry-run mode
    const result = await importer.importPosts({
      dryRun: true, // Always dry-run for A2 safety
      limit: 10,    // Limit for A2 testing
      includeMedia: false // Skip media for A2
    });
    
    if (result.success) {
      console.log(chalk.green("\n✅ Import Preview Results:"));
      console.log(`   Total Posts: ${result.totalPosts}`);
      console.log(`   Imported: ${result.imported}`);
      console.log(`   Skipped: ${result.skipped}`);
      console.log(`   Duration: ${result.durationMs}ms`);
      
      if (result.imported > 0) {
        console.log(chalk.blue("\n📝 Sample imported posts:"));
        result.samplePosts?.slice(0, 3).forEach((post: any) => {
          console.log(`   - ${post.title} (ID: ${post.id})`);
        });
      }
      
      console.log(chalk.green("\n✅ Dry run completed successfully"));
      console.log("   Run with --apply to execute import (A2 feature)");
      
    } else {
      console.log(chalk.red("\n❌ Import preview failed:"));
      result.errors.forEach(error => console.log(`   - ${error}`));
    }
    
  } catch (error: any) {
    console.error(chalk.red("❌ Import command failed:"), error.message);
    console.log(chalk.blue("\n📋 Setup required:"));
    console.log("   Run: udo wp setup");
    console.log("   Configure WordPress connection first");
  }
}

/**
 * WordPress Export Command - Export uDos notes to WordPress
 */
export async function cmdWpExport(): Promise<void> {
  try {
    const { UdosExporterFactory } = await import("../export/udos-exporter.js");
    const exporter = await UdosExporterFactory.getExporter();
    
    console.log(chalk.blue("\n📤 WordPress Export"));
    console.log("🎯 Exporting uDos notes to WordPress");
    
    // For A2, we'll implement basic export with dry-run mode
    const result = await exporter.exportNotes({
      dryRun: true, // Always dry-run for A2 safety
      limit: 10,    // Limit for A2 testing
      includeMedia: false // Skip media for A2
    });
    
    if (result.success) {
      console.log(chalk.green("\n✅ Export Preview Results:"));
      console.log(`   Total Notes: ${result.totalNotes}`);
      console.log(`   Exported: ${result.exported}`);
      console.log(`   Skipped: ${result.skipped}`);
      console.log(`   Duration: ${result.durationMs}ms`);
      
      if (result.exported > 0) {
        console.log(chalk.blue("\n📝 Sample exported notes:"));
        result.sampleNotes?.slice(0, 3).forEach((note: any) => {
          console.log(`   - ${note.title} (ID: ${note.id})`);
        });
      }
      
      console.log(chalk.green("\n✅ Dry run completed successfully"));
      console.log("   Run with --apply to execute export (A2 feature)");
      
    } else {
      console.log(chalk.red("\n❌ Export preview failed:"));
      result.errors.forEach(error => console.log(`   - ${error}`));
    }
    
  } catch (error: any) {
    console.error(chalk.red("❌ Export command failed:"), error.message);
    console.log(chalk.blue("\n📋 Setup required:"));
    console.log("   Run: udo wp setup");
    console.log("   Configure WordPress connection first");
  }
}

/**
 * WordPress API Test Command - Test API connectivity
 */
export async function cmdWpApiTest(): Promise<void> {
  try {
    const client = await WordPressClientFactory.getClient();
    
    console.log(chalk.blue("\n🧪 Testing WordPress API Connectivity"));
    
    const connected = await client.testConnectivity();
    
    if (connected) {
      console.log(chalk.green("✅ Connection successful!"));
      
      // Get some basic info
      const user = await client.getCurrentUser();
      console.log(`👤 Logged in as: ${user.name} (ID: ${user.id})`);
      
    } else {
      console.log(chalk.red("❌ Connection failed"));
      console.log("Check your WordPress URL and credentials");
    }
    
  } catch (error: any) {
    console.error(chalk.red("❌ API test failed:"), error.message);
    if (error.code === 'wordpress_setup_error') {
      console.log("\n📋 Setup required:");
      console.log("   WORDPRESS_URL=https://your-site.com");
      console.log("   WORDPRESS_USERNAME=your-username");
      console.log("   WORDPRESS_APPLICATION_PASSWORD=your-password");
    }
  }
}

/**
 * WordPress API Posts List Command
 */
export async function cmdWpApiPostsList(): Promise<void> {
  try {
    const client = await WordPressClientFactory.getClient();
    
    console.log(chalk.blue("\n📝 Fetching WordPress Posts"));
    
    const posts = await client.getPosts({ perPage: 10 });
    
    console.log(chalk.green(`✅ Found ${posts.length} posts:`));
    
    posts.forEach((post: WordPressPost, index: number) => {
      console.log(`\n${index + 1}. ${post.title?.rendered || 'Untitled'}`);
      console.log(`   ID: ${post.id}`);
      console.log(`   Status: ${post.status}`);
      console.log(`   Date: ${post.date}`);
      console.log(`   Link: ${post.link}`);
    });
    
    if (posts.length === 10) {
      console.log(`\n💡 Tip: Use --all to fetch all posts`);
    }
    
  } catch (error: any) {
    console.error(chalk.red("❌ Failed to fetch posts:"), error.message);
  }
}

/**
 * WordPress Sync Status Command - Show sync state
 */
export async function cmdWpSyncStatus(): Promise<void> {
  try {
    const syncEngine = await WordPressSyncFactory.getSyncEngine();
    
    console.log(chalk.blue("\n🔄 WordPress Sync Status"));
    
    // Show sync state information
    const syncState = await syncEngine['syncState']; // Access private property for status
    
    console.log(`📅 Last Sync: ${syncState.lastSync || 'Never'}`);
    console.log(`📊 WordPress Total: ${syncState.wordPressTotal}`);
    console.log(`📊 uDos Total: ${syncState.udosTotal}`);
    console.log(`🔢 Last WordPress ID: ${syncState.lastWordPressSyncId || 'None'}`);
    
    // Test connectivity
    const client = await WordPressClientFactory.getClient();
    const connected = await client.testConnectivity();
    
    if (connected) {
      console.log(chalk.green("\n✅ Sync Ready"));
      console.log("   WordPress API accessible");
      console.log("   Run: udo wp sync --dry-run to preview changes");
    } else {
      console.log(chalk.yellow("\n⚠️  Sync Not Ready"));
      console.log("   WordPress API not accessible");
    }
    
  } catch (error: any) {
    console.error(chalk.red("❌ Sync status failed:"), error.message);
    console.log(chalk.blue("\n📋 Setup required:"));
    console.log("   Run: udo wp setup");
  }
}

/**
 * WordPress Import Command with Options
 */
export async function cmdWpImportWithOptions(options: {
  all?: boolean;
  category?: string;
  tag?: string;
  since?: string;
  limit?: number;
  includeMedia?: boolean;
  dryRun?: boolean;
}): Promise<void> {
  try {
    const { WordPressImporterFactory } = await import("../import/wordpress-importer.js");
    const importer = await WordPressImporterFactory.getImporter();
    
    console.log(chalk.blue("\n📥 WordPress Import"));
    console.log("🎯 Importing posts from WordPress to uDos");
    
    // Build filter criteria
    const filterCriteria: any = {};
    if (options.category) filterCriteria.categories = [options.category];
    if (options.tag) filterCriteria.tags = [options.tag];
    if (options.since) filterCriteria.dateAfter = options.since;
    
    console.log(chalk.blue("\n📋 Import Options:"));
    console.log(`   All posts: ${options.all || false}`);
    console.log(`   Category: ${options.category || 'any'}`);
    console.log(`   Tag: ${options.tag || 'any'}`);
    console.log(`   Since: ${options.since || 'all time'}`);
    console.log(`   Limit: ${options.limit || 'none'}`);
    console.log(`   Include media: ${options.includeMedia || false}`);
    console.log(`   Dry run: ${options.dryRun || false}`);
    
    // Execute import
    const result = await importer.importPosts({
      dryRun: options.dryRun !== false, // Default to dry-run for safety
      limit: options.limit || 10,
      includeMedia: Boolean(options.includeMedia),
      filterCriteria: filterCriteria
    });
    
    if (result.success) {
      console.log(chalk.green("\n✅ Import Results:"));
      console.log(`   Total Posts: ${result.totalPosts}`);
      console.log(`   Imported: ${result.imported}`);
      console.log(`   Skipped: ${result.skipped}`);
      console.log(`   Duration: ${result.durationMs}ms`);
      
      if (result.imported > 0) {
        console.log(chalk.blue("\n📝 Sample imported posts:"));
        result.samplePosts?.slice(0, 3).forEach(post => {
          console.log(`   - ${post.title} (ID: ${post.id})`);
        });
      }
      
      if (options.dryRun) {
        console.log(chalk.green("\n✅ Dry run completed successfully"));
        console.log("   Remove --dry-run to execute import");
      } else {
        console.log(chalk.green("\n✅ Import completed successfully"));
      }
      
    } else {
      console.log(chalk.red("\n❌ Import failed:"));
      result.errors.forEach((error: any) => console.log(`   - ${error}`));
    }
    
  } catch (error: any) {
    console.error(chalk.red("❌ Import command failed:"), error.message);
    console.log(chalk.blue("\n📋 Setup required:"));
    console.log("   Run: udo wp setup");
    console.log("   Configure WordPress connection first");
  }
}

/**
 * WordPress Export Command with Options
 */
export async function cmdWpExportWithOptions(options: {
  all?: boolean;
  category?: string;
  tag?: string;
  since?: string;
  limit?: number;
  includeMedia?: boolean;
  dryRun?: boolean;
}): Promise<void> {
  try {
    const { UdosExporterFactory } = await import("../export/udos-exporter.js");
    const exporter = await UdosExporterFactory.getExporter();
    
    console.log(chalk.blue("\n📤 WordPress Export"));
    console.log("🎯 Exporting uDos notes to WordPress");
    
    // Build filter criteria
    const filterCriteria: any = {};
    if (options.category) filterCriteria.categories = [options.category];
    if (options.tag) filterCriteria.tags = [options.tag];
    if (options.since) filterCriteria.dateAfter = options.since;
    
    console.log(chalk.blue("\n📋 Export Options:"));
    console.log(`   All notes: ${options.all || false}`);
    console.log(`   Category: ${options.category || 'any'}`);
    console.log(`   Tag: ${options.tag || 'any'}`);
    console.log(`   Since: ${options.since || 'all time'}`);
    console.log(`   Limit: ${options.limit || 'none'}`);
    console.log(`   Include media: ${options.includeMedia || false}`);
    console.log(`   Dry run: ${options.dryRun || false}`);
    
    // Execute export
    const result = await exporter.exportNotes({
      dryRun: options.dryRun !== false, // Default to dry-run for safety
      limit: options.limit || 10,
      includeMedia: Boolean(options.includeMedia),
      filterCriteria: filterCriteria
    });
    
    if (result.success) {
      console.log(chalk.green("\n✅ Export Results:"));
      console.log(`   Total Notes: ${result.totalNotes}`);
      console.log(`   Exported: ${result.exported}`);
      console.log(`   Skipped: ${result.skipped}`);
      console.log(`   Duration: ${result.durationMs}ms`);
      
      if (result.exported > 0) {
        console.log(chalk.blue("\n📝 Sample exported notes:"));
        result.sampleNotes?.slice(0, 3).forEach(note => {
          console.log(`   - ${note.title} (ID: ${note.id})`);
        });
      }
      
      if (options.dryRun) {
        console.log(chalk.green("\n✅ Dry run completed successfully"));
        console.log("   Remove --dry-run to execute export");
      } else {
        console.log(chalk.green("\n✅ Export completed successfully"));
      }
      
    } else {
      console.log(chalk.red("\n❌ Export failed:"));
      result.errors.forEach((error: any) => console.log(`   - ${error}`));
    }
    
  } catch (error: any) {
    console.error(chalk.red("❌ Export command failed:"), error.message);
    console.log(chalk.blue("\n📋 Setup required:"));
    console.log("   Run: udo wp setup");
    console.log("   Configure WordPress connection first");
  }
}

/**
 * WordPress Status Command - Show connection status
 */
export async function cmdWpStatus(): Promise<void> {
  try {
    console.log(chalk.blue("\n🌐 WordPress Adaptor Status"));
    
    const client = await WordPressClientFactory.getClient();
    
    // Check environment variables
    const url = process.env.WORDPRESS_URL;
    const username = process.env.WORDPRESS_USERNAME;
    const password = process.env.WORDPRESS_APPLICATION_PASSWORD;
    
    if (url) {
      console.log(`✅ URL: ${url}`);
    } else {
      console.log("❌ URL: Not configured");
    }
    
    if (username) {
      console.log(`✅ Username: ${username}`);
    } else {
      console.log("❌ Username: Not configured");
    }
    
    if (password) {
      console.log(`✅ Application Password: Configured`);
    } else {
      console.log("❌ Application Password: Not configured");
    }
    
    console.log(`\n📋 Post Type: ${process.env.POST_TYPE || 'post'}`);
    
    // Test actual connection
    const connected = await client.testConnectivity();
    
    if (connected) {
      console.log(chalk.green("\n✅ Configuration: Complete"));
      console.log("   WordPress API is accessible");
      
      // Show user info if available
      try {
        const user = await client.getCurrentUser();
        console.log(`   Logged in as: ${user.name}`);
      } catch (error) {
        // User info not essential for status
      }
      
    } else {
      console.log(chalk.yellow("\n⚠️  Configuration: Incomplete"));
      console.log("   WordPress API not accessible");
      console.log("   Run: udo wp setup for configuration instructions");
    }
    
  } catch (error: any) {
    console.error(chalk.red("❌ Status check failed:"), error.message);
    if (error.code === 'wordpress_setup_error') {
      console.log("\n📋 Setup required:");
      console.log("   WORDPRESS_URL=https://your-site.com");
      console.log("   WORDPRESS_USERNAME=your-username");
      console.log("   WORDPRESS_APPLICATION_PASSWORD=your-password");
    }
  }
}