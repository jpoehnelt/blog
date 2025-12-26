function main() {
  const db = new FirestoreService(PROJECT_ID, DATABASE_ID);
  const doc = {
    fields: {
      foo: {
        stringValue: "test",
      },
    },
  };

  console.log(db.patch("/kv/test", {}, doc));
  console.log(db.get("/kv/test"));
  console.log(db.delete("/kv/test"));
}
