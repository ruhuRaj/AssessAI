import fs from 'fs/promises';
import path from 'path';
import { Assignment } from '../models/Assignment';
import { QuestionPaper } from '../models/QuestionPaper';
import { User } from '../models/User';
import { clearOtpsForEmail } from './otpService';
import { deleteProfileImage } from './cloudinaryService';

export async function deleteUserAccount(userId: string): Promise<void> {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const assignments = await Assignment.find({ teacherId: userId }).select('_id');
  const assignmentIds = assignments.map((a) => a._id);

  if (assignmentIds.length > 0) {
    await QuestionPaper.deleteMany({ assignmentId: { $in: assignmentIds } });
    await Assignment.deleteMany({ teacherId: userId });
  }

  if (user.profileImageUrl?.includes('res.cloudinary.com')) {
    await deleteProfileImage(user.profileImageUrl);
  } else if (user.profileImageUrl?.startsWith('/uploads/')) {
    const filePath = path.join(
      process.cwd(),
      user.profileImageUrl.replace(/^\//, '')
    );
    try {
      await fs.unlink(filePath);
    } catch {
      /* file may already be missing */
    }
  }

  await clearOtpsForEmail(user.email);
  await User.deleteOne({ _id: userId });
}
