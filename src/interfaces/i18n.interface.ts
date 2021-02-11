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
      badLang: EmbedTextInterface;
    }
  },
  new: {
    errors: {
      badRegex: EmbedTextInterface;
      past: EmbedTextInterface;
    },
  },
  delete: {
    success: EmbedTextInterface;
  }
  embed: {
    credits: string;
    event: {
      description: string;
      noPeople: string;
    }
  },
}
