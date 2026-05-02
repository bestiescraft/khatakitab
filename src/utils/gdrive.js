const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';

let tokenClient;
let isGapiLoaded = false;
let isGsiLoaded = false;

// We will use import.meta.env.VITE_GOOGLE_CLIENT_ID
export const initGoogleClient = (clientId, onToken) => {
  return new Promise((resolve, reject) => {
    // Load gapi
    const loadGapi = () => {
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            discoveryDocs: [DISCOVERY_DOC],
          });
          isGapiLoaded = true;
          if (isGsiLoaded) resolve();
        } catch (e) {
          reject(e);
        }
      });
    };

    if (window.gapi && window.gapi.client) {
      loadGapi();
    } else {
      // Listen for a custom event or just poll (simplest for now)
      const interval = setInterval(() => {
        if (window.gapi) {
          clearInterval(interval);
          loadGapi();
        }
      }, 100);
    }

    // Load GIS
    const loadGsi = () => {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: (resp) => {
          if (resp.error !== undefined) {
            reject(resp);
          }
          if (onToken) onToken(resp);
        },
      });
      isGsiLoaded = true;
      if (isGapiLoaded) resolve();
    };

    if (window.google && window.google.accounts) {
      loadGsi();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          loadGsi();
        }
      }, 100);
    }
  });
};

export const signIn = () => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) return reject(new Error('Google client not initialized'));
    tokenClient.callback = (resp) => {
      if (resp.error !== undefined) {
        reject(resp);
      }
      resolve(resp);
    };
    if (window.gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
};

export const checkSignInStatus = () => {
  return window.gapi && window.gapi.client && window.gapi.client.getToken() !== null;
};

// --- Drive API Helpers ---

const FILENAME = 'khatakitab_backup.json';

// Uploads data to the appDataFolder
export const uploadToDrive = async (data) => {
  if (!checkSignInStatus()) throw new Error('Not signed in');

  const fileMetadata = {
    name: FILENAME,
    parents: ['appDataFolder'],
  };

  const fileContent = JSON.stringify(data);
  const file = new Blob([fileContent], { type: 'application/json' });

  // First, check if file exists
  let fileId = null;
  const res = await window.gapi.client.drive.files.list({
    spaces: 'appDataFolder',
    q: `name='${FILENAME}'`,
    fields: 'files(id, name)',
  });

  if (res.result.files && res.result.files.length > 0) {
    fileId = res.result.files[0].id;
  }

  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(fileMetadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    fileContent +
    close_delim;

  let request;
  if (fileId) {
    // Update existing
    request = window.gapi.client.request({
      path: `/upload/drive/v3/files/${fileId}`,
      method: 'PATCH',
      params: { uploadType: 'multipart' },
      headers: {
        'Content-Type': 'multipart/related; boundary="' + boundary + '"'
      },
      body: multipartRequestBody
    });
  } else {
    // Create new
    request = window.gapi.client.request({
      path: '/upload/drive/v3/files',
      method: 'POST',
      params: { uploadType: 'multipart' },
      headers: {
        'Content-Type': 'multipart/related; boundary="' + boundary + '"'
      },
      body: multipartRequestBody
    });
  }

  return new Promise((resolve, reject) => {
    request.execute((fileInfo, rawResponse) => {
      if (fileInfo && fileInfo.error) {
        reject(fileInfo.error);
      } else {
        resolve(fileInfo);
      }
    });
  });
};

export const downloadFromDrive = async () => {
  if (!checkSignInStatus()) throw new Error('Not signed in');

  const res = await window.gapi.client.drive.files.list({
    spaces: 'appDataFolder',
    q: `name='${FILENAME}'`,
    fields: 'files(id, name)',
  });

  if (!res.result.files || res.result.files.length === 0) {
    throw new Error('No backup found on Google Drive');
  }

  const fileId = res.result.files[0].id;
  const fileRes = await window.gapi.client.drive.files.get({
    fileId: fileId,
    alt: 'media'
  });

  if (fileRes.status !== 200) {
    throw new Error('Failed to download file');
  }

  // The body contains the JSON string
  try {
    const data = typeof fileRes.body === 'string' ? JSON.parse(fileRes.body) : fileRes.result;
    return data;
  } catch (e) {
    throw new Error('Corrupted backup file format.');
  }
};
