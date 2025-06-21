import { ProjectFeedback, FeedbackFormData, PlatformFeedback, PlatformFeedbackFormData } from '../types/feedback';

class FeedbackService {
  private static instance: FeedbackService;

  public static getInstance(): FeedbackService {
    if (!FeedbackService.instance) {
      FeedbackService.instance = new FeedbackService();
    }
    return FeedbackService.instance;
  }

  async submitProjectFeedback(projectId: string, feedbackData: FeedbackFormData): Promise<ProjectFeedback> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Get user from localStorage (in a real app, this would come from the auth context)
    const storedUser = localStorage.getItem('auth_user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user) {
      throw new Error('User not authenticated');
    }

    const feedback: ProjectFeedback = {
      id: Date.now().toString(),
      projectId,
      userId: user.uuid,
      ...feedbackData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store feedback in localStorage (in a real app, this would be sent to the backend)
    const existingFeedback = this.getStoredProjectFeedback();
    const updatedFeedback = [...existingFeedback, feedback];
    localStorage.setItem('project_feedback', JSON.stringify(updatedFeedback));

    return feedback;
  }

  async submitPlatformFeedback(feedbackData: PlatformFeedbackFormData): Promise<PlatformFeedback> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Get user from localStorage
    const storedUser = localStorage.getItem('auth_user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user) {
      throw new Error('User not authenticated');
    }

    const feedback: PlatformFeedback = {
      id: Date.now().toString(),
      userId: user.uuid,
      ...feedbackData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store platform feedback in localStorage
    const existingFeedback = this.getStoredPlatformFeedback();
    const updatedFeedback = [...existingFeedback, feedback];
    localStorage.setItem('platform_feedback', JSON.stringify(updatedFeedback));

    return feedback;
  }

  async getFeedbackForProject(projectId: string): Promise<ProjectFeedback[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const allFeedback = this.getStoredProjectFeedback();
    return allFeedback.filter(feedback => feedback.projectId === projectId);
  }

  async getFeedbackForUser(userId: string): Promise<ProjectFeedback[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const allFeedback = this.getStoredProjectFeedback();
    return allFeedback.filter(feedback => feedback.userId === userId);
  }

  async getPlatformFeedbackForUser(userId: string): Promise<PlatformFeedback[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const allFeedback = this.getStoredPlatformFeedback();
    return allFeedback.filter(feedback => feedback.userId === userId);
  }

  private getStoredProjectFeedback(): ProjectFeedback[] {
    try {
      const stored = localStorage.getItem('project_feedback');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error parsing stored project feedback:', error);
      return [];
    }
  }

  private getStoredPlatformFeedback(): PlatformFeedback[] {
    try {
      const stored = localStorage.getItem('platform_feedback');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error parsing stored platform feedback:', error);
      return [];
    }
  }

  async deleteFeedback(feedbackId: string): Promise<void> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const allProjectFeedback = this.getStoredProjectFeedback();
    const updatedProjectFeedback = allProjectFeedback.filter(feedback => feedback.id !== feedbackId);
    localStorage.setItem('project_feedback', JSON.stringify(updatedProjectFeedback));

    const allPlatformFeedback = this.getStoredPlatformFeedback();
    const updatedPlatformFeedback = allPlatformFeedback.filter(feedback => feedback.id !== feedbackId);
    localStorage.setItem('platform_feedback', JSON.stringify(updatedPlatformFeedback));
  }
}

export default FeedbackService.getInstance();