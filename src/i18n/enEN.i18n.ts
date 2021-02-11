import { I18nInterface } from '@/interfaces/i18n.interface';

/**
 * English translation file
 */
const enEN: I18nInterface = {
  system: {
    unknownError: {
      title: 'Unknown error',
      description: 'Unknown error, please contact an administrator',
    },
    help: {
      title: 'List of available commands',
      description: '**Commands**\n Create an event  :\n```$$tag$$ new DD/MM/YYYY HH:MM "EVENT_NAME" "EVENT_DESCRIPTION" OPTINAL_IMAGE_URL```\nGet the credits : ```$$tag$$ credits```\n**Interactions**\n To participate ot leave an event just use the reaction $$valid$$\n\n**Event creator or Administrator ?**\n To delete an event click on the reaction $$invalid$$',
    },
    credits: {
      title: 'Credits',
      description: '**Version** : $$version$$\n**Author(s)** :\n> SOUQUET Thibault (Falcort)\n> ROSAR Quentin (Dermi)\n> MARTINEZ Jennifer (Weissy)',
    },
  },
  init: {
    create: {
      title: 'Initialization successful !',
      description: 'Thanks for initializing DBE !\n DBE will only analyse message on tis channel',
    },
    update: {
      title: 'DBE configuration updated',
      description: 'DBE configuration has been updated',
    },
    errors: {
      badLang: {
        title: 'Bad language',
        description: 'The given language isn\'nt currently supported, please use of the following:\n - frFR\n- enEN',
      },
    },
  },
  new: {
    errors: {
      badRegex: {
        title: 'Error in the command !',
        description: 'Error, the command is invalid.\n\nIs seems that the command is missing some elements.\nUse `@DBE help for the list a commands.',
      },
      past: {
        title: 'Invalid date',
        description: 'The event must be set in the future',
      },
    },
  },
  delete: {
    success: {
      title: 'Event successfully deleted !',
      description: 'The event was successfully deleted',
    },
  },
  embed: {
    credits: ' | Developed by Falcort for the Svalinn Tactical Security Group',
    event: {
      description: '$$description$$ \n\n **Day**: $$day$$ \n **Time**: $$time$$ \n\n **Participants**:$$participants$$',
      noPeople: '\n- No participant',
    },
  },
};

export default enEN;
