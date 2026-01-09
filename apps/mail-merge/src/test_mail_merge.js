/**
 * Local Verification Script for Mail Merge Logic
 */
import assert from 'assert';

// 1. MOCK logic from mail-merge.js (Copy-Paste of Pure Functions)
function personalizeContent_(htmlTemplate, subjectTemplate, headers, row) {
  let html = htmlTemplate;
  let subject = subjectTemplate;

  headers.forEach((header, colIdx) => {
    const value = row[colIdx];
    // Safety: Escape special characters like $ or ? so they don't break the code
    const escapedHeader = header.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const placeholder = new RegExp(`{{${escapedHeader}}}`, "g");
    html = html.replace(placeholder, value);
    subject = subject.replace(placeholder, value);
  });

  // Check for undefined placeholders in the HTML and Subject
  const undefinedPlaceholders = new Set([
    ...(html.match(/{{[^}]+}}/g) || []),
    ...(subject.match(/{{[^}]+}}/g) || []),
  ]);
  if (undefinedPlaceholders.size > 0) {
    throw new Error(
      `Undefined placeholders found: ${Array.from(undefinedPlaceholders).join(", ")}`,
    );
  }

  return { html, subject };
}

function mapInlineImages_(allAttachments, htmlBody) {
    const inlineImages = {};
    const attachments = [];
  
    allAttachments.forEach((att) => {
      const name = att.getName();
      let cid = null;
  
      if (htmlBody.includes(`cid:${name}`)) {
        cid = name;
      } else if (att.getContentType().startsWith("image/")) {
        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const imgTagMatch = htmlBody.match(
          new RegExp(`<img[^>]+alt="${escapedName}"[^>]*>`, "i"),
        );
        if (imgTagMatch) {
          const srcMatch = imgTagMatch[0].match(/src="cid:([^"]+)"/);
          if (srcMatch) {
            cid = srcMatch[1];
          }
        }
      }
  
      if (cid) {
        inlineImages[cid] = att;
      } else {
        attachments.push(att);
      }
    });
  
    return { inlineImages, attachments };
  }

// 2. TESTS
console.log("Running Mail Merge Logic Tests...");

try {
    // TEST 1: Basic Personalization
    const headers = ["First Name", "Email"];
    const row = ["John", "john@example.com"];
    const html = "Hi {{First Name}}, email is {{Email}}";
    const subject = "Welcome {{First Name}}";
    
    const res = personalizeContent_(html, subject, headers, row);
    assert.strictEqual(res.html, "Hi John, email is john@example.com");
    assert.strictEqual(res.subject, "Welcome John");
    console.log("✅ Basic Personalization: PASS");

    // TEST 2: Missing Placeholder (Safety)
    try {
        personalizeContent_("Hi {{Missing}}", "Subject", headers, row);
        console.error("❌ Missing Placeholder: FAIL (Should have thrown)");
    } catch (e) {
        assert.ok(e.message.includes("Undefined placeholders found"));
        console.log("✅ Missing Placeholder Check: PASS");
    }

    // TEST 3: Special Characters in Headers
    const weirdHeaders = ["Name (Full)", "Role?"];
    const weirdRow = ["Jane", "Admin"];
    const weirdHtml = "Hello {{Name (Full)}}, are you {{Role?}}";
    const weirdRes = personalizeContent_(weirdHtml, "Subject", weirdHeaders, weirdRow);
    assert.strictEqual(weirdRes.html, "Hello Jane, are you Admin");
    console.log("✅ Special Char Headers: PASS");

    // TEST 4: Attachment Mapping
    const mockAttachments = [
        { getName: () => "logo.png", getContentType: () => "image/png" },
        { getName: () => "doc.pdf", getContentType: () => "application/pdf" }
    ];
    // Case A: CID explicitly in body
    const htmlWithCid = 'Body <img src="cid:logo.png">';
    const map1 = mapInlineImages_(mockAttachments, htmlWithCid);
    assert.ok(map1.inlineImages['logo.png']);
    assert.strictEqual(map1.attachments.length, 1); // PDF remaining
    console.log("✅ Explicit CID Mapping: PASS");

    // Case B: Alt Text Mapping (Gmail style)
    const htmlWithAlt = 'Body <img src="cid:google-generated-cid" alt="logo.png">';
    const map2 = mapInlineImages_(mockAttachments, htmlWithAlt);
    assert.ok(map2.inlineImages['google-generated-cid']); // Should find it via alt
    console.log("✅ Alt Text Mapping: PASS");


} catch (e) {
    console.error("FAILED:", e);
    process.exit(1);
}

console.log("All Tests Passed!");
