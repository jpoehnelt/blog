import * as firebaseAdmin from "firebase-admin";
import * as functions from "firebase-functions";

export default functions.pubsub
  .topic("firestore-activity")
  .onPublish(async (message) => {
    const { data } = message;
    const { timestamp, protoPayload } = JSON.parse(
      Buffer.from(data, "base64").toString(),
    );

    const uid =
      protoPayload.authenticationInfo.thirdPartyPrincipal.payload.user_id;

    const writes = protoPayload.request.writes;

    const activityRef = firebaseAdmin
      .firestore()
      .collection("users")
      .doc(uid)
      .collection("activity");

    await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      writes.map((write: any) => {
        activityRef.add({ write, timestamp });
      }),
    );
  });
