const ID = "18q95H4slpt6sgtkbEoq6m9rppCb-GAEX";

function getBlobById(id = ID) {
  return DriveApp.getFileById(id).getBlob();
}

function getBlobByIdAdvanced(id = ID) {
  // Does not work with alt: "media"
  try {
    return Drive.Files.get(id, { alt: "media" });
  } catch (e) {
    console.error(e.message);
  }
}

function getBlobByUrl(id = ID) {
  const url = `https://www.googleapis.com/drive/v3/files/${id}?alt=media`;
  return UrlFetchApp.fetch(url, {
    headers: {
      // This token will differ based upon the context of the script execution
      Authorization: `Bearer ${ScriptApp.getOAuthToken()}`,
    },
  }).getContent();
}

function test() {
  const driveAppBlob = getBlobById(ID);
  const driveAdvancedBlob = getBlobByIdAdvanced(ID);
  const urlFetchBlob = getBlobByUrl(ID);

  console.log({
    driveAppBytes: driveAppBlob.getBytes().slice(0, 10),
    driveAdvancedBytes: driveAdvancedBlob?.getBytes()?.slice(0, 10),
    urlFetchBlobBytes: urlFetchBlob.slice(0, 10),
  });
}
