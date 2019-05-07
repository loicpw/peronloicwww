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
const _s = config.API.getStaticURL;

// common values
const common = {
    // resources
    header: {
        img:                _s('images/header.jpg'),
    },

    // homepage
    homepage: {
        backgroundLayer1:   _s('images/lightray.png'),
        presentationText:   _s('text/introduction.txt'),
        zenOfTheDayText:    _s('text/zen.txt'),
        resume:             _s('data/resume'),
        linkedin:           _s('data/linkedin'),
        github:             _s('data/github'),
        blog:               _s('data/blog'),
        projects:           _s('data/projects'),
        contact:            _s('data/contact'),
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
