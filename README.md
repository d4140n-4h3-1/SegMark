# SegMark 
### A Markdown Reader with most features in one file, and others segregated from it. 

The main Markdown reader does one job, and one job only; render Markdown. The rest are optional. 

## Features

1. Task lists, tables and footnotes are available.

2. Raw nesting is supported. 

## Alpha Features

markdown_alpha.html searches for .mdeb (Markdown Ebook) folders. This is a workaround to enable book.md to load images relative to its location, and works almost as if it's a binary format. Images are self-contained. If you upload a folder containing multiple .mdeb files, you should see a scrollable list of them. 

Dragging and dropping files does not load images correctly if the Markdown file is not relative to the HTML file. The structure should look like this. 

```
.
└── test.mdeb
    ├── book.md
    ├── contributions.md
    └── images
```

## Special Features

1. Video and audio are supported exactly the same way as photos. 

2. Similar to tables, headings and media can be aligned. 

3. Emojis are optional. They are in a separate file.

## Notes

It is not fully CommonMark compliant. 

There is no plugin system. As far as I can tell, you should simply load a JS file via a script tag. 

There is stable and an alpha version. The alpha version is always red. 

## How to Use

Just open the stable HTML file in a browser, and place a Markdown file in the drop zone. Keep in mind edge cases are not well supported. 
