import { I18nInterface } from '@/interfaces/i18n.interface';

/**
 * French translation file
 */
const frFR: I18nInterface = {
  system: {
    unknownError: {
      title: 'Erreur inconnue',
      description: 'Une erreur s\'est produite. Réessaie !',
    },
    help: {
      title: 'Liste des actions disponibles',
      description: '**Commandes**\nCréer un event :\n```$$tag$$ new DD/MM/YYYY HH:MM "NOM_EVENT" "DESCRIPTION_EVENT" URL_IMAGE_OPTIONELLE```\nAvoir les credits : ```$$tag$$ credits```\n**Interactions**\nPour participer ou quitter un evenement, utiliser la reaction $$valid$$\n\n**Créateur d\'events ou administrateur ?**\n Pour supprimer un event cliquer sur la reaction $$invalid$$',
    },
    credits: {
      title: 'Credits',
      description: '**Version** : $$version$$\n**Autheur(s)** :\n> SOUQUET Thibault (Falcort)\n> ROSAR Quentin (Dermi)\n> MARTINEZ Jennifer (Weissy)',
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
        title: 'Langue non supporte',
        description: 'Le language n\'est pas encore supporter, veuillez utiliser un des suivant :\n - frFR\n - enEN',
      },
      admin: {
        title: 'Vous n\'avez pas la permission requise',
        description: 'Seuls les administrateurs du serveur peuvent lancer cette commande',
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
        title: 'Date incorrecte',
        description: 'L\'event doit se dérouler dans le futur !',
      },
    },
  },
  delete: {
    success: {
      title: 'Suppression réussie !',
      description: 'L\'event a bien été supprimé.',
    },
  },
  embed: {
    credits: ' | Développé par Falcort pour la Svalinn Tactical Security Group',
    event: {
      description: '$$description$$ \n\n **Jour**: $$day$$ \n **Heure**: $$time$$ \n\n **Participants**:$$participants$$',
      noPeople: '\n- Aucun participant',
    },
  },
};

export default frFR;
