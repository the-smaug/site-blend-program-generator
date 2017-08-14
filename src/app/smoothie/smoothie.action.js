import {
  MIX_CONFERENCES,
  REMOVE_CONFERENCES,
  SWITCH_CONFERENCE,
  OPEN_SWITCHER,
  CLOSE_SWITCHER,
} from '../constants';

import { Conference } from './smoothie.type';

export const mixConferencesAction = (conferences: Array<Conference>) => ({
  type: MIX_CONFERENCES,
  data: {
    dayOne: conferences.dayOne,
    dayTwo: conferences.dayTwo,
  },
});

export const removeConferences = () => ({
  type: REMOVE_CONFERENCES,
});

export const switchConference = (conference: Conference) => ({
  type: SWITCH_CONFERENCE,
  data: { conference },
});

export const closeSwitcherAction = () => ({
  type: CLOSE_SWITCHER,
});

export const openSwitcherAction = (currentConferenceId: number, conferences: Conference) => ({
  type: OPEN_SWITCHER,
  data: { currentConferenceId, conferences },
});
