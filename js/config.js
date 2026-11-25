/* TRAÇApp — configuració general
   Tot el que és "de l'escola" (cursos, mides, models de partida) viu aquí,
   perquè es pugui ajustar sense tocar la lògica de l'app. */
window.AT = window.AT || {};

AT.config = {
  versio: '0.3',

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
       «mitjana» i «petita» són propostes per validar.
     - grafomotricitat: alçada del traç */
  cursos: {
    primer: {
      id: 'primer', curt: '1r', nom: '1r de primària', ordinal: 'Primer',
      mides: {
        caligrafia: { gran: 14.26, mitjana: 11, petita: 8.5 },
        grafomotricitat: { gran: 24, mitjana: 18, petita: 13 }
      },
      mostres: { lletra: 'a', segona: 'b', paraula: 'ala' }
    },
    segon: {
      id: 'segon', curt: '2n', nom: '2n de primària', ordinal: 'Segon',
      mides: {
        caligrafia: { gran: 14.26, mitjana: 11, petita: 8.5 },
        grafomotricitat: { gran: 18, mitjana: 14, petita: 10 }
      },
      mostres: { lletra: 'a', segona: 'b', paraula: 'ala' }
    }
  },

  arees: {
    caligrafia: {
      id: 'caligrafia', nom: 'Cal·ligrafia',
      descripcio: 'Les lletres de l’escola sobre pauta Montessori: model, per resseguir, ordre del traç i punts d’inici i final.'
    },
    grafomotricitat: {
      id: 'grafomotricitat', nom: 'Grafomotricitat',
      descripcio: 'Traços de preescriptura: ones, ponts, ziga-zagues, bucles i camins, amb punt d’inici.'
    }
  },

  /* Valors per defecte de cada tipus de bloc */
  blocs: {
    /* Fila de pauta: lletra «@0» = 1a lletra de la fitxa, «@1» = 2a… (o una lletra concreta) */
    fila: {
      tipus: 'fila', enunciat: '', lletra: '@0', columnes: ['model', 'puntets'], files: 1, mida: 'gran'
    },
    paraula: {
      tipus: 'paraula', enunciat: '', text: '', columnes: ['model', 'puntets'], files: 1, mida: 'petita'
    },
    grafomotricitat: {
      tipus: 'grafomotricitat', enunciat: 'Ressegueix.', forma: 'ones', mida: 'mitjana',
      guies: 'linies', ajuda: 'progressio', puntInici: true, imatgeInici: null, imatgeFinal: null,
      files: 'auto'
    },
    espai: {
      tipus: 'espai', enunciat: 'Dibuixa.', alcada: 60
    }
  }
};

/* Models de partida. Cada funció rep el curs i retorna { titol, blocs }. */
AT.models = {
  /* Fitxes de cal·ligrafia: «lletres» són les lletres que es treballen; la mostra les ensenya
     sota la capçalera i les files hi fan referència (@0, @1…), així tota la fitxa canvia si canvien. */
  caligrafia: [
    {
      id: 'lletra', nom: 'Una lletra',
      text: 'Mostra amb fletxes, files amb model i puntets, files amb gris i files amb només els punts.',
      crea: c => ({
        lletres: [c.mostres.lletra],
        blocs: [
          { tipus: 'fila', lletra: '@0', columnes: ['model', 'puntets'], files: 1, enunciat: 'Ressegueix i escriu.' },
          { tipus: 'fila', lletra: '@0', columnes: ['model', 'gris', 'punts'], files: 1 },
          { tipus: 'fila', lletra: '@0', columnes: ['punts'], files: 'auto' }
        ]
      })
    },
    {
      id: 'dues-lletres', nom: 'Dues lletres',
      text: 'Mostra de les dues lletres i, a sota, les files de cada una.',
      crea: c => ({
        lletres: [c.mostres.lletra, c.mostres.segona],
        mostra: { mida: 'mitjana' },
        blocs: [
          { tipus: 'fila', lletra: '@0', columnes: ['model', 'puntets'], files: 1, mida: 'mitjana', enunciat: 'Ressegueix i escriu.' },
          { tipus: 'fila', lletra: '@0', columnes: ['model', 'punts'], files: 1, mida: 'mitjana' },
          { tipus: 'fila', lletra: '@1', columnes: ['model', 'puntets'], files: 1, mida: 'mitjana' },
          { tipus: 'fila', lletra: '@1', columnes: ['model', 'punts'], files: 'auto', mida: 'mitjana' }
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
      id: 'format-canva', nom: 'Format de la fitxa de Canva',
      text: 'Sense mostra: dues lletres amb dues files cada una. Model, un repàs en gris i punts.',
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
  grafomotricitat: [
    {
      id: 'ones-ponts', nom: 'Ones i ponts',
      text: 'Dos traços corbats que preparen la «u», la «n» i la «m».',
      crea: () => ({
        titol: 'Ones i ponts',
        blocs: [
          { tipus: 'grafomotricitat', forma: 'ones', files: 3 },
          { tipus: 'grafomotricitat', forma: 'ponts' }
        ]
      })
    },
    {
      id: 'zigazaga', nom: 'Ziga-zaga',
      text: 'Traç recte amb canvis de direcció, per a la «v» i la «w».',
      crea: () => ({ titol: 'Ziga-zaga', blocs: [{ tipus: 'grafomotricitat', forma: 'zigazaga' }] })
    },
    {
      id: 'bucles', nom: 'Bucles',
      text: 'Bucles enllaçats que preparen la «l», la «e» i la lletra lligada.',
      crea: () => ({ titol: 'Bucles', blocs: [{ tipus: 'grafomotricitat', forma: 'bucles', mida: 'gran' }] })
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
