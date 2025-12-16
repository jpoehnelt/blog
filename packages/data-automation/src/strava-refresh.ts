import axios from "axios";
import fs from "fs";
import sodium from "libsodium-wrappers";
import { Octokit } from "octokit";

const owner = "jpoehnelt";
const repo = "blog";

const main = async () => {
  // @ts-ignore
  const response = await axios.post(
    "https://www.strava.com/api/v3/oauth/token",
    {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: process.env.STRAVA_REFRESH_TOKEN,
    },
  );

  const octokit = new Octokit({ auth: process.env.REPO_TOKEN });

  const {
    data: { key_id: publicKeyId, key: publicKey },
  } = await octokit.request(
    "GET /repos/{owner}/{repo}/actions/secrets/public-key",
    { owner, repo },
  );

  console.log(`Public key fetched: ${publicKeyId}`);

  await Promise.all(
    ["access_token", "refresh_token"].map(async (field) => {
      const secretName = `STRAVA_${field.toUpperCase()}`;

      // Convert the message and key to Uint8Array (Buffer implements that interface)
      const messageBytes = Buffer.from(response.data[field]);
      const keyBytes = Buffer.from(publicKey, "base64");
      // Encrypt using LibSodium.
      await sodium.ready;
      const encryptedBytes = sodium.crypto_box_seal(messageBytes, keyBytes);
      // Base64 the encrypted secret
      const encrypted_value = Buffer.from(encryptedBytes).toString("base64");

      await octokit.request(
        "PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}",
        {
          owner,
          repo,
          secret_name: secretName,
          encrypted_value,
          key_id: publicKeyId,
        },
      );
    }),
  );

  if (process.env.GITHUB_ENV) {
    console.log(`::add-mask::${response.data.access_token}`);
    console.log(`::add-mask::${response.data.refresh_token}`);
    fs.appendFileSync(
      process.env.GITHUB_ENV,
      `STRAVA_ACCESS_TOKEN=${response.data.access_token}\n`,
    );
    fs.appendFileSync(
      process.env.GITHUB_ENV,
      `STRAVA_REFRESH_TOKEN=${response.data.refresh_token}\n`,
    );
  }

  return response.data.access_token;
};

await main();
