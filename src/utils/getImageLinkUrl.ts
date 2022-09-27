import { User } from 'src/modules/users/entities/user.entity';

export function getUserWithImageLink(user: User) {
  const data = {
    ...user,
    dateCreated: undefined,
    dateModified: undefined,
    dateDeleted: undefined,
    password: undefined,
    deleted: undefined,
    token: undefined,
    dateExpires: undefined,
    isActive: undefined,
    avatarId: undefined,
    currentHashedRefreshToken: undefined,
    avatarLink: user.avatarId
      ? `http://localhost:3000/file/${user.avatarId}`
      : null,
  };
  return data;
}
