# Segmark

## CommonMark Compliance Efforts

Segmark should support most CommonMark compliant files, but some key features are missing. 

1. Parenthesis should be included for ordered lists

2. Italic intrawords should not be able to render. 

## Special Features

1. Audio and video are processed the same way was images. 

2. Colons can align media and headings. Align-left is the same as no colon. 
 Example: 
```
    # :This is a Centered Heading: 

    :![centered video](video/video.av1):
```

3. Undordered lists are adaptive. 

4. Tabs can indent paragraphs the same way as you would see in a novel. 

### Planned Features

1. Roman Numeral support for ordered lists. 

2. Side scrolling video player placement. 
 - For it to work in Markdown, at least two pieces of visual media should not have white space between them. 
 - Referencing from the previous bullet, alignment colons should either be on the left side of the first link to the video and/or the right of the last link to the video. 
 - For CSS, scrolling controls should be either gray, or white with a gray outline in a similar fasion as blockquotes and horizontal lines. 

## Folder Format and Structure

Markdown files and their content can be self-contained in .mdeb folders, or Markdown Ebooks. 

For now, the file handler looks for book.md and metadata.md. 

book.md is where the main content is, and metadata.md does exactly as the name implies. 

The reader does not care how internal folders are named, as long as the file tells the parser load content. 

As a bonus, you can load multiple .mdeb folders at once in their parent folder. A scrollable list should pop up. 

### Planned Features

1. Enhance MDEB to detect page_number.md in separate chapters. 

2. Load table of contents from a sidebar in a similar fashion as Gitub. 

## Parser-Agnostic Features

emoji.js is stand-alone from markdown_emoji.js. It is intended for platforms to automatically translate ASCII emoticons to graphical ones. 

media_control.js just prevents more than one media player from playing simultaneously. 
