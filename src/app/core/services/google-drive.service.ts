import { Injectable } from '@angular/core';

declare const gapi: any;
declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleDriveService {
  CLIENT_ID = '188496892052-bmc37e46gt3an0hvlubg9r7s1v8p09nc.apps.googleusercontent.com';
  SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata.readonly';

  accessToken: string = '';
  private initialized = false;
  private folderCache: { [name: string]: string } = {};

  initClient(): Promise<boolean> {
    if (this.initialized) {
      return Promise.resolve(true);
    }

    return new Promise((resolve, reject) => {
      const checkGapi = () => {
        if (typeof gapi !== 'undefined') {
          gapi.load('client', async () => {
            try {
              await gapi.client.init({
                discoveryDocs: [
                  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
                ]
              });
              this.initialized = true;
              resolve(true);
            } catch (err) {
              console.error('Error initializing gapi client:', err);
              resolve(false);
            }
          });
        } else {
          setTimeout(checkGapi, 200);
        }
      };
      checkGapi();
    });
  }

  async login(): Promise<any> {
    if (this.accessToken) {
      return Promise.resolve({ access_token: this.accessToken });
    }

    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 25; // 5 seconds max wait

      const checkGoogle = () => {
        if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
          try {
            const tokenClient = google.accounts.oauth2.initTokenClient({
              client_id: this.CLIENT_ID,
              scope: this.SCOPES,
              callback: (tokenResponse: any) => {
                if (tokenResponse.error) {
                  const errorMsg = tokenResponse.error_description || tokenResponse.error;
                  if (tokenResponse.error === 'access_denied') {
                    reject(new Error('Access Denied (403): Your Google account is not listed under "Test Users" in Google Cloud Console, or http://localhost:4200 is missing from Authorized Origins. Please add your email in Google Cloud Console -> OAuth consent screen -> Test users, or paste the file URL manually.'));
                  } else if (tokenResponse.error === 'popup_closed_by_user') {
                    reject(new Error('Google authorization popup was closed before completion.'));
                  } else if (tokenResponse.error === 'popup_failed_to_open') {
                    reject(new Error('Browser blocked the Google sign-in popup. Please allow popups for this site.'));
                  } else {
                    reject(new Error(`Google auth error (${tokenResponse.error}): ${errorMsg}`));
                  }
                  return;
                }
                this.accessToken = tokenResponse.access_token;
                resolve(tokenResponse);
              }
            });

            // Use prompt: '' so GIS doesn't force re-consent popups unnecessarily
            tokenClient.requestAccessToken({ prompt: '' });
          } catch (err: any) {
            reject(new Error('Failed to launch Google auth popup. Please check popup blocker settings.'));
          }
        } else {
          attempts++;
          if (attempts >= maxAttempts) {
            reject(new Error('Google Identity Services SDK failed to load. Please check internet connection.'));
          } else {
            setTimeout(checkGoogle, 200);
          }
        }
      };

      checkGoogle();
    });
  }

  async getFolderIdByName(folderName: string): Promise<string | null> {
    if (this.folderCache[folderName]) {
      return this.folderCache[folderName];
    }

    try {
      const query = encodeURIComponent(`name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.files && data.files.length > 0) {
          const folderId = data.files[0].id;
          this.folderCache[folderName] = folderId;
          return folderId;
        }
      }
    } catch (err) {
      console.warn(`Could not query Google Drive folder "${folderName}":`, err);
    }
    return null;
  }

  async uploadFile(file: File, folderName?: string): Promise<{ id: string; name: string; url: string }> {
    await this.initClient();

    if (!this.accessToken) {
      await this.login();
    }

    const parents: string[] = [];
    if (folderName) {
      const folderId = await this.getFolderIdByName(folderName);
      if (folderId) {
        parents.push(folderId);
      }
    }

    const metadata: any = {
      name: file.name,
      mimeType: file.type
    };

    if (parents.length > 0) {
      metadata.parents = parents;
    }

    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    form.append('file', file);

    const uploadResponse = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webContentLink,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        },
        body: form
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      // If token expired, clear token and retry login once
      if (uploadResponse.status === 401) {
        this.accessToken = '';
        await this.login();
        return this.uploadFile(file, folderName);
      }
      throw new Error(`Google Drive Upload failed (${uploadResponse.status}): ${errorText}`);
    }

    const fileData = await uploadResponse.json();
    const fileId = fileData.id;

    // Make the uploaded file publicly readable so images display on the website
    try {
      await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            role: 'reader',
            type: 'anyone'
          })
        }
      );
    } catch (permErr) {
      console.warn('Failed to set public permission on Google Drive file:', permErr);
    }

    const directUrl = `https://lh3.googleusercontent.com/d/${fileId}=s0`;

    return {
      id: fileId,
      name: fileData.name,
      url: directUrl
    };
  }
}
