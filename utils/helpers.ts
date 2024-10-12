export const avatarFLGen = (str: string): string => {
  if (!str) return "";
  const arrStr = str.split(" ");

  let firstLetter = arrStr[0][0];

  if (arrStr.length === 1) {
    return firstLetter;
  }
  const lastWord = arrStr[arrStr.length - 1];

  return `${firstLetter}${lastWord[0]}`;
};
