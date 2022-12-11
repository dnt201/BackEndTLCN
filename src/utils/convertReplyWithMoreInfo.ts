import {
  ReplyWithMoreInfo,
  ReplyWithMoreInfoDTO,
  UserFewerDetail,
} from 'src/modules/posts/dtos/commentWithMoreInfo.dto';

export function ConvertReplyWithMoreInfo(data: ReplyWithMoreInfoDTO) {
  const tempData: UserFewerDetail[] = [];
  const requestToFile = 'http://localhost:3000/file/';

  const postCommentTag = data.postReplyTags;

  postCommentTag.map((data) => {
    tempData.push(new UserFewerDetail(data.sender.id, data.sender.username));
  });

  const dataReturn: ReplyWithMoreInfo = {
    replyId: data.replyId,
    content: data.content,
    dateModified: data.dateModified,
    sender: {
      id: data.sender.id,
      username: data.sender.username,
      avatarLink: data.sender.avatarId
        ? `${requestToFile}${data.sender.avatarId}`
        : null,
    },
    replyTag: [...tempData],
  };
  return dataReturn;
}
