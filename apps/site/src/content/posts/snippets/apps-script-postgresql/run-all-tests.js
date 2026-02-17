function runAllTests() {
  console.log("=== STARTING POSTGRES TESTS ===");

  try {
    testConnection();
    testModernTypes();
    testParameterizedInsert();
    testTransactionRollback();
    testPerformance();
    console.log("=== ALL TESTS PASSED SUCCESSFULLY ===");
  } catch (e) {
    console.error("!!! TEST SUITE FAILED !!!");
    console.error(e.message);
  }
}
