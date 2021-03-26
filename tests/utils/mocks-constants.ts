const constantMocks = {
  user: {
    id: 'UnitTestMockUserID',
    username: 'UnitTestMockUserUsername',
    avatar: 'UnitTestMockUserAvatar',
  },
  client: {
    user: {
      id: 'UnitTestMockClientUserID',
      username: 'UnitTestMockClientUsername',
    },
  },
  message: {
    guild: {
      id: 'UnitTestMockMessageGuildID',
    },
    channel: {
      id: 'UnitTestMockMessageChannelID',
    },
    id: 'UnitTestMockMessageID',
  },
  event: {
    title: 'UnitTestMockEventTitle',
    description:
      'UnitTestMockEventDescription $$time$$ $$day$$ $$participants$$',
    day: 'UnitTestMockEventDay',
    time: 'UnitTestMockEventTime',
  },
  serverConfig: {
    initialization: 'UnitTestServerConfigInitialization',
    id: 'UnitTestServerConfigID',
    guild_id: 'UnitTestServerConfigGuildID',
    channelID: 'UnitTestServerConfigChannelID',
  },
  eventInterface: {
    participants: [],
    id: 'UnitTestMockEventID',
    i18n: 'frFR',
    serverID: 'UnitTestMockEventServerID',
    authorID: 'UnitTestMockEventAuthorID',
    messageID: 'UnitTestMockEventMessageID',
    channelID: 'UnitTestMockEventChannelID',
    date: 'UnitTestMockEventEventDate',
    description: 'UnitTestMockEventDescription',
    image: 'UnitTestMockEventImage',
    title: 'UnitTestMockEventTitle',
  },
  version: '',
  url: 'https://UnitTestURL',
  image: 'https://UnitTestImage',
  lang: 'enEN',
};

export default constantMocks;
