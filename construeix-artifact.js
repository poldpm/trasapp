/* Genera una sola pàgina HTML (CSS i JS a dins) per publicar-la com a Artifact.
   Ús: node construeix-artifact.js <sortida.html> */
const fs = require('fs'), path = require('path');
const dir = __dirname;
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const head = html.match(/<head>([\s\S]*?)<\/head>/)[1];
const body = html.match(/<body>([\s\S]*?)<\/body>/)[1];
const keep = head.split('\n').filter(l => /<title>|claude:viewport|name="description"|theme-color|fonts\.g/.test(l)).join('\n');
const css = fs.readFileSync(path.join(dir, 'css/app.css'), 'utf8');
const cos = body
  .replace(/<script src="([^"]+)"><\/script>/g, (_, src) => '<script>\n' + fs.readFileSync(path.join(dir, src), 'utf8') + '\n</script>');
const out = `${keep}\n<style>\n${css}\n</style>\n<script>document.documentElement.lang='ca';</script>\n${cos}`;
fs.writeFileSync(process.argv[2], out);
console.log('ok', out.length);
