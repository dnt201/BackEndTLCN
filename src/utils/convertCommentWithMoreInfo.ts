import {
  CommentWithMoreInfo,
  CommentWithMoreInfoDTO,
  UserFewerDetail,
} from 'src/modules/posts/dtos/commentWithMoreInfo.dto';

export function ConvertCommentWithMoreInfo(data: CommentWithMoreInfoDTO) {
  const tempData: UserFewerDetail[] = [];
  const requestToFile = 'http://localhost:3000/file/';

  const postCommentTag = data.postCommentTags;

  console.log(tempData);
  postCommentTag.map((data) => {
    tempData.push(new UserFewerDetail(data.sender.id, data.sender.username));
  });

  const dataReturn: CommentWithMoreInfo = {
    commentId: data.commentId,
    content: data.content,
    countReply: data.countReply,
    dateModified: data.dateModified,
    sender: {
      id: data.sender.id,
      username: data.sender.username,
      avatarLink: data.sender.avatarId
        ? `${requestToFile}${data.sender.avatarId}`
        : null,
    },
    commentTag: [...tempData],
  };
  return dataReturn;
}
