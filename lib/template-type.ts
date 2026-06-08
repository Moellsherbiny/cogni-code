export type TemplateType =
  | "javascript"
  | "html"
  | "html-css"
  | "html-css-js";

export const DEFAULT_FILES = {
  javascript: {
    js: `console.log("Hello World");`,
  },

  html: {
    html: `<h1>Hello World</h1>`,
  },

  "html-css": {
    html: `<h1>Hello World</h1>`,
    css: `
h1{
  color:red;
}
`,
  },

  "html-css-js": {
    html: `
<button id="btn">
 Click Me
</button>
`,
    css: `
button{
  padding:10px;
}
`,
    js: `
document
.getElementById("btn")
.addEventListener("click",()=>{
  alert("Hello");
});
`,
  },
};