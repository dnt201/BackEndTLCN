import { PostWithMoreInfo } from 'src/modules/posts/dtos/PostWithMoreInfo.dto';

export function ConvertPostWithMoreInfo(data) {
  const requestToFile = 'http://localhost:3000/file';

  const dataReturn: PostWithMoreInfo = {
    id: data.id,
    title: data.title,
    dateModified: data.dateModified,
    owner: {
      id: data.owner.id,
      username: data.owner.username,
      avatarLink: data.owner.avatarId
        ? `${requestToFile}${data.owner.avatarId}`
        : '',
    },
    category: data.category,
    tags: data.tags,
    like: data.vote,
    view: data.views,
    comment:
      (data.commentCount ? data.commentCount : 0) +
      (data.replyCount ? data.replyCount : 0),
    isFollow: false,
  };
  return dataReturn;
}
