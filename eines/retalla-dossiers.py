# TRAÇApp — retalla els dibuixos dels dossiers reals de l'escola (setembre a novembre)
# Ús: renderitza els PDF a 150 ppp (pdftoppm -r 150 -png) a <carpeta>/r150 amb els noms d1_1_-1.png… i executa:
#   python3 eines/retalla-dossiers.py <carpeta>
# Escriu <carpeta>/imatges.json; després es converteix a dades/imatges-escola.js (que no es puja al GitHub públic).
import sys, json, io, base64
from PIL import Image, ImageOps, ImageChops
W=sys.argv[1]
PX=150/25.4
L=[ # clau, fitxer, y0, y1, x0, x1, color
 ('1r-set-portada','d1_1_-1',140,258,15,195,0),
 ('1r-set-tracos-2','d1_3_-2',8,292,10,200,0),
 ('1r-set-mandala-flor','d1_3_-4',150,292,10,200,0),
 ('1r-set-tracos-5','d1_3_-5',58,292,10,200,0),
 ('1r-set-mandala-cors','d1_3_-6',8,292,10,200,0),
 ('1r-set-tracos-7','d1_3_-7',8,292,10,200,1),
 ('1r-set-copa-2','d1_5_-2',38,292,10,200,1),
 ('1r-oct-portada','d2_1_-1',128,260,15,195,0),
 ('1r-oct-taula','d2_1_-2',56,292,10,200,0),
 ('1r-oct-curvat-1','d2_2_-1',56,292,10,200,1),
 ('1r-oct-curvat-2','d2_2_-2',38,292,10,200,1),
 ('1r-oct-extra-1','d2_3_-1',56,292,10,200,0),
 ('1r-oct-extra-2','d2_3_-2',38,292,10,200,1),
 ('1r-nov-portada','d3_1_-1',100,240,0,210,0),
 ('1r-nov-extra-2','d3_6_-1',56,292,10,200,0),
 ('1r-nov-extra-1','d3_7_-1',56,292,10,200,1),
 ('2n-set-garlanda','d4_1_-1',80,160,15,195,0),
 ('2n-set-arbres','d4_1_-1',180,257,15,195,0),
 ('2n-oct-extra','d5_1_-1',36,292,10,200,0),
 ('2n-oct-bolet','d5_2_-1',50,140,15,195,0),
 ('2n-oct-magrana','d5_2_-1',168,255,15,195,0),
 ('2n-nov-mandala','d6_2_-1',36,292,10,200,0),
 ('2n-nov-pages','d6_3_-1',95,245,15,195,0),
 ('2n-nov-extra','d6_4_-1',36,292,10,200,0),
]
out={}
for k,f,y0,y1,x0,x1,col in L:
  im=Image.open(f'{W}/r150/{f}.png').convert('RGB')
  im=im.crop((int(x0*PX),int(y0*PX),int(x1*PX),int(y1*PX)))
  g=im.convert('L'); bw=g.point(lambda v:255 if v>235 else 0)
  bb=ImageOps.invert(bw).getbbox()
  if bb: im=im.crop((max(0,bb[0]-6),max(0,bb[1]-6),min(im.width,bb[2]+6),min(im.height,bb[3]+6)))
  im.save(f'{W}/crops/{k}.png')
  b=io.BytesIO()
  if col: im.save(b,'JPEG',quality=82,optimize=True); mime='image/jpeg'
  else:
    g=im.convert('L').point(lambda v: 255 if v>245 else v).quantize(16); g.save(b,'PNG',optimize=True); mime='image/png'
  out[k]={'src':f'data:{mime};base64,'+base64.b64encode(b.getvalue()).decode(),'w':round(im.width/PX,1),'h':round(im.height/PX,1)}
  print(k, im.size, len(b.getvalue())//1024,'KB')
json.dump(out,open(f'{W}/imatges.json','w'))
