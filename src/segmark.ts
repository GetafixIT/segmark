export type SegmarkResponse = { [x: string]: string | {} } | string;

export type Segmark = (x: string, isUri?: boolean) => Promise<SegmarkResponse>;

import { default as matter } from 'gray-matter';

const getApiData = async (url: string) => {
  try {
    const resp = await fetch(url);
    return await resp.json();
  } catch (err) {
    return `${url}`;
  }
};

const segmark: Segmark = async (markdownStr, isUri = false) => {
  let stringToProcess = markdownStr;
  let greyMatterData = { data: {} };

  if (isUri) {
    stringToProcess = await getApiData(markdownStr);
  } else {
    greyMatterData = matter(markdownStr);
  }
  const regexSection = new RegExp(`(±.*?)[\\s\\S]*?\\1`, 'gi');
  const markdownSections: null | string[] = stringToProcess.match(regexSection) || [];
  const obj: { [x: string]: string | { [x: string]: string } } = {
    ...(!!Object.keys(greyMatterData.data).length ? { vars: greyMatterData.data } : {}),
  };
  let item;
  if (markdownSections.length) {
    for (item of markdownSections) {
      const segmentMatch = item.match(/±(.*?)\n([^;]*)±/);
      let [, varName, segment] = segmentMatch ?? [];
      if (varName && segment) {
        segment = segment.trim();
        const isApi: boolean = varName.indexOf('api_') > -1;

        let slot;
        if (isApi) {
          varName = varName.replace('api_', '');
          const data = await getApiData(segment);
          slot = await segmark(data);
        }

        try {
          if (!isApi) {
            slot = JSON.parse(segment);
          }
          obj[varName] = slot;
        } catch (err) {
          obj[varName] = segment;
        }
      }
    }
  }

  return markdownSections.length !== 0 ? obj : markdownStr.trim();
};

export { segmark };

export default { segmark };
