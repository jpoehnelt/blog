/**
 * Gets all comments on a file.
 * @param {string} fileId - The file ID
 * @returns {Object[]} Array of comments
 */
function getComments(fileId) {
  const response = Drive.Comments.list(fileId, {
    fields: 'comments(id,content,author,quotedFileContent,resolved,replies)'
  });

  return response.comments || [];
}

/**
 * Gets only unresolved comments.
 * @param {string} fileId - The file ID
 * @returns {Object[]} Array of unresolved comments
 */
function getUnresolvedComments(fileId) {
  const allComments = getComments(fileId);
  return allComments.filter(c => !c.resolved);
}

/**
 * Example: List all comments on active document
 */
function listDocumentComments() {
  const docId = DocumentApp.getActiveDocument().getId();
  const comments = getComments(docId);

  if (comments.length === 0) {
    Logger.log('No comments found');
    return;
  }

  comments.forEach(comment => {
    Logger.log(`\n--- Comment by ${comment.author.displayName} ---`);
    Logger.log(`Content: ${comment.content}`);

    if (comment.quotedFileContent) {
      Logger.log(`Quoted: "${comment.quotedFileContent.value}"`);
    }

    Logger.log(`Resolved: ${comment.resolved || false}`);

    if (comment.replies && comment.replies.length > 0) {
      Logger.log(`Replies: ${comment.replies.length}`);
      comment.replies.forEach(reply => {
        Logger.log(`  - ${reply.author.displayName}: ${reply.content}`);
      });
    }
  });
}
