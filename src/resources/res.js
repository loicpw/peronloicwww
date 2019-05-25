/**
 * resources
 *
 * Env:
 * REACT_APP_STAGE: prod | dev
 *
 * @example
 * import res from "resources";
 * const headerImg = res.header.img;
 */
import config from 'config';

// full url for a given resource in static assets
const url = config.API.getStaticURL;

// common values
const common = {
    // resources
    header: {
        img:                url('images/header.jpg'),
    },

    // homepage
    homepage: {
        backgroundLayer1:   url('images/lightray.png'),
        presentationText:   url('text/introduction.txt'),
        zenOfTheDayText:    url('text/zen.txt'),
        resume:             url('data/resume'),
        linkedin:           url('data/linkedin'),
        github:             url('data/github'),
        blog:               url('data/blog'),
        projects:           url('data/projects'),
        contact:            url('data/contact'),
    },
};

// dev specific - override
const dev = {
};

// prod specific - override
const prod = {
};

const res = process.env.REACT_APP_STAGE === 'prod'
    ? prod
    : dev;

export default {
    ...common,
    ...res
};
