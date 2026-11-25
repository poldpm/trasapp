/* TRAÇApp — configuració general
   Tot el que és "de l'escola" (cursos, mides, models de partida) viu aquí,
   perquè es pugui ajustar sense tocar la lògica de l'app. */
window.AT = window.AT || {};

AT.config = {
  versio: '0.5',

  /* Versió de la q: 'q' (proposta de la directora) o 'q_cua' (la q amb cua).
     Pendent de decisió de l'escola: de moment, la de la directora. */
  versioQ: 'q',

  /* Full A4 en mil·límetres. Marges iguals que la «Plantilla fitxes» oficial (72 pt = 25,4 mm). */
  full: {
    amplada: 210,
    alcada: 297,
    marges: { dalt: 25.4, baix: 25.4, esquerra: 25.4, dreta: 25.4 },
    peu: 12.7 // distància del número de pàgina a la vora inferior
  },

  /* Cursos. Les mides es donen en mil·límetres:
     - caligrafia: 1 unitat de pauta (distància entre dues línies de la pauta Montessori).
       «gran» = 14,26 mm, la mida de la plantilla de Canva de l'escola (53,9 px en un A4 de 794 px).
       «mitjana», «petita» i «mini» són propostes per validar («mini» és per a textos com l'endevinalla).
     - grafomotricitat: alçada del traç */
  cursos: {
    primer: {
      id: 'primer', curt: '1r', nom: '1r de primària', ordinal: 'Primer',
      mides: {
        caligrafia: { gran: 14.26, mitjana: 11, petita: 8.5, mini: 4.5 },
        grafomotricitat: { gran: 24, mitjana: 18, petita: 13 }
      },
      mostres: { lletra: 'a', segona: 'b', paraula: 'ala' }
    },
    segon: {
      id: 'segon', curt: '2n', nom: '2n de primària', ordinal: 'Segon',
      mides: {
        caligrafia: { gran: 14.26, mitjana: 11, petita: 8.5, mini: 4.5 },
        grafomotricitat: { gran: 18, mitjana: 14, petita: 10 }
      },
      mostres: { lletra: 'a', segona: 'b', paraula: 'ala' }
    }
  },

  /* Mesos del curs (cada mes és un dossier) */
  mesos: [
    ['setembre', 'Setembre'], ['octubre', 'Octubre'], ['novembre', 'Novembre'], ['desembre', 'Desembre'],
    ['gener', 'Gener'], ['febrer', 'Febrer'], ['marc', 'Març'], ['abril', 'Abril'], ['maig', 'Maig'], ['juny', 'Juny']
  ],

  /* Tipus de fitxa que es poden afegir a un dossier, en aquest ordre */
  arees: {
    portada: { id: 'portada', nom: 'Portada del mes', descripcio: 'El mes, la dita, un dibuix i una sanefa. Surt en totes les versions: Lligada, Pal, PI i ⭐.' },
    dita: { id: 'dita', nom: 'Dita', descripcio: 'La dita en caixes de pauta, per resseguir o copiar, en lligada i en pal.' },
    endevinalla: { id: 'endevinalla', nom: 'Endevinalla', descripcio: 'L’endevinalla per resseguir, pautes per copiar-la i un espai per dibuixar la resposta.' },
    caligrafia: { id: 'caligrafia', nom: 'Lletres', descripcio: 'Les lletres de l’escola sobre pauta Montessori: model, puntets, ordre del traç i punts d’inici i final.' },
    grafomotricitat: { id: 'grafomotricitat', nom: 'Grafomotricitat', descripcio: 'Traços de preescriptura: ones, ponts, ziga-zagues, bucles i camins.' },
    extres: { id: 'extres', nom: 'Full lliure', descripcio: 'Un full amb la capçalera i un dibuix gran: una mandala, un dibuix per pintar…' }
  },

  /* Valors per defecte de cada tipus de bloc */
  blocs: {
    /* Fila de pauta: lletra «@0» = 1a lletra de la fitxa, «@1» = 2a… (o una lletra concreta) */
    fila: {
      tipus: 'fila', enunciat: '', lletra: '@0', columnes: ['model', 'puntets'], files: 1, mida: 'gran'
    },
    paraula: {
      tipus: 'paraula', enunciat: '', text: '', columnes: ['model', 'puntets', 'buit'], files: 2, mida: 'petita'
    },
    grafomotricitat: {
      tipus: 'grafomotricitat', enunciat: 'Ressegueix.', forma: 'ones', mida: 'mitjana',
      guies: 'linies', ajuda: 'progressio', puntInici: true, imatgeInici: null, imatgeFinal: null,
      files: 'auto'
    },
    espai: {
      tipus: 'espai', enunciat: 'Dibuixa.', alcada: 60
    },
    caixa: { tipus: 'caixa', text: '', lletra: 'lligada', estil: 'puntets', mida: 'mitjana', amplada: 'plena', pauta: true },
    text: { tipus: 'text', text: '', midaText: 14, negreta: false, alineacio: 'left' },
    imatge: { tipus: 'imatge', src: null, alcada: 'auto' },
    sanefa: { tipus: 'sanefa', modeSanefa: 'forma', forma: 'merlets', imatge: null, model: 2, resta: 'referencies', mida: 'gran' },
    pauta: { tipus: 'pauta', files: 2, mida: 'mitjana' },
    serie: { tipus: 'serie', forma: 'copa', alcadaTraç: 2, enunciat: '', columnes: ['model', 'gris', 'punts'], files: 1, mida: 'gran' }
  }
};

/* Models de partida. Cada funció rep el curs i retorna { titol, blocs }. */
AT.models = {
  /* Fitxes de cal·ligrafia: «lletres» són les lletres que es treballen; la mostra les ensenya
     sota la capçalera i les files hi fan referència (@0, @1…), així tota la fitxa canvia si canvien. */
  portada: [
    {
      id: 'portada', nom: 'Portada del mes',
      text: 'Escriu el mes i la dita, puja el dibuix i tria la sanefa. Surten totes les versions.',
      crea: (c, mes) => ({
        titol: 'Portada ' + mes.toLowerCase(), compost: 'portada',
        dades: { mes, dita: '', estil: 'puntets', imatge: null,
          sanefa: { modeSanefa: 'forma', forma: 'merlets', model: 2, resta: 'referencies' },
          versions: { lligada: true, pal: true, pi: true, estrella: false } }
      })
    }
  ],
  dita: [
    {
      id: 'dita', nom: 'Dita',
      text: 'La dita en lligada i en pal, amb caixes buides per copiar-la i sanefa.',
      crea: (c, mes) => ({
        titol: 'Dita ' + mes.toLowerCase(), compost: 'dita',
        dades: { titol: 'Dita', dita: '', estil: 'puntets', caixesBuides: 2, imatge: null,
          sanefa: { modeSanefa: 'forma', forma: 'ones', model: 2, resta: 'referencies' },
          versions: { lligada: true, pal: true } }
      })
    }
  ],
  endevinalla: [
    {
      id: 'endevinalla', nom: 'Endevinalla',
      text: 'Títol, l’endevinalla per resseguir amb pautes per copiar-la i «Dibuixa què és».',
      crea: (c, mes) => ({
        titol: 'Endevinalla ' + mes.toLowerCase(),
        blocs: [
          { tipus: 'text', text: 'Endevinalla:', midaText: 16 },
          { tipus: 'paraula', text: 'Una mena de patata', columnes: ['puntets'], files: 1, mida: 'mini' },
          { tipus: 'pauta', files: 2, mida: 'mini' },
          { tipus: 'paraula', text: 'de color de pastanaga.', columnes: ['puntets'], files: 1, mida: 'mini' },
          { tipus: 'pauta', files: 2, mida: 'mini' },
          { tipus: 'text', text: 'Dibuixa què és:', midaText: 16 },
          { tipus: 'espai', enunciat: '', alcada: 'auto' }
        ]
      })
    }
  ],
  extres: [
    {
      id: 'full-lliure', nom: 'Full lliure',
      text: 'La capçalera i un dibuix gran a tota la pàgina.',
      crea: (c, mes) => ({ titol: 'Full lliure ' + mes.toLowerCase(), blocs: [{ tipus: 'imatge', src: null, alcada: 'auto' }] })
    }
  ],
  caligrafia: [
    {
      id: 'lletres', nom: 'Lletres',
      text: 'Tria una lletra o més. Mostra amb fletxes a dalt i, per a cada lletra, una fila amb model i puntets i files amb només els punts.',
      crea: c => ({
        lletres: [c.mostres.lletra],
        mostra: { mida: 'mitjana' },
        blocs: [
          { tipus: 'fila', lletra: '@0', columnes: ['model', 'puntets'], files: 1, mida: 'mitjana', enunciat: 'Ressegueix i escriu.' },
          { tipus: 'fila', lletra: '@0', columnes: ['punts'], files: 'auto', mida: 'mitjana' }
        ]
      })
    },
    {
      id: 'lletres-paraules', nom: 'Lletres i paraules',
      text: 'Les lletres de la fitxa i, al final, paraules per escriure-hi.',
      crea: c => ({
        lletres: [c.mostres.lletra, c.mostres.segona],
        mostra: { mida: 'mitjana' },
        blocs: [
          { tipus: 'fila', lletra: '@0', columnes: ['model', 'puntets'], files: 1, mida: 'mitjana', enunciat: 'Ressegueix i escriu.' },
          { tipus: 'fila', lletra: '@1', columnes: ['model', 'puntets'], files: 1, mida: 'mitjana' },
          { tipus: 'paraula', text: c.mostres.paraula, columnes: ['model', 'puntets'], files: 2, enunciat: 'Ressegueix les paraules.' }
        ]
      })
    },
    {
      id: 'paraules', nom: 'Paraules',
      text: 'Només paraules per resseguir i copiar, sense files de lletres. Si vols, a dalt hi pots posar les lletres de model.',
      crea: c => ({
        titol: 'Paraules',
        lletres: [c.mostres.lletra],
        mostra: { visible: false, mida: 'mitjana' },
        sincronitza: false,
        blocs: [
          { tipus: 'paraula', text: c.mostres.paraula, columnes: ['model', 'puntets', 'buit'], files: 2, mida: 'petita', enunciat: 'Ressegueix i escriu les paraules.' },
          { tipus: 'paraula', text: 'mala', columnes: ['model', 'puntets', 'buit'], files: 2, mida: 'petita' },
          { tipus: 'pauta', files: 'auto', mida: 'petita' }
        ]
      })
    },
    {
      id: 'gallerani', nom: 'Model Gallerani',
      text: 'Dues lletres amb dues files cada una: model, un repàs en gris i punts. Sense mostra a dalt.',
      crea: c => ({
        lletres: [c.mostres.lletra, c.mostres.segona],
        mostra: { visible: false },
        blocs: [
          { tipus: 'fila', lletra: '@0', columnes: ['model', 'gris', 'punts'], files: 1 },
          { tipus: 'fila', lletra: '@0', columnes: ['punts'], files: 1 },
          { tipus: 'fila', lletra: '@1', columnes: ['model', 'gris', 'punts'], files: 1 },
          { tipus: 'fila', lletra: '@1', columnes: ['punts'], files: 1 }
        ]
      })
    }
  ],
  /* Grafomotricitat amb el mètode: cada traç amb punt verd, punt vermell i fletxa taronja,
     i tots els extrems sobre una línia de la pauta. */
  grafomotricitat: [
    {
      id: 'copes', nom: 'Traç copa',
      text: 'Copes grans i petites: model, en gris i només els punts per fer-les sols.',
      crea: () => ({
        titol: 'Traç copa',
        blocs: [
          { tipus: 'serie', forma: 'copa', alcadaTraç: 2, columnes: ['model', 'gris', 'punts'], files: 1, mida: 'gran', enunciat: 'Ressegueix i fes les copes.' },
          { tipus: 'serie', forma: 'copa', alcadaTraç: 2, columnes: ['punts'], files: 1, mida: 'gran' },
          { tipus: 'serie', forma: 'copa', alcadaTraç: 1, columnes: ['model', 'gris', 'gris', 'punts'], files: 1, mida: 'mitjana' },
          { tipus: 'serie', forma: 'copa', alcadaTraç: 1, columnes: ['punts'], files: 'auto', mida: 'mitjana' }
        ]
      })
    },
    {
      id: 'serie', nom: 'Sèrie d’un traç',
      text: 'Tria el traç (pont, ona, punxa, bucle, rodona…) i com es veu cada columna.',
      crea: () => ({
        titol: 'Grafomotricitat',
        blocs: [
          { tipus: 'serie', forma: 'pont', alcadaTraç: 2, columnes: ['model', 'gris', 'punts'], files: 1, mida: 'gran', enunciat: 'Ressegueix i continua.' },
          { tipus: 'serie', forma: 'pont', alcadaTraç: 2, columnes: ['punts'], files: 'auto', mida: 'gran' }
        ]
      })
    },
    {
      id: 'dos-tracos', nom: 'Dos traços',
      text: 'Dos traços que es treballen junts, per exemple la punxa i la vall.',
      crea: () => ({
        titol: 'Punxes i valls',
        blocs: [
          { tipus: 'serie', forma: 'punxa', alcadaTraç: 2, columnes: ['model', 'gris', 'punts'], files: 1, mida: 'mitjana', enunciat: 'Ressegueix i continua.' },
          { tipus: 'serie', forma: 'punxa', alcadaTraç: 2, columnes: ['punts'], files: 1, mida: 'mitjana' },
          { tipus: 'serie', forma: 'vall', alcadaTraç: 2, columnes: ['model', 'gris', 'punts'], files: 1, mida: 'mitjana' },
          { tipus: 'serie', forma: 'vall', alcadaTraç: 2, columnes: ['punts'], files: 'auto', mida: 'mitjana' }
        ]
      })
    },
    {
      id: 'sanefes', nom: 'Sanefes',
      text: 'Sanefes per continuar: comencen fetes i tenen punts de referència a cada canvi de direcció.',
      crea: () => ({
        titol: 'Sanefes',
        blocs: [
          { tipus: 'text', text: 'Continua les sanefes.', midaText: 14, negreta: true },
          { tipus: 'sanefa', forma: 'merlets' }, { tipus: 'sanefa', forma: 'zigazaga' }, { tipus: 'sanefa', forma: 'ones' },
          { tipus: 'sanefa', forma: 'ponts' }, { tipus: 'sanefa', forma: 'bucles' }, { tipus: 'sanefa', forma: 'cercles' }
        ]
      })
    },
    {
      id: 'cami', nom: 'Camí amb dibuixos',
      text: 'Un camí d’un dibuix a l’altre. Hi poses les teves imatges.',
      crea: () => ({
        titol: 'Arriba al final del camí',
        blocs: [{ tipus: 'grafomotricitat', forma: 'ones', guies: 'cap', ajuda: 'resseguir', mida: 'gran', enunciat: 'Ressegueix el camí.' }]
      })
    }
  ]
};
