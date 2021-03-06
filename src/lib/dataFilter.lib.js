// @flow

import _ from 'lodash';
import type { Conference, Conferences, Filters, Domains, Tags } from '../types';
import { convertToMinutes, convertHourToString } from './time.lib';

/**
 * Return conferences filtered by domain
 */
export const filterByDomain = (conferences: Conferences, domain: string) =>
  _.filter(conferences, conference => conference.domain === domain);

/**
 * Return conferences filtered by level
 */
export const filterByLevel = (conferences: Conferences, level: string) =>
  _.filter(conferences, conference => conference.level === level);

export const filterByTags = (conferences: Conferences, tags) =>
  _.filter(conferences, (conference) => {
    let includeTag = false;
    _.forEach(conference.tags, (tag) => {
      if (_.includes(tags, tag)) {
        includeTag = true;
      }
    });
    return includeTag;
  });


/**
 * Filter conferences by level and by domain
 */
export const filterByLevelAndDomain = (conferences: Conferences, filters: Filters) => {
  const confs = _.filter(conferences, (conference) => {
    let keepConference = false;
    _.map(filters, (filter) => {
      if (
        conference.domain === filter.domain &&
        (filter.level === conference.level || conference.level === '')
      ) {
        keepConference = true;
      }
    });

    return keepConference;
  });

  return confs;
};

export const filterConferences = (conferences: Conferences, domains: Domains, tags: Tags) => {
  const domainConferences = filterByLevelAndDomain(conferences, domains);
  const tagsConferences = filterByTags(conferences, tags);

  return _.union(domainConferences, tagsConferences);
};

/**
 * Return conferences reordered by days and by time
 * @param {Array} data
 */
export const orderConferences = (conferences: Conferences) => {
  const result = {
    dayOne: { eight: [], ten: [], fourteen: [], sixteen: [] },
    dayTwo: { eight: [], ten: [], fourteen: [], sixteen: [] },
  };

  _.forEach(conferences, (conference) => {
    const switcher = _.split(conference.timeBegin, 'h')[0];
    if (switcher < 10) {
      result[conference.day].eight.push(conference);
    } else if (switcher < 12) {
      result[conference.day].ten.push(conference);
    } else if (switcher < 16) {
      result[conference.day].fourteen.push(conference);
    } else {
      result[conference.day].sixteen.push(conference);
    }
  });
  return result;
};

export const reorderConferences = (conference: Conference, conferences: Conferences) => {
  const remaingingConferences = _.pull(conferences, conference);
  return _.concat(conference, remaingingConferences);
};

/**
 * Return all tags
 */
export const getTags = (conferences: Conferences) =>
  _.uniq(_.flatten(_.map(conferences, item => item.tags)));

/**
 *
 * @param {*} currentConferences
 * @param {*} newConference
 */
const isConferenceSlotFree = (currentConferences: Conferences, newConference: Conference) => {
  const timeSlotCurrentConferences = [];
  let isSlotFree = true;

  _.forEach(currentConferences, (currentConference) => {
    timeSlotCurrentConferences.push(convertToMinutes(currentConference));
  });

  const { minuteBegin, minuteEnd } = convertToMinutes(newConference);

  _.forEach(timeSlotCurrentConferences, (item) => {
    if ((minuteBegin >= item.minuteBegin && minuteBegin <= item.minuteEnd) ||
      (minuteBegin <= item.minuteBegin && minuteEnd >
        item.minuteBegin)) {
      isSlotFree = false;
    }
  });
  return isSlotFree;
};

/**
 * Pour obtenir l'effet aléatoire on passera un
 * tabeau de conférences shuffle au préalable
 */
export const orderConferencesV2 = (conferences: Conferences) => {
  const smoothie = {
    dayOne: {
      eight: {
        selected: [],
        remaining: [],
      },
      ten: {
        selected: [],
        remaining: [],
      },
      fourteen: {
        selected: [],
        remaining: [],
      },
      sixteen: {
        selected: [],
        remaining: [],
      },
    },
    dayTwo: {
      eight: {
        selected: [],
        remaining: [],
      },
      ten: {
        selected: [],
        remaining: [],
      },
      fourteen: {
        selected: [],
        remaining: [],
      },
      sixteen: {
        selected: [],
        remaining: [],
      },
    },
  };

  _.forEach(conferences, (item) => {
    const [timeBegin] = _.split(item.timeBegin, 'h');
    const day = smoothie[item.day][convertHourToString(timeBegin)];
    if (day !== undefined) {
      if (isConferenceSlotFree(day.selected, item)) {
        day.selected.push(item);
      } else {
        day.remaining.push(item);
      }
    }
  });

  return smoothie;
};

/**
 *
 * @param {*} currentConferences
 * @param {*} newConference
 */
export const getConferencesConflict = (currentConferences, newConference) => {
  const timeSlotCurrentConferences = [];
  const conferencesConflict = [];

  _.forEach(currentConferences, (currentConference) => {
    timeSlotCurrentConferences.push(convertToMinutes(currentConference));
  });

  const { minuteBegin, minuteEnd } = convertToMinutes(newConference);

  _.each(timeSlotCurrentConferences, (item, key) => {
    if ((minuteBegin >= item.minuteBegin && minuteBegin <= item.minuteEnd) ||
      (minuteBegin <= item.minuteBegin && minuteEnd >
        item.minuteBegin)) {
      conferencesConflict.push(currentConferences[key]);
    }
  });
  return conferencesConflict;
};

export const reorderConferencesV2 = (conference: Conference, conferences: Conferences) => {
  const { remaining, selected } = conferences;

  if (isConferenceSlotFree(selected, conference)) {
    return {
      remaining: _.reject(remaining, conferenceRemaining =>
        _.isEqual(conferenceRemaining, conference),
      ),
      selected: [...selected, conference],
    };
  }

  const conferencesConflit = getConferencesConflict(selected, conference);
  const selectTab = _.reject(selected, conferenceSelected =>
    _.includes(conferencesConflit, conferenceSelected),
  );
  const remained = _.reject(remaining, conferenceRemaining =>
    _.isEqual(conferenceRemaining, conference),
  );

  return {
    remaining: [...remained, ...conferencesConflit],
    selected: [...selectTab, conference],
  };
};
