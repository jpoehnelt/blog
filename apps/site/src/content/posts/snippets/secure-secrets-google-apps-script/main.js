function main() {
  // Get the Script Properties
  const scriptProperties = PropertiesService.getScriptProperties();

  // Properties are Strings
  const API_KEY = scriptProperties.getProperty("API_KEY");
  console.log(API_KEY);

  // Properties can be parsed as Number
  const A_NUMBER = Number.parseFloat(scriptProperties.getProperty("A_NUMBER"));
  console.log(A_NUMBER, typeof A_NUMBER);

  // Properties can be JSON strings
  const SERVICE_ACCOUNT_KEY = JSON.parse(
    scriptProperties.getProperty("SERVICE_ACCOUNT_KEY") ?? "{}",
  );
  console.log(SERVICE_ACCOUNT_KEY);
}
