import { segmark } from './segmark';

global.fetch = jest.fn();

const str1 = `# Some title
asdasd

asdads

`;
const str2 = `## Another title`;
const str3 = '### Non-delineated Markdown';
const obj = { abc: [1, 2, 3] };

describe('Function "segmark"', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('Should find all the markdown sections delineated with "±"', async () => {
    const mardownStr = `±someVar
      ${str1}
      ±someVar
      
      ±someOtherVar
      ${str2}
      ±someOtherVar
      
      ±dataVar
      ${JSON.stringify(obj)}
      ±dataVar
      ${str3}
    `;
    const markdowns = await segmark(mardownStr);

    expect(markdowns).toEqual({
      someVar: str1.trim(),
      someOtherVar: str2.trim(),
      dataVar: obj,
    });
  });

  it('Should return markdown when there are no delineations', async () => {
    const mardownStrNotDelineated = `
      ${str1}
      
      ${str2}
      
      ${str3}
    `;
    const markdowns = await segmark(mardownStrNotDelineated);

    expect(markdowns).toEqual(mardownStrNotDelineated.trim());
  });

  it("Should ignore any any segments which don't have a key or value", async () => {
    const mardownStr = `±someVar ±someVar`;
    const markdowns = await segmark(mardownStr);

    expect(markdowns).toEqual({});
  });

  it("Should include greymatter vars if they're defined", async () => {
    const greyMatterVarName = 'someGreyMatter';
    const greyMatterValue = 'This is a greymatter variable';
    const mardownStr = `---\n${greyMatterVarName}: ${greyMatterValue}\n---\n±someVar ±someVar`;
    const markdowns = await segmark(mardownStr);

    expect(markdowns).toEqual({ vars: { [greyMatterVarName]: greyMatterValue } });
  });

  it('Should not include greymatter vars if none are defined in the greymatter area', async () => {
    const mardownStr = `---\n\n---\n±someVar ±someVar`;
    const markdowns = await segmark(mardownStr);

    expect(markdowns).toEqual({});
  });

  it('Should fetch other markdown files if the var contains "api_"', async () => {
    const markdownStrResp = `±someVar
      ${str1}
      ±someVar
      
      ±someOtherVar
      ${str2}
      ±someOtherVar
      
      ±dataVar
      ${JSON.stringify(obj)}
      ±dataVar
      ${str3}
    `;

    (fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        text: async () => Promise.resolve(markdownStrResp),
      }),
    );

    const markdownStrApi = `±someVar
      ${str1}
      ±someVar
      
      ±api_someOtherVar
      https://some.online.markdown.file.com/test.md
      ±api_someOtherVar
    `;

    const markdowns = await segmark(markdownStrApi);

    expect(markdowns).toEqual({
      someVar: str1.trim(),
      someOtherVar: {
        someVar: str1.trim(),
        someOtherVar: str2.trim(),
        dataVar: obj,
      },
    });
  });

  it('Should fetch first if isUrl param is defined', async () => {
    const mardownStr = `±someVar
      ${str1}
      ±someVar
      
      ±someOtherVar
      ${str2}
      ±someOtherVar
      
      ±dataVar
      ${JSON.stringify(obj)}
      ±dataVar
      ${str3}
    `;
    const markdownUrl = 'https://some.online.markdown.file.com/test.md';

    (fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        text: async () => Promise.resolve(mardownStr),
      }),
    );

    const markdowns = await segmark(markdownUrl, true);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(markdownUrl);
    expect(markdowns).toEqual({
      someVar: str1.trim(),
      someOtherVar: str2.trim(),
      dataVar: obj,
    });
  });

  it("Should return the same data url if there's an error fetching api content", async () => {
    const markdownUrl = 'https://some.online.markdown.file.com/test.md';
    (fetch as jest.Mock).mockRejectedValue(markdownUrl);

    const markdownStrApi = `±someVar
      ${str1}
      ±someVar
      
      ±api_someOtherVar
      ${markdownUrl}
      ±api_someOtherVar
    `;

    const markdowns = await segmark(markdownStrApi);

    expect(markdowns).toEqual({
      someVar: str1.trim(),
      someOtherVar: markdownUrl,
    });
  });
});
