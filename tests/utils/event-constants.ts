import { constantMocks } from './mocks-constants';
import EventInterface from '../../src/interfaces/event.interface';

export const event: Readonly<EventInterface> = {
  participants: { users: constantMocks.eventInterface.participants },
  id: constantMocks.eventInterface.id,
  guild_id: constantMocks.message.guild.id,
  author_id: constantMocks.eventInterface.authorID,
  message_id: constantMocks.eventInterface.messageID,
  channel_id: constantMocks.eventInterface.channelID,
  event_date: constantMocks.eventInterface.date,
  description: constantMocks.eventInterface.description,
  image: constantMocks.eventInterface.image,
  title: constantMocks.eventInterface.title,
};

export const eventSameIdWithEvent: Readonly<EventInterface> = {
  participants: { users: [constantMocks.client.user.id] },
  id: constantMocks.eventInterface.id,
  guild_id: constantMocks.message.guild.id,
  author_id: constantMocks.eventInterface.authorID,
  message_id: constantMocks.eventInterface.channelID,
  channel_id: constantMocks.eventInterface.channelID,
  event_date: constantMocks.eventInterface.date,
  description: constantMocks.eventInterface.description,
  image: constantMocks.eventInterface.image,
  title: constantMocks.eventInterface.title,
};

export const eventSameNumberParticpants: Readonly<EventInterface> = {
  participants: { users: [constantMocks.client.user.id] },
  id: constantMocks.eventInterface.id,
  guild_id: constantMocks.message.guild.id,
  author_id: constantMocks.eventInterface.authorID,
  message_id: constantMocks.eventInterface.channelID,
  channel_id: constantMocks.eventInterface.channelID,
  event_date: constantMocks.eventInterface.date,
  description: constantMocks.eventInterface.description,
  image: constantMocks.eventInterface.image,
  title: constantMocks.eventInterface.title,
};
