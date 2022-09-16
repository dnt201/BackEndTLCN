export function ChangeEnumToArray(enumObject) {
  return Object.keys(enumObject).map((key) => {
    return {
      permission: key,
      displayName: enumObject[key],
    };
  });
}
