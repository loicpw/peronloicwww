/**
 * configuration
 *
 * Env:
 * REACT_APP_STAGE: prod | dev
 *
 * @example
 * import config from "config";
 * const small = config.media.small;
 */

// var
const API_ROOT = "loicpw.com";
const API_STATIC = "static";
const API_SCHEME = "https";
const API = API_SCHEME + "://" + API_ROOT;

// common config values
const common = {
    // media viewport
    media: {
        small: 479,  // px
    },

    // email api (contact)
    email: {
        post_message_url: '//api.emailjs.com/api/v1.0/email/send',
        post_message_scheme: 'https',
        service_id: 'gmail',
        user_id: 'user_NvRb6WTMzkuKTVbA2i3mC',
        template_id: 'template_QsTDa6iv_clone',
        // generate data as expected by template from data:
        template: ({name, email, message}) => ({
            from_name: name,
            reply_to: email,
            message_html: message,
        }),
    },

    // website api
    API: {
        scheme: API_SCHEME,
        path: {
            root: API_ROOT,
            static: API_ROOT + '/' + API_STATIC,
        },
        url: API,
        getStaticURL: (path) => API + '/' + API_STATIC + '/' + path,
    },

    // homepage
    homepage: {
        animation: {
            stiffness:  210,
            damping:    20,
        },
    },

    // title
    pagetitle: {
        title: "Loïc's yard",
    },
    
};

// dev specific - override
const dev = {
};

// prod specific - override
const prod = {
};

const config = process.env.REACT_APP_STAGE === 'prod'
    ? prod
    : dev;

export default {
    ...common,
    ...config
};
