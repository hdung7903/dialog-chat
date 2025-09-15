import type { Context } from 'hono';
import passport from 'passport';
import { handleGoogleAuthSuccess } from '../config/passport.js';

export class GoogleAuthController {
  /**
   * Initiate Google OAuth flow
   */
  static googleAuth(c: Context) {
    // Redirect to Google OAuth login page
    passport.authenticate('google', { scope: ['profile', 'email'] })(c.req, c.res);
    return c.body(null);
  }

  /**
   * Handle Google OAuth callback
   */
  static async googleCallback(c: Context) {
    return new Promise<Response>((resolve) => {
      passport.authenticate('google', { session: false }, async (err: Error | null, user: any) => {
        if (err || !user) {
          const redirectUrl = `${process.env.FRONTEND_URL}/login?error=Google authentication failed`;
          return resolve(c.redirect(redirectUrl));
        }
        
        // Generate tokens
        const result = await handleGoogleAuthSuccess(user._id.toString());
        
        if (!result.success || !result.accessToken || !result.refreshToken) {
          const redirectUrl = `${process.env.FRONTEND_URL}/login?error=Failed to create authentication tokens`;
          return resolve(c.redirect(redirectUrl));
        }
        
        // Redirect to frontend with tokens
        const redirectUrl = `${process.env.FRONTEND_URL}/login/success?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;
        return resolve(c.redirect(redirectUrl));
      })(c.req, c.res);
    });
  }
}