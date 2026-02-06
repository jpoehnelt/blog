/**
 * Replies to an existing comment.
 * @param {string} fileId - The file ID
 * @param {string} commentId - The comment ID to reply to
 * @param {string} replyContent - The reply text
 * @returns {Object} The created reply
 */
function replyToComment(fileId, commentId, replyContent) {
  const reply = Drive.Replies.create(
    { content: replyContent },
    fileId,
    commentId
  );

  Logger.log(`Reply added: ${reply.id}`);
  return reply;
}

/**
 * Resolves a comment.
 * @param {string} fileId - The file ID
 * @param {string} commentId - The comment ID to resolve
 */
function resolveComment(fileId, commentId) {
  Drive.Comments.update(
    { resolved: true },
    fileId,
    commentId
  );

  Logger.log(`Comment ${commentId} resolved`);
}

/**
 * Deletes a comment (only works for comments you created).
 * @param {string} fileId - The file ID
 * @param {string} commentId - The comment ID to delete
 */
function deleteComment(fileId, commentId) {
  Drive.Comments.remove(fileId, commentId);
  Logger.log(`Comment ${commentId} deleted`);
}

/**
 * Example: Reply to all unresolved comments
 */
function autoReplyToComments() {
  const docId = DocumentApp.getActiveDocument().getId();
  const unresolvedComments = getUnresolvedComments(docId);

  unresolvedComments.forEach(comment => {
    replyToComment(
      docId,
      comment.id,
      'Thanks for the feedback! I will address this.'
    );
  });

  Logger.log(`Replied to ${unresolvedComments.length} comments`);
}
