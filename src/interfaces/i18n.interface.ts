export interface EmbedTextInterface {
  title: string;
  description: string;
}

export interface I18nInterface {
  system: {
    unknownError: EmbedTextInterface;
  }
  init: {
    create: EmbedTextInterface;
    update: EmbedTextInterface;
    errors: {
      badChannelType: EmbedTextInterface;
      badLang: EmbedTextInterface;
    }
  },
  new: {
    errors: {
      badRegex: EmbedTextInterface;
      past: EmbedTextInterface;
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
