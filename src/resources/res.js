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
import { Resources, oneTimeLoader, httpOneTimeLoader } from './resources';

// full url for a given resource in static assets
const url = config.API.getStaticURL;

// loader for 'link' targets (url) in the home page
// values are extracted from json downloaded from static assets in API
const linkLoader = (request) => {
    const loader = httpOneTimeLoader(request);
    return oneTimeLoader(() => loader().then((value) => {
        const resp = JSON.parse(value);
        return resp.Items[0].link.S;
    }));
};


// common values
const common = {
    // header mapping
    header: new Resources({
        img: url('images/header.jpg'),
    }),

    // homepage mapping
    homepage: new Resources({
        backgroundLayer1: url('images/lightray.png'),
        presentationText: {
            value: 'presentation text loading...',
            loader: httpOneTimeLoader(url('text/introduction.txt')),
        },
        zenOfTheDayText: {
            value: 'text loading...',
            loader: httpOneTimeLoader(url('text/zen.txt')),
        },
        resume: {
            value: url('data/resume'),
            loader: linkLoader(url('data/resume')),
        },
        linkedin: {
            value: url('data/linkedin'),
            loader: linkLoader(url('data/linkedin')),
        },
        github: {
            value: url('data/github'),
            loader: linkLoader(url('data/github')),
        },
        blog: {
            value: url('data/blog'),
            loader: linkLoader(url('data/blog')),
        },
        projects: {
            value: url('data/projects'),
            loader: linkLoader(url('data/projects')),
        },
        contact: {
            value: url('data/contact'),
            loader: linkLoader(url('data/contact')),
        },
    }),
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
