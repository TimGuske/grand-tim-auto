// Each line occurs once per shuffled round. Only actual passants can speak.
export function createPassantLines(passants, phrases, random = Math.random) {
 let bag = [], last;
 return person => {
  if (!passants.includes(person) || !phrases.length) return null;
  if (!bag.length) {
   bag = [...phrases];
   for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
   }
   if (bag.length > 1 && bag[bag.length - 1] === last) [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
  }
  return last = bag.pop();
 };
}
