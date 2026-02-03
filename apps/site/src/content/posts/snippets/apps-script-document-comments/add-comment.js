/**
 * Adds a simple comment to a file.
 * @param {string} fileId - The file ID (Doc, Sheet, Slide, etc.)
 * @param {string} content - The comment text
 * @returns {Object} The created comment
 */
function addComment(fileId, content) {
  const comment = Drive.Comments.create(
    { content: content },
    fileId
  );

  Logger.log(`Comment added: ${comment.id}`);
  return comment;
}

/**
 * Adds a comment anchored to specific quoted text.
 * @param {string} fileId - The file ID
 * @param {string} content - The comment text
 * @param {string} quotedText - Text in the document to anchor to
 * @returns {Object} The created comment
 */
function addAnchoredComment(fileId, content, quotedText) {
  const comment = Drive.Comments.create(
    {
      content: content,
      quotedFileContent: {
        value: quotedText  // This text must exist in the document
      }
    },
    fileId
  );

  Logger.log(`Anchored comment added: ${comment.id}`);
  return comment;
}

/**
 * Example: Add comments to active document
 */
function addReviewComment() {
  const docId = DocumentApp.getActiveDocument().getId();

  // Simple comment
  addComment(docId, 'Great work on this draft!');

  // Anchored comment (the quoted text must exist)
  addAnchoredComment(
    docId,
    'Please clarify this section.',
    'TODO'  // Will anchor to the word "TODO" in the doc
  );
}
