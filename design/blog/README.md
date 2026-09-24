# Blog diagrams

Mermaid sources for diagrams used in blog posts. The site does not ship a
Mermaid runtime: each diagram is rendered once to SVG under
`public/assets/blog/` and embedded as an image, so a post costs no JavaScript.

Re-render after editing a source (uses the local Chrome):

```sh
echo '{"executablePath":"/usr/bin/google-chrome"}' > /tmp/pp.json
npx -y @mermaid-js/mermaid-cli@11 -i design/blog/<name>.mmd \
  -o public/assets/blog/<name>.svg -c design/blog/mermaid.config.json \
  -p /tmp/pp.json -b '#F7F5EE'
```
