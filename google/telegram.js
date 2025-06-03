const os = require('os');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

async function downloadFile(fileId, token) {
  const base = `https://api.telegram.org/bot${token}`;
  const fileRes = await axios.get(`${base}/getFile?file_id=${fileId}`);
  const filePath = fileRes.data.result.file_path;

  const url = `https://api.telegram.org/file/bot${token}/${filePath}`;

  const tempDir = os.tmpdir();  // от тут
  const localPath = path.join(tempDir, path.basename(filePath));

  const writer = fs.createWriteStream(localPath);
  const response = await axios({ url, method: 'GET', responseType: 'stream' });
  response.data.pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });

  return localPath;
}

module.exports = { downloadFile };
