import cron from 'node-cron';
import Content from '../models/Content.js';
import { deleteLocalFile } from '../config/storage.js';

export const startCleanupJob = () => {
  // Run cleanup every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('🧹 Running cleanup job...');
      
      const now = new Date();
      const expiredContent = await Content.find({
        expiresAt: { $lt: now }
      });

      if (expiredContent.length === 0) {
        console.log('✅ No expired content found');
        return;
      }

      console.log(`Found ${expiredContent.length} expired items`);

      for (const content of expiredContent) {
        // Delete local file if it exists
        if (content.type === 'file' && content.filePath) {
          try {
            await deleteLocalFile(content.filePath);
          } catch (error) {
            console.error(`Error deleting file for ${content.uniqueId}:`, error.message);
          }
        }

        // Delete from database
        await Content.deleteOne({ _id: content._id });
        console.log(`🗑️ Deleted expired content: ${content.uniqueId}`);
      }

      console.log('✅ Cleanup job completed');
    } catch (error) {
      console.error('❌ Cleanup job error:', error);
    }
  });

  console.log('✅ Cleanup job scheduled (runs every 5 minutes)');
};
