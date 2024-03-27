# Segmark

## Introduction
If you want to build component based architectures, sometimes you need copy for different components but don't want to
call lots of different markdown files. Segmark allows to use one markdown file subdivide markdown into fragments.

The idea is to fetch your markdown with an API request and push the response string through Segmark, or have Segmark
fetch it for you if you prefer. It will return an object containing as many segments as you've specified in your
markdown file. It does this with some regex magic.

It can also fetch markdown recursively when referenced as a GET request to an open endpoint.

It should be compatible with any markdown library as it breaks a single markdown into pieces, which are then passed to
your favorite markdown module.

## Install

```
  npm i segmark
```


## Usage

Add segmark to your code and call it...

```
  import {segmark} from 'segmark';
  
  (async () => {
    const segmarkMarkdown = `±myVar\n# My title\nSome para\n±myVar\n\n±myOtherVar\n# My Other title\nSome other para\n±myOtherVar`
    const obj = await segmark(segmarkMarkdown)
    console.log("myVar", obj.myVar)
    console.log("myOtherVar", obj.myOtherVar)
  })
```

### Creating segments in your markdown

The section markers are conventional and must be opened and closed. The markers start with the character ± followed by
an arbitrary string variable name followed by a new line, as shown below.

```
±myVar
# My Title
This is a segment
±myVar
```

You can add markdown, JSON or API references for recursive fetching.

### Example markdown file structure
```markdown
±intro
# Segmark example

This is a section within a markdown file. It allows:

- Separation of markdown chunks to be passed to different components
- Easy maintenance of your content
±intro

±leftMenu
- [intro](./intro)
- [docs](./docs)
±leftMenu
  
±marketingBanner
[
  {
    "welcome": {
      "imgSrc": "https://someimg.com/mypic.jpg",
      "description": "Welcome to Segmark"
    }
  }
]
±marketingBanner


±api_additionalExternalMarkdown
https://www.some-markdown-file.com/about.md
±api_additionalExternalMarkdown
```

This chunk of markdown will return the following JavaScript object:

```javascript

{
  "intro": "# Segmark example\n\nThis is a section within a markdown file. It allows:\n\n- Separation of markdown chunks to be passed to different components\n- Easy maintenance of your content",
  "leftMenu": "- [intro](./intro)\n- [docs](./docs)",
  "marketingBanner": [
    {
      "welcome": {
        "description": "Welcome to Segmark",
        "imgSrc": "https://someimg.com/mypic.jpg"
      }
    }
  ],
  "additionalExternalMarkdown": [SEGMENT RECURSION ON URI DATA]
}

```

Segmark can also extract variables from the markdown when added as [greymatter](https://github.com/jonschlinkert/gray-matter).

