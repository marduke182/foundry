import { sanitizeContent } from './utils';

const valid = '@Item[fUCcfBx1tnJZWa51]{Red Claw Secret Ingredients}';
const withSpace = '@Item [fUCcfBx1tnJZWa51] {Red Claw Secret Ingredients}';

describe('sanitizeContent', () => {
  test.each`
    case                                    | content      | expected
    ${'keep the same with a valid content'} | ${valid}     | ${valid}
    ${'remove the withe spaces'}            | ${withSpace} | ${valid}
  `('should $case', ({ content, expected }) => {
    expect(sanitizeContent(content)).toBe(expected);
  });
});
