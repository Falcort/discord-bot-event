import I18nInterface from '@/interfaces/i18n.interface';

const frFR: I18nInterface = {
  system: {
    unknownError: {
      title: 'Erreur inconnue.',
      description: 'Une erreur s\'est produite. Réessaie !',
    },
  },
  init: {
    create: {
      title: 'Initialization reussi !',
      description: 'Merci d\'avoir initialiser DBE !\n DBE n\'analysera que les messages de ce channel',
    },
    update: {
      title: 'Configuration mises a jour !',
      description: 'La configuration du bot a ete mise a jour',
    },
    errors: {
      badLang: {
        title: 'Langue non supportew',
        description: 'Le language n\'est pas encore supporter, veuillez utiliser un des suivant :\n - frFR\n - enEN',
      },
      badChannelType: {
        title: 'Movais type de channel',
        description: 'Veuillez utiliser cette commande dans un channel text de serveur discord',
      },
    },
  },
  new: {
    errors: {
      badRegex: {
        title: 'Erreur dans la commande !',
        description: 'Erreur, la commande est incorrecte.\n\nIl semblerait qu\'il manque un élement à ta commande.\nUtilise `@DBE help pour la liste des commandes.',
      },
      past: {
        title: 'Date incorrecte.',
        description: 'L\'event doit se dérouler dans le futur !',
      },
    },
  },
  embed: {
    credits: ' | Développé par Falcort pour le Svalinn Tactical Security Group',
    event: {
      description: '$$description$$ \n\n **Jour**: $$day$$ \n **Heure**: $$time$$ \n\n **Participants**:$$participants$$',
      noPeople: '\n- Aucun participant',
    },
  },
};

export default frFR;
