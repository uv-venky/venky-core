import {
  createComment,
  genID,
  getComments,
  getCommentStats,
  getCommentView,
  reactToComment,
  setCommentView,
} from '../../../components/core/comments/comment-actions';
export const COMMENTS_ACTIONS = {
  createComment: createComment,
  genID: genID,
  getCommentStats: getCommentStats,
  getCommentView: getCommentView,
  getComments: getComments,
  reactToComment: reactToComment,
  setCommentView: setCommentView,
};
const BASE_ROLES = ['all_users'];
export const COMMENTS_ACTION_ACCESS_ROLES = {
  createComment: [...BASE_ROLES],
  genID: [...BASE_ROLES],
  getCommentStats: [...BASE_ROLES],
  getCommentView: [...BASE_ROLES],
  getComments: [...BASE_ROLES],
  reactToComment: [...BASE_ROLES],
  setCommentView: [...BASE_ROLES],
};
//# sourceMappingURL=comments.js.map
