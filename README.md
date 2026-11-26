# TRAÇApp

**TRAÇ** + **TRAÇA** + **APP**.

App web per preparar les fitxes de cal·ligrafia i grafomotricitat de 1r i 2n de primària (Vedruna Escorial Vic), amb el format de la «Plantilla fitxes» oficial i a punt per imprimir en A4.

## Com s'obre
- Doble clic a `index.html` (cal connexió a internet per carregar les tipografies).
- O publicada a GitHub Pages: tot són fitxers estàtics, sense instal·lar res.

## Com funciona
1. **Inici**: tria el curs (1r o 2n).
2. **Curs**: tria el mes.
3. **Models**: al dossier, tria quin tipus de fitxa hi afegeixes.
4. **Dossier del mes**: cada curs té un dossier per mes (setembre–juny). S'hi afegeixen fitxes (portada del mes en versions Lligada, Pal, PI i ⭐; dita en lligada i pal; endevinalla; lletres; grafomotricitat; full lliure), s'ordenen i s'imprimeix el dossier sencer.
5. **De traç en traç**: a cada curs, un apartat de grafomotricitat fora dels dossiers del mes (al voltant de punts, patrons de colors en quadrícula, sanefes en quadrícula, còpia en quadrícula o en punts, camins que s'estrenyen, sanefes i dibuixos amb patrons). Les estrelles (☆ a ☆☆☆) indiquen la dificultat només com a referència.
6. **Dossier TRAÇApp**: a cada mes, al costat d'«Imprimeix el dossier», un dossier ja fet per l'app. Setembre, octubre i novembre són els dossiers que l'escola va fer servir, refets amb l'app; de desembre a juny és una proposta amb el mateix format (portada amb la dita del mes, lletres o paraules, endevinalla, grafomotricitat, mandala). S'obre en una finestra per revisar-lo fitxa per fitxa, es pot imprimir o passar al dossier propi.
   Els dibuixos dels dossiers reals (dades/imatges-escola.js) no es pugen al GitHub perquè el repositori és públic: es tornen a generar amb eines/retalla-dossiers.py a partir dels PDF de l'escola.
7. **Editor**: capçalera (títol, curs), **lletres de la fitxa** i **mostra** sota la capçalera, i blocs: files de pauta (cada columna pot ser model, model amb fletxes, gris, puntets, només punts o en blanc), paraules o frase, traç i espai per dibuixar. Les files poden fer referència a «1a lletra de la fitxa», «2a lletra»…, i així tota la fitxa canvia quan canvien les lletres. La fitxa es veu a mida real a la dreta, es desa sola i s'imprimeix o es desa en PDF amb el botó granat.

Les fitxes es desen al navegador de cada ordinador. A **Configuració** es fan còpies de seguretat (.json) per passar fitxes d'un ordinador a un altre. El logotip de l'escola ja va inclòs a la capçalera de totes les fitxes (`js/logo-escola.js`). Només hi ha una q: acaba a baix del pal, amb el pal horitzontal, i no s'uneix amb la u (especificació del 26-11-2026).

## Estructura
| Fitxer | Què hi ha |
|---|---|
| `js/config.js` | Cursos, mides (mm) per curs, valors per defecte dels blocs i models de partida. **És el fitxer que cal tocar per ajustar l'app a l'escola.** |
| `js/motor.js` | Pautes, lletres, formes de grafomotricitat i paginació en A4. |
| `js/editor.js` | Editor de fitxes i impressió. |
| `js/vistes.js` | Pantalles d'inici, curs, models, fitxes desades i configuració. |
| `js/store.js` | Desament al navegador, exportació i importació. |
| `css/app.css` | Estils de l'app i del full imprès. |
| `construeix-artifact.js` | Genera una sola pàgina per a la previsualització a claude.ai. |

## Pendent (properes passes)
- Les lletres surten de `dades/lletres.json` (validades per la direcció de l’escola). Si es canvia el JSON, cal executar `node eines/genera-lletres.js`.
- Unions entre lletres a les paraules: pendent de decisió de l'escola (ara no es dibuixen).
- Botó «Obre a Canva»: pendent del pla de Canva de l'escola.
- Tipografia Escolar per als enunciats: pendent del fitxer de la font.
