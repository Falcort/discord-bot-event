export interface embedText {
  title: string;
  description: string;
}

interface I18nInterface {
  system: {
    unknownError: embedText;
  }
  init: {
    create: embedText;
    update: embedText;
    errors: {
      badChannelType: embedText;
      badLang: embedText;
    }
  },
  new: {
    errors: {
      badRegex: embedText;
      past: embedText;
    },
  },
  embed: {
    credits: string;
    event: {
      description: string;
      noPeople: string;
    }
  },
}

export default I18nInterface;
