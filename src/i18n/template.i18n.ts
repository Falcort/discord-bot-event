export interface embedText {
  title: string;
  description: string;
}

interface TemplateI18n {
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

export default TemplateI18n;
