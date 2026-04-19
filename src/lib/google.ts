import { google, Auth } from "googleapis";
import { prisma } from "./prisma";

/**
 * Helper to get authenticated Google APIs.
 * It fetches the OAuth token from Prisma DB for the specific user.
 */
export async function getGoogleApis(userId: string) {
  // If demo user, we return null or a mock (we should only use this for real users)
  if (userId === "demo-user") {
    return null;
  }

  const account = await prisma.account.findFirst({
    where: {
      userId: userId,
      provider: "google",
    },
  });

  if (!account || !account.access_token) {
    throw new Error("Google account not found or access token missing for user.");
  }

  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    // Google API redirect URI is usually handled via NextAuth, we don't need it for server calls
    // but the library wants something
    process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/auth/callback/google` : ""
  );

  oAuth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
    token_type: account.token_type ?? "Bearer",
  });

  // Automatically parse refresh events to update Prisma
  oAuth2Client.on("tokens", async (tokens) => {
    if (tokens.refresh_token || tokens.access_token) {
      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: tokens.access_token ?? account.access_token,
          refresh_token: tokens.refresh_token ?? account.refresh_token,
          expires_at: tokens.expiry_date ? Math.floor(tokens.expiry_date / 1000) : account.expires_at,
        },
      });
    }
  });

  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
  const drive = google.drive({ version: "v3", auth: oAuth2Client });

  return { gmail, calendar, drive, oAuth2Client };
}
